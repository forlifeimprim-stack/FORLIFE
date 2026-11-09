# Coût de revient et point mort : modèle de calcul

Établi le 9 novembre 2026 par Salif (T08). Modèle vide : aucun devis n'est reçu, donc aucune valeur
n'est saisie. Chaque montant reste `[À COMPLÉTER : devis]` ou `[À COMPLÉTER : ...]` jusqu'à réception
d'une source écrite (devis signé, facture, barème officiel daté). Montants en FCFA, sans décimales.
Le prix public est décidé par l'utilisateur : ce fichier lui présentera deux ou trois prix possibles avec
leur point mort, sans en choisir un.

## Notations

| Symbole | Signification |
|---|---|
| Q | tirage (exemplaires imprimés et livrés) : 300, 500 ou 1 000 |
| Qg | exemplaires non vendus par destination : dépôt légal, auteur, service de presse, réserve pour défauts |
| Qv | exemplaires vendables = Q − Qg |
| CF | coûts fixes d'édition, indépendants du tirage |
| CT(Q) | coût du tirage : impression et façonnage selon le devis retenu, plus livraison |
| P | prix public hors taxes d'un exemplaire |
| r | remise accordée au libraire, en pourcentage de P |
| d | commission de diffusion ou de distribution, en pourcentage de P (0 si l'éditeur distribue lui-même) |
| a | taux des droits d'auteur, en pourcentage de P (base exacte à reprendre du contrat d'édition, T02) |
| fv | frais par exemplaire vendu en direct (paiement mobile, envoi), en FCFA |

## Coûts fixes d'édition (CF)

Ces postes ne dépendent pas du tirage. Si un travail est fait en interne sans facturation, on l'inscrit
à 0 FCFA en le disant, ou à sa valeur interne si l'utilisateur veut la compter.

