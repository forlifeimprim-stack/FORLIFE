# Mise en ligne de Forlife Com — projet Firebase « AI Growth et Creative OS »

```
Navigateur ──► Firebase Hosting  https://<ID-du-projet>.web.app
                 ├─ /            → interface React (apps/web/dist)
                 └─ /api/**      → Cloud Run « forlife-api » (europe-west1)
                                      ├─ API + worker + planificateur (compte base « forlife_app », droits restreints)
                                      ├─ Cloud SQL PostgreSQL (connexion chiffrée par le connecteur Cloud SQL)
                                      ├─ Cloud Storage privé (fichiers, visuels, vidéos)
                                      └─ Secret Manager (toutes les clés)
               Job Cloud Run « forlife-migrate » : migrations avec le compte propriétaire « forlife », à chaque déploiement
```

Le site vitrine existant (projet `forlifecom-6eef9`) n'est pas concerné.

> **Règle d'or : aucun secret ne passe par le chat ni par GitHub.** Le dépôt est public. Les mots de passe
> et clés sont générés dans Google Cloud et rangés dans Secret Manager. GitHub se connecte à Google Cloud
> sans clé (Workload Identity Federation), uniquement depuis ce dépôt et ses branches de travail.

## 1. Une commande dans Cloud Shell (≈ 5 min)

Ouvrez [Cloud Shell](https://shell.cloud.google.com) (compte propriétaire du projet), puis :

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/forlifeimprim-stack/FORLIFE/claude/app-development-sbl2ff/platform/scripts/gcp-setup.sh)
```

Le script détecte le projet « AI Growth et Creative OS » et votre instance PostgreSQL, puis :

| Étape | Effet |
|---|---|
| Sécurisation Cloud SQL | connexions chiffrées obligatoires, aucun réseau ouvert, sauvegardes 14 j + restauration à la minute, protection contre la suppression |
| Comptes de base | `forlife` (propriétaire, migrations uniquement) et `forlife_app` (application) — mots de passe aléatoires jamais affichés |
| Secret Manager | URL de base (×2), clé JWT, clé de chiffrement, email administrateur, code d'activation du back-office |
| Stockage | bucket privé, accès public interdit |
| Comptes de service | `forlife-api` (ses secrets, son bucket, Cloud SQL) et `github-deploy` (déploiement seulement) |
| GitHub | fédération d'identité limitée aux pushs de ce dépôt sur `main` et la branche de développement (jamais une pull request) |

À la fin, il affiche :

1. **un bloc de configuration sans secret** (ID et numéro du projet, instance, bucket, site) → **envoyez-le à Claude** ;
2. **un code d'activation du back-office** → **gardez-le pour vous** (ne l'envoyez à personne).

## 2. Déploiement

Claude renseigne `platform/deploy/production.env` avec le bloc reçu et pousse : le workflow
« Déploiement plateforme » se lance automatiquement :

1. tests complets (API + base de données) ;
2. construction de l'interface et de l'image Docker **sans aucun identifiant cloud** ;
3. authentification Google éphémère, publication de l'image ;
4. job de migration (compte propriétaire) puis droits restreints du compte applicatif ;
5. déploiement Cloud Run (compte `forlife_app`) puis Firebase Hosting ;
6. contrôle : `https://<ID>.web.app/api/health` doit répondre `{"status":"ok"}` (base connectée).

## 3. Premier accès administrateur

1. Créez votre compte sur `https://<ID>.web.app/signup` avec l'email donné au script.
2. Menu **Plateforme → Back-office** : saisissez le **code d'activation** (oublié ? dans Cloud Shell :
   `gcloud secrets versions access latest --secret=forlife-admin-bootstrap`).
3. S'inscrire avec l'email administrateur **ne suffit jamais** sans ce code. Retirer un email du secret
   `forlife-admin-emails` coupe son accès immédiatement.

## 4. Brancher les services (quand vous êtes prêt)

Chaque clé se crée **dans Cloud Shell, par vous** (exemple : `printf 'VOTRE-CLE' | gcloud secrets create forlife-anthropic-key --data-file=-`),
puis dites à Claude quels secrets existent : il les ajoute à `OPTIONAL_SECRETS` (noms uniquement).

| Service | Secret | Réglage non secret | À déclarer chez le prestataire |
|---|---|---|---|
| IA réelle (Claude) | `forlife-anthropic-key` → `ANTHROPIC_API_KEY` | `AI_PROVIDERS=anthropic,mock` | — |
| Emails (Resend) | `forlife-resend-key` → `RESEND_API_KEY` | `EMAIL_DRIVER=resend` | domaine expéditeur vérifié |
| Paiement CinetPay | `forlife-cinetpay-key` → `CINETPAY_API_KEY` | `CINETPAY_SITE_ID` (EXTRA_ENV) | notification : `https://<ID>.web.app/api/public/payments/cinetpay/notify` |
| Facebook / Instagram | `forlife-meta-secret` → `META_APP_SECRET` | `META_APP_ID` (EXTRA_ENV) | redirection OAuth : `https://<ID>.web.app/social/callback/meta` |

Pour chaque nouveau secret, autorisez le compte de l'API à le lire :
`gcloud secrets add-iam-policy-binding NOM --member=serviceAccount:forlife-api@<ID>.iam.gserviceaccount.com --role=roles/secretmanager.secretAccessor`.

> Tant que Resend n'est pas branché, les emails (confirmation d'adresse, mot de passe oublié, invitations)
> ne partent pas : les 200 crédits offerts du plan Free ne sont versés qu'après confirmation de l'email.
> Brancher Resend est donc prioritaire avant d'ouvrir les inscriptions au public.

## 5. Sécurité en production (résumé)

- Authentification : sessions révocables immédiatement, refresh token à usage unique, verrou de 15 min
  après 10 échecs par compte (indépendant de l'adresse IP), en-tête anti-CSRF, scrypt renforcé.
- Back-office : email autorisé **et** code d'activation ; accès retiré dès que l'email sort de la liste.
- Multi-tenant : chaque requête vérifie organisation, workspace et rôle ; agences limitées à leurs espaces.
- Contenus : une approbation ne vaut que pour la version relue ; toute modification exige une nouvelle validation.
- Paiements : statut toujours confirmé auprès de CinetPay, montant et devise vérifiés, livraison atomique.
- Fichiers : SVG convertis en PNG à l'import, images démesurées refusées sans décodage.
- Base : l'application ne peut ni modifier le schéma, ni réécrire ou vider l'audit et le registre des crédits.
- Navigateur : CSP stricte, HSTS, aucune intégration dans un autre site.

Limite connue : l'adresse `*.run.app` de Cloud Run reste joignable directement (nécessaire à Firebase Hosting).
Les limites par adresse IP y sont donc « au mieux » ; les protections critiques reposent sur des compteurs
par compte, par numéro et par formulaire, stockés en base.

## 6. Coûts et exploitation

| Poste | Estimation mensuelle (faible trafic) |
|---|---|
| Cloud Run (1 instance toujours active, 2 vCPU / 2 Go) | ~ 60 à 90 USD |
| Cloud SQL (selon la taille choisie) | ~ 10 à 30 USD |
| Stockage, Artifact Registry, Hosting | < 5 USD |

- Journaux : Cloud Run → forlife-api → Journaux (chaque requête porte un `x-correlation-id`).
- Retour arrière : Cloud Run → Révisions → 100 % du trafic sur la révision précédente.
- Sauvegardes : Cloud SQL → Sauvegardes (restauration à la minute près sur 7 jours).
