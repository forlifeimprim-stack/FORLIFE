# D02 : Diagnostic UX/UI de Forlife Com (Aya, 07/11/2026)

## STATUT

TERMINÉ. Application lancée en local (IA simulée, réseaux sociaux en bac à sable), parcours testés à 360 px et
1280 px avec Playwright. Aucune modification du code, de la configuration ni de git. axe-core n'est pas disponible
dans `/opt/node-tools` : l'accessibilité a été mesurée par mes propres scripts (contraste, zones tactiles, noms
accessibles, clavier), voir VÉRIFICATIONS.

Dossier des preuves (noté `CAPT/` dans ce rapport) :
`/tmp/claude-0/-home-user-FORLIFE/f743d9c3-cade-5323-a17b-7e4c52982ff1/scratchpad/equipe/aya/`
(captures `360-*.png`, `1280-*.png`, `flows/*.png`, mesures `audit-results.json`, journaux `flows/360-log*.txt`,
scripts `audit.mjs`, `flows.mjs`, `flows2.mjs`, `flows3.mjs`).

## RÉSUMÉ

Le produit est riche, cohérent dans son ton (vouvoiement respecté partout dans l'interface), parle en FCFA, met
WhatsApp et le mobile money en avant, affiche le coût en crédits avant chaque génération et ne publie rien sans
validation. L'audit du 13/10 a bien corrigé les débordements et les contrastes de texte : 0 débordement horizontal
sur 15 écrans à 360 px et 1280 px, 0 contraste de texte insuffisant mesurable.

Les problèmes sont surtout des problèmes de parcours sur mobile :

1. Un nouvel inscrit a 0 crédit tant qu'il n'a pas confirmé son email, et la production n'envoie aucun email
   (`EMAIL_DRIVER=log`, D01). Sa première action « Créer un contenu » se termine par « Crédits insuffisants pour
   cette opération », affiché sous le bouton, sans explication ni solution. La première valeur est inatteignable.
2. Sur 360 px, les boutons principaux sont presque tous sous la ligne de flottaison : « Se connecter » (y = 980),
   « Continuer » de l'inscription (y = 978), « Rédiger le contenu » (y = 1 403), champ du Copilot (y = 2 181),
   « Générer la vidéo » (y = 2 902).
3. Faire avancer un prospect dans le CRM (jusqu'à « Gagné ») et replanifier un contenu ne se font que par
   glisser-déposer. Il n'y a aucune alternative au toucher ou au clavier (WCAG 2.2 critère 2.5.7). Or le ROI en FCFA
   dépend des ventes marquées « Gagné ».
4. Les erreurs réseau s'affichent en anglais brut (« Failed to fetch »), hors écran. Une page hors ligne affiche des
   zéros (« 0 FCFA ») au lieu d'un état « hors connexion ».
5. Le vocabulaire est un mélange d'anglais et de jargon technique : Strategist, Brand Guardian, Content Writer,
   « Clés Meta à ajouter », `copilot.chat`, `SUCCEEDED`, « mock forlife-mock-1 ». Cela renforce l'impression d'un
   outil « IA » plutôt que d'une équipe à vos côtés.

Avec un compte confirmé, la première valeur est rapide : 9 actions et 14 s (IA simulée) entre l'accueil et un
premier contenu programmé. Le chemin est cependant fragmenté entre trois écrans (fiche, Approbations, fiche).

## CONSTATS

Gravité : BLOQUANT (empêche un parcours clé), MAJEUR (friction forte ou non-conformité WCAG 2.2 AA), MINEUR.
Responsable : Grâce (front web) ; Princesse (mobile, PWA, réseau faible) ; José (back-end), cité en appui quand
la cause est côté serveur.

| ID | Gravité | Écran | Constat | Preuve | Recommandation | Responsable |
|---|---|---|---|---|---|---|
| U01 | BLOQUANT | Inscription, puis Content Studio | Un nouveau compte a 0 crédit avant la confirmation de l'email (`billing/ledger.ts:143-147`), et la production n'envoie pas d'email (`deploy/production.env:20`, `EMAIL_DRIVER=log`). La mission n°2 de l'accueil promet « L'IA rédige pour chaque réseau en un clic », puis « Proposer des angles » renvoie « Crédits insuffisants pour cette opération ». Le message ne parle pas de l'email et ne propose aucune solution. | `CAPT/flows/360-s2-angles.png` ; journal : « Crédits avant confirmation : 0 », « après confirmation : 200 » (`flows/360-log2.txt`) | Accorder un petit lot de démarrage sans confirmation (par exemple 30 crédits, de quoi faire un premier contenu), ou confirmer par code WhatsApp/SMS. Désactiver les boutons IA tant que le solde est à 0, avec le message « Confirmez votre email pour recevoir vos 200 crédits offerts » et le bouton « Renvoyer l'email ». Décision produit avec Elisée, envoi des emails avec Brice. | Grâce (UI), José (règle de crédits) |
| U02 | BLOQUANT | Connexion, Inscription (360 px) | Le panneau de présentation (`AuthAside`) occupe tout le premier écran. Le formulaire commence à y = 580 et « Se connecter » est à y = 980, pour une hauteur visible de 740. Les boutons « Continuer » et « Créer mon espace » de l'inscription sont à y = 978, 868 et 907. Sur Android, l'utilisateur doit faire défiler la page pour se connecter. | `CAPT/360-login.png` ; journal `flows.mjs` : « bouton Continuer y=978 (pli 740) » | Sur mobile, placer le formulaire en premier et réduire la présentation à une ligne (logo + promesse), le reste plus bas. Objectif : le bouton principal visible sans défiler. | Grâce, Princesse |
| U03 | BLOQUANT | CRM (pipeline), Calendrier | Le changement d'étape d'un prospect n'existe que par glisser-déposer HTML5 (`Crm.tsx:153-168`, `move()` appelée seulement dans `onDrop`). La fiche du prospect n'a aucun sélecteur d'étape (`Crm.tsx:325-330`). Même chose pour replanifier dans le Calendrier (`Calendar.tsx:106-134`). Le glisser-déposer HTML5 n'est pas fiable au toucher sur Android et ne fonctionne pas au clavier : c'est un échec du critère WCAG 2.2 2.5.7 (mouvements de glissement). Sans « Gagné », Analytics & ROI reste vide. | Code cité ; texte affiché « Glissez une carte d'une colonne à l'autre » (`Crm.tsx:187`) ; `CAPT/360-calendar.png` | Ajouter dans la fiche prospect un sélecteur « Étape » ou des boutons « Marquer contacté / devis envoyé / gagné / perdu ». Pour « Gagné », demander le montant en FCFA. Dans le calendrier, ajouter « Changer la date » dans la fiche du contenu programmé. | Grâce, Princesse |
| U04 | MAJEUR | Copilot (360 px) | Le champ de saisie est à y = 2 181 sur une page de 2 445 px. Il faut d'abord faire défiler 12 cartes d'agents et 14 conversations. Les suggestions sont coupées à droite (« Que dois-je faire en priorité cette se… »). Le champ n'a pas de libellé accessible (seulement un placeholder). | `CAPT/flows/360-f-copilot.png` ; `audit-results.json` : `unnamed: textarea` | Sur mobile, faire de la conversation l'écran principal, avec la zone de saisie fixée en bas. Mettre le choix de l'agent dans un menu et l'historique dans un panneau. Suggestions sur plusieurs lignes, `aria-label` sur le champ. | Grâce, Princesse |
| U05 | MAJEUR | Content Studio, Creative Studio, Video Studio | Le coût est affiché tantôt dans le bouton (Brand DNA, Stratégie, Analyse, relance CRM), tantôt dans l'en-tête de la carte, loin du bouton (Content, Creative, Video). À 360 px : « ≈ 8 crédits » à y ≈ 310 et « Proposer des angles » à y = 674. Le bouton « Générer la vidéo » n'affiche pas son coût. Il n'existe nulle part d'équivalence entre crédits et usage ou FCFA (« 4 971 crédits, c'est combien de posts ? »). | `CAPT/flows/360-s2-angles.png`, `CAPT/1280-creative.png` ; `VideoStudio.tsx:302-331`, `ContentStudio.tsx:90-131` | Un seul modèle : le coût dans le bouton (« Rédiger le contenu · 10 crédits »), le solde restant après l'action en petit, et dans Plan & crédits une ligne « Votre solde ≈ 490 posts ou 60 vidéos ». | Grâce |
| U06 | MAJEUR | Toutes (hors ligne, réseau faible) | Une requête qui échoue réseau coupé affiche « Failed to fetch » (anglais brut, `lib/hooks.ts:63-66`). Le message apparaît sous le bouton, hors écran à 360 px. Une page chargée hors ligne affiche des zéros (CRM : « 0 · 0 FCFA » dans chaque colonne) comme si les données étaient vides. Aucun service worker ni mode hors ligne. | `CAPT/flows/360-f-hors-ligne.png`, `360-f-hors-ligne-navigation.png` ; journal : `Hors ligne, message : ["Failed to fetch"]` | Traduire les erreurs réseau (« Connexion perdue. Vos saisies sont gardées, réessayez quand le réseau revient. » avec un bouton « Réessayer »), placer l'alerte près de l'action ou en bandeau fixe, distinguer « chargement impossible » de « aucune donnée », et ajouter un bandeau hors ligne global. | Princesse, Grâce |
| U07 | MAJEUR | Session (rechargement de page) | `/api/auth/refresh` est limité à 10 appels par minute et par adresse IP (`identity/routes.ts:63`, `server.ts:66`). Pendant mon premier passage (rechargement de chaque page), la limite a renvoyé des 429 et l'application est retombée sur l'écran « Connexion ». En Côte d'Ivoire, beaucoup d'abonnés mobiles partagent une même IP publique (NAT d'opérateur) : des utilisateurs différents peuvent être déconnectés sans raison. | Sortie du premier passage d'`audit.mjs` : `429 /api/auth/refresh` ×8 et `h1=["…","Connexion"]` sur 14 écrans | Limiter le rafraîchissement par cookie de session et non par IP, ou relever fortement la limite. Côté interface : en cas de 429, attendre puis réessayer au lieu de déconnecter. | José (limite), Grâce (reprise) |
| U08 | MAJEUR | Formulaires (tous) | Bordure des champs au repos : #e6ddd3 sur blanc = 1,34:1 (il faut 3:1, critère 1.4.11). Focus des champs : pas de contour, seulement une bordure orange #ea7822 (2,91:1 sur blanc, 2,70:1 sur le fond) et un halo à 18 % (1,20:1). L'orange d'accent sert aussi de fond aux boutons (texte 6,54:1, correct). | Calcul `flows3.mjs` (`flows/360-log3.txt`) ; tabulation de la connexion : `input:email [outline=none shadow=oui]` | Bordure des champs au moins #9a8f84 (≥ 3:1) ; focus = contour 2 px `--accent-strong` (#a84f0b) + décalage, identique à celui des boutons. | Grâce |
| U09 | MAJEUR | Fiche contenu → Approbations → Fiche contenu | Un propriétaire seul doit soumettre son contenu, aller dans Approbations, approuver (bouton à y = 788, sous la ligne de flottaison), revenir à la fiche, puis programmer : 5 actions sur 3 écrans. Après « Approuver », rien ne propose de programmer. | Journal `flows/360-log2.txt` (taps 5 à 9) ; `CAPT/flows/360-s2-approbations.png` | Quand l'utilisateur peut approuver lui-même, remplacer « Soumettre pour validation » par « Valider et programmer » (choix de la date dans la même fenêtre), et garder le circuit d'approbation pour les équipes. Après une approbation, proposer « Programmer maintenant ». | Grâce |
| U10 | MAJEUR | Fiche contenu programmé | Le toast confirme « Contenu programmé : il partira automatiquement à l'heure prévue », mais la page dit juste en dessous « Aucun compte social connecté pour ces canaux : diffusion manuelle ». Le contenu Instagram est programmé alors que l'aperçu indique « Créer le visuel (obligatoire pour Instagram) ». Les deux messages se contredisent, et le contenu ne partira pas. | `CAPT/flows/360-s2-programme.png`, `360-s2-fiche-contenu-full.png` | Vérifier avant de programmer : s'il n'y a pas de compte connecté ou pas de visuel, dire « Rien ne partira automatiquement : connectez Facebook ou recevez un rappel WhatsApp à 9 h pour publier vous-même ». Adapter le toast. | Grâce |
| U11 | MAJEUR | Social Hub | Les connecteurs réels affichent « Clés Meta à ajouter », « Clés LinkedIn à ajouter », etc. : c'est un message de configuration pour l'équipe technique, montré au client. À 360 px, ce badge déborde de la carte. La page met en avant une statistique « Démo (simulé) 2 049 ». | `CAPT/360-social-full.png` | Côté client : « Bientôt disponible » ou « Contactez-nous sur WhatsApp pour connecter votre page ». Garder le détail technique pour le back-office. Masquer les chiffres simulés hors mode démo. | Grâce |
| U12 | MAJEUR | Copilot, Paramètres > Traçabilité IA et Plan & crédits | Anglais et jargon : agents « Strategist, Brand Guardian, Content Writer, Creative Director, Critic, Video Producer… » ; journal des crédits « IA : copilot.chat », « content.post », « crm.followup » ; traçabilité « SUCCEEDED », « mock forlife-mock-1 », « crm.followup v1 ». Mon script compte 14 termes anglais visibles sur Analytics et 10 sur l'accueil. | `CAPT/flows/360-f-copilot.png`, `360-f-settings-Plancrdits.png` ; journal `flows/360-log2.txt` | Noms français et humains pour les agents (« Stratège », « Rédacteur », « Coach commercial »…), libellés d'usage (« Rédaction d'un post », « Conseil du Copilot »), statuts traduits. Cacher le fournisseur et le modèle aux non-administrateurs. | Grâce |
| U13 | MAJEUR | Fiche prospect (CRM) | Dans le formulaire « Nouveau lead », la case d'accord WhatsApp est cochée par défaut (`Crm.tsx:201`, `consent: true`), puis la fiche affiche le badge « Accord WhatsApp ». Le consentement doit être un choix actif (loi ivoirienne 2013-450, bonnes pratiques WhatsApp Business). Dans la fiche, « Effacer le contact » (rouge) est collé à « Ouvrir WhatsApp ». | Journal : « case consentement cochée par défaut = true » ; `CAPT/flows/360-f-crm-relance.png` | Case non cochée, avec le libellé « Ce contact a accepté d'être contacté sur WhatsApp ». Éloigner l'action destructive (menu « Plus » ou bas de la fiche). Avis de Caporal sur le consentement. | Grâce |
| U14 | MAJEUR | Accueil (premier lancement) | La vidéo de 2 min s'ouvre d'office au-dessus de l'accueil, dès la première connexion (fichier de 10,7 Mo s'il est lu). Le seul bouton, « Commencer », ferme simplement la fenêtre. À 360 px, la croix de fermeture passe seule sur une ligne, sous le titre. | `CAPT/360-demo-video.png` | Ne pas ouvrir automatiquement : proposer une carte « Découvrir en 2 min (10 Mo, idéal en Wi-Fi) » dans les missions. Bouton « Fermer », croix alignée avec le titre. | Grâce, Princesse |
| U15 | MAJEUR | Video Studio (360 px) | Après le storyboard, « Générer la vidéo » est à y = 2 902, sous les 5 scènes entièrement dépliées (chaque scène affiche 6 champs). | Journal `flows/360-log3.txt` ; `CAPT/flows/360-c-video-storyboard.png` | Scènes repliées en résumé (texte + durée, « Modifier »), barre d'action fixe en bas « Générer la vidéo · N crédits ». | Princesse, Grâce |
| U16 | MAJEUR | Content Studio (360 px) | Après « Proposer des angles », le résultat apparaît sous le formulaire. Le choix de l'angle est à y = 891 et « Rédiger le contenu » à y = 1 403. Rien ne fait défiler la page jusqu'aux résultats ni ne les annonce. | Journal `flows/360-log2.txt` (taps 3 et 4 sous la ligne de flottaison) ; `CAPT/flows/360-s2-angles.png` | Faire défiler la page vers l'étape 2 et y placer le focus, replier le brief en résumé, et fixer le bouton « Rédiger » en bas d'écran. | Grâce |
| U17 | MINEUR | Barre latérale, Accueil, Calendrier | Zones tactiles sous 24 px (critère 2.5.8) : « Vidéo de démo » et « Se déconnecter » 220×19 ; « Ouvrir le CRM », « Voir le ROI » 129×20 ; liens de la liste « Démarrage » 21 px ; « ouvrir » du calendrier 29×15. Le nombre de cibles sous 44 px va de 20 à 49 par écran. | `audit-results.json` (champs `small24`, `small44Count`) | Hauteur minimale de 44 px pour les liens d'action (padding), et lignes entièrement cliquables dans les listes. | Grâce |
| U18 | MINEUR | Toutes | Pas de lien d'évitement vers le contenu (`#contenu` existe mais aucun lien n'y mène). Le bouton du menu mobile est le caractère « ☰ ». | Journal : « Lien d'évitement présent : 0 » ; `Layout.tsx:38-40` | Ajouter « Aller au contenu » en premier élément focalisable, et une icône SVG pour le menu. | Grâce |
| U19 | MINEUR | Stratégie | 4 champs (audiences, concurrents) n'ont que le placeholder comme libellé visible (`Strategy.tsx:477`). La suppression d'un objectif ou d'une audience se fait sans confirmation ni annulation (`Strategy.tsx:466`). | `audit-results.json` (`placeholderOnly` : « Nom de l'audience »…) | Libellés visibles au-dessus des champs, et « Annuler » sous forme de toast après suppression. | Grâce |
| U20 | MINEUR | Creative Studio | Le bouton « Créer 3 concepts » est désactivé sans explication tant que le sujet est vide. Les champs de la grille n'ont pas la même hauteur (« Format » plus haut). | `CAPT/1280-creative.png` | Bouton toujours actif, avec un message d'erreur sur le champ manquant ; hauteur de champ unique. | Grâce |
| U21 | MINEUR | Paramètres (360 px) | Les onglets défilent horizontalement, et le premier (« Équipe ») est coupé à gauche quand « Plan & crédits » est actif. Aucun indice visuel de défilement. | `CAPT/flows/360-f-settings-Plancrdits.png` | Remplacer les onglets par un sélecteur ou une liste sur mobile, ou ajouter un dégradé et une flèche. | Grâce |
| U22 | MINEUR | Accueil | La page fait 3 860 px à 360 px : héros, missions, 8 indicateurs, 7 badges avec émojis, astuce, recommandations, démarrage, objectifs, publications. L'anneau « 60 % » n'a pas de légende. La série « 1 jour de suite » et les confettis relèvent de la gamification. | `CAPT/360-home-full.png` | Accueil mobile = missions du jour + 3 indicateurs (ventes, prospects à relancer, publications à venir). Le reste dans « Voir plus ». Légender l'anneau (« Démarrage 60 % »). | Grâce |
| U23 | MINEUR | En-têtes de pages | Mélange de « nos » et « vous » : « Quoi publier pour atteindre nos objectifs ? », « Quel visuel fera vraiment agir nos clients ? », alors que le reste de l'interface vouvoie l'utilisateur. « Quoi publier » est familier. | Captures des en-têtes (`CAPT/360-content.png`, `1280-creative.png`) | Harmoniser : « Que publier pour atteindre vos objectifs ? », « Quel visuel fera agir vos clients ? ». | Grâce |
| U24 | MINEUR | Base locale (environnement) | La base locale avait une migration non appliquée (`20261017170000_creative_ai_image`). Le Creative Studio renvoyait 500 (« Erreur non gérée »), et l'interface n'affichait aucun état d'erreur clair pour la liste. Je l'ai appliquée sur la base locale pour continuer le test. | `api.log` : `The column CreativeBrief.aiImage does not exist` | Ajouter `prisma migrate deploy` à `dev:api` ou au guide local. Afficher un état d'erreur avec « Réessayer » dans les listes. | Franck (procédure), Grâce (état d'erreur) |

Points positifs vérifiés : vouvoiement cohérent (0 occurrence de tutoiement dans l'interface, hors contenus saisis par
l'utilisateur) ; montants en FCFA partout ; contacts WhatsApp du support sur la connexion et en cas de suspension ;
« Renouveler par mobile money » sur l'accueil ; moyens de paiement listés (Orange Money, MTN MoMo, Moov, Wave) ;
suppression d'organisation protégée par la saisie du nom et un délai de grâce ; message d'erreur de connexion clair
(« Email ou mot de passe incorrect ») ; libellés visibles sur presque tous les champs ; « Proposition IA : à relire et
valider » partout ; photos réelles « jamais retouchées par l'IA » dans Creative et Video Studio ; 0 débordement
horizontal ; 0 erreur JavaScript.

### Heuristiques de Nielsen (synthèse)

| Heuristique | État | Constats liés |
|---|---|---|
| 1. Visibilité de l'état du système | Moyen : bons indicateurs de génération (« Le Copywriter rédige… »), mais erreurs hors écran et zéros affichés hors ligne | U06, U16 |
| 2. Correspondance avec le monde réel | Faible : anglais, jargon technique, crédits sans équivalent concret | U05, U11, U12 |
| 3. Contrôle et liberté | Moyen : la suppression d'organisation est réversible, mais d'autres suppressions n'ont ni confirmation ni annulation | U19 |
| 4. Cohérence et standards | Moyen : coût affiché à deux endroits différents, « nos » et « vous » | U05, U23 |
| 5. Prévention des erreurs | Faible : programmation sans compte connecté ni visuel, consentement coché par défaut | U10, U13 |
| 6. Reconnaissance plutôt que rappel | Bon : missions du jour, étapes numérotées | |
| 7. Flexibilité et efficacité | Faible pour l'entrepreneur seul : circuit d'approbation imposé | U09 |
| 8. Design esthétique et minimaliste | Moyen : accueil et Copilot surchargés sur mobile | U04, U22 |
| 9. Aide à diagnostiquer les erreurs | Faible : « Crédits insuffisants » sans cause, « Failed to fetch » | U01, U06 |
| 10. Aide et documentation | Bon : WhatsApp du support, vidéo et transcription, astuces | U14 (forme) |

### Étapes jusqu'à la première valeur (mesurées, 360 px, IA simulée)

| Segment | Actions | Remarque |
|---|---|---|
| Inscription (3 écrans) | 3 boutons + 4 champs obligatoires (nom, email, mot de passe, entreprise) | les objectifs ont des valeurs pré-remplies : bien |
| Fermer la vidéo | 1 | à supprimer (U14) |
| Confirmer l'email | sortir de l'application, ouvrir l'email, revenir | impossible en production aujourd'hui (U01) |
| Accueil → contenu programmé | 9 actions, 14 s | 4 actions sous la ligne de flottaison, 3 écrans |
| **Total** | **environ 17 actions, 4 champs, 1 aller-retour vers l'email** | cible proposée : 8 actions sans quitter l'application |

## VÉRIFICATIONS

| Commande / action | Résultat réel |
|---|---|
| `curl localhost:4000/api/health` et `:5173` avant lancement | 000 / 000 : rien ne tournait |
| `service postgresql start`, `npm run dev:api`, `npm run dev:web` (arrière-plan) | API à l'écoute sur 4000, Vite prêt sur 5173, `aiProviders: ["anthropic","mock"]` ; `ANTHROPIC_API_KEY` vide, donc IA simulée (aucun appel payant) |
| `npx prisma migrate status` puis `npx prisma migrate deploy` (base locale uniquement) | 1 migration en attente (`20261017170000_creative_ai_image`) appliquée ; elle provoquait un 500 sur `/creative/briefs` |
| `node audit.mjs` (15 écrans × 360 et 1280 px) | 0 débordement horizontal ; 0 contraste de texte sous le seuil (fonds en dégradé non mesurés) ; cibles < 44 px : 20 à 49 par écran ; cibles < 24 px : 2 à 12 ; 1 champ sans nom accessible (Copilot) ; 6 champs avec placeholder seul |
| Premier passage d'`audit.mjs` (rechargement complet de chaque page) | 429 sur `/api/auth/refresh` au-delà de 10 rechargements par minute, retour à l'écran de connexion (U07) |
| `node flows.mjs` (inscription d'un compte de test local, puis premier contenu) | 0 crédit avant confirmation, 200 après ; « Crédits insuffisants » ; boutons d'inscription à y = 978 / 868 / 907 ; accueil → programmé : 9 actions, 14,3 s ; solde 200 → 182 |
| `node flows2.mjs` (CRM, relance WhatsApp, Social Hub en bac à sable, Paramètres, Copilot, hors ligne, clavier) | consentement coché par défaut ; lien `wa.me/225…?text=…` correct ; connexion du compte de test Facebook en 2 écrans ; champ Copilot à y = 2 181 ; hors ligne : « Failed to fetch » ; pas de lien d'évitement |
| `node flows3.mjs` (Creative, Video, calculs de contraste) | 3 concepts en 1,7 s ; storyboard en 1,6 s ; « Générer la vidéo » à y = 2 902 ; contrastes : accent/blanc 2,91, halo de focus 1,20, bordure de champ 1,34, texte du bouton primaire 6,54 |
| axe-core | absent de `/opt/node-tools/node_modules` (seuls `playwright` et `playwright-core`) : non exécuté |
| Fin de session | serveurs API et web arrêtés, PostgreSQL arrêté ; `git status` propre |

Non vérifié : appareil Android réel (glisser-déposer au toucher, clavier virtuel qui masque les champs, lecteur
d'écran TalkBack) ; rendu vidéo MP4 complet ; vraie connexion OAuth Meta, LinkedIn, TikTok ou YouTube (clés
absentes en local) ; parcours de paiement CinetPay réel ; contraste du texte sur les dégradés (héros de l'accueil,
panneau de connexion) ; mode sombre ; lenteur réseau simulée (3G) ; production (hors périmètre).

## HYPOTHÈSES

- Le comportement de l'IA réelle (délais, longueur des textes) diffère de l'IA simulée. Les durées mesurées
  (1,6 à 4,6 s) sont donc des minimums. Avec Opus, compter plutôt 10 à 60 s, ce qui rend U06 et U16 plus sensibles.
- Le compte `awa@test.ci` est propriétaire, au plan Business. Les rôles éditeur et lecteur n'ont pas été testés.
- La NAT d'opérateur (U07) est une hypothèse de contexte réseau ivoirien, à confirmer avec les journaux de production.

## RISQUES ET POINTS OUVERTS

1. Lancement public : tant que U01 n'est pas réglé, chaque inscription gratuite aboutit à un échec à la première action.
2. Données de vente : sans moyen tactile de marquer une vente « Gagné » (U03), le ROI en FCFA, argument clé du
   produit, reste vide sur mobile.
3. Confiance : messages contradictoires sur la publication (U10) et consentement pré-coché (U13). Un post qui ne part
   pas ou un client contacté sans accord coûte plus cher à la marque qu'une fonctionnalité en moins.
4. Les tests sur appareil réel et TalkBack restent à faire (Princesse, D05).

## SUGGESTIONS PRIORISÉES

| # | Priorité | Suggestion | Effort | Constats | Agent |
|---|---|---|---|---|---|
| 1 | P0 | Crédits de démarrage sans confirmation, ou confirmation par code WhatsApp/SMS ; état « solde à 0 » explicite avec action ; emails réellement envoyés | S (UI) + M (règle, envoi) | U01 | Grâce, José, Brice |
| 2 | P0 | Connexion et inscription mobiles : formulaire en premier, bouton visible sans défiler | S | U02 | Grâce |
| 3 | P0 | Alternative au glisser-déposer : sélecteur d'étape dans la fiche prospect (montant demandé pour « Gagné »), « Changer la date » pour un contenu programmé | S | U03 | Grâce |
| 4 | P0 | Erreurs réseau en français près de l'action, bouton « Réessayer », bandeau hors ligne, distinction « vide » / « non chargé » | M | U06 | Princesse, Grâce |
| 5 | P0 | Rafraîchissement de session non limité par IP partagée ; reprise automatique en cas de 429 | S | U07 | José, Grâce |
| 6 | P1 | Barre d'action fixe en bas d'écran sur mobile pour l'action principale (Content, Video, Copilot, CRM), avec coût et solde dans le bouton | M | U04, U05, U15, U16 | Grâce, Princesse |
| 7 | P1 | « Valider et programmer » pour l'utilisateur qui peut approuver lui-même ; contrôle avant programmation (compte connecté, visuel) | M | U09, U10 | Grâce |
| 8 | P1 | Glossaire français : noms d'agents, libellés d'usage des crédits, statuts ; masquer le jargon technique et les chiffres simulés | S | U11, U12, U23 | Grâce, David (glossaire) |
| 9 | P1 | Consentement WhatsApp non coché, action « Effacer » éloignée | S | U13 | Grâce |
| 10 | P1 | Focus et bordures conformes (≥ 3:1), lien d'évitement, cibles ≥ 44 px | S | U08, U17, U18 | Grâce |
| 11 | P1 | Vidéo de démo à la demande seulement, avec son poids indiqué | S | U14 | Grâce |
| 12 | P2 | Accueil mobile allégé (missions + 3 indicateurs), anneau légendé | M | U22 | Grâce |
| 13 | P2 | Libellés visibles et annulation des suppressions dans Stratégie ; erreurs de champ au lieu de boutons désactivés ; onglets des Paramètres sur mobile | S | U19, U20, U21 | Grâce |
| 14 | P2 | Migrations appliquées automatiquement en local ; états d'erreur avec « Réessayer » dans les listes | S | U24 | Franck, Grâce |
| 15 | P2 | Campagne de tests sur Android d'entrée de gamme (TalkBack, clavier virtuel, 3G) et passage d'axe-core en CI | M | tous | Princesse, Franck |

### Trois améliorations à fort impact pour un produit plus humain et moins « IA »

1. **Une conseillère, pas douze agents.** Remplacer la grille « Strategist, Brand Guardian, Critic… » par un
   interlocuteur unique au prénom local et au ton chaleureux (par exemple « Adjoua, votre conseillère marketing »),
   qui parle comme une collègue (« J'ai préparé 3 idées pour vos pagnes de fête, laquelle vous plaît ? »). Les
   spécialités restent en coulisse. Retirer les « ✦ » et le mot « IA » des boutons (« Rédiger mon post » plutôt que
   « ✦ Rédiger le contenu ») et garder la mention « à relire avant publication », qui est utile.
2. **WhatsApp comme fil conducteur.** Les PME ivoiriennes vivent dans WhatsApp : confirmation du compte par code
   WhatsApp, rappel « Votre post de 9 h est prêt, publiez-le en un geste » quand aucun réseau n'est connecté, résumé
   hebdomadaire des ventes et prospects à relancer, bouton « Parler à un humain Forlife » visible partout dans
   l'application (et pas seulement sur la page de connexion). Le produit devient un assistant qui vient vers
   l'utilisateur, et pas un tableau de bord à consulter.
3. **Des preuves locales et concrètes à la place de la gamification.** Remplacer badges, séries de jours et confettis
   par ce qui rassure vraiment une PME : « Ce mois-ci : 12 demandes WhatsApp, 2 ventes, 180 000 FCFA », des
   exemples de vrais posts de commerçants d'Abidjan (avec accord), et les crédits exprimés en usages (« il vous reste
   de quoi faire 40 posts et 5 vidéos ce mois-ci »). Le succès se mesure en clients et en francs CFA, pas en points.

## SUITE PROPOSÉE

1. Grâce (D03) : chiffrer U02, U03, U05, U08, U09 et U16, qui sont surtout des changements de composants, et
   centraliser la traduction des erreurs (`lib/hooks.ts`).
2. Princesse (D05) : vérifier sur un Android réel U03 (toucher), U06 (réseau faible, hors ligne), U14 (poids de la
   vidéo) et le clavier virtuel dans les formulaires et le Copilot.
3. José (D04) : U01 (règle des crédits de démarrage) et U07 (limite du rafraîchissement par IP).
4. Caporal (D06) : avis sur le consentement WhatsApp (U13) et sur la limite par IP (U07).
5. Elisée (D11) : arbitrer la promesse « crédits offerts » (U01) et le choix de la conseillère unique.