| Poste | Montant (FCFA) | Source |
|---|---|---|
| Correction (relecture, épreuves) | [À COMPLÉTER : devis ou valeur interne] | |
| Mise en page de l'intérieur | [À COMPLÉTER : devis ou valeur interne] | |
| Couverture (conception, illustration, droits d'images) | [À COMPLÉTER : devis ou valeur interne] | registre `droits/` (T05) |
| ISBN (papier et numérique) | [À COMPLÉTER : coût éventuel, à vérifier auprès de l'agence ISBN] | non vérifié (site inaccessible) |
| Dépôt légal (exemplaires déposés, frais éventuels) | [À COMPLÉTER : nombre d'exemplaires et frais, à vérifier] | non vérifié ; Mariam (T02) |
| Épreuves, épreuve couleur, maquette en blanc | [À COMPLÉTER : devis] | |
| Autres frais fixes (déclarations, transport des fichiers, lancement) | [À COMPLÉTER] | |
| Total CF | [À COMPLÉTER : somme des lignes] | |

## Coût du tirage, CT(Q)

Un tableau par configuration retenue (pagination, papier, procédé). Les montants viennent de la grille
de réponse des devis (`devis/`), ligne de référence indiquée.

| Poste | 300 ex. | 500 ex. | 1 000 ex. | Source |
|---|---|---|---|---|
| Impression et façonnage | [À COMPLÉTER : devis] | [À COMPLÉTER : devis] | [À COMPLÉTER : devis] | devis, réf. A, B, C |
| Options retenues (colle, pelliculage, papier) | [À COMPLÉTER : devis] | [À COMPLÉTER : devis] | [À COMPLÉTER : devis] | devis, options |
| Livraison à Bingerville | [À COMPLÉTER : devis] | [À COMPLÉTER : devis] | [À COMPLÉTER : devis] | devis |
| Taxes non récupérables, le cas échéant | [À COMPLÉTER : régime de TVA du livre en Côte d'Ivoire, à vérifier] | | | non vérifié |
| CT(Q) | | | | |

Exemplaires non vendus par destination (Qg) :

| Destination | Nombre | Source |
|---|---|---|
| Dépôt légal | [À COMPLÉTER : nombre réglementaire, à vérifier] | Mariam (T02) |
| Exemplaires de l'auteur | [À COMPLÉTER : selon le contrat] | contrat (T02) |
| Service de presse, églises partenaires | [À COMPLÉTER : décision de l'utilisateur] | |
| Réserve pour défauts et passe ou manque | [À COMPLÉTER : selon la tolérance de l'imprimeur] | devis |
| Qg | [À COMPLÉTER : somme] | |

## Formules

Coût de revient total d'un tirage : CR(Q) = CF + CT(Q).

Coût de revient par exemplaire imprimé : CR(Q) ÷ Q. Par exemplaire vendable : CR(Q) ÷ Qv. C'est ce
second chiffre qui compte pour fixer un prix, puisque les exemplaires donnés ne rapportent rien.

Recette nette de l'éditeur pour un exemplaire vendu :

- en librairie : RN_lib = P × (1 − r − d − a)
- en vente directe (stand, église, commande) : RN_dir = P × (1 − a) − fv

Recette nette moyenne, avec s la part des ventes faites en librairie (entre 0 et 1) :
RN = s × RN_lib + (1 − s) × RN_dir.

Point mort (nombre d'exemplaires à vendre pour couvrir toutes les dépenses du tirage) :
PM(Q, P) = CR(Q) ÷ RN, arrondi à l'exemplaire supérieur.

Le tirage étant payé d'avance, le point mort inclut la totalité du coût d'impression, et pas seulement
le coût des exemplaires vendus. Il doit rester inférieur à Qv : sinon le tirage ne peut pas être
rentabilisé à ce prix, même en vendant tout.

Résultat si tout le stock vendable est vendu : Qv × RN − CR(Q).

Part du tirage à vendre pour atteindre le point mort : PM ÷ Qv, en pourcentage.

## Hypothèses commerciales à fixer

| Paramètre | Valeur | Qui décide |
|---|---|---|
| Remise libraire r | [À COMPLÉTER : pratique des libraires visés] | utilisateur |
| Commission de diffusion d | [À COMPLÉTER : contrat de diffusion, ou 0] | utilisateur |
| Droits d'auteur a, et leur base (prix public HT ou recette nette) | [À COMPLÉTER : contrat d'édition (T02)] | auteur et éditeur |
| Frais de vente directe fv | [À COMPLÉTER : frais de paiement mobile et d'envoi] | utilisateur |
| Part des ventes en librairie s | [À COMPLÉTER : estimation de l'utilisateur] | utilisateur |
| TVA applicable au livre | [À COMPLÉTER : régime à vérifier sur une source officielle datée] | non vérifié |

L'auteur dirige aussi l'entreprise éditrice : les droits d'auteur restent une ligne du modèle, réglée par
le contrat d'édition préparé par Mariam (T02), même si leur taux est fixé à 0 %.

## Comparaison des prix publics

Trois prix candidats, P1 < P2 < P3, seront proposés à l'utilisateur après réception des devis, à partir
du coût de revient par exemplaire vendable et des prix pratiqués pour des livres comparables (à relever
sur une source datée). Aucun n'est proposé aujourd'hui.

| Prix public TTC | Prix HT (P) | RN | PM à 300 ex. | PM à 500 ex. | PM à 1 000 ex. |
|---|---|---|---|---|---|
| P1 : [À COMPLÉTER : après devis] | | | | | |
| P2 : [À COMPLÉTER : après devis] | | | | | |
| P3 : [À COMPLÉTER : après devis] | | | | | |

Pour chaque case de point mort, on notera aussi la part du stock vendable qu'il représente (PM ÷ Qv),
pour voir d'un coup d'œil quel couple tirage et prix est le moins risqué. La décision revient à
l'utilisateur.

## Comparaison des devis

Une ligne par imprimeur et par configuration, saisie depuis les réponses reçues (grille de `devis/`).

| Imprimeur | Réf. | Quantité | Pages | Papier | Procédé | Total HT (FCFA) | Par exemplaire (FCFA) | Délai après BAT | Validité du devis |
|---|---|---|---|---|---|---|---|---|---|
| Forlife Imprim (tarif client) | | | | | | [À COMPLÉTER : devis] | | | |
| Forlife Imprim (coût interne) | | | | | | [À COMPLÉTER : devis] | | | |
| Imprimeur B | | | | | | [À COMPLÉTER : devis] | | | |
| Imprimeur C | | | | | | [À COMPLÉTER : devis] | | | |

Un devis n'est comparable aux autres que s'il porte sur le même cahier des charges (papier, grammage de
couverture, pelliculage, colle, livraison comprise ou non). Tout écart sera noté dans la ligne.
