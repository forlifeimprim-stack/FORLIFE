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
| J3 → J10 | Creative image, Social Hub, CRM/Campagnes, Vidéo, Analytics, WhatsApp, Autopilot | ⏳ roadmap ([docs/02-suivi.md](docs/02-suivi.md)) |

## Démarrage rapide

Prérequis : Node.js ≥ 20, PostgreSQL 16 (ou `docker compose up -d`).

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
│       ├── billing      ledger de crédits idempotent
│       ├── jobs         file Postgres (SKIP LOCKED), retry backoff+jitter, dead-letter
│       └── storage      interface de stockage objet (local ; S3 prévu)
├── apps/web             React + Vite : onboarding, accueil, Brand DNA, stratégie, Content Studio, calendrier, approbations, paramètres
└── docs/                audit J0, architecture & décisions, suivi des critères d'acceptation
```

Voir [docs/01-architecture.md](docs/01-architecture.md) pour les choix techniques détaillés.
