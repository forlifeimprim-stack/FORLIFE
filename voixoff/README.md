# FOR LIFE voix off

Voix off gratuite et locale qui lit n'importe quel texte avec la voix clonée de Kouadio Koffi Elisée.

```bash
bash voixoff/forlife_voixoff.sh texte.txt sortie.mp3 [vitesse=1.08]
```

Le script installe ce qui manque (`installer.sh`), crée le profil vocal à partir de l'enregistrement de
référence, puis enchaîne les 4 étapes ci-dessous. Tout est rangé dans `$FORLIFE_VOIXOFF_HOME`
(par défaut `~/.forlife-voixoff`).

## Enregistrement de référence
Il n'est pas versionné : ce dépôt est public et l'enregistrement permettrait à n'importe qui de cloner la voix.
Le fournir via `FORLIFE_VOIX=/chemin/voix.m4a`, ou le déposer dans `voixoff/voix/` d'une copie privée.
Idéal : 3 à 6 minutes de lecture à voix haute, pièce calme.

## Chaîne (réglages validés le 27/10/2026)
1. `voixoff2.py` : le texte est lu par **Supertonic 3** (multilingue, `lang=fr`), voix 9 : la voix masculine
   la plus proche de la référence selon un modèle de reconnaissance du locuteur. Vitesse 1.08, 16 étapes.
2. `convertir.py` : **kNN-VC** (WavLM-Large + HiFiGAN « prematched ») remplace le timbre par celui de la
   référence, bloc par bloc entre les silences, topk 4.
3. `ressemblance.py` : égalisation qui reproduit l'empreinte spectrale de l'enregistrement d'origine.
   (`--hauteur` recale aussi la hauteur via WORLD, mais ajoute un effet robot : non utilisé.)
4. Mastering ffmpeg : passe-haut 55 Hz, compression douce, -16 LUFS, MP3 160 kbit/s.

## Outils de contrôle
- `classement.py fichiers.wav…` : similarité de locuteur avec la référence (modèles de reconnaissance du
  locuteur des releases `speaker-recongition-models` de k2-fsa/sherpa-onnx). La référence contre elle-même
  donne ≈ 0.92 (eres2net) ; la voix off validée ≈ 0.67-0.70.
- `transcrire.py` : transcription Whisper (`asr-models/sherpa-onnx-whisper-small`) pour vérifier
  l'intelligibilité.

## Modèles (tous téléchargés depuis les releases GitHub)
- Supertonic 3 : `k2-fsa/sherpa-onnx`, `tts-models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11.tar.bz2`
- kNN-VC : `bshall/knn-vc`, `v0.1/WavLM-Large.pt` et `v0.1/prematch_g_02500000.pt`

## Historique
`voixoff.py` est la première version (Kokoro + kNN-VC), remplacée car trop « synthétique ».
Pour aller plus loin (accent et intonation propres à la voix), il faudrait un modèle de clonage zero-shot
(XTTS-v2, F5-TTS français, Chatterbox multilingue), hébergé sur Hugging Face.
