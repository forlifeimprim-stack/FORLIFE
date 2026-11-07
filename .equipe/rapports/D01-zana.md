# D01 : Diagnostic d'architecture de Forlife Com (Zana, 07/11/2026)

## STATUT

TERMINÉ (diagnostic en lecture seule ; aucune donnée de production consultée, voir HYPOTHÈSES).

## RÉSUMÉ

La stack est bien choisie pour une petite équipe : un monolithe modulaire TypeScript (Fastify + Prisma + React),
des services managés Google (Cloud Run, Cloud SQL, Cloud Storage, Secret Manager, Firebase Hosting), une file de
jobs dans PostgreSQL et aucun microservice. La sécurité de base est soignée (rôle base restreint, secrets hors
dépôt, fédération d'identité GitHub, CSP). Les 137 tests passent.

Les faiblesses sont dans l'exploitation, pas dans le choix des briques :

1. Le rendu vidéo tourne dans le processus HTTP. Mesure locale : la boucle d'événements est bloquée jusqu'à 218 ms,
   en continu, pendant 25 s par vidéo.
2. Le worker et le planificateur tournent dans chaque instance de l'API. Un arrêt (chaque déploiement en provoque
   un) peut laisser des jobs à moitié exécutés, débiter deux fois des crédits IA ou rejouer sans fin un job qui fait
   planter l'instance.
3. Aucune purge pour la plupart des tables, et aucune alerte ni supervision.
4. Le coût IA par crédit vendu (modèle `claude-opus-5-5` pour toutes les tâches) est probablement proche du prix de
   vente, voire au-dessus pour le Copilot. Il faut le mesurer avant d'ouvrir les inscriptions.
5. La production n'est pas encore « réelle » : emails en mode `log`, CinetPay non branché, publication sociale en
   mode bac à sable. Le domaine de l'expéditeur des emails ne correspond pas au domaine public.

À 100 clients, l'architecture tient après les corrections P0. À 1 000 clients, il faut séparer le worker et la
supervision, et passer Cloud SQL sur un cœur dédié. À 10 000 clients, il faut en plus revoir la file, la rétention et
le modèle IA par tâche. Aucune réécriture n'est nécessaire.

## CONSTATS

### 1. Stack réelle et versions (lockfile, vérifiées le 07/11/2026)

| Brique | Installé (`package-lock.json`) | Dernière publiée (`npm view`) | Remarque / fin de support |
|---|---|---|---|
| Node.js | 22 (`Dockerfile:2`, `:15`, CI `node-version: "22"`) ; local v22.22.0 | 24 LTS active | Node 22 est en LTS de maintenance jusqu'au 30/04/2027 : migration vers 24 à planifier avant cette date |
| PostgreSQL | 16 (`scripts/gcp-setup.sh:69`, CI) | 17/18 | Fin de support de la 16 en novembre 2028 : pas d'urgence |
| Fastify | 5.12.5 | 5.12.8 | avis npm « low » corrigé en 5.12.8 (même majeure) |
| Prisma / @prisma/client | 6.19.3 | 7.10.1 (8.0 en RC) | une majeure de retard ; avis « high » (deepmerge-ts via @prisma/config) corrigé seulement en 7.10.1 |
| zod | 4.6.5 | 4.6.7 | avis « high » (épuisement mémoire) corrigé en 4.6.6, sans changement de majeure |
| @anthropic-ai/sdk | 0.133.0 | 1.6.0 | une majeure de retard |
| @google-cloud/storage | 7.22.0 | 8.4.0 | avis « moderate » (uuid, teeny-request) corrigés en 8.x |
| React / react-dom | 19.3.0 | 19.3.1 | à jour |
| react-router-dom | 7.18.4 | 7.18.5 | à jour |
| Vite | 8.3.4 | 8.3.6 | à jour |
| TypeScript | 5.9.3 | 7.0.2 | 5.9 reste correct ; la 7 (compilateur natif) n'est pas urgente |
| vitest | 5.0.3 | 5.1.0 | à jour |
| firebase-tools | 13.35.1 épinglé (`platform-deploy.yml:197`) | non vérifié | version ancienne épinglée à revoir avec Brice |
| FFmpeg | paquet Debian bookworm (`Dockerfile:17`) | | version non épinglée |

