---
name: agence-forlife
description: Chef d'orchestre de l'agence d'agents Forlife Com' — choisit quels agents spécialisés lancer (stratégie, community management, rédaction, direction artistique, graphisme, identité visuelle, illustration, photo/vidéo, montage, motion design, Meta Ads, SEO, relations presse, événementiel, formation, voix off, contrôle qualité), dans quel ordre, et assemble leurs livrables. À utiliser pour toute demande de communication qui touche plus d'un métier, ou quand on ne sait pas quel agent appeler.
---

# Agence Forlife — orchestration

Les agents vivent dans `.claude/agents/`. Les lancer avec l'outil **Agent** (`subagent_type` = nom de l'agent).
Les agents ne peuvent pas lancer d'autres agents : **c'est la session principale qui orchestre** avec ce skill.
Lancer en parallèle (un seul message, plusieurs appels Agent) tout ce qui ne dépend pas d'un autre résultat.

## L'équipe

Chaque agent a un prénom ivoirien : l'utilisateur peut dire « demande à Awa », « Aya, fais le flyer » —
retrouver l'agent par le prénom (début de l'identifiant).

| Pôle | Agent | Appeler pour |
|---|---|---|
| Direction | `yao-directeur-creation` | Grande idée, concept de campagne, arbitrage créatif, validation finale |
| | `adjoua-chef-de-projet` | Brief, planning, devis, suivi client, comptes rendus, relances |
| | `souleymane-business-developer` | Prospection, propositions commerciales, offres packagées |
| Stratégie | `gnamien-strategiste-marketing` | Plan marketing, positionnement, personas, plan de campagne 360° |
| | `lacina-media-buyer` | Meta Ads / TikTok Ads : structure, ciblage, budget FCFA, tests, optimisation |
| | `affoue-analyste-performance` | Rapports mensuels, KPIs, audits de comptes, recommandations |
| | `ahou-redacteur-seo` | Articles de blog, SEO local, fiches Google Business, visibilité IA |
| Contenu | `awa-community-manager` | Ligne éditoriale, calendrier, posts, réponses, modération, crise |
| | `zadi-concepteur-redacteur` | Accroches, slogans, textes d'affiche, scripts vidéo/radio, légendes |
| | `akissi-relations-presse-evenementiel` | Communiqués, plan de com d'événement, scénographie, discours |
| | `tanoh-formateur` | Ateliers (réseaux sociaux, Canva, Meta Ads), supports, exercices |
| Création | `amenan-directeur-artistique` | Pistes graphiques, moodboards, direction photo/vidéo, cohérence visuelle |
| | `kouame-designer-identite` | Logos, chartes graphiques, déclinaisons, brand books |
| | `aya-graphiste` | Affiches, flyers, posts, carrousels, bâches, roll-up, faire-parts, DTF (fichiers finis) |
| | `mariam-designer-web-ui` | Landing pages, sites, maquettes, pages du site Forlife |
| | `gnaore-illustrateur` | Illustrations, mascottes, icônes, BD, dessins vectoriels |
| | `kady-prompt-engineer-visuel` | Images et vidéos générées par IA (prompts, cohérence, représentation juste) |
| Audiovisuel | `tiemoko-realisateur-photo-video` | Préproduction : concept de film, storyboard, liste de plans, plan de tournage, drone, shooting |
| | `brou-monteur-video` | Montage, sous-titres, reels/shorts depuis des rushs, étalonnage, export |
| | `djeneba-motion-designer` | Animations, logos animés, typographie animée, promos graphiques MP4 |
| | `sery-sound-designer-voix-off` | Voix off (voix FOR LIFE), spots radio, musique et sons, mixage |
| Qualité | `bintou-brand-guardian` | Relecture finale : charte, orthographe, cohérence, specs techniques, droits, légal |

## Circuits types (ordre et parallélisme)

**Nouveau projet** : `brief-creatif` (skill) → `adjoua-chef-de-projet` (planning) → circuit ci-dessous → `bintou-brand-guardian` → livraison.

