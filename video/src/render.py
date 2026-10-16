#!/usr/bin/env python3
"""Forlife Com — spot publicitaire « Impression grand format » (vertical 1080x1920, 30 fps)."""
import math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC, LOGO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
PREVIEW = len(sys.argv) > 4

W, H, FPS = 1080, 1920, 30
DUR = 22.5
NF = int(DUR * FPS)
MARGIN = 90

ORANGE = (234, 120, 34)
DARK = (13, 13, 13)
WHITE = (255, 255, 255)
CMYK = [(0, 174, 239), (236, 0, 140), (255, 237, 0), (30, 30, 30)]

FD = "/usr/share/fonts/opentype/inter/"
_fonts = {}
def font(name, size):
    k = (name, size)
    if k not in _fonts: _fonts[k] = ImageFont.truetype(FD + name, size)
    return _fonts[k]
BLACK_F, BOLD_F, SEMI_F, MED_F, ITAL_F = ("InterDisplay-Black.otf", "InterDisplay-Bold.otf",
                                          "Inter-SemiBold.otf", "Inter-Medium.otf", "Inter-MediumItalic.otf")

# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(t, s, d): return clamp((t - s) / d)
def e_out3(x): return 1 - (1 - x) ** 3
def e_out5(x): return 1 - (1 - x) ** 5
def e_inout3(x): return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def e_in3(x): return x ** 3
def e_back(x, c=1.70158):
    c3 = c + 1
    return 1 + c3 * (x - 1) ** 3 + c * (x - 1) ** 2
def lerp(a, b, x): return a + (b - a) * x

# ---------------------------------------------------------------- footage (auto-rotated → 1080x1920)
print("decoding footage…", flush=True)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                     capture_output=True, check=True).stdout
SRCF = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
NSRC = len(SRCF)
x = np.arange(256) / 255.0
base = np.clip(x * 0.45 + (0.5 - 0.5 * np.cos(np.pi * x)) * 0.55, 0, 1)
LUT = (np.stack([np.clip(base * 1.03 + 0.005, 0, 1), base, np.clip(base * 0.96, 0, 1)], 1) * 255).astype(np.uint8)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIG = (1 - 0.42 * np.clip(((xx - W / 2) / (W * 0.65)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2, 0, 1))[..., None]

def footage(src_t, zoom, cx=0.5, cy=0.5, sat=1.0):
    i = int(clamp(round(src_t * 30), 0, NSRC - 1))
    im = Image.fromarray(SRCF[i])
    zw, zh = W / zoom, H / zoom
    x0 = clamp(cx * W - zw / 2, 0, W - zw); y0 = clamp(cy * H - zh / 2, 0, H - zh)
    a = np.asarray(im.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + zw, y0 + zh)))
    a = np.stack([LUT[a[..., c], c] for c in range(3)], -1).astype(np.float32)
    if sat != 1.0:
        g = a.mean(-1, keepdims=True); a = g + (a - g) * sat
    return Image.fromarray(np.clip(a * VIG, 0, 255).astype(np.uint8)).convert("RGBA")

# ---------------------------------------------------------------- logo split by colour
la = np.asarray(Image.open(LOGO).convert("RGBA")).copy()
r, g, b, a = [la[..., i].astype(int) for i in range(4)]
is_white = (g > 200) & (b > 200)
mark = la.copy(); ys, xs = np.arange(la.shape[0])[:, None], np.arange(la.shape[1])[None, :]
mark[..., 3] = np.where(~is_white & (xs < 800) & ~((xs > 600) & (ys > 700)), a, 0)
name = la.copy(); name[..., 3] = np.where(is_white, a, 0)
MARK = Image.fromarray(mark); MARK = MARK.crop(MARK.getbbox())
NAME = Image.fromarray(name); NAME = NAME.crop(NAME.getbbox())

