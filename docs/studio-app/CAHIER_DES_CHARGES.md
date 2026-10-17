# Cahier des charges — « ForLife Studio » (version 0.1, brouillon à valider)

> Application de capture, de retouche automatique et de livraison par QR code pour le studio photo de **forlife.com**.
> Date : 17 octobre 2026 · Statut : **à valider** (voir §14 « Questions à trancher »)

---

## 1. Résumé

ForLife Studio relie les boîtiers **Sony FX30** et **Sony Alpha 7** à une chaîne de traitement automatique :

1. **Capture** : le photographe déclenche, en vue par vue ou en rafale.
2. **Réception** : la photo arrive tout de suite sur la « Station » du studio (PC portable ou mini‑PC).
3. **Retouche automatique** : un **preset** choisi avant la séance est appliqué à chaque image (couleur, exposition, peau, recadrage, filigrane).
4. **Publication** : l'image retouchée part dans le **dossier du jour** (`2026-10-17`, par exemple) sur le cloud ForLife.
5. **Accès client** : le client scanne un **QR code** (badge, tenue, comptoir) et ne voit **que les photos du jour**, ou seulement les siennes (voir §6.4).
6. **Back‑office** : seul le photographe ou l'administrateur ForLife voit tous les dossiers, télécharge les originaux et les retouches, et gère les accès.

---

## 2. Étude de l'existant (benchmark)

| Solution | Ce qu'elle fait bien | Limites pour ForLife |
|---|---|---|
| **Zno Instant** | Envoi pendant la séance, retouche IA automatique, galerie par QR, reconnaissance faciale par selfie | Payant (abonnement ou crédits), données hébergées chez un tiers, marque Zno visible |
| **Evoto Instant** (Evoto AI) | Retouche IA de la peau très poussée, en connexion directe (tethering) | Payant à l'image ou par abonnement, dépend du cloud Evoto |
| **Kamero, SnapNest, Kwikpic** | Galeries d'événement en temps réel, QR, reconnaissance faciale | Payants, orientés événementiel en Inde ou aux États‑Unis, peu de contrôle sur la retouche |
| **Pixieset, Pic‑Time, ShootProof** | Belles galeries clients, vente de tirages | Pas de capture en direct ni de retouche automatique |
| **Lightroom Classic (tethering)** et **Capture One Live** | Référence de la retouche, presets | Payants, pas de livraison client par QR, pas de dossier du jour automatique |
| **SkinFiner** et **Retouch4me** | Lissage de peau automatique de qualité | Payants, logiciels de bureau, pas d'automatisation de bout en bout |
| **ShutterSnitch** (iOS) | Réception FTP depuis le boîtier, actions automatiques | iOS uniquement, pas de galerie client |
| **Sony Creators' App** | Appli officielle : télécommande, transfert, FTP | Pas de retouche par lot, pas de galerie client |

