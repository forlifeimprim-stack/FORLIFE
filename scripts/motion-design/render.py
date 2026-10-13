# Motion design renderer — "Ose commencer" (Forlife Com, Motivation #01)
# Renders 1080x1920 @30fps frames with PIL and pipes them to ffmpeg.
import sys, os, json, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
from multiprocessing import Pool

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, 'build'); FONTS = os.path.join(HERE, 'fonts')
LOGO = os.path.join(HERE, '..', '..', 'assets', 'logo', 'logo-vertical.png')
W, H, FPS = 1080, 1920, 30
TIM = json.load(open(os.path.join(B, 'timings.json')))
CUE = json.load(open(os.path.join(B, 'cues.json')))
S = {s['id']: s for s in TIM['segs']}
DUR = CUE['duration']; STEPS = CUE['steps']; BEAT = CUE['beat']

BG = (13, 13, 13); ORANGE = (234, 120, 34); OR_L = (245, 160, 90); OR_D = (201, 99, 24)
CREAM = (253, 248, 243)

# ---------------------------------------------------------------- helpers
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(t, a, d): return clamp((t - a) / d) if d > 0 else float(t >= a)
def eo(p): return 1 - (1 - p) ** 3                       # ease out cubic
def ei(p): return p ** 3
def eio(p): return 4*p**3 if p < .5 else 1 - (-2*p + 2)**3 / 2
def eback(p, s=1.7): p -= 1; return 1 + (s + 1)*p**3 + s*p**2
def lerp(a, b, p): return a + (b - a) * p
def smooth(e0, e1, x): x = clamp((x - e0) / (e1 - e0)); return x*x*(3 - 2*x)

_fc = {}
def F(w, size):
    k = (w, int(size))
    if k not in _fc: _fc[k] = ImageFont.truetype(os.path.join(FONTS, f'Poppins-{w}.ttf'), int(size))
    return _fc[k]

