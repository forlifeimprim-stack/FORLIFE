# Validation des applications auprès des plateformes

**Objectif.** Vos clients connectent leurs pages en un clic, sans jamais créer d'API. Pour cela, chaque
plateforme doit valider **votre** application Forlife Com une seule fois. Tant que ce n'est pas fait, seuls
les comptes ajoutés comme testeurs peuvent se connecter.

| Dossier | Ce qu'on obtient | Délai indicatif |
|---|---|---|
| [01 — Meta (Facebook + Instagram)](01-meta.md) | Publication et statistiques sur les Pages et comptes Instagram de tous les clients | 1 à 4 semaines |
| [02 — TikTok](02-tiktok.md) | Envoi des vidéos dans les brouillons TikTok + statistiques, pour tous | 1 à 3 semaines |
| [03 — Google / YouTube](03-google-youtube.md) | Envoi des vidéos sur les chaînes + statistiques ; quota d'envoi plus élevé | 2 à 6 semaines |
| [04 — LinkedIn](04-linkedin.md) | Profil personnel : déjà ouvert à tous. Pages entreprise : accès à demander | Immédiat / 2 à 4 semaines |

## 1. Prérequis communs (à faire avant toute soumission)

| # | Élément | État | Action |
|---|---|---|---|
| 1 | Politique de confidentialité publique, avec une section par réseau | ✅ en ligne | `/confidentialite` (Meta, Google/YouTube avec « Limited Use », LinkedIn, TikTok) |
| 2 | Conditions d'utilisation | ✅ en ligne | `/conditions` |
| 3 | Page d'instructions de suppression des données | ✅ en ligne | `/suppression-des-donnees` (FR + EN), aussi `/data-deletion` |
| 4 | Icône de l'application | ✅ prête | [`assets/icone-1024.png`](assets/icone-1024.png), 512 et 192 px |
| 5 | Domaine personnalisé actif | ✅ connecté | `forlifecomai.ci`, relié au site Firebase le 29/10 |
| 6 | Adresse email professionnelle de contact | ⏳ à créer | ex. `contact@forlifecomai.ci` (après activation du domaine) |
| 7 | Documents de l'entreprise | ⏳ à rassembler | RCCM, DFE / attestation fiscale, justificatif d'adresse au nom de Forlife Com |
| 8 | Compte de démonstration pour les examinateurs | ⏳ à créer | voir § 3 |

**Recommandation forte : activer le domaine `forlifecomai.ci` avant de soumettre.** Les examinateurs vérifient
que le site, la politique de confidentialité et les adresses de retour (redirect URI) sont sur un domaine qui vous
appartient. Google exige même de prouver la propriété du domaine dans la Search Console. Soumettre sur
`web.app` puis changer de domaine oblige à refaire une partie des démarches.

Une fois le domaine actif, je bascule l'application dessus et je mets à jour les adresses ci-dessous.

## 2. Adresses à déclarer (domaine officiel)

| Usage | Adresse |
|---|---|
| Site / page d'accueil | `https://forlifecomai.ci` |
| Politique de confidentialité | `https://forlifecomai.ci/confidentialite` |
| Conditions d'utilisation | `https://forlifecomai.ci/conditions` |
| Instructions de suppression des données | `https://forlifecomai.ci/suppression-des-donnees` |
| Retour OAuth Meta | `https://forlifecomai.ci/social/callback/meta` |
| Retour OAuth TikTok | `https://forlifecomai.ci/social/callback/tiktok` |
| Retour OAuth Google | `https://forlifecomai.ci/social/callback/youtube` |
| Retour OAuth LinkedIn | `https://forlifecomai.ci/social/callback/linkedin` |

L'ancienne adresse `https://ai-growth-et-creative-os.web.app` reste en service. Gardez aussi ses adresses de retour
(`…web.app/social/callback/…`) déclarées chez chaque plateforme : un utilisateur qui passe par l'ancienne adresse
revient sur l'ancienne.

## 3. Compte de démonstration pour les examinateurs

Les examinateurs doivent pouvoir se connecter à Forlife Com et refaire le parcours de la vidéo.

1. Créez un espace dédié depuis la page d'inscription, par exemple l'entreprise « Forlife Démo » avec une adresse
   email que vous contrôlez.
2. Ajoutez des crédits à cet espace depuis le Back-office (Organisations → Forlife Démo → crédits), par exemple
   1 000 crédits.
3. Préparez un contenu **déjà validé** avec un visuel et une vidéo terminée, pour que l'examinateur puisse
   programmer une publication tout de suite.
4. Donnez l'email et le mot de passe **uniquement dans le formulaire de la plateforme**, dans le champ prévu pour
   les instructions de test. Ne les mettez jamais dans un document partagé ou dans ce dépôt.

Meta et TikTok fournissent en plus leurs propres comptes de test : ajoutez-les comme testeurs si le formulaire le
demande.

## 4. Les vidéos de démonstration (screencasts)

Chaque plateforme exige une vidéo de l'écran qui montre le **vrai** parcours : connexion à Forlife Com, page
d'autorisation de la plateforme, puis usage concret de chaque autorisation. Ces vidéos doivent être filmées
depuis votre compte, car elles montrent les vraies pages de connexion. Chaque dossier contient le **scénario plan
par plan**.

Conseils communs :
- enregistrez en 1080p, sans musique, en anglais ou avec des sous-titres anglais, durée 2 à 5 minutes ;
- passez l'interface en anglais si possible, ou ajoutez des légendes en anglais ;
- montrez l'URL du navigateur au moment de l'autorisation (preuve du client ID et des autorisations demandées) ;
- n'utilisez que des données de démonstration, pas de vrais clients.

Je peux monter et sous-titrer vos enregistrements (Remotion), comme pour la vidéo de présentation.

## 5. Ordre conseillé

1. Activation du domaine, puis email professionnel, puis bascule de l'application sur `forlifecomai.ci`.
2. **Meta** : vérification de l'entreprise (en parallèle, dès maintenant), puis examen de l'application.
3. **TikTok** : examen de l'application (indépendant de Meta).
4. **Google** : vérification de la marque et du domaine, puis vérification des autorisations sensibles, puis
   formulaire d'audit YouTube (quota).
5. **LinkedIn Pages** : à la fin, quand les premiers clients B2B le demandent.

## 6. Ce qui a été corrigé dans l'application pour ces validations

- Page publique « Suppression de vos données » (exigée par Meta, utile pour tous).
- Politique de confidentialité complétée : autorisations Meta, mentions YouTube et Google obligatoires (conditions
  YouTube, règles de confidentialité Google, utilisation limitée, lien de révocation), LinkedIn, et la lecture des
  pages publiques par « Analyser mes réseaux ».
- Autorisation `instagram_manage_insights` ajoutée : sans elle, les statistiques Instagram ne pouvaient pas être lues.
- **Règle YouTube des 30 jours** : les statistiques YouTube et les analyses contenant des données YouTube sont
  supprimées automatiquement au-delà de 30 jours sans mise à jour (nettoyage horaire, testé).
