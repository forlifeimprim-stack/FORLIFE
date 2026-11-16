# Films Forlife Com'

## noel-2026 — Promo Spécial Noël (t-shirts enfants), 30 s, 1080×1920, 60 i/s
- Fichiers : `noel.html` + `film.js` (moteur seek(t)), `cues.js` (repères), `render.js` (Playwright → ffmpeg), `audio.py` (musique + bruitages synthétisés en numpy).
- `assets/` (affiches et découpes rembg) et `out/` ne sont pas versionnés : remettre `affiche1.png` / `affiche2.png` dans `assets/` puis relancer `tools/cut.py`.
- Rendu : `node render.js part 0 30 out/film.mp4` ; planche : `node render.js probe 1 5 9 …`.
- Réutilisable : floods circulaires, guirlande/neige/boules sur canvas, révélation mot à mot, pastilles prix avec compteur, pilule téléphone chiffre par chiffre.
- Voix off : prévue (Sage Wright, ElevenLabs), pas encore générée ; recaler `cues.js` sur la voix au moment de l'ajouter.
