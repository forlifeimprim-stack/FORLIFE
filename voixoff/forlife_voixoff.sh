#!/usr/bin/env bash
# « FOR LIFE voix off » : texte -> MP3 lu avec la voix de Kouadio Koffi Elisée.
# Usage : bash voixoff/forlife_voixoff.sh texte.txt sortie.mp3 [vitesse]
# L'enregistrement de référence est cherché, dans l'ordre : $FORLIFE_VOIX, voixoff/voix/, $FORLIFE_VOIXOFF_HOME/voix/.
set -euo pipefail
[ $# -ge 2 ] || { echo "usage : $0 texte.txt sortie.mp3 [vitesse=1.08]" >&2; exit 1; }
TEXTE="$(realpath "$1")"; SORTIE="$(realpath -m "$2")"; VITESSE="${3:-1.08}"
ICI="$(cd "$(dirname "$0")" && pwd)"
H="${FORLIFE_VOIXOFF_HOME:-$HOME/.forlife-voixoff}"
export TORCH_HOME="$H/torch"

[ -x "$H/venv/bin/python" ] && [ -f "$H/knn-vc/hubconf.py" ] || bash "$ICI/installer.sh"
PY="$H/venv/bin/python -W ignore"

VOIX="${FORLIFE_VOIX:-}"
for d in "$ICI/voix" "$H/voix"; do
  [ -n "$VOIX" ] && break
  VOIX="$(ls "$d"/*.m4a "$d"/*.wav "$d"/*.mp3 2>/dev/null | head -1 || true)"
done
[ -n "$VOIX" ] && [ -f "$VOIX" ] || { echo "Enregistrement de la voix introuvable : définir FORLIFE_VOIX=/chemin/voix.m4a" >&2; exit 1; }

# profil vocal, recréé si l'enregistrement change
P="$H/profil"; SIG="$(sha256sum "$VOIX" | cut -c1-16)"
if [ "$(cat "$P/signature" 2>/dev/null)" != "$SIG" ]; then
  echo "== Création du profil vocal depuis $VOIX"
  $PY "$ICI/profil.py" "$VOIX" "$P" --knn "$H/knn-vc"
  echo "$SIG" > "$P/signature"
fi

T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
echo "== 1/4 Lecture du texte (Supertonic 3, voix 9, vitesse $VITESSE)"
$PY "$ICI/voixoff2.py" "$TEXTE" "$T/source.wav" --modele "$H/models/sherpa-onnx-supertonic-3-tts-int8-2026-05-11" --voix 9 --vitesse "$VITESSE" --etapes 16
echo "== 2/4 Conversion vers le timbre FOR LIFE (kNN-VC)"
$PY "$ICI/convertir.py" "$T/source.wav" "$T/conv.wav" --knn "$H/knn-vc" --ms "$P/voix.pt" --topk 4
echo "== 3/4 Empreinte spectrale de l'enregistrement d'origine"
$PY "$ICI/ressemblance.py" "$T/conv.wav" "$T/final16k.wav" --ref "$P/ref_brut16k.wav"
echo "== 4/4 Mastering"
ffmpeg -v error -y -i "$T/final16k.wav" \
  -af "highpass=f=55,acompressor=threshold=-22dB:ratio=2:attack=15:release=200,loudnorm=I=-16:TP=-1.5:LRA=9" \
  -ar 44100 -b:a 160k "$SORTIE"
echo "OK : $SORTIE"
