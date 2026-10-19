"""Bande-son complète, synthétisée en code (aucune piste tierce) :
musique afro-cinématique originale 96 BPM + SFX + voix off placée + mixage.
Sorties : audio/music.wav, audio/sfx.wav, audio/vo.wav, audio/mix.wav (stems séparés + mix)."""
import json, subprocess, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
from timeline import BEAT, BAR, DUR, DROP, VO, words, HERE

SR = 48000
N = int((DUR + 0.5) * SR)
rng = np.random.default_rng(7)          # déterministe
W = words()
cue_t = lambda k, i: VO[k] + json.load(open(f"{HERE}/audio/vo/{k}.json"))[i]["t"]


def T(sec):
    return np.arange(int(sec * SR)) / SR


def lp(x, f, o=2):
    return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def put(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= buf.shape[0]:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    s = sig[: buf.shape[0] - i] * gain
    if s.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        buf[i:i + len(s), 0] += s * l * 1.414
        buf[i:i + len(s), 1] += s * r * 1.414
    else:
        buf[i:i + len(s)] += s


def reverb(x, sec=2.6, wet=0.3, pre=0.02):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for c in range(2):
        e = rng.standard_normal(n) * np.exp(-t * 6.9 / sec)
        ir[:, c] = lp(e, 6500)
    ir[: int(pre * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum(axis=0))
    out = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - wet) + out * wet * 2.2


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------- harmonie : Ré majeur, boucle D Bm G A à partir de la mesure 3 ----------
CH = {"D": [50, 62, 66, 69], "Bm": [47, 62, 66, 71], "G": [43, 62, 67, 71], "A": [45, 61, 64, 69],
      "Asus": [45, 62, 64, 69]}
PROG = ["Bm", "G", "Asus"] + ["D", "Bm", "G", "A"] * 3 + ["D", "Bm", "G", "A"] + ["G", "A", "D", "D", "D", "D"]


def chord_at(bar):
    return PROG[min(bar, len(PROG) - 1)]


def intensity(t):
    """0 → 1 : enveloppe dramatique de la musique."""
    pts = [(0, .4), (7.4, .55), (7.6, .65), (14, .7), (20, .8), (35, .9), (37.2, .95), (37.5, 1.0),
           (46, 1.0), (48, .6), (DUR, .35)]
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


music = np.zeros((N, 2))


def saw(f, t, nh=14, det=0.0):
    ph = 2 * np.pi * f * (1 + det) * t
    s = np.zeros_like(t)
    for h in range(1, nh + 1):
        if f * h > 9000:
            break
        s += np.sin(h * ph + rng.uniform(0, 6.28)) / h
    return s


# pad de cordes (3 voix désaccordées) + chœur à partir du drop
for bar in range(int(DUR / BAR) + 1):
    t0 = bar * BAR
    length = BAR + 1.2
    t = T(length)
    notes = CH[chord_at(bar)]
    I = float(intensity(t0 + 1))
    pad = np.zeros(len(t))
    for m in notes:
        f = midi(m)
        for d in (-0.004, 0.0, 0.0045):
            pad += saw(f, t, 10, d) * (0.6 if m < 55 else 0.35)
    pad = lp(pad, 1500 + 4200 * I, 2)
    pad *= env_adsr(len(t), 0.5, 1.1) * (0.05 + 0.05 * I)
    put(music, pad, t0 - 0.3, pan=0)
    # chœur « aah » (formants) sur les sections fortes
    if t0 >= DROP - 0.01 and t0 < 48:
        ch = np.zeros(len(t))
        for m in notes[1:]:
            vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t)
            ch += saw(midi(m + 12), t * vib, 18)
        ch = bp(ch, 550, 1300, 2) + 0.5 * bp(ch, 2400, 3000, 2)
        put(music, ch * env_adsr(len(t), 0.35, 1.1) * 0.05, t0 - 0.2, pan=0.0)
    # basse
    if t0 >= 14.4 - 2.5:
        b = np.sin(2 * np.pi * midi(notes[0] - 12) * t) + 0.3 * np.sin(4 * np.pi * midi(notes[0] - 12) * t)
        put(music, lp(b, 300) * env_adsr(len(t), 0.08, 0.8) * 0.12 * (0.6 + 0.4 * I), t0)


