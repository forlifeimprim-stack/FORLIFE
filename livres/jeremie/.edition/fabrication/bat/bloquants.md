# Ce qui bloque encore l'envoi à l'imprimeur

État au 13 novembre 2026 (Salif, T19). Tant qu'une ligne reste ouverte, rien ne part chez l'imprimeur.

| N° | Point bloquant | Où | Qui lève |
|---|---|---|---|
| 1 | ISBN papier et numérique non attribués : mentions légales (page 4) et code-barres EAN-13 absent de la quatrième (cartouche « ISBN à venir ») | intérieur p. 4, couverture | Mariam (dossier), Affoué (insertion du code-barres) |
| 2 | Numéro de dépôt légal non attribué (page 4) | intérieur p. 4 | Mariam |
| 3 | Mention « Impression : imprimeur, lieu et date » à remplir | intérieur p. 4 | Salif après choix de l'imprimeur, puis Affoué |
| 4 | Prix public non fixé (« Prix : [À COMPLÉTER] » sur la quatrième) | couverture | décision de l'utilisateur, après devis (`cout-de-revient.md`) |
| 5 | Aucun devis reçu ; brouillons non envoyés et rédigés pour 176 et 192 pages, à corriger à 160 pages avant envoi | `fabrication/devis/` | accord de l'utilisateur, Salif |
| 6 | Imprimeur non choisi, donc exigences inconnues : PDF/X ou non, profil ICC CMJN, couverture d'encre maximale, valeur réelle du dos | couverture surtout | Salif après devis, Affoué pour une conversion éventuelle |
| 7 | Deux marques « À COMPLÉTER PAR L'AUTEUR » dans l'avant-propos : témoignage personnel, remerciements | intérieur | auteur |
| 8 | Validation du texte par l'auteur, chapitre par chapitre (part générée par IA élevée, voir fiche projet) | intérieur, quatrième | auteur |
| 9 | Choix final de la couverture (piste A retenue par Akissi, décision à l'utilisateur) | couverture | utilisateur |
| 10 | Tirage et procédé non décidés | fiche de BAT | utilisateur, après devis |
| 11 | Un second tour d'épreuves complet recommandé (fait par sondage seulement) | intérieur | Amenan |

Chacun des points 1 à 4, 7 et 8 modifie au moins un des deux PDF : les empreintes de `fiche-bat.md`
seront donc à relever de nouveau sur les fichiers définitifs, après un nouveau passage de
`controle_pdf.py`.
