"""Musique originale afrobeat (112 BPM, la mineur) + effets, synthétisée avec numpy.

Structure calée sur la pub (en temps) :
  0-12  : problème — groove filtré, cœur qui bat, montée (riser) vers le drop
  12-39 : solution — groove afrobeat complet (kick, claps, shakers, congas, log drum, accords, flûte)
  39-41 : break avant l'appel à l'action
  41-50 : appel à l'action — groove + accroche mélodique, impact final
Usage : python3 afrobeat.py out.wav
"""
import sys
import wave

import numpy as np

SR = 48000
BPM = 112
BEAT = 60 / BPM
STEP = BEAT / 4
TOTAL_BEATS = 50
DUR = TOTAL_BEATS * BEAT + 2.0  # queue de réverbération
N = int(DUR * SR)
rng = np.random.default_rng(7)


def buf():
    return np.zeros(N)


def at(track, start_s, sig, gain=1.0):
    i = int(start_s * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    track[i:j] += sig[: j - i] * gain


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def note_hz(n):  # n = numéro MIDI
    return 440.0 * 2 ** ((n - 69) / 12)


def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if hi:
        m *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo:
        m *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * m, len(x))


def reverb(x, seconds=1.4, decay=4.0, mix=0.25):
    ir_t = t_(seconds)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-decay * ir_t)
    ir = fft_filter(ir, hi=6000)
    ir /= np.sqrt(np.sum(ir**2))
    n = len(x) + len(ir)
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
    return x + y * mix


# ───────── Instruments ─────────
def kick():
    t = t_(0.45)
    f = 48 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s[:120] += np.linspace(0.6, 0, 120) * rng.standard_normal(120)
    return np.tanh(s * 1.6)


def clap():
    t = t_(0.3)
    n = fft_filter(rng.standard_normal(len(t)), lo=900, hi=7000)
    env = np.exp(-t * 22)
    for d in (0.0, 0.011, 0.022):
        env += np.where(t >= d, np.exp(-(t - d) * 160), 0) * 0.6
    return n * env * 0.5


def rim():
    t = t_(0.08)
    return (np.sin(2 * np.pi * 1750 * t) * 0.6 + fft_filter(rng.standard_normal(len(t)), lo=2000) * 0.4) * np.exp(-t * 70)


def shaker(accent=1.0):
    t = t_(0.07)
    n = fft_filter(rng.standard_normal(len(t)), lo=5000, hi=11000)
    return n * np.exp(-t * 55) * 0.2 * accent


def conga(hz):
    t = t_(0.25)
    f = hz * (1 + 0.35 * np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16) * 0.55


def log_drum(midi, length=0.32):
    """Log drum façon amapiano : sinus saturé avec légère chute de hauteur."""
    t = t_(length)
    f = note_hz(midi) * (1 + 0.12 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.exp(-t * 7) * (1 - np.exp(-t * 400))
    return np.tanh(s * env * 2.4) * 0.55


def ep_chord(midis, length=0.35):
    """Accord type piano électrique (FM léger), joué en « stab »."""
    t = t_(length)
    out = np.zeros(len(t))
    for m in midis:
        f = note_hz(m)
        idx = 1.2 * np.exp(-t * 9)
        out += np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 2 * t))
    env = np.exp(-t * 9) * (1 - np.exp(-t * 300))
    return out * env * 0.13


def pad(midis, length):
    t = t_(length)
    out = np.zeros(len(t))
    for m in midis:
        for det in (-0.12, 0.0, 0.11):
            f = note_hz(m + det)
            out += np.sign(np.sin(2 * np.pi * f * t + rng.random() * 6)) * 0.5 + np.sin(2 * np.pi * f * t)
    env = np.minimum(1, t / 0.4) * np.minimum(1, (length - t) / 0.3)
    return fft_filter(out, hi=1400) * env * 0.035


def flute(midi, length):
    t = t_(length)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.15)
    f = note_hz(midi) * vib
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    breath = fft_filter(rng.standard_normal(len(t)), lo=1500, hi=6000) * 0.05
    env = np.minimum(1, t / 0.03) * np.exp(-t * 1.6) * np.minimum(1, (length - t) / 0.04)
    return (s + breath) * env * 0.22


