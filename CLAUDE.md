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

## Agence d'agents créatifs

Ce dépôt contient l'agence d'agents de Forlife Com' (guide : `agence/README.md`).

- Demande de communication qui touche plusieurs métiers, ou agent à choisir : suivre le skill `agence-forlife`
  (22 agents dans `.claude/agents/`, chacun avec un prénom ivoirien — « Awa », « Aya », « Bintou »… — lancés avec
  l'outil Agent, en parallèle quand c'est possible). Un prénom cité par l'utilisateur désigne l'agent correspondant.
- **L'agence travaille pour ses clients, pas seulement pour Forlife.** Toujours établir pour quel client on produit ;
  sa charte (`clients/<client>/brand-profile.md`) prime. L'identité Forlife (orange, Poppins, logo) ne sert qu'aux travaux
  de Forlife elle-même. Client inconnu ou sans charte : le demander avant de créer.
- Nouveau projet ou client : skill `brief-creatif` d'abord. Marque Forlife : `agence/contexte/brand-profile.md`.
- Affiches ou visuels envoyés à étudier : skill `etude-affiches`. Avant toute création visuelle, les agents lisent la
  mémoire visuelle `agence/inspiration/grammaire-visuelle.md` (s'inspirer, jamais copier).
- Marché ivoirien (FCFA, WhatsApp, Mobile Money, calendrier, ARTCI) : skill `contexte-ivoirien`. Les guides de
  `agence/bibliotheque/` sont écrits pour la France ou les États-Unis : toujours les adapter.
- Fichiers finis : `visuel-studio` (PNG/PDF imprimeur) et `motion-studio` (MP4). Regarder chaque rendu avant de le livrer.
- Ne jamais inventer de prix (`agence/contexte/tarifs.md`, sinon « [à chiffrer] »), de chiffres ou de témoignages.
- Ne rien publier, envoyer ni dépenser (publicité) sans accord explicite de l'utilisateur.
- `clients/` et `projets/` ne sont pas versionnés (dépôt public, données personnelles) : ne pas forcer leur ajout.
- Dernière étape de tout livrable : agent `bintou-brand-guardian`.
