# D06 · Audit de sécurité de Forlife Com · Caporal

Date : 07/11/2026 (repris le 09/11/2026 après interruption). Périmètre : `platform/` (API, web, shared, déploiement) et
`.github/workflows/`. Lecture seule : aucun fichier du dépôt modifié en dehors de ce rapport, aucune requête vers le site
en ligne, preuves faites sur une API locale (port 4100, base dédiée `forlife_caporal`, IA en mode `mock`).

## STATUT

Terminé. Verdict : **BLOQUANT** pour l'ouverture au public (4 constats ÉLEVÉ, dont 2 prouvés en local sans authentification).

## RÉSUMÉ

La base est sérieuse : contrôle d'accès multi-tenant systématique (`requireWorkspace` / `requireOrg`, 404 hors tenant,
vérifié par tests croisés), refresh token en cookie httpOnly `SameSite=Strict` avec rotation et détection de rejeu,
en-tête anti-CSRF, scrypt, jetons sociaux chiffrés AES-256-GCM, OAuth à état lié à l'utilisateur, paiements vérifiés
côté prestataire avec contrôle du montant et livraison idempotente, CSP stricte côté Hosting, conteneur non root,
fédération d'identité GitHub vers GCP, aucun secret dans le code ni dans l'historique git.

Quatre points empêchent pourtant une ouverture publique :
1. un déni de service sans authentification : un corps de 800 Ko sur `/api/auth/signup` produit une réponse d'erreur
   de 25 Mo et bloque la boucle d'événements (S01) ;
2. l'adresse IP du client est entièrement choisie par le client (en-tête `x-fah-client-ip` prioritaire, URL directe
   Cloud Run publique) : toutes les limites par IP et les IP du journal d'audit sont falsifiables (S02) ;
3. aucun moyen pour un utilisateur de changer son mot de passe ou de récupérer son compte en production (emails non
   envoyés, aucun écran de changement), et n'importe qui peut réserver l'email d'un tiers (S03) ;
4. le workflow `auto-blog.yml` confie une clé de compte de service Google longue durée à une action tierce non épinglée
   (`@master`) (S04).

S'y ajoutent des points de conformité (consentement WhatsApp, transferts hors Côte d'Ivoire, droits des personnes)
à régler avant d'accueillir des données de prospects réelles.

## CONSTATS

Gravité : CRITIQUE 0 · ÉLEVÉ 4 · MOYEN 7 · FAIBLE 7 (18 constats).

### S01 · ÉLEVÉ · Déni de service non authentifié par validation zod (amplification x31)
- Emplacement : `apps/api/src/lib/validation.ts:7` (`z.flattenError` renvoyé tel quel dans `details`) ;
  `modules/identity/routes.ts:28` (`channels: z.array(z.enum(CHANNELS))` sans `.max`) ; zod 4.6.5 (avis GHSA-mrhx-c7xc-m3w5,
  « high », corrigé en 4.6.6).
- Preuve (P2b, local) : `POST /api/auth/signup` avec `channels` = 200 000 valeurs invalides (corps de 800 119 octets,
  sous la limite de 1 Mo) : réponse `400` de **25 200 175 octets** en 0,43 à 0,61 s ; mémoire du processus de 381 Mo à
  779 Mo. 8 requêtes parallèles : traitées l'une après l'autre (dernière à 3,34 s, la boucle d'événements est bloquée
  pour tous les utilisateurs), pic de 930 Mo. Seul l'en-tête `x-forlife-csrf: 1` est requis, trivial hors navigateur.
- Scénario : quelques dizaines de requêtes par seconde (IP changée à volonté, voir S02) saturent les 4 instances de 2 Gio,
  provoquent des redémarrages (OOM) et une facture de sortie réseau. Le même motif touche toute route avec un tableau
  non borné (`strategy/routes.ts:23`, `org/invitations.ts:66`).
- Correction : ne jamais renvoyer le détail complet ; tronquer à 20 erreurs (`issues.slice(0, 20)`) et n'indiquer que les
  champs ; `.max()` sur tous les tableaux d'entrée (`channels` : 8, dédoublonné) ; zod 4.6.7 ; limite de corps à 64 Ko sur
  les routes d'authentification. Effort S.
- Responsable : José (correction), Franck (test de non-régression).

### S02 · ÉLEVÉ · Adresse IP client falsifiable : limites par IP et traçabilité contournées (confirme B08 de José)
- Emplacement : `apps/api/src/lib/request.ts:15-19` (`x-fah-client-ip` puis `fastly-client-ip` acceptés sans condition, le
  premier étant prioritaire) ; `.github/workflows/platform-deploy.yml:228` (`--allow-unauthenticated`, aucun `--ingress`) ;
  `server.ts:66` (limiteur global par `clientIp`).
