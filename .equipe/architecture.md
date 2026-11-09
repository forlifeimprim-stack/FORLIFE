# Architecture existante de Forlife Com (état au 07/11/2026)

Document de référence rédigé par Zana (D01) à partir du code. Il décrit ce qui tourne réellement, pas la cible.
Les écarts avec `platform/docs/01-architecture.md` sont signalés.

## 1. Vue d'ensemble

```
Navigateur (React 19, un seul bundle JS)
   │  https://forlifecomai.ci  (et ai-growth-et-creative-os.web.app)
   ▼
Firebase Hosting ── fichiers statiques apps/web/dist (assets immuables 1 an, index.html no-cache)
   │  réécriture /api/** (europe-west1)
   ▼
Cloud Run « forlife-api » : 1 conteneur Node 22, 2 vCPU, 2 Gio, min 1 / max 4 instances, CPU toujours allouée
   ├─ API Fastify 5 (HTTP, concurrence 40 requêtes par instance)
   ├─ Worker de jobs intégré (RUN_WORKER_INLINE=true, 2 boucles par instance)
   ├─ Planificateur intégré (setInterval : 30 s, 5 min, 1 h) dans CHAQUE instance
   └─ Rendu vidéo (resvg image par image + FFmpeg) dans le même processus
        │
        ├─ Cloud SQL PostgreSQL 16 (zonal, db-f1-micro ou db-g1-small, 3 à 5 connexions par instance)
        ├─ Cloud Storage privé (fichiers lus en mémoire puis renvoyés par l'API)
        ├─ Secret Manager (secrets injectés par Cloud Run)
        └─ Fournisseurs externes : Anthropic (claude-opus-5-5), Google TTS (Neural2), Vertex Imagen (us-central1),
           Meta / LinkedIn / TikTok / YouTube, CinetPay (non branché), Resend (non branché)

Job Cloud Run « forlife-migrate » : prisma migrate deploy + création du rôle restreint forlife_app, à chaque déploiement.
```

## 2. Dépôt et composants

| Élément | Chemin | Rôle |
|---|---|---|
| API | `platform/apps/api` | Fastify 5.12.5, Prisma 6.19.3, zod 4.6.5, 84 fichiers, 10 096 lignes |
| Web | `platform/apps/web` | React 19.3.0, react-router 7.18.4, Vite 8.3.4, 9 799 lignes, aucune dépendance UI |
| Partagé | `platform/packages/shared` | RBAC, machine à états du contenu, offres et coûts en crédits |
| Vidéo marketing | `platform/marketing/ad` | Remotion, hors exécution |
| Déploiement | `.github/workflows/platform-deploy.yml`, `platform/Dockerfile`, `platform/firebase.json`, `platform/deploy/production.env`, `platform/scripts/gcp-setup.sh` | |

## 3. Modules de l'API (`apps/api/src/modules`)

identity, org, admin, brand, strategy, content, approvals, creative, video, social, crm, campaigns, analytics,
copilot, ai (passerelle), billing (registre de crédits), payments, governance, mail, storage, jobs.

Dépendances observées (imports `../module/`) :

- `jobs` est la racine de composition : `jobs/handlers.ts` et `jobs/scheduler.ts` importent 11 modules,
  et ces modules importent `jobs/queue.ts`. Ce n'est pas un vrai couplage métier, mais le document 01 affirme
  « aucune dépendance circulaire » alors que l'analyse statique en trouve 10 via `jobs`.
- Vrai cycle métier : `content/routes.ts:11` importe `social/service.ts`, et `social/routes.ts:17` importe `content/service.ts`.
- `creative/composer.ts` sert de bibliothèque graphique à `video`, `brand` et `social` (couplage fort sur un fichier de 16 Ko).

## 4. Traitements asynchrones

- File PostgreSQL (table `Job`), réservation `FOR UPDATE SKIP LOCKED` (`modules/jobs/queue.ts:58`).
- 12 types de jobs (`modules/jobs/handlers.ts`) : 10 appels IA, `social.publish`, `video.render`.
- Planificateur (`modules/jobs/scheduler.ts`) : renouvellement des abonnements, relance des paiements, purge des
  compteurs, purge des organisations supprimées (5 min) ; publications dues (30 s) ; statistiques sociales et purge
  YouTube (1 h). Il tourne dans chaque instance Cloud Run.
- Le document 01 (ligne 56) annonce un worker séparé en production : ce n'est pas le cas (`platform-deploy.yml:174`).

## 5. Données

57 modèles Prisma, 17 migrations (10/10 au 17/10/2026). Multi-tenant par `workspaceId` / `organizationId`.
Tables à croissance continue sans purge : `Job`, `AIRun`, `AIUsageEvent`, `AuditLog`, `CreditTransaction`,
`SocialMetricSnapshot` (hors YouTube), `Session`, `EmailOutbox`, `OAuthState`, `PaymentEvent`, `CopilotMessage`.

## 6. Exploitation

- Déploiement automatique à chaque push sur `main` ou `claude/app-development-sbl2ff`, sans environnement de préproduction.
- Journaux pino structurés avec `x-correlation-id` ; pas de métriques, d'alertes, ni de suivi d'erreurs.
- Sauvegardes Cloud SQL : 14 sauvegardes quotidiennes + restauration à la minute (`scripts/gcp-setup.sh:71`), instance zonale.
- Retour arrière applicatif : révision Cloud Run précédente ; pas de retour arrière des migrations.
