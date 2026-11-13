---
name: bibliotheque-agence
description: Catalogue des 85 guides de méthode installés depuis GitHub dans agence/bibliotheque/ (marketing en français, réseaux sociaux, vidéo, motion, design graphique, prompts IA). À consulter pour trouver le guide expert d'une tâche précise — copywriting, Meta Ads, carrousel, hook, script TikTok/Reels, calendrier éditorial, crise, plan marketing, SEO, RP, image IA, vidéo IA — puis lire son SKILL.md.
---

# Bibliothèque de l'agence

Guides importés de dépôts GitHub sous licence MIT (sources et licences : `agence/SOURCES.md`). Ils ne se chargent
pas tout seuls : **lire le `SKILL.md` du guide utile** (et ses `references/` si besoin), puis l'appliquer.

Avant d'appliquer un guide :
- contexte de marque : `agence/contexte/brand-profile.md` (Forlife) ou `clients/<client>/brand-profile.md` ;
- les guides `marketing-fr` visent la France et les guides `reseaux-sociaux` sont en anglais, orientés États-Unis :
  **adapter avec le skill `contexte-ivoirien`** (FCFA, WhatsApp, Mobile Money, ARTCI, calendrier local) et produire en français ;
- les guides `reseaux-sociaux` citent l'outil « WoopSocial » : l'ignorer, Forlife publie via Meta Business Suite.

## Marketing en français — `agence/bibliotheque/marketing-fr/<guide>/SKILL.md`

| Besoin | Guide |
|---|---|
| Plan marketing complet d'un client | `marketing-plan` · avis croisés d'experts : `marketing-council` |
| Idées de marketing / croissance | `marketing-ideas` · leviers psychologiques : `marketing-psychology` |
| Fiche de contexte marketing d'un client | `product-marketing` |
| Stratégie de contenu, sujets | `content-strategy` |
| Textes de pages, affiches, accroches | `copywriting` · relecture et amélioration : `copy-editing` |
| Réseaux sociaux (posts, calendrier, veille) | `social` |
| Publicité payante (Meta, Google, TikTok) | `ads` · créations publicitaires en série : `ad-creative` |
| Images marketing / vidéo marketing | `image` · `video` |
| Offre irrésistible, packs, garanties | `offers` · prix et paliers : `pricing` |
| Lancement d'un produit / service | `launch` |
| Aimant à prospects (guide, check-list, atelier) | `lead-magnets` |
| Parrainage, bouche-à-oreille | `referrals` · partenariats : `co-marketing` |
| Communauté (groupe, club, fidélité) | `community-marketing` |
| Relations presse | `public-relations` |
| Prospection, supports de vente | `prospecting` · `sales-enablement` |
| E-mailing / SMS | `emails` · `sms` |
| Concurrents | `competitor-profiling` |
| Recherche client, verbatims | `customer-research` |
| Site : conversion, arborescence, SEO, visibilité IA, données structurées, mesure | `cro` · `site-architecture` · `seo-audit` · `ai-seo` · `schema` · `analytics` |

## Réseaux sociaux (anglais) — `agence/bibliotheque/reseaux-sociaux/<guide>/SKILL.md`

| Besoin | Guide |
|---|---|
| Profil de marque (base de tout) | `brand-profile` (déjà rempli pour Forlife : `agence/contexte/brand-profile.md`) |
| Stratégie, objectifs, audience | `social-strategy` · `goals-and-kpis` · `audience-research` |
| Piliers et calendrier | `content-pillars` · `content-calendar` · `batch-content-plan` (un mois en une fois) |
| Temps forts de l'année | `seasonal-and-moment-marketing` (+ `contexte-ivoirien`) · tendances : `trend-jacking` |
| Écriture | `hook-writer` · `caption-writer` · `carousel-writer` · `writing-style-and-tone` · `storytelling-and-narrative` |
| Formats de contenu | `before-after-and-transformation` · `behind-the-scenes-and-founder` · `social-proof-and-testimonials` · `quote-cards-and-text-graphics` · `infographic-and-data-viz` |
| Facebook | `facebook-strategy` · `facebook-groups` |
| Instagram / TikTok / LinkedIn | `instagram-growth` · `instagram-reels-publishing` · `tiktok-growth` · `linkedin-company-pages` |
| Scripts vidéo courts | `short-form-video-script` · `reels-script` · `tiktok-script` · `scripting-and-storyboarding` · `talking-head-and-piece-to-camera` |
| Live | `livestream-and-realtime` |
| Communauté et modération | `community-management` · `engagement-routine` · `reply-and-comment-writer` · `crisis-and-moderation` |
| Influence / UGC | `ugc-and-influencer` |
| Outils de création | `canva` · `capcut` · `design-and-templates` · `thumbnail-design` |
| Images IA | `image-prompt` (routeur) · `nano-banana` · `ai-image-editing` |
| Vidéo, voix, musique IA | `ai-video` (routeur) · `kling` · `veo-3` · `ai-voiceover` · `ai-music-and-sound` |
| Spécifications des plateformes | `platform-specs-and-validation` |
| Statistiques et rapports | `analytics-and-reporting` |

## Vidéo, motion, design

| Besoin | Guide |
|---|---|
| Film commercial premium (images IA + motion HTML/GSAP + boucle critique) | `agence/bibliotheque/motion-video/business-motion-film/SKILL.md` (+ `scripts/` : mixage, sons, planches) |
| Logo et identité avec outils IA (choix d'outils, vectorisation, maquettes, propriété intellectuelle) | `agence/bibliotheque/design-graphique/ai-graphic-design/SKILL.md` |
| Montage de rushs face caméra en short / vidéo YouTube | skills installés `short-editing`, `editing`, `studio-setup`, `clips`, `broll`, `steal` (dans `.claude/skills/`) |

## Skills Anthropic déjà disponibles dans Claude (sans installation)

Selon l'environnement : `anthropic-skills:canvas-design` (affiches d'art), `anthropic-skills:algorithmic-art` (art génératif),
`anthropic-skills:motion-design`, `anthropic-skills:pptx` (présentations clients), `anthropic-skills:pdf`,
`anthropic-skills:docx`, `design:design-critique`, `marketing:campaign-plan`, `marketing:brand-review`,
`small-business:social-content-engine`, `small-business:canva-creator`.
