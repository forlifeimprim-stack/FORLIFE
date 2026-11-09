"""Piste d'effets du film « Toute une équipe marketing » : sons chauds synthétisés (kit saas-motion-video,
tools/warm_sfx.py), placés sur la grille du storyboard. Usage : python audio/equipe-sfx.py <warm_sfx.py> <sortie.wav>"""
import importlib.util, sys
import numpy as np
import soundfile as sf

spec = importlib.util.spec_from_file_location("warm", sys.argv[1]); w = importlib.util.module_from_spec(spec); spec.loader.exec_module(w)
SR, N = w.SR, w.NOTE
pop = w.room(w.marimba(N["G5"], 0.3, 0.5)); low = w.room(w.marimba(N["C4"], 0.5, 0.2)); tick = w.room(w.woodblock(1100))
paper = w.room(w.woodblock(420, 0.14)); confirm = w.room(w.seq((0, w.marimba(N["E5"], 0.4)), (0.09, w.marimba(N["G5"], 0.5))))
reveal = w.room(w.seq((0, w.marimba(N["C5"], 0.6)), (0.07, w.marimba(N["E5"], 0.6)), (0.14, w.marimba(N["G5"], 0.7)), (0.21, w.marimba(N["C6"], 0.9))))
norm = lambda x: x / (np.abs(x).max() + 1e-9)
out = np.zeros(SR * 30)
def put(at, s, g):
    i = int(at * SR); s = norm(s) * g; j = min(len(out), i + len(s)); out[i:j] += s[: j - i]
for k, at in enumerate([0.25, 0.75, 1.25, 1.75, 2.5, 3.0, 3.5, 4.0]): put(at + 0.33, paper, 0.35 + 0.03 * k)   # post-it posés
put(2.9, low, 0.5); put(4.0, low, 0.6)                                   # tampons
put(6.0, reveal, 0.55)                                                    # sous-verre sur le drop
for i in range(6): put(7.7 + i * 0.25, pop, 0.32)                         # badges
for k in range(15): put(13.2 + k * 0.1, tick, 0.12)                       # saisie
for k in range(3): put(15.0 + k * 0.4, pop, 0.3)                          # créations
put(18.0, confirm, 0.6)                                                   # Valider
for i in range(5): put(19.3 + i * 0.08, tick, 0.25)                       # réseaux cochés
for k in range(4): put(19.9 + k * 0.15, tick, 0.2)                        # tic de l'horloge
for at in (20.6, 21.6, 22.6): put(at, pop, 0.4); put(at + 0.05, low, 0.2) # notifications
put(26.6, reveal, 0.45)                                                   # bloc marque
sf.write(sys.argv[2], (out / max(1.0, np.abs(out).max()) * 0.8).astype(np.float32), SR)
