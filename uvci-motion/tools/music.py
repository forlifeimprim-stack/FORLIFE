"""Bande-son d'ambiance générée pour le motion design UVCI (aucun sample externe).

Usage : python3 music.py sortie.wav
Les repères temporels correspondent à la timeline de index.html (voix off décalée de 1 s).
"""
import sys
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
DUR = 50.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(n):
    return np.arange(n) / SR


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), "low")
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), "high")
    return lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return lfilter(b, a, x)


# --- Progression (ré majeur, chaleureuse) : Dmaj9 | Bm9 | Gmaj9 | A6sus
CHORDS = [
    [50, 57, 61, 64, 66],
    [47, 54, 57, 61, 62],
    [43, 50, 54, 57, 59],
    [45, 52, 59, 62, 66],
]
BAR = 2.5  # 96 bpm, 4 temps
BEAT = BAR / 4


def chord_at(t):
    return CHORDS[int(t // BAR) % 4]


def intensity(t):
    """Courbe d'énergie globale de la musique."""
    pts = [(0, .55), (4, .7), (9.1, .85), (12, .8), (16.4, 1), (28.2, .95),
           (35.8, .9), (36.2, .55), (40, .7), (44, 1), (46, .9), (50.5, .0)]
    xs, ys = zip(*pts)
    return float(np.interp(t, xs, ys))


# --- Nappes
def pad_note(f, dur):
    n = int(dur * SR)
    t = tt(n)
    s = np.zeros(n)
    for det in (-0.0018, 0.0, 0.0021):
        ff = f * (1 + det)
        for h in range(1, 9):
            s += np.sin(2 * np.pi * ff * h * t + rng.random() * 6.28) / h ** 1.6
    env = np.minimum(1, t / 1.1) * np.minimum(1, (dur - t) / 1.4).clip(0)
    trem = 1 + 0.08 * np.sin(2 * np.pi * 0.23 * t)
    return lp(s * env * trem, 2200)


t0 = 0.0
while t0 < DUR - 0.5:
    ch = chord_at(t0 + 0.01)
    d = min(BAR + 1.6, DUR - t0)
    g = 0.05 * intensity(t0)
    for k, m in enumerate(ch):
        add(pad_note(midi(m), d), t0, g, pan=(k - 2) * 0.25)
    t0 += BAR

# --- Arpèges (pluck) dès la scène 2, en croches
def pluck(f, dur=0.5):
    n = int(dur * SR)
    t = tt(n)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return s * np.exp(-t * 7) * np.minimum(1, t / 0.004)


pattern = [0, 2, 3, 4, 3, 2, 1, 2]
t0 = 4.4
step = BEAT / 2
i = 0
while t0 < 46.0:
    if not (35.9 < t0 < 40.0):
        ch = chord_at(t0)
        m = ch[pattern[i % 8]] + 12
        g = 0.07 * intensity(t0) * (0.6 if t0 < 9 else 1)
        add(pluck(midi(m)), t0, g, pan=0.45 * np.sin(i * 0.9))
    t0 += step
    i += 1

# --- Basse
t0 = 9.15
while t0 < 46.0:
    if not (35.9 < t0 < 40.0):
        ch = chord_at(t0)
        f = midi(ch[0] - 12)
        n = int(BEAT * 2 * SR)
        t = tt(n)
        s = np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.02) * np.exp(-t * 1.2)
        add(s, t0, 0.16 * intensity(t0))
    t0 += BEAT * 2

# --- Kick doux + hats
def kick():
    n = int(0.45 * SR)
    t = tt(n)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9)


def hat():
    n = int(0.08 * SR)
    t = tt(n)
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * 60)


K = kick()
HH = hat()
for start, end, every in [(16.4, 35.8, 1), (40.1, 46.0, 2)]:
    t0 = start
    b = 0
    while t0 < end:
        if b % every == 0:
            add(K, t0, 0.32)
        add(HH, t0 + BEAT / 2, 0.05, pan=0.3)
        t0 += BEAT
        b += 1

# --- FX
def riser(dur):
    n = int(dur * SR)
    t = tt(n)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = n // 24
    for k in range(24):
        lo = 300 + k * 160
        part = bp(x[k * seg:(k + 1) * seg + 200], lo, lo * 2.2)[: seg]
        out[k * seg:k * seg + len(part)] = part
    return out * (t / dur) ** 2


def impact(dur=2.4, f=48):
    n = int(dur * SR)
    t = tt(n)
    boom = np.sin(2 * np.pi * (f + 40 * np.exp(-t * 12)) * t) * np.exp(-t * 2.2)
    noise = lp(rng.standard_normal(n), 1800) * np.exp(-t * 6)
    return boom + 0.5 * noise


def whoosh(dur=0.9):
    n = int(dur * SR)
    t = tt(n)
    env = np.sin(np.pi * t / dur) ** 2
    return bp(rng.standard_normal(n), 500, 4500) * env


def shimmer(dur=2.5):
    n = int(dur * SR)
    t = tt(n)
    s = np.zeros(n)
    for m in (74, 78, 81, 85, 86):
        s += np.sin(2 * np.pi * midi(m) * t + rng.random() * 6) * np.exp(-t * 1.6)
    return s * np.minimum(1, t / 0.01)


def bell(dur=4.0, f=midi(74)):
    n = int(dur * SR)
    t = tt(n)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d)
            for a, r, d in [(1, 1, 1.2), (.5, 2.76, 2.2), (.3, 5.4, 3.5), (.4, 2, 1.6)])
    return s * np.minimum(1, t / 0.003)


add(shimmer(), 3.7, 0.05)
add(impact(1.6, 60), 3.7, 0.18)
add(riser(1.3), 7.85, 0.09)
add(impact(), 9.15, 0.32)
add(shimmer(), 9.15, 0.05)
for w in (12.0, 16.45, 28.3, 40.05):
    add(whoosh(), w - 0.45, 0.10)
add(riser(1.0), 24.8, 0.08)
add(impact(2.0, 52), 25.8, 0.26)
add(bell(), 46.2, 0.12)
add(bell(4, midi(81)), 46.2, 0.06, pan=0.3)

# --- Réverbération (IR bruit décroissant)
irn = int(2.6 * SR)
irt = tt(irn)
irL = rng.standard_normal(irn) * np.exp(-irt * 2.4)
irR = rng.standard_normal(irn) * np.exp(-irt * 2.4)
irL = lp(irL, 5000)
irR = lp(irR, 5000)
wetL = fftconvolve(L, irL)[:N] * 0.018
wetR = fftconvolve(R, irR)[:N] * 0.018
outL = L + wetL
outR = R + wetR

# fondu final
fade = np.ones(N)
fn = int(2.5 * SR)
fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
outL *= fade
outR *= fade

st = np.stack([outL, outR], 1)
st /= np.abs(st).max() / 0.89
import wave
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print("ok", DUR)