def sub(midi, length):
    t = t_(length)
    env = np.minimum(1, t / 0.01) * np.minimum(1, (length - t) / 0.05)
    return np.sin(2 * np.pi * note_hz(midi) * t) * env * 0.35


def whoosh(length=0.6, up=True):
    t = t_(length)
    n = rng.standard_normal(len(t))
    chunks = []
    k = 24
    seg = len(t) // k
    for c in range(k):
        p = c / (k - 1)
        cut = 400 + (8000 if up else 6000) * (p if up else 1 - p)
        chunks.append(fft_filter(n[c * seg : (c + 1) * seg], lo=cut * 0.4, hi=cut))
    s = np.concatenate(chunks)
    env = np.sin(np.pi * np.linspace(0, 1, len(s))) ** 1.5
    return s * env * 0.5


def impact():
    t = t_(1.2)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 10)) / SR) * np.exp(-t * 3.5)
    crack = fft_filter(rng.standard_normal(len(t)), lo=200, hi=5000) * np.exp(-t * 12)
    return np.tanh((boom + crack * 0.5) * 1.8) * 0.8


def riser(length):
    t = t_(length)
    p = t / length
    n = rng.standard_normal(len(t))
    k = 40
    seg = len(t) // k
    s = np.concatenate([fft_filter(n[c * seg : (c + 1) * seg], lo=300 + 3000 * (c / k), hi=900 + 9000 * (c / k)) for c in range(k)])
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * p[: len(s)] ** 2) / SR) * 0.15
    return (s * 0.6 + tone) * p[: len(s)] ** 2


def ching():
    """« Caisse » : clochette FM pour les ventes."""
    t = t_(1.0)
    s = np.zeros(len(t))
    for f, a in ((2093, 1), (3136, 0.6), (4186, 0.4)):
        s += a * np.sin(2 * np.pi * f * t + 2 * np.exp(-t * 6) * np.sin(2 * np.pi * f * 1.41 * t))
    return s * np.exp(-t * 5) * 0.12


def pop():
    t = t_(0.09)
    f = 600 + 900 * np.exp(-t * 60)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45) * 0.35


def heartbeat():
    t = t_(0.5)
    b = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 14)
    b2 = np.roll(b, int(0.16 * SR)) * 0.7
    return (b + b2) * 0.9


# ───────── Arrangement ─────────
drums, perc, bass, keys, lead, fx, padb = (buf() for _ in range(7))

CHORDS = [  # la mineur : Am7 – Dm7 – G – Cmaj7
    (57, [57, 60, 64, 67]),
    (50, [50, 53, 57, 60]),
    (55, [55, 59, 62, 65]),
    (48, [48, 52, 55, 59]),
]
KICK = [0, 6, 10]
CLAP = [4, 12]
RIM = [3, 7, 11, 14]
CONGA = {2: 330, 5: 250, 9: 330, 13: 250, 15: 400}
LOG = [(0, 0), (3, 7), (6, 12), (10, 0), (13, 7)]  # (pas, intervalle par rapport à la fondamentale)
STABS = [2, 6, 10, 14]


def beat_s(b):
    return b * BEAT


