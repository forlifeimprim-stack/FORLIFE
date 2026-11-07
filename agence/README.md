# Agence d'agents Forlife Com'

Un studio de création complet dans Claude Code : **22 agents spécialisés**, **6 skills maison** (dont deux moteurs de
production qui fabriquent de vrais fichiers), **13 skills de montage vidéo** et **une bibliothèque de 85 guides
d'experts** importés de GitHub — le tout adapté à Forlife Com', au marché ivoirien et à la charte orange/charbon.

## Comment s'en servir

Ouvrir Claude Code à la racine du dépôt et demander simplement, en français :

> « Prépare la campagne rentrée de l'école Les Flamboyants : affiche A3, 50 tee-shirts DTF, 8 posts et une pub Meta. »

Claude applique le skill `agence-forlife` : brief → stratégie → concept → production en parallèle → contrôle qualité,
en lançant les bons agents. On peut aussi s'adresser directement à un membre de l'équipe, par son prénom :

> « Aya, fais-moi un flyer A5 pour l'offre Ouverture Commerce. »
> « Awa, prépare le calendrier de décembre de la page Forlife. »
> « Djénéba, un logo animé de 3 secondes pour Forlife. »
> « Bintou, relis les visuels de la rentrée avant que je les envoie. »

Rien n'est publié, envoyé au client ni payé (publicité) sans votre accord explicite.

## L'équipe

| Pôle | Prénom | Métier | Identifiant de l'agent |
|---|---|---|---|
| Direction & commercial | **Yao** | Directeur de création | `yao-directeur-creation` |
| | **Adjoua** | Cheffe de projet | `adjoua-chef-de-projet` |
| | **Souleymane** | Business developer | `souleymane-business-developer` |
| Stratégie & performance | **Gnamien** | Stratège marketing | `gnamien-strategiste-marketing` |
| | **Lacina** | Media buyer (Meta / TikTok Ads) | `lacina-media-buyer` |
| | **Affoué** | Analyste performance | `affoue-analyste-performance` |
| | **Ahou** | Rédactrice SEO | `ahou-redacteur-seo` |
| Contenu | **Awa** | Community manager | `awa-community-manager` |
| | **Zadi** | Concepteur-rédacteur | `zadi-concepteur-redacteur` |
| | **Akissi** | Événementiel & relations presse | `akissi-relations-presse-evenementiel` |
| | **Tanoh** | Formateur | `tanoh-formateur` |
| Création visuelle | **Amenan** | Directrice artistique | `amenan-directeur-artistique` |
| | **Kouamé** | Designer d'identité visuelle (logos, chartes) | `kouame-designer-identite` |
| | **Aya** | Graphiste | `aya-graphiste` |
| | **Mariam** | Designer web / UI | `mariam-designer-web-ui` |
| | **Gnaoré** | Illustrateur / dessinateur | `gnaore-illustrateur` |
| | **Kady** | Prompt engineer visuelle (images et vidéos IA) | `kady-prompt-engineer-visuel` |
| Audiovisuel | **Tiémoko** | Réalisateur photo / vidéo | `tiemoko-realisateur-photo-video` |
| | **Brou** | Monteur vidéo | `brou-monteur-video` |
| | **Djénéba** | Motion designer | `djeneba-motion-designer` |
| | **Séry** | Sound designer & voix off | `sery-sound-designer-voix-off` |
| Qualité | **Bintou** | Gardienne de la marque, contrôle qualité (passe en dernier) | `bintou-brand-guardian` |

Fiches complètes : `.claude/agents/<nom>.md` (modifiables : ce sont vos « employés », ajustez leurs consignes).

## Les outils de production (testés)

| Skill | Ce qu'il fabrique | Commande |
|---|---|---|
| `visuel-studio` | PNG/JPG/PDF au format exact : posts, stories, flyers, affiches A3→A1, roll-up, bâches, cartes de visite, faire-parts, DTF transparent ; fond perdu, Poppins intégrée, détection des textes coupés | `node .claude/skills/visuel-studio/scripts/rendre.mjs page.html sortie.pdf --format a5` |
| `motion-studio` | Vidéos MP4 animées (reels, statuts, spots 16:9, logos animés) avec musique + voix off, son normalisé à -14 LUFS, planche contact | `node .claude/skills/motion-studio/scripts/animer.mjs anim.html anim.mp4 --musique m.mp3 --voix v.mp3` |
| `short-editing` & co | Montage de prises face caméra en shorts sous-titrés (moteur tiers, à préparer une fois) | `bash agence/installer-extras.sh montage` puis `/studio-setup` |
| Voix off | Voix « FOR LIFE voix off » | `bash voixoff/forlife_voixoff.sh texte.txt sortie.mp3` |

