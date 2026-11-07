# Agence d'agents Forlife Com'

Un studio de création complet dans Claude Code : **22 agents spécialisés**, **6 skills maison** (dont deux moteurs de
production qui fabriquent de vrais fichiers), **13 skills de montage vidéo** et **une bibliothèque de 85 guides
d'experts** importés de GitHub — le tout adapté à Forlife Com', au marché ivoirien et à la charte orange/charbon.

## Comment s'en servir

Ouvrir Claude Code à la racine du dépôt et demander simplement, en français :

> « Prépare la campagne rentrée de l'école Les Flamboyants : affiche A3, 50 tee-shirts DTF, 8 posts et une pub Meta. »

Claude applique le skill `agence-forlife` : brief → stratégie → concept → production en parallèle → contrôle qualité,
en lançant les bons agents. On peut aussi appeler un agent précis :

> « Utilise l'agent graphiste pour faire un flyer A5 de l'offre Ouverture Commerce. »
> « Agent community-manager : calendrier de décembre pour la page Forlife. »
> « Agent motion-designer : logo animé de 3 secondes pour Forlife. »

Rien n'est publié, envoyé au client ni payé (publicité) sans votre accord explicite.

## L'équipe

| Pôle | Agents |
|---|---|
| Direction & commercial | `directeur-creation` · `chef-de-projet` · `business-developer` |
| Stratégie & performance | `strategiste-marketing` · `media-buyer` (Meta/TikTok Ads) · `analyste-performance` · `redacteur-seo` |
| Contenu | `community-manager` · `concepteur-redacteur` · `relations-presse-evenementiel` · `formateur` |
| Création visuelle | `directeur-artistique` · `designer-identite` · `graphiste` · `designer-web-ui` · `illustrateur` · `prompt-engineer-visuel` |
| Audiovisuel | `realisateur-photo-video` · `monteur-video` · `motion-designer` · `sound-designer-voix-off` |
| Qualité | `brand-guardian` (passe en dernier sur chaque livrable) |

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

## À faire une fois pour rendre le système encore plus juste

1. **Tarifs** : copier `agence/contexte/tarifs.exemple.md` en `agence/contexte/tarifs.md` et le remplir (reste privé).
   Sans cela, les agents écrivent « [à chiffrer] » au lieu d'inventer des prix.
2. **Matériel** : compléter `agence/contexte/materiel.md` (optiques, lumières, micros, logiciels).
3. **Équipe** : compléter la ligne « Équipe humaine » de `agence/contexte/brand-profile.md` (qui valide quoi).
4. **Vos clients réguliers** : demander « crée le profil client de … » (skill `brief-creatif`).
5. **Montage vidéo** : `bash agence/installer-extras.sh montage` puis `/studio-setup` (≈ 15 min, une fois par machine).
6. **Optionnel** : skills Remotion (`bash agence/installer-extras.sh remotion`).

## Connecteurs utiles (claude.ai)

Selon votre compte : **Figma** (maquettes), **ElevenLabs** (images, vidéos, voix, musique IA — consomme des crédits),
**Motion Creative Analytics** (performance des pubs Meta), **TikTok for Business**, Google Drive, Gmail, Notion.
Les agents les utilisent quand ils sont connectés.

## Mettre à jour les guides importés

`bash agence/mettre-a-jour-bibliotheque.sh` — sources, versions et licences dans `agence/SOURCES.md`.
