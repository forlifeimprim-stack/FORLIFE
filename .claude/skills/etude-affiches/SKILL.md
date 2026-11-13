---
name: etude-affiches
description: Fait étudier un lot d'affiches et de visuels (réalisations de l'agence, travaux clients, références extérieures) par l'équipe création — préparation automatique (numéro, palette mesurée, format, planche contact), analyse détaillée en fiches, puis synthèse dans la grammaire visuelle que les agents créatifs consultent avant chaque création. À utiliser quand l'utilisateur envoie des affiches, des exemples ou des inspirations à étudier.
---

# Étude d'affiches — nourrir la mémoire visuelle de l'agence

Tout se range dans `agence/inspiration/` :

```
a-etudier/            dépôt des images à étudier            (non versionné)
affiches/             images numérotées ref-0001.jpg…       (non versionné : droits d'auteur, dépôt public)
planches/             planches contact des lots             (non versionné)
fiches/ref-XXXX.md    une analyse par visuel                (versionné)
index.csv             catalogue : secteur, support, tags, note, statut
grammaire-visuelle.md synthèse : recettes, typos, palettes, techniques, erreurs à éviter
```

## 1. Recevoir les images

- **Pièces jointes dans la conversation** : copier chaque fichier reçu dans `agence/inspiration/a-etudier/`.
- **Dossier Google Drive** (connecteur Drive) : télécharger les images dans `a-etudier/`.
- **Archive .zip** : la décompresser dans un dossier temporaire, puis copier seulement les images dans `a-etudier/`.
- **Réalisations déjà dans le dépôt** : `assets/images/portfolio/<catégorie>/` peut être étudié directement (étape 2, `--garder`).

Demander l'**origine** si elle n'est pas claire : nos réalisations (`forlife`), fournies par un client (`client:<nom>`),
ou références extérieures (`externe` : autres agences, affiches vues en ville, internet).

## 2. Préparer le lot (automatique)

```bash
node .claude/skills/etude-affiches/scripts/preparer.mjs --source forlife
node .claude/skills/etude-affiches/scripts/preparer.mjs --source "client:ecole-les-flamboyants"
node .claude/skills/etude-affiches/scripts/preparer.mjs assets/images/portfolio/design --source forlife --garder
```

Chaque image reçoit un numéro, une fiche pré-remplie (dimensions, format probable, palette mesurée) et une ligne dans
`index.csv`. Les doublons (même nom de fichier, même origine) sont ignorés. Regarder la planche contact produite (Read).

## 3. Analyser (en parallèle)

Répartir les fiches entre les agents de création, **par lots de 5 à 8 visuels** et en parallèle (un seul message,
plusieurs appels Agent), en donnant à chacun les numéros et ce prompt type :

> Étudie les visuels ref-00XX à ref-00YY. Pour chacun : ouvre l'image `agence/inspiration/affiches/<id>.*` avec Read
> (zoome si besoin : extraits recadrés avec Playwright ou ImageMagick), remplis toutes les sections de
> `agence/inspiration/fiches/<id>.md` (remplacer les [crochets], titre compris), passe le statut à « analysée », et
> complète la ligne de `agence/inspiration/index.csv` (secteur, type_support, tags séparés par « ; », note_sur_5 = moyenne,
> statut = analysee). Sois précis et concret, cite ce que tu vois. Réponds avec les 3 techniques les plus intéressantes du lot.

Répartition conseillée selon le contenu du lot :
- affiches, flyers, posts, roll-up, bâches → `aya-graphiste` et `amenan-directeur-artistique` ;
- logos, chartes, papeterie → `kouame-designer-identite` ;
- illustrations, mascottes, lettrages dessinés → `gnaore-illustrateur` ;
- visuels générés par IA, photomontages → `kady-prompt-engineer-visuel` ;
- vidéos, couvertures de reels, animations → `djeneba-motion-designer`.

## 4. Synthétiser

Quand un lot est analysé, lancer `amenan-directeur-artistique` pour mettre à jour `agence/inspiration/grammaire-visuelle.md` :
lire toutes les fiches analysées depuis la dernière synthèse, puis enrichir chaque section (recettes de mise en page par
type de support et par secteur, associations typographiques, palettes qui marchent par secteur, techniques créatives,
erreurs à éviter, idées à tester). **Chaque règle cite ses fiches** (`ref-0004, ref-0012`). Garder le document lisible :
regrouper, hiérarchiser, supprimer les doublons, noter la date de mise à jour.

## 5. Rendre compte à l'utilisateur

Nombre de visuels étudiés, les 5 enseignements majeurs, les fiches les mieux notées, et ce que l'équipe va désormais faire
différemment.

## Règles

- **S'inspirer, jamais copier** : on retient des principes (structure, rythme, contraste, idée), pas une mise en page, une
  illustration ou un slogan à reproduire. Les visuels d'autres agences restent leur propriété.
- Les images ne sont pas versionnées (dépôt public, droits d'auteur, travaux clients). Les fiches le sont : n'y écrire
  aucune donnée personnelle (téléphones, noms de particuliers, adresses privées) ; pour un travail client confidentiel,
  nommer le secteur plutôt que le client.
- Une fiche honnête vaut mieux qu'une fiche flatteuse : noter aussi les défauts (lisibilité, surcharge, fautes, contraste).
