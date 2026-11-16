# Films Forlife Com'

## noel-2026 — Promo Spécial Noël (t-shirts enfants), 34,5 s, 1080×1920, 60 i/s
- Fichiers : `noel.html` + `film.js` (moteur seek(t)), `cues.js` (repères), `render.js` (Playwright → ffmpeg), `audio.py` (musique + bruitages synthétisés en numpy).
- `assets/` (affiches et découpes rembg) et `out/` ne sont pas versionnés : remettre `affiche1.png` / `affiche2.png` dans `assets/` puis relancer `tools/cut.py`.
- Rendu : `node render.js part 0 34.5 out/film.mp4` ; planche : `node render.js probe 1 5 9 …`.
- Réutilisable : floods circulaires, guirlande/neige/boules sur canvas, révélation mot à mot, pastilles prix avec compteur, pilule téléphone chiffre par chiffre.
- Voix off : Sage Wright (ElevenLabs, eleven_v4), fichier `work/vo.mp3` non versionné ; `cues.js` contient les repères et le placement des phrases (`window.VO`), `audio.py` mixe voix + musique (musique baissée sous la voix, -14 LUFS).