# kalimba (lames inharmoniques), motif pentatonique
def kalimba(f, dur=1.6):
    t = T(dur)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2)
    s += 0.35 * np.sin(2 * np.pi * f * 5.93 * t) * np.exp(-t * 14)
    s += 0.12 * np.sin(2 * np.pi * f * 13.1 * t) * np.exp(-t * 30)
    s[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return s


MOTIF = [74, 78, 81, 83, 81, 78, 76, 78]  # D5 F#5 A5 B5 A5 F#5 E5 F#5
for k in range(int(DUR / (BEAT / 2))):
    t0 = k * BEAT / 2
    if t0 < 0.6 or (DROP - 2.6 < t0 < DROP) or t0 > 50.5:
        continue
    if t0 < 7.5 and k % 2:      # intro : noires seulement
        continue
    note = MOTIF[k % 8] + (12 if (t0 >= DROP and k % 4 == 3) else 0)
    g = 0.11 if t0 < 7.5 else 0.075
    put(music, kalimba(midi(note)), t0, g, pan=0.35 * np.sin(k * 0.9))


# percussions
def kick(g=1.0):
    t = T(0.6)
    f = 45 + 85 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * g


def djembe_bass():
    t = T(0.4)
    return np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-t * 40)) / SR) * np.exp(-t * 11)


def djembe_tone():
    t = T(0.25)
    s = np.sin(2 * np.pi * 330 * t) * np.exp(-t * 22) + 0.4 * bp(rng.standard_normal(len(t)), 600, 2500) * np.exp(-t * 35)
    return s


def djembe_slap():
    t = T(0.18)
    return bp(rng.standard_normal(len(t)), 1200, 5000) * np.exp(-t * 45) * 1.3 + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 40) * 0.4


def shaker():
    t = T(0.09)
    e = np.minimum(t / 0.012, 1) * np.exp(-t * 45)
    return hp(rng.standard_normal(len(t)), 6000) * e


def talking(f0=210, f1=140):
    t = T(0.45)
    f = f1 + (f0 - f1) * np.exp(-t * 7)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + 0.2 * bp(rng.standard_normal(len(t)), 400, 1500) * np.exp(-t * 30)


def tom(f=95):
    t = T(0.7)
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t * 20))) / SR) * np.exp(-t * 5.5)


def clap():
    t = T(0.16)
    x = bp(rng.standard_normal(len(t)), 900, 4200)
    e = np.zeros(len(t))
    for o in (0, 0.009, 0.018):
        i = int(o * SR); e[i:] += np.exp(-(t[: len(t) - i]) * (90 if o < 0.018 else 28))
    return x * e


# 16 doubles-croches par mesure : motifs de djembé
PAT_B = "x.......x.x....."     # basse
PAT_T = "....x..x....x.x."     # tone
PAT_S = "..x.......x....x"     # slap
sixteenth = BEAT / 4
for k in range(int(DUR / sixteenth)):
    t0 = k * sixteenth
    s = k % 16
    I = float(intensity(t0))
    if DROP - 0.25 < t0 < DROP or t0 >= 47.5:
        continue
    if t0 >= 1.25:                                  # pulsation dès l'ouverture
        if s % 2 == 0 or t0 >= 14.4:
            put(music, shaker(), t0, (0.05 if s % 4 == 0 else 0.028) * (0.7 + 0.5 * I), pan=0.4)
        if s in (0, 8) and t0 >= 7.5:
            put(music, kick(), t0, 0.34 * I)
        if s in (4, 12) and t0 >= 9.9:
            put(music, clap(), t0, 0.11, pan=0.1)
    if t0 >= 14.4:
        if PAT_B[s] == "x":
            put(music, djembe_bass(), t0, 0.26, pan=-0.15)
        if PAT_T[s] == "x":
            put(music, djembe_tone(), t0, 0.12, pan=0.2)
        if PAT_S[s] == "x" and t0 >= 20:
            put(music, djembe_slap(), t0, 0.09, pan=-0.3)
    if t0 >= DROP and s in (4, 12):
        put(music, djembe_slap(), t0, 0.12, pan=0.25)
    if t0 >= 28.75 and s == 14 and (k // 16) % 2:
        put(music, talking(), t0, 0.1, pan=-0.35)

# roulement + montée avant le drop (35 → 37,3)
t_roll = 35.0
while t_roll < 37.2:
    frac = (t_roll - 35) / 2.2
    put(music, tom(90 + 40 * frac), t_roll, 0.08 + 0.18 * frac, pan=np.sin(t_roll * 7) * 0.4)
    t_roll += BEAT / (2 if frac < 0.5 else 4)

# toms sur les chiffres
for t0 in (20.0, 22.5, 25.0):
    put(music, tom(85), t0, 0.35)
    put(music, tom(120), t0 + BEAT * 0.5, 0.15)

music = reverb(music, 2.4, 0.28)
music = lp(music.T, 15000).T

# ---------- SFX ----------
sfx = np.zeros((N, 2))


def whoosh(d=0.9, lo=300, hi=4000, up=True):
    t = T(d)
    x = rng.standard_normal(len(t))
    env = np.sin(np.pi * t / d) ** 2 * (t / d if up else 1)
    out = np.zeros(len(t))
    seg = 512
    for i in range(0, len(t), seg):
        f = lo + (hi - lo) * (i / len(t) if up else 1 - i / len(t))
        out[i:i + seg] = bp(x[max(0, i - 2048):i + seg], f * 0.7, min(f * 1.4, 20000))[-len(out[i:i + seg]):]
    return out * env


def impact(g=1.0, f0=55):
    t = T(2.5)
    s = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * np.exp(-t * 18))) / SR) * np.exp(-t * 2.2)
    s += 0.35 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 9)
    return s * g


