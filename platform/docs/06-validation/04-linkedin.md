# Dossier LinkedIn

Application LinkedIn : **client ID `78le7bt8miifhs`** (linkedin.com/developers → My apps).

## 1. Profil personnel : déjà ouvert à tous

Les produits **« Sign In with LinkedIn using OpenID Connect »** et **« Share on LinkedIn »** sont en libre
service : tout membre LinkedIn peut déjà connecter son profil et y publier depuis Forlife Com. Aucune validation
n'est nécessaire.

À vérifier dans l'onglet **Auth** :
- Redirect URL : `https://forlifecomai.ci/social/callback/linkedin`
- Scopes affichés : `openid`, `profile`, `w_member_social`.

Dans l'onglet **Settings** : logo ([`assets/icone-512.png`](assets/icone-512.png)), URL de la politique de
confidentialité, et une **Page LinkedIn de Forlife Com** associée et **vérifiée** par un administrateur de la Page.

## 2. Pages entreprise : « Community Management API » (sur demande)

Pour publier sur les **pages entreprise** des clients, il faut le produit **Community Management API**.

Règles LinkedIn à connaître :
- Ce produit doit être demandé dans une **application LinkedIn séparée**, qui ne contient aucun autre produit.
  Il faudra donc créer une 2ᵉ application « Forlife Com Pages ». Quand vous l'aurez, je l'ajouterai au code (2ᵉ
  identifiant, rien à changer pour les clients).
- Il y a deux niveaux : d'abord **Development** (accès de test), puis **Standard** (production), avec une vidéo de
  démonstration.
- LinkedIn demande une entreprise enregistrée, un email professionnel (pas Gmail) et une Page LinkedIn vérifiée.

Formulaire (en anglais) — **cas d'usage** :
> Forlife Com is a marketing platform for small businesses in francophone West Africa. Page administrators
> connect their LinkedIn Company Page, write posts with AI assistance, get them approved by their team and
> schedule them. At the scheduled time we publish the approved post to the organization with the Posts API
> (w_organization_social), list the pages the user administers (rw_organization_admin) and read post statistics
> (r_organization_social) for the user's analytics dashboard. Nothing is published without human approval.

Scopes demandés : `r_organization_social`, `w_organization_social`, `rw_organization_admin`.

Scénario de la vidéo :
1. connexion à Forlife Com ;
2. Social Hub → Connecter LinkedIn ;
3. consentement LinkedIn (URL visible) ;
4. choix de la page entreprise ;
5. post approuvé, puis programmé ;
6. post visible sur la page LinkedIn ;
7. statistiques dans Analytics ;
8. déconnexion.

## Recommandation

Commencez sans les pages entreprise : la publication sur le profil personnel fonctionne déjà. Faites la demande
« Community Management API » quand vos premiers clients B2B la réclament, et une fois le domaine et l'email
professionnel en place.
