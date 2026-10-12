#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Forlife Com — branchement de Cloud SQL et préparation de la production.
#
# À lancer dans Cloud Shell (https://shell.cloud.google.com), connecté au projet :
#   bash gcp-setup.sh                        # instance Cloud SQL « forlife-db »
#   INSTANCE=mon-instance bash gcp-setup.sh  # si votre instance porte un autre nom
#
# Le script est idempotent : il peut être relancé sans risque. Il ne remplace
# jamais une clé existante (la clé de chiffrement des jetons sociaux est conservée).
# Aucun mot de passe n'est affiché ni écrit dans l'historique du terminal.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT="${PROJECT:-forlifecom-6eef9}"
REGION="${REGION:-europe-west1}"
INSTANCE="${INSTANCE:-forlife-db}"
DB_NAME="${DB_NAME:-forlife}"
DB_USER="${DB_USER:-forlife}"
BUCKET="${BUCKET:-forlifecom-app-files}"
REPO="${REPO:-forlife}"
SITE="${SITE:-forlifecom-app}"
GITHUB_REPO="${GITHUB_REPO:-forlifeimprim-stack/FORLIFE}"
API_SA="forlife-api@${PROJECT}.iam.gserviceaccount.com"
DEPLOY_SA="github-deploy@${PROJECT}.iam.gserviceaccount.com"

