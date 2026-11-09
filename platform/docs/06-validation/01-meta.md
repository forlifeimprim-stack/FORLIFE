# Dossier Meta — Facebook Pages + Instagram professionnel

Application Meta : **ID `4020918508203295`** (developers.facebook.com → Mes apps).
Résultat attendu : l'application passe en mode **Live**, avec l'**accès avancé** (« Advanced Access ») à chaque
autorisation ci-dessous. N'importe quel client peut alors connecter ses Pages.

## Étape 1 — Vérification de l'entreprise (à lancer tout de suite, en parallèle)

business.facebook.com → Paramètres → **Centre de sécurité** → **Commencer la vérification**.

- Nom légal exact de l'entreprise (identique au RCCM), adresse, téléphone, site web.
- Documents acceptés : registre du commerce (RCCM), attestation fiscale / DFE, facture d'électricité ou de
  téléphone au nom de l'entreprise.
- Vérification par email sur le domaine (d'où l'intérêt d'une adresse `@forlifecomai.ci`) ou par téléphone.
- Délai : de quelques jours à 2 semaines.

Ensuite, reliez l'application à ce portefeuille business : App → Paramètres → Paramètres avancés → **Business
Manager**.

## Étape 2 — Paramètres de base de l'application

App → **Paramètres → Général** :

| Champ | Valeur |
|---|---|
| Nom d'affichage | Forlife Com |
| Domaines de l'app | `forlifecomai.ci` et `ai-growth-et-creative-os.web.app` |
| Email de contact | votre email professionnel |
| URL de la politique de confidentialité | `https://forlifecomai.ci/confidentialite` |
| URL des conditions de service | `https://forlifecomai.ci/conditions` |
| Suppression des données utilisateur | **URL des instructions** : `https://forlifecomai.ci/suppression-des-donnees` |
| Icône (1024 × 1024) | [`assets/icone-1024.png`](assets/icone-1024.png) |
| Catégorie | Business and Pages (Entreprise et Pages) |

**Facebook Login → Paramètres** :
- URI de redirection OAuth valides : `https://forlifecomai.ci/social/callback/meta`
- Connexion OAuth Web : Oui · Connexion OAuth cliente : Oui · Mode strict pour les URI : Oui.

> Si le tableau de bord vous impose « Facebook Login for Business » avec un **ID de configuration**
> (`config_id`), créez la configuration avec les autorisations de l'étape 3, puis envoyez-moi cet identifiant :
> je l'ajoute à la connexion (ce n'est pas un secret).

## Étape 3 — Autorisations à demander (App Review → Permissions and Features)

Pour chacune : **Request advanced access**, puis remplissez « How will your app use this permission? » avec le
texte anglais ci-dessous (à copier tel quel) et joignez la vidéo.

### pages_show_list
> Forlife Com is a marketing platform for small businesses in Côte d'Ivoire. After the user logs in with Facebook
> from our Social Hub, we call /me/accounts to list the Facebook Pages the user manages, so they can choose which
> Pages to connect to their Forlife Com workspace. The list is shown once, at connection time; only the Pages the
> user selects are saved.

### business_management
> Many of our users manage their Pages and Instagram accounts through a Business Manager portfolio. We need
> business_management so that Pages owned by the user's business portfolio appear in the list returned by
> /me/accounts when they connect their accounts in Forlife Com. We do not create, modify or delete any business
> asset.

### pages_manage_posts
> Users write marketing posts in Forlife Com (with AI assistance), an authorized team member approves them, and
> the user schedules them. At the scheduled time, our server publishes the approved text (and link) to the
> connected Page with POST /{page-id}/feed. Nothing is ever published without explicit human approval in our
> approval workflow. The screencast shows a post being approved, scheduled and then appearing on the Page.

### pages_read_engagement
> Our "Analyze my networks" feature reads the latest posts of the connected Page (/{page-id}/posts with message,
> created_time, reactions, comments and shares counts) to show the business which formats, days and times work
> best, and to build its brand voice profile ("Brand DNA") from its own posts. Data is only shown to the Page's
> own team inside their workspace.

### read_insights
> For posts published through Forlife Com, we read post insights (post_impressions, post_impressions_unique,
> post_engaged_users, post_clicks) to show reach and engagement in the user's Analytics & ROI dashboard and link
> them to the marketing campaign that produced the post.

### instagram_basic
> After connecting a Facebook Page, we read the linked Instagram professional account (id, username, profile
> picture) so the user can select it as a publishing destination. Our "Analyze my networks" feature also reads
> the account's recent media (caption, timestamp, media type, like and comment counts) to report what performs
> best. When the user pastes the link of another public professional Instagram account (for example a
> competitor), we use Business Discovery to read that account's public profile and public media for the user's
> analysis only.

