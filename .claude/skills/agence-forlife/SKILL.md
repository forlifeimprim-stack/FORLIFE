---
name: agence-forlife
description: Chef d'orchestre de l'agence d'agents Forlife Com' — choisit quels agents spécialisés lancer (stratégie, community management, rédaction, direction artistique, graphisme, identité visuelle, illustration, photo/vidéo, montage, motion design, Meta Ads, SEO, relations presse, événementiel, formation, voix off, contrôle qualité), dans quel ordre, et assemble leurs livrables. À utiliser pour toute demande de communication qui touche plus d'un métier, ou quand on ne sait pas quel agent appeler.
---

# Agence Forlife — orchestration

Les agents vivent dans `.claude/agents/`. Les lancer avec l'outil **Agent** (`subagent_type` = nom de l'agent).
Les agents ne peuvent pas lancer d'autres agents : **c'est la session principale qui orchestre** avec ce skill.
Lancer en parallèle (un seul message, plusieurs appels Agent) tout ce qui ne dépend pas d'un autre résultat.

## L'équipe

| Pôle | Agent | Appeler pour |
|---|---|---|
| Direction | `directeur-creation` | Grande idée, concept de campagne, arbitrage créatif, validation finale |
| | `chef-de-projet` | Brief, planning, devis, suivi client, comptes rendus, relances |
| | `business-developer` | Prospection, propositions commerciales, offres packagées |
| Stratégie | `strategiste-marketing` | Plan marketing, positionnement, personas, plan de campagne 360° |
| | `media-buyer` | Meta Ads / TikTok Ads : structure, ciblage, budget FCFA, tests, optimisation |
| | `analyste-performance` | Rapports mensuels, KPIs, audits de comptes, recommandations |
| | `redacteur-seo` | Articles de blog, SEO local, fiches Google Business, visibilité IA |
| Contenu | `community-manager` | Ligne éditoriale, calendrier, posts, réponses, modération, crise |
| | `concepteur-redacteur` | Accroches, slogans, textes d'affiche, scripts vidéo/radio, légendes |
| | `relations-presse-evenementiel` | Communiqués, plan de com d'événement, scénographie, discours |
| | `formateur` | Ateliers (réseaux sociaux, Canva, Meta Ads), supports, exercices |
| Création | `directeur-artistique` | Pistes graphiques, moodboards, direction photo/vidéo, cohérence visuelle |
| | `designer-identite` | Logos, chartes graphiques, déclinaisons, brand books |
| | `graphiste` | Affiches, flyers, posts, carrousels, bâches, roll-up, faire-parts, DTF (fichiers finis) |
| | `designer-web-ui` | Landing pages, sites, maquettes, pages du site Forlife |
| | `illustrateur` | Illustrations, mascottes, icônes, BD, dessins vectoriels |
| | `prompt-engineer-visuel` | Images et vidéos générées par IA (prompts, cohérence, représentation juste) |
| Audiovisuel | `realisateur-photo-video` | Préproduction : concept de film, storyboard, liste de plans, plan de tournage, drone, shooting |
| | `monteur-video` | Montage, sous-titres, reels/shorts depuis des rushs, étalonnage, export |
| | `motion-designer` | Animations, logos animés, typographie animée, promos graphiques MP4 |
| | `sound-designer-voix-off` | Voix off (voix FOR LIFE), spots radio, musique et sons, mixage |
| Qualité | `brand-guardian` | Relecture finale : charte, orthographe, cohérence, specs techniques, droits, légal |

## Circuits types (ordre et parallélisme)

**Nouveau projet** : `brief-creatif` (skill) → `chef-de-projet` (planning) → circuit ci-dessous → `brand-guardian` → livraison.

1. **Campagne 360°** (lancement, rentrée, événement) :
   `strategiste-marketing` → `directeur-creation` (concept) → en parallèle {`concepteur-redacteur`, `directeur-artistique`}
   → en parallèle {`graphiste`, `motion-designer`, `community-manager` (calendrier), `media-buyer` (plan média)}
   → `brand-guardian`.
2. **Mois de community management** : `community-manager` (calendrier + textes) → en parallèle {`graphiste` (visuels),
   `motion-designer` ou `monteur-video` (reels)} → `brand-guardian` → validation client → programmation.
3. **Identité visuelle** : `strategiste-marketing` (positionnement court) → `designer-identite` (3 pistes) →
   choix client → `designer-identite` (charte) → `graphiste` (papeterie, déclinaisons) → `brand-guardian`.
4. **Vidéo tournée** : `concepteur-redacteur` (script) → `realisateur-photo-video` (storyboard, plan de tournage) →
   tournage humain → `monteur-video` (+ `motion-designer` habillage, `sound-designer-voix-off`) → `brand-guardian`.
5. **Vidéo sans tournage** : `concepteur-redacteur` → `sound-designer-voix-off` (voix) → `motion-designer` → `brand-guardian`.
6. **Événement (école, église, entreprise)** : `relations-presse-evenementiel` (plan + rétroplanning) → `graphiste`
   (invitations, affiches, banderoles, tee-shirts DTF) + `community-manager` (annonces) + `realisateur-photo-video` (couverture)
   → après l'événement `monteur-video` (aftermovie) + `community-manager` (remerciements).
7. **Publicité Meta** : `media-buyer` (structure + audiences) + `concepteur-redacteur` (3 angles × 3 textes) +
   `graphiste`/`motion-designer` (créas 4:5 et 9:16) → `brand-guardian` → validation budget par l'utilisateur.
8. **Offre commerciale / prospection** : `business-developer` → `graphiste` (mise en page PDF) → `brand-guardian`.

## Règles d'orchestration

- Donner à chaque agent : le chemin du brief, le chemin de la charte, ce qu'il doit livrer, où l'écrire, et l'échéance.
  Les agents ne voient pas la conversation : leur prompt doit se suffire à lui-même.
- Un agent = un livrable clair. Pour 12 visuels, lancer plusieurs `graphiste` en parallèle (4 visuels chacun).
- Regarder les livrables visuels (Read sur les PNG) avant de les présenter. Toujours finir par `brand-guardian`.
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
