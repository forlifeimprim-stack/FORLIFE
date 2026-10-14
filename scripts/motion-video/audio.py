import sys, os, subprocess, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import timeline as T

S = T.S
SR = 48000
SRC = sys.argv[1]
voice_wav = os.path.join(S, "build", "voice.wav")
# voice: clean-up, presence, compression, loudness
af = ("atrim=0:62.45,afade=t=out:st=62.0:d=0.45,"
      "highpass=f=75,afftdn=nr=8:nf=-42,"
      "equalizer=f=250:t=q:w=1.1:g=-2.5,equalizer=f=3200:t=q:w=1.2:g=3,equalizer=f=9500:t=q:w=1:g=1.5,"
      "deesser=i=0.3,acompressor=threshold=-22dB:ratio=3:attack=8:release=140:makeup=3,"
      "loudnorm=I=-15:TP=-2:LRA=9,aresample=48000")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-vn", "-af", af, "-ac", "2", "-ar", str(SR), voice_wav], check=True)

with wave.open(voice_wav) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768

N = int(T.TOTAL * SR) + SR
mix = np.zeros((N, 2), np.float32)
off = int(T.INTRO * SR)
mix[off:off + len(v)] += v[:N - off]

rng = np.random.default_rng(1)
def place(sig, t, gain=1.0):
    i = int(t * SR)
    if sig.ndim == 1: sig = np.stack([sig, sig], 1)
    j = min(N, i + len(sig))
    if i < 0: sig = sig[-i:]; i = 0
    mix[i:j] += sig[:j - i] * gain

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    # vectorised one-pole via lfilter-like recursion (numpy loop is too slow -> use FFT filter)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))

def bandsweep(n, f0, f1):
    x = rng.normal(0, 1, n)
    X = np.fft.rfft(x)
    # time-varying band via STFT-ish chunks
    out = np.zeros(n); hop = 1024; win = np.hanning(2048)
    for k in range(0, n - 2048, hop):
        fc = f0 * (f1 / f0) ** (k / n)
        seg = np.fft.rfft(x[k:k + 2048] * win); f = np.fft.rfftfreq(2048, 1 / SR)
        g = np.exp(-0.5 * (np.log(np.maximum(f, 1) / fc) / 0.5) ** 2)
        out[k:k + 2048] += np.fft.irfft(seg * g, 2048)
    return out / (np.abs(out).max() + 1e-9)

def whoosh(dur=0.55, up=True):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = bandsweep(n, 250 if up else 3500, 3500 if up else 250)
    env = np.sin(np.pi * t ** 0.8) ** 2
    pan = t if up else 1 - t
    return np.stack([x * env * (1 - 0.6 * pan), x * env * (0.4 + 0.6 * pan)], 1)

def impact(dur=1.4, f0=70, f1=34):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 9)) / SR
    boom = np.sin(ph) * np.exp(-t * 3.2)
    click = lowpass(rng.normal(0, 1, n), 2500) * np.exp(-t * 40) * 0.8
    tail = lowpass(rng.normal(0, 1, n), 900) * np.exp(-t * 4) * 0.15
    return np.tanh(1.6 * (boom + click + tail)) * 0.9

def shimmer(dur=1.8):
    n = int(dur * SR); t = np.arange(n) / SR
    notes = [1108.7, 1661.2, 2217.5, 2793.8]  # C#6 G#6 C#7 F7(E#) -> bright C#
    x = sum(np.sin(2 * np.pi * f * t + i) * (0.6 ** i) for i, f in enumerate(notes))
    env = (1 - np.exp(-t * 60)) * np.exp(-t * 2.4)
    l = x * env; r = np.roll(x, 400) * env
    return np.stack([l, r], 1) * 0.25

def riser(dur=0.5):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = bandsweep(n, 600, 7000)
    return x * t ** 2.5

def pad(dur, fade_in=0.6, fade_out=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    freqs = [69.3, 138.6, 207.7, 277.2, 329.6, 415.3, 622.3]   # C#m add9 voicing
    out = np.zeros((n, 2))
    for i, f in enumerate(freqs):
        for det, ch in ((-0.25, 0), (0.25, 1)):
            out[:, ch] += np.sin(2 * np.pi * (f + det * (1 + i * 0.3)) * t + i) * (0.9 ** i)
    out[:, 0] = lowpass(out[:, 0], 1600); out[:, 1] = lowpass(out[:, 1], 1600)
    env = np.minimum(1, t / fade_in) * np.minimum(1, (dur - t) / fade_out)
    out *= env[:, None] * (1 + 0.15 * np.sin(2 * np.pi * 0.4 * t))[:, None]
    return out / np.abs(out).max()

# ---- intro
place(pad(T.INTRO + 1.4, 0.3, 1.2), 0.0, 0.16)
place(riser(0.3), 0.0, 0.22)
place(impact(), 0.3, 0.55)
place(shimmer(), 0.32, 0.5)
place(whoosh(0.5), T.INTRO - 0.35, 0.35)
# ---- cuts
for c in T.CUTS:
    place(whoosh(0.5), T.INTRO + c - 0.3, 0.28)
    place(impact(0.8, 60, 38), T.INTRO + c, 0.22)
# ---- heroes
for ht, txt, lay in T.HEROES:
    place(impact(1.2, 64, 32), T.INTRO + ht, 0.32)
    place(shimmer(1.6), T.INTRO + ht + 0.02, 0.32)
    place(whoosh(0.35), T.INTRO + ht - 0.25, 0.14)
# ---- outro
to = T.INTRO + T.MAIN_END
place(pad(T.OUTRO + 0.6, 0.8, 1.0), to - 0.6, 0.2)
place(impact(1.6), to + 0.15, 0.5)
place(shimmer(2.2), to + 0.15, 0.45)
place(impact(1.0, 55, 35), to + 0.45, 0.3)
place(whoosh(0.4), to + 1.0, 0.18)

mix = mix[:int(T.TOTAL * SR)]
fade = int(0.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
raw = os.path.join(S, "build", "mix_raw.wav")
with wave.open(raw, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                "loudnorm=I=-14:TP=-1.2:LRA=10,alimiter=limit=0.89,aresample=48000",
                "-ar", str(SR), os.path.join(S, "build", "mix.wav")], check=True)
print("audio ok", mix.shape[0] / SR)
