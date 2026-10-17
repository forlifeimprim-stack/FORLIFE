# Dossier Google / YouTube

Projet Google Cloud : **AI Growth et Creative OS** (`ai-growth-et-creative-os`, n° 126376919374).
Client OAuth : `126376919374-j4g7lchebl3jn7vsonht46tbu78116ln.apps.googleusercontent.com`.

Trois démarches distinctes, dans cet ordre :

1. **Publier l'écran de consentement**, puis **vérification de la marque** (nom, logo, domaine).
2. **Vérification des autorisations sensibles** (`youtube.upload`, `youtube.readonly`).
3. **Audit YouTube API Services** (conformité + augmentation du quota).

Aujourd'hui l'écran de consentement est en mode **Test** : 100 testeurs maximum, et chaque testeur doit se
reconnecter tous les 7 jours.

## Prérequis : domaine vérifié

Google exige que la page d'accueil, la politique de confidentialité et les adresses de retour soient sur un
**domaine dont vous prouvez la propriété** dans la [Search Console](https://search.google.com/search-console).

- Avec `forlifecomai.ci` (recommandé) : Search Console → Ajouter une propriété → Domaine → enregistrement TXT
  dans Cloudflare.
- Avec `ai-growth-et-creative-os.web.app` : propriété « Préfixe d'URL » vérifiée par fichier HTML. Envoyez-moi le
  nom du fichier fourni par Google : je le publie sur le site.

Le compte Google qui vérifie le domaine doit être **propriétaire ou éditeur du projet** Google Cloud.

## Étape 1 — Écran de consentement OAuth (APIs & Services → OAuth consent screen / Google Auth Platform)

| Champ | Valeur |
|---|---|
| App name | Forlife Com |
| User support email | votre email professionnel |
| App logo | [`assets/icone-1024.png`](assets/icone-1024.png) (Google demande 120 × 120 : [`icone-192.png`](assets/icone-192.png) est accepté et réduit) |
| Application home page | `https://ai-growth-et-creative-os.web.app` |
| Privacy policy | `https://ai-growth-et-creative-os.web.app/confidentialite` |
| Terms of service | `https://ai-growth-et-creative-os.web.app/conditions` |
| Authorized domains | `web.app` n'est pas accepté seul : utilisez `forlifecomai.ci` dès qu'il est actif |
| Developer contact | votre email professionnel |
| Scopes | `.../auth/youtube.upload`, `.../auth/youtube.readonly` |

Puis **Publishing status → Publish app** (passage en Production). Google ouvre alors la vérification.

## Étape 2 — Justification des autorisations (en anglais)

**youtube.upload**
> Forlife Com lets small businesses create short vertical marketing videos (10–15 s) in its Video Studio. After an
> authorized team member approves a video, the user schedules it; at the scheduled time our server uploads the
> approved MP4 to the user's own YouTube channel with videos.insert (resumable upload), with the title and
> description written and approved by the user. Videos are uploaded as private until our YouTube API audit is
> completed. Nothing is uploaded without explicit human approval.

**youtube.readonly**
> We read the connected channel (channels.list mine=true) to show which channel is connected, and the user's
> uploaded videos with their public statistics (playlistItems.list on the uploads playlist, videos.list with
> statistics) to show results in the Analytics & ROI dashboard and in the "Analyze my networks" report. When the
> user pastes the link of a public channel (@handle), we read that channel's public information and public
> video statistics for the user's own analysis. Statistics are refreshed hourly while relevant and deleted after
> 30 days without refresh.

**Pourquoi une autorisation plus restreinte ne suffit pas** (question posée par Google) :
> youtube.upload is the narrowest scope that allows uploading a video. youtube.readonly is needed to list the
> user's own channel and uploaded videos (mine=true), which is not possible with an API key alone.

## Étape 3 — Vidéo de démonstration (sur YouTube, en « Non répertoriée »)

Google exige :
- l'écran de consentement **en anglais** ;
- l'**URL complète** visible, avec le `client_id` ;
- l'usage concret de chaque autorisation.

| # | Écran | Ce que l'on montre |
|---|---|---|
| 1 | Page d'accueil Forlife Com | Le nom et le logo « Forlife Com », le lien vers la politique de confidentialité |
| 2 | Connexion au compte de démonstration, puis Social Hub | Clic sur **Connecter** sur la tuile YouTube |
| 3 | Écran de consentement Google | **Langue anglaise** ; zoom sur la barre d'adresse (client_id) et sur la liste des autorisations ; Continuer |
| 4 | Retour Social Hub | Chaîne connectée (**youtube.readonly**) |
| 5 | Video Studio | Vidéo 9:16 terminée et approuvée, programmation sur la chaîne |
| 6 | Social Hub → Historique | Statut **Publié** et lien `youtu.be/...` |
| 7 | YouTube Studio | La vidéo envoyée sur la chaîne (**youtube.upload**) |
| 8 | Analyser mes réseaux | Lien de la chaîne `youtube.com/@...`, résultats et statistiques (**youtube.readonly**) |
| 9 | Analytics & ROI | Vues de la vidéo |
| 10 | Politique de confidentialité | Défilement jusqu'à la section « Données Google et YouTube » (Limited Use, lien de révocation) |
| 11 | Social Hub, puis myaccount.google.com/permissions | Déconnexion, puis retrait de l'accès |

## Étape 4 — Audit YouTube API Services (quota)

Formulaire : « YouTube API Services — Audit and Quota Extension Form » (support.google.com/youtube → API audit).

**Pourquoi c'est indispensable** : le quota gratuit est de 10 000 unités par jour **pour toute l'application**, et
un envoi de vidéo coûte environ 1 600 unités. Cela représente environ **6 envois par jour pour l'ensemble de vos
clients**. Tant que l'audit n'est pas passé, l'API force aussi les vidéos envoyées en **privé**.

Éléments à fournir :
- l'usage : publication de vidéos marketing validées pour des PME, plus des statistiques ;
- le volume estimé : par exemple 200 envois par jour à 12 mois, soit environ 350 000 unités par jour (à ajuster à
  vos prévisions) ;
- la conformité : liens vers les conditions YouTube et les règles Google dans la politique, révocation, données
  supprimées après 30 jours, aucune donnée vendue ;
- la vidéo de l'étape 3 et le compte de démonstration.

Après l'audit, je passe `YOUTUBE_PRIVACY` à `public` dans la configuration.

## Option : lecture des chaînes sans chaîne connectée

Pour que « Analyser mes réseaux » lise une chaîne YouTube publique même quand le client n'a pas connecté de
chaîne :

1. Google Cloud → APIs & Services → Identifiants → **Créer une clé API**.
2. Restreignez-la : API → **YouTube Data API v3** uniquement.
3. Rangez-la dans Secret Manager sous le nom `forlife-youtube-key`, en lui donnant au moins une version. Ajoutez
   le droit d'accès du compte de service, comme pour les autres secrets.
4. Dites-le-moi : j'ajoute `YOUTUBE_API_KEY=forlife-youtube-key` à la configuration du déploiement.

## Motifs de refus fréquents

- Domaine non vérifié, ou page d'accueil qui ne présente pas l'application : la page de connexion présente
  Forlife Com et renvoie vers les pages légales.
- Écran de consentement filmé dans une autre langue que l'anglais.
- Politique de confidentialité sans mention de l'« utilisation limitée » : c'est fait.
- Autorisation demandée mais non montrée dans la vidéo.
