"""Crée le profil vocal « FOR LIFE voix off » à partir de l'enregistrement de référence.
Produit dans le dossier profil : ref16k.wav (nettoyé, pour kNN-VC), ref_brut16k.wav (empreinte spectrale)
et voix.pt (ensemble de correspondance kNN-VC)."""
import argparse, os, subprocess, sys, torch, librosa
p = argparse.ArgumentParser(); p.add_argument("enregistrement"); p.add_argument("profil")
p.add_argument("--knn", required=True)
a = p.parse_args()
os.makedirs(a.profil, exist_ok=True)
ff = ["ffmpeg", "-v", "error", "-y", "-i", a.enregistrement, "-ac", "1", "-ar", "16000"]
subprocess.run(ff + ["-af", "highpass=f=70,afftdn=nr=10,loudnorm=I=-18", f"{a.profil}/ref16k.wav"], check=True)
subprocess.run(ff + [f"{a.profil}/ref_brut16k.wav"], check=True)
sys.path.insert(0, a.knn); import hubconf
torch.set_num_threads(os.cpu_count() or 4)
vc = hubconf.knn_vc(pretrained=True, prematched=True, device="cpu", progress=False)
ref, _ = librosa.load(f"{a.profil}/ref16k.wav", sr=16000)
# morceaux de 30 s pour la détection de parole
chunks = [torch.tensor(ref[i:i+16000*30])[None] for i in range(0, len(ref), 16000*30) if len(ref[i:i+16000*30]) > 16000]
ms = vc.get_matching_set(chunks)
torch.save(ms, f"{a.profil}/voix.pt")
print(f"profil créé : {a.profil} ({ms.shape[0]/50:.0f} s de voix utile)")
