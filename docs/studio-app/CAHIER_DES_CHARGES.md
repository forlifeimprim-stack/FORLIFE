# Cahier des charges — « ForLife Studio » (version 1.0)

> Application de capture, de retouche automatique et de livraison par reconnaissance faciale pour le studio photo de **forlife.com**.
> Date : 17 octobre 2026 · Statut : **validé sur les points principaux**. Il reste quelques points secondaires (§15).

### Décisions validées par ForLife
| Sujet | Décision |
|---|---|
| Boîtiers | **Sony FX30** et **Sony Alpha 7 III** (A7 III) |
| Accès client | **Selfie + reconnaissance faciale** : le client ne voit que ses photos |
| Lieux | **Studio** et **extérieur** (événements, sorties) |
| Station | **PC au studio** (déjà disponible) |
| Prix pour le client | **Gratuit** (inclus dans la prestation) : pas de paiement ni de filigrane bloquant |
| Durée d'accès client | **30 jours** |
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

### 3.1 Ce qu'il faut savoir
- Le **Bluetooth** sert uniquement à l'appairage, au géomarquage et à la télécommande. Il est trop lent pour transférer des photos.
- **L'A7 III ne sait pas envoyer ses photos en Wi‑Fi au fur et à mesure de la prise de vue.** Le transfert FTP automatique n'existe qu'à partir de l'A7 IV. Son Wi‑Fi « Envoyer vers ordinateur » ne transfère qu'après coup, et lentement.
- **Pour l'A7 III, la voie temps réel est donc le câble USB** (mode « PC Remote »). Elle est rapide, fiable et adaptée aux rafales.
- **Le FX30 dispose du transfert FTP automatique** en Wi‑Fi (avec un firmware récent), en plus de l'USB.

### 3.2 Modes de connexion retenus
| Situation | FX30 | A7 III |
|---|---|---|
| **Studio** | USB‑C vers le PC Station (recommandé) ou Wi‑Fi FTP | **USB** vers le PC Station (mode PC Remote) |
| **Extérieur** | **Wi‑Fi FTP** vers un PC portable ou un mini‑PC, avec routeur 4G/5G de poche | **USB** vers un PC portable en bandoulière ou sur table, ou vers un mini‑PC dans un sac |
| **Secours** | Import de la carte SD : la Station traite le dossier importé | Idem |

Logiciel : **libgphoto2** (gratuit), qui pilote les Sony en mode PC Remote et récupère chaque image dès le déclenchement. Le **Sony Camera Remote SDK** reste une solution de repli si un modèle pose problème. Le serveur FTP est intégré à la Station pour le FX30.

**Rafales** : boîtier en **RAW + JPEG**. En direct, seul le **JPEG** est récupéré et traité. Les RAW sont importés en fin de journée pour d'éventuelles retouches premium.

> 💡 Si vous voulez un jour le **sans‑fil sur l'A7 III**, la seule vraie solution est de changer de boîtier (A7 IV ou plus récent). L'application est prête pour ces modèles.

### 3.3 Matériel à prévoir pour l'extérieur
- un PC portable (Windows 10+, 16 Go de RAM, GPU conseillé), ou un mini‑PC alimenté par une batterie externe ;
- un routeur 4G/5G de poche, qui crée aussi le Wi‑Fi dédié au FX30 ;
- des câbles USB‑C de 3 m de qualité, avec attache anti‑arrachement ;
- une batterie externe de 20 000 mAh ou plus.

---

## 4. Architecture

```
[FX30]──Wi-Fi FTP / USB──┐
[A7 III]─────USB─────────┤
                         ▼
               ┌────────────────────┐        ┌──────────────── FIREBASE ─────────────────┐
               │  STATION (PC)      │        │ Authentication (personnel + double auth.) │
               │  • réception       │  HTTPS │ Firestore (base de données + vecteurs)    │
               │  • retouche        │ ─────► │ Cloud Storage (photos, privé)             │
               │  • visages         │        │ Cloud Functions (accès, recherche, purge) │
               │  • file hors ligne │        │ Hosting (galerie client + back-office)    │
               └────────────────────┘        └───────────────────┬───────────────────────┘
                        ▲                                        │
       [Appli photographe (PWA)] ──── suivi en direct ───────────┤
                                                                 ▼
                                   [Client : scan du QR → selfie → ses photos, 30 jours]
```

### 4.1 Pile technique
| Couche | Choix |
|---|---|
| Station | **Electron** (interface) + **Python** (capture, retouche, visages), installable sous Windows |
| Capture | libgphoto2 (USB), pyftpdlib (serveur FTP/FTPS) |
| Retouche | rawpy/LibRaw, OpenCV, libvips, LUT 3D `.cube`, MediaPipe, ONNX Runtime |
| Visages | **OpenCV YuNet** (détection) + **SFace** (empreinte faciale). Licences Apache‑2.0, usage commercial autorisé |
| Base de données | **Cloud Firestore**, avec **recherche vectorielle** pour les visages |
| Fichiers | **Cloud Storage for Firebase** (privé), règles de cycle de vie |
| Logique serveur | **Cloud Functions 2ᵉ gén.** (Node.js ou Python) |
| Comptes du personnel | **Firebase Authentication + Identity Platform** (double authentification par SMS ou application) |
| Web (client et admin) | **Next.js / React + Tailwind**, en PWA sur **Firebase Hosting** (`photos.forlife.com`) |
| Selfie côté client | **ONNX Runtime Web** : l'empreinte est calculée dans le navigateur du client |

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

