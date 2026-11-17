#!/usr/bin/env bash
# Lance VoiceStudio : API sur le port 3900, interface web sur le port 3901.
# Installe le logiciel s'il manque, télécharge le modèle OmniVoice (3,3 Go) s'il manque,
# et accepte ses licences (non commerciales, acceptées par Kouadio Koffi Elisée le 15/11/2026).
set -uo pipefail
VS=${VOICESTUDIO_HOME:-/opt/VoiceStudio}
LOGS=${VOICESTUDIO_LOGS:-/tmp/voicestudio}
API=http://127.0.0.1:3900
ICI=$(cd "$(dirname "$0")" && pwd)
export PATH="/root/.bun/bin:/root/.local/bin:/opt/node22/bin:$PATH"
export OMNIVOICE_ANALYTICS_DISABLED=1 OMNIVOICE_SEGMENTED_DOWNLOAD=0
mkdir -p "$LOGS"

[ -d "$VS/.venv" ] || bash "$ICI/installer.sh" || { echo "Installation de VoiceStudio échouée"; exit 1; }

cd "$VS"
curl -sf "$API/health" >/dev/null || setsid nohup bun run dev:api > "$LOGS/api.log" 2>&1 < /dev/null &
curl -sf -o /dev/null http://127.0.0.1:3901/ || setsid nohup bun run dev:frontend > "$LOGS/web.log" 2>&1 < /dev/null &
for _ in $(seq 300); do curl -sf "$API/health" >/dev/null && break; sleep 2; done
curl -sf "$API/health" >/dev/null || { echo "L'API ne répond pas, voir $LOGS/api.log"; tail -20 "$LOGS/api.log"; exit 1; }

installe() { curl -s "$API/models" | python3 -c "
import json,sys; d=json.load(sys.stdin); d=d if isinstance(d,list) else d.get('models',[])
sys.exit(0 if any(m.get('repo_id')=='k2-fsa/OmniVoice' and m.get('installed') for m in d) else 1)"; }
if ! installe; then
  echo "Téléchargement du modèle OmniVoice (3,3 Go)…"
  curl -s -X POST "$API/models/install" -H 'Content-Type: application/json' -d '{"repo_id":"k2-fsa/OmniVoice"}' >/dev/null
  until installe; do
    curl -s "$API/models/install/status" | grep -q '"state":"failed"' && { echo "Téléchargement échoué :"; curl -s "$API/models/install/status"; exit 1; }
    sleep 10
  done
fi

for r in k2-fsa/OmniVoice eustlb/higgs-audio-v2-tokenizer; do
  curl -s "$API/models/licenses/acceptance/$r" | python3 -c "
import json,sys,urllib.request; d=json.load(sys.stdin)
if not d.get('accepted'):
    req=urllib.request.Request('$API/models/licenses/accept', method='POST', headers={'Content-Type':'application/json'},
        data=json.dumps({'repo_id':d['repo_id'],'fingerprint':d['fingerprint'],'accepted':True}).encode())
    urllib.request.urlopen(req).read()"
done

curl -s "$API/health"; echo
echo "VoiceStudio prêt : interface http://localhost:3901  ·  API $API"
