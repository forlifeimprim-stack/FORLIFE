# Consignes pour Claude

## Voix off : « FOR LIFE voix off »

Toute demande de voix off, de lecture audio, de livre audio ou de narration se fait par défaut avec la voix
**« FOR LIFE voix off »** : la voix clonée de Kouadio Koffi Elisée, validée par lui le 27/10/2026.

```bash
bash voixoff/forlife_voixoff.sh texte.txt sortie.mp3        # vitesse par défaut 1.08 (son débit naturel)
bash voixoff/forlife_voixoff.sh texte.txt sortie.mp3 0.98   # plus posé (contes, méditations)
```

- Première utilisation d'une session : le script installe tout seul (≈ 40 min, ~4 Go via PyPI et les
  releases GitHub). Huggingface.co n'est pas nécessaire.
- L'enregistrement de référence n'est **pas** dans ce dépôt public (c'est la voix d'une personne). Le
  demander à l'utilisateur s'il n'est pas fourni, puis lancer avec `FORLIFE_VOIX=/chemin/voix.m4a`.
- Préparer le texte : nombres et sigles écrits en toutes lettres, phrases courtes, une ligne vide entre
  les paragraphes (pause plus longue), titres sur leur propre paragraphe.
- Avant une longue production, envoyer d'abord un extrait court à l'utilisateur pour validation.
- Réglages figés (ne pas modifier sans accord) : Supertonic 3 voix 9, 16 étapes, kNN-VC topk 4,
  empreinte spectrale sans recalage de hauteur, mastering -16 LUFS. Détails dans `voixoff/README.md`.
