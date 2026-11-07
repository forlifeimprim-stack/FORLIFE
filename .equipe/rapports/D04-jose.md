# D04 : Diagnostic back-end de Forlife Com (José, 07/11/2026)

## STATUT

TERMINÉ. Diagnostic en lecture seule de `platform/apps/api`. Aucune modification du code, de la configuration ni de git.
Les preuves dynamiques viennent de tests temporaires exécutés sur la base de test locale, puis supprimés du dépôt
(copies dans le scratchpad, voir VÉRIFICATIONS).

## RÉSUMÉ

L'API est saine dans ses fondations : 134 routes, toutes validées par zod, contrôle d'accès tenant systématique
(`requireWorkspace` / `requireOrg` renvoient 404 sur la ressource d'un autre, vérifié), registre de crédits atomique
(mise à jour conditionnelle, contrainte `balance >= 0`, tables append-only), paiements dont le montant est calculé
côté serveur en entiers XOF et dont le statut est toujours relu auprès du prestataire. Les 137 tests passent et le
typage est propre. Les migrations correspondent exactement au schéma (aucune dérive).

Les défauts sont concentrés sur ce qui se passe « entre deux états » : reprise des jobs, concurrence et arrêt d'instance.
J'ai prouvé par test :

1. **Double débit** d'un job IA repris après arrêt d'instance (200 → 180 crédits pour un seul contenu) : constat de Zana confirmé.
2. **Job poison** rejoué sans fin (4 tentatives pour `maxAttempts = 2`) et **fin de job sans garde** : confirmés.
3. **Le correctif naturel du point 1 (clé stable) crée un autre bug** : un débit rejoué n'est jamais remboursé, alors que
   le message dit « Vos crédits ont été remboursés ».
4. **Idempotence en concurrence** : deux requêtes simultanées avec la même `Idempotency-Key` donnent 202 et **500**
   (5 fois sur 5). Même 500 pour une inscription ou un paiement en double. C'est le pendant serveur de F02 (Grâce).
5. **7 générations IA sur 13 n'acceptent aucune clé d'idempotence** : chaque clic en plus débite (pendant serveur de F01/F03).
6. **Rafraîchissement de session limité à 10/min par IP pour tous les comptes** : le 11e utilisateur derrière la même IP
   reçoit 429 (U07 d'Aya confirmé). Deux onglets qui rafraîchissent ensemble : l'un reçoit 401.
7. **Webhook CinetPay sans authentification** (accepté en 200 sans signature), atténué par la relecture du statut.

Rien n'empêche d'ouvrir à 100 clients une fois les P0 corrigés (environ 5 à 8 jours de travail back-end).

## CONSTATS

### 1. Inventaire des routes (`src/modules`, script d'analyse dans le scratchpad)

134 routes (133 dans les modules, plus `/api/health`). Pour chacune : authentification, contrôle d'accès, validation zod.

| Module | Routes | Publiques | Authentification et accès | Remarque |
|---|---|---|---|---|
| identity | 9 | 7 | `authenticate` + session vérifiée en base (cache 5 s) | voir B07, B08, B09 |
| org (dont invitations) | 12 | 2 | `requireOrg` | invitations : jeton dans le corps |
| admin | 9 | 0 | `requirePlatformAdmin` (404 sinon) | `claim` protégé par jeton + liste d'emails |
| brand, strategy, content, approvals, campaigns, creative, video, social, crm, copilot, analytics, jobs, governance | 96 | 3 | `requireWorkspace(permission)` ; suppression d'organisation : `requireOwner` | aucun trou trouvé |
| payments | 7 | 3 | `requireOrg(billing:*)` | webhook : B10 |

Validation : toutes les routes qui lisent paramètres, requête ou corps passent par `parse(schema)` (`lib/validation.ts`).
Les 4 routes sans `parse` (`refresh`, `logout`, `/api/me`, `resend-verification`) ne lisent aucune entrée.
Gestion d'erreur : un gestionnaire unique (`server.ts:72-81`) au format `{ error: { code, message, details }, correlationId }`,
avec trois écarts (B19).

Contrôle des 4 cas sur une ressource précise (test P13, route `GET /jobs/:id` et `GET /orgs/:id/payments`) :
appel valide 200 ; sans authentification 401 ; job de A demandé par B via son propre espace 404, via l'espace de A 404 ;
paiements de A demandés par B 404 ; entrée vide 400 `BAD_REQUEST`. Les tests existants (`tenancy.test.ts`) couvrent le reste.

Routes publiques et limites de débit :

| Route | Limite | Stockage du compteur |
|---|---|---|
| toutes | 300/min par IP (`server.ts:66`) | mémoire de l'instance |
| `POST /auth/signup` | 10/min par IP + 20/h par IP | mémoire + base |
| `POST /auth/login` | 10/min par IP + 10 échecs / 15 min par compte | mémoire + base |
| `POST /auth/refresh` | 10/min par IP (`identity/routes.ts:63`, `:128`) | mémoire |
| `POST /auth/forgot-password`, `reset-password` | 5/min par IP ; 3 emails/h par adresse | mémoire + base |
| `POST /auth/verify-email` | 10/min par IP | mémoire |
| `POST /invitations/lookup`, `accept` | 20/min, 10/min par IP | mémoire |
| `POST /public/forms/:slug` | 5/min par IP + 200/h par formulaire + 3/jour par numéro | mémoire + base |
| `GET /public/forms/:slug`, `GET /public/media/:id` | global seulement | mémoire |
| `POST /public/payments/cinetpay/notify` | 120/min par IP + 1 vérification / 10 s par paiement | mémoire + base |
| `POST /public/payments/demo/*` | global ; coupées en production (`PAYMENT_SANDBOX_ENABLED=false`) | |

Il n'y a pas d'OTP dans l'application (seulement des liens email). `@fastify/rate-limit` n'a pas de magasin partagé :
avec 4 instances, chaque limite « mémoire » est multipliée par 4.

### 2. Constats détaillés

**B01 · ÉLEVÉ · Double débit d'un job IA repris après arrêt d'instance (constat D01 confirmé)**
- Fichiers : clé `${job.id}:${job.attempts}` dans `content/jobs.ts:39` et `:69`, `brand/jobs.ts:26`, `strategy/jobs.ts:40`,
  `crm/jobs.ts:35`, `campaigns/jobs.ts:32`, `social/audit.ts:285`, `creative/service.ts:173`, `video/service.ts:34`,
  `copilot/service.ts:215` ; `claimNext` incrémente `attempts` (`jobs/queue.ts:61`) ; `recoverStaleJobs` (`queue.ts:108-114`).
- Preuve (test P1) : le handler `ai.content_post` débite et écrit le contenu, l'instance « meurt » avant la mise à jour
  du job, la récupération le remet en file, une autre instance le rejoue. Résultat : deux `CONSUME` de 10 crédits
  (`ai:<job>:1` et `ai:<job>:2`), 0 remboursement, solde 200 → 180 pour un seul contenu.
- Scénario : chaque déploiement (push sur la branche de développement) envoie SIGTERM ; `main.ts:15-23` attend la fin
  des jobs mais Cloud Run tue le processus après environ 10 s, alors qu'un appel IA peut durer jusqu'à 120 s par essai.
  Le même double débit arrive si le handler échoue après `runAI` (écriture en base) : la nouvelle tentative débite de nouveau.
- Correction : clé de débit stable par job et par étape (`ai:${job.id}` ; `ai:${job.id}:${i}` si plusieurs appels),
  avec B04 corrigé en même temps ; à la récupération d'un job, solder les `AIRun` restés en cours. Effort S (clés) + S (B04).

**B02 · ÉLEVÉ · Job poison rejoué sans fin (constat D01 confirmé)**
- Fichier : `jobs/queue.ts:108-114` remet en `QUEUED` sans regarder `attempts` ni `maxAttempts`.
- Preuve (test P2) : après 4 « plantages » simulés, le job est `QUEUED` avec `attempts = 4` pour `maxAttempts = 2`.
- Scénario : un rendu vidéo qui épuise la mémoire fait tomber l'instance toutes les 10 minutes, pour toujours ; le
  projet vidéo reste en `RENDERING`, les crédits ne sont jamais remboursés (le remboursement n'existe que dans le `catch`,
  `video/service.ts:166-175`).
- Correction : dans `recoverStaleJobs`, passer en `DEAD` (avec `lastError = "Interrompu"`) les jobs où `attempts >= maxAttempts`,
  et appeler le nettoyage métier du type (remboursement vidéo, contenu `FAILED`, message Copilot `FAILED`). Effort S.

**B03 · MOYEN · Fin de job sans garde `lockedBy` : un worker évincé écrase l'état**
- Fichier : `jobs/queue.ts:80-83` et `:88-102` (`where: { id }` seulement).
- Preuve (test P3) : A réserve le job, il est récupéré, B le réserve ; A termine et écrit `SUCCEEDED` pendant que B
  travaille encore (`lockedBy = worker-B`).
- Correction : `updateMany({ where: { id, lockedBy: workerId, status: "RUNNING" } })` et battement de cœur
  (`lockedAt = now()` toutes les 60 s pendant le job) pour les jobs longs. Effort S.

**B04 · MOYEN (latent, à corriger avec B01) · Débit rejoué jamais remboursé, message trompeur**
- Fichier : `ai/gateway.ts:73`, `:76`, `:126-135` : remboursement seulement `if (!charge.replayed)`.
- Preuve (test P11) : un débit de 8 crédits existe sous la clé `ai:K` (tentative morte), la tentative suivante avec la même
  clé échoue chez le fournisseur ; l'erreur dit « La génération IA a échoué. Vos crédits ont été remboursés. »,
  0 remboursement, solde 192.
- Scénario : aujourd'hui rare (clé différente à chaque tentative), mais certain dès que B01 est corrigé par une clé stable.
- Correction : rembourser si le débit existe et qu'aucun `AIRun` réussi n'y est rattaché (clé `ai-refund:` déjà idempotente),
  sans condition sur `replayed`. Effort S.

**B05 · MOYEN · Violations d'unicité non traitées en concurrence : 500 au lieu du rejeu idempotent**
- Fichiers : `content/routes.ts:197-237` (vérification puis `enqueue` dans une transaction) ; `jobs/queue.ts:36-39`
  (le rattrapage de `P2002` relit dans une transaction déjà annulée par PostgreSQL) ; `identity/routes.ts:70-76` ;
  `payments/service.ts:148-157`.
- Preuve (test P4) : 5 doubles envois simultanés avec la même `Idempotency-Key` sur `contents/generate` : codes
  `202,500` cinq fois, corps `{"error":{"code":"INTERNAL",...}}`. Pas de doublon en base (bien), mais le second client
  reçoit une erreur et le journal note « Erreur non gérée ». Test P7 (inscription simultanée, même email) : `500,201`.
  Test P8 (paiement simultané, même `requestId`) : `201,500`.
- Lien : c'est exactement le cas que produira le hook `useAction()` proposé par Grâce (F02) si un double appui passe.
- Correction : verrou consultatif `pg_advisory_xact_lock(hashtext(key))` en début de transaction, ou `INSERT ... ON CONFLICT DO NOTHING`
  puis relecture hors transaction ; traduire `P2002` en 409 (inscription) ou en rejeu (paiement, job) dans le gestionnaire
  d'erreurs. Effort S.

**B06 · ÉLEVÉ · 7 générations facturées sans aucune idempotence serveur (pendant serveur de F01, F02, F03)**
- Acceptent une clé : `content/ideas` et `contents/generate` (en-tête), `strategy/plans/generate` (`strategy/routes.ts:127`),
  `campaigns/:id/pack` (`campaigns/routes.ts:138`), rendu vidéo et rendu de visuel (`requestId` obligatoire).
- N'en acceptent pas : Brand DNA (`brand/routes.ts:151`), analyse des réseaux (`social/routes.ts:208`), concepts créatifs
  (`creative/routes.ts:62`), storyboard vidéo (`video/routes.ts:68`), relance CRM (`crm/routes.ts:174`), nouvelle conversation
  Copilot (`copilot/routes.ts:84-93`), création de prospect (`crm/routes.ts:75`).
- Preuve : lecture de code ; mesures de Grâce (3 prospects pour 3 clics, 2 conversations Copilot facturées). Le verrou par
  conversation (`copilot/routes.ts:132-134`) protège bien un même fil, mais pas la création de deux conversations.
- Coût : Brand DNA 15 crédits, analyse 12, storyboard 8 par clic supplémentaire.
- Correction : accepter partout `Idempotency-Key` (ou `requestId`) avec une portée `type:workspace:user:clé`, et refuser
  un second job du même type en cours pour la même ressource (brief, projet, lead). Effort S à M.

**B07 · ÉLEVÉ · Rafraîchissement de session limité par IP partagée, et onglets concurrents déconnectés (U07 confirmé)**
- Fichiers : `identity/routes.ts:63` et `:128` ; `identity/sessions.ts:239-256`.
- Preuve (test P5) : 12 utilisateurs différents, même IP cliente : `200` ×10 puis `429,429`. Test P6 : deux rafraîchissements
  simultanés du même cookie : `401 "Session révoquée"` et `200`. Le front (F05) traite ces deux réponses comme une déconnexion.
- Scénario : NAT d'opérateur mobile en Côte d'Ivoire ; un utilisateur avec deux onglets.
- Correction : limite par empreinte du cookie (`sha256(token)`), par exemple 30/min, et non par IP ; pendant la fenêtre de
  grâce de 10 s, renvoyer 409 `REFRESH_RACE` (le client relit le nouveau cookie et réessaie) au lieu de 401. Effort S.

**B08 · MOYEN · Adresse IP falsifiable sur l'URL directe Cloud Run (à confirmer par Caporal)**
- Fichiers : `lib/request.ts:15-19` fait confiance à `fastly-client-ip` et `x-fah-client-ip` sans condition ;
  `platform-deploy.yml:177` déploie avec `--allow-unauthenticated` et sans restriction d'entrée (`--ingress`).
- Preuve : le test P5 a fixé l'IP cliente avec un simple en-tête `fastly-client-ip` ; l'API l'a utilisée comme clé.
- Scénario : un robot qui appelle `*.run.app` change d'IP à chaque requête et contourne les limites par IP (inscriptions
  20/h, connexion, formulaires).
- Correction : `--ingress internal-and-cloud-load-balancing` ou vérification d'un en-tête secret posé par Hosting ;
  ne lire ces en-têtes que dans ce cas. Effort S. Détail à Caporal (D06).

**B09 · FAIBLE · Verrouillage de compte déclenchable par un tiers (à confirmer par Caporal)**
- Fichier : `identity/routes.ts:114-121` : 10 échecs par email et par 15 min, quelle que soit l'IP.
- Scénario : n'importe qui bloque la connexion d'un client connu en envoyant 10 mauvais mots de passe toutes les 15 minutes.
- Correction : compteur par (email, IP) en plus du compteur par email, avec un seuil par email plus haut. Effort S.

**B10 · MOYEN · Webhook CinetPay non authentifié et historique des notifications absent**
- Fichiers : `payments/routes.ts:91-100` ; `config.ts:192-194` (aucune clé secrète CinetPay) ; `schema.prisma:1199`
  documente un type `NOTIFY` jamais écrit.
- Preuve (test P9) : `POST /api/public/payments/cinetpay/notify` avec un corps arbitraire et sans signature : `200 {"ok":true}`.
- Ce qui est bien : la notification ne fait que déclencher `reconcile`, qui relit le statut chez CinetPay
  (`payments/service.ts:177-210`), contrôle montant et devise, et livre une seule fois dans une transaction
  (`service.ts:222-252`). Le statut ne peut donc pas être falsifié.
- Risque restant : on ne peut pas distinguer une vraie notification d'une fausse, ni prouver la réception en cas de litige ;
  une notification pour une référence inconnue ou un paiement déjà réglé n'est pas tracée.
- Correction : ajouter `CINETPAY_SECRET_KEY` (Secret Manager) et vérifier l'en-tête `x-token` (HMAC SHA-256 selon la
  documentation CinetPay, à relire avant d'implémenter) ; enregistrer chaque notification en `PaymentEvent NOTIFY`
  (référence, IP, signature valide ou non). Effort S.

**B11 · MOYEN · Appels CinetPay sans délai et planificateur sans garde de chevauchement**
- Fichiers : `payments/providers.ts:331` (`fetch` sans `AbortSignal`) ; `jobs/scheduler.ts:196-208` et `:229` (`setInterval`
  sans drapeau « en cours ») ; `payments/service.ts:269-284` (jusqu'à 350 vérifications séquentielles par passage).
- Scénario : CinetPay lent ; le passage de 5 minutes ne finit pas, le suivant démarre par-dessus, et les renouvellements
  d'abonnement et les purges du même passage attendent derrière. La création d'un paiement peut aussi bloquer la requête
  HTTP jusqu'au délai Cloud Run (300 s).
- Correction : `AbortSignal.timeout(15_000)` sur `call` ; drapeau `running` par tâche ; renouvellements dans une tâche
  séparée des paiements. Effort S.

**B12 · MOYEN · Allocation mensuelle perdue si l'instance s'arrête pendant le renouvellement**
- Fichier : `billing/ledger.ts:184-194` : la période avance (`updateMany`) puis l'allocation est versée hors transaction.
- Scénario : arrêt entre les deux ; au passage suivant, l'abonnement n'est plus « dû » et `grantMonthlyAllowance` n'est
  plus appelé pour cette période. Le client paie et ne reçoit pas ses crédits du mois.
- Correction : verser l'allocation dans la même transaction (`ledger.creditInTx`), ou rattrapage idempotent
  (`allowance:${org}:${période}` existe déjà) des abonnements actifs sans allocation pour leur période. Effort S.

**B13 · MOYEN · Publication sociale non idempotente côté réseau, et réservation non atomique**
- Fichiers : `social/service.ts:130-134` ; `social/meta.ts:84` et `linkedin.ts:99` ignorent la clé d'idempotence ;
  `social/service.ts:47-49` (réservation puis `enqueue` séparés).
- Scénario 1 : Meta publie, puis la réponse se perd (délai de 30 s, `meta.ts:46`) ou l'instance s'arrête avant la mise à jour
  `PUBLISHED`. La nouvelle tentative (erreur `TRANSIENT`) republie : le client voit son post deux fois.
- Scénario 2 : `enqueue` échoue après la réservation : la publication reste `PUBLISHING` pour toujours, sans job.
- Correction : écrire un état `SUBMITTING` avec horodatage avant l'appel réseau ; à la reprise d'une publication dans cet
  état, chercher le post par texte ou date sur le compte avant de republier, sinon passer en `FAILED` avec action manuelle ;
  réservation et `enqueue` dans une même transaction. Effort M.

**B14 · MOYEN · Rafraîchissement concurrent des jetons OAuth et relevés dupliqués (constat D01 confirmé)**
- Fichiers : `social/service.ts:67-79` (aucun verrou) ; `jobs/scheduler.ts:218-226` dans chaque instance (`main.ts:11`) ;
  `social/service.ts:155-160` (500 publications sans tri, un appel de jeton par publication).
- Scénario : TikTok et YouTube renvoient un nouveau refresh token ; deux instances rafraîchissent en même temps, l'une
  enregistre un jeton déjà invalidé ; le compte passe `EXPIRED` à la publication suivante. Chaque instance consomme le quota
  des API toutes les heures.
- Correction : `SELECT ... FOR UPDATE` sur `SocialCredential` (ou verrou consultatif par compte) autour du rafraîchissement,
  avec relecture du jeton après verrou ; planificateur unique (verrou consultatif ou Cloud Scheduler) ; `collectMetrics`
  trié par `publishedAt` et regroupé par compte. Effort S.

**B15 · MOYEN · LinkedIn : jeton jamais renouvelé, expiration silencieuse**
- Fichiers : `social/linkedin.ts` n'a pas de méthode `refresh` (le refresh token est pourtant stocké, `:79`) ; `service.ts:72`.
- Scénario : environ 60 jours après la connexion, la publication programmée échoue en `AUTH` le jour J, sans préavis.
- Correction : implémenter `refresh` LinkedIn si l'application a les droits, sinon prévenir le client 7 jours avant
  `expiresAt` (email + badge). Effort S.

**B16 · FAIBLE · Limites des réseaux : nouvelles tentatives trop rapprochées**
- Fichiers : `jobs/queue.ts:52-55` (2 s, 4 s, 8 s) ; `social/service.ts:49` (`maxAttempts: 4`) ; adaptateurs : `Retry-After`
  et le quota journalier YouTube ne sont pas pris en compte (`youtube.ts:73-74`).
- Scénario : quota YouTube épuisé, les 4 tentatives échouent en 15 s et la publication est `FAILED` alors qu'elle passerait le lendemain.
- Correction : `SocialError` porte un `retryAfterMs` ; la file l'utilise pour `runAt`. Effort S.

**B17 · MOYEN · Pack de campagne repris : contenus orphelins bloqués en « génération »**
- Fichier : `campaigns/jobs.ts:36-49` : à chaque tentative, nouvelle liste d'idées (nouveau débit, B01) et nouveaux
  `ContentItem`, mais `enqueue` avec la clé stable `pack-post:${job.id}:${i}` renvoie le job de la tentative précédente.
- Scénario : échec après 2 des 5 contenus ; la reprise crée 5 nouveaux contenus en `GENERATING`, dont 2 ne seront jamais remplis.
- Correction : créer contenus et jobs dans une transaction, ou rattacher les contenus au job (`sourceJobId`) et les réutiliser. Effort S.

**B18 · FAIBLE · Annuler la réponse du Copilot bloque la conversation**
- Fichier : `jobs/routes.ts:261-265` remet seulement le contenu en brouillon, pas le message Copilot.
- Preuve (test P12) : annulation 200 ; message suivant 409 « Le Copilot prépare déjà une réponse » ; message assistant `PENDING` pour toujours.
- Correction : exclure `ai.copilot_reply` de l'annulation, ou passer le message en `FAILED`. Effort S.

**B19 · FAIBLE · Format d'erreur pas tout à fait unique**
- Preuve (test P10) : la limite de débit répond 429 avec `{"error":{"code":"BAD_REQUEST","message":"Rate limit exceeded, retry in 1 minute"}}`
  (anglais, mauvais code) ; `server.ts:76-77` reprend `err.code ?? "BAD_REQUEST"`. Pas de `setNotFoundHandler` : une route
  inconnue renvoie le format Fastify. `P2002` donne 500 (B05).
- Correction : `errorResponseBuilder` du limiteur (`RATE_LIMITED`, message français, en-tête `Retry-After`), gestionnaire 404,
  traduction des erreurs Prisma connues. Effort S.

**B20 · MOYEN · Configuration : variables non documentées**
- `.env.example` (`apps/api/.env.example`) ne liste pas 20 des 47 variables de `config.ts` : `NODE_ENV`, `ACCESS_TOKEN_TTL_SECONDS`,
  `REFRESH_TOKEN_TTL_DAYS`, `MAX_UPLOAD_BYTES`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_API_VERSION`,
  `LINKEDIN_ORG_SCOPES`, `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `YOUTUBE_API_KEY`,
  `IMAGE_PROVIDER`, `IMAGE_MODEL`, `VERTEX_LOCATION`, `GOOGLE_CLOUD_PROJECT`, `TTS_PROVIDER`, `YOUTUBE_PRIVACY`, `CINETPAY_API_URL`.
- Lues hors du schéma validé : `WORKER_CONCURRENCY` (`worker.ts:11`), `APP_DATABASE_URL` (`ops/`).
- Manque pour CinetPay : la clé secrète du webhook (B10). Le commentaire « false en production » de `RUN_WORKER_INLINE`
  contredit la production (`platform-deploy.yml:174`, `true`).
- Aucun secret réel dans les fichiers versionnés ; `apps/api/.env` est ignoré par git. Effort S.

**B21 · MOYEN · Modèle de données : contraintes et index**
- Migrations : 17, chacune écrite en une seule fois (`git log`), aucune dérive entre migrations et schéma
  (`prisma migrate diff` : « No difference detected »). Contrainte `balance >= 0` et triggers append-only présents
  (`20261010174314_init/migration.sql:707-721`).
- Contraintes absentes : statuts en texte libre sans `CHECK` (`Payment.status`, `kind`, `provider`, `Subscription.status`,
  `Organization.status`, `Publication.status`...) ; pas de `CHECK (amount > 0)` sur `Payment`, ni `credits >= 0` ;
  `Job` sans clé étrangère vers `Organization` (`schema.prisma:695-719`).
- Index (en plus de la liste de Zana, que je confirme : `Publication.socialAccountId`, `Lead(workspaceId, createdAt)`,
  `CrmTask.leadId`, `CreativeConcept.briefId`, `SocialMetricSnapshot.capturedAt`) :
  `Publication(status, publishedAt)` pour `collectMetrics` (`social/service.ts:157`) ; `Lead(workspaceId, wonAt)` pour
  `analytics/service.ts:116` ; `Session(expiresAt)` et `Job(status, finishedAt)` pour les purges à créer.
- Croissance : confirmée (D01 §3) ; ajouter `Session` expirées, `OAuthState`, `PasswordReset`, `EmailVerification` aux purges.
- Correction : une migration additive (`CHECK ... NOT VALID` puis `VALIDATE`, index `CONCURRENTLY` hors Prisma). Effort S.

**B22 · FAIBLE · Performance : listes tronquées sans pagination, agrégats en mémoire**
- Listes plafonnées sans curseur : prospects 500 (`crm/routes.ts:53`), contenus 200 (`content/routes.ts:80`), publications 200
  (`social/routes.ts:148`), tâches 200. Au-delà, des données disparaissent sans message. Seul le journal d'audit est paginé
  (`org/routes.ts:130-135`).
- Sans limite : `social/routes.ts:172` (publications de 30 jours avec métriques), `analytics/service.ts:112-116` (tous les
  prospects de la période chargés puis comptés en JavaScript, à remplacer par `groupBy`).
- N+1 modéré : `requireWorkspace` appelé deux fois par génération (`content/routes.ts:183-184`) ; `/api/me` fait une requête
  par organisation (`identity/routes.ts:151-161`) ; `collectMetrics` un appel de jeton par publication.
- Correction : pagination par curseur (`createdAt, id`) sur les 4 listes, `groupBy` en analytics. Effort M.

**B23 · FAIBLE · Calcul des mois en débordement**
- Fichier : `billing/ledger.ts:162-166`. Preuve (`node`, UTC) : 31/01/2027 + 1 mois = 03/03/2027 ; 31/03 + 1 = 01/05.
- Effet : périodes décalées pour les abonnements souscrits un 29, 30 ou 31. Correction : borner au dernier jour du mois. Effort S.

**B24 · FAIBLE · `EmailOutbox` n'est qu'un journal : aucun renvoi**
- Fichier : `mail/mailer.ts:39-43`. Un échec Resend est noté `FAILED` et l'email de confirmation est perdu, ce qui aggrave U01
  (aucun crédit sans confirmation). Correction : renvoi planifié des `FAILED` (3 essais). Effort S.

**B25 · FAIBLE · Concepts créatifs repris : images IA régénérées et fichiers orphelins**
- Fichier : `creative/service.ts:183-188` : `deleteMany` des concepts puis régénération ; le débit image est rejoué (clé stable
  `${job.id}:${i}`, pas de double facture) mais Imagen est rappelé (coût réel) et les anciens fonds restent dans le bucket.
- Correction : réutiliser `backgroundKey` existant pour le même index, supprimer les fichiers remplacés. Effort S.

### 3. Synthèse par sujet demandé

- File de jobs : réservation `SKIP LOCKED` correcte (test existant à 8 workers). Défauts : B01, B02, B03, pas de battement
  de cœur, pas de priorité ni de limite par organisation (D01 §4.5), aucun test de `recoverStaleJobs` ni de l'arrêt.
  À l'arrêt : `main.ts:15-23` arrête le planificateur, attend les boucles, ferme HTTP ; au-delà de 10 s, Cloud Run tue le processus.
  Jobs morts : passent bien en `DEAD` en cas d'erreur répétée (`queue.ts:86-97`), jamais en cas de plantage (B02), et rien ne
  les signale (D01 §7).
- Paiements : montant serveur en entiers XOF (`payments/service.ts:151-154`, `shared/billing.ts:111-114` arrondi à 5 FCFA) ;
  statut relu (`reconcile`) ; livraison unique et atomique ; balayage des paiements en attente et livraison tardive jusqu'à 7 jours ;
  historique `PaymentEvent` (CREATED, CHECK, FULFILLED, EXPIRED, FAILED). Manques : B10, B11, B05 (P8), pas de gestion des
  remboursements ou contestations côté prestataire, l'écart de montant passe en `FAILED` sans `PaymentEvent`.
- Crédits et ledger : atomicité et concurrence correctes (test existant, P1 montre bien deux débits distincts et jamais de solde
  négatif). Remboursements : B04. Renouvellement : B12.
- Social : jetons chiffrés AES-256-GCM, état OAuth à usage unique lié à l'utilisateur, erreurs traduites par réseau. Manques :
  B13, B14, B15, B16.

## VÉRIFICATIONS

| Commande | Résultat réel |
|---|---|
| `service postgresql start` | PostgreSQL 16 démarré |
| `cd platform && npm test` | shared 8/8 ; API 20 fichiers, 129/129 tests, 123,6 s ; code de sortie 0 |
| `npm run typecheck` | shared, API et web : aucune erreur ; code de sortie 0 |
| `npx prisma migrate diff --from-url <base de test migrée> --to-schema-datamodel prisma/schema.prisma --exit-code` | « No difference detected » |
| `git log -- <chaque migration>` | 1 commit par migration (jamais modifiée après coup) |
| Script `routes.py` (scratchpad) | 133 routes de modules ; 15 publiques ; toutes avec `parse` sauf 4 sans entrée |
| Script de comparaison `config.ts` / `.env.example` | 20 variables absentes de `.env.example` |
| Test temporaire `zz-jose-proof.test.ts` (P1 à P10), copié dans `apps/api/test`, lancé par `npx vitest run`, puis supprimé | 10/10 exécutés ; résultats dans `preuves.txt` (cités dans les constats) |
| Test temporaire `zz-jose-proof2.test.ts` (P11) | 1/1 ; « Vos crédits ont été remboursés », solde 192, 0 remboursement |
| Test temporaire `zz-jose-proof3.test.ts` (P12, P13) | 2/2 ; 200 puis 409, message `PENDING` ; 404/404/401/400/404 |
| `TZ=UTC node -e '<addMonths>'` | 2027-03-03 et 2027-05-01 |
| `git status --short` après chaque test | vide avant l'écriture de ce rapport ; seul ce rapport ensuite |

Fichiers de preuve : `/tmp/claude-0/-home-user-FORLIFE/f743d9c3-cade-5323-a17b-7e4c52982ff1/scratchpad/equipe/jose/`
(`zz-jose-proof.test.ts`, `zz-jose-proof2.test.ts`, `zz-jose-proof3.test.ts`, `preuves.txt`, `preuves2.txt`, `preuves3.txt`,
`routes.py`, `routes.txt`, `npm-test.txt`, `typecheck.txt`). Aucun serveur lancé (tests en `inject`). PostgreSQL local reste
démarré pour les agents suivants.

Non vérifié : comportement réel de Cloud Run à l'arrêt (délai exact) ; vrais appels Meta, LinkedIn, TikTok, YouTube et
CinetPay (aucune clé, pas de réseau) ; format exact de la signature `x-token` CinetPay ; couverture de code (aucun outil
`@vitest/coverage-*` installé) ; plans d'exécution PostgreSQL sur des volumes réalistes (base locale trop petite pour qu'`EXPLAIN` soit parlant).

Zones non couvertes par les tests existants : `recoverStaleJobs`, `startWorker().stop()` et l'arrêt, `startScheduler`
(chevauchement), concurrence avec la même clé d'idempotence, limites de débit, rafraîchissement concurrent des jetons
sociaux, reprise d'un pack de campagne, webhook sans signature, expiration LinkedIn, annulation de job Copilot.

## HYPOTHÈSES

- La NAT d'opérateur (plusieurs abonnés derrière une IP) est une hypothèse de contexte (Aya), le mécanisme serveur est prouvé.
- Le délai d'arrêt Cloud Run d'environ 10 s est repris de la documentation connue et de D01.
- La signature `x-token` de CinetPay est décrite de mémoire : à relire dans leur documentation avant implémentation.
- Les tests de preuve simulent un plantage en sautant la mise à jour du job ; c'est l'effet exact d'un SIGKILL à ce moment.

## RISQUES ET POINTS OUVERTS

1. Litiges sur les crédits (B01, B04, B06) dès le premier déploiement pendant une génération ; l'historique des crédits
   montrera deux débits pour un seul contenu.
2. Déconnexions inexpliquées en réseau mobile partagé (B07), visibles dès le lancement.
3. Double post sur la page Facebook d'un client (B13) : atteinte directe à l'image du client.
4. Comptes sociaux invalidés par des rafraîchissements concurrents (B14) dès que 2 instances tournent.
5. Paiements : pas de preuve de réception des notifications (B10) ; à régler avant de brancher CinetPay en réel.
6. Décision à prendre avec Caporal : restriction d'entrée Cloud Run (B08), qui conditionne toutes les limites par IP.

## SUGGESTIONS PRIORISÉES

| # | Priorité | Suggestion | Constats | Effort | Agent |
|---|---|---|---|---|---|
| 1 | P0 | Fiabiliser la file : clé de débit stable par job, remboursement sans condition `replayed`, `DEAD` au-delà de `maxAttempts` à la récupération avec nettoyage métier, garde `lockedBy`, battement de cœur ; tests de chaque cas (reprendre P1 à P3, P11) | B01, B02, B03, B04 | M (2 à 3 j) | José, Franck (tests) |
| 2 | P0 | Idempotence de toutes les générations facturées et des créations (conversation, prospect), avec verrou consultatif pour la concurrence et `P2002` traduit en rejeu ou 409 | B05, B06 | S à M (1 à 2 j) | José, Grâce (clé stable côté web) |
| 3 | P0 | Rafraîchissement limité par cookie et non par IP, 409 pendant la fenêtre de grâce ; erreurs du limiteur au format commun avec `Retry-After` | B07, B19 | S (0,5 j) | José, Grâce (reprise) |
| 4 | P0 | Restreindre l'entrée Cloud Run au trafic Hosting (ou en-tête secret) avant de compter sur les limites par IP | B08 | S | Brice, Caporal |
| 5 | P1 | CinetPay : clé secrète, vérification `x-token`, `PaymentEvent NOTIFY`, délai de 15 s sur les appels ; planificateur avec garde de chevauchement et tâches séparées | B10, B11 | S (1 j) | José, Brice (secret) |
| 6 | P1 | Planificateur unique (verrou consultatif) et verrou de rafraîchissement des jetons ; `collectMetrics` trié et regroupé par compte | B14 | S (1 j) | José |
| 7 | P1 | Publication : état `SUBMITTING`, pas de republication aveugle, réservation et `enqueue` atomiques ; `Retry-After` des réseaux | B13, B16 | M (1 à 2 j) | José |
| 8 | P1 | Allocation mensuelle dans la transaction de renouvellement ; pack de campagne repris sans orphelins | B12, B17 | S | José |
| 9 | P1 | LinkedIn : renouvellement ou alerte avant expiration | B15 | S | José, Grâce (badge) |
| 10 | P1 | Migration additive : `CHECK` sur statuts et montants, index listés (B21 et D01), purges des tables d'authentification ; `.env.example` complet et variables lues hors schéma ajoutées à `config.ts` | B20, B21 | S (1 j) | José, David (doc) |
| 11 | P2 | Pagination par curseur des 4 listes, `groupBy` en analytics, suppression des doubles `requireWorkspace` | B22 | M | José, Grâce |
| 12 | P2 | Renvoi des emails en échec, calcul des mois borné, annulation Copilot, réutilisation des fonds créatifs | B18, B23, B24, B25 | S | José |
| 13 | P2 | Outil de couverture (`@vitest/coverage-v8`) en CI avec seuil sur `jobs`, `billing`, `payments`, `ai` | tests | S | Franck |

## SUITE PROPOSÉE

1. Caporal (D06) : B08 (en-têtes IP falsifiables sur `*.run.app`), B09 (verrouillage de compte par un tiers), B10 (signature
   du webhook), et la journalisation : jetons Meta passés en paramètre d'URL (`social/meta.ts:43`, jamais journalisés par
   l'API, à vérifier côté proxy).
2. Franck (D07) : reprendre les tests de preuve P1 à P13 comme tests de non-régression (en les inversant une fois corrigés),
   ajouter la couverture et les zones listées dans VÉRIFICATIONS.
3. Brice (D10) : ingress Cloud Run, secret CinetPay, worker séparé (D01) qui réduit fortement B01, B02 et B14.
4. Grâce et Princesse : brancher la reprise sur 429 et 409 `REFRESH_RACE`, et la clé d'idempotence stable par intention
   une fois B05 et B06 livrés (sinon le second appui reçoit 500).
5. Elisée (D11) : arbitrer B01 à B04 et B06 en premier, ils touchent directement l'argent des clients.
