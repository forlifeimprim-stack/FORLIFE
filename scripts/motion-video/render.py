import sys, os, math, subprocess, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import timeline as T

S = T.S
W, H, FPS = T.W, T.H, T.FPS
FONTS = os.path.join(S, "fonts", "ttf")
GOLD = (255, 200, 69)
GOLD_D = (232, 150, 30)
INK = (11, 11, 16)

_fc = {}
def font(name, size):
    k = (name, int(size))
    if k not in _fc:
        _fc[k] = ImageFont.truetype(os.path.join(FONTS, name), int(size))
    return _fc[k]

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out_cubic(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_in_out(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out_back(x, s=1.9):
    x = clamp(x); x -= 1
    return x * x * ((s + 1) * x + s) + 1

# ---------------------------------------------------------------- camera
def cam_z(t):
    segs = T.CAM
    idx = 0
    for i, sg in enumerate(segs):
        if t >= sg[0]: idx = i
    t0, t1, z0, z1 = segs[idx]
    val = lambda sg, tt: sg[2] + (sg[3] - sg[2]) * clamp((tt - sg[0]) / max(1e-6, sg[1] - sg[0]))
    z = val(segs[idx], t)
    is_cut = any(abs(t0 - c) < 0.01 for c in T.CUTS) or t0 == 0.0
    if idx > 0 and not is_cut and t - t0 < 0.22:
        prev = val(segs[idx - 1], t0)
        z = prev + (z - prev) * ease_out_cubic((t - t0) / 0.22)
    # impact punch at cuts and at the very start
    for c in [0.0] + T.CUTS:
        if 0 <= t - c < 0.4:
            z += 0.13 * (1 - ease_out_cubic((t - c) / 0.4))
    for ht, _, _ in T.HEROES:
        if 0 <= t - ht < 0.35:
            z += 0.045 * math.sin(math.pi * (t - ht) / 0.35)
    return z

def cam_cy(t):
    cy = T.SHOT_CY[0][1]
    for ts, v in T.SHOT_CY:
        if t >= ts: cy = v
    return cy

def shake(t):
    dx = dy = 0.0
    for ht, _, _ in T.HEROES:
        d = t - ht
        if 0 <= d < 0.4:
            a = 9 * (1 - d / 0.4) ** 2
            dx += a * math.sin(d * 97); dy += a * math.cos(d * 83)
    for c in T.CUTS:
        d = t - c
        if 0 <= d < 0.25:
            a = 7 * (1 - d / 0.25) ** 2
            dx += a * math.sin(d * 120); dy += a * math.cos(d * 101)
    return dx, dy

def camera(img, t):
    z = cam_z(t); cy = cam_cy(t)
    dx, dy = shake(t)
    w, h = W / z, H / z
    l = clamp(0.5 * W - w / 2 + dx, 0, W - w)
    tp = clamp(cy * H - h / 2 + dy, 0, H - h)
    out = img.resize((W, H), Image.BICUBIC, box=(l, tp, l + w, tp + h))
    return out, (l, tp, z)

# ---------------------------------------------------------------- static layers
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H * 0.45) / (H * 0.62)) ** 2)
VIG = np.clip(1.0 - 0.55 * np.clip(r - 0.35, 0, 1) ** 1.6, 0.35, 1.0)[..., None].astype(np.float32)
del yy, xx, r
rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 5.0, (H // 2, W // 2, 1)).astype(np.float32).repeat(2, 0).repeat(2, 1) for _ in range(6)]

def finish(arr, fi):
    a = arr.astype(np.float32) * VIG + GRAIN[fi % len(GRAIN)]
    return np.clip(a, 0, 255).astype(np.uint8)

def chroma(arr, amt):
    if amt < 1: return arr
    o = arr.copy()
    o[..., 0] = np.roll(arr[..., 0], amt, axis=1)
    o[..., 2] = np.roll(arr[..., 2], -amt, axis=1)
    return o

def soft_dot(size, color):
    s = size * 6
    im = Image.new("L", (s, s), 0)
    ImageDraw.Draw(im).ellipse((s / 2 - size, s / 2 - size, s / 2 + size, s / 2 + size), fill=255)
    im = im.filter(ImageFilter.GaussianBlur(size * 0.9))
    rgba = Image.new("RGBA", (s, s), color + (0,)); rgba.putalpha(im)
    return rgba
DOTS = {s: soft_dot(s, (255, 214, 130)) for s in (2, 3, 4, 6)}
random.seed(3)
PARTS = [dict(x=random.uniform(0, W), y=random.uniform(0, H), vy=random.uniform(18, 55),
              amp=random.uniform(8, 40), f=random.uniform(0.1, 0.5), ph=random.uniform(0, 6.3),
              s=random.choice((2, 2, 3, 3, 4, 6)), a=random.uniform(0.25, 0.75), tw=random.uniform(0.6, 2.2))
         for _ in range(55)]

def particles(ov, tg, dens=1.0):
    for i, p in enumerate(PARTS):
        if i > len(PARTS) * dens: break
        y = (p["y"] - p["vy"] * tg) % (H + 100) - 50
        x = p["x"] + p["amp"] * math.sin(p["f"] * tg * 6.28 + p["ph"])
        a = p["a"] * (0.55 + 0.45 * math.sin(tg * p["tw"] * 6.28 + p["ph"]))
        d = DOTS[p["s"]]
        if a <= 0.03: continue
        sp = d.copy(); sp.putalpha(d.getchannel("A").point(lambda v, a=a: int(v * a)))
        ov.alpha_composite(sp, dest=(int(x - d.width / 2), int(y - d.height / 2)))

def radial(size, color, alpha):
    im = Image.new("L", (size, size), 0)
    ImageDraw.Draw(im).ellipse((size * 0.2, size * 0.2, size * 0.8, size * 0.8), fill=int(255 * alpha))
    im = im.filter(ImageFilter.GaussianBlur(size * 0.12))
    rgba = Image.new("RGBA", (size, size), color + (0,)); rgba.putalpha(im)
    return rgba
LEAK = radial(1500, (255, 150, 50), 0.85)
LEAK2 = radial(1100, (255, 225, 160), 0.7)

def light_leak(ov, d):
    """sweep at a transition, d = seconds since cut (-0.15 .. 0.6)"""
    if not (-0.15 <= d < 0.65): return
    k = (d + 0.15) / 0.8
    a = math.sin(math.pi * k) ** 1.5
    x = int(-900 + k * (W + 900)); y = int(H * 0.25 - 400 + k * 500)
    for img, ox, oy in ((LEAK, x - 300, y), (LEAK2, x + 200, y + 400)):
        sp = img.copy(); sp.putalpha(img.getchannel("A").point(lambda v: int(v * a * 0.75)))
        ov.alpha_composite(sp, dest=(ox, oy)) if -img.width < ox < W and -img.height < oy < H else None

def flash(ov, a, color=(255, 255, 255)):
    if a <= 0.01: return
    ov.alpha_composite(Image.new("RGBA", (W, H), color + (int(255 * clamp(a)),)))

# ---------------------------------------------------------------- hero typography
def gradient_text(text, fname, size, top=(255, 236, 170), bot=GOLD_D, stroke=0):
    f = font(fname, size)
    bb = f.getbbox(text, stroke_width=stroke)
    pad = int(size * 0.5)
    w, h = bb[2] - bb[0] + 2 * pad, bb[3] - bb[1] + 2 * pad
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).text((pad - bb[0], pad - bb[1]), text, font=f, fill=255, stroke_width=stroke, stroke_fill=255)
    g = np.linspace(0, 1, h)[:, None]
    col = (np.array(top)[None, None] * (1 - g[..., None]) + np.array(bot)[None, None] * g[..., None])
    col = np.repeat(col, w, axis=1).astype(np.uint8)
    fill = Image.fromarray(col, "RGB").convert("RGBA"); fill.putalpha(mask)
    glow = Image.new("RGBA", (w, h), (255, 170, 40, 0)); glow.putalpha(mask.filter(ImageFilter.GaussianBlur(size * 0.16)).point(lambda v: int(v * 0.85)))
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0)); shadow.putalpha(mask.filter(ImageFilter.GaussianBlur(size * 0.06)).point(lambda v: int(v * 0.7)))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.alpha_composite(glow); out.alpha_composite(shadow, dest=(0, int(size * 0.04))); out.alpha_composite(fill)
    return out