`npm audit --omit=dev` : 12 vulnérabilités (4 high, 7 moderate, 1 low). Celles de zod, fastify, fast-uri,
ip-address et gaxios se corrigent sans changement de majeure ; celles de Prisma et @google-cloud/storage
demandent une montée de majeure. L'analyse fine revient à Caporal (D06).

Adéquation : la stack est très bonne pour une PME. Une seule langue (TypeScript), aucun service à opérer soi-même
(pas de Redis, pas de Kubernetes), une seule base, et un coût fixe faible. Prisma, Fastify et React sont des choix
courants, faciles à recruter. Seul point de vigilance : rester sur les majeures maintenues (Prisma 6 vers 7).

### 2. Découpage, dépendances, dette, couplages

- Tailles : API 84 fichiers, 10 096 lignes ; web 9 799 lignes ; 57 modèles Prisma (`schema.prisma`, 1 291 lignes).
  Le code est compact mais dense : `ai/prompts.ts` a 23 lignes de plus de 200 caractères.
- Fichiers les plus lourds (octets) : `web/src/styles.css` 54 578 (742 lignes), `api/src/modules/ai/prompts.ts`
  31 804 (567 lignes), `web/src/pages/Crm.tsx` 26 271 (583 lignes), `Brand.tsx` 20 187, `VideoStudio.tsx` 20 115,
  `Strategy.tsx` 18 174, `social/audit.ts` 17 631, `creative/composer.ts` 16 464, `video/renderer.ts` 16 010.
  Aucun n'est hors de contrôle. Les pages web regroupent appels API, état et rendu dans un seul fichier (avis à Grâce, D03).
- Dépendances circulaires : le document `docs/01-architecture.md:17` affirme qu'il n'y en a aucune. L'analyse des
  imports en trouve 10, toutes via `jobs` (`jobs/handlers.ts:1-11` et `jobs/scheduler.ts:1-6` importent les modules
  qui importent `jobs/queue.ts`). C'est un défaut de rangement : la composition devrait vivre dans `worker.ts` / `server.ts`.
  Un vrai cycle métier existe : `content/routes.ts:11` importe `social/service.ts`, et `social/routes.ts:17` importe `content/service.ts`.
- Couplage : `creative/composer.ts` sert de moteur graphique à `video/renderer.ts:8`, `video/service.ts:13`,
  `brand/routes.ts:12` et `social/service.ts:11`. Toute évolution du Creative Studio touche la vidéo.
- Écarts de documentation : `docs/01-architecture.md:56` annonce un worker séparé en production, mais il est intégré
  (`platform-deploy.yml:174`). `docs/03-deploiement.md:105` annonce 60 à 90 USD pour Cloud Run, voir § 6.
  `production.env:17` (commentaire « puis anthropic,mock ») et la valeur réelle `AI_PROVIDERS=anthropic` (ligne 18)
  divergent. Le choix réel est le bon : pas de contenu simulé servi aux clients en cas de panne.

### 3. Modèle de données

