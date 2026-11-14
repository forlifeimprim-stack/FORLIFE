# Plan de production

Tenu par Akissi. Statuts : À FAIRE, EN COURS, TERMINÉ, PARTIEL, BLOQUÉ.

| Tâche | Intitulé | Agent | Dépend de | Critère de fin | Statut |
|---|---|---|---|---|---|
| T01 | Cadrage, fiche projet, plan, livre.yaml | akissi | | fichiers présents | TERMINÉ |
| T02 | Rétroplanning, dossiers ISBN, dépôt légal, BURIDA, projet de contrat d'édition, brouillons de courriers | mariam | T01 | `suivi/` complet, échéances à 14 jours | TERMINÉ |
| T03 | Charte de voix et plan détaillé du livre | konan | T01 | `charte/voix.md`, `manuscrit/00-plan-detaille.md` | TERMINÉ |
| T04 | Feuille de style et lexique des noms propres | amenan | T01 | `charte/style.md`, `charte/lexique.txt` | TERMINÉ |
| T05 | Recherche iconographique, registre des droits, page des crédits | yao | T01 | `droits/images.md` | TERMINÉ |
| T06 | Bible visuelle, carte, frise des rois, illustration de couverture | kouame | T01 | SVG dans `images/`, `charte/illustration.md` | TERMINÉ |
| T07 | Charte graphique, CSS intérieur, maquette type | affoue | T01 | `charte/graphique.md`, `charte/interieur.css`, pages test rendues | TERMINÉ |
| T08 | Fiche de fabrication préliminaire, demandes de devis en brouillon | salif | T01 | `fabrication/fiche-fabrication.md` | TERMINÉ |
| T09 | Validation du plan détaillé | akissi | T03 | décision au journal | TERMINÉ |
| T10-T12 | Rédaction des chapitres (trois lots) | konan | T09, T04 | chapitres dans `manuscrit/` | TERMINÉ |
| T13 | Lecture éditoriale, lot par lot (décision du 9/11 sur proposition de Mariam) | akissi | T10-T12 | notes au journal | TERMINÉ |
| T14-T15 | Correction (deux lots), vérification de chaque verset | amenan | T13 | copies `-corrige.md`, relevés | TERMINÉ |
| T16 | Couverture : deux pistes, puis gabarit complet | affoue | T06, T08 | `couverture/` | TERMINÉ |
| T17 | Composition de l'intérieur | affoue | T14-T15, T07 | `sortie/interieur.pdf` | TERMINÉ |
| T18 | Épreuves, premier tour | amenan | T17 | relevé par page | TERMINÉ |
| T19 | Fabrication : contrôle des fichiers, préparation du BAT | salif | T17, T16 | rapport de contrôle | PARTIEL |
| T20 | EPUB, PDF écran, script audio, fiches plateformes | desire | T14-T15, T16 | `numerique/` | TERMINÉ |
| T21 | Traduction anglaise d'évaluation (quatrième et chapitre 1) | awa | T14 | `numerique/traduction-en/` | TERMINÉ |
| T22 | Étude approfondie, chapitres 1 à 6, et témoignage de l'avant-propos | konan | décisions du 13/11 | sections ajoutées, versets contrôlés | TERMINÉ |
| T23 | Étude approfondie, chapitres 7 à 12, et annexe « Le livre de Jérémie remis dans l’ordre » | konan | T22 | sections ajoutées, versets contrôlés | EN COURS |
| T24 | Relecture des sections d'étude | amenan | T23 | relevé, 0 écart | À FAIRE |
| T25 | Recomposition, couverture recalculée | affoue | T24 | interieur.pdf | À FAIRE |
| T26 | EPUB refait | desire | T24 | EPUBCheck 0 erreur | À FAIRE |
