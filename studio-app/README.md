# ForLife Studio — application

Application du studio photo ForLife : les photos des boîtiers (FX30, A7 III) arrivent en Wi‑Fi sur la **Station**, qui les retouche automatiquement, reconnaît les visages et les publie. Le client les retrouve avec un selfie.

Cahier des charges : [`../docs/studio-app/CAHIER_DES_CHARGES.md`](../docs/studio-app/CAHIER_DES_CHARGES.md)

| Dossier | Contenu | État |
|---|---|---|
| `station/` | Station (iMac du studio) : réception Wi‑Fi FTP et PC Remote, retouche, visages, file d'attente, interface | **Opérationnelle en local** |
| `web/` | **Application web** : espace photographe (dépôt des photos, retouche et visages dans le navigateur, QR du jour) + parcours client (selfie → ses photos, 30 jours) | **Prête** — mode démonstration sans Firebase, mode production avec Firebase |
| `firebase/` | Règles Firestore/Storage + Cloud Functions (galerie par selfie, URL signées, purge à 30 jours) | Prêtes à déployer |
| — | Appli Android « ForLife Capture » (extérieur) | À venir (MVP 1 bis) |

---

## Application web

- **Client** : `index.html#accueil` → consentement → selfie → ses photos (lien privé de 30 jours, WhatsApp, téléchargement).
- **Photographe** : `index.html#studio` → déposer ou photographier, retouche automatique, visages, QR du jour.
- Sans configuration Firebase (`web/js/config.js`), l'application tourne en **mode démonstration** : tout reste dans le navigateur.

### Mise en production sur Firebase (projet `forlifecom-6eef9`)
1. Console Firebase : passer à l'offre **Blaze** (Cloud Functions et URL signées), activer **Authentication (e‑mail/mot de passe)**, **Firestore** (région `europe-west1`) et **Storage**.
2. Créer le site d'hébergement : `npx firebase-tools hosting:sites:create forlife-studio`.
3. Copier la configuration « Web » du projet dans `web/js/config.js` (`FIREBASE_CONFIG`).
4. Depuis `studio-app/` : `npm --prefix firebase/functions install` puis
   `npx firebase-tools deploy --only hosting:studio,firestore:rules,storage,functions:studio`.
5. Créer le compte du photographe dans Authentication, puis lui donner le rôle :
   `node firebase/functions/scripts/set-staff.js photographe@forlife.com`.
6. (Option) Relier `photos.forlifecom.ci` au site dans Hosting > Domaine personnalisé.

## Installer la Station sur l'iMac (macOS 12 Monterey)

1. **Python 3.12** : installeur officiel sur python.org (« macOS 64-bit universal2 installer »).
2. **gphoto2** (A7 III en « Commande via PC ») : `brew install gphoto2`.
   Si Homebrew refuse Monterey, utilisez MacPorts : `sudo port install gphoto2`.
3. Dans un Terminal, depuis ce dossier :
   ```sh
   cd studio-app/station
   python3 -m venv .venv && source .venv/bin/activate
   pip install -e .
   ./models/download_models.sh        # modèles de visages (≈ 39 Mo)
   forlife-station init               # crée ~/ForLifeStudio et affiche les réglages du FX30
   forlife-station diag               # vérifie logiciels, réseau, boîtiers
   forlife-station run                # démarre la Station et ouvre l'interface
   ```
4. **Réseau** : l'iMac et les boîtiers doivent être sur le **même Wi‑Fi du bureau**, idéalement un réseau réservé aux appareils. Donnez à l'iMac une **adresse IP fixe** dans le routeur : c'est l'adresse saisie dans le FX30.

### Régler les boîtiers (une seule fois)

**FX30 (transfert FTP automatique)**
1. Mettre à jour le firmware Sony.
2. Menu Réseau > Wi‑Fi > se connecter au Wi‑Fi du bureau (et au point d'accès du téléphone ForLife pour l'extérieur).
3. Réseau > Transfert FTP > Paramètres serveur : saisir les valeurs affichées par `forlife-station init`.
4. Transfert auto pendant la prise de vue : **Activé**, type de fichier : **JPEG**.

**A7 III (Commande via PC)**
1. Mettre à jour le firmware Sony.
2. Réseau > Commande via PC > **Activé**.
3. Essai en Wi‑Fi : méthode de connexion « Point d'accès », appairage, puis dans `~/ForLifeStudio/config.json` :
   `"cameras": [{"name": "A7III", "port": "ptpip:<IP de l'A7 III>", "enabled": true}]`
4. Plan B, câble USB : `"port": "usb"`. Lancer `forlife-station diag` pour vérifier.

### Pendant la séance
- Choisir le **style de retouche** dans l'interface (s'applique aux photos suivantes).
- Cliquer sur le **dossier du jour** pour ajouter le nom d'un événement.
- **Import de carte SD** : copier les photos dans `~/ForLifeStudio/import`.
- Comparer **avant / après** en faisant glisser la poignée orange (ou flèches du clavier).

### Essayer les styles sur vos propres photos
```sh
forlife-station process ~/Images/essai/*.jpg --preset tous --out ~/Desktop/styles
```

## Développement
```sh
cd studio-app/station && pip install -e '.[dev]' && pytest
```
