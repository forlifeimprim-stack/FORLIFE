# Motion design — Motivation #01 « Ose commencer »

Vidéo verticale 1080×1920 (Reels / TikTok / Stories / Shorts), 30 i/s, environ 32 s.
Résultat : `assets/videos/motivation-01-ose-commencer.mp4`

Source : onglet « Motivations » n° 1 de la bibliothèque de contenus Forlife Com.

## Concept
Le point orange du logo Forlife joue le « premier pas » d'un bout à l'autre :
1. **L'attente** : un point, un spinner de chargement, une checklist jamais cochée, une barre bloquée à 99 %.
2. **La citation** : « N'attends pas que tout soit parfait pour commencer. » Le mot « parfait » est barré, et le point devient le point final de « commencer. ».
3. **Les petits pas** : le point grimpe un escalier (essayer, douter, apprendre, corriger, oser, progresser) jusqu'à l'objectif.
4. **Le brouillard** : le texte reste flou tant que la lumière du point ne l'a pas atteint (« même lorsque tout n'est pas encore clair »).
5. **Le déclic** : « OSE COMMENCER. » arrive en explosion.
6. **La signature** : le point reprend sa place dans le F du logo Forlife Com.

## Régénérer
Prérequis : `pip install kokoro-onnx soundfile scipy numpy pillow fonttools`, ffmpeg,
les modèles Kokoro (`kokoro-v1.0.onnx`, `voices-v1.0.bin`, publiés sur github.com/thewh1teagle/kokoro-onnx)
et la police Poppins en TTF dans `fonts/` (fichiers `Poppins-<graisse>-<style>.ttf`).

```bash
python3 voice.py <dossier_modeles> build   # voix off (Kokoro, voix française ff_siwis) + timings.json
python3 audio.py build                     # musique originale synthétisée, bruitages, mixage
python3 render.py video build/out.mp4      # animation + encodage final
```
