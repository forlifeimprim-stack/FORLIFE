"""Voix off via edge-tts (voix neuronales Microsoft), avec le CA du proxy.
Usage : python tts.py lines.txt outdir voice rate pitch
Chaque ligne « id|texte » -> id.mp3 + id.json (horodatage des mots)."""
import asyncio, json, ssl, sys, os
import edge_tts, edge_tts.communicate as C
CA = os.environ.get("CCR_CA", "/root/.ccr/ca-bundle.crt")
if os.path.exists(CA):
    C._SSL_CTX = ssl.create_default_context(cafile=CA)

async def one(i, txt, out, voice, rate, pitch):
    com = edge_tts.Communicate(txt, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(f"{out}/{i}.mp3", "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"w": ch["text"], "t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7})
    json.dump(words, open(f"{out}/{i}.json", "w"), ensure_ascii=False)

async def main():
    src, out, voice, rate, pitch = sys.argv[1:6]
    for line in open(src, encoding="utf-8"):
        if "|" in line:
            i, txt = line.rstrip("\n").split("|", 1)
            await one(i, txt, out, voice, rate, pitch)
asyncio.run(main())
