# Motion vidéo « L'adoration » — pipeline de montage

Sortie : `assets/videos/adoration-motion-1080x1920.mp4` (+ sous-titres `adoration-motion.fr.srt`).

Les scripts attendent un dossier de travail `S` (parent du dossier contenant les scripts) avec :
- `graded.mp4` : source upscalée 1080x1920 + étalonnage
  `ffmpeg -i source.mp4 -vf "hqdn3d=2:1.5:3:3,scale=1080:1920:flags=lanczos,cas=0.55,eq=contrast=1.07:saturation=1.12:gamma=0.98,colorbalance=rs=-0.03:bs=0.04:rh=0.04:bh=-0.03" -crf 10 -an graded.mp4`
- `fonts/ttf/` : Anton, Montserrat (Black/ExtraBold/Medium) — via @fontsource, convertis en TTF.
- `cap/strip.raw`, `a16.raw` : uniquement pour régénérer `captions.json` (`captions.py`).

Étapes :
1. `python3 render.py ../video_noaudio.mp4` — caméra virtuelle, sous-titres animés, titres cinétiques, particules, intro/outro.
2. `python3 audio.py source.mp4` — nettoyage voix (EQ, de-esser, compression) + SFX synthétisés en Do# mineur, -14 LUFS.
3. Mux : `ffmpeg -i video_noaudio.mp4 -i build/mix.wav -c:v libx264 -b:v 5300k -c:a aac out.mp4`

Le texte et le minutage sont dans `captions.json`, les mouvements de caméra et les mots-clés géants dans `timeline.py`.
