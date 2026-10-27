"""Voix off v2 : texte -> Supertonic 3 (FR, voix masculine proche) -> paragraphes avec pauses naturelles -> wav 16 kHz.
Enchaîner ensuite convertir.py (timbre) puis ressemblance.py (empreinte spectrale)."""
import argparse, re, numpy as np, soundfile as sf, librosa, sherpa_onnx
p = argparse.ArgumentParser(); p.add_argument("texte"); p.add_argument("sortie")
p.add_argument("--modele", default="sherpa/sherpa-onnx-supertonic-3-tts-int8-2026-05-11")
p.add_argument("--voix", type=int, default=9); p.add_argument("--vitesse", type=float, default=0.95); p.add_argument("--etapes", type=int, default=16)
a = p.parse_args(); D = a.modele
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    supertonic=sherpa_onnx.OfflineTtsSupertonicModelConfig(duration_predictor=f"{D}/duration_predictor.int8.onnx",
    text_encoder=f"{D}/text_encoder.int8.onnx", vector_estimator=f"{D}/vector_estimator.int8.onnx", vocoder=f"{D}/vocoder.int8.onnx",
    tts_json=f"{D}/tts.json", unicode_indexer=f"{D}/unicode_indexer.bin", voice_style=f"{D}/voice.bin"), num_threads=4)))
g = sherpa_onnx.GenerationConfig(); g.sid = a.voix; g.num_steps = a.etapes; g.speed = a.vitesse; g.extra["lang"] = "fr"
sr = tts.sample_rate
paras = [x.strip().replace("\n", " ") for x in re.split(r"\n\s*\n", open(a.texte, encoding="utf-8").read()) if x.strip()]
out = [np.zeros(int(sr*0.5), dtype=np.float32)]
for i, para in enumerate(paras):
    # phrases regroupées par ~250 caractères pour garder une intonation continue
    phr = re.split(r"(?<=[.!?…])\s+", para.replace("«", "").replace("»", "")); chunks = [""]
    for ph in phr:
        if len(chunks[-1]) + len(ph) > 250 and chunks[-1]: chunks.append("")
        chunks[-1] = (chunks[-1] + " " + ph).strip()
    for c in chunks:
        if not re.search(r"\w", c): continue
        w = np.array(tts.generate(c, g).samples, dtype=np.float32)
        w, _ = librosa.effects.trim(w, top_db=45)
        out += [w, np.zeros(int(sr*0.45), dtype=np.float32)]
    titre = len(para) < 60
    out.append(np.zeros(int(sr*(1.1 if titre else 0.7)), dtype=np.float32))
    print(f"paragraphe {i+1}/{len(paras)}", flush=True)
y = librosa.resample(np.concatenate(out), orig_sr=sr, target_sr=16000)
sf.write(a.sortie, y, 16000); print("ok", a.sortie, round(len(y)/16000, 1), "s")
