# Original afro-house score (112 BPM) + sound design + voice processing + mix, all synthesized.
import sys, json, numpy as np, soundfile as sf
from scipy import signal

B = sys.argv[1]
SR = 48000
T = json.load(open(B + '/timings.json'))
S = {s['id']: s for s in T['segs']}
BPM = T['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; STEP = BEAT / 4
DUR = S['o1']['end'] + 3.6
N = int(DUR * SR)
rng = np.random.default_rng(7)

def t_(sec): return int(round(sec * SR))
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): b, a = signal.butter(o, min(f, SR/2 - 100)/(SR/2)); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f/(SR/2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f0, f1, o=2): b, a = signal.butter(o, [f0/(SR/2), f1/(SR/2)], 'band'); return signal.lfilter(b, a, x)
def bar_t(i): return i * BAR
def bar_of(sec): return int(round(sec / BAR))

def add(buf, x, start, g=1.0):
    i = t_(start)
    if i >= len(buf) or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[:len(buf) - i]; buf[i:i+len(x)] += x * g

def reverb(x, sec=1.6, seed=0, pre=0.015, bright=6000):
    n = int(sec * SR); r = np.random.default_rng(seed)
    ir = r.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(np.concatenate([np.zeros(int(pre*SR)), ir]), bright, 1)
    return signal.fftconvolve(x, ir)[:len(x)] / (np.abs(ir).sum() ** 0.5 * 4)

# ---------------------------------------------------------------- instruments
def kick(amp=1.0):
    n = t_(0.42); t = np.arange(n)/SR
    f = 48 + 140*np.exp(-t*38); ph = 2*np.pi*np.cumsum(f)/SR
    body = np.sin(ph) * np.exp(-t*7.5)
    click = lp(rng.standard_normal(n), 4000) * np.exp(-t*300) * 0.35
    return np.tanh((body + click) * 1.6) * amp * 0.75

def clap(amp=1.0):
    n = t_(0.35); t = np.arange(n)/SR; x = bp(rng.standard_normal(n), 900, 5200)
    e = np.zeros(n)
    for k, o in enumerate((0, 0.009, 0.018)):
        i = t_(o); e[i:] += np.exp(-(t[:n-i])*(55 if k < 2 else 18)) * (0.7 if k < 2 else 1)
    return x * e * amp * 0.5

def shaker(amp=1.0, acc=False):
    n = t_(0.07); t = np.arange(n)/SR
    x = hp(rng.standard_normal(n), 6500) * np.exp(-t*(55 if not acc else 38)) * np.minimum(1, t/0.004)
    return x * amp * (0.16 if not acc else 0.24)

def ohat(amp=1.0):
    n = t_(0.22); t = np.arange(n)/SR
    return hp(rng.standard_normal(n), 8000) * np.exp(-t*18) * amp * 0.14

def conga(m, amp=1.0):
    n = t_(0.3); t = np.arange(n)/SR; f = hz(m) * (1 + 0.25*np.exp(-t*60))
    ph = 2*np.pi*np.cumsum(f)/SR
    y = np.sin(ph)*np.exp(-t*16) + 0.3*bp(rng.standard_normal(n), 1500, 5000)*np.exp(-t*90)
    return y * amp * 0.32

def logbass(m, dur, amp=1.0):
    """amapiano-style log drum: sine with pitch drop + slight saturation."""
    n = t_(dur); t = np.arange(n)/SR; f = hz(m) * (1 + 0.6*np.exp(-t*45))
    ph = 2*np.pi*np.cumsum(f)/SR
    y = np.sin(ph) + 0.25*np.sin(2*ph) + 0.08*np.sin(3*ph)
    e = np.exp(-t*3.2) * np.minimum(1, t/0.003)
    e[-t_(0.02):] *= np.linspace(1, 0, t_(0.02))
    return np.tanh(y * e * 1.8) * amp * 0.42

def stab(notes, amp=1.0, dur=0.16, bright=5200):
    n = t_(dur); t = np.arange(n)/SR; y = np.zeros(n)
    for m in notes:
        for det in (-0.12, 0.12):
            f = hz(m) * 2**(det/12); y += 2*((t*f + rng.random()) % 1) - 1
    y = lp(y, bright) * np.exp(-t*16) * np.minimum(1, t/0.003)
    return y * amp * 0.07 / len(notes)

