---
name: motion-studio
description: Fabrique des vidéos de motion design MP4 (reels, TikTok, statuts WhatsApp, spots 16:9, animations de logo, typographie animée, promos 6-30 s) à partir d'une animation HTML/CSS ou GSAP, rendue image par image avec musique, voix off et normalisation du son. À utiliser pour toute animation ou vidéo graphique sans tournage.
---

# Motion Studio — animation HTML → vidéo MP4

Moteur : `scripts/animer.mjs` (Playwright + ffmpeg). Rendu déterministe image par image, H.264 yuv420p (accepté par
WhatsApp, Instagram, TikTok, Facebook), son normalisé en deux passes (-14 LUFS par défaut).

```bash
S=.claude/skills/motion-studio/scripts/animer.mjs
node $S anim.html anim.mp4 --apercu 4.5                      # une image PNG à 4,5 s : vérifier vite
node $S anim.html anim.mp4 --format story --planche          # vidéo + planche contact (1 image/s)
node $S anim.html anim.mp4 --musique musique.mp3 --voix voix.mp3 --voix-debut 0.4
node $S anim.html anim.mp4 --format paysage --duree 30 --fps 25
```

## Méthode

1. **Script d'abord** (agent `concepteur-redacteur`) : une phrase par scène, durée par scène, texte à l'écran ≤ 7 mots.
2. **Storyboard** : tableau scène / durée / texte / mouvement / son (modèle `agence/modeles/storyboard.md`).
3. **Partir de `modeles/promo-12s.html`** : 4 scènes (accroche 0–3 s, bénéfices, offre, signature logo + WhatsApp).
   Chaque `.scene` a `--debut` / `--fin` ; chaque élément animé a une classe (`monte`, `zoom`, `trait`) et un `--d` (délai).
   Ajouter ses propres `@keyframes` librement. Durée totale : `<meta name="duree" content="12">`.
4. **Vérifier par aperçus** (`--apercu`) aux moments clés, puis rendre avec `--planche` et regarder la planche (Read).
5. **Son** : voix off avec la voix « FOR LIFE voix off » (`bash voixoff/forlife_voixoff.sh texte.txt voix.mp3`, voir
   `CLAUDE.md`), musique libre de droits uniquement. Caler les scènes sur la voix : mesurer sa durée
   (`ffprobe -v error -show_entries format=duration -of csv=p=0 voix.mp3`) et ajuster `--debut/--fin`.
6. **Livrer** MP4 + planche + script dans `projets/<client>/<projet>/livrables/`.

## Principes de motion de la marque Forlife

- Easing signature `cubic-bezier(.2,.8,.2,1)` : entrée rapide, arrivée douce. Pas de rebonds gadgets.
- Mouvement dès l'image 0 (l'accroche se joue dans la première seconde). Une idée par scène.
- Texte lisible au moins 1,5 s (règle : 3 mots/seconde de lecture max). Signature finale ≥ 2 s.
- Formes de marque : pilules arrondies et cercle orange (issues du symbole du logo), fond charbon chaud.
- Sous-titres obligatoires dès qu'il y a une voix (85 % des vidéos sont vues sans le son).
- Formats : 9:16 par défaut (reels, TikTok, statuts) ; 1:1 ou 4:5 pour le fil ; 16:9 pour YouTube/écrans d'événement.

## Méthodes d'animation acceptées

- **CSS** `@keyframes` + `animation-delay` (le plus simple, piloté automatiquement).
- **GSAP** : charger `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js` ou une copie locale ; timeline globale pilotée.
- **`window.rendu = t => {…}`** : pour compteurs, canvas, particules, tout calcul au temps `t` (secondes).
- Éviter : `setTimeout`/`setInterval`/`requestAnimationFrame` libres (non déterministes), vidéos `<video>` intégrées
  (préférer assembler ensuite avec ffmpeg).

## Pour aller plus loin

- Montage de rushs (interview, face caméra, événements) : agent `monteur-video` + skill `short-editing`.
- Films commerciaux plus ambitieux (images IA + motion + boucle critique) : lire
  `agence/bibliotheque/motion-video/business-motion-film/SKILL.md`.
- Remotion (vidéo en React) : optionnel, voir `agence/installer-extras.sh`.
