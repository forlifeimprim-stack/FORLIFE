#!/bin/sh
# Assemble les 3 morceaux + audio, affiche en image 0, version légère WhatsApp.
set -e
cd "$(dirname "$0")/out"
printf "file 'part_a.mp4'\nfile 'part_b.mp4'\nfile 'part_c.mp4'\n" > parts.txt
ffmpeg -v error -y -f concat -safe 0 -i parts.txt -c copy video.mp4
ffmpeg -v error -y -ss 41.2 -i video.mp4 -frames:v 1 poster.png
ffmpeg -v error -y -i video.mp4 -i poster.png -i ../audio/mix.wav -filter_complex \
  "[0:v][1:v]overlay=0:0:enable='eq(n,0)',scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p[v]" \
  -map "[v]" -map 2:a -c:v libx264 -crf 16 -preset slow -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -shortest -movflags +faststart teaser_livre_disciples_1080x1920.mp4
ffmpeg -v error -y -i teaser_livre_disciples_1080x1920.mp4 -vf "scale=720:-2,fps=30" -c:v libx264 -crf 27 -preset slow \
  -c:a aac -b:a 128k -movflags +faststart teaser_livre_disciples_whatsapp_720.mp4
ls -la teaser_livre_disciples_*.mp4
