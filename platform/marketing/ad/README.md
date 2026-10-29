# Publicité Forlife Com (Remotion)

Vidéo de 27,6 s, en vertical 1080×1920 (TikTok, Reels, statuts WhatsApp) et en paysage 1920×1080 (YouTube, Facebook).
Problème → solution → fonctionnalités → appel à l'action, sur une musique afrobeat originale (112 BPM).

- `audio/afrobeat.py` : musique et effets synthétisés (numpy), calés sur les scènes ; aucun échantillon sous droits.
- `audio/voix.txt` : texte de la voix off (synthèse Piper, voix française « siwis »), `audio/mix.sh` : placement de la voix,
  atténuation automatique de la musique sous la voix, normalisation à -14 LUFS.
- `public/soundtrack.mp3` : bande-son finale ; `public/fonts` : Poppins (SIL Open Font License).
- `src/timing.ts` : temps de chaque scène (en temps musicaux) et de chaque phrase de la voix.

Rendu : `npm install`, puis `npm run render:vertical` et `npm run render:landscape`
(variable `REMOTION_CHROME` pour utiliser un Chromium déjà installé).
