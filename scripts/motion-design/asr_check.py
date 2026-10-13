import sys, json, numpy as np, soundfile as sf, sherpa_onnx
from scipy import signal
M, B = sys.argv[1], sys.argv[2]
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{M}/sherpa-onnx-whisper-medium/medium-encoder.int8.onnx',
        decoder=f'{M}/sherpa-onnx-whisper-medium/medium-decoder.int8.onnx', tokens=f'{M}/sherpa-onnx-whisper-medium/medium-tokens.txt', language='fr', task='transcribe', num_threads=4)
v, sr = sf.read(B + '/voice_raw.wav'); T = json.load(open(B + '/timings.json'))
for s in T['segs']:
    a = v[int(s['start']*sr):int(s['end']*sr)]
    st = rec.create_stream(); st.accept_waveform(16000, np.concatenate([np.zeros(8000), signal.resample_poly(a, 16000, sr), np.zeros(16000)]).astype(np.float32)); rec.decode_stream(st)
    print(f"{s['id']}: {st.result.text.strip()}")
