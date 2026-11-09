# Rapport T02 : Mariam, assistante d'édition

Date : lundi 9 novembre 2026.

## Statut

TERMINÉ. Les procédures n'ont pas pu être vérifiées en ligne (réseau de la session limité), et rien n'a été envoyé : tous les courriers attendent l'accord écrit de l'utilisateur.

## Résumé

Le rétroplanning compte 52 étapes, de la réunion du 9 novembre 2026 à la parution du dimanche 28 mars 2027. Le script de contrôle ne trouve aucun conflit de dépendance. Le chemin critique passe par la rédaction des trois lots, puis par le lot 3 (validation par l'auteur, correction, validation des corrections), la composition, les deux tours d'épreuves, le BAT du 1er mars 2027, l'impression du 2 au 16 mars et la livraison au plus tard le 19 mars. Il reste une seule semaine de marge franche, du 22 au 26 mars.

Ce calendrier suppose que la lecture éditoriale (T13) se fasse lot par lot, alors que `plan.md` la place après le manuscrit complet. En gardant l'ordre de `plan.md`, la livraison des exemplaires tombe après Pâques. La décision revient à Akissi.

J'ai monté neuf dossiers administratifs (quatre ISBN, dépôt légal, BURIDA, déclaration d'éditeur, catalogue 2026, contrat), un projet de contrat d'édition, quatre brouillons de courriels, les contacts, les relances et le compte rendu de lancement. J'ai aussi intégré la mise à jour d'Akissi : la biographie est réglée par l'utilisateur, il n'y a pas de photo, la graphie imprimée est « Kouadio Koffi Élisée », et seule la vérification des deux titres de la page « Du même auteur » reste en relance.

## Échéances du 9 au 23 novembre 2026

| Date | Échéance | Qui |
|---|---|---|
| lun 09/11 | Réunion de lancement. Compte rendu et brouillons prêts | Akissi, Mariam |
| mar 10/11 | Accord écrit de l'utilisateur pour envoyer le message à l'auteur et les demandes d'information ISBN, dépôt légal et BURIDA (relance R06 le jeudi 12/11) | utilisateur |
| ven 13/11 | Remise du plan détaillé (T03) | Konan |
| ven 13/11 | Décision sur la lecture éditoriale lot par lot | Akissi |
| ven 13/11 | Réponses de l'auteur souhaitées (si le message part le 10/11) | auteur |
| lun 16/11 | Projet de contrat transmis pour relecture à un juriste ou au BURIDA (après accord) | Mariam |
| lun 16/11 au mar 17/11 | Validation du plan détaillé (T09) | Akissi |
| mer 18/11 | Relance de l'auteur si les réponses de cadrage manquent | Mariam |
| mer 18/11 au ven 20/11 | Validation du plan par l'auteur | auteur |
| ven 20/11 | Date butoir pour les réponses de cadrage, les positions doctrinales (chemin critique), le statut de Forlife Imprim et le signataire pour l'éditeur. Réponse de l'agence ISBN visée | auteur, agence ISBN |
| lun 23/11 | Début de la rédaction du lot 1. Dépôt du dossier ISBN. Début de la déclaration d'éditeur et de l'adhésion au BURIDA si nécessaire. Point d'étape proposé | Konan, Mariam, auteur, Akissi |

Juste après cette période, le vendredi 27/11, sont attendus l'enregistrement de référence de la voix ainsi que les titres et dates des livres précédents.

## Fichiers