**Positionnement de ForLife Studio**, ce qui le distingue de l'existant :
- **Coût de licence nul pour la retouche** : moteurs open source intégrés (voir §5), sans crédits à l'image.
- **Données maîtrisées** : hébergement ForLife, aux couleurs de ForLife, sans marque tierce.
- **QR permanent et intelligent** : un QR imprimé une seule fois (badge, tenue) mène **toujours au dossier du jour**.
- **Presets propres au studio** (rendu « signature ForLife ») au lieu des styles génériques des plateformes.
- **Pensé pour le contexte local** : réseau parfois instable (file d'attente hors ligne), paiement Mobile Money en option, conformité à la loi ivoirienne sur les données personnelles.

---

## 3. Point technique essentiel : le Bluetooth ne suffit pas

Le **Bluetooth** des Sony sert à la **télécommande**, à l'appairage et au géomarquage. Son débit (quelques centaines de Ko/s) est trop faible pour transférer des photos (25 à 60 Mo par RAW, plusieurs par seconde en rafale).

Il faut donc combiner trois voies :

| Voie | Usage | FX30 | Alpha 7 (IV/V…) |
|---|---|---|---|
| **Bluetooth** | Appairage, réveil du boîtier, géoloc, déclenchement à distance | Oui | Oui |
| **Wi‑Fi FTP (transfert en arrière‑plan)** | **Voie principale sans fil** : chaque photo est poussée automatiquement vers le serveur FTP de la Station | Oui (selon firmware) | Oui (A7 IV et suivants) |
| **USB‑C (tethering PTP)** | **Voie la plus rapide et la plus fiable** en studio fixe, idéale pour les rafales | Oui | Oui (Camera Remote SDK de Sony pour A7 IV, A7S III…) |

➡️ **Recommandation** : en studio, **USB‑C** ; en mobilité ou en événement, **Wi‑Fi FTP** ; et le **Bluetooth** pour l'appairage et le confort. L'application propose les trois et bascule automatiquement de l'une à l'autre.

**Rafales** : en rafale, configurer le boîtier en **RAW + JPEG** et n'envoyer que le JPEG (ou un JPEG réduit) en temps réel. Les RAW sont rapatriés ensuite par USB ou carte SD pour les retouches premium.

---

## 4. Architecture proposée

```
 [Sony FX30 / A7]──USB-C / Wi-Fi FTP──►[ STATION STUDIO ]──Internet──►[ CLOUD FORLIFE ]──►[ Clients (QR) ]
        ▲  Bluetooth (appairage, télécommande)    │ • Réception (FTP/USB)          │ • API + base de données  │ • Galerie web (PWA)
        └────────────[ Appli mobile photographe ]─┤ • Moteur de retouche          │ • Stockage objets         │
                         (choix du preset,         │ • File d'attente hors ligne   │ • Back-office admin       │
                          suivi en direct)         │ • Upload                      │ • QR / liens / expiration │
```

### 4.1 Composants
1. **Station Studio** (Windows, macOS ou Linux ; application de bureau) :
   - serveur **FTP/FTPS** intégré pour recevoir les images des boîtiers ;
   - module **tethering USB** (Sony Camera Remote SDK ou gPhoto2/libgphoto2) ;
   - **moteur de retouche** local, plus rapide et sans dépendre d'Internet ;
   - **file d'attente** persistante : si Internet coupe, rien n'est perdu et l'envoi reprend au retour du réseau.
2. **Appli mobile du photographe** (Android et iOS, en PWA ou React Native) :
   - choix du **preset actif** ;
   - suivi en direct (miniatures, statut « reçu », « traité », « publié ») ;
   - génération ou affichage du QR du jour, marquage « client suivant ».
3. **Cloud ForLife** :
   - **API** (Node.js/NestJS ou Python/FastAPI) ;
   - **PostgreSQL** pour la base de données ;
   - **stockage objets** (Cloudflare R2, S3 ou Firebase Storage, déjà utilisé sur le site) avec CDN ;
   - **galerie client** (Next.js, PWA) et **back‑office** admin.

### 4.2 Pile technique recommandée
| Couche | Choix | Pourquoi |
|---|---|---|
| Station | **Electron + Python** (ou Tauri + Rust/Python) | Accès USB et FTP, bibliothèques image Python |
| Retouche | **LibRaw/rawpy, OpenCV, libvips, LUT 3D (.cube), MediaPipe, ONNX Runtime** | Gratuits, rapides, intégrables |
| Backend | **Supabase** (Postgres + Auth + Storage + RLS) **ou** Firebase (déjà en place sur forlife) | Rapide à monter, sécurité au niveau des lignes |
| Front | **Next.js + Tailwind**, PWA | Une seule base pour le client et l'admin |
| QR | `qrcode` (génération), export PDF ou PNG haute définition pour l'impression | |

---

## 5. Moteur de retouche (alternatives gratuites à Lightroom et SkinFiner)

### 5.1 Briques open source
| Besoin | Outil gratuit | Licence |
|---|---|---|
| Développement RAW (ARW Sony) | **LibRaw / rawpy** ; **darktable-cli** ou **RawTherapee-cli** en mode lot | LGPL / GPL (appel en ligne de commande, sans liaison au code) |
| Réglages de base (expo, balance des blancs, contraste, courbes) | **OpenCV**, **libvips** | Apache‑2.0 / LGPL |
| Looks et étalonnage couleur | **LUT 3D .cube** (création possible dans darktable ou DaVinci Resolve gratuit) | — |
| Détection du visage et masque de peau | **MediaPipe Face Mesh** / Selfie Segmentation | Apache‑2.0 |
| Lissage de peau « type SkinFiner » | **Séparation de fréquences + filtre bilatéral guidé** sur le masque de peau, avec préservation de la texture | Code maison |
| Retrait des imperfections | Inpainting OpenCV / **LaMa** (ONNX) | Apache‑2.0 |
| Restauration des visages (option) | **CodeFormer**, **GFPGAN** | ⚠️ CodeFormer n'est pas libre pour un usage commercial, GFPGAN est sous Apache‑2.0 |
| Détourage et fond | **rembg / U²‑Net**, **BiRefNet** | MIT |
| Agrandissement | **Real‑ESRGAN** | BSD |
| Tri automatique (yeux fermés, flou) | Détection de clignement (MediaPipe), variance du Laplacien pour la netteté | — |

### 5.2 Pipeline automatique pour chaque photo
1. Lecture du JPEG ou du RAW, et des métadonnées EXIF (boîtier, heure, numéro).
2. **Correction auto** : exposition, balance des blancs, débouchage des ombres, récupération des hautes lumières.
3. **Look du preset** (LUT + courbes + saturation par teinte).
4. **Portrait** : visage détecté → lissage de peau (intensité réglable de 0 à 100), yeux, dents, retrait d'imperfections.
5. **Recadrage et format** (4:5 Instagram, 2:3 tirage, 1:1…), avec redressement de l'horizon.
6. **Netteté de sortie** et **filigrane ForLife** sur les versions d'aperçu.
7. **Contrôle qualité** : marquage automatique des photos floues ou aux yeux fermés, masquées du client par défaut.
8. Export **web** (2048 px, environ 500 Ko), **HD** (pleine définition) et **miniature**.

Durée cible : **moins de 3 s par JPEG** sur un PC avec GPU d'entrée de gamme, **moins de 8 s** sans GPU. En rafale, les images passent en file d'attente parallèle.

### 5.3 Presets fournis au démarrage (modifiables)
- **Portrait Studio Signature** : peau douce et naturelle, tons chauds.
- **Peau mate et ébène** : rendu fidèle des carnations foncées, sans grisaille. C'est un point différenciant important.
- **Corporate / Badge** : neutre, fond uni, recadrage tête‑épaules.
- **Mode / Éditorial** : contraste, couleurs riches.
- **Noir & Blanc Classique**.
- **Événement rapide** : correction légère, priorité à la vitesse.
- Un **éditeur de preset** avec curseurs et aperçu avant/après sur une photo test.

---

## 6. Fonctionnalités détaillées

### 6.1 Côté photographe (Station et mobile)
- Appairer un ou plusieurs boîtiers (assistant pas à pas pour configurer le FTP sur le Sony, avec QR de configuration).
- Choisir le **preset actif**, modifiable à tout moment, sans effet rétroactif sauf demande.
- Lancer une **séance** : ouverture automatique du **dossier du jour** à la première connexion de la journée.
- Bouton **« Client suivant »** (ou scan du QR du client) pour regrouper les photos par client.
- Mur de **miniatures en direct**, avec un avant/après d'un geste.
- Masquer, supprimer ou mettre en favori une photo avant qu'elle ne soit visible du client.
- Relancer la retouche d'une sélection avec un autre preset.
- Indicateurs : batterie et stockage du boîtier, file d'envoi, état du réseau.

### 6.2 Dossier du jour (automatique)
- Nom : `AAAA-MM-JJ` (ex. `2026-10-17`), avec un suffixe si plusieurs studios ou lieux (`2026-10-17_Cocody`).
- Création **automatique** à la première photo reçue dans la journée, fuseau Africa/Abidjan.
- Sous‑dossiers : `originaux/`, `retouches/`, `web/`, et `clients/<code>/` si le mode par client est activé.

### 6.3 QR codes
| Type | Support | Comportement |
|---|---|---|
| **QR permanent « Studio »** | Badge, tenue, kakémono, comptoir | Lien fixe `forlife.com/s/<studio>` qui **redirige vers le dossier du jour**. Le QR imprimé ne change jamais |
| **QR client** (recommandé) | Ticket imprimé, carte, envoi WhatsApp ou SMS | Lien unique vers **les seules photos de ce client** |
| **QR de configuration** | Écran de la Station | Configure le FTP ou le Wi‑Fi du boîtier ou de l'appli mobile |

Export d'impression : PNG et SVG haute définition, et PDF de planche de badges, au logo ForLife.

### 6.4 Confidentialité de l'accès client : trois modes à choisir
1. **Mode « Jour »** (votre demande initiale) : le QR mène au dossier du jour, et **chaque client du jour voit les photos des autres clients du même jour**. C'est simple, mais pose un problème de confidentialité.
2. **Mode « Client »** (recommandé) : un QR ou un lien unique par client. Il voit **uniquement ses photos**, rangées dans le dossier du jour.
3. **Mode « Selfie »** (option, le plus moderne) : le client scanne le QR du jour, prend un selfie, et la **reconnaissance faciale** lui affiche ses photos. Le selfie est supprimé après la recherche et un consentement explicite est demandé.

### 6.5 Galerie client (web, sans application à installer)
- Ouverture en 1 s (miniatures chargées progressivement), au design aux couleurs de ForLife.
- Mise à jour en **temps réel** : les photos apparaissent pendant la séance.
- Téléchargement unitaire ou en ZIP, partage WhatsApp ou Instagram.
- Option : **PIN à 4 chiffres** et **expiration** du lien (par ex. 30 jours).
- Option : **paiement** (Mobile Money Orange, MTN, Moov ou Wave, et carte) pour débloquer la HD sans filigrane, et commande de tirages.
- Option : avis Google ou abonnement Instagram après le téléchargement.

### 6.6 Back‑office (photographe et admin ForLife)
- Accès à **tous les dossiers** (calendrier, recherche par date, client, téléphone).
- Téléchargement en masse (originaux et retouches).
- Gestion des QR, des liens, des expirations et des révocations.
- Statistiques : photos par jour, scans, téléchargements, ventes.
- Gestion des utilisateurs et des rôles.
- Journal d'audit (qui a vu, téléchargé ou supprimé quoi).

---

## 7. Rôles et droits

| Rôle | Droits |
|---|---|
| **Administrateur ForLife** | Tout : utilisateurs, presets, paramètres, suppression définitive |
| **Photographe** | Séances, presets, tous les dossiers ; suppression limitée |
| **Assistant** (option) | Marquer « client suivant », imprimer les QR ; pas de téléchargement en masse |
| **Client** | Lecture et téléchargement de **sa** galerie (ou celle du jour selon le mode), sans compte |

---

## 8. Base de données (PostgreSQL, schéma logique)

```
studios        (id, nom, lieu, fuseau, logo_url, ...)
users          (id, studio_id, nom, email, role[admin|photographe|assistant], 2fa_active, ...)
cameras        (id, studio_id, modele[FX30|A7IV|...], numero_serie, mode_connexion[usb|ftp], derniere_connexion)
presets        (id, studio_id, nom, parametres_json, lut_url, version, actif)
day_folders    (id, studio_id, date UNIQUE(studio_id,date), cree_le, statut)
sessions       (id, day_folder_id, photographe_id, preset_id, debut, fin)
clients        (id, studio_id, nom?, telephone?, email?, consentement_image, consentement_facial, cree_le)
galleries      (id, day_folder_id, client_id NULL, mode[jour|client|selfie], token_hash, pin_hash?, expire_le, revoque)
photos         (id, day_folder_id, session_id, client_id?, camera_id, fichier_original, fichier_retouche,
                fichier_web, miniature, exif_json, statut[recue|en_traitement|publiee|masquee|erreur],
                score_nettete, yeux_fermes, preset_version, cree_le)
processing_jobs(id, photo_id, etape, statut, tentatives, erreur, duree_ms)
qr_codes       (id, studio_id, type[permanent|client|config], cible, gallery_id?, imprime_le)
access_logs    (id, gallery_id, ip_hash, user_agent, action[vue|telechargement|zip], horodatage)
payments       (id, gallery_id, montant, devise=XOF, fournisseur, statut, reference)   -- option
audit_logs     (id, user_id, action, objet, horodatage)
```
Index sur `photos(day_folder_id, client_id, statut)` et `galleries(token_hash)`.

---

## 9. Sécurité

- **Liens et QR** : jetons aléatoires de 128 bits ou plus, seul le hachage est stocké, pas d'identifiants devinables comme `/2026-10-17`. Le QR permanent ne donne accès qu'au **jour en cours**, et l'accès à un jour passé est refusé.
- **Fichiers** : stockage **privé**, servi uniquement par des **URL signées** à durée courte (5 à 15 min). Pas de dossier public.
- **Cloisonnement** : règles au niveau des lignes (Supabase RLS ou Firebase Security Rules). Un client ne peut techniquement lire que sa galerie.
- **Comptes staff** : mot de passe fort, **double authentification (2FA)** obligatoire pour admin et photographe, sessions expirantes.
- **Transport** : HTTPS/TLS partout ; **FTPS** ou réseau Wi‑Fi dédié et isolé pour les boîtiers (le FTP simple ne chiffre pas).
- **Anti‑abus** : limitation du débit des scans et des téléchargements, PIN optionnel, révocation immédiate d'un lien.
- **Filigrane** sur les aperçus et les métadonnées de droits (IPTC « © ForLife »).
- **Sauvegardes** : originaux copiés en double (disque de la Station + cloud), sauvegarde quotidienne de la base, rétention définie.
- **Journalisation** et alertes en cas d'accès anormal.
- **Données personnelles**, conformément à la **loi ivoirienne n° 2013‑450** (ARTCI) et au RGPD si vous avez des clients européens :
  - consentement au droit à l'image recueilli avant ou pendant la séance (case à cocher ou signature sur tablette) ;
  - données biométriques (mode selfie) **uniquement avec consentement explicite**, sans stockage du selfie ;
  - durée de conservation affichée, et droit de suppression sur demande ;
  - déclaration ou autorisation auprès de l'ARTCI à vérifier.

---

## 10. UI / UX

**Identité** : reprendre la charte de forlife.com (couleurs, typographies, logo, déjà présents dans `assets/` et `css/`). Mode sombre par défaut côté photographe, pour ne pas fausser la perception des couleurs.

**Écrans de la Station et de l'appli photographe**
1. Tableau de bord : boîtiers connectés, dossier du jour, file d'attente, réseau.
2. Séance en direct : grand aperçu, filmstrip, preset actif, bouton « Client suivant », QR du client.
3. Éditeur de presets : curseurs, avant/après, photo de référence.
4. Assistant de connexion des boîtiers (FX30 et A7, captures d'écran des menus Sony).
5. Impression des QR et des badges.

**Écrans client (mobile d'abord)**
1. Accueil de la galerie : logo, date, nom du client, compteur de photos.
2. Grille de photos, vue plein écran avec balayage.
3. Téléchargement et partage ; paiement HD en option.
4. Écran d'état vide : « Vos photos arrivent… » avec animation et actualisation automatique.

**Accessibilité** : contrastes WCAG AA, zones tactiles de 44 px, interface en français, et en anglais en option.

---

## 11. Exigences non fonctionnelles

| Critère | Cible |
|---|---|
| Délai entre déclenchement et apparition chez le client (JPEG, bonne connexion) | **moins de 10 s** |
| Rafale | Au moins 10 images/s acceptées sans perte (file d'attente) |
| Hors ligne | Studio 100 % fonctionnel sans Internet, synchronisation au retour du réseau |
| Disponibilité du cloud | 99,5 % |
| Capacité | 5 000 photos par jour et par studio, sans dégradation |
| Galerie client | Chargement initial de moins de 2 s en 4G |
| Compatibilité | Windows 10+ / macOS 12+ pour la Station ; Android 9+ / iOS 15+ pour l'appli |

---

## 12. Planning indicatif (lots)

| Lot | Contenu | Durée estimée |
|---|---|---|
| **MVP 1** | Réception FTP et USB, dossier du jour, 3 presets, upload, galerie « jour » ou « client » par QR, back‑office simple | 4 à 6 semaines |
| **V1** | Retouche de peau avancée, éditeur de presets, appli mobile photographe, PIN et expiration, impression des badges | + 4 semaines |
| **V2** | Reconnaissance faciale par selfie, paiement Mobile Money, tirages, statistiques | + 4 à 6 semaines |

---

## 13. Coûts récurrents estimés (hors développement)

- Logiciels de retouche : **0 FCFA** (open source).
- Hébergement : Supabase ou Firebase, offre gratuite puis environ 25 $/mois ; stockage R2 à environ 0,015 $/Go/mois sans frais de sortie (environ 10 à 20 $/mois pour quelques To par an).
- Domaine : sous‑domaine `photos.forlife.com`, sans coût supplémentaire.
- Matériel : un PC Station avec GPU recommandé, un routeur Wi‑Fi dédié aux boîtiers, des câbles USB‑C de qualité.

---

## 14. Questions à trancher pour valider le cahier des charges

1. **Modèle exact de l'« Alpha 7 »** (A7 III, A7 IV, A7C II, A7 V ?) et **version de firmware** des boîtiers ? Le FTP et le tethering en dépendent : l'A7 III, par exemple, ne fait pas de FTP en arrière‑plan.
2. **Confidentialité** : mode « Jour » (tous les clients du jour voient tout), mode « Client » (chacun ses photos, recommandé) ou mode « Selfie » (reconnaissance faciale) ?
3. **Lieu de prise de vue** : uniquement en studio fixe (USB conseillé), aussi en extérieur ou en événement (Wi‑Fi FTP), ou les deux ?
4. **Station** : disposez‑vous d'un PC ou d'un Mac au studio ? Lequel (et avec carte graphique) ? Sinon, voulez‑vous une solution **100 % mobile** (tablette Android), moins performante en retouche ?
5. **Format** : JPEG seulement pour le direct, ou aussi RAW pour une retouche premium différée ?
6. **Monétisation** : photos gratuites pour le client, ou HD payante (Mobile Money) et vente de tirages ?
7. **Durée de conservation** des galeries clients (7, 30, 90 jours ?) et des archives internes ?
8. **Combien de photographes et de studios** en simultané ? Faut‑il un suffixe de lieu dans le nom du dossier du jour ?
9. **Hébergement** : réutiliser **Firebase** (déjà utilisé pour forlife.com) ou passer sur **Supabase** (Postgres) ? Mon avis : Supabase pour la base relationnelle, ou Firebase si vous voulez tout sur un seul fournisseur.
10. **Look « signature »** : avez‑vous des photos de référence ou des presets Lightroom existants (.xmp) à reproduire ? On peut les convertir en LUT.
11. **Intensité de la retouche de peau** : naturelle et légère, ou poussée façon « beauty » ? Selon le type de client ?
12. **Collecte client** : demander nom et téléphone ou WhatsApp (pour envoyer le lien), ou rester anonyme avec le QR seul ?
13. **Langues** : français seul, ou français et anglais ?
14. **Budget et délai** visés pour le MVP ?

---

*Une fois ces réponses obtenues, ce document passera en v1.0 et servira de base au développement (MVP 1).*