1. **Campagne 360°** (lancement, rentrée, événement) :
   `gnamien-strategiste-marketing` → `yao-directeur-creation` (concept) → en parallèle {`zadi-concepteur-redacteur`, `amenan-directeur-artistique`}
   → en parallèle {`aya-graphiste`, `djeneba-motion-designer`, `awa-community-manager` (calendrier), `lacina-media-buyer` (plan média)}
   → `bintou-brand-guardian`.
2. **Mois de community management** : `awa-community-manager` (calendrier + textes) → en parallèle {`aya-graphiste` (visuels),
   `djeneba-motion-designer` ou `brou-monteur-video` (reels)} → `bintou-brand-guardian` → validation client → programmation.
3. **Identité visuelle** : `gnamien-strategiste-marketing` (positionnement court) → `kouame-designer-identite` (3 pistes) →
   choix client → `kouame-designer-identite` (charte) → `aya-graphiste` (papeterie, déclinaisons) → `bintou-brand-guardian`.
4. **Vidéo tournée** : `zadi-concepteur-redacteur` (script) → `tiemoko-realisateur-photo-video` (storyboard, plan de tournage) →
   tournage humain → `brou-monteur-video` (+ `djeneba-motion-designer` habillage, `sery-sound-designer-voix-off`) → `bintou-brand-guardian`.
5. **Vidéo sans tournage** : `zadi-concepteur-redacteur` → `sery-sound-designer-voix-off` (voix) → `djeneba-motion-designer` → `bintou-brand-guardian`.
6. **Événement (école, église, entreprise)** : `akissi-relations-presse-evenementiel` (plan + rétroplanning) → `aya-graphiste`
   (invitations, affiches, banderoles, tee-shirts DTF) + `awa-community-manager` (annonces) + `tiemoko-realisateur-photo-video` (couverture)
   → après l'événement `brou-monteur-video` (aftermovie) + `awa-community-manager` (remerciements).
7. **Publicité Meta** : `lacina-media-buyer` (structure + audiences) + `zadi-concepteur-redacteur` (3 angles × 3 textes) +
   `aya-graphiste`/`djeneba-motion-designer` (créas 4:5 et 9:16) → `bintou-brand-guardian` → validation budget par l'utilisateur.
8. **Offre commerciale / prospection** : `souleymane-business-developer` → `aya-graphiste` (mise en page PDF) → `bintou-brand-guardian`.

## Règles d'orchestration

- Donner à chaque agent : le chemin du brief, le chemin de la charte, ce qu'il doit livrer, où l'écrire, et l'échéance.
  Les agents ne voient pas la conversation : leur prompt doit se suffire à lui-même.
- Un agent = un livrable clair. Pour 12 visuels, lancer plusieurs `aya-graphiste` en parallèle (4 visuels chacun).
- Regarder les livrables visuels (Read sur les PNG) avant de les présenter. Toujours finir par `bintou-brand-guardian`.
- Ne rien publier, envoyer au client, ni dépenser de budget publicitaire sans « oui » explicite de l'utilisateur.
- Long travail (vidéo longue, voix off longue) : produire d'abord un extrait court et le faire valider.
- Résumer à l'utilisateur : ce qui a été produit (chemins), ce qui attend sa validation, les questions ouvertes.

## Ressources partagées

- Marque Forlife : `agence/contexte/brand-profile.md` · marché : skill `contexte-ivoirien`
- Production : skills `visuel-studio` (images, PDF), `motion-studio` (animations MP4), `short-editing` & co (montage),
  voix off `voixoff/forlife_voixoff.sh`
- Bibliothèque de méthodes : skill `bibliotheque-agence` (85 guides marketing, réseaux sociaux, vidéo, design)
- Modèles de documents : `agence/modeles/`
- Connecteurs disponibles selon la session : Figma (design), ElevenLabs (images, vidéo, voix, musique),
  Motion Creative Analytics (performance des pubs Meta), TikTok for Business, Google Drive, Gmail, Notion.
