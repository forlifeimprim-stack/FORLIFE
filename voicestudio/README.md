# VoiceStudio pour FOR LIFE

[VoiceStudio](https://github.com/debpalash/VoiceStudio) est un studio de voix IA open source qui tourne en local :
synthèse vocale dans plus de 600 langues, clonage de voix, voix « designées » (genre, âge, hauteur), doublage,
transcription.

## Lancer

```bash
bash voicestudio/demarrer.sh
```

Le script fait tout ce qui manque, dans l'ordre :

1. installe VoiceStudio dans `/opt/VoiceStudio` (déjà fait par le script de configuration de l'environnement « Forlife ») ;
2. démarre l'API (port 3900) et l'interface web (port 3901) ;
3. télécharge le modèle OmniVoice (3,3 Go, environ 2 minutes) s'il n'est pas là ;
4. accepte ses licences, comme validé par Kouadio Koffi Elisée le 15/11/2026.

Journaux : `/tmp/voicestudio/api.log` et `/tmp/voicestudio/web.log`.

## Utiliser l'API

```bash
# Voix designée (sans enregistrement)
curl -s -o sortie.wav http://127.0.0.1:3900/generate \
  -F 'text=Bonjour et bienvenue chez FOR LIFE.' -F language=fr \
  -F 'instruct=female, elderly, moderate pitch' -F seed=7

# Voix clonée à partir d'un enregistrement de 3 à 20 secondes et de son texte exact
curl -s -o sortie.wav http://127.0.0.1:3900/generate \
  -F 'text=Texte à dire.' -F language=fr \
  -F 'ref_audio=@reference.wav' -F 'ref_text=Texte exact de la référence.'
```

Documentation complète de l'API : `http://127.0.0.1:3900/openapi.json`.

## Repères

- **Licence du modèle OmniVoice : CC-BY-NC, usage non commercial.** Ne pas l'utiliser pour des livrables clients
  ou des contenus payants. Pour les voix off FOR LIFE, la voix par défaut reste « FOR LIFE voix off »
  (`voixoff/`).
- Voix préférée lors des essais du 15/11/2026 : **La Sage** (`female, elderly, moderate pitch`, graine 7).
- Pas d'accent africain disponible : les accents d'OmniVoice ne s'appliquent qu'à l'anglais. Langues africaines
  prises en charge : baoulé, dioula, wolof, lingala, swahili, yoruba, twi, entre autres.
- Sur processeur (sans carte graphique) : environ 20 secondes par phrase, 1 à 2 minutes pour la première
  (chargement du modèle).
- Réseau : l'environnement doit autoriser huggingface.co, ses CDN (`*.hf.co`) et download.pytorch.org. C'est déjà
  le cas de l'environnement « Forlife ».
- Si la session redémarre, les serveurs s'arrêtent : relancer `bash voicestudio/demarrer.sh`.