- Index manquants utiles (colonnes de jointure sans index en tête ; PostgreSQL n'indexe pas les clés étrangères) :
  - `CreativeConcept.briefId` (`schema.prisma:1043`) : chargement des concepts d'un brief ;
  - `CrmTask.leadId` (`:839`) : tâches d'un lead, effacement d'un contact ;
  - `Publication.socialAccountId` (`:963`) : jointure de `collectMetrics`, déconnexion d'un compte ;
  - `ContentItem.campaignId` (`:510`) : analytics par campagne ;
  - `CreditTransaction.walletId` (`:668`), `AIUsageEvent.workspaceId` (`:620`), `Job.workspaceId` (`:698`) ;
  - `SocialMetricSnapshot.capturedAt` : la purge (`social/retention.ts:12`) filtre sur cette colonne sans index ;
  - `Lead (workspaceId, createdAt)` : `analytics/service.ts:112` filtre sur cette paire, seul `(workspaceId, stage)` existe.
  La liste complète (78 colonnes `...Id` sans index en tête) a été produite par script. La plupart sont des
  colonnes d'audit (`createdById`...) qui n'ont pas besoin d'index.
- Croissance et rétention : seules `RateLimitBucket` (`lib/throttle.ts:34`), les statistiques YouTube et certaines
  analyses (`social/retention.ts:10-22`) sont purgées. Ne sont jamais purgées : `Job` (payload et résultat JSON),
  `AIRun` (entrée et sortie complètes des prompts, `schema.prisma:600-601`), `AIUsageEvent`, `Session` expirées,
  `EmailOutbox`, `OAuthState` expirés, `PaymentEvent`, `CopilotMessage`, et `SocialMetricSnapshot` des autres réseaux.
  `collectMetrics` écrit un instantané par heure et par publication pendant 30 jours (`social/service.ts:155-179`),
  soit jusqu'à 720 lignes par publication. Pour 10 000 clients à 30 posts par mois, cela fait de l'ordre de
  200 millions de lignes par mois. Estimation : la table devient la plus grosse de la base.
- La purge YouTube charge en mémoire toutes les analyses de plus de 30 jours avec leur JSON (`social/retention.ts:13`),
  toutes les heures et sans limite.
- Les tables append-only (`AuditLog`, `CreditTransaction`) sont protégées par des triggers. C'est voulu, mais il faudra
  prévoir un archivage (partition par mois) au-delà de quelques millions de lignes.
- Migrations : 17 migrations Prisma propres, appliquées par un job séparé avec le compte propriétaire avant le
  déploiement (`platform-deploy.yml:150-165`). Point d'attention : l'ancienne révision continue à servir pendant et
  après la migration. Toute migration doit donc rester compatible avec le code précédent (ajouter d'abord, supprimer
  plus tard). Il n'existe aucun retour arrière de migration, et aucune règle écrite à ce sujet.

### 4. File de jobs PostgreSQL et worker intégré (RUN_WORKER_INLINE=true)

Ce qui est solide : réservation `FOR UPDATE SKIP LOCKED` (`jobs/queue.ts:58-68`), backoff exponentiel avec jitter
(`:52-55`), erreurs 4xx non rejouées (`:71-73`), idempotence à l'enfilage (`:18-42`), et publications réservées par mise à
jour conditionnelle (`social/service.ts:47`). Le modèle convient bien à une PME : pas de Redis à exploiter.

Problèmes :

1. Rendu vidéo dans le processus HTTP. `renderVideo` rastérise chaque image de façon synchrone sur le thread
   principal (`video/renderer.ts:270`, `new Resvg(...).render()`). Il y a 30 images par seconde en 1080×1920
   (`renderer.ts:15-17`), et les fichiers temporaires vont dans `/tmp` (`renderer.ts:221`), qui est en mémoire sur
   Cloud Run. Mesure locale (4 cœurs, vidéo de 15 s sans photo, 450 images) : 24,7 s de rendu, boucle d'événements
   bloquée jusqu'à 218 ms (p99 142 ms) en continu, mémoire RSS de 109 à 202 Mo sans compter FFmpeg. Sur Cloud Run
   (2 vCPU partagés avec libx264 et le trafic HTTP), chaque requête de l'instance prend donc +100 à 200 ms pendant
   toute la durée du rendu. Avec 2 boucles de worker (`queue.ts:128`), deux rendus peuvent tourner en même temps.
2. Arrêt brutal. Cloud Run envoie SIGTERM à chaque déploiement ou réduction d'instances, puis tue le processus après
   environ 10 s. `main.ts:15-23` attend la fin des jobs en cours, ce qu'un rendu de 25 à 60 s ou un appel IA (délai de
   120 s, 2 relances, `providers/anthropic.ts:16`) ne permet pas. Le job reste `RUNNING` pendant 10 minutes, puis il
   est remis en file (`queue.ts:108-114`). Conséquences :
   - double débit : les jobs IA débitent avec la clé `${job.id}:${job.attempts}` (`brand/jobs.ts:26`,
     `content/jobs.ts:39`, `video/service.ts:34`...). La nouvelle tentative débite une seconde fois, et le premier débit
     n'est jamais remboursé (l'`AIRun` reste inachevé) ;
   - job poison : `recoverStaleJobs` ne regarde pas `maxAttempts`. Un job qui fait planter l'instance (manque de
     mémoire pendant un rendu, par exemple) est rejoué sans fin, toutes les 10 minutes ;
   - aucune garde à la fin du job : `processJob` met à jour le job sans vérifier `lockedBy` (`queue.ts:80`, `:99`). Un job
     remis en file pendant qu'il tourne encore peut donc être terminé deux fois.
   Le déploiement automatique à chaque push sur la branche de développement (`platform-deploy.yml:8`) multiplie ces arrêts.