def fit_size(text, fname, maxw, maxs):
    s = maxs
    while s > 40 and font(fname, s).getlength(text) > maxw: s -= 4
    return s

HERO_IMG = {}
for ht, txt, lay in T.HEROES:
    HERO_IMG[txt] = gradient_text(txt, "Anton-Regular.ttf", fit_size(txt, "Anton-Regular.ttf", 840, 185))

def paste_scaled(ov, img, cx, cy, sc, alpha):
    if alpha <= 0.01 or sc <= 0.01: return
    w, h = max(1, int(img.width * sc)), max(1, int(img.height * sc))
    im = img.resize((w, h), Image.BICUBIC)
    if alpha < 0.999:
        im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    ov.alpha_composite(im, dest=(int(cx - w / 2), int(cy - h / 2)))

def heroes(ov, t):
    fl = 0.0
    for ht, txt, lay in T.HEROES:
        d = t - ht
        if not (0 <= d < T.HERO_DUR): continue
        img = HERO_IMG[txt]
        cy = H * (0.17 if lay == "wide" else 0.115)
        if d < 0.28:
            k = d / 0.28; sc = 1.6 - 0.6 * ease_out_back(k, 1.4); al = ease_out_cubic(k * 1.6)
        elif d > T.HERO_DUR - 0.3:
            k = (d - (T.HERO_DUR - 0.3)) / 0.3; sc = 1.0 + 0.08 * k; al = 1 - ease_in_out(k); cy -= 40 * k
        else:
            sc = 1.0 + 0.03 * (d - 0.28); al = 1.0
        paste_scaled(ov, img, W / 2, cy, sc, al)
        if d < 0.16: fl = max(fl, 0.22 * (1 - d / 0.16))
    return fl

