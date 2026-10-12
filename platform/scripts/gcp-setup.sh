#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Forlife Com — branchement de Cloud SQL et préparation de la production
# dans le projet Firebase « AI Growth et Creative OS ».
#
# Dans Cloud Shell (https://shell.cloud.google.com), une seule commande :
#   bash <(curl -fsSL https://raw.githubusercontent.com/forlifeimprim-stack/FORLIFE/claude/app-development-sbl2ff/platform/scripts/gcp-setup.sh)
#
# Le projet et l'instance PostgreSQL sont détectés automatiquement (variables
# PROJECT=… et INSTANCE=… pour forcer un choix). Le script est idempotent : il peut
# être relancé sans risque et ne remplace jamais une clé existante.
# Aucun mot de passe n'est affiché ni écrit dans l'historique du terminal.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-AI Growth et Creative OS}"
REGION="${REGION:-europe-west1}"
DB_NAME="${DB_NAME:-forlife}"
DB_USER="${DB_USER:-forlife}"
REPO="${REPO:-forlife}"
GITHUB_REPO="${GITHUB_REPO:-forlifeimprim-stack/FORLIFE}"

ok()   { printf '  \033[32m✔\033[0m %s\n' "$*"; }
info() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
die()  { printf '\n\033[31m✖ %s\033[0m\n' "$*" >&2; exit 1; }
randpw() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 32; }

info "0/9 Projet « $PROJECT_NAME »"
if [[ -z "${PROJECT:-}" ]]; then
  PROJECT="$(gcloud projects list --filter="name=\"$PROJECT_NAME\"" --format='value(projectId)' | head -n1)"
  [[ -n "$PROJECT" ]] || PROJECT="$(gcloud config get-value project 2>/dev/null || true)"
fi
[[ -n "$PROJECT" ]] || die "Projet introuvable. Relancez avec PROJECT=<ID du projet> (Firebase → Paramètres du projet)."
gcloud config set project "$PROJECT" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
ok "ID $PROJECT — numéro $PROJECT_NUMBER"
BUCKET="${BUCKET:-${PROJECT}-files}"
SITE="${SITE:-$PROJECT}"
API_SA="forlife-api@${PROJECT}.iam.gserviceaccount.com"
DEPLOY_SA="github-deploy@${PROJECT}.iam.gserviceaccount.com"

