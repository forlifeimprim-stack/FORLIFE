# Cahier des charges — « ForLife Studio » (version 1.4)

> Application de capture, de retouche automatique et de livraison par reconnaissance faciale pour le studio photo de **forlife.com**.
> Date : 17 octobre 2026 · Statut : **validé**. Il reste deux points secondaires (§15).

### Décisions validées par ForLife
| Sujet | Décision |
|---|---|
| Boîtiers | **Sony FX30** et **Sony Alpha 7 III** (A7 III) |
| Accès client | **Selfie + reconnaissance faciale** : le client ne voit que ses photos |
| **Objectif n°1** | **Le client récupère ses photos SUR PLACE**, en studio comme en extérieur, depuis son propre téléphone (ses données mobiles) |
| **Principe Wi‑Fi** | **Seuls les appareils photo** se connectent au Wi‑Fi ForLife : **Wi‑Fi du bureau** au studio, **point d'accès du téléphone ForLife** en extérieur. **Les clients ne se connectent jamais** à notre Wi‑Fi (§3) |
| Lieux | **Studio** (iMac) et **extérieur sans ordinateur** : un **téléphone Android** préconfiguré sert de relais (§3.3) |
| Station | **iMac 2015** (Intel 3,3 GHz, 16 Go de RAM, 1 To) au studio, sous **macOS** |
| Équipe | **1 photographe** |
| Envoi du lien | **WhatsApp** si le client en a un, sinon **lien direct dans le navigateur** |
| Prix pour le client | **Gratuit** (inclus dans la prestation) : pas de paiement ni de filigrane bloquant |
| Durée d'accès client | **30 jours** |
| Conservation des originaux | **30 jours** également, puis suppression automatique |
| Identité visuelle | **Logo ForLife Studio** (F + diaphragme) et **logo vectoriel Forlife Com** (fichier .ai converti en SVG) : orange `#EA7821`, brun `#3B251F`, slogan « Imprimer l'avenir, valoriser les marques » (`docs/studio-app/brand/`) |
| Style de retouche | Pas de réglage existant : **ForLife Studio fournit les presets de départ**, à calibrer ensemble |
| Hébergement | **Firebase** (déjà utilisé pour forlife.com) |

---

## 1. Résumé

1. **Capture** : le photographe déclenche avec le FX30 ou l'A7 III, en vue par vue ou en rafale.
2. **Réception** : la photo arrive immédiatement sur la **Station** (le PC du studio, ou un PC portable en extérieur).
3. **Retouche automatique** : le **preset** actif (couleur, exposition, peau, recadrage) s'applique à chaque image.
4. **Indexation des visages** : la Station détecte les visages de chaque photo et calcule leur « empreinte » numérique.
5. **Publication** dans le **dossier du jour** (`2026-10-17`, par exemple) sur Firebase.
6. **Accès client** : le client scanne le **QR du jour** (badge, tenue, comptoir), prend un **selfie** et voit **uniquement ses photos**. Il y a accès pendant **30 jours**.
7. **Back‑office** : seul le personnel ForLife voit tous les dossiers et télécharge originaux et retouches.

---

## 2. Étude de l'existant (benchmark)

| Solution | Ce qu'elle fait bien | Limites pour ForLife |
|---|---|---|
| **Zno Instant** | Envoi pendant la séance, retouche IA, QR et recherche par selfie | Payant, données chez un tiers, marque Zno |
| **Evoto Instant** | Retouche de peau IA très poussée, tethering | Payant à l'image, dépend du cloud Evoto |
| **Kamero, SnapNest, Kwikpic** | Galeries d'événement en temps réel, reconnaissance faciale | Payants, peu de contrôle sur la retouche |
| **Pixieset, Pic‑Time** | Belles galeries clients | Pas de capture en direct ni de retouche automatique |
| **Lightroom, Capture One** | Référence de la retouche, tethering | Payants, pas de livraison client |
| **SkinFiner, Retouch4me** | Lissage de peau automatique | Payants, pas d'automatisation de bout en bout |

**Ce qui distingue ForLife Studio** :
- retouche **sans licence payante** (briques open source) ;
- données sur **le Firebase de ForLife**, aux couleurs de ForLife ;
- **QR imprimé une seule fois** qui mène toujours au jour en cours ;
- selfie traité **sur le téléphone du client** : la photo du selfie n'est jamais envoyée ni stockée (§6.4) ;
- presets « **peaux mates et ébène** » soignés ;
- fonctionnement **hors ligne** : file d'attente si le réseau coupe.

