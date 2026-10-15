# Installer les API (réseaux sociaux, emails, paiements)

Principe commun, pour **chaque** clé : vous la créez chez le prestataire, vous la rangez vous-même dans Google Cloud
(Secret Manager) depuis Cloud Shell, puis vous dites à Claude **le nom du secret** (jamais la clé). Claude branche
le secret dans la configuration et redéploie.

## Ranger une clé (même méthode pour toutes)

Dans [Cloud Shell](https://shell.cloud.google.com), remplacez `NOM-DU-SECRET` puis collez la clé **uniquement**
quand « Valeur : » s'affiche (elle reste invisible) :

```bash
read -rsp "Valeur : " V; echo
printf '%s' "$V" | gcloud secrets create NOM-DU-SECRET --replication-policy=automatic --data-file=- --project=ai-growth-et-creative-os
unset V
gcloud secrets add-iam-policy-binding NOM-DU-SECRET --project=ai-growth-et-creative-os \
  --member=serviceAccount:forlife-api@ai-growth-et-creative-os.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

Pour **remplacer** une clé existante : même commande avec `gcloud secrets versions add NOM-DU-SECRET --data-file=-`
à la place de `secrets create`, puis demandez à Claude de redéployer.

Ne collez jamais une clé directement sur la ligne de commande ni dans le chat.

## 1. Facebook et Instagram (Meta) — prêt dans le code

1. [developers.facebook.com](https://developers.facebook.com) → **Mes apps** → **Créer une app** → type **Entreprise**.
2. Ajoutez le produit **Facebook Login for Business**.
3. **Paramètres → URI de redirection OAuth valides** :
   `https://ai-growth-et-creative-os.web.app/social/callback/meta`
4. **Paramètres de l'app → Général** : notez l'**ID de l'app** (non secret) et la **clé secrète** (secret).
5. Rangez la clé secrète : secret `forlife-meta-secret`.
6. Envoyez à Claude : « secret `forlife-meta-secret`, ID de l'app 123456… ».
7. Permissions à faire valider par Meta (revue de l'app, 1 à 3 semaines) : `pages_show_list`,
   `pages_manage_posts`, `pages_read_engagement`, `read_insights`, `instagram_basic`, `instagram_content_publish`, `business_management`.
   En attendant la validation, l'app fonctionne avec les comptes ajoutés comme **testeurs** de l'app.

Instagram : le compte doit être **professionnel** et relié à une page Facebook ; une image est obligatoire.

## 2. LinkedIn — prêt dans le code

1. [linkedin.com/developers](https://www.linkedin.com/developers/apps) → **Create app** (associée à votre page entreprise).
2. Produits : **Sign In with LinkedIn using OpenID Connect** et **Share on LinkedIn** ; pour publier au nom d'une
   page entreprise, demandez **Community Management API** (validation LinkedIn requise).
3. **Auth → Authorized redirect URLs** : `https://ai-growth-et-creative-os.web.app/social/callback/linkedin`
4. Rangez le **Client Secret** : secret `forlife-linkedin-secret` ; envoyez à Claude le **Client ID** et le nom du secret.
5. Sans Community Management API, la publication se fait sur le profil du membre. Une fois l'API accordée,
   demandez à Claude d'activer `LINKEDIN_ORG_SCOPES=true` : les pages entreprise administrées apparaîtront à la connexion.
   (`LINKEDIN_API_VERSION`, format AAAAMM, fixe la version de l'API LinkedIn utilisée.)

## 3. TikTok — connecteur prêt (envoi en brouillon)

1. [developers.tiktok.com](https://developers.tiktok.com) → **Manage apps** → app Forlife Com.
2. Produits : **Login Kit** et **Content Posting API** (scopes `user.info.basic`, `video.upload`, `video.list` ; `video.publish` n'est pas utilisé).
3. **Redirect URI** (Login Kit) : `https://ai-growth-et-creative-os.web.app/social/callback/tiktok`
4. Client Key déjà configurée : `TIKTOK_CLIENT_KEY=awv6vweag5ljkjxp` (dans `EXTRA_ENV`).
5. **Client Secret** : secret `forlife-tiktok-secret` dans Secret Manager, branché via
   `TIKTOK_CLIENT_SECRET=forlife-tiktok-secret` dans `OPTIONAL_SECRETS` (un secret absent fait échouer le déploiement).
6. Fonctionnement : la dernière vidéo terminée du Video Studio rattachée au contenu est envoyée dans les
   brouillons TikTok du compte ; l'utilisateur la publie depuis l'application TikTok. Le jeton (24 h) est
   renouvelé automatiquement ; les statistiques (vues, j'aime, commentaires, partages) remontent après publication.

## 4. YouTube (Google) — connecteur à développer après création de l'app

1. [console.cloud.google.com](https://console.cloud.google.com), projet **AI Growth et Creative OS** →
   **API et services → Bibliothèque** → activez **YouTube Data API v3**.
2. **Écran de consentement OAuth** : type **Externe**, scope `https://www.googleapis.com/auth/youtube.upload`.
3. **Identifiants → Créer → ID client OAuth** (application Web), URI de redirection :
   `https://ai-growth-et-creative-os.web.app/social/callback/youtube`
4. Rangez le **Code secret du client** : secret `forlife-youtube-secret` ; envoyez à Claude l'**ID client** et le nom du secret.
5. Pour publier publiquement, Google exige la validation de l'écran de consentement (scope sensible).

## 5. Emails (Resend) — prêt dans le code, prioritaire

1. [resend.com](https://resend.com) → **Domains** → ajoutez votre domaine (ex. `forlifecom.ci`) et créez
   chez votre hébergeur DNS les enregistrements indiqués (SPF, DKIM). Attendez « Verified ».
2. **API Keys → Create API Key** (permission *Sending access*).
3. Rangez-la : secret `forlife-resend-key` ; indiquez à Claude l'adresse d'expédition (ex. `no-reply@forlifecom.ci`).

Sans Resend, aucun email ne part (confirmation d'adresse, mot de passe oublié, invitations).

## 6. Paiements (CinetPay) — prêt dans le code

1. Compte marchand sur [cinetpay.com](https://cinetpay.com) (pièces de l'entreprise demandées).
2. **Intégrations** : notez le **Site ID** (non secret) et l'**API Key** (secret).
3. URL de notification à déclarer : `https://ai-growth-et-creative-os.web.app/api/public/payments/cinetpay/notify`
4. Rangez l'API Key : secret `forlife-cinetpay-key` ; envoyez à Claude le **Site ID** et le nom du secret.

## En attendant : le mode test

Dans le **Social Hub**, chaque réseau propose un bouton **Tester** : il connecte un compte de test (publication et
statistiques simulées, marquées « simulé ») pour vérifier tout le parcours : création, validation, programmation,
publication, mesures. Les comptes de test se déconnectent comme les autres.