# ---------------------------------------------------------------- helpers
_cache = {}
def T(txt, fname, size, fill, spacing=0):
    k = (txt, fname, size, fill, spacing)
    if k in _cache: return _cache[k]
    f = font(fname, size); asc, desc = f.getmetrics()
    widths = [f.getlength(ch) + spacing for ch in txt] if spacing else [f.getlength(txt)]
    im = Image.new("RGBA", (int(sum(widths)) + 6, asc + desc), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if spacing:
        xx_ = 0
        for ch, cw in zip(txt, widths): d.text((xx_, 0), ch, font=f, fill=fill); xx_ += cw
    else:
        d.text((0, 0), txt, font=f, fill=fill)
    _cache[k] = im
    return im

def fit_size(txt, fname, maxsize, maxw):
    s = maxsize
    while s > 20 and font(fname, s).getlength(txt) > maxw: s -= 2
    return s

def mask_reveal(canvas, img, x, y, p_in, p_out=0.0):
    """Text rises into a clip box (p_in 0→1), then rises out (p_out 0→1)."""
    if p_in <= 0 or p_out >= 1: return
    h = img.height
    off = int(round((1 - e_out5(p_in)) * h - e_in3(p_out) * h))
    layer = Image.new("RGBA", (img.width, h), (0, 0, 0, 0))
    if off >= 0: layer.alpha_composite(img, (0, off))
    else: layer.alpha_composite(img, (0, 0), source=(0, -off))
    canvas.alpha_composite(layer, (int(x), int(y)))

def scaled(img, s):
    s = max(s, 0.001)
    return img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))), Image.LANCZOS)

def paste_center(canvas, img, cx, cy, alpha=1.0):
    if alpha <= 0: return
    if alpha < 1:
        img = img.copy(); img.putalpha(img.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))

def overlay(canvas, draw_fn):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(lay)); canvas.alpha_composite(lay)

def alpha_img(arr):
    return Image.fromarray(np.dstack([np.zeros((H, W, 3), np.uint8), arr.astype(np.uint8)]), "RGBA")
GRAD_B = alpha_img(np.tile((np.clip((np.linspace(0, 1, H) - 0.35) / 0.65, 0, 1) ** 1.4 * 225)[:, None], (1, W)))
GRAD_C = alpha_img(np.clip(1 - (((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.3)) ** 2), 0, 1) * 200)
GRAD_T = alpha_img(np.tile((np.clip(1 - np.linspace(0, 1, H) / 0.18, 0, 1) * 150)[:, None], (1, W)))

def crop_marks(canvas, p, inset=50, L=64, col=(255, 255, 255, 200)):
    if p <= 0: return
    l = L * e_out3(clamp(p))
    def fn(d):
        for (cx, cy, sx, sy) in [(inset, inset, 1, 1), (W - inset, inset, -1, 1),
                                 (inset, H - inset, 1, -1), (W - inset, H - inset, -1, -1)]:
            d.line([(cx, cy), (cx + sx * l, cy)], fill=col, width=4)
            d.line([(cx, cy), (cx, cy + sy * l)], fill=col, width=4)
    overlay(canvas, fn)

def reg_mark(d, cx, cy, r, col, w=3):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=w)
    d.line([(cx - r * 1.5, cy), (cx + r * 1.5, cy)], fill=col, width=w)
    d.line([(cx, cy - r * 1.5), (cx, cy + r * 1.5)], fill=col, width=w)

def cmyk_strip(canvas, x, y, p, sw=30, gap=8):
    def fn(d):
        for i, c in enumerate(CMYK):
            q = e_back(prog(p, i * 0.12, 0.5))
            if q <= 0: continue
            s = sw * q; cx = x + i * (sw + gap) + sw / 2; cy = y + sw / 2
            d.rectangle([cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2], fill=c + (255,))
    overlay(canvas, fn)

def wipe(canvas, p, col=ORANGE, skew=520):
    """Diagonal orange band sweeping across, fully covering the frame at p=0.5."""
    if p <= 0 or p >= 1: return
    cover = math.sin(math.pi * p)
    x1 = lerp(-skew, W + skew, e_inout3(p)) + cover * (W + skew) * 0.5
    x0 = x1 - cover * (W + 2 * skew)
    def fn(d):
        d.polygon([(x0 - 50, H), (x0 - 50 + skew, 0), (x0 + skew - 30, 0), (x0 - 30, H)], fill=(255, 255, 255, 230))
        d.polygon([(x0, H), (x0 + skew, 0), (x1 + skew, 0), (x1, H)], fill=col + (255,))
    overlay(canvas, fn)

