"""Rendu du teaser (adapté de scripts/render_template.py du skill motion-design).
probe t1 t2 …     -> probe/sheet.png
draft             -> 30 i/s, 540x960 -> out/draft.mp4 (rythme)
full A B tag      -> morceau [A,B) à 60 i/s, SUB sous-images fusionnées (obturateur 180°) -> out/part_<tag>.mp4
pops              -> détection de sauts sur out/video.mp4"""
import asyncio, os, shutil, subprocess, sys
from pathlib import Path
import numpy as np
from playwright.async_api import async_playwright

HERE = Path(__file__).parent
FF = "ffmpeg"
PORT = int(os.environ.get("PORT", 8771))
URL = f"http://localhost:{PORT}/teaser.html"
FPS, SUB, SHUTTER = 60, int(os.environ.get("SUB", 4)), 0.5
T = 52.5
CUTS = [6.2, 37.5]   # pas de flou à travers ces instants
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
ARGS = ["--deterministic-mode", "--run-all-compositor-stages-before-draw", "--disable-threaded-animation",
        "--disable-checker-imaging", "--font-render-hinting=none", "--force-color-profile=srgb", "--disable-web-security"]


async def open_page(p, scale=1):
    b = await p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None, args=ARGS)
    pg = await b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=scale)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append("console: " + m.text) if m.type in ("error", "warning") else None)
    await pg.goto(URL)
    await pg.wait_for_function("window.ready === true", timeout=120000)
    await pg.evaluate("document.fonts.ready")
    await pg.add_style_tag(content="*,*::before,*::after{transition:none!important} #hud{display:none!important}")
    await pg.evaluate("document.getAnimations().forEach(a => a.pause())")
    return b, pg, errs


async def shot(pg, t, path, fmt="png", clip=None):
    await pg.evaluate(f"window.seek({t})")
    await pg.evaluate("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
    kw = {"quality": 92} if fmt == "jpeg" else {}
    await pg.screenshot(path=str(path), type=fmt, clip={"x": 0, "y": 0, "width": 1080, "height": 1920}, **kw)


async def probe(times):
    out = HERE / "probe"; shutil.rmtree(out, ignore_errors=True); out.mkdir()
    async with async_playwright() as p:
        b, pg, errs = await open_page(p)
        for i, t in enumerate(times):
            await shot(pg, t, out / f"p_{i:02d}.png")
        await b.close()
    if errs: print("PAGE ERRORS:", errs[:8])
    cols = min(6, len(times)); rows = -(-len(times) // cols)
    subprocess.run([FF, "-v", "error", "-y", "-i", str(out / "p_%02d.png"), "-vf",
                    f"scale=300:-1,tile={cols}x{rows}:padding=6:color=white", "-frames:v", "1", str(out / "sheet.png")], check=True)
    print("probe ->", out / "sheet.png")


async def draft(fps=30):
    sub = HERE / "sub_draft"; shutil.rmtree(sub, ignore_errors=True); sub.mkdir()
    n = int(round(T * fps))
    async with async_playwright() as p:
        b, pg, errs = await open_page(p)
        for i in range(n):
            await shot(pg, min(T - 1e-3, i / fps), sub / f"d_{i:05d}.jpg", "jpeg")
        await b.close()
    if errs: print("PAGE ERRORS:", errs[:8])
    (HERE / "out").mkdir(exist_ok=True)
    subprocess.run([FF, "-v", "error", "-y", "-framerate", str(fps), "-i", str(sub / "d_%05d.jpg"), "-i", str(HERE / "audio/mix.wav"),
                    "-vf", "scale=540:-2", "-c:v", "libx264", "-crf", "23", "-preset", "veryfast", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "128k", "-shortest", str(HERE / "out/draft.mp4")], check=True)
    print("draft ->", HERE / "out/draft.mp4")


async def full(a, b, tag):
    sub = HERE / f"sub_{tag}"; shutil.rmtree(sub, ignore_errors=True); sub.mkdir()
    i0, i1 = int(round(a * FPS)), int(round(b * FPS))
    offs = [(j - (SUB - 1) / 2) * SHUTTER / (FPS * SUB) for j in range(SUB)]
    k = 0
    async with async_playwright() as p:
        br, pg, errs = await open_page(p)
        for i in range(i0, i1):
            tc = i / FPS
            for o in offs:
                t = min(T - 1e-3, max(0.0, tc + o))
                for c in CUTS:
                    if (t < c) != (tc < c): t = c if tc >= c else c - 1e-4
                await shot(pg, t, sub / f"s_{k:06d}.jpg", "jpeg"); k += 1
            if (i - i0) % 120 == 0: print(tag, f"{i - i0}/{i1 - i0}", flush=True)
        await br.close()
    if errs: print("PAGE ERRORS:", errs[:8])
    (HERE / "out").mkdir(exist_ok=True)
    subprocess.run([FF, "-v", "error", "-y", "-framerate", str(FPS * SUB), "-i", str(sub / "s_%06d.jpg"),
                    "-vf", f"tmix=frames={SUB},select='eq(mod(n\\,{SUB})\\,{SUB - 1})',setpts=N/{FPS}/TB", "-r", str(FPS),
                    "-c:v", "libx264", "-crf", "12", "-preset", "medium", "-pix_fmt", "yuv420p", str(HERE / f"out/part_{tag}.mp4")], check=True)
    shutil.rmtree(sub, ignore_errors=True)
    print("part ->", HERE / f"out/part_{tag}.mp4")


def pops(path=None):
    path = path or HERE / "out/video.mp4"
    raw = subprocess.run([FF, "-v", "quiet", "-i", str(path), "-vf", "scale=180:180,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 180, 180).astype(np.float32)
    d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
    for i in range(1, len(d) - 1):
        nb = max(d[i - 1], d[i + 1], 0.3)
        if d[i] > 3 * nb and d[i] > 2.0: print("pop frame", i + 1, "t", round((i + 1) / FPS, 3), "diff", round(float(d[i]), 2))


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "probe": asyncio.run(probe([float(x) for x in sys.argv[2:]]))
    elif cmd == "draft": asyncio.run(draft())
    elif cmd == "full": asyncio.run(full(float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]))
    elif cmd == "pops": pops(sys.argv[2] if len(sys.argv) > 2 else None)