def groove(bar_start_beat, bars, full=True, filtered=False):
    for bar in range(bars):
        b0 = bar_start_beat + bar * 4
        root, chord = CHORDS[(b0 // 4) % 4]
        for step in range(16):
            s = beat_s(b0) + step * STEP
            swing = 0.018 if step % 2 else 0.0  # léger swing des doubles-croches
            s += swing * STEP * 4
            if step in KICK and full:
                at(drums, s, kick(), 0.95)
            if step in CLAP and full:
                at(drums, s, clap(), 0.8)
            if step in RIM:
                at(perc, s, rim(), 0.35 if full else 0.2)
            at(perc, s, shaker(1.0 if step % 4 == 2 else 0.55))
            if full and step in CONGA:
                at(perc, s, conga(CONGA[step]), 0.6)
            if full:
                for st, iv in LOG:
                    if st == step:
                        at(bass, s, log_drum(root - 12 + iv), 0.9)
            if step in STABS:
                at(keys, s, ep_chord(chord), 1.0 if full else 0.8)
        if not full:
            at(padb, beat_s(b0), pad(chord, 4 * BEAT), 1.0)
        else:
            at(bass, beat_s(b0), sub(root - 24, 4 * BEAT * 0.98), 0.55)


# 0-12 : problème (groove retenu, filtré) + cœur qui bat
groove(0, 3, full=False)
for b in range(0, 12, 2):
    at(fx, beat_s(b), heartbeat(), 0.55)
# « Pas d'idées. Pas le temps. Pas de résultats. » : un coup par phrase (calé sur la voix)
for sec, g in ((3.445, 0.4), (4.226, 0.45), (5.02, 0.55)):
    at(fx, sec, impact(), g)
at(fx, beat_s(9), riser(3 * BEAT), 0.55)

# 12-39 : solution — drop
at(fx, beat_s(12), impact(), 0.9)
groove(12, 7, full=True)  # 12 → 40 (le break coupe la fin)

# Accroche à la flûte (pentatonique de la)
HOOK = [(0, 69, 0.5), (0.5, 72, 0.5), (1, 74, 0.5), (1.75, 76, 0.75), (2.5, 74, 0.5), (3, 72, 1.0)]
for start in (16, 24, 32, 44):
    for off, m, ln in HOOK:
        at(lead, beat_s(start + off), flute(m, ln * BEAT * 1.1), 1.7)

# Transitions entre scènes (temps)
for b in (6, 18, 24, 27, 33, 39):
    at(fx, beat_s(b) - 0.28, whoosh(0.5), 0.4)
for b in (25, 25.5, 26, 26.5):  # icônes des réseaux qui apparaissent
    at(fx, beat_s(b), pop(), 0.6)
at(fx, beat_s(29.5), ching(), 1.0)
at(fx, beat_s(31), ching(), 0.8)

# 39-41 : break — on coupe la batterie, montée
cut0, cut1 = int(beat_s(39) * SR), int(beat_s(41) * SR)
for tr in (drums, bass, perc):
    tr[cut0:cut1] *= 0.0
at(fx, beat_s(39), riser(2 * BEAT), 0.6)
at(padb, beat_s(39), pad(CHORDS[3][1], 2 * BEAT), 1.4)

# 41-49 : appel à l'action
at(fx, beat_s(41), impact(), 0.85)
groove(41, 2, full=True)
at(fx, beat_s(49), impact(), 1.0)
tail = int(beat_s(49) * SR)
for tr in (drums, bass, perc, keys):
    tr[tail:] *= 0.0
at(keys, beat_s(49), ep_chord([57, 60, 64, 67, 72], 2.0), 1.6)

# ───────── Mixage ─────────
padb[: int(beat_s(12) * SR)] = fft_filter(padb[: int(beat_s(12) * SR)], hi=900)
intro_end = int(beat_s(12) * SR)
for tr in (perc, keys):
    tr[:intro_end] = fft_filter(tr[:intro_end], hi=1800)

mix = drums * 1.0 + perc * 0.8 + bass * 1.0 + reverb(keys, mix=0.35) * 1.0 + reverb(lead, mix=0.4) * 0.9 + padb + fx
mix = fft_filter(mix, lo=28, hi=15000)
mix = mix / np.percentile(np.abs(mix), 99.9) * 0.75
mix = np.tanh(mix * 1.2) * 0.92
mix /= np.max(np.abs(mix)) / 0.95

stereo = np.stack([mix, mix], axis=1)
# léger élargissement : réverb des accords décalée à droite
width = fft_filter(reverb(keys, mix=1.0) - keys, lo=300) * 0.12
stereo[:, 0] += width
stereo[:, 1] -= width
stereo /= np.max(np.abs(stereo)) / 0.95

out = sys.argv[1] if len(sys.argv) > 1 else "music.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print(f"{out}: {DUR:.2f}s, {BPM} BPM, temps = {BEAT:.4f}s")