- `suivi/retroplanning.md` : tableau à rebours avec identifiants, dépendances et chemin critique, fêtes, plan de repli (Pentecôte, 16 mai 2027) et vue à quatorze jours.
- `suivi/contacts.md` : contacts connus (auteur, Forlife Imprim d'après `livre.yaml`, équipe) et contacts à obtenir en [À COMPLÉTER].
- `suivi/relances.md` : dix demandes ouvertes (R01 à R10).
- `suivi/dossiers-administratifs.md` : dossiers D1 à D9 et tableau de synthèse.
- `droits/projet-contrat-edition.md` : projet de contrat, avec la mention « projet à faire relire par un juriste ou par le BURIDA ».
- `suivi/brouillons/2026-11-09-demande-isbn.md`, `2026-11-09-demande-info-depot-legal.md`, `2026-11-09-demande-info-burida.md`, `2026-11-09-message-auteur-cadrage.md` : chacun commence par « BROUILLON, NE PAS ENVOYER SANS ACCORD ».
- `suivi/reunion-lancement.md` : compte rendu, décisions, quatorze actions.

## Vérifications

- Accès en ligne : un essai unique, `curl` vers isbn-international.org, burida.ci, bnci.ci et gouv.ci, a reçu la réponse « CONNECT tunnel failed, response 403 ». Chaque procédure porte donc la mention « procédure non vérifiée en ligne le 9 novembre 2026 (réseau de la session limité) ».
- Rétroplanning : le script `controle_retroplanning.py` (dans le dossier temporaire de session) relit le tableau et vérifie trois choses : que chaque étape commence après la fin de ses dépendances, que la fin ne précède pas le début, et que le jour de la semaine affiché correspond à la date. Le premier passage a trouvé 5 conflits, que j'ai corrigés (production audio décalée après le BAT, ajout des lignes R02 et R03, contrat scindé en relecture puis signature, réponses de cadrage rattachées au lot 1). Résultat final : « 52 étapes, 0 conflit(s) », aucun jour faux.
- Date de Pâques 2027 : le 28 mars 2027 est bien un dimanche (calcul Python).
- Références bibliques citées dans le message à l'auteur, vérifiées avec `outils/verset.py` : Jérémie 23:5, 25:11, 29:10, 31:31 (LSG 1910).
- Livres précédents : « Avant que l'horloge ne s'arrête » figure avec ce titre dans la source du dépôt Forlife (`git show 5e23f53:livre/avant-que-l-horloge-ne-s-arrete.md`), mais aucune date de parution n'y est indiquée. « Stop, écoute ton enfant » est introuvable dans le dépôt.
- Règles d'écriture, contrôlées en Python sur les 10 fichiers : 0 tiret cadratin ou demi-cadratin, 0 émoji, 0 graphie « Elisée », un seul passage en gras (l'en-tête du contrat), aucun mot de la liste à éviter (grep).
- Aucun courriel envoyé, aucune invitation, aucun commit.

## Hypothèses

- Parution le 28 mars 2027, date de travail. L'auteur valide un lot en cinq jours ouvrés. L'impression et le façonnage tiennent en onze jours ouvrés.
- La lecture éditoriale et la correction se font lot par lot (proposition faite à Akissi).
- Les organismes sont identifiés de mémoire : agence ISBN et dépôt légal à la Bibliothèque nationale de Côte d'Ivoire, BURIDA, ministère chargé de la culture. Tout est marqué [À VÉRIFIER]. Aucun coût ni délai n'est avancé.
- Le numéro de dépôt légal est à obtenir avant le BAT, puisqu'il doit être imprimé (art. 26).
- Un ISBN par format : papier, EPUB et audio. Pour le PDF écran, l'ISBN est en option à confirmer par Akissi et Désiré.

## Points ouverts et risques

- Positions doctrinales (R04) : sans elles le 20 novembre, la rédaction du lot 1 ne peut pas démarrer et tout le chemin critique glisse.
- Charge de l'auteur : il intervient sur plus de quinze étapes, dont deux validations la semaine du 4 au 8 janvier 2027.
- Signataire pour l'éditeur : l'auteur dirige Forlife Imprim (selon `fiche-projet.md`). Selon la forme juridique, il s'agit d'une convention réglementée en droit OHADA, ou bien le contrat est sans objet (entreprise individuelle). À noter : la biographie validée le présente comme « cofondateur de Forlife Com ». S'il y a d'autres associés, l'un d'eux pourrait signer pour l'éditeur. Information à confirmer (R05).
- Texte rédigé par IA : sa protection par la loi n° 2016-555 et la clause de garantie du contrat sont à faire trancher par un juriste ou par le BURIDA (la question figure dans le brouillon BURIDA, qui ne doit partir qu'avec l'accord de l'auteur).
- Jours fériés à vérifier : le 7 décembre 2026, ainsi que la Nuit du destin et l'Aïd el-Fitr 2027, qui tombent probablement dans la fenêtre d'impression.
- Dates de parution des deux livres précédents : [À VÉRIFIER] (R03).
- Statut de Forlife Imprim : de lui dépendent la déclaration d'éditeur, le catalogue 2026 (à déposer avant le 31 décembre 2026) et peut-être la recevabilité de la demande d'ISBN.
- Signalé à Salif : les cinq exemplaires du dépôt légal sont à compter dans le tirage. Les noms des imprimeurs B et C sont attendus pour `contacts.md` (R10).

## Part générée par IA

Aucun texte de ce rapport ni de mes fichiers n'entrera dans le livre. Le projet de contrat et les courriers sont rédigés par IA : ils sont à relire par l'auteur et par un juriste avant tout usage.

## Suite proposée

1. L'utilisateur donne son accord d'envoi, ou le refuse, pour les quatre brouillons.
2. Akissi tranche la lecture éditoriale lot par lot et fixe la date du point d'étape du 23 novembre.
3. Le 20 novembre, je mets à jour les relances, puis je dépose le dossier ISBN le 23 novembre.
4. Quand le réseau le permettra, je vérifie les procédures sur les sites officiels et je date la vérification dans `dossiers-administratifs.md`.