# ---------------------------------------------------------------- captions
CAP_FONT = "Montserrat-Black.ttf"
CAP_SIZE = 60
KEYW = {"DIEU", "ADORATION", "CIEL", "PRIVÉ", "CHOISIS", "AIMER", "MIRACLES", "IMPOSSIBLE", "ÉTERNITÉ",
        "DERNIER", "MOT", "VIVANTS", "SERA", "TERRE", "LÈVERAS", "LÀ"}

def norm(w): return w.upper().strip(".,:;!?")
def is_key(w):
    n = norm(w)
    return n in KEYW or n.split("'")[-1] in KEYW

def build_chunks(c):
    f = font(CAP_FONT, CAP_SIZE); sp = f.getlength(" ") * 1.9
    words = [w for w in c["words"] if w["w"] != ":"]
    chunks, cur = [], []
    for w in words:
        test = cur + [w]
        width = sum(f.getlength(x["w"].upper()) for x in test) + sp * (len(test) - 1)
        if cur and (width > 760 or len(cur) >= 4):
            chunks.append(cur); cur = [w]
        else:
            cur = test
    if cur: chunks.append(cur)
    out = []
    for ch in chunks:
        ws = [f.getlength(x["w"].upper()) for x in ch]
        total = sum(ws) + sp * (len(ch) - 1)
        xs, x = [], -total / 2
        for wi in ws: xs.append(x + wi / 2); x += wi + sp
        out.append(dict(words=ch, xs=xs, width=total))
    for k, ch in enumerate(out):
        ch["t0"] = c["s"] if k == 0 else ch["words"][0]["t0"]
        ch["t1"] = out[k + 1]["words"][0]["t0"] if k + 1 < len(out) else c["e"]
    return out