- Preuve (P1, local, script `p1-ip.sh`) : 12 connexions depuis la même machine sans en-tête : `401` x10 puis `429 429`.
  Avec `x-fah-client-ip` différent à chaque requête et `fastly-client-ip` constant : `401` x12, jamais de `429`. L'en-tête
  `x-fah-client-ip` gagne donc même quand Firebase Hosting pose `fastly-client-ip`. Les tests S01 et S03 ont aussi créé des
  comptes en changeant cet en-tête.
- Scénario : sur `*.run.app` (joignable directement), un robot contourne `signup-ip` (20 comptes par heure), le
  limiteur global 300/min, les 10/min de connexion, réinitialisation et vérification, et le formulaire public. Les IP
  inscrites dans `Session.ip` et `AuditLog.ip` sont celles que l'attaquant choisit (enquête après incident faussée).
  Via `forlifecomai.ci`, le contournement dépend du fait que Hosting transmette ou non un `x-fah-client-ip` envoyé par le
  client (À CONFIRMER, non testable ici) ; l'ordre de lecture actuel le rend exploitable si c'est le cas.
- Correction : `--ingress internal-and-cloud-load-balancing` n'est pas compatible avec une réécriture Hosting classique ;
  retenir soit un équilibreur HTTPS avec Cloud Armor devant Cloud Run, soit un en-tête secret posé côté proxy et vérifié
  par l'API avant de croire `fastly-client-ip`. Lire uniquement l'en-tête du proxy réellement utilisé (`fastly-client-ip`
  pour Hosting classique) et ignorer `x-fah-client-ip`. Ajouter des limites par compte ou par empreinte de cookie
  (B07) qui ne dépendent pas de l'IP. Regrouper l'IPv6 par /64 dans le générateur de clé. Effort S à M.
- Responsable : Brice (entrée Cloud Run), José (`clientIp`, limites).

