# Voix off clonée (100 % gratuite, locale)

Pipeline : texte → **Kokoro** (synthèse française) → ajustement de hauteur vers la voix de référence → **kNN-VC** (conversion vers le timbre de la référence) → mastering ffmpeg.

## Modèles (GitHub releases)
- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
- https://github.com/bshall/knn-vc/releases/download/v0.1/WavLM-Large.pt
- https://github.com/bshall/knn-vc/releases/download/v0.1/prematch_g_02500000.pt
  (à placer dans `~/.cache/torch/hub/checkpoints/`)
- Code kNN-VC : `git clone https://github.com/bshall/knn-vc`

## Dépendances
`pip install torch==2.8.0 torchaudio==2.8.0 kokoro-onnx librosa soundfile`

## Utilisation
```bash
# référence : l'enregistrement de la voix (≈5 min), nettoyé en mono 16 kHz
ffmpeg -i voix.m4a -ac 1 -ar 16000 -af "highpass=f=70,afftdn=nr=10,loudnorm=I=-18" ref16k.wav
python voixoff.py texte.txt sortie.wav --ref ref16k.wav --models models --knn knn-vc
# mastering
ffmpeg -i sortie.wav -af "volume=-3dB,highpass=f=60,lowpass=f=7000,acompressor=threshold=-22dB:ratio=2:attack=15:release=200,loudnorm=I=-16:TP=-1.5:LRA=9" -ar 44100 -b:a 192k voixoff.mp3
```
Options : `--vitesse` (débit, défaut 0.92), `--topk` (lissage du timbre, défaut 4), `--decalage` (demi-tons avant conversion ; laisser à 0, un décalage fort crée un souffle).
L'enregistrement de la voix n'est pas versionné : le renvoyer à chaque nouvelle session.

## Ressemblance avec la voix de référence (recommandé)
Après `voixoff.py`, recaler la hauteur et l'empreinte spectrale sur l'enregistrement d'origine :
```bash
ffmpeg -i voix.m4a -ac 1 -ar 16000 ref_brut16k.wav
python ressemblance.py sortie.wav sortie_proche.wav --ref ref_brut16k.wav --hauteur
```
(`pip install pyworld scipy "setuptools<81"`). Pour le mastering, ne pas rajouter d'égalisation : seulement compression et loudnorm.
