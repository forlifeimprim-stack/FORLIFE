# J0 — Audit du dépôt existant

La spécification technique impose d'auditer l'existant avant tout développement (§ « Principe de gouvernance », §10).

## Constat

Le dépôt `forlife` contient **le site vitrine de l'agence Forlife Com'** (pas le monorepo « Forlife One » évoqué par la spécification) :

| Élément | Nature | Impact sur Forlife Com OS |
|---|---|---|
| `*.html`, `css/`, `js/`, `assets/` | Site statique (Firebase Hosting, projet `forlifecom-6eef9`) | Conservé intact. `platform/**` exclu du déploiement Firebase. |
| `blog/`, `scripts/auto-blog.js`, `.github/workflows/auto-blog.yml` | Génération hebdomadaire d'articles via Gemini, commit sur `main` puis déploiement | Non touché. Le workflow CI de la plateforme ne se déclenche que sur `platform/**`. |
| `automation.html`, `js/automation.js`, `automation_marketing.py` | Démonstrateur d'automatisation (emails, relances, Meta Pixel) côté client | Préfigure le CRM/Automation (Phases 5–6) ; sera remplacé par des fonctions serveur sécurisées. |
| `assets/logo/*.svg` | Logo officiel noir/orange `#EA7822` | Repris comme base du design system (§24). |

**Aucune brique Identity / Organization / RBAC / Billing / Sales / Payments / Cash / Stock n'existe dans ce dépôt.**
Les règles d'intégration Forlife One (§7) ne peuvent donc pas être appliquées par réutilisation : elles le sont **par conception** :

- Identity, Organization, Membership, RBAC et Billing sont construits comme modules isolés et remplaçables
  (contrats clairs : `requireOrg` / `requireWorkspace`, `ledger`, `TASK_CREDIT_COST`).
- Aucune vente, paiement, caisse ou stock n'est créé dans Forlife Com. Les montants (budgets, prix produits)
  sont stockés en unités mineures XOF ; l'attribution vers des ventes existantes passera par des références externes (Phase 5).
- Si le dépôt Forlife One est fourni plus tard, une matrice de correspondance remplacera les modules Identity/Billing
  par ceux de Forlife One sans toucher aux domaines métier (Brand, Strategy, Content…).

## Décisions figées pour le premier commit (§10)

| Décision | Choix retenu | Réversible ? |
|---|---|---|
| Périmètre MVP | Fondation + Brand DNA + Strategy + Content Factory + approbations + calendrier | — |
| Conventions techniques | TypeScript strict, Fastify, Prisma/PostgreSQL, zod, React/Vite, npm workspaces | Oui |
| Object storage / CDN | Interface `ObjectStorage` ; driver local en dev, S3-compatible ensuite | Oui (driver) |
| Premier fournisseur LLM | Anthropic Claude (`claude-opus-5-5`, configurable) + simulateur déterministe | Oui (registry) |
| Premier fournisseur image / vidéo | À choisir en Phase 2 / 4 (aucun couplage dans le domaine) | — |
| Budget IA par plan | Crédits mensuels : Free 200, Starter 1 500, Business 5 000, Pro 12 000, Agency 40 000 | Oui (`packages/shared/src/billing.ts`) |
| Grille tarifaire (validée le 12/10/2026) | Free 0, Starter 15 000, Business 45 000, Pro 95 000, Agency 250 000 FCFA / mois | Oui (`packages/shared/src/billing.ts`) |
| Réseaux P0/P1 | Modélisés : Facebook, Instagram, TikTok, LinkedIn, YouTube, X, WhatsApp, Email ; connexions OAuth en Phase 3 | — |
| Politique d'approbation | Revue obligatoire avant programmation ; rôles Owner/Admin/Manager/Agency approuvent ; auto-approbation tracée dans l'audit | Oui |
| Consentement WhatsApp | Phase 7 (opt-in, templates, fenêtres de conversation) | — |
| Attribution campagne → vente | Phase 5 via références externes (aucune donnée financière dupliquée) | — |
| Environnements / secrets | Variables d'environnement validées au démarrage ; secrets chiffrés AES-256-GCM en base | Oui |
| Fuseau / devise par défaut | `Africa/Abidjan`, XOF (FCFA), locale `fr-CI` | Oui (par organisation/workspace) |

Points à confirmer par l'équipe produit : choix des fournisseurs image/vidéo,
et disponibilité du dépôt Forlife One.