def shimmer(d=2.2):
    t = T(d)
    s = np.zeros(len(t))
    for i, m in enumerate([86, 90, 93, 98, 102, 105]):
        st = int(i * 0.07 * SR)
        tt = t[: len(t) - st]
        s[st:] += np.sin(2 * np.pi * midi(m) * tt) * np.exp(-tt * 2.6) * 0.3
    return s


def riser(d=3.0):
    t = T(d)
    x = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    seg = 1024
    for i in range(0, len(t), seg):
        f = 400 * (20 ** (i / len(t)))
        out[i:i + seg] = bp(x[max(0, i - 4096):i + seg], f * 0.8, min(f * 1.3, 20000))[-len(out[i:i + seg]):]
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2 * t / d)) / SR) * 0.25
    return (out + tone) * (t / d) ** 2


def tick():
    t = T(0.03)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 200)


NOTES = {"C5": 523.25, "D5": 587.33, "E5": 659.25, "F#5": 739.99, "G5": 783.99, "A5": 880.0, "B5": 987.77, "D6": 1174.66, "A4": 440.0, "D4": 293.66}


def marimba(f, dur=0.45, bright=0.35):
    t = T(dur)
    tone = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.03) + 0.2 * np.sin(2 * np.pi * f * 10 * t) * np.exp(-t / 0.008)
    return tone * np.minimum(t / 0.002, 1) * np.exp(-t / (dur / 3.5))


def scribble(d=0.6):
    t = T(d)
    x = bp(rng.standard_normal(len(t)), 1800, 5200)
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 23 * t) ** 2
    return x * am * np.sin(np.pi * t / d) ** 0.5


SCALE = ["D5", "E5", "F#5", "A5", "B5", "D6"]
put(sfx, shimmer(3.0), 0.3, 0.10)                          # lever du soleil
put(sfx, marimba(NOTES["D5"], 0.8), 0.4, 0.10)             # l'emblème se pose
put(sfx, shimmer(1.6), cue_t("01", 4), 0.07)               # la croix s'allume
put(sfx, whoosh(0.9, 300, 3000), 3.95, 0.09)               # travelling vers la salle
for k in range(11):                                          # chaises qui remplissent la salle
    put(sfx, marimba(NOTES[SCALE[k % 6]] * (1 if k < 6 else 2), 0.25, 0.5), 4.75 + k * 0.105, 0.05, pan=-0.5 + k * 0.1)
put(sfx, scribble(0.32), 5.75, 0.05)                        # trait de marqueur
put(sfx, whoosh(0.5, 800, 6000), 6.05, 0.08)               # flash
put(sfx, impact(1.0, 50), 7.86, 0.40)                       # DISCIPLES
put(sfx, shimmer(1.4), 8.4, 0.07)                           # la lumière dans les lettres
put(sfx, riser(0.7), 9.0, 0.10)                             # plongée dans la lettre
for k in range(6):                                           # la foule apparaît
    put(sfx, marimba(NOTES["A4"] * (1 + k * 0.12), 0.2, 0.2), 9.7 + k * 0.12, 0.025)
put(sfx, scribble(0.32), 12.05, 0.05)
for k in range(6):                                           # la flamme passe de main en main
    put(sfx, marimba(NOTES[SCALE[k]], 0.5), 13.0 + k * 0.17, 0.08, pan=-0.4 + k * 0.16)
put(sfx, whoosh(0.6, 400, 4000), 14.3, 0.08)               # iris
put(sfx, whoosh(1.1, 200, 1500), 16.25, 0.06, -0.4)        # la famille arrive
put(sfx, whoosh(1.1, 200, 1500), 16.4, 0.06, 0.4)
put(sfx, scribble(0.75), 16.95, 0.05)                       # le toit se dessine
put(sfx, scribble(0.4), 17.45, 0.04)
put(sfx, marimba(NOTES["D6"], 0.8), cue_t("04", 11), 0.09)  # la fenêtre s'allume
put(sfx, shimmer(1.4), cue_t("04", 11) + 0.05, 0.06)
put(sfx, riser(0.6), 18.95, 0.10)                           # plongée dans la fenêtre
for t0 in (20.0, 22.5, 25.0):
    for j in range(8):
        put(sfx, tick(), t0 - 0.38 + j * 0.045, 0.045, 0.2)
    put(sfx, impact(0.5, 70), t0 + 0.05, 0.16)
    put(sfx, marimba(NOTES["A5"], 0.5), t0 + 0.1, 0.06)
    put(sfx, scribble(0.4), t0 + 0.55, 0.035)
