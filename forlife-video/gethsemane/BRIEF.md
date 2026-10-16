# Gethsémané — habillage motion design d'un face caméra

- Source : vidéo face caméra de Kouadio Koffi Élisée (480×856, 79 s, sous-titres déjà incrustés).
- Master : 1080×1920, 30 i/s, 95,5 s. Version légère WhatsApp 720 px.
- Style : éditorial clair et chic, fond crème `#F4EDE2`, encre brun `#2D1C14`, or `#B4842C` / filets `#D9AC4E`,
  Playfair Display + Inter. Plaques blanches arrondies, ressorts amortis, texte qui monte en masque.
- Étalonnage : désaturation du voile pêche, contraste, peau réchauffée, piqué, vignette légère, grain fin (`encode.sh`).
- Structure : intro voix off 0–5,2 s → ouverture du cadre → vidéo (titres calés sur la parole) → fermeture → carton final voix off.
- Voix off : edge-tts `fr-FR-RemyMultilingualNeural` (`tts.py`). ElevenLabs à court de crédits au moment du montage.
- Musique : nappe Ré majeur 60 BPM + cloches synthétisées (`audio.py`), aucune piste tierce. −14 LUFS.

## Faits affichés (tous tirés des paroles de la vidéo)
- « 2 spéciaux Gethsémané en présentiel »
- Vendredi 10/07, N'Zuessi à Yamoussoukro ; le vendredi de la semaine suivante, côté Coco à Bouaké
  (affiché « Vendredi suivant » : la date exacte n'est pas dite)
- Élan de solidarité pour les frères et sœurs en période de deuil ; « peu importe le montant »
- Le numéro de dépôt n'est pas lisible dans la vidéo : il n'est pas affiché.

## Rebuild
    python3 render.py stills 4 30 90     # vérifier
    python3 audio.py <source.mp4>
    python3 render.py all
    ./encode.sh <source.mp4>