### instagram_content_publish
> Approved posts with an image (created in our Creative Studio) are published to the connected Instagram
> professional account at the scheduled time, using POST /{ig-user-id}/media then /media_publish. Only content
> approved by an authorized team member is published.

### instagram_manage_insights
> For Instagram posts published through Forlife Com, we read media insights (impressions, reach,
> total_interactions) to display them in the user's Analytics & ROI dashboard. Business Discovery (used in our
> "Analyze my networks" feature) also relies on this permission.

## Étape 4 — Vidéo de démonstration (scénario)

Une seule vidéo de 3 à 5 minutes peut servir pour toutes les autorisations ; Meta accepte aussi une vidéo par
autorisation. Interface en anglais ou légendes anglaises.

| # | Écran | Ce que l'on montre | Légende à ajouter |
|---|---|---|---|
| 1 | Page de connexion Forlife Com | Saisie de l'email et du mot de passe du compte de démonstration | « Log in to Forlife Com » |
| 2 | Social Hub | Clic sur **Connecter** sur la tuile Facebook / Instagram | « Connect Facebook & Instagram » |
| 3 | Fenêtre Facebook | **Barre d'adresse visible** (client_id = 4020918508203295 et liste des autorisations), choix des Pages, validation | « Facebook Login: the user grants the permissions » |
| 4 | Retour Forlife Com | Liste des Pages et comptes Instagram trouvés (**pages_show_list, business_management, instagram_basic**), sélection, Connecter | « Pages the user manages are listed; the user picks which to connect » |
| 5 | Content Studio → Approbations | Un post rédigé, puis **Approuver** par un responsable | « Every post requires human approval » |
| 6 | Contenu → « Programmer la publication » | Programmation sur la Page et sur Instagram | « Scheduling » |
| 7 | Social Hub → Historique | Statut **Publié** et lien vers la publication | « Published with pages_manage_posts / instagram_content_publish » |
| 8 | Facebook et Instagram | Le post visible sur la Page et sur le compte Instagram | « The post on the Page / on Instagram » |
| 9 | Analytics & ROI | Statistiques de la publication | « read_insights / instagram_manage_insights » |
| 10 | Analyser mes réseaux | Lien de la Page + lien d'un compte Instagram, lancement, résultats | « pages_read_engagement / instagram_basic (Business Discovery) » |
| 11 | Social Hub | **Déconnecter** un compte | « Users can disconnect at any time; tokens are deleted » |

Comme les publications réelles n'arrivent qu'à l'heure programmée, programmez-les 2 minutes plus tard et coupez
l'attente au montage.

## Étape 5 — Instructions de test pour l'examinateur (champ « Test instructions »)

> 1. Go to https://forlifecomai.ci and log in with the test account provided below.
> 2. Open "Social Hub" in the left menu and click "Connecter" on the Facebook / Instagram tile. Log in with a
>    Facebook test user that manages a test Page linked to an Instagram professional account.
> 3. Select the Page and Instagram account, then click "Connecter".
> 4. Open "Content Studio" and the content "Promo de la semaine" (already approved). In the card "Programmer la
>    publication", pick a time 2 minutes from now and confirm.
> 5. After publication, open "Social Hub" → "Historique" to see the link, then "Analytics & ROI" for insights.
> 6. Open "Analyser mes réseaux", paste the Page link and click "Analyser mes réseaux" to see the post analysis.
> Test account: [email] / [password]

## Motifs de refus fréquents (et comment les éviter)

- **Vidéo sans la fenêtre de connexion Facebook** : elle doit apparaître avec l'URL visible.
- **Autorisation demandée mais non montrée** : chaque autorisation doit avoir un passage dans la vidéo. Sinon,
  retirez-la de la demande et dites-le-moi pour que je la retire du code.
- **Politique de confidentialité inaccessible ou générique** : la nôtre est publique et détaille chaque
  autorisation.
- **Examinateur bloqué à la connexion** : vérifiez le compte de démonstration la veille de la soumission.
- **Entreprise non vérifiée** : l'accès avancé est refusé tant que l'étape 1 n'est pas terminée.

## Après la validation

1. App → **Mode : En ligne (Live)**.
2. Prévenez-moi : je vérifie une connexion réelle avec un compte qui n'est pas testeur.
3. Les clients déjà connectés pendant la phase de test doivent **reconnecter** leurs comptes une fois, pour
   accorder la nouvelle autorisation `instagram_manage_insights`.
