# Voice-over: Kokoro (ff_siwis) at natural speed, with hand-corrected French phonemes
# where espeak gets it wrong (ose /oz/, chose /ʃoz/, moment /mɔmɑ̃/, Forlife /fɔʁlajf/).
# Each line starts on the beat grid of the music (BPM below) so voice and groove lock together.
import sys, json, math, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

M, OUT = sys.argv[1], sys.argv[2]
k = Kokoro(M + '/kokoro-v1.0.onnx', M + '/voices-v1.0.bin')
SR = 24000
BPM = 112; BEAT = 60 / BPM; BAR = 4 * BEAT
SPEED = 1.05

# (id, display text, phonemes or None, snap: 'beat' | 'bar', min gap after previous line in beats)
segs = [
 ("s1", "On attend souvent le bon moment.", "ty sˈɛ… ɔ̃n atˈɑ̃ suvˈɑ̃ lə bˈɔ̃ mɔmˈɑ̃.", 'bar', 0),
 ("s2", "Le bon plan. Les bonnes conditions.", None, 'beat', 1),
 ("s3", "Mais la vérité ?", None, 'beat', 1),
 ("q1", "N’attends pas que tout soit parfait pour commencer.", None, 'bar', 1),
 ("q2", "Chaque petit pas t’apprend quelque chose", "ʃak pətˈi pˈa tapʁˈɑ̃ kˌɛlkə ʃˈoz,", 'beat', 1),
 ("q3", "et te rapproche de ton objectif.", None, 'beat', 0),
 ("q4", "L’essentiel est d’oser avancer,", None, 'bar', 1),
 ("q5", "même lorsque tout n’est pas encore clair.", None, 'beat', 0),
 ("t1", "Ose commencer.", "ˈoz kɔmɑ̃sˈe !", 'bar', 2),
 ("o1", "Forlife Com", "fɔʁlˈajf kˈɔm. ɛ̃pʁimˈe lavəniʁ, valoʁizˈe le mˈaʁk.", 'bar', 1),
]
spoken = {"s2": "Le bon plan. Les bonnes conditions.", "s3": "Mais la vérité ?",
          "q1": "N'attends pas que tout soit parfait pour commencer.", "q3": "et te rapproche de ton objectif.",
          "q4": "L'essentiel est d'oser avancer,", "q5": "même lorsque tout n'est pas encore clair."}

LEAD = 2 * BAR   # two bars of groove before the first word
clips = []
for sid, disp, ph, snap, gap in segs:
    if ph: a, sr = k.create(ph, voice='ff_siwis', speed=SPEED, is_phonemes=True)
    else:  a, sr = k.create(spoken[sid], voice='ff_siwis', speed=SPEED, lang='fr-fr')
    a = a.astype(np.float32)
    thr = 0.01 * np.abs(a).max(); idx = np.where(np.abs(a) > thr)[0]
    clips.append((sid, disp, snap, gap, a[max(0, idx[0] - 240): idx[-1] + 1200]))

tim = []; t = LEAD; prev_end = LEAD
for sid, disp, snap, gap, a in clips:
    earliest = prev_end + gap * BEAT * 0.5
    grid = BAR if snap == 'bar' else BEAT
    # start a hair before the grid line so the stressed syllable lands on it
    start = math.ceil((earliest + 0.06) / grid) * grid - 0.06
    if sid == 's1': start = LEAD - 0.06
    d = len(a) / SR
    tim.append(dict(id=sid, text=disp, start=round(start, 3), end=round(start + d, 3)))
    prev_end = start + d

total = tim[-1]['end']
v = np.zeros(int((total + 0.5) * SR), np.float32)
for (sid, disp, snap, gap, a), s in zip(clips, tim):
    i = int(s['start'] * SR); v[i:i + len(a)] += a
sf.write(OUT + '/voice_raw.wav', v, SR)
json.dump(dict(total=total, bpm=BPM, segs=tim), open(OUT + '/timings.json', 'w'), indent=1, ensure_ascii=False)
for s in tim: print(s)
print('total', round(total, 2))
