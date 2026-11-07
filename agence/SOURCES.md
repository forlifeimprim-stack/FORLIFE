# Sources GitHub et licences

Recherche menée le 7 novembre 2026 sur GitHub (agents et skills pour agences créatives : marketing, community management,
graphisme, design, montage, motion design, illustration, direction artistique). Seuls les dépôts sous **licence MIT**
ont été copiés ; les autres sont cités ou installables à part. Copies des licences : `agence/licences/`.

## Installé dans ce dépôt

| Dépôt | Licence | Version (commit) | Ce qui a été pris | Où |
|---|---|---|---|---|
| [Melvynx/video-agent-skills](https://github.com/Melvynx/video-agent-skills) | MIT | `f454292` | Les 13 skills de montage vidéo (moteur de rendu inclus) | `.claude/skills/` (`editing`, `short-editing`, `studio-setup`, `studio-script`, `clips`, `broll`, `steal`, `outliers`, `insta-audit`, `publish`, `short-translate`, `vox`, `codex-images`) |
| [david-corroy/skills-marketing-fr](https://github.com/david-corroy/skills-marketing-fr) (adaptation française de [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), ~59 k ★) | MIT | `c2b7c45` | 33 guides sur 47 (sans SaaS/app : paywalls, onboarding, ASO, churn…) | `agence/bibliotheque/marketing-fr/` |
| [social-media-skills/skills](https://github.com/social-media-skills/skills) | MIT | `f28cef2` | 50 guides sur 106 (sans Pinterest, X, Threads, Reddit, YouTube long, outils non pertinents), sans les dossiers `evals/` | `agence/bibliotheque/reseaux-sociaux/` |
| [echris6/motion-video-kit](https://github.com/echris6/motion-video-kit) | MIT | `e4b1c00` | Skill `business-motion-film` et ses scripts | `agence/bibliotheque/motion-video/` |
| [designrique/ai-graphic-design-skill](https://github.com/designrique/ai-graphic-design-skill) | MIT | `7d9d03b` | Guide création de logos/identités avec l'IA | `agence/bibliotheque/design-graphique/` |
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | MIT | `b859c51` | Structure des fiches d'agents (identité, mission, livrables, garde-fous) — **les 22 agents Forlife ont été réécrits**, pas copiés | `.claude/agents/` |
| Police [Poppins](https://github.com/itfoundry/Poppins) (via [@fontsource/poppins](https://www.npmjs.com/package/@fontsource/poppins)) | SIL OFL 1.1 | 5.3.0 | Fichiers woff2 400→900 | `.claude/skills/visuel-studio/polices/` |

Mettre à jour : `bash agence/mettre-a-jour-bibliotheque.sh`, puis relire le diff avant de committer.

## Créé pour Forlife (ce dépôt)

- 22 agents dans `.claude/agents/` (français, marché ivoirien, charte Forlife, outils réels).
- Skills `agence-forlife` (orchestration), `brief-creatif`, `contexte-ivoirien`, `bibliotheque-agence`,
  `visuel-studio` (moteur HTML → PNG/JPG/PDF imprimeur) et `motion-studio` (moteur HTML → MP4 avec son normalisé).
- Contexte de marque `agence/contexte/brand-profile.md`, `.claude/product-marketing.md`, modèles `agence/modeles/`.

## Repérés mais non copiés

| Dépôt | Pourquoi |
|---|---|
| [remotion-dev/skills](https://github.com/remotion-dev/skills) (officiel Remotion) | Pas de fichier de licence dans le dépôt : installable à part avec `bash agence/installer-extras.sh remotion` |
| [contains-studio/agents](https://github.com/contains-studio/agents) | Pas de licence : non redistribuable (idées reprises librement dans nos propres fiches) |
| [wshobson/agents](https://github.com/wshobson/agents), [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | Surtout orientés développement logiciel |
| [cloveric/claude-drawing-skill](https://github.com/cloveric/claude-drawing-skill) (MIT) | 278 Mo, consignes de 600 Ko en chinois : trop lourd pour le contexte ; l'agent `illustrateur` dessine en SVG |
| [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) (MIT) | Pipeline personnel d'un créateur ; remplacé par notre `motion-studio` |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage), [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | Systèmes vidéo complets très lourds ; à évaluer si besoin de films IA à grande échelle |
| [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills), [hyperfx-ai/marketing-skills](https://github.com/hyperfx-ai/marketing-skills), [irinabuht12-oss/marketing-skills](https://github.com/irinabuht12-oss/marketing-skills) | Recouvrent les guides déjà installés |
| [anthropics/skills](https://github.com/anthropics/skills) (`canvas-design`, `algorithmic-art`, `brand-guidelines`, `pptx`…) | Déjà disponibles dans Claude via les plugins Anthropic |

## Contrôle de sécurité effectué

Recherche dans les fichiers importés d'instructions suspectes (injection de prompt, exfiltration, clés en dur) et
inventaire des adresses réseau des scripts : seuls des téléchargements attendus (whisper.cpp sur GitHub, modèles
MediaPipe, API ElevenLabs/OpenAI optionnelles avec la clé de l'utilisateur). Les scripts tiers n'ont pas été exécutés
lors de l'installation. Le moteur `short-editing` contient deux binaires macOS précompilés par l'auteur
(`engine/bin/darwin/faces` et `matte`, sources `faces.swift` et `matte.swift` à côté), utilisés uniquement sur Mac.