### S03 · ÉLEVÉ · Aucun changement ni récupération de mot de passe en production ; emails non vérifiés réservables
- Emplacement : `deploy/production.env:20` (`EMAIL_DRIVER=log`) ; `modules/mail/mailer.ts:46-48` (en production l'email est
  seulement inscrit dans `EmailOutbox`) ; aucune route de changement de mot de passe, d'email ou de liste des sessions
  (recherche `password` dans `apps/api/src/modules` et `apps/web/src/pages` : seuls inscription, invitation, connexion et
  réinitialisation existent) ; `identity/routes.ts:66-109` (inscription sans preuve de l'email).
- Preuve : code ci-dessus ; `forgot-password` renvoie `{ ok: true }` sans rien envoyer quand le driver est `log`.
- Scénario : un client dont le mot de passe a fui (réutilisé ailleurs, cybercafé) ne peut ni le changer ni couper les
  autres sessions ; elles restent valides 30 jours, renouvelées à chaque rafraîchissement (pas de durée absolue). Un tiers
  peut créer un compte avec l'email d'une entreprise (`direction@entreprise.ci`) : le vrai titulaire ne pourra ni
  s'inscrire (409) ni récupérer le compte, puisqu'aucun email ne part.
- Correction : brancher Resend (domaine `forlifecomai.ci`, SPF/DKIM, D01) avant l'ouverture ; ajouter « Changer mon mot de
  passe » (ancien mot de passe exigé, révocation des autres sessions), « Se déconnecter de tous les appareils » et une
  durée absolue de session (par exemple 90 jours) ; exiger l'email vérifié pour les actions sensibles (paiement,
  invitation, connexion d'un réseau social) et purger les comptes non vérifiés après 7 jours. Effort M.
- Responsable : José (API), Grâce (écrans), Brice (secret Resend).

### S04 · ÉLEVÉ · `auto-blog.yml` : action tierce non épinglée avec une clé de compte de service longue durée
- Emplacement : `.github/workflows/auto-blog.yml:10` (`permissions: contents: write`), `:41` (`w9jds/firebase-action@master`),
  `:45-46` (`GCP_SA_KEY`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_TOKEN` passés en variables d'environnement à cette action).
- Preuve : lecture du fichier. Le dépôt est public (`production.env:1`). Le site vitrine vise le projet `forlifecom-6eef9`
  (`.firebaserc`), projet qui hébergeait aussi la base de la plateforme dans l'historique git (chaîne de connexion
  d'exemple `forlifecom-6eef9:europe-west1:forlife-db`).
- Scénario : quiconque prend la main sur le dépôt `w9jds/firebase-action` (ou sa branche `master`) exécute du code avec
  une clé JSON de compte de service sans expiration et un `FIREBASE_TOKEN`, et peut pousser sur `main` avec le
  `GITHUB_TOKEN` en écriture. Selon les droits de cette clé (À CONFIRMER dans IAM), cela va de la défiguration du site
  vitrine à l'accès aux ressources restantes du projet `forlifecom-6eef9`.
- Correction : supprimer la clé JSON et passer à la fédération d'identité (comme `platform-deploy.yml`) ; remplacer
  l'action par `npx firebase-tools@<version>` ou une action épinglée par SHA ; `permissions` minimales par job ;
  révoquer `FIREBASE_TOKEN`. Effort S.
- Responsable : Brice.

### S05 · MOYEN · Tableaux non bornés injectés dans chaque prompt IA (amplification du coût Anthropic)
- Emplacement : `identity/routes.ts:28`, `strategy/routes.ts:23` (`channels` sans `.max`) ; `modules/ai/context.ts:84`
  (`Canaux actifs : ${c.channels.join(", ")}` dans chaque génération).
- Preuve (P2, local) : inscription avec `channels` = 200 000 fois `"X"` (valeur valide) : `201`, puis en base
  `jsonb_array_length(channels) = 200000`. Chaque génération IA de l'espace recevrait environ 600 Ko de texte, soit de
  l'ordre de 200 000 jetons d'entrée (environ 0,80 USD au tarif cité par D01) pour un coût fixe en crédits.
- Scénario : un utilisateur (ou un EDITOR via la mise à jour du profil) fait payer à Forlife des appels IA très chers, ou
  les fait tous échouer (dépassement de contexte).
- Correction : `.max(8)` et dédoublonnage ; plafond de taille du prompt dans `ai/gateway.ts` avant l'appel ; dédoublonner
  à la lecture dans `loadBrandContext`. Effort S.
- Responsable : José.

### S06 · MOYEN · Filtre SVG contourné : lecture de fichiers image du serveur
- Emplacement : `modules/creative/composer.ts:255` (refus par l'expression `<image[\s>]`) ; `brand/routes.ts:194-203`.
- Preuve (P3, local) : SVG avec `xmlns:s="http://www.w3.org/2000/svg"` et `<s:image href="/chemin/absolu/local-secret.png">`
  accepté (`201`) ; le PNG stocké, relu par `GET /assets/:id/file`, contient l'image locale (1 440 000 pixels rouges sur
  1 440 000, image témoin entièrement rouge placée dans le scratchpad). Le préfixe d'espace de noms échappe à
  l'expression régulière, resvg le traite comme une vraie balise `image` et lit le fichier sur disque.
- Scénario : un membre (`assets:create`, donc même CREATOR) récupère toute image lisible par l'utilisateur `node` du
  conteneur. En production le stockage est sur GCS et les rendus vidéo vont dans un dossier `mkdtemp` aléatoire : impact
  limité aujourd'hui, mais c'est une lecture de fichiers locaux qui deviendra grave au moindre changement (stockage local,
  fichiers temporaires prévisibles). Le même filtre protège le rendu des visuels.
- Correction : analyser le SVG avec un parseur XML et refuser tout élément `image`, `use` externe, `foreignObject`, quel
  que soit le préfixe ; ou passer à resvg un `resourcesDir` vide et un résolveur d'images qui refuse tout (`imageRendering`
  sans chargement externe) ; à défaut, n'accepter que PNG/JPEG/WebP pour les logos. Effort S.
- Responsable : José.

### S07 · MOYEN · Chaîne de déploiement : mise en production sans revue, identifiants larges exposés à des dépendances non verrouillées
- Emplacement : `platform-deploy.yml:57-61` (déploiement à chaque push sur `main` et `claude/app-development-sbl2ff`) ;
  `:248` (`npx --yes firebase-tools@13.35.1` exécuté après l'authentification GCP, dépendances transitives résolues sans
  fichier de verrouillage) ; `:33`, `:186`, `:190` (actions épinglées par étiquette `@v4`/`@v2`, pas par SHA) ;
  `:211-213` et `:237-238` (journaux Cloud Run et du job de migration recopiés dans les journaux GitHub d'un dépôt
  public) ; `scripts/gcp-setup.sh:224` (`roles/run.admin` au niveau projet et `iam.serviceAccountUser` sur les comptes
  API et migration pour le compte de déploiement).
- Ce qui est bien : fédération d'identité limitée au dépôt, aux pushs et aux deux branches (`gcp-setup.sh:238`), build
  sans identifiants, `permissions: contents: read`, environnement `production`.
- Scénario : un push sur la branche de développement (agents compris) part en production sans relecture ; une dépendance
  compromise de `firebase-tools` lit les identifiants GCP du job (droit d'exécuter du code avec le compte de migration,
  propriétaire de la base). Un message d'erreur Prisma ou applicatif peut apparaître en clair dans les journaux publics.
- Correction : protection de branche et relecture obligatoire, règle « required reviewers » sur l'environnement
  `production` (À CONFIRMER : non visible depuis le dépôt) ; déployer seulement depuis `main` ; installer
  `firebase-tools` via `package-lock.json` avant l'authentification ; épingler les actions par SHA (Dependabot) ; ne plus
  recopier les journaux GCP dans GitHub (lien vers Cloud Logging à la place). Effort S.
- Responsable : Brice.

### S08 · MOYEN · Verrouillage de compte par un tiers et back-office sans second facteur (confirme B09)
- Emplacement : `identity/routes.ts:58-60`, `:114-121` (10 échecs par email et par 15 min, quelle que soit l'IP) ;
  `modules/admin/routes.ts:29-44` et `plugins/auth.ts:117-128` (super-admin = mot de passe + code d'activation une seule
  fois, puis seulement le mot de passe).
- Preuve : code ; le compteur `login:<email>` est partagé en base et incrémenté sans authentification.
- Scénario : 10 requêtes toutes les 15 minutes suffisent à empêcher un client (ou l'administrateur, dont l'email est
  connu) de se connecter. À l'inverse, un mot de passe d'administrateur volé donne tout le back-office (plans, crédits,
  suspension, liste des utilisateurs) pendant 30 jours de session.
- Correction : compteur par (email, IP de confiance) avec un seuil par email plus haut et un délai progressif plutôt
  qu'un blocage net ; TOTP obligatoire pour les administrateurs de plateforme et session admin courte (8 h) ; alerte email
  à chaque activation ou connexion admin. Effort M.
- Responsable : José.

### S09 · MOYEN · Consentement WhatsApp : coché par défaut côté interface, forcé sur le formulaire public (U13 d'Aya)
- Emplacement : `apps/web/src/pages/Crm.tsx:201` (`consent: true` par défaut) ; `modules/crm/public.ts:31`
  (`consentWhatsApp: z.literal(true)` : impossible d'envoyer une demande sans accepter WhatsApp) ;
  `apps/web/src/pages/PublicForm.tsx:62-78` (aucune information sur le responsable du traitement, la finalité ni lien vers
  la politique de confidentialité) ; `crm/service.ts:24` (seule la date est gardée, pas la preuve ni le texte accepté).
- Ce qui est bien : l'API met `false` par défaut (`crm/routes.ts:22`), le retrait de consentement ne peut pas être annulé
  par un tiers, l'interface avertit avant un envoi sans accord.
- Scénario : la loi n° 2013-450 exige un consentement libre, spécifique et éclairé ; une case pré-cochée ou une demande de
  rappel conditionnée à WhatsApp ne l'est pas. Les clients de Forlife (responsables de traitement) et Forlife (sous-traitant)
  s'exposent à une plainte ARTCI et au blocage de leur numéro WhatsApp Business.
- Correction : case décochée par défaut ; sur le formulaire public, rendre WhatsApp facultatif (« me recontacter par
  téléphone » sinon), afficher le nom de l'entreprise responsable, la finalité, la durée de conservation et un lien vers
  sa politique ; enregistrer la source, le texte et la version du consentement. Effort S.
- Responsable : Grâce (interface), José (API), propriétaire (texte juridique).

### S10 · MOYEN · Transferts de données hors de Côte d'Ivoire non décrits correctement ; déclaration ARTCI non attestée
- Emplacement : `apps/web/src/pages/Legal.tsx:121` (« Google Cloud et Firebase (hébergement ... région Europe) ») ;
  `config.ts:68` (`VERTEX_LOCATION` us-central1, D01) ; Anthropic (États-Unis) reçoit le contexte de marque, les prénoms et
  les 5 dernières notes des prospects (`crm/jobs.ts:20-28`), les messages du Copilot ; Google TTS ; Google Fonts chargé
  depuis le navigateur.
- Preuve : code et politique ; aucune trace dans le dépôt d'une déclaration de traitement ni d'une autorisation de
  transfert auprès de l'ARTCI (À CONFIRMER avec le propriétaire : cela peut exister hors dépôt).
- Scénario : la loi n° 2013-450 encadre le transfert vers un pays tiers (Europe comme États-Unis) ; la politique actuelle
  omet les États-Unis et présente la région Europe comme seul lieu de traitement.
- Correction : déclarer les traitements et demander l'autorisation de transfert à l'ARTCI ; lister dans la politique
  chaque sous-traitant, son pays et la garantie (clauses contractuelles, conditions commerciales sans entraînement) ;
  passer Imagen en `europe-west1` si disponible ; auto-héberger la police ; contrat de sous-traitance proposé aux clients
  (ils saisissent des données de leurs prospects). Effort M (surtout administratif).
- Responsable : propriétaire et Elisée (décision), David (politique), José (région Imagen).

### S11 · MOYEN · Droits des personnes et conservation incomplets
- Emplacement : `modules/governance/data.ts` : suppression possible seulement pour toute l'organisation (`:177`),
  par le propriétaire, sans ressaisie du mot de passe ; pas de suppression d'un compte utilisateur (D05 :
  `Legal.tsx:255-258` renvoie vers une demande WhatsApp) ; l'export (`:22-73`) ne contient pas les données du compte
  (email, sessions, journal) ; purge (`:127-143`) garde `AuditLog.metadata` (emails d'invités, `invitation.ts:105`) et
  `AuditLog.ip`. Tables sans purge (D01, D04) : `Session` (IP et navigateur), `EmailOutbox` (adresses), `OAuthState`,
  `AIRun` (entrées et sorties IA) tant que l'espace existe.
- Scénario : demande d'accès ou d'effacement d'un utilisateur ou d'un prospect impossible à satisfaire entièrement ; vol
  de session suffisant pour lancer la suppression d'une organisation (annulable 30 jours, mais réseaux déconnectés
  immédiatement).
- Correction : suppression du compte utilisateur dans l'application (exigence Google Play aussi) ; export du compte ;
  ressaisie du mot de passe pour suppression et export ; durées de conservation écrites et purges planifiées (sessions
  expirées à 30 jours, `EmailOutbox` à 90 jours, `AIRun.input/output` à 12 mois, anonymisation des emails dans
  `AuditLog.metadata` à la purge). Effort M.
- Responsable : José, Grâce, David (politique).

### S12 · FAIBLE · Webhook CinetPay non authentifié (confirme B10, gravité abaissée)
- Emplacement : `modules/payments/routes.ts:91-100`.
- Preuve (local) : `POST /api/public/payments/cinetpay/notify` avec `cpm_trans_id=FAUX` sans signature : `200 {"ok":true}`.
- Pourquoi FAIBLE : la notification ne fait que déclencher `reconcile`, qui interroge CinetPay (`service.ts:177-210`) et
  exige montant `>=` attendu et devise identique avant toute livraison ; la livraison est atomique et unique
  (`updateMany` conditionnel, clé d'idempotence `payment:<id>`). Un faux webhook ne peut ni livrer ni annuler. Au pire, il
  provoque une vérification toutes les 10 s par paiement en attente.
- Correction : vérifier l'en-tête `x-token` (HMAC avec la clé secrète CinetPay, format à relire dans leur documentation),
  journaliser chaque notification (`PaymentEvent NOTIFY`), délai de 15 s sur les appels sortants (B11). Avant de brancher
  CinetPay en réel. Effort S.
- Responsable : José, Brice (secret).

### S13 · FAIBLE · Dépendances vulnérables non exploitables dans ce contexte (hors zod, traité en S01)
- Preuve : `npm audit --omit=dev` et `npm audit` : 12 vulnérabilités (1 low, 7 moderate, 4 high), identiques avec et
  sans les dépendances de développement.
  - zod 4.6.5 (high, direct) : exploitable, voir S01.
  - prisma / @prisma/config / deepmerge-ts (high) : deepmerge-ts n'est utilisé que par la CLI Prisma au chargement de sa
    configuration (job de migration), jamais sur des données de requête : non exploitable. Montée Prisma 7.10.1 à planifier.
  - fastify 5.12.5 (low, contournement de validation d'en-têtes via `propertyNames`) : l'API ne déclare aucun schéma
    d'en-têtes : non applicable. Monter en 5.12.8.
  - fast-uri (moderate, via ajv de Fastify) : l'API valide avec zod, pas avec des schémas JSON au format `uri` : non exploitable.
  - ip-address (moderate) : utilisé par `normalizeIP` de `@fastify/rate-limit`, contourné ici par un `keyGenerator`
    personnalisé (`server.ts:66`) : non atteignable.
  - uuid / gaxios / teeny-request / retry-request / @google-cloud/storage (moderate) : défaut de bornes de v3/v5/v6 avec
    tampon fourni, non utilisé par l'application : non exploitable. Montée @google-cloud/storage 8.
- Correction : `npm audit fix` (zod, fastify, fast-uri, ip-address) puis majeures planifiées ; `npm audit --omit=dev
  --audit-level=high` en CI. Effort S.
- Responsable : José, Franck (CI).

### S14 · FAIBLE · Chiffrement des jetons sociaux : pas de rotation de clé, pas de liaison au compte
- Emplacement : `apps/api/src/lib/crypto.ts:56-69`.
- Constat : AES-256-GCM correct (IV aléatoire de 12 octets, tag vérifié), mais une seule clé `ENCRYPTION_KEY` pour tous les
  tenants, format `v1` sans identifiant de clé (rotation impossible sans re-chiffrement en une fois), pas de données
  associées (un chiffré peut être déplacé d'un compte à l'autre par quelqu'un qui écrit en base), longueur du tag non
  imposée (`setAuthTag` accepte un tag court). `JWT_SECRET` dérive aussi les signatures de médias et de paiement démo
  (`deriveKey`, bonne séparation, mais une rotation du secret JWT invalide les URL de médias en cours).
- Correction : format `v2.<kid>....` avec plusieurs clés acceptées en lecture, AAD = `socialAccountId`, `authTagLength: 16`,
  tâche de re-chiffrement ; clé dans Secret Manager avec procédure de rotation écrite. Effort S.
- Responsable : José, Brice (procédure).

### S15 · FAIBLE · Meta : jeton d'accès en paramètre d'URL et sans `appsecret_proof`
- Emplacement : `modules/social/meta.ts:43` (`url.searchParams.set("access_token", token)` pour les GET) ; aucune occurrence
  de `appsecret_proof` dans le module.
- Scénario : le jeton peut apparaître dans des journaux intermédiaires ; sans `appsecret_proof`, un jeton fuité est
  utilisable hors de Forlife. L'API ne journalise pas ces URL (vérifié : aucun log des appels sortants).
- Correction : en-tête `Authorization: Bearer` et `appsecret_proof` (HMAC-SHA256 du jeton avec le secret de l'application),
  puis activer « Require App Secret » dans l'application Meta. Effort S.
- Responsable : José.

### S16 · FAIBLE · URL de médias signées longues et sessions glissantes
- Emplacement : `creative/service.ts:200` (7 jours) et `creative/routes.ts:158` (`public, max-age=86400`) ;
  `identity/sessions.ts:11-27` (chaque rotation repart pour 30 jours).
- Scénario : un visuel supprimé ou un espace purgé reste téléchargeable par son URL signée pendant 7 jours (et en cache
  CDN 1 jour) ; une session volée se prolonge indéfiniment tant qu'elle est utilisée.
- Correction : URL de 1 h générée au moment de la publication, `cache-control: private`, vérification que la version
  existe encore (déjà fait par `versionImage`, sauf cache CDN) ; durée absolue de session (voir S03). Effort S.
- Responsable : José.

### S17 · FAIBLE · Durcissements côté client (avis sur F22 de Grâce)
- Emplacement : `apps/web/src/auth.tsx:94-98` (clés `forlife.*` non effacées à la déconnexion) ; `Billing.tsx:50`
  (`location.href = checkoutUrl` sans liste blanche) ; `SocialHub.tsx:288`, `ContentDetail.tsx:295`, `SocialAudit.tsx:334`.
- Avis : le stockage du jeton d'accès en mémoire et du refresh en cookie httpOnly `SameSite=Strict`, `Path=/api/auth`,
  `Secure` en production est le bon choix (vérifié : en-tête `set-cookie` local ; CORS refuse une origine hostile, sans
  `access-control-allow-origin`). Le `localStorage` ne contient rien de sensible ; l'effacer à la déconnexion suffit
  pour un appareil partagé. `checkoutUrl` vient du serveur et de CinetPay : liste blanche `checkout.cinetpay.com` et
  domaine propre recommandée en défense en profondeur. React 19 bloque déjà `javascript:`.
- Correction : `safeUrl()` (http/https), liste blanche de paiement, purge `forlife.*` à la déconnexion. Effort S.
- Responsable : Grâce.

### S18 · FAIBLE · FFmpeg : format d'entrée deviné et version non épinglée
- Emplacement : `modules/video/renderer.ts:196` (`-i pipe:0` sans `-f`) ; `Dockerfile:17` (paquet Debian non épinglé).
- Constat : les images envoyées passent une vérification de signature et de dimensions (`lib/image.ts`), ce qui limite
  fortement la surface, mais FFmpeg reste le décodeur d'images non fiables le plus exposé.
- Correction : forcer `-f image2pipe -c:v png|mjpeg|webp` selon le type vérifié, délai maximal par processus, mise à jour
  régulière de l'image de base (scan Artifact Registry). Effort S.
- Responsable : José, Brice.

### Points vérifiés sans constat
- Contrôle d'accès : 133 routes analysées (script `routes.py`) ; seules 18 sont hors garde de tenant, toutes publiques par
  nature (auth, formulaires, médias signés, webhook, démo) ou d'identité (`/api/me`, `claim`). Toutes les requêtes par
  identifiant vérifiées filtrent par `workspaceId` ou `organizationId`. Test croisé local avec un second compte : export,
  fichier d'asset, paiements, membres, audit, leads, back-office et asset via un autre espace : `404` partout ; `claim`
  admin sans email autorisé : `403`. Rôles : un acteur ne peut attribuer qu'un rang inférieur ou égal, le dernier
  propriétaire est protégé, une agence reste limitée à ses espaces.
- JWT : `alg: none` et signature HS512 bidon refusés (`401`) ; session vérifiée en base à chaque requête (cache 5 s).
- Injections SQL : aucun `$queryRawUnsafe` dans le code applicatif ; les `$executeRawUnsafe` de `ops/app-role.ts` ne
  prennent que des identifiants échappés et un vérificateur SCRAM calculé.
- XSS : 0 `dangerouslySetInnerHTML`, `innerHTML`, `eval` (confirme D03) ; fichiers servis avec `nosniff`, CSP `sandbox` et
  pièce jointe pour PDF et texte ; SVG jamais servi tel quel.
- SSRF : `social/links.ts` n'accepte que les domaines du réseau choisi, en HTTPS, redirections revérifiées, port ignoré,
  10 s et 600 Ko maximum. Les autres `fetch` visent des hôtes fixes.
- Envois : un seul fichier, 15 Mo, signature binaire, dimensions plafonnées avant décodage.
- Paiements : montants et produits fixés côté serveur, idempotence par `requestId`, montant et devise reconfirmés,
  paiement démo coupé en production (`production.env:23` et `config.ts:103`).
- Secrets : `git grep` et `git log --all -p` sur les motifs `sk-ant-`, `sk-`, `re_`, `AIza`, `BEGIN ... PRIVATE KEY`,
  `ghp_`, `AKIA`, `GOCSPX-`, `EAA...`, `"private_key"`, chaînes de connexion avec mot de passe : aucune valeur trouvée ;
  seuls des noms de secrets Secret Manager et des valeurs d'exemple. `.env` ignoré par git. `production.env` ne contient
  que du non-secret (identifiants publics d'applications OAuth, ID de projet).
- Journaux : en-têtes `authorization`, `cookie` et `set-cookie` masqués ; liens de réinitialisation jamais journalisés en
  production ; jetons d'invitation, de réinitialisation et de paiement démo transmis dans le corps des requêtes API.
- En-têtes : CSP Hosting stricte (`script-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), HSTS, `nosniff`,
  `X-Frame-Options`, `Permissions-Policy` ; helmet côté API.

## VÉRIFICATIONS

| Commande ou test | Résultat réel |
|---|---|
| `npm audit --omit=dev` (et `--json`) | 12 vulnérabilités : 1 low, 7 moderate, 4 high, 0 critical |
| `npm audit` complet (`--json`) | identique : 12 (1, 7, 4) |
| `npm ls ip-address fast-uri zod deepmerge-ts` | chemins d'inclusion ci-dessus (S13) |
| `git ls-files` filtré sur env, secret, key, pem, credential | `apps/api/.env.example`, `deploy/production.env` seulement |
| `git grep` et `git log --all -p` sur les motifs de clés (83 commits) | aucune valeur de secret |
| `python3 routes.py` (inventaire des gardes) | 18 routes sans garde de tenant, toutes justifiées |
| P1 `p1-ip.sh` : 12 connexions | sans en-tête : 10 x `401` puis `429 429` ; avec `x-fah-client-ip` variable : 12 x `401` |
| P2 inscription avec 200 000 `"X"` | `201`, 200 000 canaux en base |
| P2b inscription avec 200 000 valeurs invalides | `400`, 25 200 175 octets, 0,43 à 0,61 s ; RSS 381 Mo puis 779 Mo ; 8 en parallèle : 3,34 s, pic 930 Mo |
| P3 SVG `<s:image href=...>` | `201`, PNG stocké = image locale (100 % des pixels) |
| JWT `alg: none`, HS512 bidon, jeton valide | `401`, `401`, `200` |
| Pré-vol CORS origine hostile / légitime | pas d'`allow-origin` / `allow-origin: http://localhost:5173` |
| Webhook CinetPay sans signature | `200 {"ok":true}` |
| Tests croisés IDOR (8 routes) | `404` x8, `claim` `403` |
| `set-cookie` à la connexion (local) | `HttpOnly; SameSite=Strict; Path=/api/auth` (pas `Secure` en développement, posé en production) |

Environnement : API lancée par `tsx src/main.ts` avec `PORT=4100 AI_PROVIDERS=mock`, base `forlife_caporal` créée puis
supprimée, stockage local dans le scratchpad. API arrêtée en fin d'audit. Scripts et sorties :
`/tmp/claude-0/-home-user-FORLIFE/f743d9c3-cade-5323-a17b-7e4c52982ff1/scratchpad/equipe/caporal/`.

## HYPOTHÈSES

- La production tourne avec la configuration du dépôt (`production.env`, `platform-deploy.yml`) : `EMAIL_DRIVER=log`,
  pas de CinetPay, `--allow-unauthenticated` sans restriction d'entrée.
- Les mesures de mémoire et de durée sont locales (machine de diagnostic) ; sur une instance Cloud Run de 2 vCPU, l'ordre
  de grandeur est le même.
- Le coût IA de S05 reprend le tarif cité par D01, sans appel réel à Anthropic.

## RISQUES ET POINTS OUVERTS (non vérifiés)

- Transmission par Firebase Hosting d'un `x-fah-client-ip` envoyé par le client (conditionne S02 via le domaine officiel).
- Droits IAM réels de la clé `GCP_SA_KEY` d'`auto-blog.yml` et existence de ressources restantes dans `forlifecom-6eef9`.
- Protection de branche et relecteurs obligatoires de l'environnement GitHub `production`.
- Déclaration et autorisation de transfert auprès de l'ARTCI (rien dans le dépôt).
- Application des en-têtes de `firebase.json` aux réponses réécrites vers Cloud Run.
- Le Copilot exécute des actions approuvées par l'utilisateur (`copilot/service.ts:67-125` : brouillons de contenu, tâches,
  recommandations, campagnes) : pas d'action destructive vue, mais l'injection de consignes via des pages publiques
  analysées n'a pas été testée en profondeur.