if [[ -z "${INSTANCE:-}" ]]; then
  mapfile -t PG < <(gcloud sql instances list --filter='databaseVersion~^POSTGRES' --format='value(name)')
  if (( ${#PG[@]} == 0 )); then die "Aucune instance PostgreSQL trouvée dans $PROJECT."
  elif (( ${#PG[@]} == 1 )); then INSTANCE="${PG[0]}"
  else
    echo "  Plusieurs instances PostgreSQL :"; select INSTANCE in "${PG[@]}"; do [[ -n "$INSTANCE" ]] && break; done
  fi
fi
INSTANCE_REGION="$(gcloud sql instances describe "$INSTANCE" --format='value(region)')"
[[ "$INSTANCE_REGION" == "$REGION" ]] || warn "Instance en $INSTANCE_REGION, Cloud Run en $REGION : cela fonctionne, mais la même région est plus rapide."

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

info "4/9 Base « $DB_NAME » et comptes d'accès"
if gcloud sql databases describe "$DB_NAME" --instance="$INSTANCE" >/dev/null 2>&1; then
  ok "base existante"
else
  gcloud sql databases create "$DB_NAME" --instance="$INSTANCE" --quiet >/dev/null && ok "base créée"
fi
USERS="$(gcloud sql users list --instance="$INSTANCE" --format='value(name)')"
# Crée (ou réinitialise) un compte avec un mot de passe aléatoire et range son URL de connexion dans un secret.
# Le mot de passe n'est jamais affiché : il n'existe que dans Secret Manager.
db_account() { # $1 = utilisateur, $2 = secret
  local user="$1" secret="$2" pw
  if gcloud secrets describe "$secret" >/dev/null 2>&1; then ok "$secret déjà présent (mot de passe inchangé)"; return; fi
  pw="$(randpw)"
  if grep -qx "$user" <<<"$USERS"; then
    gcloud sql users set-password "$user" --instance="$INSTANCE" --password="$pw" --quiet >/dev/null
  else
    gcloud sql users create "$user" --instance="$INSTANCE" --password="$pw" --quiet >/dev/null
  fi
  printf 'postgresql://%s:%s@localhost/%s?host=/cloudsql/%s&connection_limit=5' "$user" "$pw" "$DB_NAME" "$CONNECTION" \
    | gcloud secrets create "$secret" --replication-policy=automatic --data-file=- >/dev/null
  ok "compte « $user » prêt, URL rangée dans $secret"
}
# Propriétaire des tables : utilisé UNIQUEMENT par le job de migration.
db_account "$DB_USER" forlife-database-migrator-url
# Compte de l'application : lecture/écriture des données seulement (droits posés à chaque déploiement).
db_account forlife_app forlife-database-url

info "5/9 Clés de l'application (Secret Manager)"
if gcloud secrets describe forlife-jwt-secret >/dev/null 2>&1; then ok "forlife-jwt-secret déjà présent"; else
  openssl rand -base64 48 | tr -d '\n' | gcloud secrets create forlife-jwt-secret --replication-policy=automatic --data-file=- >/dev/null
  ok "forlife-jwt-secret créé"
fi
if gcloud secrets describe forlife-encryption-key >/dev/null 2>&1; then ok "forlife-encryption-key déjà présent (conservé)"; else
  openssl rand -base64 32 | tr -d '\n' | gcloud secrets create forlife-encryption-key --replication-policy=automatic --data-file=- >/dev/null
  ok "forlife-encryption-key créé"
fi

# Email(s) administrateur : stockés comme secret (le dépôt GitHub est public).
if gcloud secrets describe forlife-admin-emails >/dev/null 2>&1; then ok "forlife-admin-emails déjà présent"; else
  DEFAULT_EMAIL="$(gcloud config get-value account 2>/dev/null || true)"
  read -r -p "  Email de l'administrateur de la plateforme [$DEFAULT_EMAIL] : " ADMIN_EMAIL
  ADMIN_EMAIL="${ADMIN_EMAIL:-$DEFAULT_EMAIL}"
  [[ "$ADMIN_EMAIL" == *@* ]] || die "Email invalide."
  printf '%s' "${ADMIN_EMAIL,,}" | gcloud secrets create forlife-admin-emails --replication-policy=automatic --data-file=- >/dev/null
  ok "forlife-admin-emails créé"
fi
# Code d'activation du back-office : sans lui, l'email administrateur seul ne suffit pas.
NEW_BOOTSTRAP=""
if gcloud secrets describe forlife-admin-bootstrap >/dev/null 2>&1; then ok "forlife-admin-bootstrap déjà présent"; else
  NEW_BOOTSTRAP="$(randpw)"
  printf '%s' "$NEW_BOOTSTRAP" | gcloud secrets create forlife-admin-bootstrap --replication-policy=automatic --data-file=- >/dev/null
  ok "forlife-admin-bootstrap créé"
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
for S in forlife-database-url forlife-database-migrator-url forlife-jwt-secret forlife-encryption-key forlife-admin-emails forlife-admin-bootstrap; do
  gcloud secrets add-iam-policy-binding "$S" --member="serviceAccount:$API_SA" --role=roles/secretmanager.secretAccessor --quiet >/dev/null
done
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member="serviceAccount:$API_SA" --role=roles/storage.objectAdmin --quiet >/dev/null
ok "forlife-api : Cloud SQL, ses propres secrets et son bucket uniquement"

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
# Seuls les pushs / lancements manuels de ce dépôt, sur main ou la branche de développement, peuvent déployer.
CONDITION="assertion.repository=='${GITHUB_REPO}' && (assertion.event_name=='push' || assertion.event_name=='workflow_dispatch') && (assertion.ref=='refs/heads/main' || assertion.ref=='refs/heads/claude/app-development-sbl2ff')"
MAPPING="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref,attribute.event_name=assertion.event_name"
gcloud iam workload-identity-pools describe "$POOL" --location=global >/dev/null 2>&1 \
  || gcloud iam workload-identity-pools create "$POOL" --location=global --display-name="GitHub Actions" --quiet >/dev/null
if gcloud iam workload-identity-pools providers describe "$PROVIDER" --workload-identity-pool="$POOL" --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers update-oidc "$PROVIDER" --workload-identity-pool="$POOL" --location=global \
    --attribute-mapping="$MAPPING" --attribute-condition="$CONDITION" --quiet >/dev/null
else
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" --workload-identity-pool="$POOL" --location=global \
    --issuer-uri="https://token.actions.githubusercontent.com" --attribute-mapping="$MAPPING" --attribute-condition="$CONDITION" --quiet >/dev/null
fi
gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository/${GITHUB_REPO}" --quiet >/dev/null
ok "seul le dépôt ${GITHUB_REPO} (push sur ses branches, jamais une pull request) peut déployer, sans clé à stocker"

info "9/9 Site Firebase de l'application"
if command -v firebase >/dev/null 2>&1 || command -v npx >/dev/null 2>&1; then
  FB="firebase"; command -v firebase >/dev/null 2>&1 || FB="npx --yes firebase-tools@13"
  if $FB hosting:sites:get "$SITE" --project "$PROJECT" >/dev/null 2>&1; then ok "site $SITE existant"
  elif $FB hosting:sites:create "$SITE" --project "$PROJECT" >/dev/null 2>&1; then ok "site $SITE créé"
  else warn "ouvrez la console Firebase → Hosting → « Commencer » pour activer l'hébergement du projet"; fi
else
  warn "ouvrez la console Firebase → Hosting → « Commencer » pour activer l'hébergement du projet"
fi

cat <<EOF

────────────────────────────────────────────────────────────────────────────
✅ Base de données branchée et production préparée.

Copiez-collez ce bloc à Claude pour lancer le déploiement (aucun secret dedans) :

  GCP_PROJECT_ID=${PROJECT}
  GCP_PROJECT_NUMBER=${PROJECT_NUMBER}
  CLOUDSQL_INSTANCE=${CONNECTION}
  GCS_BUCKET=${BUCKET}
  FIREBASE_SITE=${SITE}
────────────────────────────────────────────────────────────────────────────
EOF
if [[ -n "$NEW_BOOTSTRAP" ]]; then
  cat <<EOF

🔑 Code d'activation du back-office (gardez-le pour vous, ne l'envoyez à personne) :

     ${NEW_BOOTSTRAP}

   Après le déploiement : créez votre compte avec votre email administrateur,
   ouvrez « Back-office » et saisissez ce code. Il reste consultable avec :
   gcloud secrets versions access latest --secret=forlife-admin-bootstrap
EOF
fi