---

## 3. Connexion des boîtiers (FX30 et A7 III)

### 3.1 Principe : l'appareil photo sur notre Wi‑Fi, le client sur ses données
- **Les appareils photo se connectent au Wi‑Fi de ForLife**, et à lui seul :
  - **au studio**, le Wi‑Fi du bureau. Les photos vont à l'**iMac**, branché sur le même réseau ;
  - **en extérieur**, le point d'accès du **téléphone ForLife**. Les photos vont à l'**appli « ForLife Capture »** de ce téléphone.
- **Le client ne se connecte à aucun Wi‑Fi ForLife.** Il scanne le QR avec **ses propres données mobiles**, fait son selfie et récupère ses photos.
- Les réglages Wi‑Fi sont **enregistrés une fois pour toutes** dans chaque appareil (bureau + téléphone). L'appareil rejoint automatiquement le réseau disponible.
- Le **Bluetooth** sert seulement à l'appairage et à la télécommande : il est trop lent pour les photos.

### 3.2 Comment chaque appareil envoie ses photos en Wi‑Fi
| | **FX30** | **A7 III** |
|---|---|---|
| Fonction Sony utilisée | **Transfert FTP automatique** : chaque photo part dès qu'elle est prise | **« Commande via PC » (PC Remote) en Wi‑Fi**, mode point d'accès : l'application récupère chaque photo dès le déclenchement |
| Studio | Wi‑Fi du bureau → iMac (serveur FTP intégré) | Wi‑Fi du bureau → iMac |
| Extérieur | Point d'accès du téléphone → appli ForLife Capture | Point d'accès du téléphone → appli ForLife Capture |
| Fiabilité | Fonction officielle, prévue pour ça | **À confirmer pendant la semaine d'essais** : la prise en charge du PC Remote en Wi‑Fi sur l'A7 III dépend de sa version de firmware, et son pilotage par un logiciel tiers (libgphoto2 en PTP/IP) n'est pas documenté pour ce modèle |
| Plan B | Câble USB‑C | **Câble USB‑C court** vers l'iMac ou le téléphone (fiable, testé en semaine 1) |

**Mise à jour des firmwares** : avant les essais, mettre le FX30 et l'A7 III à leur **dernière version de firmware** Sony. Les fonctions Wi‑Fi en dépendent.

**Rafales** : boîtiers en **RAW + JPEG**. Seul le **JPEG** voyage en Wi‑Fi ; les RAW restent sur la carte et sont importés au studio si besoin. En rafale, les photos sont mises en file et arrivent les unes après les autres.

### 3.3 Mode extérieur : le téléphone ForLife comme relais
```
 [FX30]  ──Wi-Fi (point d'accès du téléphone) : FTP───────┐
                                                        ├─► [Téléphone ForLife – « ForLife Capture »] ──4G/5G──► Cloud ──► Client (ses données mobiles)
 [A7 III] ──Wi-Fi (point d'accès du téléphone) : PC Remote ┘     • retouche express sur place
          (plan B : câble USB-C court)                           • envoi dès qu'il y a du réseau
```
- Le téléphone active son **point d'accès** (nom et mot de passe fixes, par exemple `ForLife-Capture`, **réservé aux appareils photo** : le mot de passe n'est jamais communiqué aux clients).
- Le téléphone partage ce Wi‑Fi avec les appareils **et** utilise sa 4G/5G pour l'envoi : c'est le fonctionnement normal d'un point d'accès.
- **Appli « ForLife Capture » (Android)** :
  - **un seul bouton « Démarrer la séance »** : point d'accès, réception FTP, PC Remote, et dossier `date_lieu` ;
  - fonctionne écran éteint ; **file d'attente** si la 4G coupe ;
  - miniatures en direct, preset actif, compteurs « reçues / envoyées / publiées », batterie, données consommées ;
  - affiche le **QR de l'événement** en plein écran.
- **Pourquoi Android** : iOS ne permet pas à une appli de recevoir des photos en continu en arrière‑plan. Android le permet.

### 3.4 Garantie de récupération sur place (objectif n°1)
Le client récupère ses photos **sur son téléphone, avec ses propres données mobiles**, quelques secondes après la prise de vue. Pour que ce soit rapide même avec une 4G moyenne :

