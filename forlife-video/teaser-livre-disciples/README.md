# Teaser — « Faire des disciples et des familles à l'image de Christ »

Teaser vertical 1080×1920, 52,5 s, 60 i/s, pour Reels / TikTok / statut WhatsApp / Facebook.

## Fabrication (100 % code, reproductible)
1. `python3 tools/tts.py audio/vo/lines.txt audio/vo fr-FR-HenriNeural -8% -5Hz` — voix off (voix neuronale Microsoft « Henri ») + horodatage des mots.
2. `python3 timeline.py` — place chaque réplique sur la grille 96 BPM et écrit `cues.js`.
3. `python3 audio.py` — musique originale (kalimba, djembé, tambour parlant, cordes, chœur), SFX, ducking, loudnorm −14 LUFS. Stems : `audio/music.wav`, `audio/sfx.wav`, `audio/vo.wav`.
4. `python3 -m http.server 8771` puis ouvrir `teaser.html` (Espace = lecture, ←/→ = image, R = rejouer).
5. `python3 render.py probe 1 2 3` / `draft` / `full A B tag` (3 morceaux en parallèle) puis assemblage (voir `finish.sh`).

## Sources
Tout le texte et les chiffres viennent du manuscrit (voir `facts.md`). Couverture, symboles adinkra et kente : fichiers du manuscrit.
Absent faute de données : prix, date de sortie, ISBN, contact de commande.
