#!/bin/sh
# Montage final : étalonnage de la vidéo source + habillage PNG + mix audio.
# usage : ./encode.sh <video_source.mp4>
set -e
cd "$(dirname "$0")"
SRC="$1"
GRADE="curves=master='0/0 0.12/0.07 0.45/0.43 0.8/0.84 1/0.98':r='0/0 0.5/0.51 1/0.98':b='0/0.03 0.5/0.48 1/0.93',eq=saturation=1.14:contrast=1.06,colorbalance=rs=-0.04:bs=0.05:rm=0.05:gm=-0.005:bm=-0.03"
ffmpeg -v error -stats -y -i "$SRC" -framerate 30 -i out/frames/f%05d.png -i out/mix.wav -filter_complex \
"[0:v]fps=30,$GRADE,scale=1080:-2:flags=lanczos,crop=1080:1920,unsharp=5:5:0.8:3:3:0.3,vignette=PI/4.6,noise=alls=5:allf=t,setsar=1,\
tpad=start_duration=5.2:start_mode=clone:stop_duration=12:stop_mode=clone[v];\
[v][1:v]overlay=0:0:shortest=1,scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p[o]" \
-map "[o]" -map 2:a -t 95.5 -c:v libx264 -preset slow -crf 16 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
-c:a aac -b:a 256k -movflags +faststart out/gethsemane_final.mp4
# version légère WhatsApp
ffmpeg -v error -y -i out/gethsemane_final.mp4 -vf scale=720:-2 -c:v libx264 -preset slow -crf 27 -c:a aac -b:a 128k -movflags +faststart out/gethsemane_whatsapp.mp4
