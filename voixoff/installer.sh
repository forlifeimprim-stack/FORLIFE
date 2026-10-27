#!/usr/bin/env bash
# Installe la chaîne « FOR LIFE voix off » (Supertonic 3 + kNN-VC) dans $FORLIFE_VOIXOFF_HOME.
# Idempotent : relancer le script reprend là où il s'est arrêté.
# Les gros fichiers sont téléchargés avec curl et reprise, car pip cale sur les gros paquets via le proxy.
set -euo pipefail
H="${FORLIFE_VOIXOFF_HOME:-$HOME/.forlife-voixoff}"
mkdir -p "$H"/{wheels,models,torch/hub/checkpoints}
cd "$H"

telecharger() {  # telecharger URL FICHIER
  local url="$1" f="$2"
  [ -f "$f.ok" ] && return 0
  for i in $(seq 1 40); do
    curl -sSL -C - --speed-limit 50000 --speed-time 20 -o "$f" "$url" 2>/dev/null && { touch "$f.ok"; return 0; }
    sleep 2
  done
  echo "échec du téléchargement : $url" >&2; return 1
}

url_roue() {  # url_roue PAQUET VERSION -> URL de la roue manylinux x86_64 pour ce Python
  curl -sS "https://pypi.org/pypi/$1/$2/json" | python3 -c "
import json, sys
tag = 'cp%d%d' % sys.version_info[:2]
us = [u for u in json.load(sys.stdin)['urls'] if 'manylinux' in u['filename'] and 'x86_64' in u['filename']]
us = [u for u in us if tag in u['filename']] or [u for u in us if 'py3-none' in u['filename']]
print(us[0]['url'])"
}

echo "== Environnement Python"
[ -x venv/bin/python ] || python3 -m venv venv
PIP="venv/bin/pip install -q --progress-bar off --timeout 30 --retries 10"

if ! venv/bin/python -c "import torch, torchaudio" 2>/dev/null; then
  echo "== PyTorch (CPU, avec ses bibliothèques CUDA requises à l'import)"
  for spec in torch==2.8.0 torchaudio==2.8.0 nvidia-cuda-nvrtc-cu12==12.8.93 nvidia-cuda-runtime-cu12==12.8.90 \
      nvidia-cuda-cupti-cu12==12.8.90 nvidia-cudnn-cu12==9.10.2.21 nvidia-cublas-cu12==12.8.4.1 nvidia-cufft-cu12==11.3.3.83 \
      nvidia-curand-cu12==10.3.9.90 nvidia-cusolver-cu12==11.7.3.90 nvidia-cusparse-cu12==12.5.8.93 nvidia-cusparselt-cu12==0.7.1 \
      nvidia-nccl-cu12==2.27.3 nvidia-nvtx-cu12==12.8.90 nvidia-nvjitlink-cu12==12.8.93 nvidia-cufile-cu12==1.13.1.3; do
    u=$(url_roue "${spec%%==*}" "${spec##*==}")
    echo "   $(basename "$u")"
    telecharger "$u" "wheels/$(basename "$u")"
  done
  $PIP --no-deps wheels/*.whl
  rm -rf wheels/*
fi
$PIP filelock sympy networkx jinja2 fsspec typing_extensions setuptools numpy scipy librosa soundfile sherpa-onnx 2>&1 \
  | grep -v -iE "nvidia|triton|requires|resolver" || true
venv/bin/python -c "import torch, torchaudio, librosa, sherpa_onnx, scipy" && echo "   dépendances OK"

echo "== Modèles"
B=https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models
ST=sherpa-onnx-supertonic-3-tts-int8-2026-05-11
if [ ! -f "models/$ST/voice.bin" ]; then
  telecharger "$B/$ST.tar.bz2" "models/$ST.tar.bz2"
  tar xjf "models/$ST.tar.bz2" -C models && rm -f "models/$ST.tar.bz2" "models/$ST.tar.bz2.ok"
fi
K=https://github.com/bshall/knn-vc/releases/download/v0.1
telecharger "$K/WavLM-Large.pt" torch/hub/checkpoints/WavLM-Large.pt
telecharger "$K/prematch_g_02500000.pt" torch/hub/checkpoints/prematch_g_02500000.pt
[ -f knn-vc/hubconf.py ] || git clone -q https://github.com/bshall/knn-vc.git knn-vc
echo "== Installation terminée dans $H"