3. Planificateur dupliqué. `startScheduler` tourne dans chaque instance (`main.ts:11`). Les tâches de facturation et de
   publication sont protégées par des mises à jour conditionnelles, mais pas `collectMetrics` (`social/service.ts:155`).
   Avec N instances, les API Meta, TikTok et YouTube sont appelées N fois par heure, ce qui consomme leurs quotas. Les
   jetons OAuth peuvent aussi être renouvelés en parallèle (`accessTokenFor`, `social/service.ts:67-79`) : chez les
   fournisseurs qui font tourner le refresh token (TikTok, LinkedIn), cela peut invalider le compte.
   `collectMetrics` prend 500 publications sans tri (`:156-160`) : au-delà, certaines ne sont jamais mesurées.
4. Pool de connexions. `connection_limit` vaut 3 (f1-micro) ou 5 (`gcp-setup.sh:84`) par instance. Ce pool est partagé
   par 40 requêtes HTTP simultanées (`platform-deploy.yml:178`), 2 boucles de worker qui interrogent la base chaque
   seconde, et le planificateur. En pic, Prisma attendra une connexion (délai de 10 s par défaut, puis erreur P2024).
   Avec 4 instances au maximum, plus la révision précédente pendant un déploiement, plus le job de migration, on
   s'approche des 25 connexions d'une db-f1-micro.
5. Montée en charge du worker. Il n'y a qu'un seul ordre de traitement (`ORDER BY runAt`). Pas de priorité : un lot de
   rendus vidéo retarde une réponse du Copilot, qui passe aussi par la file (`copilot/service.ts:163`) alors que
   l'utilisateur attend. Pas de limite par organisation : un client peut monopoliser le worker.

### 5. Performance, budget, stockage, cache

Mesure du build web (`npm run build -w @forlife/web`, Vite 8.3.4, 12,1 s) :

| Fichier | Brut | gzip -9 |
|---|---|---|
| `assets/index-DD0D0ypH.js` | 515 658 o | 150 196 o |
| `assets/index-Cd2paLHZ.css` | 45 118 o | 9 989 o |
| `index.html` | 800 o | 430 o |
| `demo/forlife-presentation.mp4` | 10 767 133 o | |

- Un seul bundle JS : Vite avertit qu'il dépasse 500 ko. Aucun `React.lazy` ni `import()` dans `web/src` : les
  28 pages sont téléchargées dès la page de connexion. Sur un réseau 3G ivoirien (environ 1 Mbit/s effectif) et un
  Android d'entrée de gamme, cela fait environ 1,2 s de téléchargement plus l'analyse du JS. Estimation.
- La police Google Fonts (4 graisses de Poppins) est chargée depuis un domaine tiers et bloque le rendu (`web/index.html:8-10`).
- La vidéo de démo pèse 10,7 Mo. Elle est correctement en `preload="none"` (`components/DemoVideo.tsx:92`), mais
  `firebase.json` ne lui donne pas d'en-tête de cache : c'est le défaut Firebase qui s'applique.
- Stockage : chaque fichier est entièrement téléchargé depuis GCS en mémoire (`storage/storage.ts:49`), puis renvoyé
  par l'API (`video/routes.ts:158`, `brand/routes.ts:225`). Cela consomme de la mémoire et du temps CPU Cloud Run, et
  la sortie réseau passe par Cloud Run au lieu d'URL signées servies directement par GCS. Le cache est seulement
  `private` (`brand/routes.ts:230`, `video/routes.ts:163`) : le CDN de Firebase ne sert rien.