1. **Retouche faite sur place**, sur l'iMac au studio, et sur le téléphone en extérieur (retouche « express » de 1 à 3 s : couleur, style, peau, recadrage). On n'attend pas le cloud pour retoucher.
2. **Visages calculés sur place** : l'empreinte part avec la photo, donc la photo est trouvable par selfie **dès son arrivée** dans le cloud.
3. **Envoi en deux temps** :
   - d'abord une **version légère** (environ 2 000 px, 300 à 500 Ko), qui passe en 1 à 2 s même en 4G moyenne. **Le client voit et peut télécharger sa photo** ;
   - ensuite la **version HD**, qui remplace automatiquement la version légère dans sa galerie.
4. **Ordre de priorité** : la dernière photo prise passe avant le reste de la file, pour que le client qui attend devant le photographe la reçoive en premier.

**Délais visés** : environ **10 à 20 s** entre le déclenchement et la photo sur le téléphone du client (studio ou extérieur, 4G correcte).

**Si Internet est vraiment absent** (zone blanche) : les photos restent en file dans le téléphone ou l'iMac. **Rien n'est perdu**. Dès le retour du réseau, elles sont publiées et le client reçoit **automatiquement son lien sur WhatsApp**. Le client peut faire son selfie sur place, et sa demande est mémorisée.

**Comptoir (option)** : une **tablette ForLife** (reliée à notre Wi‑Fi, elle) affiche « Retrouvez vos photos ». Le client y fait son selfie et voit ses photos. Il scanne ensuite le QR de **sa** galerie, ou saisit son numéro WhatsApp, pour les récupérer **sur son téléphone, avec ses données**.

