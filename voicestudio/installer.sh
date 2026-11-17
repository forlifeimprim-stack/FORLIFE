#!/usr/bin/env bash
# Installe VoiceStudio (github.com/debpalash/VoiceStudio) en mode CPU dans $VOICESTUDIO_HOME.
# Idempotent : relancer ne refait que ce qui manque. Le modèle vocal se télécharge au premier lancement.
set -euo pipefail
VS=${VOICESTUDIO_HOME:-/opt/VoiceStudio}
REV=45e9643bdc369e32dee093cb3d42501fec46a501   # version 0.5.9-beta.3 testée le 15/11/2026
export PATH="/root/.bun/bin:/root/.local/bin:/opt/node22/bin:$PATH"
export OMNIVOICE_TORCH_VARIANT=cpu
mkdir -p "$VS" && cd "$VS"
[ -d .git ] || git init -q
git remote get-url origin >/dev/null 2>&1 || git remote add origin https://github.com/debpalash/VoiceStudio.git
if [ "$(git rev-parse -q --verify HEAD || true)" != "$REV" ]; then
  git fetch -q --depth 1 origin "$REV"
  git checkout -q --force FETCH_HEAD
fi
bun install --frozen-lockfile
bun run setup:api
echo "VoiceStudio installé dans $VS"
