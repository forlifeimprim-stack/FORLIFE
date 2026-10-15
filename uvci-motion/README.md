# Motion design UVCI — « Mon université avec moi »

Spot de 50 s (1920×1080, 30 i/s) pour encourager les bacheliers à s'inscrire à l'Université Virtuelle de Côte d'Ivoire.

| Fichier | Rôle |
|---|---|
| `uvci-motion-design.mp4` | Vidéo finale, prête pour Facebook, YouTube et WhatsApp |
| `index.html` | Version web interactive (autonome : polices et son intégrés) |
| `voix-off.mp3` | Voix off seule (ElevenLabs, voix « LyLyPodcast ») |
| `bande-son.mp3` | Mixage final : voix off + musique |
| `src/template.html` | Source de l'animation (canvas, rendu déterministe `render(t)`) |
| `tools/` | Musique générée (`music.py`), assemblage (`build.py`), rendu MP4 (`render.mjs`), images clés (`frames.mjs`) |

## Découpage (calé sur la voix off)
1. **0–4 s** : une salle de classe en fil de fer… qui éclate en particules sur « sans murs ».
2. **4–9 s** : les particules forment un smartphone avec l'espace étudiant (« elle vient à toi »), puis zoom à travers l'écran.
3. **9–12 s** : révélation du logotype UVCI, barre tricolore, nom complet.
4. **12–16 s** : Publique · 100 % en ligne · métiers du numérique.
5. **16–28 s** : carrousel des 6 spécialités, puis la nouveauté IA & robotique (réseau de neurones).
6. **28–36 s** : parcours Licence → Master → Doctorat, carte de Côte d'Ivoire où l'UVCI rejoint chaque ville.
7. **36–40 s** : slogan « Mon université avec moi. Partout. Et à tout moment. »
8. **40–50 s** : saisie de « uvci.online », clic sur « S'inscrire », confettis, carton final.

## Régénérer
```bash
python3 tools/music.py /tmp/music.wav           # musique (numpy + scipy)
# mixage voix + musique → bande-son.mp3 (voir commande ffmpeg dans l'historique)
python3 tools/build.py                           # index.html autonome
PW=$(npm root -g)/playwright node tools/render.mjs index.html bande-son.mp3 uvci-motion-design.mp4
```