Exemples réellement produits par ces moteurs (modèles fournis) : `agence/exemples/` (post, story, flyer PDF imprimeur, promo animée MP4).

Autres skills maison : `agence-forlife` (orchestration), `brief-creatif`, `contexte-ivoirien` (calendrier, WhatsApp,
FCFA, Mobile Money, ARTCI), `bibliotheque-agence` (catalogue des guides).

## Organisation des fichiers

```
.claude/agents/              22 agents
.claude/skills/              skills maison + montage vidéo
.claude/product-marketing.md contexte lu par les guides marketing
agence/contexte/             brand-profile.md (marque Forlife), tarifs.exemple.md, materiel.md
agence/bibliotheque/         85 guides importés (marketing-fr, reseaux-sociaux, motion-video, design-graphique)
agence/modeles/              devis, BAT, compte rendu, rétroplanning, storyboard, calendrier éditorial
agence/licences/             licences des sources
clients/<client>/            profil et fichiers de chaque client          (non versionné : dépôt public)
projets/<client>/<projet>/   brief, stratégie, concept, sources, livrables (non versionné : dépôt public)
```

`clients/` et `projets/` sont exclus de git (`.gitignore`) : ce dépôt est public et ces dossiers contiennent des
données personnelles. Les sauvegarder ailleurs (Google Drive, disque, dépôt privé).

## Installer sur votre ordinateur

Les agents marchent dès que le dépôt est ouvert dans Claude Code (application de bureau ou terminal), **sur la branche
qui contient l'agence** (tant qu'elle n'est pas fusionnée dans `main`, choisir la branche `ccr-d9bb34d6-fsdhrs`).
Les moteurs de production ont besoin de quelques outils sur la machine :

**Windows 10/11** — PowerShell, dans le dossier du dépôt :
```powershell
powershell -ExecutionPolicy Bypass -File agence\installer-windows.ps1            # Git, Node.js, FFmpeg, Playwright
powershell -ExecutionPolicy Bypass -File agence\installer-windows.ps1 -Montage   # + moteur de montage vidéo
```

**Mac / Linux** :
```bash
bash agence/installer-mac-linux.sh             # + --montage pour le moteur de montage vidéo
```

**Vérifier à tout moment** ce qui est prêt et ce qui manque : `npm run verifier` (ou `node agence/verifier.mjs`).

Voix off FOR LIFE : le pipeline tourne sous Linux. Sous Windows, passer par WSL (`wsl --install`) ou une session
claude.ai/code ; sur Mac, par une session claude.ai/code.

## À faire une fois pour rendre le système encore plus juste

1. **Tarifs** : copier `agence/contexte/tarifs.exemple.md` en `agence/contexte/tarifs.md` et le remplir (reste privé).
   Sans cela, les agents écrivent « [à chiffrer] » au lieu d'inventer des prix.
2. **Matériel** : compléter `agence/contexte/materiel.md` (optiques, lumières, micros, logiciels).
3. **Équipe** : compléter la ligne « Équipe humaine » de `agence/contexte/brand-profile.md` (qui valide quoi).
4. **Vos clients réguliers** : demander « crée le profil client de … » (skill `brief-creatif`).
5. **Montage vidéo** : installateur avec l'option montage (ci-dessus), puis `/studio-setup` dans Claude Code.
6. **Optionnel** : skills Remotion (`bash agence/installer-extras.sh remotion`).

## Connecteurs utiles (claude.ai)

Selon votre compte : **Figma** (maquettes), **ElevenLabs** (images, vidéos, voix, musique IA — consomme des crédits),
**Motion Creative Analytics** (performance des pubs Meta), **TikTok for Business**, Google Drive, Gmail, Notion.
Les agents les utilisent quand ils sont connectés.

## Mettre à jour les guides importés

`bash agence/mettre-a-jour-bibliotheque.sh` — sources, versions et licences dans `agence/SOURCES.md`.