def kalimba(m, amp=1.0, dur=0.9):
    n = t_(dur); t = np.arange(n)/SR; f = hz(m)
    y = np.sin(2*np.pi*f*t)*np.exp(-t*5.5) + 0.4*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*30) + 0.15*np.sin(2*np.pi*f*2*t)*np.exp(-t*9)
    return y * np.minimum(1, t/0.002) * amp * 0.17

def pad(notes, dur, bright=2200, amp=1.0):
    n = t_(dur); t = np.arange(n)/SR; y = np.zeros(n)
    for m in notes:
        for det in (-0.1, 0.0, 0.1):
            f = hz(m) * 2**(det/12); y += 2*((t*f + rng.random()) % 1) - 1
    y = lp(y, bright)
    a = min(t_(0.3), n//3); r = min(t_(0.4), n//3); e = np.ones(n); e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r)
    return y * e * amp * 0.018 / len(notes)

def brass(notes, amp=1.0, dur=0.6):
    n = t_(dur); t = np.arange(n)/SR; y = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.08):
            f = hz(m)*2**(det/12)*(1 - 0.015*np.exp(-t*30)); y += 2*((np.cumsum(f)/SR + rng.random()) % 1) - 1
    cutoff = 900 + 4500*np.exp(-t*6)
    out = np.zeros(n); ch = 256
    for i in range(0, n, ch):
        b, a = signal.butter(2, cutoff[i]/(SR/2)); out[i:i+ch] = signal.lfilter(b, a, y[i:i+ch])
    e = np.minimum(1, t/0.012) * np.exp(-t*2.6)
    return out * e * amp * 0.09 / len(notes)

def noise_riser(dur, amp=1.0):
    n = t_(dur); x = rng.standard_normal(n); out = np.zeros(n); ch = 1024
    for i in range(0, n, ch):
        p = i/n; fc = 400 + 9000*p**2
        out[i:i+ch] = bp(x[i:i+ch], fc*0.6, min(fc*1.4, 22000))
    return out * np.linspace(0, 1, n)**2 * amp * 0.5

def crash(amp=1.0):
    n = t_(2.2); t = np.arange(n)/SR
    return hp(rng.standard_normal(n), 5000) * np.exp(-t*2.4) * amp * 0.12

def sub_boom(amp=1.0):
    n = t_(1.6); t = np.arange(n)/SR; f = 38 + 60*np.exp(-t*12)
    return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*2.2) * amp * 0.7

def whoosh(dur=0.5, amp=1.0):
    n = t_(dur); x = rng.standard_normal(n); out = np.zeros(n); ch = 512
    for i in range(0, n, ch):
        p = i/n; fc = 500 + 4000*np.sin(np.pi*p); out[i:i+ch] = bp(x[i:i+ch], fc*0.6, fc*1.4)
    return out * np.sin(np.pi*np.linspace(0, 1, n))**2 * amp * 0.18

# ---------------------------------------------------------------- arrangement
DRUMS = np.zeros(N); BASS = np.zeros(N); MUS = np.zeros((2, N)); FX = np.zeros(N)
def addm(x, start, g=1.0, pan=0.0):
    add(MUS[0], x, start, g*np.sqrt((1 - pan)/2)*1.41); add(MUS[1], x, start, g*np.sqrt((1 + pan)/2)*1.41)