for c in T.CAPS:
    c["chunks"] = build_chunks(c)
    if c["box"]:
        x0, y0, x1, y1 = c["box"]
    else:
        n = len(c["text"]); hw = 3.9 * n + 12
        x0, y0, x1, y1 = 239 - hw, 571, 239 + hw, 616
    cx = (x0 + x1) / 2 * T.KX; cy = (y0 + y1) / 2 * T.KY
    pw = max((x1 - x0) * T.KX + 60, max(ch["width"] for ch in c["chunks"]) + 100)
    ph = max((y1 - y0) * T.KY + 50, 130)
    c["rect"] = (cx, cy, pw, ph)

def active_caption(t):
    best = None
    for i, c in enumerate(T.CAPS):
        if c["s"] - 0.14 <= t < c["e"] + 0.12: best = i
    return best

def panel_geom(t, i):
    c = T.CAPS[i]
    cx, cy, pw, ph = c["rect"]
    prev_gap = c["s"] - T.CAPS[i - 1]["e"] if i > 0 else 9
    next_gap = T.CAPS[i + 1]["s"] - c["e"] if i + 1 < len(T.CAPS) else 9
    sy = sx = 1.0
    if t < c["s"]:
        if prev_gap < 0.4:
            # morph from previous panel instead of popping
            pcx, pcy, ppw, pph = T.CAPS[i - 1]["rect"]
            return pcx, pcy, ppw, pph, 1.0
        k = (t - (c["s"] - 0.14)) / 0.14
        sx = 0.6 + 0.4 * ease_out_back(k, 2.2); sy = ease_out_back(k, 2.2)
    elif t - c["s"] < 0.14 and prev_gap < 0.4:
        pcx, pcy, ppw, pph = T.CAPS[i - 1]["rect"]
        k = ease_out_cubic((t - c["s"]) / 0.14)
        cx = pcx + (cx - pcx) * k; pw = ppw + (pw - ppw) * k
    if t >= c["e"]:
        if next_gap < 0.4: return cx, cy, pw, ph, 1.0
        k = (t - c["e"]) / 0.12
        sy = 1 - ease_in_out(k); sx = 1 - 0.3 * k
    return cx, cy, pw * sx, ph * sy, sy

def draw_caption(ov, t, xf):
    i = active_caption(t)
    if i is None: return
    l, tp, z = xf
    cx, cy, pw, ph, vis = panel_geom(t, i)
    if pw < 2 or ph < 2: return
    # pre-zoom -> screen
    scx, scy = (cx - l) * z, (cy - tp) * z
    spw, sph = pw * z, ph * z
    d = ImageDraw.Draw(ov)
    # shadow + panel
    rad = min(34, sph / 2)
    box = (scx - spw / 2, scy - sph / 2, scx + spw / 2, scy + sph / 2)
    d.rounded_rectangle((box[0] - 6, box[1] + 10, box[2] + 6, box[3] + 18), radius=rad, fill=(0, 0, 0, 90))
    d.rounded_rectangle(box, radius=rad, fill=INK + (255,))
    d.rounded_rectangle(box, radius=rad, outline=GOLD + (200,), width=3)
    # gold accent bar
    d.rounded_rectangle((scx - 46, box[1] - 4, scx + 46, box[1] + 4), radius=4, fill=GOLD + (255,))
    if vis < 0.7: return
    c = T.CAPS[i]
    ch = None
    for cc in c["chunks"]:
        if cc["t0"] - 0.14 <= t < cc["t1"]: ch = cc
    if ch is None: ch = c["chunks"][0] if t < c["s"] + 0.1 else c["chunks"][-1]
    for w, x in zip(ch["words"], ch["xs"]):
        dt = t - w["t0"]
        txt = w["w"].upper()
        if dt < -0.02:
            f = font(CAP_FONT, CAP_SIZE)
            d.text((scx + x, scy + CAP_SIZE * 0.04), txt, font=f, fill=(255, 255, 255, 80), anchor="mm")
            continue
        k = ease_out_back(clamp((dt + 0.02) / 0.13), 2.0)
        active = w["t0"] <= t < w["t1"]
        size = CAP_SIZE * (0.55 + 0.45 * k) 
        f = font(CAP_FONT, size)
        tw = f.getlength(txt)
        px, py = scx + x, scy
        if active:
            hb = (px - tw / 2 - 8, py - size * 0.6, px + tw / 2 + 8, py + size * 0.6)
            d.rounded_rectangle(hb, radius=12, fill=GOLD + (255,))
            col = INK + (255,)
        else:
            col = (GOLD if is_key(w["w"]) else (255, 255, 255)) + (int(255 * clamp(k)),)
        d.text((px, py + size * 0.04), txt, font=f, fill=col, anchor="mm")

