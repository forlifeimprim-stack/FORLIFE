# Fiches des plateformes numériques

Désiré (numérique), 13 novembre 2026, tâche T20. Statut : PRÊT À SAISIR, RIEN N'EST MIS EN LIGNE.

Aucune mise en ligne, aucun prix, aucune exclusivité (KDP Select notamment) sans accord écrit de l'utilisateur. Les sites des plateformes sont inaccessibles depuis cette session : leurs conditions, leurs champs de saisie, leurs listes de catégories et leurs règles sur l'IA sont **non vérifiés le 13 novembre 2026**. Ce qui suit vient de `livre.yaml`, de `couverture/quatrieme.md` et des rapports de l'équipe ; il faudra le reporter champ par champ le jour de la saisie, après lecture des conditions du jour.

## Fichiers à téléverser

| Usage | Fichier | État |
|---|---|---|
| Livre numérique (toutes plateformes) | `numerique/jeremie.epub` | EPUB 3, 0 erreur EPUBCheck 5.2.1 ; à refaire avec l'ISBN numérique |
| Couverture numérique | `couverture/plat1-epub.jpg` | 1 707 × 2 560 px, JPEG, 245 Ko ; choix final de couverture encore à l'utilisateur |
| Vente directe en PDF (boutique en ligne de l'éditeur) | `sortie/interieur-ecran.pdf` | 160 pages, 140 × 210 mm, sans fonds perdus |

## Métadonnées communes

| Champ | Valeur à saisir |
|---|---|
| Titre | La vie et le ministère prophétique du prophète Jérémie |
| Sous-titre | Biographie |
| Auteur | Kouadio Koffi Élisée |
| Éditeur (marque) | Forlife Imprim |
| Langue | Français |
| ISBN numérique | [À COMPLÉTER : ISBN numérique distinct de l'ISBN papier, à obtenir] |
| Date de publication | [À COMPLÉTER : date retenue par l'utilisateur ; date de travail du projet : 28 mars 2027] |
| Droits | © 2027 Kouadio Koffi Élisée, tous droits réservés (année à confirmer) |
| Territoires | [À COMPLÉTER : décision de l'utilisateur ; proposition : monde entier] |
| Public | Adultes ; pas de contenu réservé |
| Série, édition | Aucune série ; première édition |
| Prix | Non fixé : décision de l'utilisateur |

Remarques :

- Le sous-titre « Biographie » est une hypothèse du projet, à valider par l'auteur (`fiche-projet.md`). La couverture l'imprime en capitales comme mention de genre (`generer_couverture.py`, champ `sous_titre`) : titre et sous-titre saisis concordent donc avec la couverture.
- Le nom de l'auteur se saisit exactement « Kouadio Koffi Élisée », avec l'accent, partout.

## Description (tirée de `couverture/quatrieme.md`)

Texte de la quatrième, sans changement :

> Appelé tout jeune, la treizième année du roi Josias, Jérémie a porté la parole de Dieu pendant une quarantaine d'années. Il a dicté à Baruc un rouleau que le roi Jojakim a brûlé, écrit aux exilés de Babylone, connu la citerne pendant le siège. Après la chute de Jérusalem, il est resté parmi le peuple, puis a été emmené en Égypte par ceux qui avaient refusé son message.
>
> Ce livre suit sa vie règne après règne, d'Anathoth à Tachpanès. Chaque chapitre éclaire le contexte historique, cite les versets clés et se termine par des leçons pour aujourd'hui et des questions pour méditer, seul ou en groupe. Une chronologie et une carte accompagnent la lecture.
>
> Pour le croyant qui lit sa Bible et pour le serviteur de Dieu qui cherche à rester fidèle quand la parole dérange.

À ajouter sous la description, si la plateforme le permet :

> Les citations bibliques sont tirées de la Louis Segond 1910.
>
> L'auteur : Kouadio Koffi Élisée est moniteur d'école du dimanche à l'Église CMA et responsable de prière de l'école du dimanche. Entrepreneur, il est cofondateur de Forlife Com, entreprise de communication intégrée basée à Bingerville. Il est marié à Koffi Assena Grâce Emmanuelle, épouse Kouadio.

La biographie est reprise mot pour mot de `livre.yaml` (texte validé par l'auteur). Cette même description est déjà dans les métadonnées de l'EPUB (`dc:description`).

## Catégories proposées

Codes donnés de mémoire, non vérifiés le 13 novembre 2026 sur les listes en vigueur : à contrôler dans la liste de chaque plateforme au moment de la saisie.

BISAC (KDP, Apple Books, Google Play Livres, Kobo) :

1. REL006090 : Religion / Biblical Biography / Old Testament (catégorie principale) [À VÉRIFIER : code]
2. BIO018000 : Biography & Autobiography / Religious [À VÉRIFIER : code]
3. REL006410 : Religion / Biblical Studies / Old Testament / Prophets [À VÉRIFIER : code]

Thema (Google Play Livres, Kobo, distributeurs) :

1. DNBR : Biographies religieuses et spirituelles [À VÉRIFIER : code]
2. QRMF1 : Bible (textes sacrés chrétiens) [À VÉRIFIER : code]

## Mots-clés

Sept mots-clés (le maximum habituel de KDP, non vérifié) :

1. Jérémie prophète
2. biographie biblique
3. Ancien Testament
4. étude biblique en groupe
5. Louis Segond
6. école du dimanche
7. vie chrétienne et appel de Dieu

## Déclaration d'IA

D'après les rapports de l'équipe (T03, T06, T10 à T12, T16, T20). À déclarer sur chaque plateforme qui pose la question (Amazon KDP le demande à la publication ; règles du jour non vérifiées le 13 novembre 2026). Formulation proposée :

| Élément | Déclaration | Source |
|---|---|---|
| Texte | Généré par IA. Récit, encadrés, leçons, questions, prières, conclusion et annexes ont été rédigés par IA à partir du texte biblique de la Louis Segond 1910, sans matière fournie par l'auteur, puis corrigés par IA et soumis à la validation de l'auteur. Ne sont pas générés : les citations bibliques (Louis Segond 1910, domaine public), la biographie de l'auteur (texte fourni par lui), le titre, le nom de l'auteur et celui de l'éditeur. | rapports T10, T11, T12, T14, T15 |
| Images intérieures | Générées par IA : carte « Le monde de Jérémie », frise des rois de Juda, fleuron d'amandier (dessins vectoriels écrits par l'agent, sans image source). | rapport T06 |
| Couverture | Fondée sur une illustration générée par IA (amandier, Kouamé), prolongée sur le dos et la quatrième ; texte de quatrième rédigé par IA, hors verset et biographie. | rapports T06, T16 |
| Traduction | Aucune dans la version française. | |
| Livre audio | S'il est produit avec la « FOR LIFE voix off », la voix est une voix de synthèse clonée sur la voix de l'auteur, avec son accord (validée le 27 octobre 2026) : à déclarer comme narration de synthèse là où la plateforme le demande. | CLAUDE.md |

Sur KDP, la distinction entre contenu « généré par IA » et « assisté par IA » se fait au moment de la saisie (règle non vérifiée aujourd'hui) : ici, le texte et les images sont générés, pas seulement assistés. La relecture et la validation par l'auteur ne changent pas cette réponse.

## Points propres à chaque plateforme

Tous non vérifiés le 13 novembre 2026.

| Plateforme | À contrôler le jour de la saisie |
|---|---|
| Amazon KDP | Déclaration IA ; ISBN facultatif pour le numérique (ASIN attribué) ; ne pas cocher KDP Select (exclusivité) sans accord ; choix de la gestion des droits numériques ; prix et redevance : décision de l'utilisateur |
| Google Play Livres | Compte éditeur au nom de Forlife Imprim ; ISBN ou identifiant Google ; pays de vente ; règles sur le contenu généré par IA |
| Apple Books | Accès depuis la Côte d'Ivoire et moyen de paiement des redevances ; ISBN exigé ou non ; outil de dépôt |
| Kobo Writing Life | Pays du compte et versements ; ISBN facultatif ; catégories BISAC |
| Boutique en ligne de l'éditeur | Format proposé (EPUB, PDF écran ou les deux), mention de copyright sur la page de vente ; prix : décision de l'utilisateur |

## Ce qui bloque la publication

1. ISBN numérique : à obtenir (dossier de Mariam), puis à reporter dans `livre.yaml` (`isbn_epub`) et à refaire l'EPUB avec `python3 numerique/fabriquer_epub.py`. Le script le prend alors comme identifiant (`urn:isbn:…`).
2. Marques « À COMPLÉTER » encore présentes dans l'EPUB : ISBN papier et numérique, dépôt légal (mentions légales), témoignage et remerciements de l'avant-propos.
3. Validation du texte par l'auteur, chapitre par chapitre, et réponses aux questions doctrinales.
4. Choix final de la couverture, prix et territoires : décisions de l'utilisateur.
5. Accord écrit de l'utilisateur pour toute mise en ligne.
