# Forlife Com — AI Growth & Creative OS

> « De la stratégie à la vente, une seule intelligence pour piloter la croissance. »

Plateforme SaaS multi-tenant (modular monolith TypeScript) qui transforme le contexte d'une entreprise
(Business Brain + Brand DNA) en stratégie, contenus multi-réseaux et, à terme, créations, vidéos, campagnes, leads et ROI.

Ce dossier contient **l'application**. Le site vitrine Forlife Com' reste à la racine du dépôt et n'est pas modifié.

## État d'avancement

| Jalon | Contenu | Statut |
|---|---|---|
| J0 | Audit du dépôt, décisions structurantes | ✅ [docs/00-audit-J0.md](docs/00-audit-J0.md) |
| J1 — Fondation | Tenant, auth, RBAC, billing/crédits, AI Gateway, jobs, audit, design system | ✅ |
| J2 — Strategy + Content | Business Profile, objectifs, audiences, concurrents, plan IA, Brand DNA, Content Factory, approbations, calendrier | ✅ (MVP) |
| J3 — Ventes | CRM & leads (kanban, scoring, relances WhatsApp IA), formulaires publics, Campaign Manager | ✅ |
| J4 — Diffusion | Social Hub (OAuth Meta, jetons chiffrés, publication idempotente, métriques), compte de démonstration | ✅ |
| J5 — Création | Creative Studio (3 concepts, moteur de design, Critic), Video Studio 9:16 (storyboard, rendu MP4, sous-titres) | ✅ |
| J6 — Business | Analytics & ROI, export CSV/PDF, paiements mobile money (CinetPay), back-office super-admin | ✅ |
| J7 — Mise en ligne | Docker, Cloud Run, Firebase Hosting, workflow GitHub | ✅ prêt — [docs/03-deploiement.md](docs/03-deploiement.md) |
| Ensuite | AI Copilot, WhatsApp Business API, Autopilot, LinkedIn/TikTok/YouTube | ⏳ ([docs/02-suivi.md](docs/02-suivi.md)) |

## Démarrage rapide

Prérequis : Node.js ≥ 20, PostgreSQL 16 (ou `docker compose up -d`), FFmpeg (rendu vidéo).

```bash
cd platform
npm install
cp apps/api/.env.example apps/api/.env      # ajuster DATABASE_URL / secrets
npm run db:migrate                          # crée le schéma
npm run dev:api                             # API + worker intégré  → http://localhost:4000
npm run dev:web                             # interface              → http://localhost:5173
```

Sans clé `ANTHROPIC_API_KEY`, l'IA fonctionne avec un **fournisseur simulé** déterministe
(les résultats sont marqués « Démo — fournisseur IA simulé » dans l'interface).
Avec une clé, Claude est utilisé en priorité et le simulateur sert de fallback en dev.
**En production, mettre `AI_PROVIDERS=anthropic`** pour ne jamais servir de contenu simulé.

## Commandes

| Commande | Rôle |
|---|---|
| `npm test` | Tests unitaires (shared) + intégration API sur PostgreSQL (`forlife_com_test`) |
| `npm run typecheck` | Vérification TypeScript de tous les paquets |
| `npm run build` | Build shared + API + web |
| `npm run worker` | Worker de jobs séparé (production : `RUN_WORKER_INLINE=false` sur l'API) |

## Structure

```
platform/
├── packages/shared      RBAC (rôles × permissions), statuts & machine à états, canaux, plans & coûts en crédits
├── apps/api             Fastify + Prisma/PostgreSQL
│   ├── prisma/          schéma + migrations (triggers append-only, contraintes)
│   └── src/modules/
│       ├── identity     inscription/onboarding, connexion, refresh tokens rotatifs
│       ├── org          membres, workspaces, facturation, audit, traçabilité IA
│       ├── brand        Brand DNA versionné, assets (upload validé), produits verrouillés
│       ├── strategy     profil business versionné, objectifs, audiences, concurrents, plans, recommandations
│       ├── content      Content Factory, variantes par réseau, workflow, programmation
│       ├── approvals    centre d'approbation (human-in-the-loop)
│       ├── ai           AI Gateway : registry, router + fallback, prompts versionnés, sécurité, usage
│       ├── billing      ledger de crédits idempotent, renouvellement mensuel, expiration des plans
│       ├── payments     CinetPay + guichet de démo, vérification serveur, livraison idempotente
│       ├── analytics    entonnoir, ROI des campagnes, attribution des leads, export CSV
│       ├── crm          contacts, leads, scoring, tâches, formulaires publics
│       ├── campaigns    Campaign Manager + pack de campagne IA
│       ├── social       OAuth Meta, comptes, publications idempotentes, métriques
│       ├── creative     moteur de design SVG→PNG, Creative Director, Critic
│       ├── video        storyboard IA, rendu MP4 9:16 (FFmpeg), contrôle qualité
│       ├── admin        back-office plateforme (organisations, plans, crédits, suspension)
│       ├── jobs         file Postgres (SKIP LOCKED), retry backoff+jitter, dead-letter, planificateur
│       └── storage      stockage objet (disque local en dev, Google Cloud Storage en production)
├── apps/web             React + Vite : toutes les pages (accueil, Brand DNA, stratégie, Content/Creative/Video Studio,
│                        calendrier, Social Hub, campagnes, CRM, Analytics, facturation, back-office)
└── docs/                audit J0, architecture & décisions, suivi des critères d'acceptation
```

Voir [docs/01-architecture.md](docs/01-architecture.md) pour les choix techniques détaillés et
[docs/03-deploiement.md](docs/03-deploiement.md) pour la mise en ligne.