CHORDS = [  # vi – IV – I – V in C major: (bass root, stab voicing)
    (45, [57, 60, 64, 67]), (41, [57, 60, 65, 69]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]
LEAD = [76, 79, 81, 79, 76, 74, 72, 74,  76, 0, 72, 69, 72, 0, 74, 76]   # kalimba riff (8ths), 0 = rest
LEAD2 = [84, 81, 79, 81, 84, 0, 86, 84, 81, 79, 76, 0, 79, 81, 79, 76]
BASS_STEPS = [(0, 0, 0.32), (3, 0, 0.2), (6, 12, 0.22), (8, 0, 0.3), (11, 7, 0.2), (14, 12, 0.18)]
CONGA = [(0, 62), (3, 67), (6, 62), (10, 67), (11, 64), (14, 62)]

drop1 = bar_of(S['q1']['start'] + 0.06)      # quote drop
drop2 = bar_of(S['t1']['start'] + 0.06)      # "Ose commencer" drop
break_bar = drop1 - 1                         # "Mais la vérité ?" break
fog0 = bar_of(S['q4']['start'] + 0.06)        # build section
end_bar = int(DUR / BAR) - 1                  # final hit
print('bars: drop1', drop1, 'drop2', drop2, 'fog', fog0, 'end', end_bar, 'BAR', round(BAR, 3))

for b in range(end_bar):
    t0 = bar_t(b); root, voicing = CHORDS[b % 4]
    intro = b < 2; brk = b == break_bar; build = fog0 <= b < drop2; full = b >= drop1 and not build
    last_beat_silent = b == drop2 - 1 or b == break_bar
    for s in range(16):
        ts = t0 + s*STEP
        if last_beat_silent and s >= 12: continue
        swing = STEP*0.12 if s % 2 else 0.0          # light shuffle on off-16ths
        # kick: four on the floor (not during the break)
        if s % 4 == 0 and not brk:
            add(DRUMS, kick(0.85 if intro else 1.0), ts)
        if s == 14 and full and b % 2: add(DRUMS, kick(0.45), ts)
        # clap on 2 & 4
        if s in (4, 12) and not intro and not brk: add(DRUMS, clap(1.0), ts)
        # shaker 16ths everywhere (even the intro)
        add(DRUMS, shaker(0.9, acc=s % 4 == 2), ts + swing)
        if s % 4 == 2 and not brk and not intro: add(DRUMS, ohat(1.0), ts)
        # congas (tresillo-ish)
        if not brk and (full or build or not intro):
            for st, m in CONGA:
                if st == s: add(DRUMS, conga(m, 0.9 if full else 0.6), ts + swing)
        # log-drum bass
        if not intro and not brk:
            for st, off, d in BASS_STEPS:
                if st == s: add(BASS, logbass(root - 12 + off + 12, d + 0.1, 1.0 if full else 0.8), ts)
        # offbeat chord stabs (skank)
        if s in (2, 6, 10, 14) and not brk:
            addm(stab(voicing, 1.0 if not intro else 0.8, bright=2200 if intro else 5200), ts, pan=(-0.25 if s in (2, 10) else 0.25))
        # kalimba riff on 8ths in the full sections
        if full and s % 2 == 0:
            riff = LEAD2 if b >= drop2 else LEAD
            m = riff[(s//2) + 8*(b % 2)]
            if m: addm(kalimba(m, 0.95), ts + swing, pan=0.35 if (s//2) % 2 else -0.35)
    # pad bed
    addm(pad(voicing, BAR + 0.05, bright=1500 if (intro or brk) else 2600, amp=1.3 if brk else 1.0), t0)
    # snare-roll builds into each drop
    if b == break_bar or b == drop2 - 1:
        for k in range(12):
            frac = k/12; tt = t0 + frac*3*BEAT
            add(DRUMS, clap(0.35 + 0.65*frac), tt)
            if k % 2: add(DRUMS, clap(0.2 + 0.5*frac), tt + STEP*0.5)

# risers
addm(noise_riser(BAR - BEAT), bar_t(break_bar), 1.0)
addm(noise_riser(2*BAR - BEAT), bar_t(drop2 - 2), 1.2)
# impacts
for db, big in ((drop1, 0.8), (drop2, 1.2)):
    add(FX, crash(big), bar_t(db)); add(FX, sub_boom(big), bar_t(db))
addm(brass([60, 64, 67, 72], 1.2), bar_t(drop2)); addm(brass([59, 62, 67, 74], 0.9), bar_t(drop2) + 6*STEP)
addm(brass([60, 64, 67, 72], 1.0), bar_t(drop2) + 10*STEP, 0.8)
for k, m in enumerate([72, 76, 79, 84, 88]): addm(kalimba(m, 0.7, 1.4), bar_t(drop2) + k*0.04)
# whooshes on scene changes
for tm in (S['q2']['start'] - 0.35, S['q4']['start'] - 0.35, S['o1']['start'] - 0.6):
    add(FX, whoosh(0.55, 1.0), tm)
# final hit on the logo
fh = bar_t(end_bar)
add(DRUMS, kick(1.0), fh); add(FX, crash(1.0), fh); add(FX, sub_boom(0.9), fh)
addm(brass([48, 60, 64, 67, 72], 1.1, 1.6), fh); addm(pad([60, 64, 67, 71, 76], DUR - fh, 3000, 1.6), fh)
for k, m in enumerate([84, 88, 91, 96]): addm(kalimba(m, 0.6, 2.0), fh + 0.05 + k*0.06)

# ---------------------------------------------------------------- bus processing
t_axis = np.arange(N)/SR
# intro filter opening (first 2 bars) + build filter dip/rise
def sweep(x, f_of_t):
    out = np.zeros_like(x); ch = 1024
    zi = None
    for i in range(0, len(x), ch):
        b, a = signal.butter(2, min(f_of_t(i/SR), 20000)/(SR/2))
        if zi is None: zi = signal.lfilter_zi(b, a) * 0
        out[i:i+ch], zi = signal.lfilter(b, a, x[i:i+ch], zi=zi)
    return out
def cutoff(tt):
    if tt < 2*BAR: return 600 * (30 ** (tt/(2*BAR)))          # 600 Hz → 18 kHz
    if bar_t(fog0) <= tt < bar_t(drop2):                        # build: dip then open
        p = (tt - bar_t(fog0)) / (bar_t(drop2) - bar_t(fog0)); return 1500 * (12 ** p)
    if bar_t(break_bar) <= tt < bar_t(drop1): return 1800
    return 20000
DRUMS = sweep(DRUMS, cutoff)
MUS = np.stack([sweep(MUS[0], cutoff), sweep(MUS[1], cutoff)])
BASS = sweep(BASS, lambda tt: min(cutoff(tt), 20000))

# sidechain pump from the kick grid (vibrant "breathing")
pump = np.ones(N)
for b in range(end_bar):
    for q in range(4):
        i = t_(bar_t(b) + q*BEAT); n = t_(BEAT*0.9)
        seg = 1 - 0.45*np.exp(-np.linspace(0, 1, n)*6)
        pump[i:i+n] = np.minimum(pump[i:i+n], seg[:max(0, min(n, N - i))])
MUS *= pump; BASS *= 0.6 + 0.4*pump

clap_verb = reverb(DRUMS, 0.9, 5) * 0.35
L = DRUMS + clap_verb + BASS + MUS[0] + reverb(MUS[0], 1.4, 1)*0.5 + FX
R = DRUMS + clap_verb + BASS + MUS[1] + reverb(MUS[1], 1.4, 2)*0.5 + FX
L, R = hp(L, 28), hp(R, 28)
# glue: soft clip
gain = 1.0 / max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(L*gain*1.6)/np.tanh(1.6), np.tanh(R*gain*1.6)/np.tanh(1.6)

# ---------------------------------------------------------------- voice
v, vsr = sf.read(B + '/voice_raw.wav')
v = signal.resample_poly(v, SR, vsr)
v = hp(v, 90)
v = v + 0.2*lp(v, 250) + 0.3*hp(lp(v, 6000), 2800)        # warmth + presence for clarity over the beat
env = signal.lfilter([0.003], [1, -0.997], np.abs(v))
g = 1/(1 + np.maximum(0, env/(np.percentile(env, 90) + 1e-9) - 0.5)*0.8)
v = v * g; v = v / np.abs(v).max() * 0.62
vv = np.zeros(N); vv[:min(N, len(v))] = v[:N]
VL = vv + reverb(vv, 0.7, 3, 0.012)*0.35; VR = vv + reverb(vv, 0.7, 4, 0.017)*0.35

# ducking: music (mainly mids) dips under the voice
ve = signal.lfilter([0.002], [1, -0.998], np.abs(vv))
duck = 1 - 0.62*np.clip(ve/(np.percentile(ve[ve > 1e-4], 60) + 1e-9), 0, 1)
fade = np.ones(N); f = t_(1.4); fade[-f:] = np.linspace(1, 0, f)**1.5
L *= duck*fade*0.55; R *= duck*fade*0.55

mL, mR = L + VL, R + VR
peak = max(np.abs(mL).max(), np.abs(mR).max())
sf.write(B + '/mix.wav', (np.stack([mL, mR], 1)/peak*0.9).astype(np.float32), SR)

# step cues for the video: one footstep per beat during "chaque petit pas… objectif"
first = np.ceil((S['q2']['start'] + 0.1)/BEAT)*BEAT
steps = [first + k*BEAT for k in range(7)]
json.dump(dict(duration=DUR, steps=steps, beat=BEAT, bar=BAR, drop1=bar_t(drop1), drop2=bar_t(drop2),
               break_t=bar_t(break_bar), final=fh), open(B + '/cues.json', 'w'))
print('ok', round(DUR, 2), 'steps', [round(s, 2) for s in steps])
