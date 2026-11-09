# Plan de production

Tenu par Akissi. Statuts : À FAIRE, EN COURS, TERMINÉ, PARTIEL, BLOQUÉ.

| Tâche | Intitulé | Agent | Dépend de | Critère de fin | Statut |
|---|---|---|---|---|---|
| T01 | Cadrage, fiche projet, plan, livre.yaml | akissi | | fichiers présents | TERMINÉ |
| T02 | Rétroplanning, dossiers ISBN, dépôt légal, BURIDA, projet de contrat d'édition, brouillons de courriers | mariam | T01 | `suivi/` complet, échéances à 14 jours | EN COURS |
| T03 | Charte de voix et plan détaillé du livre | konan | T01 | `charte/voix.md`, `manuscrit/00-plan-detaille.md` | EN COURS |
| T04 | Feuille de style et lexique des noms propres | amenan | T01 | `charte/style.md`, `charte/lexique.txt` | EN COURS |
| T05 | Recherche iconographique, registre des droits, page des crédits | yao | T01 | `droits/images.md` | TERMINÉ |
| T06 | Bible visuelle, carte, frise des rois, illustration de couverture | kouame | T01 | SVG dans `images/`, `charte/illustration.md` | EN COURS |
| T07 | Charte graphique, CSS intérieur, maquette type | affoue | T01 | `charte/graphique.md`, `charte/interieur.css`, pages test rendues | EN COURS |
| T08 | Fiche de fabrication préliminaire, demandes de devis en brouillon | salif | T01 | `fabrication/fiche-fabrication.md` | EN COURS |
| T09 | Validation du plan détaillé | akissi | T03 | décision au journal | À FAIRE |
| T10-T12 | Rédaction des chapitres (trois lots) | konan | T09, T04 | chapitres dans `manuscrit/` | À FAIRE |
| T13 | Lecture éditoriale du manuscrit complet | akissi | T10-T12 | notes au journal | À FAIRE |
| T14-T15 | Correction (deux lots), vérification de chaque verset | amenan | T13 | copies `-corrige.md`, relevés | À FAIRE |
| T16 | Couverture : deux pistes, puis gabarit complet | affoue | T06, T08 | `couverture/` | À FAIRE |
| T17 | Composition de l'intérieur | affoue | T14-T15, T07 | `sortie/interieur.pdf` | À FAIRE |
| T18 | Épreuves, premier tour | amenan | T17 | relevé par page | À FAIRE |
| T19 | Fabrication : contrôle des fichiers, préparation du BAT | salif | T17, T16 | rapport de contrôle | À FAIRE |
| T20 | EPUB, PDF écran, script audio, fiches plateformes | desire | T14-T15, T16 | `numerique/` | À FAIRE |
| T21 | Traduction anglaise d'évaluation (quatrième et chapitre 1) | awa | T14 | `numerique/traduction-en/` | À FAIRE |