# ---------------------------------------------------------------- chrome
CREDIT = None
def credit_tag(ov, tg, alpha=1.0):
    global CREDIT
    if CREDIT is None:
        f = font("Montserrat-ExtraBold.ttf", 28); txt = "PASTEUR IVAN CARLUER"
        tw = f.getlength(txt) + 6 * len(txt)
        im = Image.new("RGBA", (int(tw + 90), 60), (0, 0, 0, 0)); dd = ImageDraw.Draw(im)
        dd.rounded_rectangle((0, 0, im.width - 1, 59), radius=30, fill=(0, 0, 0, 120), outline=(255, 255, 255, 60), width=2)
        dd.ellipse((24, 22, 40, 38), fill=GOLD + (255,))
        x = 56
        for ch_ in txt:
            dd.text((x, 31), ch_, font=f, fill=(255, 255, 255, 235), anchor="lm"); x += f.getlength(ch_) + 6
        CREDIT = im
    im = CREDIT
    if alpha < 1: im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    ov.alpha_composite(im, dest=(48, 70))
    # pulsing live dot
    a = 0.5 + 0.5 * math.sin(tg * 5)
    ImageDraw.Draw(ov).ellipse((48 + 20, 70 + 18, 48 + 44, 70 + 42), outline=GOLD + (int(120 * a * alpha),), width=2)

def progress(ov, tg):
    d = ImageDraw.Draw(ov)
    d.rectangle((0, 0, W, 8), fill=(255, 255, 255, 40))
    p = clamp(tg / T.TOTAL)
    d.rectangle((0, 0, int(W * p), 8), fill=GOLD + (255,))
    d.ellipse((int(W * p) - 9, -5, int(W * p) + 9, 13), fill=(255, 240, 200, 255))

# ---------------------------------------------------------------- intro / outro
def grab(src_t):
    p = os.path.join(S, "build", f"still_{src_t:.2f}.png")
    if not os.path.exists(p):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(src_t), "-i", os.path.join(S, "graded.mp4"), "-frames:v", "1", p], check=True)
    return Image.open(p).convert("RGB")

INTRO_BG = grab(8.9).filter(ImageFilter.GaussianBlur(10))
OUTRO_SRC = grab(61.9)
OUTRO_BLUR = OUTRO_SRC.filter(ImageFilter.GaussianBlur(16))

def spaced(text, fname, size, spacing, color=(255, 255, 255)):
    f = font(fname, size)
    tw = sum(f.getlength(ch) for ch in text) + spacing * (len(text) - 1)
    im = Image.new("RGBA", (int(tw + 20), int(size * 1.6)), (0, 0, 0, 0)); dd = ImageDraw.Draw(im)
    x = 10
    for ch in text:
        dd.text((x, size * 0.8), ch, font=f, fill=color + (255,), anchor="lm"); x += f.getlength(ch) + spacing
    return im

