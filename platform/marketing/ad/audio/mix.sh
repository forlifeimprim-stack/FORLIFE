set -e
declare -A T=([hook]=0.15 [pain]=3.30 [reveal]=6.55 [create]=9.70 [publish]=12.90 [sell]=14.55 [copilot]=17.75 [cta]=22.05)
inputs=""; filt=""; i=0; labels=""
for k in hook pain reveal create publish sell copilot cta; do
  inputs="$inputs -i vo/$k.wav"
  ms=$(python3 -c "print(int(${T[$k]}*1000))")
  filt="$filt[$i:a]aresample=48000,adelay=${ms}|${ms}[v$i];"
  labels="$labels[v$i]"; i=$((i+1))
done
ffmpeg -y -v error $inputs -filter_complex "${filt}${labels}amix=inputs=8:normalize=0,highpass=f=90,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=4,equalizer=f=9000:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=4:attack=5:release=80:makeup=6dB,aformat=channel_layouts=stereo,apad=whole_dur=28.7" voice.wav
ffmpeg -y -v error -i music.wav -i voice.wav -filter_complex "[1:a]asplit[vk][vm];[0:a][vk]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=250:makeup=1[duck];[duck]volume=0.62[m];[m][vm]amix=inputs=2:normalize=0:weights=1 1.15,atrim=0:27.6,afade=t=out:st=27.0:d=0.6,loudnorm=I=-14:TP=-1.0:LRA=9" -ar 48000 final.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 final.wav
