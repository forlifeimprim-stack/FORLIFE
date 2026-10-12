# Original score + sound design + voice processing + mix, all synthesized.
import sys, json, numpy as np, soundfile as sf
from scipy import signal

B = sys.argv[1]
SR = 48000
T = json.load(open(B + '/timings.json'))
S = {s['id']: s for s in T['segs']}
DUR = S['o1']['end'] + 3.6
N = int(DUR * SR)
rng = np.random.default_rng(7)

def t_(sec): return int(sec * SR)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def env_adsr(n, a, d, s, r):
    a, d, r = int(a*SR), int(d*SR), int(r*SR)
    e = np.ones(n) * s
    e[:a] = np.linspace(0, 1, a) if a else e[:a]
    e[a:a+d] = np.linspace(1, s, len(e[a:a+d]))
    if r: e[-r:] *= np.linspace(1, 0, r)
    return e

def add(buf, x, start):
    i = t_(start)
    if i >= len(buf): return
    x = x[:len(buf) - i]
    buf[i:i+len(x)] += x

def reverb(x, sec=2.8, seed=0, pre=0.02):
    n = int(sec * SR); r = np.random.default_rng(seed)
    ir = r.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = np.concatenate([np.zeros(int(pre*SR)), ir])
    b, a = signal.butter(1, 5000 / (SR/2)); ir = signal.lfilter(b, a, ir)
    y = signal.fftconvolve(x, ir)[:len(x)]
    return y / (np.abs(ir).sum() ** 0.5 * 4)

def lp(x, f, o=2): b, a = signal.butter(o, f/(SR/2)); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f/(SR/2), 'high'); return signal.lfilter(b, a, x)

# ---------- instruments ----------
def pad(notes, dur, bright=1800, amp=0.06):
    n = t_(dur); t = np.arange(n)/SR; y = np.zeros(n)
    for m in notes:
        for det in (-0.08, 0.0, 0.07):
            f = hz(m) * 2 ** (det/12)
            ph = rng.uniform(0, 2*np.pi)
            # soft saw from a few harmonics
            for h in range(1, 7):
                y += np.sin(2*np.pi*f*h*t + ph*h) / h**1.4
    y = lp(y, bright) * env_adsr(n, min(2.0, dur/3), 0.5, 0.9, min(2.0, dur/3))
    lfo = 1 + 0.15*np.sin(2*np.pi*0.18*t)
    return y * lfo * amp / len(notes)

def piano(m, dur=3.0, amp=0.18):
    n = t_(dur); t = np.arange(n)/SR; f = hz(m); y = np.zeros(n)
    for h, a in zip(range(1, 8), (1, .5, .28, .16, .1, .06, .04)):
        y += a * np.sin(2*np.pi*f*h*1.0007**h*t) * np.exp(-t*(1.6 + h*0.9))
    y *= np.minimum(1, t/0.004)
    return y * amp

def pluck(m, dur=1.2, amp=0.16):
    n = t_(dur); t = np.arange(n)/SR; f = hz(m)
    y = (np.sin(2*np.pi*f*t) + 0.35*np.sin(4*np.pi*f*t) + 0.12*np.sin(6*np.pi*f*t)) * np.exp(-t*5)
    return y * np.minimum(1, t/0.002) * amp

def kick(amp=0.5, low=48):
    n = t_(0.9); t = np.arange(n)/SR
    f = low + 110*np.exp(-t*30)
    ph = 2*np.pi*np.cumsum(f)/SR
    return np.sin(ph) * np.exp(-t*5.5) * amp

def heartbeat(amp=0.22):
    a = kick(amp, 45); b = kick(amp*0.6, 45)
    y = np.zeros(t_(0.9)); y[:len(a)] += a
    o = t_(0.22); y[o:] += b[:len(y)-o]
    return lp(y, 180)

def noise_riser(dur, amp=0.12):
    n = t_(dur); x = rng.standard_normal(n); out = np.zeros(n)
    # sweep a bandpass upward in chunks
    ch = 1024
    for i in range(0, n, ch):
        p = i/n; fc = 300 + 7000*p**2
        b, a = signal.butter(2, [fc*0.7/(SR/2), min(fc*1.3, 20000)/(SR/2)], 'band')
        out[i:i+ch] = signal.lfilter(b, a, x[i:i+ch])
    return out * np.linspace(0, 1, n)**2.2 * amp * 4

def whoosh(dur=0.7, amp=0.07):
    n = t_(dur); x = rng.standard_normal(n); out = np.zeros(n); ch = 512
    for i in range(0, n, ch):
        p = i/n; fc = 400 + 3000*np.sin(np.pi*p)
        b, a = signal.butter(2, [fc*0.6/(SR/2), fc*1.4/(SR/2)], 'band')
        out[i:i+ch] = signal.lfilter(b, a, x[i:i+ch])
    return out * np.sin(np.pi*np.linspace(0, 1, n))**2 * amp * 3

def shimmer(dur=4.0, amp=0.05):
    y = np.zeros(t_(dur))
    for k, m in enumerate([84, 88, 91, 96, 100, 103]):
        p = pluck(m, 2.5, amp); add(y, p, k*0.07)
    return y

