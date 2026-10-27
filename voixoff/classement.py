import sys, numpy as np, librosa, sherpa_onnx
exs = {m: sherpa_onnx.SpeakerEmbeddingExtractor(sherpa_onnx.SpeakerEmbeddingExtractorConfig(model=f"sherpa/{m}", num_threads=4))
       for m in ["3dspeaker_speech_eres2net_large_sv_zh-cn_3dspeaker_16k.onnx", "wespeaker_en_voxceleb_resnet34.onnx"]}
def emb(ex, y):
    es = []
    for i in range(0, max(1, len(y)-48000), 160000):
        s = ex.create_stream(); s.accept_waveform(16000, y[i:i+160000]); s.input_finished()
        e = np.array(ex.compute(s)); es.append(e/np.linalg.norm(e))
    e = np.mean(es, 0); return e/np.linalg.norm(e)
ref, _ = librosa.load("work/ref_brut16k.wav", sr=16000)
R = {m: emb(ex, ref) for m, ex in exs.items()}
rows = []
for f in sys.argv[1:]:
    y, _ = librosa.load(f, sr=16000, duration=120)
    sc = [float(emb(ex, y) @ R[m]) for m, ex in exs.items()]
    f0, v, _ = librosa.pyin(y[:16000*20], fmin=50, fmax=400, sr=16000)
    rows.append((sc[0], sc[1], np.nanmedian(f0[v]), f.split("/")[-1]))
for r in sorted(rows, reverse=True): print(f"eres2net={r[0]:.3f}  wespeaker={r[1]:.3f}  F0={r[2]:.0f}Hz  {r[3]}")
