# 🚀 Forlife Com' — Site Web Officiel & Engine d'Automatisation

Bienvenue dans le dépôt du site internet officiel et du hub d'automatisation marketing de **Forlife Com'**, l'agence de communication et de publicité (division de **Forlife Imprim**), basée à Bingerville, Côte d'Ivoire.

> **Slogan** : *"L'ami des PME, TPE, Écoles et Communautés"*  
> **Signature** : *"Donner du sens. Créer l'impact."* & *"Ensemble pour la vie !"*

---

## 📸 Aperçu des Fonctionnalités & Pages du Site

1. **Accueil (`index.html`)** :
   - Hero dynamique avec effet machine à écrire pour la cible (PME, TPE, Écoles, Communautés).
   - Bouton WhatsApp flottant avec message pré-rempli et anneau de pulsation.
   - Présentation courte de l'agence et du lien fort avec Forlife Imprim.
   - Aperçu des 7 expertises de l'agence.
   - Extrait du portfolio avec lazy loading et catégories.
   - Bandeau réassurance équipements pro : **Sony A7 III**, **Sony FX30**, **Drone DJI Mini 4 Pro**, **Imprimante DTF A2 industrielle**.
   - Chiffres clés animés et avis/pourquoi nous choisir.
   - Derniers articles de blog et CTA final.

2. **À propos (`a-propos.html`)** :
   - Histoire, vision, mission, valeurs fondamentales.
   - Synergie avec Forlife Imprim et ancrage local à Bingerville.

3. **Services (`services.html`)** :
   - Présentation en fiches des 7 domaines d'expertise :
     1. Impression & Communication Visuelle (DTF, bâches, roll-up, flyers)
     2. Création Graphique & Design (Logos, charte graphique, dépliants)
     3. Production Photo & Vidéo (Studio FX30 / A7 III, drone DJI)
     4. Gestion des Réseaux Sociaux (Community management Facebook/Instagram)
     5. Publicité Digitale (Meta Ads / Retargeting local Bingerville & Abidjan Est)
     6. Événementiel & Communication Communautaire (Scooling, maillots, écussons, bannières)
     7. **Formation (Nouveau volet)** : Ateliers pratiques pour PME, TPE, écoles et communautés (utilisation des réseaux sociaux, Canva, Meta Ads, stratégie digitale).

4. **Réalisations / Portfolio (`realisations.html`)** :
   - Galerie de photos filtrable par catégorie avec images issues des travaux réels.
   - Visualiseur Lightbox haute résolution utilisable au clavier (Échap, Flèches).

5. **Blog & Conseils (`blog/index.html` & articles)** :
   - Rubrique dédiée aux conseils pratiques pour booster la visibilité des entreprises locales.
   - Articles rédigés et optimisés pour le référencement naturel (SEO) et structurés avec `schema.org/Article`.

6. **Contact & Devis (`contact.html`)** :
   - Formulaire de demande de devis connecté au système d'automatisation marketing.
   - Carte de localisation interactive à la montée de la colline du Collège Saint Cyrille de Bingerville.
   - Toutes les coordonnées officielles (+225 05 85 80 18 56 / +225 07 49 56 70 82 / forlifeimprim@gmail.com).

7. **Tableau de Bord & Automatisation Marketing (`automation.html` & `automation_marketing.py`)** :
   - Hub de gestion des leads, suivi des accusés d'emails clients et relances J+3.
   - Auto-sync des contenus portfolio/blog vers les campagnes Meta Ads (Instagram & Facebook).
   - Reciblage des visiteurs des pages Services et Contact.

---

## 🎨 Charte Graphique & Identité Visuelle

Conformément à la **Charte Graphique v2**, le site respecte strictement le système chromatique et typographique :

- **Couleur Primaire (Accent)** : Orange Vibrant `#EA7822` / `#E2742A`
- **Fond Dominant (Warm Dark / Charcoal)** : `#0D0D0D` / `#1A1A1A` / `#2D1C14`
- **Fond de Lisibilité / Respiration** : Blanc Cassé / Crème `#F9F6F2` / `#FDF8F3`
- **Accent Secondaire Prestige** : Or `#D9AC4E` & Noir Profond `#0E0E0E`
- **Typographie** : `Poppins` (Google Fonts)
- **Logos** : SVG vectoriels purs (header horizontal, footer et favicon).

