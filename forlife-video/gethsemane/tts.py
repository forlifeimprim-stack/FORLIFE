import sys, certifi
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import asyncio, edge_tts
async def main(voice, text, out, rate):
    c = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    subs=[]
    with open(out,"wb") as f:
        async for ch in c.stream():
            if ch["type"]=="audio": f.write(ch["data"])
            elif ch["type"]=="WordBoundary": subs.append((ch["offset"]/1e7, (ch["offset"]+ch["duration"])/1e7, ch["text"]))
    with open(out+".words","w") as f:
        for s in subs: f.write(f"{s[0]:.3f}\t{s[1]:.3f}\t{s[2]}\n")
asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv)>4 else "+0%"))
