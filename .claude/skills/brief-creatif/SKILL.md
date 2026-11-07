---
name: brief-creatif
description: Transforme une demande client (message WhatsApp, note vocale transcrite, appel, mail) en brief créatif complet et ouvre le dossier projet de l'agence (clients/<client>/, projets/<client>/<projet>/). À utiliser au début de tout nouveau projet ou client, avant de concevoir quoi que ce soit.
---

# Brief créatif — rien ne se crée sans brief

## 1. Ouvrir les dossiers

```
clients/<client-slug>/brand-profile.md     # identité du client (une fois par client, réutilisé ensuite)
clients/<client-slug>/assets/              # logo, photos, polices fournis
projets/<client-slug>/<AAAA-MM>-<projet>/
    brief.md                               # ce skill
    strategie.md, concept.md, scripts/, sources/, livrables/, retours.md
```

`<client-slug>` en minuscules sans accents (`ecole-les-flamboyants`). Pour Forlife lui-même : `clients/forlife/` pointe vers
`agence/contexte/brand-profile.md`.

## 2. Extraire, puis questionner seulement ce qui manque

Lire la demande telle quelle, remplir ce qui est déjà dit, puis poser **au plus 5 questions** groupées (format WhatsApp :
courtes, numérotées, ton chaleureux). Ne jamais bloquer : proposer une hypothèse par défaut pour chaque trou
(« Sauf avis contraire, on part sur… »).

## 3. Modèle de `brief.md`

```markdown
# Brief — <Projet> — <Client>
Date : AAAA-MM-JJ · Contact client : <nom, rôle, WhatsApp> · Chef de projet : <…>

## Contexte
Qui est le client, son activité, sa situation (lancement, relance, événement, crise…).

## Objectif (un seul principal, mesurable)
Ex. « 40 inscriptions pour la rentrée d'ici le 15 septembre » / « remplir la salle le 14 décembre ».

## Cible
Qui exactement (âge, lieu, situation), ce qu'elle pense aujourd'hui, ce qu'on veut qu'elle pense/fasse après.

## Message clé (une phrase)
## Preuves / raisons d'y croire
## Ton (3 adjectifs) et interdits
## Livrables
| Livrable | Format | Quantité | Canal | Échéance |
## Contraintes
Budget (FCFA), délais, charte existante, mentions obligatoires, logos partenaires, langues.
## Validation
Qui valide côté client, combien de tours de corrections inclus (par défaut 2).
## Hypothèses prises par l'agence
```

## 4. `clients/<client>/brand-profile.md` (si nouveau client)

Nom, activité, adresse, contacts publics, logo (fichier), couleurs (hex), polices, ton, cibles, concurrents locaux, ce que
le client aime / déteste, réalisations passées. Couleurs inconnues → les extraire du logo fourni
(`convert logo.png -colors 6 -format %c histogram:info:-`) et les faire valider.

## 5. Contrôle avant de lancer la production

- [ ] Un seul objectif principal, mesurable
- [ ] Cible précise (pas « tout le monde »)
- [ ] Livrables listés avec formats et dates
- [ ] Budget et validation connus (ou hypothèse écrite)
- [ ] Droits sur les photos/logos fournis, autorisations pour les élèves/personnes photographiées

Ensuite : skill `agence-forlife` pour répartir le travail entre les agents.
