# Generates the voice-over segment by segment, with natural pauses, then writes timings.json
import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
M, OUT = sys.argv[1], sys.argv[2]
k = Kokoro(M+'/kokoro-v1.0.onnx', M+'/voices-v1.0.bin')
SR = 24000
# (id, spoken text, display text, speed, pause_after_s)
segs = [
 ("s1", "Tu sais… on attend souvent le bon moment.", "On attend souvent le bon moment.", 0.86, 0.55),
 ("s2", "Le bon plan. Les bonnes conditions.", "Le bon plan. Les bonnes conditions.", 0.88, 0.45),
 ("s3", "Mais la vérité ?", "Mais la vérité ?", 0.82, 0.85),
 ("q1", "N'attends pas que tout soit parfait pour commencer.", "N’attends pas que tout soit parfait pour commencer.", 0.86, 0.75),
 ("q2", "Chaque petit pas t'apprend quelque chose,", "Chaque petit pas t’apprend quelque chose", 0.88, 0.25),
 ("q3", "et te rapproche de ton objectif.", "et te rapproche de ton objectif.", 0.88, 0.8),
 ("q4", "L'essentiel est d'oser avancer,", "L’essentiel est d’oser avancer,", 0.86, 0.3),
 ("q5", "même lorsque tout n'est pas encore clair.", "même lorsque tout n’est pas encore clair.", 0.86, 1.1),
 ("t1", "Alors… ose commencer.", "Ose commencer.", 0.80, 1.2),
 ("o1", "Forlaïf Com. Imprimer l'avenir, valoriser les marques.", "Forlife Com", 0.9, 0.0),
]
LEAD = 1.6  # music intro before first word
audio = [np.zeros(int(LEAD*SR), np.float32)]
t = LEAD; tim = []
for sid, spoken, disp, sp, pause in segs:
    a, sr = k.create(spoken, voice='ff_siwis', speed=sp, lang='fr-fr')
    assert sr == SR
    a = a.astype(np.float32)
    # trim silence
    thr = 0.01*np.abs(a).max(); idx = np.where(np.abs(a) > thr)[0]
    a = a[max(0, idx[0]-240): idx[-1]+1200]
    d = len(a)/SR
    tim.append(dict(id=sid, text=disp, start=round(t,3), end=round(t+d,3)))
    audio += [a, np.zeros(int(pause*SR), np.float32)]
    t += d + pause
v = np.concatenate(audio)
sf.write(OUT+'/voice_raw.wav', v, SR)
json.dump(dict(total=t, segs=tim), open(OUT+'/timings.json','w'), indent=1, ensure_ascii=False)
print(json.dumps(tim, indent=0, ensure_ascii=False)); print('total', t)
