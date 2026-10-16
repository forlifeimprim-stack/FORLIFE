"""Rendu de l'habillage en PNG transparents (1080x1920, 30 i/s).

python3 render.py stills 2 4 9 30          -> out/stills/*.png (sur fond gris)
python3 render.py frames <i0> <i1>          -> out/frames/f%05d.png pour i0 <= i < i1
python3 render.py all                       -> 3 morceaux en parallèle
"""
import asyncio, functools, http.server, os, subprocess, sys, threading
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
FPS, END = 30, 95.5
N = int(END * FPS)
PORT = 8765
ARGS = ["--deterministic-mode", "--run-all-compositor-stages-before-draw", "--disable-threaded-animation",
        "--disable-checker-imaging", "--font-render-hinting=none", "--force-color-profile=srgb"]


def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=HERE)
    h.log_message = lambda *a: None
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]


async def page_for(pw, port, preview=False):
    b = await pw.chromium.launch(args=ARGS, executable_path=os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"))
    p = await b.new_page(viewport={"width": 1080, "height": 1920})
    await p.goto(f"http://127.0.0.1:{port}/gethsemane.html" + ("?preview" if preview else ""))
    await p.wait_for_function("window.ready === true")
    await p.evaluate("document.getAnimations().forEach(a => a.pause())")
    return b, p


async def seek(p, t):
    await p.evaluate("t => window.seek(t)", t)
    await p.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")


async def stills(times):
    port = serve()
    os.makedirs(f"{HERE}/out/stills", exist_ok=True)
    async with async_playwright() as pw:
        b, p = await page_for(pw, port, preview=True)
        await p.evaluate("document.getElementById('hud').style.display='none'")
        for t in times:
            await seek(p, t)
            await p.screenshot(path=f"{HERE}/out/stills/t{t:06.2f}.png")
        await b.close()


async def frames(i0, i1):
    port = serve()
    os.makedirs(f"{HERE}/out/frames", exist_ok=True)
    async with async_playwright() as pw:
        b, p = await page_for(pw, port)
        for i in range(i0, i1):
            await seek(p, i / FPS)
            await p.screenshot(path=f"{HERE}/out/frames/f{i:05d}.png", omit_background=True)
            if i % 300 == 0:
                print(f"[{i0}-{i1}] {i}", flush=True)
        await b.close()


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "stills":
        asyncio.run(stills([float(x) for x in sys.argv[2:]]))
    elif cmd == "frames":
        asyncio.run(frames(int(sys.argv[2]), int(sys.argv[3])))
    elif cmd == "all":
        k = 3
        cuts = [N * j // k for j in range(k + 1)]
        procs = [subprocess.Popen([sys.executable, __file__, "frames", str(cuts[j]), str(cuts[j + 1])]) for j in range(k)]
        for pr in procs:
            pr.wait()
