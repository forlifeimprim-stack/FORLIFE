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
ffmpeg -i sortie.wav -af "volume=-3dB,highpass=f=60,equalizer=f=3000:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150,loudnorm=I=-16:TP=-1.5:LRA=9" -ar 44100 -b:a 192k voixoff.mp3
```
Options : `--vitesse` (débit, défaut 0.92), `--topk` (lissage du timbre, défaut 4), `--f0cible` (hauteur en Hz, sinon mesurée sur la référence).
L'enregistrement de la voix n'est pas versionné : le renvoyer à chaque nouvelle session.
