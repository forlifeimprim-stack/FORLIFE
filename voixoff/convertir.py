"""Convertit un fichier audio vers le timbre de la référence avec kNN-VC (découpe sur les silences)."""
import sys, argparse, numpy as np, soundfile as sf, librosa, torch
p = argparse.ArgumentParser(); p.add_argument("entree"); p.add_argument("sortie")
p.add_argument("--knn", default="knnvc_src"); p.add_argument("--ms", default="work/ref16k.wav.voix.pt"); p.add_argument("--topk", type=int, default=4)
a = p.parse_args()
sys.path.insert(0, a.knn); import hubconf
torch.set_num_threads(4)
vc = hubconf.knn_vc(pretrained=True, prematched=True, device="cpu", progress=False)
ms = torch.load(a.ms)
y, _ = librosa.load(a.entree, sr=16000)
iv = librosa.effects.split(y, top_db=40, frame_length=1024, hop_length=256)
out = np.zeros(0, dtype=np.float32); last = 0
# regroupe les zones parlées en blocs de <= 15 s
blocks = []; cur = None
for s, e in iv:
    if cur and (e - cur[0] > 16000*15 or s - cur[1] > 16000*0.35): blocks.append(cur); cur = None
    cur = [cur[0], e] if cur else [s, e]
if cur: blocks.append(cur)
for s, e in blocks:
    s = max(0, s - 800); e = min(len(y), e + 800)
    out = np.concatenate([out, np.zeros(s - last, dtype=np.float32)])
    q = vc.get_features(torch.tensor(y[s:e])[None])
    c = vc.match(q, ms, topk=a.topk).numpy().astype(np.float32)
    c = librosa.util.fix_length(c, size=e - s)
    out = np.concatenate([out, c]); last = e
out = np.concatenate([out, np.zeros(len(y) - last, dtype=np.float32)])
sf.write(a.sortie, out, 16000); print("ok", a.sortie)
