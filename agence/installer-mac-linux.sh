#!/usr/bin/env bash
# Installe tout ce qu'il faut pour l'agence d'agents Forlife sur Mac ou Linux (Ubuntu/Debian).
# Usage, depuis le dossier du dépôt :  bash agence/installer-mac-linux.sh [--montage]
set -euo pipefail
cd "$(dirname "$0")/.."
etape() { printf '\n== %s\n' "$1"; }
present() { command -v "$1" >/dev/null 2>&1; }

etape "Outils de base (Git, Node.js 20+, FFmpeg)"
if [ "$(uname)" = Darwin ]; then
  present brew || { echo "Installer Homebrew d'abord : https://brew.sh"; exit 1; }
  for p in git node ffmpeg; do present "$p" || brew install "$p"; done
else
  manque=""
  present git || manque="$manque git"
  present ffmpeg || manque="$manque ffmpeg"
  present python3 || manque="$manque python3 python3-venv"
  [ -n "$manque" ] && sudo apt-get update && sudo apt-get install -y $manque
  if ! present node || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
    echo "Node.js 20 ou plus requis : https://nodejs.org (ou : curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs)"; exit 1
  fi
fi

etape "Dépendances du dépôt (Playwright)"
npm install

etape "Navigateur de rendu (Chromium pour Playwright)"
if [ "$(uname)" = Darwin ]; then npx playwright install chromium; else npx playwright install --with-deps chromium; fi

if [ "${1:-}" = "--montage" ]; then
  etape "Moteur de montage vidéo short-editing (~15 min, 0,5 Go)"
  node .claude/skills/short-editing/engine/setup.mjs
  echo "Ensuite, dans Claude Code : /studio-setup"
fi

etape "Vérification"
node agence/verifier.mjs || true
