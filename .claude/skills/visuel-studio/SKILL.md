---
name: visuel-studio
description: Produit de vrais fichiers visuels (PNG, JPG, PDF imprimeur) à partir de HTML/CSS au format exact — posts et stories Facebook/Instagram/TikTok/WhatsApp, flyers, affiches, roll-up, bâches, cartes de visite, faire-parts, menus, transferts DTF — avec fond perdu, police Poppins intégrée et contrôle des débordements. À utiliser dès qu'il faut livrer un visuel fini, pas seulement le décrire.
---

# Visuel Studio — du HTML au fichier prêt à publier ou à imprimer

Moteur : `scripts/rendre.mjs` (Playwright + Chromium). Police Poppins 400→900 injectée automatiquement.

```bash
node .claude/skills/visuel-studio/scripts/rendre.mjs --formats                                   # tous les formats
node .claude/skills/visuel-studio/scripts/rendre.mjs page.html sortie.png --format post            # 1080×1350
node .claude/skills/visuel-studio/scripts/rendre.mjs page.html sortie.pdf --format a5              # PDF + 3 mm de fond perdu
node .claude/skills/visuel-studio/scripts/rendre.mjs page.html sortie.png --format affiche-a3 --dpi 300
node .claude/skills/visuel-studio/scripts/rendre.mjs page.html sortie.png --taille 1200x628        # taille libre
node .claude/skills/visuel-studio/scripts/rendre.mjs flyer.html apercu.jpg --format a5 --dpi 150 --rogner  # aperçu au format fini
```

- **PDF impression** : format exact au millimètre, fond perdu 3 mm, **traits de coupe et ligne de repère** ajoutés
  automatiquement autour (`--sans-traits` pour un PDF nu).
- **Logo officiel Forlife** : écrire `<img data-forlife-logo="horizontal" style="height:60px">` (ou `vertical`, `symbole`) ;
  le moteur insère le SVG de `assets/logo/` tel quel. Options : `data-texte="#1A1A1A"` (nom en charbon sur fond clair),
  `data-sans-slogan` (sans la phrase d'accroche, pour les petites tailles). Ne jamais redessiner le logo.
- **Contraste** : jamais de texte blanc sur l'orange `#EA7822` (2,9:1) ni d'orange sur crème pour du texte (2,7:1) ;
  texte charbon `#1A1A1A` sur orange (6:1).
- **Typographie française** : `&nbsp;` avant « : ; ? ! », dans les numéros (`05&nbsp;85&nbsp;80&nbsp;18&nbsp;56`) et entre
  nombre et unité (`24&nbsp;h`, `15&nbsp;000&nbsp;FCFA`) ; apostrophe typographique ’ dans les textes.

## Méthode

1. **Lire le brief** (`projets/<client>/<projet>/brief.md`) et la charte (`agence/contexte/brand-profile.md` pour Forlife,
   `clients/<client>/brand-profile.md` pour un client). Pas de charte client → demander logo + couleurs, sinon proposer.
2. **Partir d'un modèle** de `modeles/` (copie dans le dossier du projet) :
   - `post-promo.html` — post 4:5 offre + appel WhatsApp
   - `story-annonce.html` — story / statut 9:16 avec zones de sécurité (`<body class="repere">` pour les voir)
   - `flyer-a5.html` — flyer impression, unités mm, zone sûre, fond perdu
3. **Composer** : grille simple, 1 message principal, hiérarchie en 3 niveaux (titre ≥ 3× le texte courant),
   contraste AA minimum, le logo et le contact toujours lisibles. Images : chemins relatifs au fichier HTML
   (`assets/images/portfolio/…` contient les vraies réalisations Forlife).
4. **Rendre**, puis **regarder le résultat** (ouvrir le PNG avec l'outil Read) : corriger tout texte coupé,
   tout ce que le contrôle qualité signale, et vérifier la lisibilité en miniature (le fil Facebook affiche ~400 px de large).
5. **Décliner** : un même HTML, plusieurs formats (`--format post`, puis `story`, puis `carre`) — utiliser
   `var(--page-l)` / `var(--page-h)` et la classe `html.format-<nom>` pour adapter la mise en page.
6. **Livrer** dans `projets/<client>/<projet>/livrables/` avec un nom clair :
   `AAAA-MM-JJ_client_support_format_v1.png`.

## Règles impression (Forlife Imprim imprime sur place)

- Le PDF est le fichier de référence pour l'atelier ; PNG 300 dpi pour les petits formats, 100–150 dpi pour bâches/roll-up
  (vus de loin). Fond perdu 3 mm (automatique), éléments importants à 5 mm du bord de coupe (8 mm en tout depuis le bord de page).
- Rendu en RVB : signaler à l'atelier les aplats orange `#EA7822` à caler (équivalent CMJN approximatif 0/60/95/0 — à vérifier
  sur épreuve). Le noir de fond : noir riche à l'atelier.
- Roll-up : les 10 cm du bas sont cachés par le pied ; rien d'important sous 15 cm. Bâche : textes énormes, 7 mots max,
  lisible à 20 m.
- DTF (textile) : fond **transparent** (ne pas mettre de background sur body), PNG, 300 dpi, pas de traits < 0,5 mm,
  pas de dégradés vers la transparence (rendu imprévisible), couleurs vives.
- Faire-part / prestige : or `#D9AC4E` + noir profond ; prévoir la variante dorure/vernis si demandée.

## Règles réseaux sociaux

- 4:5 (post) pour le fil, 9:16 (story) pour statut WhatsApp / stories / couverture reel, 1:1 pour catalogue WhatsApp.
- Texte ≤ 20 % de la surface pour les visuels publicitaires (performance Meta), 1 appel à l'action.
- Story : rien d'important dans les 250 px du haut et 340 px du bas.
- Carrousel : un HTML par slide (`slide-01.html`…), même gabarit, la slide 1 est une accroche, la dernière un appel à l'action.

## Aller plus loin

- Illustrations vectorielles : SVG directement dans le HTML (voir agent `gnaore-illustrateur`).
- Images générées par IA : agent `kady-prompt-engineer-visuel` ; intégrer ensuite l'image comme fond ou détourage.
- Maquettes dans Figma : outils MCP Figma (`use_figma`, `generate_image`) si l'utilisateur travaille dans Figma.
- Animation de ce visuel : skill `motion-studio` (même HTML + keyframes).
