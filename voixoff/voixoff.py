"""Voix off clonée : texte -> Kokoro (FR) -> ajustement de hauteur -> kNN-VC (timbre de la référence)."""
import argparse, re, sys, numpy as np, soundfile as sf, librosa, torch
p = argparse.ArgumentParser()
p.add_argument("texte"); p.add_argument("sortie")
p.add_argument("--ref", required=True); p.add_argument("--models", required=True); p.add_argument("--knn", required=True)
p.add_argument("--vitesse", type=float, default=0.92); p.add_argument("--topk", type=int, default=4)
p.add_argument("--decalage", type=float, default=0, help="décalage de hauteur en demi-tons avant conversion (0 = aucun, recommandé)")
a = p.parse_args()
sys.path.insert(0, a.knn)
from kokoro_onnx import Kokoro
torch.set_num_threads(4)

texte = open(a.texte, encoding="utf-8").read().strip()
paras = [x.strip() for x in re.split(r"\n\s*\n", texte) if x.strip()]
k = Kokoro(f"{a.models}/kokoro-v1.0.onnx", f"{a.models}/voices-v1.0.bin")
segs = []
for para in paras:
    phrases = re.split(r"(?<=[.!?…:;])\s+", para.replace("\n", " "))
    for ph in phrases:
        ph = ph.replace("«", "").replace("»", "").strip()
        if not re.search(r"\w", ph): continue
        wav, sr = k.create(ph, voice="ff_siwis", speed=a.vitesse, lang="fr-fr")
        segs.append(("voix", wav)); pause = 0.6 if ph.rstrip()[-1:] in ".!?…" else 0.3
        segs.append(("pause", pause))
    segs.append(("pause", 1.0))
brut = np.concatenate([w if t == "voix" else np.zeros(int(sr*w), dtype=np.float32) for t, w in segs])
sf.write(a.sortie.replace(".wav", "_synthese_brute.wav"), brut, sr)
voix = [librosa.resample(w, orig_sr=sr, target_sr=16000) for t, w in segs if t == "voix"]

ref, _ = librosa.load(a.ref, sr=16000)
if a.decalage:
    voix = [librosa.effects.pitch_shift(w, sr=16000, n_steps=a.decalage) for w in voix]

import hubconf
vc = hubconf.knn_vc(pretrained=True, prematched=True, device="cpu", progress=False)
# référence en morceaux de 30 s pour la VAD
chunks = [torch.tensor(ref[i:i+16000*30]).unsqueeze(0) for i in range(0, len(ref), 16000*30) if len(ref[i:i+16000*30]) > 16000]
import os
cache = a.ref + ".voix.pt"
if os.path.exists(cache): ms = torch.load(cache)
else: ms = vc.get_matching_set(chunks); torch.save(ms, cache)
print("matching set", ms.shape, flush=True)
out = []; it = iter(voix)
for t, w in segs:
    if t == "pause": out.append(np.zeros(int(16000*w), dtype=np.float32)); continue
    q = vc.get_features(torch.tensor(next(it)).unsqueeze(0))
    out.append(vc.match(q, ms, topk=a.topk).numpy().astype(np.float32))
y = np.concatenate(out)
sf.write(a.sortie, y, 16000)
print("ok", a.sortie, round(len(y)/16000, 1), "s")
