# Dossier TikTok — Login Kit + Content Posting API

Application TikTok : **client key `awv6vweag5ljkjxp`** (developers.tiktok.com → Manage apps).
Résultat attendu : statut **Live** (« Production »). N'importe quel utilisateur TikTok peut alors connecter son
compte, et les vidéos validées arrivent dans ses brouillons TikTok.

## Étape 1 — Informations de l'application (onglet « App details »)

| Champ | Valeur |
|---|---|
| App name | Forlife Com |
| App icon | [`assets/icone-1024.png`](assets/icone-1024.png) (TikTok demande au moins 512 × 512 : [`icone-512.png`](assets/icone-512.png)) |
| Category | Business / Marketing |
| Description | texte ci-dessous |
| Terms of Service URL | `https://forlifecomai.ci/conditions` |
| Privacy Policy URL | `https://forlifecomai.ci/confidentialite` |
| Platforms | Web — URL : `https://forlifecomai.ci` |

**Description (120 caractères max, en anglais)** :
> Forlife Com helps small businesses plan, create, approve and publish marketing videos and posts, and track results.

## Étape 2 — Produits et autorisations

| Produit | Réglage |
|---|---|
| **Login Kit** (Web) | Redirect URI : `https://forlifecomai.ci/social/callback/tiktok` |
| **Content Posting API** | Activer **« Upload »** (envoi vers les brouillons, `video.upload`). Laisser « Direct Post » **désactivé** : notre application envoie les vidéos dans la boîte de réception TikTok, l'utilisateur les publie lui-même. |

Autorisations (onglet « Scopes ») : `user.info.basic`, `video.upload`, `video.list`.
Facultatif mais recommandé : `user.info.profile`. Il permet à « Analyser mes réseaux » de vérifier que le lien
collé correspond bien au compte connecté. Si vous l'ajoutez, montrez-le dans la vidéo (étape 4, plan 8).

## Étape 3 — Justifications (champ « Explain how each scope is used », en anglais)

**user.info.basic**
> After the user connects TikTok from the Social Hub of Forlife Com, we read the open_id, display name and avatar
> to show which TikTok account is connected, so the user can choose it as a publishing destination.

**video.upload**
> Users create short vertical videos (10–15 s) in our Video Studio. After a team member approves a video, the user
> schedules it; at the scheduled time we upload the MP4 file to the user's TikTok inbox with the Content Posting
> API (inbox upload, FILE_UPLOAD). The user then receives a TikTok notification, edits the caption if needed and
> posts it from the TikTok app. We never post directly.

**video.list**
> We read the list of the user's videos and their public counts (views, likes, comments, shares) to show the
> results of videos sent from Forlife Com in the Analytics & ROI dashboard, and in our "Analyze my networks"
> feature, which reports which videos perform best.

**user.info.profile** (si demandé)
> We read the username to check that the TikTok link pasted by the user in "Analyze my networks" matches the
> connected account before analysing its videos.

## Étape 4 — Vidéo de démonstration (scénario)

TikTok exige une vidéo qui montre **chaque autorisation demandée**, de bout en bout, dans l'environnement de
test (sandbox) avec un compte TikTok ajouté comme « Target user ».

| # | Écran | Ce que l'on montre |
|---|---|---|
| 1 | Forlife Com, connexion | Connexion au compte de démonstration |
| 2 | Social Hub | Clic sur **Connecter** sur la tuile TikTok |
| 3 | Page d'autorisation TikTok | **Barre d'adresse visible** (client_key et scopes), connexion du compte TikTok, **Autoriser** |
| 4 | Retour Social Hub | Compte TikTok connecté : nom et photo (**user.info.basic**) |
| 5 | Video Studio | Une vidéo 9:16 terminée, puis le contenu associé **Approuvé** |
| 6 | Contenu → Programmer la publication | Programmation sur le compte TikTok, puis statut **Publié** dans Social Hub → Historique |
| 7 | Application TikTok (téléphone) | Notification « vidéo prête », la vidéo dans les brouillons / boîte de réception, publication par l'utilisateur (**video.upload**) |
| 8 | Analyser mes réseaux | Lien `https://www.tiktok.com/@compte`, lancement, vidéos et statistiques affichées (**video.list**, **user.info.profile**) |
| 9 | Analytics & ROI | Vues et j'aime de la vidéo |
| 10 | Social Hub | **Déconnecter** le compte TikTok |

Filmez l'ordinateur avec un logiciel de capture, et le téléphone pour le plan 7. Je peux assembler les deux.

## Étape 5 — Soumission

App → **Submit for review**. Ajoutez dans les notes :
> Test account for Forlife Com: [email] / [password]. Use the TikTok sandbox target user provided. The video shows
> each requested scope. Videos are uploaded to the creator's inbox (not direct post); the creator completes the
> post in TikTok.

## Motifs de refus fréquents

- La vidéo ne montre pas la page d'autorisation TikTok ou un des scopes : chaque scope doit être visible à l'écran.
- Le site ou la politique de confidentialité ne mentionne pas TikTok : la nôtre a une section dédiée (FR + EN).
- La description de l'app ne correspond pas à ce que montre la vidéo.
- Le nom ou l'icône rappelle TikTok : notre icône et notre nom sont propres à Forlife Com.

## Après la validation

Rien à changer dans le code. Prévenez-moi : je fais un essai réel avec un compte TikTok qui n'est pas testeur.
Une publication directe (sans passer par les brouillons) demanderait un second audit TikTok, plus exigeant.
Elle n'est pas nécessaire pour démarrer.
