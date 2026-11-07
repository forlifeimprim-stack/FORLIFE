# D05 : Diagnostic mobile de Forlife Com (Princesse, 07/11/2026)

## STATUT

TERMINÉ. Application lancée en local (API sur 4000, IA simulée, aucun appel payant) et mesurée avec Playwright en
émulation Android milieu de gamme : 360 x 780, deviceScaleFactor 2, `isMobile`, `hasTouch`, agent Chrome Android,
réseau « 3G lente » par CDP (`Network.emulateNetworkConditions` : 400 kbit/s en descente et en montée, 400 ms de
latence), CPU ralenti 4 fois. Trois cibles mesurées : `vite dev` (5173), build de production servi par
`npx vite preview` (4173) et le même build servi par un petit serveur local qui imite Firebase Hosting (4180 :
brotli, en-têtes de `platform/firebase.json`, `/api` relayé vers l'API locale). Aucune modification du code, de la
configuration ni de git. Serveurs arrêtés, données de test nettoyées (voir VÉRIFICATIONS).

Dossier des preuves (noté `PREUVES/` dans ce rapport) :
`/tmp/claude-0/-home-user-FORLIFE/f743d9c3-cade-5323-a17b-7e4c52982ff1/scratchpad/equipe/princesse/`
(scripts `mobile.mjs`, `media.mjs`, `coldload.mjs`, `hosting-like.mjs` ; résultats `mesures-dev-run1.txt`,
`mesures-preview.txt`, `mesures-hosting.txt` et leurs `.json`, `media.txt`, `coldload.txt` ; captures
`shots-dev/`, `shots-preview/`, `shots-hosting/`, `shots-media/` ; comptages de la base `counts-*.txt`).

Références aux rapports précédents : U.. (Aya, D02), F.. (Grâce, D03), B.. (José, D04), D01 § (Zana). Je ne les
répète pas : je les cite quand une mesure mobile les confirme ou en précise l'impact.

## RÉSUMÉ

Bonne nouvelle : en build de production, l'application est légère pour un téléphone. En 3G lente avec un CPU
d'entrée de gamme, le formulaire de connexion est utilisable en 4,9 s (médiane de 3 essais), pour 148 Ko transférés
à ce moment et 207 Ko au total, polices comprises. L'accueil arrive 1,7 s après « Se connecter ». Ensuite, chaque
écran ne coûte que 1,6 à 5,5 Ko (réponses API compressées) et s'affiche en 0,5 à 1 s. Le jeton d'accès reste en
mémoire et le refresh en cookie httpOnly : c'est le bon équivalent web d'un stockage sécurisé, et la session survit
à une coupure (retour du réseau : accueil connecté en 2,1 s).

Les problèmes mobiles sont ailleurs :

1. **Rien ne marche sans réseau.** Ce n'est pas une PWA : ni manifeste, ni icône PNG, ni service worker. Un
   rechargement hors ligne donne la page d'erreur de Chrome (`ERR_INTERNET_DISCONNECTED`). Une navigation hors ligne
   affiche des zéros sans aucune alerte (confirme U06 et F07).
2. **Une coupure pendant une génération fait perdre le résultat et les crédits.** Mesure : le job a réussi côté
   serveur et 8 crédits ont été débités, mais l'écran affiche « Failed to fetch ». Huit secondes après le retour du
   réseau, toujours aucun résultat et aucune reprise (confirme F06 dans les conditions réelles d'un abonné ivoirien).
3. **Les médias consomment le forfait sans prévenir.** Ouvrir un projet vidéo télécharge d'office le MP4 entier :
   2,39 Mo en 49,5 s. Ouvrir un brief créatif télécharge 3 PNG pleine taille : 2,87 Mo en 58 s. Soit 12 à 14 fois
   le premier chargement complet de l'application.
4. **L'import d'une photo de téléphone est lent et fragile.** Une photo de 12 Mpx (1,9 Mo) met 38 s à monter en
   3G, sans compression, sans barre de progression, sans annulation ni reprise. L'import n'existe que dans
   Brand DNA > Assets, pas au moment où on en a besoin (Creative et Video Studio).
5. **Pas de partage vers WhatsApp pour les contenus produits.** La fiche contenu dit « WhatsApp et email restent à
   diffuser manuellement », mais il n'y a ni bouton « Partager » (Web Share API : 0 occurrence) ni « Copier le
   texte ». Les visuels et vidéos n'ont qu'un bouton « Télécharger ».

Application native : **pas maintenant**. Je recommande de faire d'abord une vraie PWA (8 à 12 jours), puis, si la
présence sur le Play Store compte commercialement, de l'empaqueter en TWA (3 à 5 jours plus les délais de Google).
Une application Expo ou Flutter coûterait 40 à 90 jours de réécriture pour un gain faible tant que la PWA n'existe
pas. Le point le plus délicat du Play Store n'est pas technique : la vente de crédits par mobile money dans
l'application doit être vérifiée au regard de la politique de paiements de Google Play.

## CONSTATS

Gravité : BLOQUANT (empêche un parcours clé sur mobile), MAJEUR (perte d'argent, de données ou de forfait, ou
friction forte en réseau faible), MINEUR. Chemins relatifs à `platform/` sauf mention.

### Mesures de référence (3G lente 400 kbit/s, 400 ms, CPU x4, 360 x 780, DPR 2)

| Mesure | vite dev (5173) | build + vite preview (4173) | build + serveur type Hosting (4180) |
|---|---|---|---|
| Formulaire de connexion utilisable | **140 846 ms** (FCP 140 108) | 4 948 ms ; 3 essais : 4 890 médiane | 4 936 ms ; 3 essais : **4 873 médiane** (FCP 4 260) |
| Octets au premier chargement (complet, polices comprises) | **6 959 408 o, 64 requêtes** | 233 042 o, 10 requêtes (gzip) | **206 685 o, 10 requêtes** (brotli) |
| dont application (HTML, JS, CSS, favicon) | 6 922 605 o | 196 262 o | 169 898 o |
| dont polices Google (5 requêtes, 2 domaines) | 35 899 o | 35 876 o | 35 901 o |
| Connexion → accueil affiché | 2 323 ms | 1 701 ms | **1 660 ms** |
| Données connexion → accueil (API) | 11 077 o (tableau de bord demandé 2 fois, effet `StrictMode` en dev) | 7 563 o (brut) | 4 089 o (brotli) |
| Navigation par le menu (titre / dernière réponse) | non retenu (méthode de mesure corrigée après ce passage) | 0,46 à 1,3 s / 0,96 à 1,33 s | **0,47 à 1,29 s / 0,94 à 1,29 s** |
| Données par écran (CRM, Content, Calendrier, Analytics, Copilot, Accueil) | | 3,5 / 17,2 / 2,5 / 3,8 / 8,1 / 3,5 Ko | **1,6 / 5,5 / 2,1 / 1,9 / 2,9 / 1,6 Ko** |
| Rechargement, cache chaud | 6 406 ms, 23 149 o | 2 831 ms, 8 175 o | 2 348 ms, 4 326 o |
| Retour du réseau après coupure, rechargement | accueil connecté, 6 039 ms | accueil connecté, 2 343 ms | accueil connecté, 2 077 ms |

Autres essais (`PREUVES/coldload.txt`) : polices tierces bloquées, connexion utilisable en 4 869 ms (aucun gain :
le JS de 127 Ko en brotli est le poste critique) ; profil « 4G lente » (1,6 Mbit/s, 150 ms), 2 567 ms.

Lecture : `vite dev` n'est pas représentatif (1 module par requête, React en mode développement, 6,9 Mo). Il ne faut
jamais faire de démonstration sur téléphone avec `npm run dev:web`. Le build de production est correct pour la 3G,
et le découpage par route (F10) le rapprocherait de 3 à 3,5 s (estimation : environ 45 Ko de JS en moins à 50 Ko/s).

### Liste des constats

| ID | Gravité | Constat | Preuve | Lien |
|---|---|---|---|---|
| M01 | MAJEUR | **Ce n'est pas une PWA.** `index.html` n'a pas de `<link rel="manifest">` ni d'`apple-touch-icon`, la seule icône est `favicon.svg` (568 o), aucun service worker n'est enregistré ni présent dans le build, et `vite.config.ts` n'a aucun plugin PWA. Sur Android, « Ajouter à l'écran d'accueil » ne crée qu'un raccourci vers un onglet Chrome (barre d'adresse visible, icône générique), sans écran de démarrage ni mode plein écran. `theme-color` est bien présent (`index.html:6`). | `apps/web/index.html:1-17` ; `apps/web/public/` (favicon.svg, demo/, 2 fichiers TikTok) ; `apps/web/vite.config.ts:1-10` ; mesure `PREUVES/media.txt` : `manifest:null, swRegs:0, cacheStorage:0`, `Page.getAppManifest` : `url=""` | |
| M02 | MAJEUR | **Hors ligne : page d'erreur du navigateur ou faux vide.** Rechargement ou ouverture sans réseau : `net::ERR_INTERNET_DISCONNECTED` (page « Pas de connexion Internet » de Chrome). Navigation hors ligne vers le CRM : titre affiché, colonnes « 0 · 0 FCFA », 0 alerte, aucun bandeau « hors connexion ». Aucune donnée n'est gardée pour une consultation hors ligne (pas de cache, pas d'IndexedDB), aucune action n'est mise en file d'attente. | `PREUVES/shots-hosting/5a-crm-hors-ligne.png`, `5b-rechargement-hors-ligne.png` ; `mesures-hosting.txt` lignes 5a et 5b | U06, F05, F07 |
| M03 | MAJEUR | **Coupure pendant une génération : crédits débités, résultat perdu, aucune reprise.** Content Studio, « Proposer des angles » : POST répondu en 611 ms, coupure du réseau pendant le suivi. Côté serveur, le job `ai.content_ideas` est `SUCCEEDED` et 8 crédits sont débités (`IA : content.ideas`, -8). Côté écran : « Failed to fetch », bouton redevenu actif, 0 angle. 8 s après le retour du réseau : même état. Les angles ne sont pas enregistrés ailleurs : l'utilisateur doit relancer et payer à nouveau. En 3G ivoirienne, les micro-coupures sont fréquentes et les générations réelles durent 10 à 60 s (hypothèse d'Aya), donc ce cas sera courant. | `PREUVES/mesures-hosting.txt` lignes 6a et 6b ; `shots-hosting/6b-generation-apres-retour.png` ; base locale : `Job` SUCCEEDED, `CreditTransaction` -8 à 17:20:13 ; cause : `apps/web/src/lib/hooks.ts:41-60` | F06, F01, B06 |
| M04 | MAJEUR | **Médias téléchargés d'office, sans indication de poids.** Page d'un projet vidéo : le MP4 complet (2 391 216 o) part dès l'ouverture, 49,5 s en 3G, sans action de l'utilisateur (`VideoStudio.tsx:426-431`). Page d'un brief créatif : 3 PNG pleine taille de 932 à 978 Ko chacun (2 873 937 o, 58 s) pour de simples aperçus (`CreativeStudio.tsx:49-58`). La photo produit sert aussi d'aperçu en pleine taille (63 Ko ici, plusieurs Mo pour une vraie photo). Pas de prise en compte de `Save-Data` ni de `navigator.connection`. | `PREUVES/media.txt` (lignes projet-video et brief-creatif) ; captures `shots-media/` | F11, D01 § 5 |
| M05 | MAJEUR | **Import de photo produit lent et fragile, au mauvais endroit.** Une photo de 12 Mpx (1 888 009 o) met 38,3 s à être envoyée en 3G (montée 400 kbit/s), statut 201. Pas de redimensionnement ni de compression côté client (`Brand.tsx:359-372` envoie le fichier brut), pas de progression (`fetch` ne la fournit pas), pas d'annulation, pas de délai (`lib/api.ts:49`), pas de reprise si la connexion tombe. Une vraie photo Android de 3 à 6 Mo prendrait 60 à 120 s. L'import n'est possible que dans Brand DNA > Assets : Creative et Video Studio renvoient vers cet écran (« Importez des photos dans Brand DNA → Assets », `CreativeStudio.tsx:128`, `VideoStudio.tsx:152`). Le champ (`Brand.tsx:390`) mélange images, PDF et texte et n'a pas d'option « Prendre une photo ». | `PREUVES/media.txt` (ligne « Envoi photo ») ; `accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf,text/plain" capture=null` | F05 |
| M06 | MAJEUR | **Pas de partage vers WhatsApp des contenus produits.** La fiche contenu annonce « WhatsApp et email restent à diffuser manuellement » (`ContentDetail.tsx:113`), mais n'offre ni « Partager » ni « Copier le texte » : `navigator.share` a 0 occurrence dans `src`, et le presse-papiers n'est utilisé que pour le lien des formulaires CRM (`Crm.tsx:564`). Visuels et vidéos : seulement « Télécharger » (`CreativeStudio.tsx:266-273`, `VideoStudio.tsx:433-440`), puis l'utilisateur doit retrouver le fichier dans la galerie et l'envoyer lui-même. Le lien `wa.me` existe pour les relances CRM (`Crm.tsx:38`) : c'est le seul pont vers WhatsApp. | Recherche `grep -rn "navigator.share\|clipboard" apps/web/src` | U10 |
| M07 | MINEUR | **Aucune notification.** Ni Web Push, ni API `Notification`, ni service worker pour les recevoir. Une génération vidéo ou une stratégie oblige à rester sur l'écran (et l'écran perd le suivi au moindre incident, M03). Les emails sont en mode `log` en production (D01 § 9). | `grep -rn "Notification\|PushManager" apps/web/src` : 0 | U10 |
| M08 | MINEUR | **API non compressée par l'application.** Fastify n'enregistre pas `@fastify/compress` (`apps/api/src/server.ts`, dépendances `apps/api/package.json`). Mesure : réponses brutes 1,2 à 3,1 fois plus lourdes qu'en brotli (Content Studio 17,2 Ko contre 5,5 Ko ; Copilot 8,1 contre 2,9). Avec seulement 3 prospects en base locale, l'écart grandira avec 500 prospects (B22). En production, la compression dépend de Firebase Hosting devant Cloud Run : non vérifiable d'ici. | `PREUVES/mesures-preview.txt` (API « brut ») et `mesures-hosting.txt` (API « br ») | B22 |
| M09 | MINEUR | **Polices tierces : 17 % des octets du premier chargement.** 35,9 Ko et 5 requêtes vers 2 domaines (Google Fonts, 4 graisses). Pas d'effet mesuré sur le temps en émulation (le JS domine), mais CDP ne simule pas la résolution DNS ni les poignées de main TLS de 2 domaines de plus, qui coûtent plusieurs allers-retours en vraie 3G. Une police tierce ne peut pas non plus être mise en cache hors ligne de façon fiable. | `PREUVES/coldload.txt` ; `apps/web/index.html:8-10` | F12 |
| M10 | MINEUR | **Hauteurs en `100vh`.** `styles.css:93`, `:364`, `:394`, `:480` (modale `calc(100vh - 32px)`), `:735` (`:581` ne concerne que les écrans larges). Sur Chrome Android, `100vh` inclut la barre d'adresse rétractable : le bas des modales et des écrans pleine hauteur peut passer sous la barre ou sous le clavier virtuel. Non vérifié sur appareil réel. | Code cité | U04, U15 |
| M11 | MINEUR | **Configuration d'hébergement à adapter pour une PWA ou une TWA.** `firebase.json:5-7` ignore `**/.*` : un futur `public/.well-known/assetlinks.json` (obligatoire pour une TWA) ne serait pas déployé. Aucun en-tête n'est prévu pour un futur `sw.js` (il doit être `no-cache`) ni pour le manifeste. `Permissions-Policy: camera=()` (`firebase.json:64-65`) bloque `getUserMedia` : sans effet sur un champ fichier (l'appareil photo natif reste disponible), mais à revoir si une capture dans l'application est un jour voulue. | `platform/firebase.json` | |
| M12 | MINEUR | **Démonstration sur téléphone avec `vite dev` impraticable.** 140,8 s et 6,96 Mo avant de pouvoir se connecter en 3G lente. Rien n'indique dans le guide local de tester sur mobile avec le build. | `PREUVES/mesures-dev-run1.txt` | |

Points positifs vérifiés : jeton d'accès en mémoire et refresh en cookie httpOnly (pas de jeton dans
`localStorage`, F22) ; session conservée après une coupure ; aucun secret dans le bundle (F22) ; la vidéo de
présentation de 10,7 Mo n'est pas téléchargée à l'ouverture (0 requête MP4 sur l'accueil, `preload="none"`) ;
`theme-color` défini ; liens `wa.me` corrects dans le CRM ; `inputMode="tel"` sur le paiement
(`Billing.tsx:299`) ; pages légales publiques (`/confidentialite`, `/conditions`, `/suppression-des-donnees`),
utiles pour un store ; écrans peu gourmands une fois l'application chargée (1,6 à 5,5 Ko par écran).

### Fonctions natives utiles au public ivoirien

| Fonction | État | Preuve | Ce qu'il faut |
|---|---|---|---|
| Partage vers WhatsApp (Web Share API, niveau 2 avec fichiers) | **Absent** pour contenus, visuels, vidéos ; présent pour les relances CRM via `wa.me` | M06 | `navigator.share({ text, files })` sur la fiche contenu, le visuel et la vidéo ; repli `wa.me/?text=` et « Copier le texte » |
| Appareil photo pour les photos produit | **Partiel** : champ fichier générique, seulement dans Brand DNA | M05 | Boutons « Prendre une photo » (`accept="image/*" capture="environment"`) et « Choisir dans la galerie » directement dans Creative et Video Studio, compression avant envoi |
| Téléchargement des vidéos et visuels | **Présent** (lien `download` sur un blob) | `VideoStudio.tsx:433-440`, `CreativeStudio.tsx:266-273` | Afficher le poids, ne télécharger le MP4 qu'à la demande (M04) ; le lien blob échoue après 15 min sans renouvellement du jeton (F09) |
| Notifications | **Absent** | M07 | Web Push (service worker requis), permission demandée au moment du besoin (« Vous prévenir quand votre vidéo est prête ? »), jamais au premier lancement |
| Installation sur l'écran d'accueil | **Absent** (simple raccourci) | M01 | Manifeste, icônes 192 et 512 px dont une « maskable », mode `standalone`, invite d'installation après une première réussite |
| Mode hors ligne | **Absent** | M02 | Service worker, coquille hors ligne, lecture des dernières données, file d'attente des actions simples |
| Économie de données | **Absent** | M04 | Respect de `Save-Data` / `navigator.connection.saveData`, médias à la demande, poids affiché |

### Option application native

| Option | Ce qu'elle apporte | Coût et délai (estimation) | Prérequis et risques |
|---|---|---|---|
| **A. PWA complète** (recommandée d'abord) | Installation, icône, plein écran, coquille hors ligne, cache de lecture, partage WhatsApp avec fichiers, notifications Web Push sur Android, compression des photos. Une seule base de code. | 8 à 12 jours-personne (front), plus 1 à 2 jours back-end pour Web Push. 0 USD de frais de store. | Corriger d'abord le socle réseau (F05, F06, F07). Web Push sur iOS exige l'installation sur l'écran d'accueil (iOS 16.4 ou plus) : marginal pour ce public. |
| **B. PWA empaquetée en TWA** (Bubblewrap ou PWABuilder) pour le Play Store | Présence et recherche sur le Play Store, confiance (« c'est une vraie application »), mises à jour automatiques : le contenu reste le site web. | 3 à 5 jours-personne après A ; 25 USD (compte développeur, paiement unique). Délais Google : revue de quelques jours ; pour un compte **personnel** récent, test fermé obligatoire avec au moins 12 testeurs pendant 14 jours avant la production (un compte **organisation** en est dispensé, mais demande un numéro D-U-N-S). | Fichier `/.well-known/assetlinks.json` servi par `forlifecomai.ci` (M11) ; clé de signature gérée par Play App Signing, jamais dans le dépôt ; niveau d'API cible exigé par Google à la date de soumission. Voir les prérequis store ci-dessous. |
| C. Expo (React Native) | Accès natif complet (envoi en arrière-plan, partage entrant natif, notifications natives). Peut réutiliser `@forlife/shared` et la logique du client API. | 40 à 70 jours-personne (réécriture de l'interface des 28 pages, environ 9 800 lignes), puis maintenance de deux interfaces. Apple : 99 USD par an si iOS. | Double maintenance pour une petite équipe ; chaque correction (F01, F05...) à faire deux fois ; publication et revue à chaque version. |
| D. Flutter | Mêmes apports que C, bonnes performances sur Android d'entrée de gamme. | 50 à 90 jours-personne, rien de réutilisable (Dart). | Nouvelle langue et nouvelle chaîne d'outils pour l'équipe. |

**Recommandation : A tout de suite, B ensuite si la présence sur le Play Store a une valeur commerciale, ni C ni D
pour l'instant.** Raisons :

1. Les vrais irritants mesurés (hors ligne, coupures, médias, photos, partage) se règlent tous en web. Une
   application native qui embarquerait le même client HTTP fragile aurait les mêmes défauts.
2. Une fois installée, une PWA sur Android peut recevoir des partages (`share_target`), envoyer des notifications et
   fonctionner hors ligne : l'écart avec une application native est faible pour un outil de gestion.
3. Une TWA ne demande presque pas de maintenance : chaque déploiement web met l'application à jour, sans repasser
   par la revue Google.
4. Revenir à C plus tard reste possible si les mesures d'usage le justifient (par exemple beaucoup d'envois de
   vidéos lourdes en arrière-plan).

Prérequis du Play Store (à préparer pour B, et pour C ou D le cas échéant) :

- Fiche : nom, description courte et longue en français, icône 512 x 512 PNG, image de présentation 1024 x 500,
  au moins 2 captures téléphone, catégorie (Entreprise ou Productivité), coordonnées de contact.
- Versions : `versionCode` croissant et `versionName` (aujourd'hui `0.1.0` dans `apps/web/package.json:3`), notes
  de version en français.
- Politique de confidentialité : URL publique existante (`/confidentialite`), à compléter avec la section
  « application Android » et l'hébergement des données (Imagen en us-central1, D01 § 7).
- Formulaire « Sécurité des données » : données collectées (nom, email, téléphone de l'utilisateur, **contacts de
  tiers saisis dans le CRM**, photos et fichiers, historique de paiement traité par CinetPay, activité dans
  l'application), chiffrement en transit (oui), possibilité de demander la suppression (oui).
- Suppression du compte : Google exige un chemin dans l'application et une URL web. Il existe la suppression de
  l'organisation dans l'application (`SettingsData.tsx:115-152`) et une page publique, mais la suppression du
  compte utilisateur passe par une demande WhatsApp sous 30 jours (`Legal.tsx:255-258`). À clarifier avec Caporal.
- Accès pour la revue : compte de démonstration en production (identifiants, crédits suffisants, données
  d'exemple, IA réelle), avec instructions. Ne jamais réutiliser un compte client.
- Contenu généré par IA : la politique de Google Play demande un moyen de signaler un contenu généré offensant
  depuis l'application. Il n'existe pas aujourd'hui.
- Paiements : la vente de crédits et d'abonnements numériques dans une application Play relève en principe de
  Google Play Billing. Encaisser par CinetPay (mobile money) à l'intérieur de la TWA peut être refusé. Options à
  vérifier : programme de facturation alternative s'il est ouvert en Côte d'Ivoire, ou application Play sans
  achat (l'achat reste sur le site). **Décision propriétaire, avis de Caporal requis avant toute soumission.**
- Questionnaire de classification du contenu, public cible (adultes, usage professionnel), déclaration
  « sans publicité ».

## VÉRIFICATIONS

| Commande / action | Résultat réel |
|---|---|
| Lecture de `brief.md`, `architecture.md`, `plan.md`, rapports D01 à D04 | fait |
| `curl` sur 4000 et 5173 avant lancement ; `service postgresql status` | 000 / 000 ; PostgreSQL déjà en ligne (je ne l'ai pas lancé, je l'ai laissé en ligne) |
| Comptage exact des lignes de chaque table avant les essais (`counts.sh`) | 58 tables, `PREUVES/counts-avant.txt` |
| `npm run dev:api` et `npm run dev:web` en arrière-plan | API 200 sur `/api/health` (IA simulée, `ANTHROPIC_API_KEY` vide), Vite 200 sur 5173 |
| `node mobile.mjs http://localhost:5173 dev` | connexion utilisable en 140 846 ms, 6 959 408 o en 64 requêtes ; accueil 2 323 ms ; hors ligne : 0 alerte, rechargement `ERR_INTERNET_DISCONNECTED` |
| `npm run build -w @forlife/web` | succès en 274 ms ; JS 515 658 o (gzip -9 : 150 196 ; brotli : 126 698), CSS 45 118 o (gzip 9 989 ; brotli 8 902) ; avertissement de chunk supérieur à 500 ko |
| `npx vite preview --port 4173` puis `curl -H "accept-encoding: gzip, br"` | le preview de Vite 8 **compresse en gzip** (`Content-Encoding: gzip`) avec `Cache-Control: no-cache` ; sans `accept-encoding`, 515 658 o bruts |
| `node hosting-like.mjs <dist> 4180` avec `COMPRESS_API=1` | brotli sur les fichiers et l'API, en-têtes de cache de `firebase.json` vérifiés (`immutable` sur `/assets/`) |
| `node mobile.mjs http://localhost:4173 preview` et `GEN=1 node mobile.mjs http://localhost:4180 hosting` | voir le tableau des mesures ; génération coupée : job SUCCEEDED, -8 crédits, « Failed to fetch », 0 angle après retour du réseau |
| `node coldload.mjs` (3 essais par configuration) | 3G : 4 870 / 4 889 / 4 873 ms ; 3G sans polices : 4 873 / 4 869 / 4 866 ms ; 4G lente : 2 583 / 2 567 / 2 561 ms ; preview 3G : 4 890 ms médiane |
| `node media.mjs http://localhost:4180` | manifeste absent, 0 service worker, 0 cache ; projet vidéo 2 458 568 o (MP4 2 391 216 o en 49 512 ms) ; brief créatif 2 873 937 o (3 PNG, jusqu'à 57 878 ms) ; envoi d'une photo 12 Mpx de 1 888 009 o : 201 en 38 255 ms |
| Recherche dans le code (`grep`) : `navigator.share`, `serviceWorker`, `Notification`, `manifest`, `capture=`, `clipboard`, `100vh` | résultats cités dans les constats |
| Nettoyage de la base locale | supprimés : l'asset de test (ligne `BrandAsset` et fichier `apps/api/storage/.../LSequGcf7hSijMek.jpg`), le job de génération, 11 sessions créées par mes connexions. **Conservés volontairement** : 1 `CreditTransaction` (-8), 1 `AIUsageEvent`, 1 `AuditLog` (tables append-only protégées par des triggers, D01 § 3) et l'`AIRun` correspondant, gardé pour que le registre reste cohérent. `RateLimitBucket` est passé de 2 à 1 par la purge de l'application elle-même. Différence finale : `PREUVES/counts-fin.txt` |
| Arrêt des serveurs | API, Vite dev, Vite preview et serveur type Hosting arrêtés ; ports 4000, 5173, 4173 et 4180 : 000 |
| `git status --short` | vide (`apps/web/dist` régénéré, ignoré par git) |

Non vérifié : appareil Android réel (Chrome Android, clavier virtuel, TalkBack, sélecteur de fichiers et appareil
photo, comportement de `100vh`) ; la Web Share API (absente du Chromium sans interface utilisé, et non utilisée par
le code) ; installation réelle sur l'écran d'accueil ; le vrai réseau mobile ivoirien (pertes de paquets,
poignées de main TLS, DNS : CDP ne simule que débit et latence) ; la compression appliquée en production par
Firebase Hosting aux réponses de Cloud Run ; les durées de l'IA réelle ; la production (hors périmètre) ; le texte
exact des politiques Google Play du jour (non joignables d'ici).

## HYPOTHÈSES

- Profil réseau imposé par la tâche (400 kbit/s, 400 ms) pris comme représentatif d'une 3G dégradée en Côte
  d'Ivoire ; la latence vers Cloud Run en europe-west1 depuis Abidjan est supposée comprise dans ces 400 ms.
- Le serveur type Hosting suppose que Firebase Hosting sert les fichiers en brotli et compresse aussi les
  réponses de l'API ; si ce n'est pas le cas pour l'API, les chiffres « brut » du preview s'appliquent (M08).
- La base locale est petite (3 prospects, 11 contenus) : les volumes par écran seront plus grands avec un vrai
  client, surtout le CRM (jusqu'à 500 prospects, F13, B22).
- La photo de test est une image synthétique de 12 Mpx (1,9 Mo) : une photo réelle d'Android pèse souvent 3 à 6 Mo,
  donc les temps d'envoi réels seront plus longs.
- Estimations d'effort en jours-personne pour un développeur qui connaît le code ; frais de store : 25 USD
  (Google, unique) et 99 USD par an (Apple), tarifs connus à ma date de connaissance, à confirmer.
- Règles du Play Store (test fermé de 14 jours avec 12 testeurs pour les comptes personnels récents, politique
  de paiements, signalement des contenus IA, suppression de compte) : connues à ma date de connaissance, à relire
  dans la console avant de s'engager.

## RISQUES ET POINTS OUVERTS

1. Argent et confiance : en 3G, la combinaison M03 + F01 + B06 fait payer plusieurs fois une même génération. C'est
   le risque mobile numéro un.
2. Forfait des clients : un client qui ouvre deux projets vidéo et un brief créatif consomme environ 7 Mo sans le
   savoir. Sur des données payantes, c'est un motif d'abandon.
3. Play Store et paiements : sans décision sur Google Play Billing, une TWA risque d'être refusée ou retirée.
4. Les notifications Web Push demandent des clés VAPID (secret à garder dans Secret Manager, jamais dans le dépôt)
   et une table d'abonnements : arbitrage avec José et Caporal.
5. Une PWA mal configurée peut servir une version périmée : la stratégie de mise à jour du service worker
   (`sw.js` en `no-cache`, invite « Nouvelle version disponible ») doit être définie dès le départ avec Brice.
6. Tests sur appareil réel toujours à faire (Aya et Grâce l'ont aussi signalé).

## SUGGESTIONS PRIORISÉES

| # | Priorité | Suggestion | Effort | Constats | Agent |
|---|---|---|---|---|---|
| 1 | P0 | Socle réseau faible de Grâce (F05, F06, F07) avec critères d'acceptation mobiles : reprise automatique du suivi d'un job après une coupure (le résultat s'affiche au retour du réseau, `jobId` gardé en `sessionStorage`), bandeau « Vous êtes hors connexion » piloté par `online`/`offline`, aucune page à zéro quand le chargement a échoué. Rejouer `mobile.mjs` comme test de recette | M | M02, M03 | Grâce, Princesse (recette) |
| 2 | P0 | Médias à la demande : ne plus télécharger le MP4 à l'ouverture (bouton « Lire la vidéo · 2,4 Mo »), miniatures WebP d'environ 320 px (30 à 60 Ko) pour les visuels et les photos, fichier plein format seulement au téléchargement, poids affiché ; mode économie de données si `saveData` est actif | M | M04 | José (miniatures, URL signées), Grâce |
| 3 | P0 | Photo produit : redimensionner et compresser dans le navigateur avant l'envoi (1 600 px, JPEG ou WebP qualité 0,8, soit 250 à 400 Ko au lieu de 2 à 6 Mo), barre de progression (`XMLHttpRequest.upload.onprogress`), bouton « Annuler », délai, message en français ; boutons « Prendre une photo » et « Choisir dans la galerie » directement dans Creative et Video Studio | S à M | M05 | Princesse, Grâce |
| 4 | P1 | Partage WhatsApp : bouton « Partager » sur la fiche contenu (texte), le visuel (fichier image + légende) et la vidéo (`navigator.share` avec `files` si `canShare`), repli `https://wa.me/?text=` et « Copier le texte » | S | M06 | Princesse, Grâce |
| 5 | P1 | PWA installable : `manifest.webmanifest` (nom, `short_name` « Forlife », `start_url` `/`, `display` `standalone`, couleurs, `lang` `fr`), icônes PNG 192 et 512 px dont une maskable, `apple-touch-icon`, service worker (Workbox via `vite-plugin-pwa`, ou écrit à la main) qui précharge la coquille et sert une page « Hors connexion » ; aucune mise en cache de `/api/auth/*` ; invite d'installation après une première réussite, pas au premier lancement ; en-têtes `no-cache` pour `sw.js` dans `firebase.json` | M | M01, M02, M11 | Princesse, Brice (hébergement) |
| 6 | P1 | Lecture hors ligne : cache « stale-while-revalidate » des GET en lecture seule (accueil, CRM, calendrier, contenus) avec la mention « Données du 07/11 à 9 h 12 » ; file d'attente IndexedDB pour les actions simples et idempotentes (nouveau prospect, note, tâche faite), rejouée au retour du réseau avec une `Idempotency-Key` stable | M | M02 | Princesse, José (B05, B06) |
| 7 | P1 | Polices auto-hébergées (3 graisses, sous-ensemble latin) ou police système sur mobile, mises en cache par le service worker | S | M09 | Grâce |
| 8 | P1 | Vérifier la compression des réponses de l'API en production (`curl -H "accept-encoding: br"` sur `/api/health` et une liste) ; sinon `@fastify/compress` | S | M08 | Brice, José |
| 9 | P2 | Notifications Web Push : fin de génération, publication échouée, rappel « Votre post de 9 h est prêt, partagez-le sur WhatsApp » ; permission demandée au moment du besoin, avec explication ; clés VAPID dans Secret Manager | M à L | M07 | José, Princesse, Caporal |
| 10 | P2 | TWA pour le Play Store après la suggestion 5 : Bubblewrap, `assetlinks.json` (corriger `ignore` dans `firebase.json`), compte Play organisation, fiche, sécurité des données, compte de démonstration, signalement des contenus IA, **décision sur les paiements** | M (3 à 5 jours) plus délais Google | M11 | Princesse, Caporal, propriétaire |
| 11 | P2 | `dvh` ou `svh` à la place de `100vh` (modales, connexion, barre latérale) ; tester le clavier virtuel sur Copilot et formulaires | S | M10 | Grâce |
| 12 | P2 | Recette mobile outillée : `mobile.mjs`, `media.mjs` et `coldload.mjs` adaptés en CI (budget : connexion utilisable ≤ 4 s en 3G lente, ≤ 250 Ko au premier chargement, ≤ 10 Ko par écran) ; campagne sur 2 Android réels d'entrée de gamme ; guide local : « tester le mobile sur le build, pas sur `vite dev` » | M | M12 | Franck, Princesse |

## SUITE PROPOSÉE

1. Grâce : livrer les suggestions 1 à 5 de D03 ; je fais la recette mobile avec mes scripts (coupure pendant
   génération, hors ligne, données transférées).
2. José (D04) : miniatures WebP et accès aux fichiers (suggestion 2, avec F11), idempotence nécessaire à la file
   hors ligne (B05, B06), puis Web Push.
3. Caporal (D06) : politique de paiements Google Play et suppression de compte, clés VAPID, `Permissions-Policy`
   et cache du service worker (rien d'authentifié en cache partagé).
4. Brice (D10) : compression de l'API en production, en-têtes `sw.js` et manifeste, `assetlinks.json`.
5. Franck (D07) : intégrer les scripts de mesure mobile et les budgets en CI.
6. Elisée (D11) : arbitrer PWA puis TWA contre application native, et la question des paiements sur le Play Store.