I_Q = spaced("C'EST QUOI", "Montserrat-ExtraBold.ttf", 64, 14)
I_T = gradient_text("L'ADORATION", "Anton-Regular.ttf", fit_size("L'ADORATION", "Anton-Regular.ttf", 960, 230))
I_V = spaced("VRAIMENT ?", "Montserrat-ExtraBold.ttf", 64, 14)
I_C = spaced("PASTEUR IVAN CARLUER", "Montserrat-Medium.ttf", 34, 10, (230, 230, 230))
O_T1 = gradient_text("QUI EST", "Anton-Regular.ttf", 200)
O_T2 = gradient_text("ET QUI SERA.", "Anton-Regular.ttf", fit_size("ET QUI SERA.", "Anton-Regular.ttf", 960, 200))
O_SH = spaced("PARTAGE CE MESSAGE", "Montserrat-Black.ttf", 50, 6, INK)
O_H = spaced("@past_ivan_carluer", "Montserrat-ExtraBold.ttf", 40, 2)
O_M = spaced("MONTAGE  ·  FORLIFE COM'", "Montserrat-Medium.ttf", 28, 8, (200, 200, 200))

def intro_frame(tg, fi):
    z = 1.12 - 0.08 * ease_out_cubic(tg / T.INTRO)
    if tg > T.INTRO - 0.22: z += 0.5 * ease_in_out((tg - (T.INTRO - 0.22)) / 0.22)
    w, h = W / z, H / z
    bg = INTRO_BG.resize((W, H), Image.BICUBIC, box=((W - w) / 2, (H - h) * 0.4, (W - w) / 2 + w, (H - h) * 0.4 + h))
    arr = finish((np.asarray(bg).astype(np.float32) * 0.55), fi)
    ov = Image.fromarray(arr).convert("RGBA")
    particles(ov, tg, 1.0)
    fl = 0.0
    k1 = (tg - 0.05) / 0.3
    if k1 > 0:
        paste_scaled(ov, I_Q, W / 2, H * 0.39 + 40 * (1 - ease_out_cubic(k1)), 1.0, ease_out_cubic(k1))
    k2 = (tg - 0.3) / 0.28
    if k2 > 0:
        paste_scaled(ov, I_T, W / 2, H * 0.47, 1.9 - 0.9 * ease_out_back(k2, 1.3), ease_out_cubic(k2 * 1.8))
        if tg - 0.3 < 0.18: fl = 0.6 * (1 - (tg - 0.3) / 0.18)
    k3 = (tg - 0.62) / 0.3
    if k3 > 0:
        paste_scaled(ov, I_V, W / 2, H * 0.555 - 40 * (1 - ease_out_cubic(k3)), 1.0, ease_out_cubic(k3))
    k4 = (tg - 0.75) / 0.4
    if k4 > 0:
        paste_scaled(ov, I_C, W / 2, H * 0.83, 1.0, 0.85 * ease_out_cubic(k4))
    if tg > T.INTRO - 0.12: fl = max(fl, (tg - (T.INTRO - 0.12)) / 0.12)
    flash(ov, fl)
    progress(ov, tg)
    return ov.convert("RGB")

def outro_frame(tg, fi):
    d = tg - (T.INTRO + T.MAIN_END)
    z = 1.0 + 0.06 * d / T.OUTRO
    kb = ease_in_out(d / 0.5)
    base = Image.blend(OUTRO_SRC, OUTRO_BLUR, kb)
    w, h = W / z, H / z
    base = base.resize((W, H), Image.BICUBIC, box=((W - w) / 2, (H - h) * 0.4, (W - w) / 2 + w, (H - h) * 0.4 + h))
    dark = 1.0 - 0.5 * kb
    arr = finish(np.asarray(base).astype(np.float32) * dark, fi)
    ov = Image.fromarray(arr).convert("RGBA")
    particles(ov, tg, 1.0)
    fl = 0.0
    k1 = (d - 0.15) / 0.28
    if k1 > 0:
        paste_scaled(ov, O_T1, W / 2, H * 0.36, 1.5 - 0.5 * ease_out_back(k1, 1.3), ease_out_cubic(k1 * 1.6))
        if d - 0.15 < 0.15: fl = 0.35 * (1 - (d - 0.15) / 0.15)
    k2 = (d - 0.45) / 0.28
    if k2 > 0:
        paste_scaled(ov, O_T2, W / 2, H * 0.455, 1.5 - 0.5 * ease_out_back(k2, 1.3), ease_out_cubic(k2 * 1.6))
    k3 = (d - 1.1) / 0.3
    if k3 > 0:
        dd = ImageDraw.Draw(ov)
        pw, ph = O_SH.width + 70, 100
        sc = ease_out_back(k3, 2.0)
        cy = H * 0.6
        dd.rounded_rectangle((W / 2 - pw * sc / 2, cy - ph * sc / 2, W / 2 + pw * sc / 2, cy + ph * sc / 2), radius=50, fill=GOLD + (255,))
        if k3 > 0.5: paste_scaled(ov, O_SH, W / 2, cy, 1.0, clamp((k3 - 0.5) * 2))
    k4 = (d - 1.4) / 0.35
    if k4 > 0:
        paste_scaled(ov, O_H, W / 2, H * 0.68, 1.0, ease_out_cubic(k4))
        paste_scaled(ov, O_M, W / 2, H * 0.88, 1.0, 0.8 * ease_out_cubic(k4))
    flash(ov, fl)
    progress(ov, tg)
    out = ov.convert("RGB")
    if d > T.OUTRO - 0.45:
        k = (d - (T.OUTRO - 0.45)) / 0.45
        out = Image.blend(out, Image.new("RGB", (W, H), (0, 0, 0)), ease_in_out(k))
    return out

