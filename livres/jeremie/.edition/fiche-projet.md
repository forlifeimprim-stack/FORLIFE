# Fiche projet

Ouverte le 9 novembre 2026 par Akissi (direction éditoriale). Projet test demandé par l'utilisateur : mobiliser toute l'équipe sur un nouveau livre, chaque agent rendant un rapport.

## Identité du livre

- Titre : La vie et le ministère prophétique du prophète Jérémie
- Sous-titre : [HYPOTHÈSE] « Biographie » (mention de genre en couverture). Remarque éditoriale à soumettre à l'auteur : le titre répète « prophétique » et « prophète » ; il reste tel quel tant que l'auteur ne décide pas autrement (pistes notées dans `journal.md`).
- Auteur : Kouadio Koffi Élisée
- Genre : biographie biblique (récit de vie fondé sur le livre de Jérémie, les Lamentations et les livres historiques : 2 Rois, 2 Chroniques)
- Langue : français

## Biographie de l'auteur (décision de l'utilisateur du 9 novembre 2026)

L'utilisateur a demandé de reprendre les informations de l'auteur de son livre « Stop, écoute ton enfant » et a précisé que cela suffit. Ce livre n'a été trouvé ni dans le dépôt, ni dans Google Drive, ni dans Gmail. Le texte ci-dessous est la biographie que l'auteur a fournie et validée pour son livre « Avant que l'horloge ne s'arrête » (dépôt Forlife, commit 5e23f53 du 31 octobre 2026, « biographie de l'auteur reprise telle que fournie »). Il est repris mot pour mot, sans ajout :

> **Kouadio Koffi Élisée** est moniteur d'école du dimanche à l'Église CMA et responsable de prière de l'école du dimanche.
>
> Entrepreneur, il est cofondateur de **Forlife Com**, entreprise de communication intégrée basée à Bingerville.
>
> Il est marié à Koffi Assena Grâce Emmanuelle, épouse Kouadio.

- Graphie du nom imprimé : « Kouadio Koffi Élisée » (capitale accentuée, comme dans le livre précédent).
- Page « Du même auteur » : « Stop, écoute ton enfant » et « Avant que l'horloge ne s'arrête » [À VÉRIFIER : titres exacts et dates de parution].
- Éditeur et coordonnées imprimées : Forlife Imprim, Bingerville (montée de la colline du Collège Saint Cyrille), forlifeimprim@gmail.com, +225 05 85 80 18 56, +225 07 49 56 70 82.
- Aucune autre information personnelle (date de naissance, études, documents d'identité) n'est utilisée. L'adresse électronique personnelle de l'auteur n'est pas imprimée.
- Voix du livre audio : « FOR LIFE voix off », voix clonée de l'auteur validée le 27 octobre 2026.
- Photo de l'auteur : non fournie, la quatrième s'en passe.

## Public et promesse

- Public : chrétiens francophones adultes d'Afrique de l'Ouest et d'ailleurs, lecteurs réguliers de la Bible, responsables et membres d'église, groupes d'étude biblique, étudiants en théologie débutants. Lecture fréquente sur téléphone Android.
- Promesse : suivre Jérémie de son appel à Anathoth jusqu'à son dernier message en Égypte, comprendre le contexte historique de ses quarante années de ministère, et en tirer des leçons pour le croyant et le serviteur de Dieu d'aujourd'hui.
- Ton : récit vivant et accessible, rigoureux sur le texte biblique, sans présenter une supposition comme un fait.

## Hypothèses de cadrage (aucune question posée à l'auteur pour ce test)

- Version biblique : Louis Segond 1910 (domaine public), citée d'après la source locale `.edition/sources/lsg1910/lsg.json` et l'outil `outils/verset.py`.
- Lecture doctrinale : évangélique, texte biblique reçu comme fiable. Chronologie usuelle : appel la treizième année de Josias (vers 627 av. J.-C.), chute de Jérusalem en 587 ou 586 av. J.-C. Toute position doctrinale non tranchée par le texte devient `[À COMPLÉTER PAR L'AUTEUR]`.
- Matière de l'auteur : aucune (ni notes, ni prédications). Le texte sera donc rédigé par Konan à partir de la Bible : part générée par IA élevée, à déclarer et à faire valider par l'auteur, chapitre par chapitre.
- Longueur visée : 12 chapitres de 2 800 à 3 300 mots, plus introduction, conclusion, annexes (chronologie, carte, index des passages) : environ 40 000 mots, 160 à 190 pages en 14 × 21 cm.
- Éditeur : Forlife Imprim, Bingerville (autoédition par l'entreprise de l'auteur).
- Versions : papier (14 × 21 cm, dos carré collé), EPUB recomposable, PDF écran, livre audio avec la « FOR LIFE voix off », traduction anglaise d'évaluation de la quatrième de couverture et du chapitre 2 (test d’Awa).
- Tirage : à décider (comparaison numérique et offset de 300 à 1 000 exemplaires par Salif).
- Parution visée : Pâques 2027 (28 mars 2027), date de travail pour le rétroplanning.
- Budget : non communiqué.

## Limites techniques de la session

- Réseau limité à GitHub, PyPI et npm : Wikimedia Commons, sites officiels (BURIDA, BNCI, agence ISBN), sites d'imprimeurs et sites bibliques en ligne sont inaccessibles. Les procédures et les licences d'images ne peuvent pas être vérifiées en ligne aujourd'hui : elles seront marquées « non vérifié ».
- Versets vérifiés contre la Louis Segond 1910 de github.com/midvash/bible-data (domaine public).

## Critères d'acceptation

- Aucun verset cité qui diffère de la LSG 1910 (hors normalisation typographique décidée dans `charte/style.md`).
- Aucun fait, chiffre, citation ou témoignage inventé ; marques `[À COMPLÉTER` et `[À VÉRIFIER` toutes levées avant livraison.
- PDF intérieur et couverture conformes (polices incorporées, 3 mm de fonds perdus, 300 ppp), EPUB sans erreur EPUBCheck.
- Mentions légales de la loi n° 2015-540 (art. 26) présentes, numéros (ISBN, dépôt légal) laissés en attente tant qu'ils ne sont pas attribués.
- Aucun envoi, commande, publication ou prix public sans accord écrit de l'utilisateur.