Durée cible : **3 s ou moins par photo** sur le PC Station avec GPU, **8 s ou moins** sans GPU, en traitement parallèle pour les rafales.

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
6. Le client arrive sur **sa galerie personnelle** :
   - un lien privé est créé, valable **30 jours** ;
   - il est conservé sur son téléphone, et peut être envoyé par WhatsApp ou SMS si le client donne son numéro (facultatif) ;
   - **les nouvelles photos de la journée s'ajoutent automatiquement** à sa galerie s'il est à nouveau reconnu.
7. Il télécharge ses photos en HD (une par une ou en ZIP) et les partage.
8. Bouton **« Ce n'est pas moi / il manque des photos »** : le photographe corrige l'association dans le back‑office.

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
                                   photoIds[], telephone?, consentement {image, visage, date},
                                   creeLe, expireLe (+30 j), revoque
accessLogs/{logId}                 galleryId, action (vue | telechargement | zip), horodatage, ipHash
auditLogs/{logId}                  uid, action, objet, horodatage
```
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
- **Purge automatique** (Cloud Function planifiée chaque nuit) : au‑delà de 30 jours, suppression des galeries clients, des empreintes de visage et des numéros de téléphone.
- Politique de confidentialité et mentions affichées sur la page du QR.
- **Formalités ARTCI à réaliser** (déclaration ou autorisation du traitement biométrique) : à vérifier avec un juriste.
- Hébergement Firebase : choisir la région **europe-west1 (Belgique)**, la plus proche avec un bon débit vers Abidjan, et le mentionner dans la politique.

**Fiabilité**
- Originaux en double : disque de la Station et Cloud Storage. Export hebdomadaire de Firestore.
- Transport en HTTPS ; FTPS ou Wi‑Fi dédié et isolé pour le FX30.
- Journal d'audit et alertes (Firebase Alerts / Cloud Monitoring).

---

## 10. UI / UX

- **Identité** : charte de forlife.com (couleurs, typographies, logo de `assets/` et `css/`).
- **Station** : mode sombre (neutre, pour juger les couleurs), grandes miniatures, statut très lisible de loin.
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
| Délai entre déclenchement et photo dans la galerie (JPEG, 4G correcte) | **15 s ou moins** |
| Rafale | Au moins 10 images/s acceptées sans perte (mise en file) |
| Recherche selfie | Résultat en **3 s ou moins** pour un jour de 5 000 photos |
| Précision | Moins de 1 % de fausses correspondances (seuil réglable) |
| Hors ligne | Capture et retouche 100 % fonctionnelles, envoi au retour du réseau |
| Galerie client | Premier affichage en moins de 2 s en 4G |
| Compatibilité | Station : Windows 10/11. Clients : Android 9+, iOS 15+, navigateurs récents |

---

## 12. Planning indicatif
| Lot | Contenu | Durée |
|---|---|---|
| **MVP 1** | Station : capture USB (A7 III et FX30) et FTP (FX30), dossier du jour, 3 presets, envoi vers Firebase. Back‑office simple. Galerie par lien | 4 à 5 semaines |
| **MVP 2** | Reconnaissance faciale (indexation et selfie), QR du jour et d'événement, expiration à 30 jours, purge, consentement | + 3 à 4 semaines |
| **V1** | Retouche de peau avancée, éditeur de presets, séance de calibration, appli photographe PWA, statistiques, mode extérieur optimisé | + 3 à 4 semaines |

---

## 13. Coûts récurrents estimés (Firebase, offre Blaze à l'usage)
Hypothèse : 1 000 photos par jour, environ 3 Mo par photo pour l'ensemble des versions, et 500 Go de téléchargements par mois.
- Logiciels de retouche et de reconnaissance faciale : **0 FCFA**.
- Cloud Storage : environ 0,026 $/Go/mois, soit environ **8 à 25 $/mois** la première année (le stockage grossit chaque mois).
- Sortie réseau (téléchargements des clients) : environ 0,12 $/Go, soit environ **60 $/mois** pour 500 Go. C'est le poste principal : la galerie affiche la version web, et la HD n'est servie qu'au téléchargement.
- Firestore, Functions, Hosting et Auth : souvent **moins de 10 $/mois** à ce volume.
- Pour réduire les coûts, déplacer les originaux de plus de 90 jours vers une classe de stockage d'archive (règle de cycle de vie).

---

## 14. Risques et parades
| Risque | Parade |
|---|---|
| L'A7 III n'a pas de Wi‑Fi temps réel | USB obligatoire (studio et extérieur) ; changement de boîtier envisageable plus tard |
| Réseau faible en extérieur | File d'attente locale, envoi différé, routeur 4G/5G |
| Erreur de reconnaissance faciale | Seuil prudent, bouton « Ce n'est pas moi », correction par le photographe |
| Usurpation (selfie d'une autre personne) | Contrôle de présence réelle, recherche limitée au jour, limitation du nombre d'essais |
| Formalités ARTCI | À lancer en parallèle du développement |

---

## 15. Points restant à préciser (non bloquants pour démarrer)
1. **Caractéristiques du PC Station** (processeur, RAM, carte graphique) ? Et avez‑vous un **PC portable** pour l'extérieur ?
2. **Nombre de photographes** travaillant en même temps, et nombre de lieux ou studios ?
3. **Numéro WhatsApp du client** : facultatif (recommandé), obligatoire, ou jamais demandé ?
4. **Conservation interne** des originaux après les 30 jours clients : 1 an, 3 ans, illimitée ?
5. **Intensité de la retouche de peau** par défaut : naturelle (recommandé) ou « beauty » marquée ?
6. **Langues** de la galerie client : français seul, ou français et anglais ?
7. **Petit logo ForLife** sur les photos HD des clients : oui (publicité gratuite) ou non ?
8. **Délai ou budget** visé pour la mise en service du MVP ?

*Ce document sert désormais de base de développement. Prochaine étape : MVP 1 (Station + Firebase).*