# ---------- score ----------
L = np.zeros(N); R = np.zeros(N)
def addst(x, start, pan=0.0):
    add(L, x*np.sqrt((1-pan)/2)*1.41, start); add(R, x*np.sqrt((1+pan)/2)*1.41, start)

drop = S['t1']['start']          # "Ose commencer" impact
q1 = S['q1']['start']
# Act 1: waiting (A minor, suspended, sparse)
addst(pad([45, 57, 60, 64, 71], q1 + 0.6, bright=1200, amp=0.07), 0)
for i, (m, tm) in enumerate([(76, 0.3), (72, 1.9), (69, 3.6), (71, 5.0), (64, 6.9)]):
    addst(piano(m, 3.5, 0.12), tm, pan=(-0.3 if i % 2 else 0.3))
# Act 2: the quote (F – C – G, progression moving forward)
chords = [([41, 53, 57, 60, 64], q1), ([48, 55, 60, 64, 67], S['q2']['start']),
          ([43, 55, 59, 62, 67], S['q4']['start'])]
ends = [S['q2']['start'], S['q4']['start'], drop - 0.3]
for (notes, st), en in zip(chords, ends):
    addst(pad(notes, en - st + 1.2, bright=1700, amp=0.075), st - 0.2)
# heartbeat pulse from the quote until the drop
bpm = 66; beat = 60/bpm; tt = q1
while tt < drop - 1.2:
    addst(heartbeat(0.2 if tt < S['q4']['start'] else 0.26), tt); tt += beat
# the steps: one rising note per footstep (shared cue logic with video)
steps = np.linspace(S['q2']['start'] + 0.15, S['q3']['end'] - 0.1, 7)
for i, st in enumerate(steps):
    addst(pluck([60, 62, 64, 67, 69, 72, 76][i], 1.4, 0.14), st, pan=-0.5 + i/6)
# fog section: gentle high arpeggio
for i, st in enumerate(np.arange(S['q4']['start'], drop - 1.0, beat/2)):
    addst(pluck([79, 83, 86, 83][i % 4], 0.8, 0.045), st, pan=(0.4 if i % 2 else -0.4))
# riser into the drop, then a breath of silence
r = noise_riser(drop - 0.25 - (S['q5']['start'] + 0.8)); addst(r, S['q5']['start'] + 0.8)
# Act 3: impact – C major, open and bright
addst(kick(0.75, 42), drop); addst(lp(rng.standard_normal(t_(1.5)) * np.exp(-np.linspace(0, 9, t_(1.5))), 6000)*0.08, drop)
addst(pad([36, 48, 55, 60, 64, 67, 71, 76], DUR - drop, bright=3200, amp=0.11), drop - 0.05)
for i, m in enumerate([60, 64, 67, 72, 76]): addst(piano(m, 4.0, 0.11), drop + i*0.05)
addst(shimmer(4, 0.05), drop + 0.1)
# outro: logo chime + final low note
addst(shimmer(4, 0.045), S['o1']['start'] - 0.2)
addst(piano(48, 5, 0.14), S['o1']['start'] - 0.2); addst(piano(72, 5, 0.08), S['o1']['start'] - 0.2)
# transitions
for tm in (q1 - 0.45, S['q2']['start'] - 0.4, S['q4']['start'] - 0.4, S['o1']['start'] - 0.55):
    addst(whoosh(0.7, 0.06), tm)

# reverb on the music bus
L = L + reverb(L, 3.2, 1)*1.2; R = R + reverb(R, 3.2, 2)*1.2
L = hp(L, 30); R = hp(R, 30)
# master fade
fade = np.ones(N); f = t_(1.6); fade[-f:] = np.linspace(1, 0, f) ** 1.5
fi = t_(0.4); fade[:fi] = np.linspace(0, 1, fi)

# ---------- voice ----------
v, vsr = sf.read(B + '/voice_raw.wav')
v = signal.resample_poly(v, SR, vsr)
v = hp(v, 85)
# warmth + presence (gentle shelving via parallel filters)
v = v + 0.25*lp(v, 250) + 0.18*hp(lp(v, 5000), 2500)
# soft compression
env = signal.lfilter([0.002], [1, -0.998], np.abs(v))
g = 1/(1 + np.maximum(0, env/ (np.percentile(env, 90)+1e-9) - 0.6)*0.6)
v = v * g
v = v / np.abs(v).max() * 0.6
vv = np.zeros(N); vv[:min(N, len(v))] = v[:N]
vrL = reverb(vv, 0.9, 3, 0.012); vrR = reverb(vv, 0.9, 4, 0.017)
VL = vv + vrL*0.55; VR = vv + vrR*0.55

# ducking: music down while voice is speaking
ve = signal.lfilter([0.0005], [1, -0.9995], np.abs(vv))
duck = 1 - 0.55*np.clip(ve/(np.percentile(ve[ve > 0], 70)+1e-9), 0, 1)
L *= duck*fade; R *= duck*fade

mL = L*0.9 + VL; mR = R*0.9 + VR
peak = max(np.abs(mL).max(), np.abs(mR).max())
mix = np.stack([mL, mR], 1) / peak * 0.89
sf.write(B + '/mix.wav', mix.astype(np.float32), SR)
json.dump(dict(duration=DUR, steps=list(map(float, steps)), beat=beat), open(B + '/cues.json', 'w'))
print('ok', DUR)