_tc = {}
def text_img(txt, w, size, fill, stroke=0, stroke_fill=None, spacing=0):
    k = (txt, w, int(size), fill, stroke, stroke_fill, spacing)
    if k in _tc: return _tc[k]
    f = F(w, size)
    if spacing:
        widths = [f.getlength(c) + spacing for c in txt]
        tw = int(sum(widths)) + 4
    else:
        tw = int(f.getlength(txt)) + 4
    asc, desc = f.getmetrics(); pad = stroke + 6
    im = Image.new('RGBA', (tw + 2*pad, asc + desc + 2*pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if spacing:
        x = pad
        for c, wd in zip(txt, widths):
            d.text((x, pad), c, font=f, fill=fill); x += wd
    else:
        d.text((pad, pad), txt, font=f, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)
    _tc[k] = (im, pad)
    return _tc[k]

def with_alpha(im, a):
    if a >= 0.999: return im
    r, g, b, al = im.split()
    al = al.point(lambda v: int(v * a))
    return Image.merge('RGBA', (r, g, b, al))

def comp(canvas, im, x, y):
    x, y = int(round(x)), int(round(y))
    sx, sy = max(0, -x), max(0, -y)
    ex, ey = min(im.width, canvas.width - x), min(im.height, canvas.height - y)
    if ex <= sx or ey <= sy: return
    canvas.alpha_composite(im, (x + sx, y + sy), (sx, sy, ex, ey))

def paste(canvas, im, x, y, a=1.0):
    if a <= 0.003: return
    comp(canvas, with_alpha(im, a), x, y)

def paste_scaled(canvas, im, cx, cy, sc, a=1.0):
    if sc <= 0.01 or a <= 0.003: return
    w, h = max(1, int(im.width*sc)), max(1, int(im.height*sc))
    im2 = im.resize((w, h), Image.BILINEAR)
    comp(canvas, with_alpha(im2, a), cx - w/2, cy - h/2)

class Shapes:
    """Supersampled (2x) shape layer for smooth circles/lines."""
    def __init__(self): self.im = Image.new('RGBA', (W*2, H*2), (0, 0, 0, 0)); self.d = ImageDraw.Draw(self.im)
    def circle(self, x, y, r, fill=None, outline=None, width=1):
        self.d.ellipse([2*(x-r), 2*(y-r), 2*(x+r), 2*(y+r)], fill=fill, outline=outline, width=int(width*2))
    def line(self, pts, fill, width): self.d.line([(2*x, 2*y) for x, y in pts], fill=fill, width=int(width*2), joint='curve')
    def rrect(self, x0, y0, x1, y1, r, fill=None, outline=None, width=1):
        self.d.rounded_rectangle([2*x0, 2*y0, 2*x1, 2*y1], radius=2*r, fill=fill, outline=outline, width=int(width*2))
    def arc(self, x, y, r, a0, a1, fill, width):
        self.d.arc([2*(x-r), 2*(y-r), 2*(x+r), 2*(y+r)], a0, a1, fill=fill, width=int(width*2))
    def done(self, canvas): canvas.alpha_composite(self.im.reduce(2))

def rgba(c, a): return (c[0], c[1], c[2], int(255*clamp(a)))

# ---------------------------------------------------------------- precomputed textures
def make_glow(size=600, color=ORANGE):
    y, x = np.mgrid[-1:1:size*1j, -1:1:size*1j]
    a = np.exp(-(x*x + y*y) * 4.5)
    arr = np.zeros((size, size, 4), np.uint8); arr[..., :3] = color; arr[..., 3] = (a*255).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')
GLOW = make_glow()
_gc = {}
def glow(canvas, x, y, r, a):
    if a <= 0.01 or r < 4: return
    rr = int(r) // 4 * 4 + 4
    if rr not in _gc: _gc[rr] = GLOW.resize((rr*2, rr*2), Image.BILINEAR)
    paste(canvas, _gc[rr], x - rr, y - rr, a)

rng = np.random.default_rng(3)
GRAIN = []
for i in range(6):
    n = rng.normal(128, 40, (H//2, W//2)).clip(0, 255).astype(np.uint8)
    GRAIN.append(Image.fromarray(n, 'L').resize((W, H), Image.NEAREST).convert('RGB'))
yy, xx = np.mgrid[0:H, 0:W]
vig = 1 - 0.55*np.clip(((xx - W/2)/(W*0.75))**2 + ((yy - H/2)/(H*0.62))**2, 0, 1)
VIGNETTE = Image.fromarray((vig*255).astype(np.uint8), 'L').convert('RGB')
del yy, xx, vig

def make_fog(seed):
    r = np.random.default_rng(seed)
    small = Image.fromarray((r.random((60, 34))*255).astype(np.uint8), 'L')
    big = small.resize((W + 400, H + 400), Image.BICUBIC).filter(ImageFilter.GaussianBlur(70))
    a = np.asarray(big).astype(np.float32)/255
    a = np.clip((a - 0.35) * 1.8, 0, 1) ** 1.5
    arr = np.zeros(a.shape + (4,), np.uint8); arr[..., :3] = (214, 196, 178); arr[..., 3] = (a*85).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')
FOG = [make_fog(11), make_fog(23)]

# particles for the drop
NP = 140
P_ANG = rng.uniform(0, 2*np.pi, NP); P_SPD = rng.uniform(350, 1500, NP)
P_SIZE = rng.uniform(2.5, 8, NP); P_LIFE = rng.uniform(0.7, 1.7, NP); P_COL = rng.integers(0, 3, NP)
# converging streaks
NS = 46
S_ANG = rng.uniform(0, 2*np.pi, NS); S_R0 = rng.uniform(500, 1200, NS); S_LEN = rng.uniform(60, 220, NS); S_DEL = rng.uniform(0, 0.35, NS)

# ---------------------------------------------------------------- word-by-word text blocks
class Block:
    """lines: list of (size, [(word, style)...]). styles: n=semibold cream, l=light cream, o=semibold orange,
    i=italic light orange, b=extra-bold cream, B=extra-bold orange."""
    ST = {'n': ('600-normal', CREAM), 'l': ('300-normal', CREAM), 'o': ('600-normal', ORANGE),
          'i': ('500-italic', OR_L), 'b': ('800-normal', CREAM), 'B': ('800-normal', ORANGE)}
    def __init__(self, lines, seg, y0, align='center', x0=110, lead=1.18, t0=None, t1=None):
        self.items = []; y = y0
        t0 = seg['start'] if t0 is None else t0; t1 = seg['end'] if t1 is None else t1
        total = sum(len(w) + 2 for _, ws in lines for w, _ in ws); acc = 0
        for size, words in lines:
            imgs = [text_img(w, self.ST[s][0], size, self.ST[s][1]) + (w,) for w, s in words]
            gap = size * 0.27
            lw = sum(im.width - 2*p for im, p, _ in imgs) + gap*(len(imgs) - 1)
            x = (W - lw)/2 if align == 'center' else x0
            for im, p, w in imgs:
                tw = t0 + (t1 - t0) * 0.92 * acc/total - 0.06
                self.items.append(dict(im=im, x=x - p, y=y - p, t=tw, w=w, x1=x + im.width - 2*p, size=size))
                acc += len(w) + 2; x += im.width - 2*p + gap
            y += size * lead
        self.bottom = y
    def draw(self, cv, t, a=1.0, dy=0.0, dx=0.0, anim=0.28):
        for it in self.items:
            p = prog(t, it['t'], anim)
            if p <= 0: continue
            e = eo(p)
            paste(cv, it['im'], it['x'] + dx, it['y'] + dy + (1 - e)*34, a*e)

# ---------------------------------------------------------------- scene setup
q1, q2, q3, q4, q5, t1, o1 = (S[k] for k in ('q1', 'q2', 'q3', 'q4', 'q5', 't1', 'o1'))
s1, s2, s3 = S['s1'], S['s2'], S['s3']
DOT0 = (540, 760)

B_S1 = Block([(66, [('On', 'n'), ('attend', 'n'), ('souvent', 'n')]),
              (66, [('le', 'n'), ('bon', 'i'), ('moment.', 'i')])], s1, 1010)
B_S3 = Block([(96, [('Mais', 'n'), ('la', 'n')]), (110, [('vérité', 'B'), ('?', 'B')])], s3, 1000)
# quote layout (left aligned, big)
QX = 100
B_Q1a = Block([(92, [('N’attends', 'n'), ('pas', 'n')]), (92, [('que', 'l'), ('tout', 'l'), ('soit', 'l')])],
              q1, 520, 'left', QX, t1=q1['start'] + (q1['end'] - q1['start'])*0.5)
PARF_T = q1['start'] + (q1['end'] - q1['start'])*0.47
POUR_T = q1['start'] + (q1['end'] - q1['start'])*0.68
COMM_T = q1['start'] + (q1['end'] - q1['start'])*0.8
PARF = text_img('parfait', '500-italic', 168, BG, 3, CREAM)
POUR = text_img('pour', '300-normal', 92, CREAM)
COMM = text_img('commencer', '700-normal', 104, CREAM)
COMM_DARK = text_img('commencer', '700-normal', 104, BG)
PARF_Y = 520 + 92*1.18*2 - 18
POUR_Y = PARF_Y + 205
COMM_Y = POUR_Y + 110
f104 = F('700-normal', 104); COMM_W = f104.getlength('commencer')
asc104 = f104.getmetrics()[0]
Q_PERIOD = (QX + COMM_W + 26, COMM_Y + asc104 - 14)   # the dot becomes the period of "commencer."

B_Q2 = Block([(64, [('Chaque', 'n'), ('petit', 'o'), ('pas', 'o')]), (64, [('t’apprend', 'l'), ('quelque', 'l'), ('chose', 'l')])], q2, 250)
B_Q3 = Block([(64, [('et', 'l'), ('te', 'l'), ('rapproche', 'l')]), (64, [('de', 'n'), ('ton', 'n'), ('objectif.', 'o')])], q3, 250)
STAIR = [(150 + i*118, 1560 - i*132) for i in range(7)]
TARGET = (STAIR[-1][0] + 20, STAIR[-1][1] - 40)
STEP_WORDS = ['essayer', 'douter', 'apprendre', 'corriger', 'oser', 'progresser', '']

B_Q4 = Block([(84, [('L’essentiel', 'n'), ('est', 'n')]), (84, [('d’oser', 'o'), ('avancer,', 'o')])], q4, 760)
B_Q5 = Block([(62, [('même', 'l'), ('lorsque', 'l'), ('tout', 'l')]), (62, [('n’est', 'l'), ('pas', 'l'), ('encore', 'l'), ('clair.', 'i')])], q5, 1035)
FOG_Y0, FOG_Y1 = 700, 1260

DROP = CUE['drop2']; DROP1 = CUE['drop1']; BREAK_T = CUE['break_t']; FINAL = CUE['final']

def beat_pulse(t):
    """1.0 on each kick, decaying; 0 where the groove has no kick (break, pre-drop beat, after the final hit)."""
    if BREAK_T <= t < DROP1 or DROP - BEAT <= t < DROP or t >= FINAL + BEAT: return 0.0
    return math.exp(-(t % BEAT) * 9)
OSE = text_img('OSE', '800-normal', 290, CREAM)
COMMC = text_img('COMMENCER', '800-normal', 132, ORANGE)
f132 = F('800-normal', 132); COMMC_W = f132.getlength('COMMENCER'); asc132 = f132.getmetrics()[0]
SUB = text_img('Le premier pas, c’est maintenant.', '300-italic', 44, CREAM)
D_OSE_Y = 640; D_COM_Y = 930
D_CX = (W - COMMC_W - 40)/2
D_PERIOD = (D_CX + COMMC_W + 24, D_COM_Y + asc132 - 16)

# outro: real logo split into layers
OUT_T = o1['start'] - 0.65
_logo = Image.open(LOGO).convert('RGBA').crop((247, 138, 2231, 1488))
LS = 760 / _logo.width
_logo = _logo.resize((int(_logo.width*LS), int(_logo.height*LS)), Image.LANCZOS)
LX, LY = (W - _logo.width)//2, 560
la = np.asarray(_logo).copy()
def layer(mask):
    a = la.copy(); a[..., 3] = (a[..., 3] * mask).astype(np.uint8); return Image.fromarray(a, 'RGBA')
hh, ww = la.shape[:2]; yy, xx = np.mgrid[0:hh, 0:ww]
ox, oy = 247, 138
def box(x0, x1, y0, y1): return ((xx >= (x0-ox)*LS - 2) & (xx <= (x1-ox)*LS + 2) & (yy >= (y0-oy)*LS - 2) & (yy <= (y1-oy)*LS + 2)).astype(np.float32)
M_TOP, M_MID, M_DOT = box(857, 1624, 138, 362), box(874, 1351, 458, 673), box(874, 1121, 759, 1006)
L_TOP, L_MID, L_DOT = layer(M_TOP), layer(M_MID), layer(M_DOT)
L_REST = layer(1 - np.clip(M_TOP + M_MID + M_DOT, 0, 1))
LOGO_DOT = (LX + (997.5 - ox)*LS, LY + (882.5 - oy)*LS); LOGO_R = 123.5*LS
SLOGAN = text_img('L’ami des PME, TPE, Écoles et Communautés', '400-normal', 32, (200, 194, 188))
del la, yy, xx

TAG = text_img('MOTIVATION', '600-normal', 24, (190, 184, 178), spacing=5)
TAGN = text_img('#01', '600-normal', 24, ORANGE, spacing=2)

# ---------------------------------------------------------------- dot choreography
def stair_dot(t):
    """dot hopping along the stairs; returns (x, y)."""
    land = lambda i: (STAIR[i][0] + 46, STAIR[i][1] - 22) if i < 6 else TARGET
    if t < STEPS[0] - 0.42:
        return Q_PERIOD
    prev = Q_PERIOD
    for i, st in enumerate(STEPS):
        a = st - 0.42
        if t < st:
            p = eio(prog(t, a, 0.42)); x0, y0 = prev; x1, y1 = land(i)
            hgt = 120 if i else 60
            return (lerp(x0, x1, p), lerp(y0, y1, p) - math.sin(math.pi*p)*hgt)
        prev = land(i)
    return prev

def fog_dot(t):
    p = prog(t, q4['start'] - 0.5, (q5['end'] + 0.1) - (q4['start'] - 0.5))
    if t < q4['start'] - 0.5:
        p0 = prog(t, q3['end'] + 0.1, q4['start'] - 0.6 - q3['end'])
        x0, y0 = TARGET; return (lerp(x0, 60, eio(p0)), lerp(y0, 1000, eio(p0)))
    return (lerp(60, 1020, eio(p)), 1000 + math.sin(p*math.pi*2)*40)

def dot_state(t):
    """(x, y, r, glow_alpha)"""
    breathe = 1 + 0.18*math.sin(2*math.pi*t/1.7)
    if t < q1['start'] - 0.3:
        r = 16*eback(prog(t, 0.2, 0.7))*breathe
        if s3['start'] - 0.1 < t:   # heartbeat on "la vérité"
            r *= 1 + 0.35*math.exp(-((t - s3['start'] - 0.2) % 0.8)*7)
        return (*DOT0, r, 0.55)
    if t < q2['start'] - 0.3:
        p = eio(prog(t, q1['start'] - 0.3, COMM_T + 0.2 - (q1['start'] - 0.3)))
        x, y = lerp(DOT0[0], Q_PERIOD[0], p), lerp(DOT0[1], Q_PERIOD[1], p)
        return (x, y, lerp(16, 13, p)*breathe, 0.5)
    if t < q3['end'] + 0.1:
        x, y = stair_dot(t); return (x, y, 15, 0.6)
    if t < q5['end'] + 0.15:
        x, y = fog_dot(t); grow = smooth(q4['start'] - 0.6, q4['start'], t)
        return (x, y, lerp(15, 20, grow)*breathe, lerp(0.6, 1.0, grow))
    if t < DROP:
        p = eio(prog(t, q5['end'] + 0.15, DROP - 0.35 - q5['end'] - 0.15))
        x0, y0 = fog_dot(q5['end'] + 0.15)
        return (lerp(x0, 540, p), lerp(y0, 900, p), lerp(20, 7, p), lerp(1.0, 0.9, p))
    if t < OUT_T:
        p = eback(prog(t, DROP + 0.12, 0.5))
        return (*D_PERIOD, 22*p, 0.8)
    p = eio(prog(t, OUT_T, 0.85))
    return (lerp(D_PERIOD[0], LOGO_DOT[0], p), lerp(D_PERIOD[1], LOGO_DOT[1], p), lerp(22, LOGO_R, p), lerp(0.8, 0.5, p))

# ---------------------------------------------------------------- frame
def frame(i):
    t = i / FPS
    cv = Image.new('RGBA', (W, H), BG + (255,))
    sh = Shapes()
    dx, dy, r, ga = dot_state(t)
    bp_ = beat_pulse(t); r *= 1 + 0.14*bp_
    # ambient glow follows the dot
    amb = 0.16 + 0.1*math.sin(t*0.8)
    if DROP <= t < OUT_T: amb = lerp(0.85, 0.35, eo(prog(t, DROP, 1.4)))
    amb += 0.13*bp_
    if t >= FINAL: amb += 0.5*math.exp(-(t - FINAL)*2.5)
    glow(cv, dx, dy, 900, amb)
    camx = camy = 0.0
    if DROP <= t < DROP + 0.45:
        k = (1 - prog(t, DROP, 0.45))**2; camx = math.sin(t*90)*14*k; camy = math.cos(t*77)*14*k

    # ---------------- Act 1: waiting
    if t < q1['start']:
        # loading spinner around the dot (waiting for the perfect moment)
        sa = prog(t, 0.6, 0.6) * (1 - prog(t, s3['start'], 0.35))
        if sa > 0:
            rot = t*260
            rr = 74 + 30*eo(prog(t, s3['start'], 0.35))
            sh.arc(DOT0[0], DOT0[1], rr, rot, rot + 250, rgba(CREAM, 0.38*sa), 4)
        a1 = 1 - prog(t, s2['start'] - 0.25, 0.3)
        B_S1.draw(cv, t, a1, -40*eo(prog(t, s2['start'] - 0.25, 0.3)))
        # checklist + stuck progress bar
        if s2['start'] - 0.1 < t < q1['start']:
            fall = prog(t, s3['start'], 0.55); fy = 900*ei(fall); fa = 1 - fall
            for k, (label, tt) in enumerate((('Le bon plan.', s2['start']), ('Les bonnes conditions.', s2['start'] + 0.85))):
                p = eo(prog(t, tt, 0.4)); y = 1000 + k*96 + (1 - p)*30 + fy*(1 + k*0.3)
                bx = 190
                sh.rrect(bx, y + 8, bx + 46, y + 54, 9, outline=rgba(CREAM, 0.8*p*fa), width=3)
                im, pd = text_img(label, '500-normal' if False else '400-normal', 50, CREAM)
                paste(cv, im, bx + 74 - pd, y - pd - 2, p*fa)
            pb = eo(prog(t, s2['start'] + 0.3, 0.4))
            if pb > 0:
                y = 1250 + fy*1.6; x0, x1 = 190, 890
                fill = 0.99*eo(prog(t, s2['start'] + 0.4, s2['end'] - s2['start'] - 0.2))
                lab, pd = text_img('Moment parfait…', '300-italic', 36, OR_L)
                paste(cv, lab, x0 - pd, y - 62 - pd, pb*fa)
                sh.rrect(x0, y, x1, y + 22, 11, outline=rgba(CREAM, 0.35*pb*fa), width=2)
                sh.rrect(x0 + 4, y + 4, x0 + 4 + (x1 - x0 - 8)*fill, y + 18, 7, fill=rgba(ORANGE, pb*fa))
                blink = 1 if fill < 0.985 else (0.25 + 0.75*(math.sin(t*14) > 0))
                pc, pd = text_img(f'{int(round(fill*100))}%', '600-normal', 40, CREAM)
                paste(cv, pc, x1 - pc.width + pd, y + 34 - pd, pb*fa*blink)
        a3 = 1 - prog(t, q1['start'] - 0.35, 0.3)
        B_S3.draw(cv, t, a3)

    # ---------------- Act 2a: the quote, line 1
    if q1['start'] - 0.4 < t < q2['start'] + 0.1:
        ex = eo(prog(t, q2['start'] - 0.35, 0.4)); ea = 1 - ex; ey = -120*ex
        B_Q1a.draw(cv, t, ea, ey)
        p = prog(t, PARF_T, 0.45)
        if p > 0:
            jit = 3*math.sin(t*41)*smooth(PARF_T + 0.3, PARF_T + 0.6, t)
            sc = lerp(1.35, 1, eo(p))
            im, pd = PARF
            paste_scaled(cv, im, QX - pd + im.width/2 + jit, PARF_Y - pd + im.height/2 + ey, sc, eo(p)*ea)
            # a hand-drawn strike through "parfait"
            ps = eo(prog(t, q1['end'] - 0.55, 0.45))
            if ps > 0:
                fw = F('500-italic', 168).getlength('parfait')
                y0 = PARF_Y + 118 + ey
                sh.line([(QX - 10, y0 + 6), (QX - 10 + (fw + 30)*ps, y0 - 10*ps)], rgba(ORANGE, ea), 9)
        p = eo(prog(t, POUR_T, 0.35))
        im, pd = POUR; paste(cv, im, QX - pd, POUR_Y - pd + (1 - p)*30 + ey, p*ea)
        p = prog(t, COMM_T, 0.35)
        if p > 0:
            hp = eo(prog(t, COMM_T + 0.15, 0.4))
            if hp > 0.01:
                hl = Shapes(); hl.rrect(QX - 16, COMM_Y + 22 + ey, QX - 16 + (COMM_W + 32)*hp, COMM_Y + 138 + ey, 10, fill=rgba(ORANGE, ea)); hl.done(cv)
            im, pd = COMM; paste(cv, im, QX - pd, COMM_Y - pd + (1 - eo(p))*30 + ey, eo(p)*ea*(1 - hp))
            im, pd = COMM_DARK; paste(cv, im, QX - pd, COMM_Y - pd + ey, ea*hp)

    # ---------------- Act 2b: the stairs
    if q2['start'] - 0.4 < t < q4['start']:
        sa = 1 - prog(t, q3['end'] + 0.15, 0.45)
        B_Q2.draw(cv, t, sa*(1 - prog(t, q3['start'] - 0.2, 0.25)))
        B_Q3.draw(cv, t, sa)
        for k, (x, y) in enumerate(STAIR[:-1]):
            appear = eo(prog(t, q2['start'] - 0.2 + k*0.12, 0.4))
            landed = t >= STEPS[k]
            col = ORANGE if landed else CREAM
            al = (0.95 if landed else 0.25)*appear*sa
            sh.rrect(x, y, x + 92, y + 10, 5, fill=rgba(col, al))
            if landed:
                lp = eo(prog(t, STEPS[k], 0.4))
                glow(cv, x + 46, y, 70*lp, 0.5*sa*(1 - 0.5*prog(t, STEPS[k] + 0.3, 1)))
                if STEP_WORDS[k]:
                    im, pd = text_img(STEP_WORDS[k], '300-italic', 28, OR_L)
                    paste(cv, im, x + 46 - im.width/2, y + 22 - pd + (1 - lp)*14, lp*sa*0.9)
            if k > 0:   # dotted path between treads
                px, py = STAIR[k - 1]
                if t >= STEPS[k]:
                    for j in range(1, 5):
                        u = j/5; sh.circle(lerp(px + 92, x, u), lerp(py, y, u) - math.sin(math.pi*u)*30, 2.5, fill=rgba(OR_L, 0.6*sa))
        # target
        ta = eo(prog(t, q3['start'], 0.5))*sa
        hit = prog(t, STEPS[-1], 0.9)
        for k, rr in enumerate((90, 62, 34)):
            pulse = 1 + 0.25*math.sin(math.pi*hit)*(1 - hit) if hit > 0 else 1
            sh.circle(*TARGET, rr*pulse, outline=rgba(ORANGE if k == 2 or hit > 0 else CREAM, (0.9 if hit > 0 else 0.35)*ta), width=4)
        if hit > 0:
            for k in range(3):
                rr = 40 + 260*eo(clamp(hit*1.3 - k*0.15)); sh.circle(*TARGET, rr, outline=rgba(ORANGE, (1 - clamp(hit*1.3 - k*0.15))*0.6*sa), width=3)

    # ---------------- Act 2c: the fog
    if q4['start'] - 0.6 < t < DROP:
        fa = smooth(q4['start'] - 0.6, q4['start'], t) * (1 - smooth(q5['end'] + 0.1, q5['end'] + 0.6, t))
        # text layer, then blur everything the light hasn't reached yet
        lay = Image.new('RGBA', (W, FOG_Y1 - FOG_Y0), (0, 0, 0, 0))
        B_Q4.draw(lay, t, 1.0, -FOG_Y0); B_Q5.draw(lay, t, 1.0, -FOG_Y0)
        blur = lay.filter(ImageFilter.GaussianBlur(13))
        xs = np.arange(W)[None, :]; ys = np.arange(FOG_Y0, FOG_Y1)[:, None]
        clear = np.clip((dx + 160 - xs)/260, 0, 1) * np.ones_like(ys, dtype=float)
        clear = np.maximum(clear, np.clip(1 - np.hypot(xs - dx, ys - dy)/360, 0, 1)*1.4)
        clear = np.clip(clear, 0, 1)
        if t > q5['end'] + 0.05: clear = np.maximum(clear, smooth(q5['end'] + 0.05, q5['end'] + 0.4, t))
        mask = Image.fromarray((clear*255).astype(np.uint8), 'L')
        comp = Image.composite(lay, blur, mask)
        paste(cv, comp, 0, FOG_Y0, fa)
        for k, fg in enumerate(FOG):
            ox = int(clamp(200 + math.sin(t*0.25 + k)*90 + (t - q4['start'])*(28 if k else -22), 0, 400))
            oy = 120 + k*80
            fl = fg.crop((ox, oy, ox + W, oy + H))
            cv.alpha_composite(with_alpha(fl, fa*(0.8 if k else 0.65)))
        glow(cv, dx, dy, 420, 0.55*fa)

    # ---------------- converge (riser)
    if q5['end'] + 0.1 < t < DROP:
        p = prog(t, q5['end'] + 0.1, DROP - 0.3 - q5['end'] - 0.1)
        for k in range(NS):
            u = clamp((p - S_DEL[k])/(1 - S_DEL[k] + 1e-6))
            if u <= 0 or u >= 1: continue
            rr = S_R0[k]*(1 - ei(u)); ln = S_LEN[k]*(1 - u*0.6)
            c, s_ = math.cos(S_ANG[k]), math.sin(S_ANG[k])
            sh.line([(540 + c*rr, 900 + s_*rr), (540 + c*(rr + ln), 900 + s_*(rr + ln))], rgba(OR_L if k % 3 else CREAM, 0.7*math.sin(math.pi*u)), 3)
        dark = smooth(DROP - 0.5, DROP - 0.15, t)
        if dark > 0: cv.alpha_composite(Image.new('RGBA', (W, H), BG + (int(200*dark),)))

    # ---------------- Act 3: OSE COMMENCER.
    if DROP <= t < o1['start'] + 0.4:
        ea = 1 - smooth(OUT_T, OUT_T + 0.45, t)
        z = lerp(1.28, 1.0, eback(prog(t, DROP, 0.55), 1.2))
        im, pd = OSE; paste_scaled(cv, im, 540 + camx, D_OSE_Y + im.height/2 - pd + camy, z, ea*eo(prog(t, DROP, 0.12)))
        im, pd = COMMC
        p2 = prog(t, DROP + 0.08, 0.4)
        paste_scaled(cv, im, D_CX - pd + im.width/2 + camx, D_COM_Y - pd + im.height/2 + camy + (1 - eo(p2))*40, lerp(1.15, 1, eo(p2)), ea*eo(p2))
        im, pd = SUB; ps = eo(prog(t, DROP + 0.9, 0.6))
        paste(cv, im, (W - im.width)/2, 1190 + (1 - ps)*20, ps*ea*0.9)
        # shockwave + particles
        u = prog(t, DROP, 1.1)
        if 0 < u < 1:
            for k in range(3):
                v = clamp(u*1.2 - k*0.12)
                if 0 < v < 1: sh.circle(540, 900, 30 + 900*eo(v), outline=rgba(ORANGE if k != 1 else CREAM, (1 - v)*0.7), width=6 - k*1.5)
        tp = t - DROP
        if 0 <= tp < 1.8:
            for k in range(NP):
                if tp > P_LIFE[k]: continue
                dist = P_SPD[k]*(1 - math.exp(-tp*3.2))/3.2
                x = 540 + math.cos(P_ANG[k])*dist; y = 900 + math.sin(P_ANG[k])*dist + 60*tp*tp
                col = (ORANGE, OR_L, CREAM)[P_COL[k]]
                sh.circle(x, y, P_SIZE[k]*(1 - tp/P_LIFE[k]), fill=rgba(col, 1 - tp/P_LIFE[k]))

    # ---------------- outro: the dot finds its place in the F
    if t >= OUT_T:
        p_top = eback(prog(t, OUT_T + 0.55, 0.6), 1.3); p_mid = eback(prog(t, OUT_T + 0.7, 0.6), 1.3)
        paste(cv, L_TOP, LX - 520*(1 - p_top), LY, clamp(p_top*1.4))
        paste(cv, L_MID, LX - 520*(1 - p_mid), LY, clamp(p_mid*1.4))
        pr = eo(prog(t, OUT_T + 1.0, 0.7))
        paste(cv, L_REST, LX, LY + (1 - pr)*40, pr)
        ps = eo(prog(t, OUT_T + 1.7, 0.7))
        paste(cv, SLOGAN[0], (W - SLOGAN[0].width)/2, 1260 + (1 - ps)*16, ps*0.85)
        arrived = prog(t, OUT_T + 0.85, 0.12)
        if arrived > 0: paste(cv, L_DOT, LX, LY, arrived)

    # ---------------- the dot itself (drawn last, on top)
    if r > 0.5 and not (t >= OUT_T + 0.97):
        glow(cv, dx + camx, dy + camy, r*7, ga)
        sh.circle(dx + camx, dy + camy, r, fill=ORANGE + (255,))
    sh.done(cv)

    # chrome: label + progress line
    ca = prog(t, 0.4, 0.6) * (1 - smooth(OUT_T, OUT_T + 0.4, t))
    if ca > 0:
        im, pd = TAG; paste(cv, im, 70 - pd, 86 - pd, ca*0.8)
        im2, pd2 = TAGN; paste(cv, im2, 70 + im.width - 2*pd + 14 - pd2, 86 - pd2, ca)
        d = ImageDraw.Draw(cv)
        d.rectangle([70, 1838, W - 70, 1840], fill=(255, 255, 255, int(40*ca)))
        d.rectangle([70, 1838, 70 + (W - 140)*t/DUR, 1840], fill=ORANGE + (int(255*ca),))

    # flash at the drop
    f1 = 1 - prog(t, DROP1, 0.22)
    if t >= DROP1 and f1 > 0: cv.alpha_composite(Image.new('RGBA', (W, H), (255, 220, 190, int(90*f1**2))))
    f3 = 1 - prog(t, FINAL, 0.3)
    if t >= FINAL and f3 > 0: cv.alpha_composite(Image.new('RGBA', (W, H), (255, 220, 190, int(70*f3**2))))
    fl = 1 - prog(t, DROP, 0.28)
    if t >= DROP and fl > 0: cv.alpha_composite(Image.new('RGBA', (W, H), (255, 236, 214, int(200*fl**2))))
    out = cv.convert('RGB')
    z = 1 + 0.014*bp_ + (0.02*math.exp(-(t - DROP1)*6) if t >= DROP1 else 0)
    if z > 1.002:
        cw, ch_ = W/z, H/z
        out = out.resize((W, H), Image.BILINEAR, box=((W - cw)/2, (H - ch_)/2, (W + cw)/2, (H + ch_)/2))
    out = ImageChops.multiply(out, VIGNETTE)
    out = Image.blend(out, GRAIN[i % len(GRAIN)], 0.045)
    fo = smooth(DUR - 0.9, DUR - 0.05, t)
    if fo > 0: out = Image.blend(out, Image.new('RGB', (W, H), (0, 0, 0)), fo)
    fi = 1 - prog(t, 0, 0.35)
    if fi > 0: out = Image.blend(out, Image.new('RGB', (W, H), (0, 0, 0)), fi)
    return out.tobytes()

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'stills':
        os.makedirs(os.path.join(B, 'stills'), exist_ok=True)
        for tt in map(float, sys.argv[2:]):
            Image.frombytes('RGB', (W, H), frame(int(tt*FPS))).save(os.path.join(B, 'stills', f'{tt:05.2f}.png'))
    else:
        n = int(DUR*FPS); out = sys.argv[2]
        ff = subprocess.Popen(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                               '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', os.path.join(B, 'mix.wav'),
                               '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
                               '-af', 'loudnorm=I=-14:TP=-1.5:LRA=7', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                               '-movflags', '+faststart', '-shortest', out], stdin=subprocess.PIPE)
        with Pool(4) as pool:
            for k, fb in enumerate(pool.imap(frame, range(n), chunksize=4)):
                ff.stdin.write(fb)
                if k % 150 == 0: print(k, '/', n, flush=True)
        ff.stdin.close(); ff.wait(); print('done', out)
