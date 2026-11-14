# Ce qui bloque encore l'envoi à l'imprimeur

État au 14 novembre 2026 (Salif, T28), sur l'intérieur de 224 pages et la couverture piste C. Tant
qu'une ligne reste ouverte, rien ne part chez l'imprimeur.

| N° | Point bloquant | Où | Qui lève |
|---|---|---|---|
| 1 | ISBN papier et numérique non attribués : mentions légales et code-barres EAN-13 absent de la quatrième (« ISBN à venir ») | intérieur (mentions), couverture | Mariam (dossier), Affoué (insertion du code-barres) |
| 2 | Numéro de dépôt légal non attribué | intérieur (mentions) | Mariam |
| 3 | Mention « Impression : imprimeur, lieu et date » à remplir | intérieur (mentions) | Salif après choix de l'imprimeur, puis Affoué |
| 4 | Prix public non fixé (« Prix : [À COMPLÉTER] » sur la quatrième) | couverture | décision de l'utilisateur, après devis (`cout-de-revient.md`) |
| 5 | Aucun devis reçu ; brouillons mis à jour pour 224 pages mais non envoyés | `fabrication/devis/` | accord écrit de l'utilisateur, noms des imprimeurs B et C |
| 6 | Imprimeur non choisi, donc exigences inconnues : PDF/X ou non, profil ICC CMJN, couverture d'encre maximale, valeur réelle du dos (12,60 mm calculé) | couverture surtout | Salif après devis, Affoué pour une conversion éventuelle |
| 7 | Dix marques « À COMPLÉTER PAR L'AUTEUR » dans l'intérieur (remerciements, lecture de Jérémie 1:10, dictée du rouleau, critères du vrai et du faux prophète, Jérémie 29:11, destinataires de la promesse, positions de l'auteur dans les sections d'étude) | intérieur | auteur |
| 8 | Vingt-six marques « À VÉRIFIER » dans les sections d'étude (archéologie, inscriptions, dates, éditions de fragments) | intérieur | Konan et Amenan, sources datées |
| 9 | Validation du texte complet par l'auteur (seul le témoignage de l'avant-propos est validé, le 14 novembre) | intérieur, quatrième | auteur |
| 10 | Tirage et procédé non décidés | fiche de BAT | utilisateur, après devis |
| 11 | Épreuves complètes de la version de 224 pages (sections d'étude et tableaux nouveaux) | intérieur | Amenan |
| 12 | Épreuve pelliculée mate de la couverture piste C (fond encre sombre) à juger avant de confirmer le pelliculage | couverture | Salif avec l'imprimeur, décision de l'utilisateur |

Décidé depuis T19 : couverture piste C retenue par l'utilisateur ; témoignage de l'avant-propos validé
par l'auteur.

Les points 1 à 4 et 7 à 9 modifieront au moins un des deux PDF : les empreintes de `fiche-bat.md` seront
à relever de nouveau sur les fichiers définitifs, après un nouveau passage de `controle_pdf.py`. Si la
pagination change, le dos et la largeur de couverture changent aussi.
