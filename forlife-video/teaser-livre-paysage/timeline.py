"""Timeline partagée (audio + image). 96 BPM : temps = 0,625 s, mesure = 2,5 s.
Écrit cues.js (mots horodatés absolus) pour la page HTML."""
import json, os

BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 52.5            # 21 mesures
DROP = 37.5           # révélation du livre (mesure 15)

# début de chaque réplique de voix off (s) — calé pour que les mots clés tombent sur les temps
VO = {
    "01": 1.25,   # Avant de monter au ciel…
    "02": 6.63,   # Il a dit : « Faites des disciples. »  (Faites = 7,50)
    "03": 9.60,   # des membres… des disciples
    "04": 14.40,  # une personne ne grandit jamais seule…
    "05": 19.90,  # Vingt-sept cours           (= 20,0)
    "06": 22.40,  # Trente et un cas pratiques (= 22,5)
    "07": 24.90,  # Vingt et une fiches        (= 25,0)
    "08": 28.75,  # pasteurs, anciens, diacres, couples
    "09": 33.30,  # une âme, ou un foyer
    "10": 38.30,  # Faire des disciples et des familles…
    "11": 41.90,  # Par Kouadio Koffi Elisée
    "12": 45.00,  # « Moi et ma maison… »
}

HERE = os.path.dirname(os.path.abspath(__file__))


def words():
    out = {}
    for k, t0 in VO.items():
        w = json.load(open(f"{HERE}/audio/vo/{k}.json", encoding="utf-8"))
        out[k] = [{"w": x["w"], "t": round(t0 + x["t"], 3), "e": round(t0 + x["t"] + x["d"], 3)} for x in w]
    return out


if __name__ == "__main__":
    W = words()
    with open(f"{HERE}/cues.js", "w", encoding="utf-8") as f:
        f.write("// généré par timeline.py — ne pas éditer\n")
        f.write(f"window.CUES = {json.dumps(W, ensure_ascii=False)};\n")
        f.write(f"window.DUR = {DUR}; window.BEAT = {BEAT}; window.DROP = {DROP};\n")
    for k, v in W.items():
        print(k, " ".join(f"{x['w']}@{x['t']:.2f}" for x in v))
