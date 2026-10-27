import sys, numpy as np, librosa, sherpa_onnx
d = sys.argv[1]; f = sys.argv[2]; seg = float(sys.argv[3]) if len(sys.argv) > 3 else 25
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.int8.onnx", decoder=f"{d}/small-decoder.int8.onnx", tokens=f"{d}/small-tokens.txt", language="fr", task="transcribe", num_threads=4)
y, _ = librosa.load(f, sr=16000)
for i in range(0, len(y), int(16000*seg)):
    s = rec.create_stream(); s.accept_waveform(16000, y[i:i+int(16000*seg)]); rec.decode_stream(s)
    print(f"[{i/16000:5.0f}s] {s.result.text.strip()}", flush=True)