- Politique Google Play (paiements par CinetPay dans une TWA) : question juridique et commerciale signalée par D05, hors
  du champ technique de cet audit ; à trancher avant toute soumission.

## SUGGESTIONS PRIORISÉES

| # | Priorité | Action | Constats | Effort | Responsable |
|---|---|---|---|---|---|
| 1 | P0 | Erreurs de validation tronquées, `.max()` sur tous les tableaux, zod 4.6.7, corps limité sur l'auth | S01, S05 | S | José |
| 2 | P0 | IP de confiance : ignorer `x-fah-client-ip`, protéger l'URL `*.run.app` (équilibreur + Cloud Armor ou en-tête secret), limites par compte | S02, B07 | S à M | Brice, José |
| 3 | P0 | Emails réels (Resend), changement de mot de passe, déconnexion de tous les appareils, durée absolue de session, actions sensibles réservées aux emails vérifiés | S03 | M | José, Grâce, Brice |
| 4 | P0 | `auto-blog.yml` : supprimer la clé JSON, fédération d'identité, action épinglée, permissions minimales | S04 | S | Brice |
| 5 | P0 | Consentement WhatsApp décoché et non forcé, mentions d'information sur le formulaire public | S09 | S | Grâce, José |
| 6 | P1 | Filtre SVG par parseur XML ou refus des ressources externes dans resvg | S06 | S | José |
| 7 | P1 | Déploiement depuis `main` seulement avec relecture ; `firebase-tools` verrouillé ; actions par SHA ; plus de journaux GCP dans GitHub | S07 | S | Brice |
| 8 | P1 | Déclaration ARTCI et politique de confidentialité exacte (pays, sous-traitants) ; Imagen en Europe | S10 | M | Propriétaire, David |
| 9 | P1 | Suppression de compte utilisateur, export du compte, durées de conservation et purges | S11 | M | José, Grâce |
| 10 | P1 | Verrouillage progressif par (email, IP), TOTP pour les administrateurs | S08 | M | José |
| 11 | P2 | Signature du webhook CinetPay et journal des notifications avant la mise en service | S12 | S | José |
| 12 | P2 | `npm audit fix`, Prisma 7, storage 8, audit en CI | S13 | S puis M | José, Franck |
| 13 | P2 | Chiffrement v2 avec identifiant de clé et AAD ; `appsecret_proof` Meta ; URL média 1 h ; durcissements front ; FFmpeg | S14 à S18 | S | José, Grâce, Brice |

## VERDICT

**BLOQUANT** pour l'ouverture au public. Conditions de levée : suggestions 1 à 5 livrées et vérifiées (rejouer P1, P2b et
un parcours de changement de mot de passe). Les suggestions 6 à 10 doivent suivre avant d'encaisser de vrais paiements
ou d'accueillir des données de prospects à grande échelle. Aucun constat CRITIQUE : pas de fuite entre tenants, pas de
secret exposé, pas de contournement de paiement.

## SUITE PROPOSÉE

1. Franck (D07) : transformer P1, P2, P2b, P3 et les tests croisés IDOR en tests de non-régression (attendus inversés
   après correction) ; ajouter `npm audit --audit-level=high` en CI.
2. Brice (D10) : S02 (entrée Cloud Run), S04, S07, secret Resend et CinetPay ; vérifier les points ouverts IAM, protection
   de branche et en-têtes Hosting.
3. David (D09) : politique de confidentialité (pays, sous-traitants, durées), procédure de rotation des clés.
4. Elisée (D11) : faire de S01 à S04 et S09 le lot P0 « ouverture publique », avec la décision ARTCI côté propriétaire.
