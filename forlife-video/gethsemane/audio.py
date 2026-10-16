"""Bande son : voix source nettoyée + voix off (edge-tts) + nappe et SFX synthétisés, -14 LUFS.

python3 audio.py <video_source.mp4>  -> out/mix.wav
"""
import subprocess, sys, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
END = 95.5
VO = 5.2                  # départ de la vidéo source dans le film
VEND = VO + 79.23
N = int(END * SR)
rng = np.random.default_rng(7)


def load(path, filt=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if filt:
        cmd += ["-af", filt]
    cmd += ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)


def place(buf, x, t, g=1.0):
    i = int(t * SR)
    x = x[: max(0, len(buf) - i)]
    buf[i: i + len(x)] += x * g


def db(x):
    return 10 ** (x / 20)


# ---------- voix ----------
speech = load(sys.argv[1], "highpass=f=90,afftdn=nf=-28,equalizer=f=250:t=q:w=1:g=-2,"
                           "equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=4")
vo_in = load(f"{HERE}/audio/vo_intro.mp3", "highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:makeup=2,aecho=0.8:0.5:60:0.12")
vo_out = load(f"{HERE}/audio/vo_outro.mp3", "highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:makeup=2,aecho=0.8:0.5:60:0.12")

voice = np.zeros(N)
place(voice, speech, VO)
place(voice, vo_in, 0.30, db(1))
place(voice, vo_out, VEND + 0.30, db(1))
# fondu de la voix source sur la fermeture du cadre
t = np.arange(N) / SR
voice *= np.clip((VEND + 0.05 - t) / 0.35, 0, 1) * (t < VEND + 0.2) + (t >= VEND + 0.2)

# ---------- nappe (60 BPM, accords Ré majeur, 4 s par accord) ----------
def note(f, dur, a=1.2, r=1.6):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    env = np.minimum(1, tt / a) * np.minimum(1, (dur - tt) / r).clip(0)
    sig = sum(np.sin(2 * np.pi * f * d * tt + p) for d, p in ((1, 0), (1.003, 1.3), (0.997, 2.1))) / 3
    sig += 0.18 * np.sin(2 * np.pi * 2 * f * tt)
    return sig * env


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


CHORDS = [[50, 57, 62, 66, 69, 76], [47, 54, 62, 66, 69, 73], [43, 55, 59, 62, 66, 69], [45, 57, 61, 64, 69, 71]]
pad = np.zeros(N)
bar = 4.0
k = 0
tb = 0.0
while tb < END:
    for m in CHORDS[k % 4]:
        place(pad, note(hz(m), bar + 1.6) * (0.55 if m < 52 else 0.3), tb)
    tb += bar
    k += 1
# respiration lente
pad *= 0.85 + 0.15 * np.sin(2 * np.pi * t / 7.3)

# ---------- cloches et SFX ----------
def bell(f, dur=3.5):
    tt = np.arange(int(dur * SR)) / SR
    parts = ((1, 1, 1.6), (2.76, .45, 3.2), (5.4, .2, 5.0), (8.93, .08, 7.0))
    s = sum(g * np.sin(2 * np.pi * f * m * tt) * np.exp(-tt * d) for m, g, d in parts)
    return s * np.minimum(1, tt / 0.004)


def whoosh(dur=1.1, up=True):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    X *= np.exp(-((np.log(fr + 1) - np.log(1800)) ** 2) / 1.2)
    x = np.fft.irfft(X, n)
    w = np.sin(np.pi * np.linspace(0, 1, n)) ** (2 if up else 1.5)
    if up:
        w *= np.linspace(0.4, 1, n)
    return x / np.abs(x).max() * w


sfx = np.zeros(N)
place(sfx, bell(hz(81)), 0.30, 0.12)                 # « Famille »
place(sfx, bell(hz(86)), 3.30, 0.10)                 # nom
place(sfx, whoosh(1.2), 4.55, 0.22)                  # ouverture du cadre
place(sfx, bell(hz(93), 2.5), VO + 8.6, 0.035)       # carton nom
for a in [20.0, 38.3, 42.2, 49.4, 58.7, 62.5, 67.3, 74.2]:
    place(sfx, bell(hz(88), 2.5), VO + a, 0.03)      # titres
for a in [24.5, 28.9]:
    place(sfx, whoosh(0.6), VO + a - 0.15, 0.06)     # cartes
place(sfx, whoosh(1.0, up=False), VEND - 0.6, 0.2)   # fermeture
place(sfx, bell(hz(81), 4.5), VEND + 1.2, 0.12)      # Gethsémané
place(sfx, bell(hz(86), 4.5), VEND + 5.0, 0.09)      # Ensemble
place(sfx, bell(hz(74), 6.0), VEND + 7.6, 0.12)      # bénédiction

# réverbération : convolution par un bruit à décroissance exponentielle
ir_n = int(2.8 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.6)
ir /= np.sqrt((ir ** 2).sum())
L = 1 << int(np.ceil(np.log2(N + ir_n)))
IR = np.fft.rfft(ir, L)
def verb(x, wet):
    y = np.fft.irfft(np.fft.rfft(x, L) * IR, L)[:N]
    return x + wet * y


pad = verb(pad, 0.6)
sfx = verb(sfx, 0.8)

# ---------- mixage ----------
pad /= np.abs(pad).max()
under = (t > VO + 0.3) & (t < VEND - 0.3)
duck = np.where(under, db(-31), db(-17))
# lissage de l'enveloppe de ducking (0,5 s)
kw = int(0.5 * SR)
duck = np.convolve(duck, np.ones(kw) / kw, mode="same")
voice /= np.abs(voice).max()
mix = voice * db(-3) + pad * duck + sfx * db(-6)
fade = np.clip((END - t) / 2.0, 0, 1) * np.clip(t / 0.05, 0, 1)
mix *= fade
mix /= np.abs(mix).max() * 1.05

os.makedirs(f"{HERE}/out", exist_ok=True)
raw = f"{HERE}/out/mix_raw.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", raw],
               input=mix.astype(np.float32).tobytes(), check=True)
# loudnorm en deux passes à -14 LUFS
import json, re
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\}", r[r.rfind("Parsed_loudnorm"):], re.S).group(0))
f2 = (f"loudnorm=I=-14:TP=-1.2:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f2, "-ar", str(SR), "-ac", "2", f"{HERE}/out/mix.wav"], check=True)
print("ok", m["input_i"])
