"""Rapproche une voix convertie de la référence : hauteur (WORLD) + empreinte spectrale (égalisation LTAS)."""
import argparse, numpy as np, soundfile as sf, librosa
from scipy import signal
p = argparse.ArgumentParser()
p.add_argument("entree"); p.add_argument("sortie"); p.add_argument("--ref", required=True)
p.add_argument("--hauteur", action="store_true", help="recaler la hauteur sur celle de la référence")
p.add_argument("--max_db", type=float, default=12)
a = p.parse_args()
sr = 16000
y, _ = librosa.load(a.entree, sr=sr); ref, _ = librosa.load(a.ref, sr=sr)

def f0_log(x):
    import pyworld as pw
    f0, t = pw.dio(x.astype(np.float64), sr, f0_floor=60, f0_ceil=400, frame_period=5)
    f0 = pw.stonemask(x.astype(np.float64), f0, t, sr)
    return f0, t

if a.hauteur:
    import pyworld as pw  # optionnel : pip install pyworld "setuptools<81"
    fr, _ = f0_log(ref[:sr*180]); lr = np.log(fr[fr > 0])
    x = y.astype(np.float64)
    f0, t = f0_log(y)
    sp = pw.cheaptrick(x, f0, t, sr); ap = pw.d4c(x, f0, t, sr)
    v = f0 > 0; ls = np.log(f0[v])
    nf0 = np.zeros_like(f0)
    nf0[v] = np.exp((ls - ls.mean()) / ls.std() * lr.std() + lr.mean())
    print(f"hauteur : {np.exp(ls.mean()):.0f} Hz -> {np.exp(lr.mean()):.0f} Hz, variation {ls.std():.3f} -> {lr.std():.3f}")
    y = pw.synthesize(nf0, sp, ap, sr, frame_period=5).astype(np.float32)[:len(y)]

def ltas(x):
    rms = librosa.feature.rms(y=x, frame_length=1024, hop_length=512)[0]
    S = np.abs(librosa.stft(x, n_fft=1024, hop_length=512))**2
    keep = rms > np.percentile(rms, 40)
    return S[:, keep[:S.shape[1]]].mean(1)
gain_db = 10*np.log10(ltas(ref) + 1e-12) - 10*np.log10(ltas(y) + 1e-12)
freqs = np.linspace(0, sr/2, len(gain_db))
# lissage en 1/3 d'octave
sm = np.array([gain_db[(freqs >= f/2**(1/6)) & (freqs <= f*2**(1/6))].mean() if f > 0 else gain_db[0] for f in freqs])
sm -= sm[(freqs > 200) & (freqs < 2000)].mean()
sm = np.clip(sm, -a.max_db, a.max_db)
fir = signal.firwin2(1023, freqs/(sr/2), 10**(sm/20))
y = signal.fftconvolve(y, fir, mode="same").astype(np.float32)
y *= 0.9/np.abs(y).max()
sf.write(a.sortie, y, sr)
print("égalisation (dB) 100/300/1k/3k/6k Hz :", [round(float(sm[np.argmin(abs(freqs-f))]), 1) for f in (100, 300, 1000, 3000, 6000)])
