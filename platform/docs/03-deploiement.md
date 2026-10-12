# Mise en ligne de Forlife Com (Cloud Run + Firebase Hosting)

Architecture de production :

```
Navigateur ──► Firebase Hosting (site « forlifecom-app »)
                 ├─ /            → interface React (apps/web/dist)
                 └─ /api/**      → Cloud Run « forlife-api » (europe-west1)
                                      ├─ API Fastify + worker + planificateur (même conteneur)
                                      ├─ Cloud SQL PostgreSQL 16
                                      ├─ Cloud Storage (fichiers, visuels, vidéos)
                                      └─ Secret Manager (clés)
```

Le site vitrine actuel (racine du dépôt, `firebase.json` à la racine) **n'est pas modifié** :
l'application est déployée sur un **second site Firebase** du même projet `forlifecom-6eef9`.

> Toutes les clés secrètes sont saisies **par vous** dans Google Cloud (Secret Manager) ou dans
> GitHub (Settings → Secrets). Elles ne doivent jamais être envoyées par message ni committées.

---

## 1. Préparation unique (≈ 30 min)

Depuis [Cloud Shell](https://shell.cloud.google.com) connecté au projet `forlifecom-6eef9` :

```bash
PROJECT=forlifecom-6eef9
REGION=europe-west1
gcloud config set project $PROJECT

# 1.1 Activer les services
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com storage.googleapis.com cloudbuild.googleapis.com

# 1.2 Dépôt d'images Docker
gcloud artifacts repositories create forlife --repository-format=docker --location=$REGION

# 1.3 Base de données PostgreSQL (plus petite instance ; à agrandir avec la croissance)
gcloud sql instances create forlife-db --database-version=POSTGRES_16 --region=$REGION \
  --tier=db-g1-small --storage-auto-increase --backup-start-time=02:00
gcloud sql databases create forlife --instance=forlife-db
gcloud sql users create forlife --instance=forlife-db --password='CHOISISSEZ-UN-MOT-DE-PASSE-LONG'

# 1.4 Stockage des fichiers (privé)
gcloud storage buckets create gs://forlifecom-app-files --location=$REGION --uniform-bucket-level-access

# 1.5 Compte de service de l'API
gcloud iam service-accounts create forlife-api --display-name="Forlife Com API"
SA=forlife-api@$PROJECT.iam.gserviceaccount.com
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA --role=roles/cloudsql.client
gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$SA --role=roles/secretmanager.secretAccessor
gcloud storage buckets add-iam-policy-binding gs://forlifecom-app-files --member=serviceAccount:$SA --role=roles/storage.objectAdmin
```

### 1.6 Secrets obligatoires (Secret Manager)

```bash
# URL de connexion Cloud SQL (socket Unix fourni par Cloud Run)
printf 'postgresql://forlife:VOTRE-MOT-DE-PASSE@localhost/forlife?host=/cloudsql/forlifecom-6eef9:europe-west1:forlife-db' \
  | gcloud secrets create forlife-database-url --data-file=-
openssl rand -base64 48 | tr -d '\n' | gcloud secrets create forlife-jwt-secret --data-file=-
openssl rand -base64 32 | tr -d '\n' | gcloud secrets create forlife-encryption-key --data-file=-
```

> ⚠️ Conservez une copie de `forlife-encryption-key` : elle chiffre les jetons des réseaux sociaux.
> La changer oblige à reconnecter les comptes sociaux.

### 1.7 Secrets optionnels (à ajouter quand vous les avez)

| Fonction | Secret à créer | Variable |
|---|---|---|
| IA réelle (Claude) | `forlife-anthropic-key` | `ANTHROPIC_API_KEY` |
| Paiement CinetPay | `forlife-cinetpay-key` | `CINETPAY_API_KEY` (+ `CINETPAY_SITE_ID` en variable) |
| Publication Facebook/Instagram | `forlife-meta-secret` | `META_APP_SECRET` (+ `META_APP_ID` en variable) |
| Emails (Resend) | `forlife-resend-key` | `RESEND_API_KEY` |

Exemple : `printf 'VOTRE-CLE' | gcloud secrets create forlife-anthropic-key --data-file=-`
(tapez la commande vous-même dans Cloud Shell).

### 1.8 Second site Firebase pour l'application

Console Firebase → Hosting → **Ajouter un autre site** → identifiant `forlifecom-app`
(si l'identifiant est pris, choisissez-en un autre et remplacez-le dans `platform/.firebaserc`).
L'application sera servie sur `https://forlifecom-app.web.app` ; vous pourrez ensuite y associer
un domaine (ex. `app.forlifecom.ci`) depuis la même page.

### 1.9 Clé de déploiement pour GitHub

```bash
gcloud iam service-accounts create github-deploy --display-name="GitHub deploy"
D=github-deploy@$PROJECT.iam.gserviceaccount.com
for ROLE in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding $PROJECT --member=serviceAccount:$D --role=$ROLE
done
gcloud iam service-accounts keys create github-deploy.json --iam-account=$D
```

Dans GitHub → dépôt → **Settings → Secrets and variables → Actions** :

- **Secret** `GCP_SA_KEY` : contenu du fichier `github-deploy.json` (puis supprimez le fichier de Cloud Shell).
- **Variables** :

| Variable | Exemple |
|---|---|
| `APP_URL` | `https://forlifecom-app.web.app` |
| `GCS_BUCKET` | `forlifecom-app-files` |
| `CLOUDSQL_INSTANCE` | `forlifecom-6eef9:europe-west1:forlife-db` |
| `PLATFORM_ADMIN_EMAILS` | votre email (accès au back-office) |
| `AI_PROVIDERS` | `anthropic,mock` (ou `mock` tant que la clé n'est pas ajoutée) |
| `EXTRA_SECRETS` | `ANTHROPIC_API_KEY=forlife-anthropic-key:latest,CINETPAY_API_KEY=forlife-cinetpay-key:latest` |
| `EXTRA_ENV` | `CINETPAY_SITE_ID=123456\|META_APP_ID=1234567890` |
| `EMAIL_DRIVER` | `resend` (si `RESEND_API_KEY` ajouté), sinon `log` |
| `PAYMENT_SANDBOX_ENABLED` | `false` en production (`true` uniquement pour une démo) |

---

## 2. Déployer

GitHub → **Actions → « Déploiement plateforme (Cloud Run + Firebase Hosting) » → Run workflow**.

Le workflow :
1. construit l'image Docker de l'API (FFmpeg et polices inclus) et la publie dans Artifact Registry ;
2. déploie Cloud Run (les migrations de base de données s'appliquent au démarrage) ;
3. construit l'interface et la publie sur le site Firebase `forlifecom-app`.

Vérification : `https://forlifecom-app.web.app/api/health` doit répondre `{"status":"ok",…}`.

## 3. Premier accès administrateur

1. Ouvrez `https://forlifecom-app.web.app/signup` et créez votre compte **avec l'email déclaré
   dans `PLATFORM_ADMIN_EMAILS`**.
2. Le menu **Plateforme → Back-office** apparaît : `https://forlifecom-app.web.app/admin`.
3. Pour les 15 premiers clients : back-office → organisation → plan **Starter** (1 mois offert,
   retour automatique au plan Free à l'échéance sans paiement).

## 4. Brancher les services externes

| Service | Où le configurer | URL de retour à déclarer |
|---|---|---|
| CinetPay | back-office CinetPay → API key + Site ID | Notification : `https://forlifecom-app.web.app/api/public/payments/cinetpay/notify` |
| Meta (Facebook/Instagram) | developers.facebook.com → app → Facebook Login | Redirection OAuth : `https://forlifecom-app.web.app/api/social/oauth/meta/callback` |
| Resend (emails) | resend.com → domaine `forlifecom.ci` vérifié | — |

Après ajout d'un secret, relancez le workflow de déploiement.

## 5. Coûts indicatifs (à faible trafic)

| Poste | Estimation mensuelle |
|---|---|
| Cloud Run (1 instance toujours active, 2 vCPU / 2 Go) | ~ 60 à 90 USD |
| Cloud SQL `db-g1-small` | ~ 25 à 30 USD |
| Cloud Storage + Artifact Registry | < 5 USD |
| Firebase Hosting | gratuit (quota Spark/Blaze) |

Pour réduire les coûts au lancement : `--min-instances 0` (le worker ne tourne alors que pendant
les requêtes : publications programmées et rendus vidéo moins réactifs) ou `--cpu 1 --memory 1Gi`.

## 6. Exploitation

- **Logs** : Cloud Run → forlife-api → Journaux (chaque requête porte un `x-correlation-id`).
- **Sauvegardes** : Cloud SQL sauvegarde chaque nuit (02:00) ; restauration depuis la console.
- **Mise à jour** : chaque relance du workflow déploie la dernière version de la branche choisie.
- **Retour arrière** : Cloud Run → Révisions → rediriger 100 % du trafic vers la révision précédente.