### 3.5 Matériel à prévoir pour l'extérieur
- **un téléphone Android dédié** (Android 11 ou plus récent, point d'accès Wi‑Fi 5 GHz, USB‑C avec OTG pour le plan B, 8 Go de RAM, 128 Go, bonne batterie) ; un modèle milieu de gamme (Samsung Galaxy A35/A55, Redmi Note, Pixel 7a…) suffit ;
- une **puce data 4G/5G** avec un bon forfait : environ 1,5 Go pour 500 photos ;
- un **câble USB‑C court** (plan B pour l'A7 III) ;
- une **batterie externe** de 20 000 mAh ou plus (le point d'accès et l'envoi consomment beaucoup) ;
- optionnel : une **tablette Android** et son support pour le comptoir.

**Au studio** : un **routeur Wi‑Fi de bureau** correct (2,4 et 5 GHz), avec idéalement un réseau **dédié aux appareils** (« ForLife‑Cam ») distinct du Wi‑Fi invités, et l'iMac sur le même réseau (en Wi‑Fi ou mieux en câble Ethernet).

---

## 4. Architecture

```
[FX30]──Wi-Fi FTP────────┐
[A7 III]──Wi-Fi PC Remote ┤   (Wi-Fi du bureau ; plan B : USB)
                         ▼
               ┌────────────────────┐   (iMac 2015 au studio)        ┌──────────────── FIREBASE ─────────────────┐
               │  STATION (PC)      │        │ Authentication (personnel + double auth.) │
               │  • réception       │  HTTPS │ Firestore (base de données + vecteurs)    │
               │  • retouche        │ ─────► │ Cloud Storage (photos, privé)             │
               │  • visages         │        │ Cloud Functions (accès, recherche, purge) │
               │  • file hors ligne │        │ Hosting (galerie client + back-office)    │
               └────────────────────┘        └───────────────────┬───────────────────────┘
                        ▲                                        │
       [Appli photographe (PWA)] ──── suivi en direct ───────────┤
 [Téléphone « ForLife Capture »] ─ 4G ─► [Moteur cloud Cloud Run] ┤  (extérieur)
                                                                 ▼
                                   [Client : scan du QR → selfie → ses photos, 30 jours]
```

### 4.1 Pile technique
| Couche | Choix |
|---|---|
| Station | **Electron** (interface) + **Python** (capture, retouche, visages), en application **macOS** (et Windows pour un éventuel portable) |
| Appli extérieur | **« ForLife Capture »** en **Android natif (Kotlin)** : serveur FTP, point d'accès, USB OTG avec libgphoto2 (NDK), envoi Firebase |
| Moteur cloud | **Cloud Run** (conteneur Python), avec **le même code de retouche et de visages que la Station**, déclenché à chaque photo reçue dans Storage |
| Capture | libgphoto2 (USB), pyftpdlib (serveur FTP/FTPS) |
| Retouche | rawpy/LibRaw, OpenCV, libvips, LUT 3D `.cube`, MediaPipe, ONNX Runtime |
| Visages | **OpenCV YuNet** (détection) + **SFace** (empreinte faciale). Licences Apache‑2.0, usage commercial autorisé |
| Base de données | **Cloud Firestore**, avec **recherche vectorielle** pour les visages |
| Fichiers | **Cloud Storage for Firebase** (privé), règles de cycle de vie |
| Logique serveur | **Cloud Functions 2ᵉ gén.** (Node.js ou Python) |
| Comptes du personnel | **Firebase Authentication + Identity Platform** (double authentification par SMS ou application) |
| Web (client et admin) | **Next.js / React + Tailwind**, en PWA sur **Firebase Hosting** (`photos.forlife.com`) |
| Selfie côté client | **ONNX Runtime Web** : l'empreinte est calculée dans le navigateur du client |

### 4.2 Un seul moteur, deux endroits
Le moteur de retouche et de visages est écrit **une seule fois** (Python) et tourne :
- **sur l'iMac** au studio, pour la rapidité et parce qu'il ne coûte rien ;
- **dans le cloud (Cloud Run)** pour les photos venant du téléphone en extérieur, ou en renfort si l'iMac est éteint.

Les presets sont synchronisés via Firestore : un changement sur l'iMac s'applique aussi en extérieur.

### 4.3 La Station sur l'iMac 2015
- **Système** : l'iMac 2015 s'arrête à **macOS 12 Monterey**. L'application cible donc macOS 12 au minimum, avec une version d'Electron compatible.
- **Puissance** : le processeur Intel 4 cœurs, sans carte graphique exploitable pour l'IA, fait tout le travail. La cible devient **5 à 8 s par photo** (§5). Les rafales sont mises en file d'attente et traitées dans l'ordre : le client voit ses photos arriver progressivement, sans perte.
- **Optimisations prévues** :
  - en direct, traitement du JPEG réduit (environ 3 000 px) ;
  - la haute définition finale est calculée juste après, en arrière‑plan ;
  - modèles légers (YuNet, SFace, MediaPipe), rapides sur processeur seul.
- **Disque** : si l'iMac a un « Fusion Drive » ou un disque dur classique, **un SSD externe USB 3 (500 Go ou 1 To, environ 60 à 80 €)** est fortement conseillé pour l'espace de travail. Il fait gagner beaucoup de vitesse.
- **Particularité macOS** : le système s'empare automatiquement de l'appareil photo branché (Photos, Transfert d'images). La Station désactive ce comportement pour garder la main sur le boîtier.
- **Paramètres** : désactiver la mise en veille pendant les séances (géré par l'application).

> ⚠️ Les modèles **InsightFace / ArcFace** pré‑entraînés sont plus précis, mais leur licence **interdit l'usage commercial**. On reste sur YuNet + SFace (ou dlib), dont les licences l'autorisent.

---

## 5. Moteur de retouche (gratuit)

### 5.1 Pipeline automatique pour chaque photo
1. Lecture du JPEG (ou du RAW) et des données EXIF (boîtier, heure).
2. **Correction auto** : exposition, balance des blancs, ombres et hautes lumières.
3. **Look du preset** (LUT + courbes + teintes).
4. **Portrait** : visage et masque de peau (MediaPipe), lissage par **séparation de fréquences** avec texture préservée (équivalent SkinFiner), yeux, dents, petites imperfections (inpainting).
5. **Recadrage et format**, redressement de l'horizon.
6. **Netteté de sortie** et petit logo ForLife discret (désactivable). Le service étant gratuit, aucun filigrane bloquant.
7. **Contrôle qualité** : photos floues ou aux yeux fermés marquées, et masquées du client par défaut.
8. **Visages** : détection, puis empreintes (vecteurs de 128 dimensions) envoyées avec la photo.
9. Exports : **HD** (pleine définition), **web** (2048 px) et **miniature**.

Durée cible sur l'iMac 2015 : **5 à 8 s par photo** pour la version visible par le client, en traitement parallèle (4 cœurs) pour les rafales.

### 5.2 Presets fournis au démarrage
Puisque vous n'avez pas de réglage de référence, ForLife Studio fournit les presets suivants :
- **Signature ForLife** : peau douce et naturelle, tons légèrement chauds, contraste moyen.
- **Peaux mates et ébène** : rendu fidèle des carnations foncées, sans grisaille ni rougeur.
- **Corporate / Badge** : neutre, recadrage tête‑épaules.
- **Mode / Éditorial** : contraste et couleurs riches.
- **Extérieur lumière naturelle** : correction du contre‑jour, ciel préservé.
- **Noir & Blanc Classique**.
- **Événement rapide** : correction légère, priorité à la vitesse.

**Séance de calibration** (prévue au planning) : 30 à 50 de vos photos réelles passent dans chaque preset, vous choisissez, on ajuste. Le résultat devient votre « look ForLife ». Un **éditeur de presets** (curseurs, avant/après) permet ensuite de les faire évoluer.

---

## 6. Fonctionnalités détaillées

### 6.1 Photographe (Station et appli mobile PWA)
- Assistant de connexion des boîtiers, avec captures d'écran des menus Sony (FX30 et A7 III).
- Choix du **preset actif**, modifiable à tout moment.
- Mur de **miniatures en direct** (reçue → retouchée → publiée), avec avant/après.
- Masquer, supprimer ou mettre en favori une photo avant qu'elle ne devienne visible.
- Relancer la retouche d'une sélection avec un autre preset.
- Indicateurs : boîtier connecté, file d'attente, réseau, espace disque.
- Affichage et impression du QR du jour.

### 6.2 Dossier du jour
- Création **automatique** à la première photo reçue dans la journée (fuseau Africa/Abidjan).
- Nom : `AAAA-MM-JJ`, ou `AAAA-MM-JJ_<lieu>` pour une séance en extérieur (lieu saisi au lancement, par exemple `2026-10-17_Mariage-Kone`).
- Arborescence : `originaux/`, `retouches/hd/`, `retouches/web/`, `miniatures/`.

### 6.3 QR codes
| QR | Support | Comportement |
|---|---|---|
| **QR permanent Studio** | Badge, tenue, comptoir, kakémono | `photos.forlife.com/s/<studio>` → page « Retrouvez vos photos » du **jour en cours** |
| **QR d'événement** | Imprimé pour une séance en extérieur | Mène au dossier `date_lieu` de l'événement, pendant sa durée |
| **QR de configuration** | Écran de la Station | Configure le FTP et le Wi‑Fi du FX30 |

Export : PNG et SVG haute définition, et PDF de planche de badges avec le logo ForLife.

### 6.4 Parcours du client (selfie et reconnaissance faciale)
1. Le client **scanne le QR** : une page web s'ouvre, sans application à installer.
2. Il accepte en une case à cocher le **consentement** (droit à l'image et traitement de son visage).
3. Il **prend un selfie**. Un contrôle simple de « présence réelle » lui demande de tourner légèrement la tête ou de cligner des yeux.
4. **L'empreinte du visage est calculée sur son téléphone.** Le selfie n'est **jamais envoyé ni enregistré**.
5. Une Cloud Function compare cette empreinte aux visages **du dossier du jour, ou de l'événement, uniquement**.
6. Le client arrive **immédiatement** sur **sa galerie personnelle**, dans son navigateur :
   - un lien privé est créé, valable **30 jours** ;
   - **les nouvelles photos de la journée s'ajoutent automatiquement** à sa galerie s'il est à nouveau reconnu.
7. **Recevoir le lien sur WhatsApp** :
   - le client saisit son numéro (indicatif +225 prérempli) ;
   - ForLife lui envoie automatiquement un message WhatsApp au nom de **ForLife Studio**, avec son lien personnel ;
   - un rappel est envoyé **à J‑3 avant l'expiration**.
8. **S'il n'a pas WhatsApp** (ou si l'envoi échoue) :
   - le lien reste affiché dans son navigateur, avec un bouton « Copier le lien » ;
   - il peut enregistrer la galerie sur l'écran d'accueil de son téléphone, comme une application ;
   - le même lien fonctionne sur n'importe quel appareil pendant 30 jours.
9. Il télécharge ses photos en HD (une par une ou en ZIP) et les partage.
10. Bouton **« Ce n'est pas moi / il manque des photos »** : le photographe corrige l'association dans le back‑office.

Cas particuliers :
- **Photo de groupe** : elle apparaît dans la galerie de chaque personne reconnue.
- **Personne non reconnue** (lunettes de soleil, de dos) : nouvel essai, ou recherche assistée par le photographe.
- **Enfant mineur** : le parent fait le selfie de l'enfant et valide le consentement.

### 6.5 Galerie client
- Design mobile d'abord, aux couleurs de forlife.com.
- Photos qui apparaissent **en temps réel** pendant la séance.
- Téléchargement HD gratuit et partage WhatsApp, Instagram ou Facebook.
- Compte à rebours « Vos photos sont disponibles encore X jours ».
- Après le téléchargement : invitation à laisser un avis Google ou à suivre ForLife sur Instagram (marketing gratuit).

### 6.6 Back‑office (personnel ForLife uniquement)
- Calendrier des dossiers du jour et des événements, avec recherche.
- **Compte à rebours de suppression** sur chaque dossier, alerte **à J‑5**, et bouton « Tout télécharger » pour archiver localement ce que vous voulez garder.
- Accès à **toutes** les photos (originaux et retouches), téléchargement en masse (ZIP par jour ou par événement).
- Gestion des galeries clients : voir, prolonger, révoquer, réassocier une photo.
- Statistiques : photos par jour, scans, taux de reconnaissance, téléchargements.
- Gestion des utilisateurs, des rôles et des presets.
- Journal d'audit.

---

## 7. Rôles et droits
| Rôle | Droits |
|---|---|
| **Administrateur ForLife** | Tout : utilisateurs, paramètres, suppression définitive |
| **Photographe** | Séances, presets, tous les dossiers, correction des associations |
| **Assistant** (option) | Imprimer les QR, aider les clients ; pas de téléchargement en masse |
| **Client** | Sa galerie uniquement, pendant 30 jours, sans compte |

---

## 8. Base de données (Cloud Firestore)

```
studios/{studioId}                 nom, fuseau, logo, parametres
users/{uid}                        nom, email, role, studioId, mfa
cameras/{cameraId}                 modele (FX30 | A7III), serie, connexion (usb | ftp), derniereConnexion
presets/{presetId}                 nom, parametres, lutPath, version, actif
dayFolders/{folderId}              studioId, date, lieu?, type (studio | evenement), statut, nbPhotos
  photos/{photoId}                 chemins {original, hd, web, thumb}, exif, statut, presetVersion,
                                   nettete, yeuxFermes, masquee, creeLe
  faces/{faceId}                   photoId, embedding (vecteur 128), bbox, qualite
clientGalleries/{galleryId}        folderId, tokenHash, embeddingClient (chiffré, supprimé à l'expiration),
                                   photoIds[], whatsapp? (numéro), whatsappStatut (envoye | echec | sans),
                                   consentement {image, visage, whatsapp, date},
                                   creeLe, expireLe (+30 j), revoque
accessLogs/{logId}                 galleryId, action (vue | telechargement | zip), horodatage, ipHash
auditLogs/{logId}                  uid, action, objet, horodatage
```
- La règle de cycle de vie de Cloud Storage **supprime tous les fichiers de plus de 30 jours** (originaux compris), et une purge Firestore efface les entrées correspondantes.
- Index **vectoriel** Firestore sur `faces.embedding`, avec recherche limitée au `folderId` du jour.
- Index composites sur `photos(statut, creeLe)` et `clientGalleries(expireLe)`.

### Cloud Storage
```
studios/{studioId}/{AAAA-MM-JJ[_lieu]}/originaux/…
                                      /hd/…  /web/…  /thumbs/…
```

---

## 9. Sécurité

**Accès**
- **Firestore et Storage fermés par défaut** (règles de sécurité). Les clients n'y accèdent **jamais directement** : une Cloud Function vérifie leur jeton et renvoie des **URL signées** valables 15 min.
- Liens clients : jetons aléatoires de 128 bits ou plus, seul leur hachage est stocké. **Expiration automatique à 30 jours** et révocation possible à tout moment.
- Le QR du jour ne permet que la **recherche par selfie** dans le dossier du jour. Il n'ouvre aucune liste de photos.
- Personnel : **double authentification obligatoire** (Identity Platform), sessions expirantes, rôles portés par les *custom claims* de Firebase.
- La Station s'authentifie avec un **compte de service** aux droits limités à l'envoi.

**Reconnaissance faciale**
- Seuil de correspondance prudent : il vaut mieux « ne pas trouver » que « montrer la photo de quelqu'un d'autre ».
- **Contrôle de présence réelle** pour empêcher de chercher une personne à partir de sa photo affichée sur un écran.
- **Limitation à 5 recherches par appareil et par heure**, et **Firebase App Check** contre les robots.
- Recherche limitée **au jour ou à l'événement en cours** : impossible de fouiller les archives.

**Données personnelles** (loi ivoirienne n° 2013‑450, ARTCI, et RGPD pour les clients européens)
- Le visage est une **donnée biométrique sensible** : consentement explicite, finalité unique (retrouver ses photos), **selfie jamais stocké**.
- **Purge automatique** (Cloud Function planifiée chaque nuit) : au‑delà de 30 jours, suppression des **photos (originaux compris)**, des galeries clients, des empreintes de visage et des numéros WhatsApp. **La copie locale de l'iMac est purgée aussi**, sauf les dossiers archivés volontairement.
- WhatsApp : consentement explicite à recevoir le message, aucun message marketing sans accord séparé.
- Politique de confidentialité et mentions affichées sur la page du QR.
- **Formalités ARTCI à réaliser** (déclaration ou autorisation du traitement biométrique) : à vérifier avec un juriste.
- Hébergement Firebase : choisir la région **europe-west1 (Belgique)**, la plus proche avec un bon débit vers Abidjan, et le mentionner dans la politique.

**Fiabilité**
- Originaux en double pendant 30 jours (iMac et Cloud Storage). Export hebdomadaire de Firestore.
- ⚠️ Après 30 jours, **la suppression est définitive** : le back‑office prévient à J‑5.
- Transport en HTTPS ; FTPS ou Wi‑Fi dédié et isolé pour le FX30.
- **Wi‑Fi réservé aux appareils photo** : mot de passe jamais communiqué aux clients ; FTP protégé par mot de passe et limité aux adresses des boîtiers ; réseau appareils séparé du Wi‑Fi invités au bureau.
- Journal d'audit et alertes (Firebase Alerts / Cloud Monitoring).

---

## 10. UI / UX

- **Identité ForLife Studio** (logo fourni, `docs/studio-app/brand/forlife-studio-logo.webp`) :
  - **Orange ForLife `#EA7821`** : couleur d'action (boutons, progression, accents) ;
  - **Brun espresso `#3B251F`** : textes, fonds sombres de la Station ;
  - **Blanc cassé `#FFF8F2`** : fond de la galerie client ;
  - motif du **diaphragme** utilisé comme animation d'attente (« recherche de vos photos… ») et comme icône de déclenchement ;
  - formes arrondies du « F » (coins très ronds, pilules) reprises dans les boutons et les cartes ;
  - typographie : une sans‑serif géométrique et ronde (par exemple **Poppins** ou **Outfit**, gratuites).
  - Il faudra une **version vectorielle du logo** (SVG ou PDF) pour l'impression des badges et des QR (§15).
- **Station** : mode sombre brun et neutre (pour juger les couleurs), accents orange, grandes miniatures, statut très lisible de loin.
- **Client** : mobile d'abord, trois écrans maximum avant de voir ses photos (scan → selfie → galerie).
- Écrans clés :
  1. Station : tableau de bord, séance en direct, presets, boîtiers, impression des QR.
  2. Client : accueil et consentement, selfie guidé (ovale, conseils de lumière), « Recherche… », galerie, plein écran, téléchargement.
  3. Admin : calendrier, dossier du jour, galeries clients, statistiques, utilisateurs.
- Accessibilité : contrastes WCAG AA, zones tactiles de 44 px, textes clairs.

---

## 11. Exigences non fonctionnelles
| Critère | Cible |
|---|---|
| Délai entre déclenchement et photo dans la galerie (JPEG, 4G correcte, iMac 2015) | **20 s ou moins** hors rafale |
| Délai en extérieur (téléphone, 4G correcte) | **30 s ou moins** hors rafale |
| **Remise sur place** (photo visible et téléchargeable par le client) | **10 à 20 s** après le déclenchement, en studio comme en extérieur, 4G correcte |
| Autonomie en extérieur | Au moins 4 h de séance avec batterie externe |
| Rafale | Au moins 10 images/s acceptées sans perte (mise en file) |
| Recherche selfie | Résultat en **3 s ou moins** pour un jour de 5 000 photos |
| Précision | Moins de 1 % de fausses correspondances (seuil réglable) |
| Hors ligne | Capture et retouche 100 % fonctionnelles, envoi au retour du réseau |
| Galerie client | Premier affichage en moins de 2 s en 4G |
| Compatibilité | Appli extérieur : Android 11+. Station : macOS 12 Monterey ou plus récent (iMac 2015), Windows 10/11 en option. Clients : Android 9+, iOS 15+, navigateurs récents |

---

## 12. Planning indicatif
| Lot | Contenu | Durée |
|---|---|---|
| **Semaine 1 : essais réels** | Mise à jour des firmwares ; **FX30 en Wi‑Fi FTP** (bureau → iMac, téléphone → appli) ; **A7 III en Wi‑Fi PC Remote** (bureau et téléphone) ; plan B USB | 1 semaine |
| **MVP 1** | Station : capture USB (A7 III et FX30) et FTP (FX30), dossier du jour, 3 presets, envoi vers Firebase. Back‑office simple. Galerie par lien | 4 à 5 semaines |
| **MVP 1 bis** | Appli Android « ForLife Capture » (point d'accès, réception Wi‑Fi, retouche express, envoi en deux temps), moteur cloud (Cloud Run) | + 4 semaines |
| **MVP 2** | Reconnaissance faciale (indexation et selfie), QR du jour et d'événement, expiration à 30 jours, purge, consentement | + 3 à 4 semaines |
| **V1** | Retouche de peau avancée, éditeur de presets, séance de calibration, appli photographe PWA, statistiques, mode extérieur optimisé | + 3 à 4 semaines |

---

## 13. Coûts récurrents estimés (Firebase, offre Blaze à l'usage)
Hypothèse : 1 000 photos par jour, environ 3 Mo par photo pour l'ensemble des versions, et 500 Go de téléchargements par mois. Avec une conservation de 30 jours, le stockage **reste stable** (environ 90 Go) au lieu de grossir.
- Logiciels de retouche et de reconnaissance faciale : **0 FCFA**.
- Cloud Storage : environ 0,026 $/Go/mois, soit environ **3 $/mois** pour 90 Go.
- Sortie réseau (téléchargements des clients) : environ 0,12 $/Go, soit environ **60 $/mois** pour 500 Go. C'est le poste principal : la galerie affiche la version web, et la HD n'est servie qu'au téléchargement.
- Firestore, Functions, Hosting et Auth : souvent **moins de 10 $/mois** à ce volume.
- **Cloud Run** (retouche des photos d'extérieur) : quelques secondes de calcul par photo, soit environ **1 à 5 $/mois** pour quelques milliers de photos (une partie est incluse dans l'offre gratuite).
- **Forfait data** du téléphone : environ 1,5 Go par séance de 500 photos.
- **WhatsApp Business (API Cloud de Meta)** : messages « utilitaires » facturés par Meta à quelques centimes (environ 1 à 5 FCFA, voire moins, selon le barème Afrique en vigueur), soit environ **5 à 15 $/mois** pour 1 000 clients. Il faut un numéro dédié à ForLife Studio et un compte Meta Business vérifié.
- **Total estimé : environ 75 à 90 $/mois**, très majoritairement pour les téléchargements des clients.
- Matériel conseillé : un SSD externe pour l'iMac (environ 60 à 80 €).

---

## 14. Risques et parades
| Risque | Parade |
|---|---|
| Le Wi‑Fi PC Remote de l'A7 III ne fonctionne pas avec notre appli | Constaté en semaine 1 ; plan B câble USB‑C court ; à terme, remplacement par un A7 IV (FTP automatique) |
| Erreur de reconnaissance faciale | Seuil prudent, bouton « Ce n'est pas moi », correction par le photographe |
| Usurpation (selfie d'une autre personne) | Contrôle de présence réelle, recherche limitée au jour, limitation du nombre d'essais |
| Formalités ARTCI | À lancer en parallèle du développement |
| 4G faible en extérieur | Version légère envoyée d'abord, priorité à la dernière photo ; sans réseau, file d'attente et lien WhatsApp automatique au retour |
| Batterie du téléphone | Batterie externe, écran éteint pendant la séance |
| Puissance limitée de l'iMac 2015 | Traitement en file d'attente, modèles légers, SSD externe ; ajout possible d'un Mac mini (M1 ou plus récent) plus tard sans changer l'application |
| Suppression définitive à 30 jours | Alerte à J‑5, bouton « Tout télécharger », archivage local volontaire |
| Validation Meta pour WhatsApp (quelques jours) | Lien dans le navigateur toujours disponible en attendant |

---

## 15. Points restant à préciser
Tous les points bloquants sont tranchés. Le logo vectoriel a été reçu et converti (`brand/forlife-com-logo-horizontal.svg` et `brand/forlife-com-logo-vertical.svg`).

À prévoir côté ForLife pour la mise en service :
- un **téléphone Android dédié** et une **puce data** pour l'extérieur (§3.5) ;
- un **numéro de téléphone dédié** à ForLife Studio pour WhatsApp Business (il ne doit pas déjà être utilisé dans l'appli WhatsApp) ;
- un compte **Meta Business** ;
- l'accès au projet **Firebase** existant de forlife.com (passage à l'offre Blaze, paiement à l'usage) ;
- les deux boîtiers pendant la **semaine de prototypes**, pour les tests réels.

*Ce document sert de base de développement. Prochaine étape : semaine de prototypes, puis MVP 1 (Station macOS + Firebase) et MVP 1 bis (appli Android + moteur cloud).*
