#!/usr/bin/env bash
# Compléments optionnels, non inclus dans le dépôt (licence non précisée ou installation lourde).
# Usage : bash agence/installer-extras.sh remotion|montage
set -euo pipefail
cd "$(dirname "$0")/.."
case "${1:-}" in
  remotion)
    # Skills officiels Remotion (vidéo en React). Le dépôt remotion-dev/skills n'a pas de fichier de licence :
    # on l'installe chez soi plutôt que de le redistribuer. Remotion est gratuit pour les petites structures
    # (voir https://www.remotion.dev/docs/license).
    npx skills add remotion-dev/skills -a claude-code ;;
  montage)
    # Prépare le moteur de montage « short-editing » (Node, Chrome, ffmpeg, whisper.cpp ; ~15 min la 1re fois).
    node .claude/skills/short-editing/engine/setup.mjs --check || node .claude/skills/short-editing/engine/setup.mjs ;;
  *)
    echo "usage : bash agence/installer-extras.sh remotion|montage"; exit 1 ;;
esac