- Les écrans de suivi interrogent l'API toutes les 2 à 3 s (`ContentDetail.tsx:33`, `VideoStudio.tsx:214`). C'est
  acceptable à cette échelle.
- Budget proposé : JS initial ≤ 100 Ko gzip, CSS ≤ 15 Ko gzip, LCP ≤ 2,5 s en 4G lente, latence API p95 ≤ 300 ms
  hors IA, rendu vidéo 15 s ≤ 90 s de bout en bout. L'audit Lighthouse détaillé revient à Grâce (D03) et à Princesse (D05).

### 6. Coût mensuel estimé (ESTIMATION au 07/11/2026, USD, hors taxes)

Prix publics repris de la grille connue, à vérifier dans la console de facturation (non joignable d'ici).
Cloud Run en facturation par instance (CPU toujours allouée) en europe-west1 : environ 0,000018 USD par vCPU-seconde
et 0,000002 USD par Gio-seconde. Anthropic `claude-opus-5-5` : 4 USD par million de tokens en entrée, 20 USD en sortie.
Pour comparaison, `claude-sonnet-5-5` coûte 2 et 10 USD, `claude-haiku-5-5` 0,10 et 0,50 USD.

Socle fixe (trafic faible, situation actuelle) :

| Poste | Calcul | Estimation |
|---|---|---|
| Cloud Run, 1 instance permanente 2 vCPU / 2 Gio (`platform-deploy.yml:178-179`) | 2 × 2,59 M s × 0,000018 + 2 × 2,59 M s × 0,000002 | ≈ 100 USD (le document 03 annonce 60 à 90) |
| Cloud SQL f1-micro ou g1-small, 10 Go SSD, sauvegardes | | 12 à 32 USD |
| Cloud Storage, Artifact Registry (images jamais nettoyées), Hosting, journaux, secrets | | 3 à 10 USD |
| **Total infrastructure** | | **≈ 115 à 145 USD / mois** |

IA (variable). Estimation par tâche avec Opus 5.5 en effort `medium` (réflexion incluse dans la sortie) :
`content.post` environ 3 000 tokens en entrée et 2 500 en sortie, soit 0,06 USD pour 10 crédits ;
`strategy.plan` environ 0,12 USD pour 25 crédits ; `copilot.chat` environ 0,03 USD pour 2 crédits.
Un crédit se vend entre 6,25 FCFA (Agency) et 10 FCFA (Starter, packs), soit environ 0,010 à 0,017 USD
(hypothèse : 1 USD ≈ 600 FCFA).

- `content.post` : coût d'environ 0,006 USD par crédit, prix de vente de 0,010 à 0,017 USD. Marge brute positive mais faible.
- `copilot.chat` : coût d'environ 0,014 USD par crédit, soit autant ou plus que le prix de vente. Le Copilot est
  probablement vendu à perte.
- Imagen 4 (environ 0,04 USD l'image) pour 4 crédits (0,04 à 0,07 USD) : à peu près à l'équilibre.
- TTS Neural2 (environ 16 USD par million de caractères ; une voix de 15 s fait environ 200 caractères) : négligeable.
- Les 200 crédits du plan Free coûtent environ 1,2 à 2,8 USD par compte gratuit actif.

Scénarios (hypothèse : 800 crédits consommés par client et par mois en moyenne) :

| Clients | Infrastructure | IA (Opus 5.5 partout) | Remarque |
|---|---|---|---|
| 100 | ≈ 130 à 160 USD | ≈ 500 à 1 000 USD | l'IA représente déjà plus de 80 % du coût |
| 1 000 | ≈ 400 à 700 USD (2 à 4 instances API + worker séparé, Cloud SQL 2 vCPU HA) | ≈ 5 000 à 10 000 USD | |
| 10 000 | ≈ 2 000 à 4 000 USD (Cloud SQL 8 vCPU HA, worker dédié, stockage vidéo) | ≈ 50 000 à 100 000 USD, ou 25 à 40 % de ce montant avec Sonnet 5.5, Haiku 5.5, le cache de prompt et l'API Batch | |

Les vrais chiffres sont disponibles : `AIRun` enregistre fournisseur, modèle et tokens. Une requête sur la production
donnerait le coût réel par tâche (à confier à José, D04, avec accord du propriétaire).

### 7. Observabilité, résilience, sauvegardes, reprise

- Observabilité : journaux pino avec identifiant de corrélation (`server.ts:44-51`) et `/api/health`, qui ne vérifie
  que la base (`server.ts:83-86`). Rien d'autre : pas de suivi des erreurs, pas de métriques (latence, file, jobs
  `DEAD`), pas d'alerte, pas de sonde de disponibilité, pas d'alerte de budget GCP ni de plafond de dépense Anthropic.
  Un job `DEAD` ou un paiement bloqué passe inaperçu.
- Résilience : Cloud SQL est zonal (`gcp-setup.sh:70`, `--availability-type=zonal`), donc une panne de zone arrête le
  service. Il n'y a qu'une seule région (europe-west1). Imagen s'exécute en us-central1 (`config.ts:68`) : les
  données sortent de l'UE, à signaler pour la conformité (loi ivoirienne sur les données personnelles, RGPD).
- Sauvegardes : 14 sauvegardes quotidiennes, restauration à la minute, protection contre la suppression
  (`gcp-setup.sh:71-72`, `:107-109`). C'est bien. En revanche, aucun test de restauration n'est documenté, aucune copie
  n'existe dans une autre région, et le bucket n'a ni versionnage ni rétention vérifiés (`gcp-setup.sh:190-194`).
- Plan de reprise : aucun runbook. RPO estimé à quelques minutes pour la base, mais non garanti pour les fichiers
  (une suppression dans le bucket est définitive si la suppression réversible par défaut n'est pas active). RTO estimé à
  plusieurs heures, entièrement manuel.
- Déploiement : chaque push sur la branche de développement part en production (`platform-deploy.yml:8`). Il n'y a pas
  de préproduction ni de déploiement progressif (le trafic bascule à 100 %). Le retour arrière d'une révision est
  possible, mais pas celui d'une migration.

### 8. Scalabilité

| Palier | Ce qui casse | Ce qu'il faut |
|---|---|---|
| 100 clients | les rendus vidéo ralentissent l'API ; les jobs interrompus aux déploiements causent des doubles débits | corrections P0 ci-dessous ; l'architecture actuelle suffit |
| 1 000 clients | pool de 3 à 5 connexions, f1-micro, planificateur dupliqué, tables sans purge, aucune alerte, bundle unique | worker séparé (même image, `RUN_WORKER_INLINE=false`, `npm run worker`), planificateur unique (Cloud Scheduler ou verrou consultatif PostgreSQL), Cloud SQL à cœur dédié et HA, purges, index, découpage du bundle, URL signées |
| 10 000 clients | volume de `SocialMetricSnapshot` et `AuditLog`, quotas des réseaux sociaux, coût IA, débit de la file | partitionnement par mois, agrégation quotidienne des statistiques, files séparées par type ou Cloud Tasks, API Batch Anthropic pour les tâches non interactives, modèle par tâche, éventuel réplica en lecture pour l'analytics |

### 9. Configuration de production (`deploy/production.env`)

- `EMAIL_DRIVER=log` (ligne 20) : aucun email ne part. Pas de vérification de compte, donc pas de crédits offerts ;
  pas de mot de passe oublié ; pas d'invitation.
- `EMAIL_FROM=...@forlifecom.ci` (ligne 21) alors que le domaine public est `forlifecomai.ci` (ligne 15). Il faut le
  vérifier avant de brancher Resend (SPF/DKIM).
- `SOCIAL_SANDBOX_ENABLED=true` (ligne 24) en production, et CinetPay absent de `OPTIONAL_SECRETS` (ligne 28) :
  aucun encaissement n'est possible.
- Aucun secret dans le fichier : conforme (seuls des identifiants publics d'applications OAuth y figurent).

## VÉRIFICATIONS

| Commande | Résultat |
|---|---|
| `service postgresql start` puis `cd platform && npm test` | shared : 8/8 ; API : 20 fichiers, 129/129 tests, 132 s (l'audit du 17/10 en comptait 128) |
| `npm run build -w @forlife/web` | succès en 12,1 s ; JS 515 658 o (150 196 o en gzip), CSS 45 118 o (9 989 o) ; avertissement de chunk de plus de 500 ko |
| `npx tsx bench.mts` (script dans le dossier temporaire, qui appelle `renderVideo` sur 5 scènes de 2,5 s plus la carte de fin) | 24,7 s, 450 images, MP4 de 1,18 Mo, latence max de la boucle d'événements 218 ms, p99 142 ms, RSS 109 puis 202 Mo |
| `npm outdated`, `npm view <paquet> version` | voir le tableau du § 1 |
| `npm audit --omit=dev` | 12 vulnérabilités (4 high, 7 moderate, 1 low) |
| Script Python sur `schema.prisma` | 57 modèles, 78 colonnes `...Id` sans index en tête |
| Script d'analyse des imports entre modules | 10 cycles via `jobs`, 1 cycle métier `content` / `social` |
| `git status` après les commandes | propre (`dist` est ignoré, aucun fichier du dépôt modifié) |

Non vérifié : tier réel de Cloud SQL, nombre réel d'instances, volumes et coûts réels (pas d'accès à GCP ni à la
production, conformément au brief) ; le rendu dans un conteneur 2 vCPU limité ; le Lighthouse mobile ; la grille
tarifaire GCP du jour.

## HYPOTHÈSES

- Prix GCP et Anthropic de la grille publique (Anthropic : fiche modèle à jour au 06/10/2026). Taux de change de
  1 USD ≈ 600 FCFA. Consommation moyenne de 800 crédits par client et par mois.
- Tokens par tâche estimés à partir des `maxTokens` des prompts (`ai/prompts.ts:346`, `:411`, `:471`, `:537`) et de la
  taille probable du contexte, sans mesure réelle.
- Cloud SQL en db-f1-micro ou db-g1-small, selon le choix fait dans `gcp-setup.sh:58-64`.

## RISQUES ET POINTS OUVERTS

1. Rentabilité : le coût IA par crédit est peut-être supérieur au prix de vente sur certaines tâches (Copilot). C'est
   un risque financier direct dès l'ouverture du plan Free.
2. Intégrité des crédits : un arrêt d'instance pendant un job peut débiter deux fois. C'est un risque de litige et de confiance.
3. Expérience utilisateur dégradée pendant les rendus vidéo, plus visible à mesure que la vidéo est adoptée.
4. Aucune alerte : un incident (paiements, publications ou jobs en échec) n'est découvert que par les clients.
5. Panne de zone Cloud SQL : service arrêté, sans HA.
6. Quotas et jetons des réseaux sociaux épuisés ou invalidés par le planificateur dupliqué.
7. Croissance non bornée des tables (statistiques, jobs, exécutions IA) : coûts de stockage et lenteurs à moyen terme.
8. Dépendances : Prisma 6 et le SDK Anthropic 0.x prennent du retard ; Node 22 arrive en fin de vie le 30/04/2027.
9. Données traitées en us-central1 (Imagen) : point juridique à valider.

## SUGGESTIONS PRIORISÉES

| # | Priorité | Suggestion | Effort | Agent |
|---|---|---|---|---|
| 1 | P0 | Sortir le rendu vidéo du processus HTTP : déployer un second service Cloud Run « forlife-worker » (même image, `npm run start:worker`, `RUN_WORKER_INLINE=false` pour l'API, min 0 ou 1 instance, CPU toujours allouée), ou au minimum rastériser dans un `worker_thread` | M | Brice (déploiement), José (code) |
| 2 | P0 | Fiabiliser la file : clé de débit IA stable par job (`job.id` et non `job.id:attempts`), ou remboursement de l'`AIRun` orphelin à la récupération ; `recoverStaleJobs` qui passe en `DEAD` au-delà de `maxAttempts` ; garde `lockedBy` sur la fin du job ; battement de cœur pour les jobs longs | M | José |
| 3 | P0 | Mesurer le coût réel par tâche dans `AIRun` (tokens, modèle), puis choisir le modèle et l'effort par tâche (Haiku 5.5 ou Sonnet 5.5 pour `crm.followup` et le Copilot simple), ajouter le cache de prompt sur les longs prompts système, et revoir la grille de crédits si nécessaire. Plafond de dépense côté Anthropic | M | José, avec Elisée (décision prix) |
| 4 | P0 | Avant d'ouvrir au public : brancher Resend avec le bon domaine expéditeur (`forlifecomai.ci`), CinetPay, et décider de `SOCIAL_SANDBOX_ENABLED` | S (configuration) | Brice, propriétaire |
| 5 | P1 | Supervision minimale : sonde de disponibilité sur `/api/health`, alertes sur les journaux (erreurs 500, « Erreur non gérée », jobs `DEAD`, paiements en attente), alerte de budget GCP, Error Reporting | S | Brice |
| 6 | P1 | Planificateur unique : verrou consultatif PostgreSQL (`pg_try_advisory_lock`) autour de chaque tâche, ou Cloud Scheduler qui appelle un point d'entrée protégé ; tri et pagination de `collectMetrics` ; verrou sur le renouvellement des jetons OAuth | S | José |
| 7 | P1 | Purges planifiées (Job terminé de plus de 90 j, AIRun : vider entrée et sortie après 90 j, Session et OAuthState expirés, EmailOutbox de plus de 30 j) ; agrégation quotidienne de `SocialMetricSnapshot` après 7 j ; politique de nettoyage Artifact Registry | M | José, Brice |
| 8 | P1 | Index : `CreativeConcept.briefId`, `CrmTask.leadId`, `Publication.socialAccountId`, `ContentItem.campaignId`, `Lead(workspaceId, createdAt)`, `SocialMetricSnapshot.capturedAt` ; règle écrite « migrations compatibles avec la version précédente » | S | José |
| 9 | P1 | Découper le bundle web par route (`React.lazy`) avec un budget en CI (JS initial ≤ 100 Ko gzip) ; police auto-hébergée ou `font-display` maîtrisé ; en-tête de cache pour `/demo/**` | S | Grâce, Princesse |
| 10 | P1 | Préproduction (projet ou service séparé) ; production déployée seulement depuis `main`, avec approbation manuelle et trafic progressif (`--no-traffic` puis bascule) | M | Brice |
| 11 | P1 | Montées de version sans changement de majeure (zod 4.6.7, fastify 5.12.8 et les autres) ; planifier Prisma 7, @google-cloud/storage 8, SDK Anthropic 1.x, et Node 24 avant avril 2027 | S puis M | José, Caporal |
| 12 | P1 | Plan de reprise : test de restauration Cloud SQL trimestriel documenté, suppression réversible et versionnage du bucket, export hebdomadaire vers une autre région, runbook d'incident | M | Brice, David |
| 13 | P2 | Servir les fichiers par URL signées GCS (ou cache public pour les rendus immuables) au lieu de les faire transiter en mémoire par l'API | M | José |
| 14 | P2 | Priorités dans la file (Copilot avant rendu vidéo) et limite de jobs simultanés par organisation | S | José |
| 15 | P2 | Cloud SQL HA et cœur dédié dès environ 300 clients payants ; Imagen en `europe-west*` si le modèle y est disponible | S (configuration) | Brice |
| 16 | P2 | Rangement : déplacer `jobs/handlers.ts` et `jobs/scheduler.ts` dans la racine de composition, casser le cycle `content` / `social`, extraire un module « graphics » de `creative/composer.ts` ; corriger les documents 01 et 03 | S | José, David |

## SUITE PROPOSÉE

1. José (D04) : confirmer et chiffrer les points 2, 6, 7 et 8 ; extraire le coût IA réel par tâche si le propriétaire l'autorise.
2. Brice (D10) : chiffrer le service worker séparé, la supervision et la préproduction (points 1, 5, 10 et 12).
3. Grâce (D03) et Princesse (D05) : budget de bundle et mesure Lighthouse mobile.
4. Caporal (D06) : avis npm, région Imagen, accès direct `*.run.app`.
5. Elisée (D11) : arbitrer la grille de crédits une fois le coût IA mesuré.

Document d'accompagnement : `/home/user/FORLIFE/.equipe/architecture.md` (architecture existante).
