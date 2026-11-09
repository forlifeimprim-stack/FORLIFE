#!/usr/bin/env bash
# Voix off de la présentation : Microsoft Henri (neural, gratuit via edge-tts), plus grave et traitée
# façon bande-annonce. Usage : presentation-voix.sh <edge-tts> <dossier de sortie> [fichier de répliques]
set -euo pipefail
EDGE="$1"; OUT="$2"; mkdir -p "$OUT"
DIR="$(cd "$(dirname "$0")" && pwd)"
while IFS='|' read -r key text; do
  [ -z "$key" ] && continue
  "$EDGE" ${HTTPS_PROXY:+--proxy "$HTTPS_PROXY"} --voice fr-FR-HenriNeural --rate=-6% --pitch=-6Hz --text "$text" --write-media "$OUT/$key.raw.mp3" </dev/null
  # Grave : on abaisse la hauteur de ~2 demi-tons sans changer le débit, puis voix « cinéma » :
  # graves chauds, présence, compression serrée, petite réverbération de salle, niveau broadcast.
  ffmpeg -nostdin -y -v error -i "$OUT/$key.raw.mp3" -af "aresample=48000,asetrate=48000*0.89,aresample=48000,atempo=1/0.89,\
highpass=f=55,equalizer=f=110:t=q:w=1:g=4,equalizer=f=320:t=q:w=1.2:g=-2,equalizer=f=3000:t=q:w=1.4:g=3,\
acompressor=threshold=-22dB:ratio=5:attack=4:release=90:makeup=7dB,aecho=0.8:0.6:38|71:0.13|0.08,\
alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=7" -ac 2 -b:a 192k "$OUT/$key.mp3"
  rm -f "$OUT/$key.raw.mp3"
  printf "%s %.2f s\n" "$key" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$key.mp3")"
done < "${3:-$DIR/presentation-voix.txt}"
