# Architecture technique — Fondation (J1/J2)

## Vue d'ensemble

```
Web (React/Vite, mobile-first) ──HTTP/JSON──▶ API Fastify ──▶ Modules métier ──▶ PostgreSQL (Prisma)
                                                 │                    │
                                                 │                    └─▶ Job queue (table Job, SKIP LOCKED)
                                                 │                              │
                                                 ▼                              ▼
                                           Audit log (append-only)     Worker(s) ──▶ AI Gateway ──▶ Claude / Mock / …
                                                                                     │
                                                                                     └─▶ Ledger crédits + AIRun + AIUsageEvent
```

Modular monolith : chaque module (`identity`, `org`, `brand`, `strategy`, `content`, `approvals`, `ai`, `billing`,
`jobs`, `storage`) expose des routes et des services ; il n'existe pas de dépendance circulaire entre domaines.

## Multi-tenant et sécurité

- Toute donnée métier porte `workspaceId` (et le workspace porte `organizationId`). Chaque route résout le contexte
  via `requireWorkspace(req, workspaceId, permission)` : appartenance, accès au workspace (agences restreintes), permission.
- Un utilisateur hors tenant reçoit **404** (pas de fuite d'existence). Les références croisées (objectif, pilier,
  campagne d'un autre workspace) sont refusées.
- RBAC : 8 rôles × permissions `module:action` dans `packages/shared/src/rbac.ts`, appliqué **côté serveur**.
  Anti-escalade : on ne peut attribuer qu'un rôle de rang ≤ au sien ; l'organisation garde toujours un propriétaire.
- Auth : JWT d'accès 15 min (en mémoire côté web) + refresh token opaque en cookie `httpOnly; SameSite=Strict`,
  haché en base, **rotatif** ; la réutilisation d'un token tourné révoque toutes les sessions (détection de vol).
  En-tête anti-CSRF requis sur les routes à cookie. Mots de passe : scrypt. Rate limiting global + renforcé sur l'auth.
- Secrets : `encryptSecret`/`decryptSecret` AES-256-GCM (prêt pour les tokens OAuth sociaux) ; logs expurgés.
- Uploads : liste blanche de types + **vérification de signature binaire**, SVG sans script, noms assainis,
  clés de stockage non devinables, service avec `nosniff` + CSP sandbox.
- Journal d'audit, ledger de crédits et usage IA **append-only** (triggers PostgreSQL) ; solde jamais négatif (CHECK).

## AI Gateway (§21)

`runAI()` est le seul point d'entrée IA :

1. crée un `AIRun` (tâche, clé et **version du prompt**, entrée, traceId) ;
2. débite les crédits **avant** exécution (idempotent, clé = job + tentative) ;
3. route vers les fournisseurs disponibles dans l'ordre `AI_PROVIDERS` (feature flag) avec **fallback** ;
   un refus de sécurité n'est jamais contourné par un autre fournisseur ;
4. valide la sortie par **schéma zod** (sorties structurées ; une sortie non conforme déclenche le fallback) ;
5. applique la couche sécurité (allégations trompeuses, mots interdits du Brand DNA) ;
6. trace fournisseur, modèle, tokens, latence, crédits ; **rembourse** si tout échoue.

Les prompts (`modules/ai/prompts.ts`) injectent le contexte persistant (profil business, Brand DNA approuvé, produits et
faits verrouillés) et imposent : stratégie avant génération, pas de prix/chiffres inventés, résultats = propositions.
Toute sortie IA est marquée et passe par une validation humaine. Les recommandations sont stockées `isEstimate = true`.

## Traitements asynchrones (§1.3)

File de jobs PostgreSQL : `QUEUED → RUNNING → SUCCEEDED | FAILED | DEAD | CANCELLED`.
Réservation concurrente sûre (`FOR UPDATE SKIP LOCKED`), retry avec backoff exponentiel + jitter, erreurs métier
(4xx) non réessayées, dead-letter après épuisement, récupération des jobs bloqués, annulation avant démarrage,
idempotence par `Idempotency-Key`. Le worker tourne dans l'API en dev, en process séparé en production (`npm run worker`).
Redis pourra remplacer la file sans changer les handlers (`registerJobHandler`).

## Contenu

Machine à états partagée (`packages/shared/src/domain.ts`) : `DRAFT → REVIEW → APPROVED → SCHEDULED → PUBLISHED`.
Verrou optimiste (`revision`) contre les écrasements concurrents ; toute modification d'un contenu en revue/approuvé
le renvoie en brouillon. Un contenu maître porte N variantes natives par canal (limites de caractères/hashtags par réseau).

## Observabilité

Logs structurés (pino) avec `x-correlation-id` propagé de la requête au job et à l'`AIRun` (`traceId`) ; endpoint `/api/health`.
Métriques/traces OpenTelemetry : à brancher en Phase 8 (gate G8).

## Tests

`apps/api/test` — intégration sur PostgreSQL réel : onboarding, isolation des tenants, RBAC et anti-escalade,
refresh token et détection de vol, ledger idempotent et concurrent, append-only, AI Gateway (fallback, remboursement,
refus, crédits insuffisants, sécurité), workflow de contenu, verrou optimiste, idempotence, file de jobs (retry, dead-letter,
réservation unique), Brand DNA versionné, validation des uploads.