put(sfx, whoosh(0.5, 500, 5000), 22.0, 0.08, 0.3)
put(sfx, whoosh(0.5, 500, 5000), 24.5, 0.08, 0.3)
put(sfx, whoosh(0.9, 3000, 300, ), 27.3, 0.08)              # dolly arrière
put(sfx, whoosh(0.6, 400, 4000), 28.4, 0.09, -0.3)         # nouvelle scène
for c in (30.66, 31.56, 32.41):                              # le tambour de mots tourne
    put(sfx, tick(), c - 0.05, 0.08); put(sfx, marimba(NOTES["E5"], 0.3, 0.6), c, 0.04)
put(sfx, marimba(NOTES["D5"], 0.5), cue_t("09", 8) - 0.1, 0.06)
put(sfx, scribble(0.6), cue_t("09", 12) - 0.05, 0.05)
put(sfx, riser(3.2), DROP - 3.2, 0.14)                      # montée
put(sfx, impact(1.0, 42), DROP, 0.7)                        # DROP : le livre
put(sfx, shimmer(3.0), DROP + 0.05, 0.14)
put(sfx, whoosh(1.4, 200, 2500, False), DROP, 0.12)
put(sfx, marimba(NOTES["D6"], 1.0), 40.76, 0.06)            # « Christ »
put(sfx, scribble(0.45), 40.82, 0.04)
put(sfx, marimba(NOTES["A5"], 0.6), 41.95, 0.06)            # portrait
put(sfx, whoosh(1.0, 300, 2500), 44.1, 0.07)
put(sfx, marimba(NOTES["D5"], 0.9), 45.05, 0.05)            # la flamme se pose
put(sfx, shimmer(3.5), 47.6, 0.08)                          # carton final
sfx = reverb(sfx, 2.0, 0.3)

# ---------- voix off ----------
vo = np.zeros((N, 2))
for k, t0 in VO.items():
    wav = f"{HERE}/audio/vo/{k}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{HERE}/audio/vo/{k}.mp3", "-ar", str(SR), "-ac", "1", wav], check=True)
    d, _ = sf.read(wav)
    d = hp(d, 75)
    # légère chaleur : +2 dB autour de 180 Hz, présence 3 kHz
    d = d + 0.25 * bp(d, 120, 260) + 0.15 * bp(d, 2500, 4500)
    put(vo, d, t0, 1.0)
vo = reverb(vo, 1.2, 0.12, 0.015)

# ---------- ducking de la musique sous la voix (~ -9 dB) ----------
env = np.abs(vo[:, 0])
win = int(0.05 * SR)
env = np.convolve(env, np.ones(win) / win, "same")
active = (env > 0.004).astype(float)
k_att = int(0.12 * SR)
active = np.convolve(active, np.ones(k_att) / k_att, "same")
active = np.clip(active * 1.5, 0, 1)
duck = 1 - 0.65 * active          # ≈ -9 dB
music *= duck[:, None]


def norm(x, peak=0.89):
    return x / max(1e-9, np.abs(x).max()) * peak


music = norm(music, 0.5)
sfx = norm(sfx, 0.5)
vo = norm(vo, 0.85)
mix = music * 0.6 + sfx * 0.8 + vo * 1.0
# fondu de queue
fade = int(2.5 * SR)
end = int(DUR * SR)
mix[end - fade:end] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix[end:] = 0
mix = mix[:end]
os.makedirs(f"{HERE}/audio", exist_ok=True)
for name, x in (("music", music[:end]), ("sfx", sfx[:end]), ("vo", vo[:end])):
    sf.write(f"{HERE}/audio/{name}.wav", x, SR, subtype="PCM_24")
sf.write(f"{HERE}/audio/mix_raw.wav", norm(mix, 0.95), SR, subtype="PCM_24")

# loudnorm deux passes à -14 LUFS
r = subprocess.run(["ffmpeg", "-i", f"{HERE}/audio/mix_raw.wav", "-af", "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rfind("{"):])
af = (f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
      f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{HERE}/audio/mix_raw.wav", "-af", af, "-ar", "48000",
                f"{HERE}/audio/mix.wav"], check=True)
print("mix ok", js["input_i"], "->", -14)
