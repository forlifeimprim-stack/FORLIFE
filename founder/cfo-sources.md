# D'où viennent les chiffres du CFO

Tous les montants sont en FCFA (XOF), hors taxes. L'outil `unit_economics.py` affiche le symbole « $ » par défaut : lisez « FCFA ». Les volumes sont exprimés en **commandes par mois** (le champ `days_per_month` vaut 1, donc « a day » se lit « par mois »).

| Donnée | Valeur | Source | Statut |
| --- | ---: | --- | --- |
| Panier moyen (prix d'une commande) | 60 000 | Réponse du fondateur : 25 000 – 100 000 FCFA ; point médian arrondi | **Déclaré** (fourchette) |
| Volume actuel | ~8 commandes / mois | Réponse du fondateur : « moins de 10 par mois » | **Déclaré** (borne haute prudente) |
| Charges fixes mensuelles | 550 000 | Réponse du fondateur : 300 000 – 800 000 FCFA ; point médian | **Déclaré** (fourchette) |
| Consommables (30 % du prix) | 18 000 | Mélange DTF / bâche / papier. Repères publics : tee-shirt DTF vendu 3 000 – 5 000 FCFA l'unité, bâche 3 000 – 8 000 FCFA le m² (voir `competitors.md`) | **Estimation** |
| Sous-traitance (8 %) | 4 800 | Offset en gros tirage, broderie d'écussons | **Estimation** |
| Livraison / déplacements | 1 500 | Course moto ou taxi dans Bingerville / Cocody | **Estimation** |
| Frais mobile money marchand | 600 | ≈ 1 % ; à vérifier auprès de Wave, Orange Money et MTN MoMo (grilles marchandes) | **Estimation** |
| Électricité de production | 1 000 | DTF et presse thermique | **Estimation** |
| Coût de la garantie délai | 1 200 | 10 % des commandes en retard × 20 % remboursés × 60 000 | **Estimation** (modèle) |
| Soldes impayés (paiement 50/50) | 1 500 | 5 % des soldes de 30 000 non récupérés | **Estimation** (modèle) |
| Dépenses de lancement (265 000) | 265 000 | Kits d'échantillons 75 000, études de cas 40 000, publicité Meta 100 000, prospection 50 000 | **Estimation** (budget proposé) |
| Montée en charge | 8 → 22 commandes / mois | Hypothèse du plan recentré écoles et paroisses ; à confronter au test réel (voir `launch.md`) | **Hypothèse** |
| Capacité | 78 commandes / mois | 3 commandes par jour ouvré × 26 jours | **Estimation** |

**Équipement** (DTF A2, Sony FX30 / A7 III, DJI Mini 4 Pro) : déjà acheté, donc non compté dans les dépenses de lancement. Son remboursement éventuel fait partie des charges fixes déclarées.

**À remplacer en priorité par des chiffres réels** : (1) la marge réelle par type de commande, à partir des factures des fournisseurs ; (2) le détail des 550 000 FCFA de charges fixes ; (3) le volume réel des 6 derniers mois.