# ---------------------------------------------------------------- main loop
def main(out_path, only=None):
    nframes = int(round(T.TOTAL * FPS))
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", os.path.join(S, "graded.mp4"), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                           stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
                            "-movflags", "+faststart", out_path], stdin=subprocess.PIPE)
    fsz = W * H * 3
    src_idx = -1; cur = None
    for fi in range(nframes):
        tg = fi / FPS
        if only and not (only[0] <= tg < only[1]):
            # still need to consume source frames to stay in sync
            pass
        if tg < T.INTRO:
            frame = intro_frame(tg, fi)
        elif tg < T.INTRO + T.MAIN_END:
            ts = tg - T.INTRO
            want = int(round(ts * FPS))
            while src_idx < want:
                buf = dec.stdout.read(fsz)
                if len(buf) < fsz: break
                cur = buf; src_idx += 1
            if only and not (only[0] <= tg < only[1]):
                continue
            img = Image.frombuffer("RGB", (W, H), cur, "raw", "RGB", 0, 1)
            img, xf = camera(img, ts)
            arr = np.asarray(img)
            dcut = min([ts - c for c in T.CUTS if ts - c >= 0] or [9])
            if dcut < 0.12: arr = chroma(arr, int(14 * (1 - dcut / 0.12)))
            for ht, _, _ in T.HEROES:
                if 0 <= ts - ht < 0.1: arr = chroma(arr, int(8 * (1 - (ts - ht) / 0.1)))
            arr = finish(arr, fi)
            ov = Image.fromarray(arr).convert("RGBA")
            wide = 4.467 <= ts < 26.7
            for c in [0.0] + T.CUTS:
                light_leak(ov, ts - c)
            particles(ov, tg, 1.0 if wide else 0.55)
            fl = heroes(ov, ts)
            draw_caption(ov, ts, xf)
            credit_tag(ov, tg, clamp((ts - 0.3) / 0.4))
            for c in T.CUTS:
                if 0 <= ts - c < 0.15: fl = max(fl, 0.5 * (1 - (ts - c) / 0.15))
            if ts < 0.15: fl = max(fl, 1 - ts / 0.15)
            flash(ov, fl)
            progress(ov, tg)
            frame = ov.convert("RGB")
        else:
            frame = outro_frame(tg, fi)
        if only and not (only[0] <= tg < only[1]):
            continue
        enc.stdin.write(frame.tobytes())
        if fi % 150 == 0: print("frame", fi, "/", nframes, flush=True)
    enc.stdin.close(); enc.wait(); dec.kill()

if __name__ == "__main__":
    only = (float(sys.argv[2]), float(sys.argv[3])) if len(sys.argv) > 3 else None
    main(sys.argv[1], only)
