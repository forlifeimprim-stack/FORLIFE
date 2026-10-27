# Le CFO — Forlife Com'

> Montants en FCFA, hors taxes (la TVA ivoirienne de 18 % s'ajoute selon le régime fiscal de l'entreprise). Volumes en **commandes par mois**. Les coûts variables sont des **estimations** (voir `cfo-sources.md`). Ceci n'est pas un avis financier, fiscal ou juridique : un comptable doit vérifier la structure, les charges salariales (CNPS) et la fiscalité avant tout engagement.

## La note du CFO

**Aujourd'hui (statu quo) : l'activité perd de l'argent.** À ~8 commandes par mois et 60 000 FCFA de panier moyen, chaque commande laisse ≈ 31 000 FCFA une fois ses propres coûts payés. Cela fait ≈ 250 000 FCFA par mois pour couvrir 550 000 FCFA de charges fixes. **Résultat : −63 % de marge, soit environ −3,6 millions FCFA sur 12 mois** si rien ne change. C'est le chiffre le plus important de ce rapport.

**La marge (plan recentré)** : à 65 000 FCFA de panier moyen, chaque commande laisse **36 125 FCFA** (56 %). Le **seuil de rentabilité est de 16 commandes par mois**, soit le double du volume actuel. Au plan de 22 commandes par mois, la marge nette est de **17 %**. L'année 1 finit à **+299 875 FCFA** d'exploitation et à **+34 875 FCFA** après les 265 000 FCFA de lancement, qui sont récupérés au mois 12.

**Le point à surveiller : le volume.** Avec 20 % de commandes en moins que le plan, l'année 1 passe à **−1 080 100 FCFA**. Avec un panier moyen 10 % plus bas, elle passe à **−941 625 FCFA**. La marge de sécurité est mince : tout le plan repose sur le passage de 8 à 16 commandes par mois avant le mois 6.

**La trésorerie** : il faut prévoir **≈ 1,1 million FCFA** pour tenir jusqu'à ce que l'activité se finance elle-même (point bas au mois 5). Ce montant couvre les pertes des 5 premiers mois et les 265 000 FCFA de lancement.

**Trois leviers pour améliorer la marge (simulés avec l'outil, pas devinés)**
1. **Le panier moyen** : 60 000 → 65 000 FCFA fait passer l'année 1 de −655 125 à +299 875 FCFA (+955 000) et le seuil de 18 à 16 commandes. À 70 000 FCFA, l'année 1 monte à +1 254 875 FCFA et le seuil à 14 commandes. Moyens : express +25 %, forfaits école, Pack Visibilité à 65 000.
2. **Les charges fixes** : elles se situent entre 300 000 et 800 000 FCFA, et le point médian est retenu faute de détail. Si elles sont en réalité à 400 000 FCFA, le seuil tombe à ≈ 11 commandes par mois. **Il faut d'abord les détailler poste par poste.**
3. **Le coût des consommables** : +15 % fait perdre ≈ 827 000 FCFA sur l'année 1. Acheter le film, l'encre et le textile par lots avant les saisons (juillet, avril) protège la marge.

**Les conditions financières du conseil (`board.md`)**
- [ ] *Marge brute par commande et volume qui couvrent les charges fixes* : **non remplie aujourd'hui** (8 commandes < 16 au seuil). Elle n'est remplie dans le plan qu'à partir du mois 6.
- [ ] *Chiffres manquants (marge réelle par type de commande, coût d'acquisition, taux de rachat)* : **toujours manquants**. Les coûts ci-dessous sont estimés.
- [x] *Garantie tenable* : coût modélisé à 1 300 FCFA par commande (10 % de retards × 20 %), soit ≈ 2 % du prix. **Supportable.**

---

# Unit economics: Forlife Com' — plan recentré écoles & paroisses (FCFA ; volumes en commandes par mois)

Every number below comes from the input file. Nothing is looked up or guessed.

## One commande

| line | per commande |
| --- | ---: |
| Price | 65 000.00 FCFA |
| Consommables (encre et film DTF, poudre, textile, bâche, papier) — estimation, contenu type d'une commande | -18 000.00 FCFA |
| Sous-traitance ponctuelle (offset gros tirages, broderie, finitions) — estimation | -4 800.00 FCFA |
| Livraison / déplacements (moto, taxi) — estimation | -1 500.00 FCFA |
| Frais mobile money marchand (~1 %) — estimation | -650.00 FCFA |
| Électricité de production par commande — estimation | -1 000.00 FCFA |
| Garantie délai : 10 % de réclamations × 20 % remboursés — estimation | -1 300.00 FCFA |
| Soldes impayés (paiement 50/50) : 5 % × 32 500 — estimation | -1 625.00 FCFA |
| **Contribution** (what each commande leaves to pay the fixed costs) | **36 125.00 FCFA** (56%) |

## The margin that matters

Fixed costs: 550 000 FCFA a month (Charges fixes déclarées (loyer, salaires, électricité de base, internet, remboursement matériel) — point médian de 300 000–800 000 550 000 FCFA).

- **Break-even: 16 commandes par mois.** Below that you lose money every month.
- **Profit margin at your plan** (22 par mois): **17%** of every sale, after every cost.
- Capacity: 78 par mois.

## Year 1, month by month

| mois | commandes | revenue | profit | cumulative (after 265 000 FCFA startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 8 | 520 000 FCFA | -261 000 FCFA | -526 000 FCFA |
| 2 | 9 | 585 000 FCFA | -224 875 FCFA | -750 875 FCFA |
| 3 | 10 | 650 000 FCFA | -188 750 FCFA | -939 625 FCFA |
| 4 | 12 | 780 000 FCFA | -116 500 FCFA | -1 056 125 FCFA |
| 5 | 14 | 910 000 FCFA | -44 250 FCFA | -1 100 375 FCFA |
| 6 | 16 | 1 040 000 FCFA | 28 000 FCFA | -1 072 375 FCFA |
| 7 | 18 | 1 170 000 FCFA | 100 250 FCFA | -972 125 FCFA |
| 8 | 19 | 1 235 000 FCFA | 136 375 FCFA | -835 750 FCFA |
| 9 | 20 | 1 300 000 FCFA | 172 500 FCFA | -663 250 FCFA |
| 10 | 21 | 1 365 000 FCFA | 208 625 FCFA | -454 625 FCFA |
| 11 | 22 | 1 430 000 FCFA | 244 750 FCFA | -209 875 FCFA |
| 12 | 22 | 1 430 000 FCFA | 244 750 FCFA | 34 875 FCFA |

- **Year 1 operating profit: 299 875 FCFA** on 12 415 000 FCFA of revenue.
- After the 265 000 FCFA startup spend: 34 875 FCFA.
- Startup money earned back: month 12.
- Cash you need before it pays for itself: **1 100 375 FCFA**.

## What if

| scenario | margin at plan | break-even par mois | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 17% | 16 | 299 875 FCFA |
| Price -10% | 8% | 19 | -941 625 FCFA |
| Volume -20% | 8% | 16 | -1 080 100 FCFA |
| Unit costs +15% | 10% | 18 | -527 394 FCFA |

No red flags in these numbers. They are only as good as the inputs: check every cost against a real quote.
