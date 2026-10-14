import json, os
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
W, H = 1080, 1920
KX, KY = W / 478, H / 850
INTRO = 1.6          # seconds of intro before the source starts
MAIN_END = 62.2      # source time where the outro takes over
OUTRO = 3.4
TOTAL = INTRO + MAIN_END + OUTRO
CUTS = [1.733, 4.467, 18.15, 26.7]   # source-time shot changes

CAPS = json.load(open(os.path.join(S, "build", "captions.json")))
# clamp word timings inside each caption window
for i, c in enumerate(CAPS):
    hi = c["e"] - 0.08
    if i + 1 < len(CAPS):
        hi = min(hi, CAPS[i + 1]["s"] - 0.02)
    lo = c["s"] + 0.02
    prev = lo
    for w in c["words"]:
        w["t0"] = min(max(w["t0"], prev), hi)
        prev = w["t0"]
    for k, w in enumerate(c["words"]):
        w["t1"] = c["words"][k + 1]["t0"] if k + 1 < len(c["words"]) else max(w["t0"] + 0.3, min(c["e"], hi + 0.08))


def word_time(ci, wi):
    return CAPS[ci]["words"][wi]["t0"]


# big kinetic words: (source time, text, layout) ; layout 'wide' => lower in frame
HEROES = [
    (word_time(3, 0), "JE CHOISIS", "wide"),
    (word_time(4, 1), "D'AIMER DIEU", "wide"),
    (word_time(8, 3), "LE CIEL", "wide"),
    (word_time(10, 7), "L'ADORATION", "close"),
    (word_time(12, 3), "POUR QUI IL EST", "close"),
    (word_time(18, 5), "LE DERNIER MOT", "close"),
    (word_time(21, 6), "L'IMPOSSIBLE", "close"),
    (word_time(23, 7), "ÉTERNITÉ", "close"),
]
HERO_DUR = 1.55

# camera segments (src t0, t1, z0, z1)
CAM = [
    (0.0, 1.733, 1.04, 1.10),
    (1.733, 2.40, 1.00, 1.03), (2.40, 4.467, 1.14, 1.18),
    (4.467, 9.70, 1.00, 1.12), (9.70, 11.9, 1.18, 1.20), (11.9, 18.15, 1.08, 1.25),
    (18.15, 22.0, 1.00, 1.10), (22.0, 25.0, 1.16, 1.22), (25.0, 26.7, 1.24, 1.25),
    (26.7, 27.9, 1.00, 1.03), (27.9, 28.6, 1.18, 1.20), (28.6, 30.4, 1.06, 1.10),
    (30.4, 31.7, 1.16, 1.18), (31.7, 33.4, 1.02, 1.06), (33.4, 35.2, 1.20, 1.22),
    (35.2, 38.5, 1.06, 1.12), (38.5, 39.3, 1.22, 1.22), (39.3, 42.5, 1.04, 1.12),
    (42.5, 43.85, 1.10, 1.12), (43.85, 44.6, 1.22, 1.24), (44.6, 46.3, 1.04, 1.06), (46.3, 47.8, 1.12, 1.12),
    (47.8, 49.8, 1.00, 1.04), (49.8, 53.6, 1.06, 1.20), (53.6, 56.2, 1.08, 1.10),
    (56.2, 59.7, 1.00, 1.18), (59.7, 61.5, 1.22, 1.24), (61.5, 62.3, 1.24, 1.12),
]
SHOT_CY = [(0, 0.42), (1.733, 0.40), (4.467, 0.45), (18.15, 0.50), (26.7, 0.40)]