ok()   { printf '  \033[32m✔\033[0m %s\n' "$*"; }
info() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[31m✖ %s\033[0m\n' "$*" >&2; exit 1; }
randpw() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 32; }

gcloud config set project "$PROJECT" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"

info "1/9 Services Google Cloud"
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com storage.googleapis.com iamcredentials.googleapis.com \
  sts.googleapis.com firebasehosting.googleapis.com --quiet
ok "services activés"

info "2/9 Instance Cloud SQL « $INSTANCE »"
gcloud sql instances describe "$INSTANCE" --format='value(name)' >/dev/null 2>&1 \
  || die "Instance « $INSTANCE » introuvable. Relancez avec INSTANCE=<nom de votre instance> bash gcp-setup.sh"
VERSION="$(gcloud sql instances describe "$INSTANCE" --format='value(databaseVersion)')"
CONNECTION="$(gcloud sql instances describe "$INSTANCE" --format='value(connectionName)')"
[[ "$VERSION" == POSTGRES_* ]] || die "L'instance « $INSTANCE » n'est pas PostgreSQL ($VERSION)."
ok "$VERSION — $CONNECTION"

info "3/9 Sécurisation de l'instance"
# Aucun réseau ouvert : Cloud Run passe par le connecteur Cloud SQL (chiffré, authentifié par IAM).
NETWORKS="$(gcloud sql instances describe "$INSTANCE" --format='value(settings.ipConfiguration.authorizedNetworks[].value)')"
if [[ -n "$NETWORKS" ]]; then
  warn "Réseaux autorisés trouvés : $NETWORKS"
  read -r -p "  Les supprimer (recommandé, l'application n'en a pas besoin) ? [o/N] " ans
  if [[ "${ans,,}" == o* ]]; then
    gcloud sql instances patch "$INSTANCE" --clear-authorized-networks --quiet >/dev/null && ok "réseaux autorisés supprimés"
  fi
else
  ok "aucun réseau externe autorisé"
fi
gcloud sql instances patch "$INSTANCE" --ssl-mode=ENCRYPTED_ONLY --quiet >/dev/null && ok "connexions chiffrées obligatoires"
gcloud sql instances patch "$INSTANCE" --deletion-protection --quiet >/dev/null && ok "protection contre la suppression"
gcloud sql instances patch "$INSTANCE" --backup-start-time=02:00 --enable-point-in-time-recovery \
  --retained-backups-count=14 --quiet >/dev/null && ok "sauvegardes quotidiennes (14 j) + restauration à la minute"

info "4/9 Base « $DB_NAME » et utilisateur « $DB_USER »"
if gcloud sql databases describe "$DB_NAME" --instance="$INSTANCE" >/dev/null 2>&1; then
  ok "base existante"
else
  gcloud sql databases create "$DB_NAME" --instance="$INSTANCE" --quiet >/dev/null && ok "base créée"
fi
if gcloud secrets describe forlife-database-url >/dev/null 2>&1; then
  ok "secret forlife-database-url déjà présent (mot de passe inchangé)"
else
  # Mot de passe aléatoire fort, jamais affiché : il n'existe que dans Secret Manager.
  PW="$(randpw)"
  USERS="$(gcloud sql users list --instance="$INSTANCE" --format='value(name)')"
  if grep -qx "$DB_USER" <<<"$USERS"; then
    gcloud sql users set-password "$DB_USER" --instance="$INSTANCE" --password="$PW" --quiet >/dev/null
    ok "mot de passe de « $DB_USER » renouvelé (aléatoire, 32 caractères)"
  else
    gcloud sql users create "$DB_USER" --instance="$INSTANCE" --password="$PW" --quiet >/dev/null
    ok "utilisateur « $DB_USER » créé"
  fi
  printf 'postgresql://%s:%s@localhost/%s?host=/cloudsql/%s&connection_limit=5' "$DB_USER" "$PW" "$DB_NAME" "$CONNECTION" \
    | gcloud secrets create forlife-database-url --replication-policy=automatic --data-file=- >/dev/null
  unset PW
  ok "secret forlife-database-url créé"
fi

info "5/9 Clés de l'application (Secret Manager)"
if gcloud secrets describe forlife-jwt-secret >/dev/null 2>&1; then ok "forlife-jwt-secret déjà présent"; else
  openssl rand -base64 48 | tr -d '\n' | gcloud secrets create forlife-jwt-secret --replication-policy=automatic --data-file=- >/dev/null
  ok "forlife-jwt-secret créé"
fi
if gcloud secrets describe forlife-encryption-key >/dev/null 2>&1; then ok "forlife-encryption-key déjà présent (conservé)"; else
  openssl rand -base64 32 | tr -d '\n' | gcloud secrets create forlife-encryption-key --replication-policy=automatic --data-file=- >/dev/null
  ok "forlife-encryption-key créé"
fi

info "6/9 Stockage des fichiers (privé)"
if gcloud storage buckets describe "gs://$BUCKET" >/dev/null 2>&1; then ok "bucket existant"; else
  gcloud storage buckets create "gs://$BUCKET" --location="$REGION" --uniform-bucket-level-access --quiet >/dev/null
  ok "bucket créé"
fi
gcloud storage buckets update "gs://$BUCKET" --public-access-prevention --uniform-bucket-level-access --quiet >/dev/null
ok "accès public interdit"

info "7/9 Comptes de service (droits minimaux)"
gcloud iam service-accounts describe "$API_SA" >/dev/null 2>&1 \
  || gcloud iam service-accounts create forlife-api --display-name="Forlife Com API" --quiet >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$API_SA" --role=roles/cloudsql.client --condition=None --quiet >/dev/null
for S in forlife-database-url forlife-jwt-secret forlife-encryption-key; do
  gcloud secrets add-iam-policy-binding "$S" --member="serviceAccount:$API_SA" --role=roles/secretmanager.secretAccessor --quiet >/dev/null
done
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member="serviceAccount:$API_SA" --role=roles/storage.objectAdmin --quiet >/dev/null
ok "forlife-api : Cloud SQL, ses 3 secrets et son bucket uniquement"

gcloud artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1 \
  || gcloud artifacts repositories create "$REPO" --repository-format=docker --location="$REGION" --quiet >/dev/null
gcloud iam service-accounts describe "$DEPLOY_SA" >/dev/null 2>&1 \
  || gcloud iam service-accounts create github-deploy --display-name="GitHub deploy" --quiet >/dev/null
for ROLE in roles/run.admin roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$DEPLOY_SA" --role="$ROLE" --condition=None --quiet >/dev/null
done
gcloud artifacts repositories add-iam-policy-binding "$REPO" --location="$REGION" --member="serviceAccount:$DEPLOY_SA" --role=roles/artifactregistry.writer --quiet >/dev/null
# Le déploiement peut « agir en tant que » forlife-api, et seulement lui.
gcloud iam service-accounts add-iam-policy-binding "$API_SA" --member="serviceAccount:$DEPLOY_SA" --role=roles/iam.serviceAccountUser --quiet >/dev/null
ok "github-deploy : déploiement uniquement"

info "8/9 Connexion GitHub sans clé (Workload Identity Federation)"
POOL=github
PROVIDER=github-actions
gcloud iam workload-identity-pools describe "$POOL" --location=global >/dev/null 2>&1 \
  || gcloud iam workload-identity-pools create "$POOL" --location=global --display-name="GitHub Actions" --quiet >/dev/null
gcloud iam workload-identity-pools providers describe "$PROVIDER" --workload-identity-pool="$POOL" --location=global >/dev/null 2>&1 \
  || gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" --workload-identity-pool="$POOL" --location=global \
       --issuer-uri="https://token.actions.githubusercontent.com" \
       --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
       --attribute-condition="assertion.repository=='${GITHUB_REPO}'" --quiet >/dev/null
gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository/${GITHUB_REPO}" --quiet >/dev/null
WIF="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/providers/${PROVIDER}"
ok "seul le dépôt ${GITHUB_REPO} peut déployer (aucune clé JSON à stocker)"

info "9/9 Site Firebase de l'application"
if command -v firebase >/dev/null 2>&1 || command -v npx >/dev/null 2>&1; then
  FB="firebase"; command -v firebase >/dev/null 2>&1 || FB="npx --yes firebase-tools@13"
  if $FB hosting:sites:get "$SITE" --project "$PROJECT" >/dev/null 2>&1; then ok "site $SITE existant"
  elif $FB hosting:sites:create "$SITE" --project "$PROJECT" >/dev/null 2>&1; then ok "site $SITE créé"
  else warn "créez le site « $SITE » dans la console Firebase → Hosting → Ajouter un autre site"; fi
else
  warn "créez le site « $SITE » dans la console Firebase → Hosting → Ajouter un autre site"
fi

cat <<EOF

────────────────────────────────────────────────────────────────────────────
✅ Base de données branchée et production préparée.

À saisir dans GitHub → dépôt → Settings → Secrets and variables → Actions → Variables :

  GCP_WIF_PROVIDER       ${WIF}
  GCP_DEPLOY_SA          ${DEPLOY_SA}
  CLOUDSQL_INSTANCE      ${CONNECTION}
  GCS_BUCKET             ${BUCKET}
  APP_URL                https://${SITE}.web.app
  PLATFORM_ADMIN_EMAILS  <votre email d'administrateur>
  AI_PROVIDERS           mock   (puis « anthropic » quand la clé Anthropic est ajoutée)

Puis : Actions → « Déploiement plateforme » → Run workflow.
Les tables sont créées automatiquement au premier démarrage (migrations Prisma).
Contrôle : https://${SITE}.web.app/api/health doit répondre {"status":"ok"} (connexion base vérifiée).
────────────────────────────────────────────────────────────────────────────
EOF