def flash(canvas, a):
    if a > 0: canvas.alpha_composite(Image.new("RGBA", (W, H), (255, 255, 255, int(255 * clamp(a)))))

# ---------------------------------------------------------------- timeline (s) — voice-over starts at 1.0 s
T_A, T_B, T_C, T_D, T_E = 1.0, 3.97, 7.75, 11.55, 14.75
WORDS = [(["BÂCHES"], 7.92), (["AFFICHES"], 8.50), (["ROLL-UP"], 9.05), (["KAKÉMONOS"], 9.78),
         (["VINYLES", "ADHÉSIFS"], 10.48)]
WORD_SRC = [4.2, 9.6, 0.4, 2.6, 6.4]
WORD_ZOOM = [(0.5, 0.45), (0.5, 0.55), (0.45, 0.5), (0.55, 0.45), (0.5, 0.5)]
TXT_W = W - 2 * MARGIN

def frame(t):
    # ---------------- background / footage
    if t < T_A:
        cv = Image.new("RGBA", (W, H), DARK + (255,))
    elif t < T_B:
        z = lerp(1.08, 1.28, e_inout3(prog(t, T_A, T_B - T_A)))
        pz = prog(t, 2.55, 0.5)
        if 0 < pz < 1: z += 0.12 * (1 - e_out3(pz))
        cv = footage(1.0 + (t - T_A), z, 0.5, 0.45)
    elif t < T_C:
        cv = footage(6.0 + (t - T_B), lerp(1.04, 1.2, prog(t, T_B, T_C - T_B)), 0.5, lerp(0.4, 0.55, prog(t, T_B, 4)))
    elif t < T_D:
        idx = 0
        for i, (_, ws) in enumerate(WORDS):
            if t >= ws - 0.04: idx = i
        ws = WORDS[idx][1] if t >= WORDS[0][1] - 0.04 else T_C
        lt = max(0, t - ws)
        cx, cy = WORD_ZOOM[idx]
        cv = footage(WORD_SRC[idx] + lt * 0.8, 1.35 - 0.13 * e_out3(clamp(lt / 0.7)), cx, cy)
    elif t < T_E:
        cv = footage(8.0 + (t - T_D) * 0.9, lerp(1.4, 1.08, e_inout3(prog(t, T_D, T_E - T_D))), 0.5, 0.5,
                     sat=lerp(1.0, 1.45, e_out3(prog(t, T_D, 0.6))))
    else:
        src = footage(3.0 + ((t - T_E) * 0.5) % 8, 1.2)
        cv = src.resize((W // 8, H // 8), Image.BILINEAR).filter(ImageFilter.GaussianBlur(6)).resize((W, H), Image.BILINEAR)
        cv.alpha_composite(Image.new("RGBA", (W, H), DARK + (200,)))

    # ---------------- INTRO 0 → 1.0 : logo mark builds, circle explodes to orange
    if t < T_A:
        def intro(d):
            p1 = e_out5(prog(t, 0.05, 0.4)); p2 = e_out5(prog(t, 0.15, 0.4)); p3 = e_back(prog(t, 0.25, 0.35))
            bw1, bw2, bh, r = 300, 190, 86, 43
            x0 = W / 2 - 150; cy = H / 2
            y1, y2, y3 = cy - 150, cy - 30, cy + 120
            if p1 > 0: d.rounded_rectangle([x0, y1, x0 + max(bh, bw1 * p1), y1 + bh], r, fill=ORANGE + (255,))
            if p2 > 0: d.rounded_rectangle([x0, y2, x0 + max(bh, bw2 * p2), y2 + bh], r, fill=ORANGE + (255,))
            rr = 48 * p3 + e_in3(prog(t, 0.62, 0.38)) * 2600
            if p3 > 0: d.ellipse([x0 + 48 - rr, y3 - rr, x0 + 48 + rr, y3 + rr], fill=ORANGE + (255,))
            p = prog(t, 0.1, 0.5)
            if p > 0 and t < 0.72:
                for dy in (-330, 330): reg_mark(d, W / 2, H / 2 + dy, 18 * e_out3(p), (255, 255, 255, 160))
        overlay(cv, intro)

    # ---------------- SHOT A : "Votre marque mérite d'être vue EN GRAND"
    if T_A <= t < T_B + 0.1:
        cv.alpha_composite(GRAD_B)
        out = prog(t, 3.62, 0.3)
        X, Y = MARGIN, 1180
        s1 = fit_size("MÉRITE D'ÊTRE VUE", BLACK_F, 92, TXT_W)
        mask_reveal(cv, T("VOTRE MARQUE", BLACK_F, s1, WHITE), X, Y, prog(t, 1.30, 0.45), out)
        mask_reveal(cv, T("MÉRITE D'ÊTRE VUE", BLACK_F, s1, WHITE), X, Y + s1 * 1.12, prog(t, 1.62, 0.45), out)
        pg = prog(t, 2.50, 0.42)
        if pg > 0 and out < 1:
            big = T("EN GRAND", BLACK_F, fit_size("EN GRAND", BLACK_F, 230, TXT_W), ORANGE)
            img = scaled(big, lerp(1.35, 1.0, e_out5(pg)))
            paste_center(cv, img, X + big.width / 2, Y + s1 * 2.4 + big.height / 2 - e_in3(out) * 120,
                         clamp(pg * 3) * (1 - e_in3(out)))
        pl = e_out5(prog(t, 1.25, 0.5))
        if pl > 0 and out < 1:
            overlay(cv, lambda d: d.rectangle([X, Y - 40, X + 160 * pl * (1 - e_in3(out)), Y - 28], fill=ORANGE + (255,)))
        crop_marks(cv, prog(t, 1.2, 0.6))
        if t >= 2.5: flash(cv, 0.35 * (1 - prog(t, 2.5, 0.25)))

    # ---------------- SHOT B : Forlife Com — impression grand format
    if T_B <= t < T_C + 0.1:
        cv.alpha_composite(GRAD_B); cv.alpha_composite(GRAD_T)
        out = prog(t, 7.40, 0.32)
        X, Y = MARGIN, 1400
        pb = e_out5(prog(t, 4.20, 0.5))
        if pb > 0 and out < 1:
            overlay(cv, lambda d: d.rectangle([X, Y + 215 - 215 * pb * (1 - e_in3(out)), X + 12, Y + 215], fill=ORANGE + (255,)))
        mask_reveal(cv, T("FORLIFE COM", BLACK_F, 130, WHITE), X + 40, Y - 10, prog(t, 4.30, 0.5), out)
        pt = e_out5(prog(t, 4.95, 0.55))
        if pt > 0 and out < 1:
            tag = T("IMPRESSION GRAND FORMAT", BOLD_F, 44, DARK, spacing=5)
            bw, bh = tag.width + 46, tag.height + 18
            ww = int(bw * pt * (1 - e_in3(out)))
            if ww > 0:
                box = Image.new("RGBA", (bw, bh), ORANGE + (255,)); box.alpha_composite(tag, (23, 8))
                cv.alpha_composite(box.crop((0, 0, ww, bh)), (X + 40, Y + 155))
        cmyk_strip(cv, W - MARGIN - 4 * 38 + 8, 150, prog(t, 4.6, 1.0) * (1 - out))
        site = T("forlifecom.ci", SEMI_F, 34, WHITE)
        mask_reveal(cv, site, W - MARGIN - site.width, 200, prog(t, 4.9, 0.5), out)
        crop_marks(cv, 1.0 - out)

    # ---------------- SHOT C : product list
    if T_C <= t < T_D + 0.1:
        cv.alpha_composite(GRAD_B)
        crop_marks(cv, 1.0)
        n = len(WORDS)
        for i, (lines, ws) in enumerate(WORDS):
            we = WORDS[i + 1][1] if i + 1 < n else T_D - 0.25
            if not (ws - 0.05 <= t < we + 0.25): continue
            pin = prog(t, ws, 0.32); pout = prog(t, we - 0.02, 0.22)
            size = min(fit_size(l, BLACK_F, 190, TXT_W) for l in lines)
            y0 = 1230 - (len(lines) - 1) * size * 0.55
            for k, l in enumerate(lines):
                img = T(l, BLACK_F, size, WHITE)
                mask_reveal(cv, img, MARGIN + (1 - e_out5(pin)) * 200, y0 + k * size * 1.05, prog(t, ws + k * 0.08, 0.32), pout)
            num = T(f"0{i + 1}", BOLD_F, 54, ORANGE)
            mask_reveal(cv, num, MARGIN + 6, y0 - 80, pin, pout)
            mask_reveal(cv, T(" / 05", MED_F, 54, (255, 255, 255, 150)), MARGIN + 2 + num.width, y0 - 80, pin, pout)
            if ws <= t: flash(cv, 0.28 * (1 - prog(t, ws, 0.12)))
        pp = clamp((t - WORDS[0][1]) / (WORDS[-1][1] + 0.6 - WORDS[0][1]))
        overlay(cv, lambda d: (d.rectangle([MARGIN, H - 260, W - MARGIN, H - 255], fill=(255, 255, 255, 70)),
                               d.rectangle([MARGIN, H - 260, MARGIN + TXT_W * e_out3(pp), H - 255], fill=ORANGE + (255,))))
        mask_reveal(cv, T("NOS SUPPORTS GRAND FORMAT", BOLD_F, 30, WHITE, spacing=5), MARGIN, H - 235,
                    prog(t, T_C + 0.1, 0.5), prog(t, T_D - 0.3, 0.25))

    # ---------------- SHOT D : couleurs éclatantes / finition professionnelle
    if T_D <= t < T_E + 0.1:
        cv.alpha_composite(GRAD_C)
        crop_marks(cv, 1.0)
        CY = H / 2 - 60
        o1 = prog(t, 12.75, 0.25)
        l1 = T("DES COULEURS", BOLD_F, 66, WHITE, spacing=4)
        l2 = T("ÉCLATANTES", BLACK_F, fit_size("ÉCLATANTES", BLACK_F, 200, TXT_W), WHITE)
        mask_reveal(cv, l1, W / 2 - l1.width / 2, CY - 90, prog(t, 11.65, 0.45), o1)
        mask_reveal(cv, l2, W / 2 - l2.width / 2, CY, prog(t, 11.85, 0.5), o1)
        pc = prog(t, 12.0, 0.6)
        if pc > 0 and o1 < 1:
            def bars(d):
                bw = (l2.width - 6) / 4
                for i, c in enumerate(CMYK):
                    q = e_out5(clamp(pc * 1.6 - i * 0.18)) * (1 - e_in3(o1))
                    x0 = W / 2 - l2.width / 2 + i * bw
                    d.rectangle([x0, CY + l2.height + 20, x0 + bw * q, CY + l2.height + 42], fill=c + (255,))
            overlay(cv, bars)
        o2 = prog(t, 14.45, 0.3)
        m1 = T("UNE FINITION", BOLD_F, 66, WHITE, spacing=4)
        m2 = T("PROFESSIONNELLE", BLACK_F, fit_size("PROFESSIONNELLE", BLACK_F, 170, TXT_W + 20), ORANGE)
        mask_reveal(cv, m1, W / 2 - m1.width / 2, CY - 90, prog(t, 12.95, 0.45), o2)
        mask_reveal(cv, m2, W / 2 - m2.width / 2, CY + 10, prog(t, 13.12, 0.5), o2)

    # ---------------- END CARD
    if t >= T_E:
        up = e_inout3(prog(t, 18.35, 0.6))
        k = lerp(1.0, 0.78, up)
        # mark
        cy_mark = lerp(640, 470, up)
        mh = 300 * k
        pm = e_back(prog(t, T_E + 0.1, 0.55))
        if pm > 0:
            paste_center(cv, scaled(MARK, mh / MARK.height * pm), W / 2, cy_mark)
        # name wipes in left→right
        nm = scaled(NAME, TXT_W * 0.9 * k / NAME.width)
        ny = cy_mark + mh / 2 + 60 * k
        pn = e_out5(prog(t, T_E + 0.35, 0.6))
        vis = int(nm.width * pn)
        if vis > 0: cv.alpha_composite(nm.crop((0, 0, vis, nm.height)), (int(W / 2 - nm.width / 2), int(ny)))
        # tagline, word by word on the VO
        ts = int(62 * k)
        f = font(ITAL_F, ts)
        ty = ny + nm.height + 50 * k
        rows = [[("Imprimer", 15.95, WHITE), ("l'avenir,", 16.35, ORANGE)],
                [("valoriser", 16.95, WHITE), ("les", 17.45, WHITE), ("marques", 17.65, ORANGE)]]
        for row in rows:
            rw = f.getlength(" ".join(w for w, _, _ in row)); tx = W / 2 - rw / 2
            for wd, st, col in row:
                mask_reveal(cv, T(wd, ITAL_F, ts, col), tx, ty, prog(t, st, 0.4))
                tx += f.getlength(wd + " ")
            ty += ts * 1.3
        # CTA
        pc = prog(t, 18.75, 0.5)
        if pc > 0:
            btn = T("DEMANDEZ VOTRE DEVIS", BLACK_F, 52, DARK, spacing=2)
            bw, bh = btn.width + 100, btn.height + 46
            by = 1240
            q = clamp(e_back(pc), 0, 1.2)
            overlay(cv, lambda d: d.rounded_rectangle([W / 2 - bw * q / 2, by, W / 2 + bw * q / 2, by + bh], bh / 2, fill=ORANGE + (255,)))
            if pc > 0.35: paste_center(cv, btn, W / 2, by + bh / 2 + 4, clamp((pc - 0.35) * 3))
            infos = [("+225 05 85 80 18 56", 52, WHITE), ("forlifecom.ci", 44, ORANGE), ("Abidjan Est", 40, (255, 255, 255, 200))]
            iy = by + bh + 80
            for j, (s, sz, col) in enumerate(infos):
                img = T(s, SEMI_F, sz, col)
                mask_reveal(cv, img, W / 2 - img.width / 2, iy, prog(t, 19.1 + j * 0.15, 0.45))
                iy += sz * 1.6
        crop_marks(cv, prog(t, T_E + 0.2, 0.6), col=(255, 255, 255, 150))

    # ---------------- transitions (drawn on top)
    if T_A <= t < T_A + 0.45:
        q = e_inout3(prog(t, T_A, 0.42)); sk = 500
        def off(d):
            x = lerp(0, W + sk, q)
            d.polygon([(x, 0), (W + sk, 0), (W + sk, H), (x - sk, H)], fill=ORANGE + (255,))
            d.polygon([(x, 0), (x - sk, H), (x - sk - 50, H), (x - 50, 0)], fill=(255, 255, 255, 220))
        overlay(cv, off)
    for b in (T_B, T_C, T_D):
        wipe(cv, prog(t, b - 0.2, 0.4))
    wipe(cv, prog(t, T_E - 0.3, 0.55))
    fo = prog(t, DUR - 0.6, 0.6)
    if fo > 0: cv.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * fo))))
    return cv.convert("RGB")


if PREVIEW:
    for tt in [float(v) for v in sys.argv[4].split(",")]:
        frame(tt).resize((W // 2, H // 2), Image.LANCZOS).save(f"{OUT}_{tt:05.2f}.jpg", quality=85)
    sys.exit()

enc = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                        "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
                        "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
for n in range(NF):
    enc.stdin.write(frame(n / FPS).tobytes())
    if n % 90 == 0: print(f"frame {n}/{NF}", flush=True)
enc.stdin.close(); enc.wait()
print("done")