---

## 🤖 Système d'Automatisation Marketing (Section 8)

Le projet intègre une brique d'automatisation complète :

### 1. Client Email Automation (`js/automation.js` & `contact.html`)
- **Accusé de réception client immédiat** : Lorsqu'un utilisateur remplit le formulaire de contact/devis, le système génère automatiquement un email de confirmation rassurant le client avec l'étape suivante (contact WhatsApp sous 24h).
- **Notification interne à `forlifeimprim@gmail.com`** : Un email contenant l'ensemble des données du formulaire (Nom, Téléphone, Service, Message) est transmis automatiquement à l'équipe.
- **Relance automatique J+3** : Les leads n'ayant pas donné suite reçoivent une relance personnalisée pour réengager la conversation.

### 2. Automatisation Meta Ads (Instagram & Facebook)
- **Publication automatique** : Les nouveaux éléments ajoutés au portfolio ou au blog sont synchronisés vers des campagnes sponsorisées ou des publications Meta Business Suite.
- **Reciblage des visiteurs (Meta Pixel)** : Le script `js/automation.js` déclenche des événements Pixel (`ViewContent`, `Lead`) lorsqu'un visiteur consulte les pages Services ou Formulaire, permettant de recibler ces prospects sur Instagram et Facebook.
- **Tableau de Bord (`automation.html`)** : Interface visuelle permettant à l'équipe Forlife Com' de visualiser le statut des leads, tester les emails et gérer les clés API.

### 3. Script Backend Python (`automation_marketing.py`)
Un script Python est fourni dans le dépôt pour exécuter l'automatisation en ligne de commande ou via une tâche planifiée (cron job) :
```bash
python automation_marketing.py
```
Il permet de :
- Tester les emails d'accusé de réception et de notification.
- Exécuter la synchronisation avec l'API Meta Graph (`v18.0`).
- Traiter la séquence de relance J+3.

---

## ⚙️ Guide de Configuration des Accès Externes

Pour brancher vos propres comptes d'entreprise sur Forlife Com' :

1. **Service d'Emailing (Brevo / Sendinblue ou Mailchimp)** :
   - Créez un compte gratuit sur [Brevo](https://www.brevo.com/).
   - Récupérez votre **Clé API Transactionnelle** (ex: `xkeysib-...`).
   - Saisissez cette clé dans le panneau de configuration sur `automation.html` ou dans `CONFIG['BREVO_API_KEY']` de `automation_marketing.py`.

2. **Meta Ads & Pixel (Instagram & Facebook)** :
   - Allez sur [Meta Business Suite](https://business.facebook.com/).
   - Récupérez votre **ID de Pixel Meta** et votre **Token d'Accès Graph API**.
   - Collez le code Pixel dans la balise `<head>` des pages HTML si vous souhaitez utiliser le tracker direct Meta.

3. **Email de Notification** :
   - L'email interne configuré par défaut est **`forlifeimprim@gmail.com`**. Vous pouvez le modifier dans `js/automation.js` et `automation.html`.

---

## 🛠️ Lancement Local & Déploiement

### Exécution locale
Aucun serveur complexe requis ! Ouvrez simplement `index.html` dans n'importe quel navigateur moderne, ou utilisez une extension type *Live Server* sous VS Code / Antigravity.

### Déploiement en production
Le site est 100% statique et ultra-rapide. Il peut être déployé en 1 clic sur :
- **Netlify** / **Vercel** / **GitHub Pages**
- **Hébergement cPanel / Hostinger / LWS** : Transférez simplement l'ensemble des fichiers du dossier `forlife-com` par FTP.

---

## 📞 Coordonnées Officieuses & Support

- **WhatsApp & Appel principal** : `+225 05 85 80 18 56`
- **Appel secondaire** : `+225 07 49 56 70 82`
- **Email** : `forlifeimprim@gmail.com`
- **Adresse** : Bingerville, à la montée de la colline du Collège Saint Cyrille de Bingerville, Côte d'Ivoire
- **Instagram** : [@forlife_imprim](https://www.instagram.com/forlife_imprim)
- **Facebook** : [Forlife Imprim & Com](https://www.facebook.com/share/1DEbv4dxNr/)

---
*Forlife Com' — Imprimer l'avenir, valoriser les marques.*  
*Document d'accompagnement technique — 2026.*
