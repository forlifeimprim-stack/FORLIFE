# Réunion de lancement du 9 novembre 2026

Compte rendu rédigé par Mariam à partir de `journal.md`, `fiche-projet.md` et `plan.md` du 9 novembre 2026. Projet : « La vie et le ministère prophétique du prophète Jérémie », de Kouadio Koffi Elisée.

Présents (d'après la répartition de `plan.md`, le journal ne donne pas de liste) : Akissi (direction éditoriale, animation), Mariam (compte rendu), Konan, Amenan, Yao, Kouamé, Affoué, Salif, Désiré, Awa. Absent : l'auteur, à qui aucune question n'est posée pendant ce test.

## Ordre du jour

1. Ouverture du projet et périmètre du test.
2. Hypothèses de cadrage.
3. Version biblique et outils communs.
4. Contraintes de la session.
5. Titre.
6. Répartition des tâches et calendrier.

## Décisions

Le projet est ouvert comme un test complet : toute l'équipe est mobilisée sur le cycle de production, et chaque agent rend un rapport dans `rapports/` (Akissi).

Aucune question n'est posée à l'auteur pendant le test. Les choix de cadrage sont des hypothèses notées dans `fiche-projet.md` : Louis Segond 1910, lecture évangélique, chronologie usuelle, rédaction par Konan sans matière de l'auteur (part générée par IA élevée, à déclarer et à faire valider chapitre par chapitre), environ 40 000 mots en douze chapitres, autoédition par Forlife Imprim, quatre versions (papier 14 × 21 cm, EPUB, PDF écran, livre audio avec la « FOR LIFE voix off »), tirage à décider, parution visée le 28 mars 2027.

La version biblique de référence est la Louis Segond 1910, téléchargée depuis github.com/midvash/bible-data (domaine public, 66 livres, 31 102 versets), contrôlée sur Jérémie 1:5, 20:9 et 2 Rois 22:3. Toute citation passe par `outils/verset.py`.

Le réseau de la session se limite à GitHub, PyPI et npm. Procédures administratives, licences d'images et devis ne peuvent pas être vérifiés en ligne : ils sont marqués non vérifiés, avec la date.

Les outils communs sont installés une fois pour toute l'équipe : WeasyPrint, pikepdf, fontTools, python-barcode, spylls, Pandoc, EPUBCheck 5.2.1, dictionnaire français LibreOffice, polices EB Garamond (`outils/ressources/`).

Le titre est conservé tel que l'auteur l'a donné. Deux pistes lui seront proposées s'il veut éviter la répétition « prophétique / prophète » : « Jérémie, la vie et le ministère d'un prophète » et « Jérémie, prophète des nations : sa vie et son ministère ».

## Actions

| N° | Action | Responsable | Échéance | Statut au 09/11 |
|---|---|---|---|---|
| 1 | Rétroplanning, contacts, relances, dossiers administratifs, projet de contrat, brouillons de courriers (T02) | Mariam | lun 09/11/2026 | Rendu ce jour |
| 2 | Charte de voix et plan détaillé (T03) | Konan | ven 13/11/2026 (proposé au rétroplanning) | En cours |
| 3 | Feuille de style et lexique des noms propres (T04) | Amenan | rapport dans `rapports/` [date fixée par Akissi] | En cours |
| 4 | Recherche iconographique et registre des droits (T05) | Yao | rapport dans `rapports/` [date fixée par Akissi] | En cours |
| 5 | Bible visuelle, carte, frise des rois, illustration de couverture (T06) | Kouamé | rapport dans `rapports/` [date fixée par Akissi] | En cours |
| 6 | Charte graphique, CSS intérieur, maquette type (T07) | Affoué | rapport dans `rapports/` [date fixée par Akissi] | En cours |
| 7 | Fiche de fabrication préliminaire et demandes de devis en brouillon (T08) ; transmettre les noms des imprimeurs B et C | Salif | rapport dans `rapports/` [date fixée par Akissi] | En cours |
| 8 | Accord écrit pour envoyer le message à l'auteur et les demandes ISBN, dépôt légal, BURIDA | utilisateur, sur demande de Mariam | mar 10/11/2026 | Demandé |
| 9 | Validation du plan détaillé (T09) | Akissi | mar 17/11/2026 | À faire |
| 10 | Décider de la lecture éditoriale lot par lot (proposition du rétroplanning) | Akissi | ven 13/11/2026 | À faire |
| 11 | Validation du plan par l'auteur, réponses de cadrage, positions doctrinales, statut de Forlife Imprim | auteur | ven 20/11/2026 | Non demandé (attente d'accord) |
| 12 | Enregistrement de référence de la voix, biographie et photo | auteur | ven 27/11/2026 | Non demandé (attente d'accord) |
| 13 | Dépôt du dossier ISBN | Mariam | lun 23/11/2026 | Brouillon prêt |
| 14 | Début de la rédaction du lot 1 | Konan | lun 23/11/2026 | À faire |

## Prochaine réunion

Point d'étape proposé le lundi 23 novembre 2026, au démarrage de la rédaction : validation du plan, réponses de l'auteur, état des démarches. Date à confirmer par Akissi. Aucune invitation n'est envoyée sans accord.
