# D03 : Diagnostic front-end de Forlife Com (Grâce, 07/11/2026)

## STATUT

TERMINÉ. Lecture complète de `platform/apps/web/src` (28 pages, 9 composants, 5 fichiers `lib`, `styles.css`),
typage et build lancés, bundle mesuré et attribué module par module grâce à une sourcemap générée hors du dépôt,
mesures dynamiques sur le build de production servi en local (`vite preview`, API locale, IA simulée) avec Playwright
à 360 px. Aucune modification du code, de la configuration ni de git (`git status` propre à la fin). Le dossier
`apps/web/dist` existait avant (build de Zana) : il a été régénéré par `npm run build -w @forlife/web` et il est
identique octet pour octet à la copie faite avant (`diff -rq` vide). Il est ignoré par git (`platform/.gitignore:2`).

Dossier des preuves (noté `PREUVES/`) :
`/tmp/claude-0/-home-user-FORLIFE/f743d9c3-cade-5323-a17b-7e4c52982ff1/scratchpad/equipe/grace/`
(`build.log`, `typecheck.log`, `bundle-attrib.mjs` et `bundle-attrib.txt`, `button-test.tsx` et `button-test.txt`,
`mesures.mjs` et `mesures.txt`, `double-envoi.mjs` et `double-envoi.txt`, `dist-avant/`, `dist-map/`).

## RÉSUMÉ

Le socle est sain : TypeScript strict avec `noUncheckedIndexedAccess`, aucune dépendance UI lourde (React, React DOM,
react-router seulement), jeton d'accès en mémoire et refresh en cookie httpOnly, aucun `dangerouslySetInnerHTML`, tous
les liens `target="_blank"` ont un `rel`, composants de base partagés (`Button`, `Card`, `Field`, `Modal`, `Alert`),
`<dialog>` natif pour les modales, mouvement réduit respecté pour les animations.

Les défauts importants sont concentrés dans trois fichiers transverses, ce qui est une bonne nouvelle : les corriger
corrige toute l'application.

1. **Double envoi, prouvé.** Le composant `Button` laisse `{...rest}` écraser `disabled` (`ui.tsx:22`). Un bouton
   « occupé » reste cliquable dès que l'appelant passe `disabled={condition}`, ce que font 14 boutons d'action, dont
   toutes les générations IA. Mesure : 3 clics sur « Créer » (réseau lent simulé) = 3 requêtes et 3 prospects créés.
   Dans le Copilot, deux appuis sur Entrée = 2 conversations et 2 messages facturés. Les clés d'idempotence sont
   régénérées à chaque clic et ne protègent donc rien.
2. **Réseau faible mal géré** (`lib/api.ts`, `lib/hooks.ts`) : pas de délai d'expiration, pas de reprise, erreurs du
   navigateur affichées en anglais, 429 et coupure réseau traités comme une session expirée, suivi des jobs IA
   abandonné au premier incident réseau alors que le job continue et a débité des crédits. C'est la cause dans le
   code des constats U06 et U07 d'Aya.
3. **Quatre états par vue non tenus** : sur 41 appels `useResource`, l'erreur est lue dans 12, aucune vue ne propose
   « Réessayer » (0 occurrence dans le code), et plusieurs vues affichent un faux « vide » (zéros du CRM, « Aucun compte
   social connecté » pendant le chargement).
4. **Performance** : un seul bundle de 515 658 o (150 196 o gzip) dont 41 % de code de pages inutile à l'écran de
   connexion ; découpage par route estimé à environ 35 % de JS initial en moins pour un effort d'une demi-journée.
   La vidéo d'un projet est téléchargée entièrement dès l'ouverture de la page, et les vignettes sont les fichiers
   originaux.
5. **Accessibilité au niveau code** : 19 liens focalisables hors écran quand le menu mobile est fermé, identifiant de
   titre de modale dupliqué, deux `h1` sur la connexion, pas de titre de page ni de focus au changement de route,
   glisser-déposer sans alternative (U03).

Pas de lint dans le projet (aucune configuration ESLint ni script), alors que 5 commentaires `eslint-disable`
désactivent des règles qui ne tournent jamais.

## CONSTATS

Gravité : ÉLEVÉ (perte d'argent ou de données, parcours cassé, non-conformité forte), MOYEN, FAIBLE.
Effort : S (moins d'une journée), M (1 à 3 jours), L (plus de 3 jours). Les chemins sont relatifs à
`platform/apps/web/src` sauf mention.

### Formulaires et double envoi

**F01 · ÉLEVÉ · Le bouton « occupé » reste cliquable (double envoi généralisé)**
- Fichier : `components/ui.tsx:20-22`. `disabled={busy || rest.disabled}` est suivi de `{...rest}`, qui contient
  `disabled` et l'écrase.
- Preuve : rendu serveur du vrai composant (`PREUVES/button-test.txt`) : `<Button busy disabled={false}>` produit
  `<button aria-busy="true">` sans `disabled`. Mesure navigateur (`PREUVES/double-envoi.txt`, POST retardés de 1,5 s) :
  pendant l'envoi `disabled=false aria-busy=true`, **3 × POST /crm/leads, 3 prospects créés**.
- Boutons touchés (busy et disabled passés ensemble) : `ContentStudio.tsx:132` (angles) et `:179` (rédaction),
  `VideoStudio.tsx:163` (storyboard), `:329` (rendu MP4), `:412`, `CreativeStudio.tsx:167` (3 concepts), `:360`,
  `SocialAudit.tsx:146` (analyse), `Crm.tsx:235` (nouveau lead), `SocialHub.tsx:383`, `Admin.tsx:75` et `:270`
  (crédits manuels), `SettingsData.tsx:151` (suppression d'organisation), `Copilot.tsx:262`. Seuls `Billing.tsx:112`
  et `:130` sont protégés, car ils mettent `busy` dans leur propre condition.
- Conséquence : chaque clic de plus sur une génération IA lance un job de plus et débite à nouveau les crédits.
- Correction : `function Button({ busy, disabled, ...rest })` puis `disabled={busy || disabled}` placé après
  `{...rest}` ; ajouter un test de rendu. Effort S (une ligne et un test).

**F02 · ÉLEVÉ · Idempotence inopérante et état « occupé » trop tardif**
- Les clés sont créées au moment du clic, donc différentes à chaque clic : `ContentStudio.tsx:74`,
  `VideoStudio.tsx:232`, `CreativeStudio.tsx:244`, `Strategy.tsx:68`, `Campaigns.tsx:231`, `Billing.tsx:49`. Aucune
  clé pour `ContentStudio.tsx:41` (angles), la création de prospect (`Crm.tsx:209`) ni le Copilot. Le bon modèle existe
  déjà : `Admin.tsx:244-251` garde la clé dans un état et ne la renouvelle qu'après succès.
- Dans Content Studio, `busy` vaut `ideasJob.running` / `postJob.running`, qui ne passent à vrai qu'après la réponse du
  POST (`lib/hooks.ts:43`) : entre le clic et la réponse (plusieurs secondes en 3G), rien n'indique l'envoi.
- Correction : hook commun `useAction()` qui pose `busy` dès le clic, ignore un second appel en cours et fournit une
  clé d'idempotence stable par intention (`useRef`, renouvelée après succès). Effort S à M.

**F03 · ÉLEVÉ · Copilot : Entrée envoie sans garde**
- Fichier : `pages/Copilot.tsx:254-257` appelle `send(draft)` sans vérifier `busy` ni `pending` ; `send()`
  (`:105-121`) ne se protège pas non plus.
- Preuve (`PREUVES/mesures.txt`, ligne D) : deux appuis rapides sur Entrée = **2 × POST …/conversations et
  2 × POST …/messages**, soit deux conversations identiques et 2 × 2 crédits (`copilot.chat` = 2,
  `packages/shared/src/billing.ts:91`). J'ai supprimé ces conversations de test de la base locale.
- Correction : sortir tôt si `busy || pending`, via le même `useAction()` que F02. Effort S. Lié à U04.

**F04 · MOYEN · Numéros de téléphone non normalisés côté client**
- `pages/Crm.tsx:247` et `pages/PublicForm.tsx:51` : champ libre avec un placeholder « 07 00 00 00 00 », sans
  `inputMode`, sans validation, sans aperçu du format. `normalizePhone` existe dans
  `packages/shared/src/domain.ts:128` mais n'est importé nulle part dans le web. Le serveur normalise
  (`api/src/modules/crm/service.ts:21`, `crm/routes.ts:186-187`), mais l'utilisateur ne découvre l'erreur qu'après
  l'envoi, en réseau lent.
- La case d'accord WhatsApp est cochée par défaut (`Crm.tsx:201`, `consent: true`, confirmé par la mesure C) : c'est
  U13 d'Aya.
- Correction : composant `PhoneInput` (type `tel`, `inputMode="tel"`, aperçu « +225 07 00 00 00 00 », erreur en
  français si `normalizePhone` renvoie `null`), et `consent: false`. Effort S.

### Données, erreurs et réseau faible

**F05 · ÉLEVÉ · Client HTTP sans délai, sans reprise, et qui déconnecte à tort**
- `lib/api.ts:49` : `fetch` sans `AbortSignal` ni délai. Sur une connexion 3G bloquée, le bouton tourne jusqu'au délai
  du navigateur (plusieurs minutes).
- `lib/api.ts:28` et `:33` : `refreshSession()` renvoie `false` pour un 429, un 5xx ou une coupure réseau, comme pour
  un vrai 401. `api.ts:50-53` appelle alors `onSessionExpired`, qui vide la session (`lib/auth.tsx:43-46`). Au
  démarrage, la même confusion envoie un utilisateur hors ligne sur l'écran « Connexion » (`auth.tsx:47-51`).
  C'est le mécanisme côté front de U07 (429 sur `/auth/refresh`).
- `lib/hooks.ts:63-66` : `errorMessage` renvoie `e.message` tel quel. Une coupure réseau donne « Failed to fetch »
  (Chrome), « Load failed » (Safari) ou « NetworkError… » (Firefox) : c'est la source de U06.
- Aucun 429 n'est réessayé (`Retry-After` ignoré), aucun GET n'est réessayé.
- Correction : délai par défaut (15 s pour un GET, 30 s pour un POST, `AbortSignal.timeout`), classification des
  erreurs (`network`, `timeout`, `rate_limited`, `server`, `client`) avec messages français (« Connexion perdue.
  Vérifiez votre réseau puis réessayez. »), 2 reprises avec attente progressive pour les GET et pour un 429,
  déconnexion seulement sur un vrai 401 du refresh, écran « Hors connexion » au démarrage au lieu de « Connexion ».
  Effort M.

**F06 · ÉLEVÉ · Le suivi d'un job IA s'arrête au premier incident réseau**
- `lib/hooks.ts:41-60` (`useJob.track`) : la boucle de suivi n'a pas de `try` autour de `api.get`. Une seule requête
  perdue (fréquent en 3G) lève une exception, l'écran affiche « Failed to fetch », alors que le job continue côté
  serveur et que les crédits sont déjà débités. L'utilisateur relance : nouveau job, nouveaux crédits (aggravé par
  F01 et F02).
- Pas de durée maximale : un job bloqué en `RUNNING` est interrogé indéfiniment.
- Après un rechargement, le `jobId` est perdu : le résultat n'est jamais affiché dans le studio.
- Correction : ignorer les erreurs transitoires (réseau, 5xx, 429) et continuer avec attente progressive, durée
  maximale avec message (« La génération prend plus de temps que prévu, vous serez prévenu »), `jobId` en cours gardé
  en `sessionStorage` et repris au retour sur la page. Effort M. Lié à U06 et U16.

**F07 · ÉLEVÉ · Les quatre états par vue ne sont pas tenus**
- Sur 41 appels `useResource` (28 pages), l'erreur n'est lue que dans 12. Elle est ignorée, entre autres, dans
  `Crm.tsx:48` (pipeline), `:294`, `:471`, `:501`, `Calendar.tsx:34-35`, `SocialHub.tsx:48-50`,
  `ContentStudio.tsx:18-21`, `Settings.tsx:62-63`, `:193`, `:277`, `:310`, `Billing.tsx:34-35`, `Campaigns.tsx:47`,
  `CreativeStudio.tsx:68-70`.
- « Réessayer » : 0 occurrence dans `src`. Les 8 vues qui gèrent l'erreur la remplacent par une simple alerte
  (`if (error) return <Alert …>`, par exemple `Home.tsx:32`, `Brand.tsx:29`, `ContentDetail.tsx:37`).
- Faux états vides : `ContentDetail.tsx:284` affiche « Aucun compte social connecté pour ces canaux » pendant le
  chargement et en cas d'erreur (`!data?.length`) ; le pipeline CRM affiche « 0 · 0 FCFA » par colonne quand la
  requête échoue. Mesure E (`PREUVES/mesures.txt`) : recherche CRM hors ligne, **0 alerte affichée**, colonnes à
  « 0 · 0 FCFA ».
- `useResource` démarre avec `loading = true` et ne le remet jamais à `false` quand `path` vaut `null`
  (`lib/hooks.ts:9-11`, cas de `Crm.tsx:200`).
- Correction : `useResource` renvoie un `status` (`loading | error | empty | success`) et un composant
  `<ResourceView>` affiche squelette, message d'erreur traduit avec « Réessayer », état vide explicite ou contenu.
  À appliquer d'abord aux écrans qui servent l'argent : CRM, Calendrier, Analytics, Content Studio. Effort M.
  Lié à U06 et U24.

**F08 · MOYEN · Requêtes concurrentes et interrogations en boucle**
- `useResource` n'annule rien (`lib/hooks.ts:10-20`) : quand le chemin change vite (recherche CRM `Crm.tsx:48`, période
  Analytics `Analytics.tsx:65`, onglets Approbations `Approvals.tsx:25`, filtre Content Studio `ContentStudio.tsx:21`),
  une réponse ancienne arrivée en retard écrase la nouvelle.
- Interrogations par `setInterval` sans attendre la réponse précédente : `ContentDetail.tsx:33` (2 s),
  `VideoStudio.tsx:214` (3 s). Sur une 3G à 2 s de latence, les requêtes s'empilent. Le Copilot (`Copilot.tsx:89`)
  recharge toutes les 1,5 s la conversation **et** tout l'accueil du Copilot (agents et conversations), soit 2 requêtes
  par tour ; si une requête échoue, l'effet ne se relance plus et le message reste « en préparation » à l'écran.
- Aucune pause quand l'onglet est caché (`document.hidden`). Zana a déjà signalé le coût serveur de ces
  interrogations (D01, §5).
- Correction : `AbortController` dans `useResource` ; boucle `setTimeout` relancée après chaque réponse, avec attente
  progressive (2 s, 3 s, 5 s, 8 s) et pause si l'onglet est caché ; le Copilot ne recharge l'accueil qu'à la fin de
  la réponse. Effort S à M. Une bibliothèque de cache (TanStack Query, environ 13 Ko gzip) réglerait aussi ce point,
  mais le hook maison suffit pour ce besoin.

**F09 · MOYEN · Promesses rejetées sans traitement (échecs silencieux)**
- `Strategy.tsx:324` et `:466`, `Crm.tsx:482` (la case « tâche faite » n'est pas contrôlée et reste cochée même si
  l'appel échoue), `Crm.tsx:571`, `Settings.tsx:139`, `Brand.tsx:410` et `:461` (suppressions), `Analytics.tsx:67-74`
  (export CSV), `CreativeStudio.tsx:266-273` (téléchargement), `VideoStudio.tsx:251-254` (validation de la vidéo).
  Dans ces cas, l'utilisateur ne voit rien.
- `fetchBlobUrl` (`lib/api.ts:71-75`) ne renouvelle pas le jeton : après 15 minutes (`api/src/config.ts:23`), les
  vignettes, l'export CSV et les téléchargements échouent, en silence dans `Brand.tsx:344`
  (`.catch(() => undefined)`).
- Correction : passer `fetchBlobUrl` par `request()` (même reprise sur 401) et faire passer chaque action par
  `useAction()`, qui affiche l'erreur. Effort S.

### Performance

**F10 · ÉLEVÉ · Bundle unique, aucune division par route**
- Mesure (`PREUVES/build.log`) : `index-DD0D0ypH.js` 515 658 o (150 196 o en gzip -9), CSS 45 118 o (9 989 o).
  Mêmes chiffres que Zana (D01).
- Attribution par sourcemap (`PREUVES/bundle-attrib.txt`) : `react-dom` 208 693 o (40,6 %), `react-router` 39 111 o
  (7,6 %), `react` + `scheduler` 11 747 o ; **code des pages 212 846 o (41 %)** ; composants, `lib` et `@forlife/shared`
  41 905 o. Plus gros modules applicatifs : `Legal.tsx` 18 020 o (textes légaux chargés par tout le monde), `Crm.tsx`
  16 354 o, `Brand.tsx` 13 305 o, `VideoStudio.tsx` 12 110 o.
- Cause : `App.tsx:4-30`, 25 imports statiques de pages ; aucun `React.lazy` ni `import()` dans `src`.
- Estimation après découpage : JS initial de la connexion environ 315 Ko bruts, soit à peu près 95 à 100 Ko gzip
  (bibliothèques + cœur + Login, AuthAside, Signup), contre 150 Ko aujourd'hui, environ 35 % de moins ; chaque page
  ensuite 1 à 6 Ko gzip à la demande. Mesure locale avec CPU ralenti 4 fois : formulaire de connexion visible en
  851 ms, premier affichage de contenu à 588 ms, sans réseau lent (le coût réseau s'ajoute en 3G).
- Correction : `lazy(() => import("./pages/…"))` par route, `<Suspense fallback={<Skeleton/>}>` dans `Layout`,
  préchargement au survol ou au toucher des liens du menu, budget en CI (JS initial ≤ 100 Ko gzip, alerte au-delà).
  Effort S. Rejoint la suggestion 9 de Zana.

**F11 · MOYEN · Médias protégés chargés en entier, vignettes pleine taille**
- `VideoStudio.tsx:426-431` (`VideoPlayer`) télécharge le MP4 complet en blob dès l'ouverture de la page projet, sans
  action de l'utilisateur. `preload="none"` est impossible avec un blob. Sur forfait mobile, plusieurs Mo partent
  pour une simple consultation du storyboard.
- `Brand.tsx:341-349` (`AssetThumb`) et `CreativeStudio.tsx:49-58` (`SecureImg`) chargent le fichier original pour une
  vignette ; `loading="lazy"` sur l'image est sans effet puisque le `fetch` part avant l'affichage ; ni `width` ni
  `height`, donc des décalages de mise en page. Seules les images de `SocialHub.tsx:130` et `:370` sont dimensionnées.
- Aucune image WebP ou AVIF : `public/demo/forlife-presentation-poster.jpg` fait 32 944 o (le MP4 de 10,7 Mo est
  bien en `preload="none"`, `DemoVideo.tsx:92`).
- Correction : avec José, URL signées de courte durée ou cookie de session pour les fichiers, afin d'utiliser `<img>`
  et `<video preload="none">` natifs ; miniatures WebP de 320 px générées à l'envoi ; `width`/`height` partout ;
  poster en WebP. Effort M. Rejoint D01 §5 (fichiers relayés par Cloud Run).

**F12 · MOYEN · Police tierce bloquante**
- `index.html:8-10` : Poppins en 4 graisses depuis Google Fonts. Mesure : 5 requêtes vers 2 domaines tiers (1 feuille
  CSS bloquante + 4 fichiers woff2). Une seule famille (la règle « deux polices au plus » est respectée), mais une
  connexion de plus et un rendu bloqué en 3G.
- Correction : auto-héberger 3 graisses (400, 600, 700) en sous-ensemble latin, `preload` de la graisse 400,
  `font-display: swap` ; ou police système sur mobile. Effort S. Déjà relevé par Zana.

**F13 · FAIBLE · Listes longues et re-rendus**
- Pipeline CRM : jusqu'à 500 prospects (`api/src/modules/crm/routes.ts:53`, `take: 500`) rendus d'un coup et filtrés
  6 fois à chaque rendu (`Crm.tsx:142`), sans indication si la liste est tronquée. Bibliothèque de contenus limitée à
  200 (`content/routes.ts:80`), sans pagination.
- `lib/auth.tsx:70` : l'objet de contexte n'est pas mémorisé ; chaque `reloadMe()` (appelé après chaque action IA)
  re-rend tous les consommateurs. `AuthAside.tsx:56` : machine à écrire toutes les 32 ms pendant la saisie du mot de
  passe (désactivée si mouvement réduit). Effets limités, mais sensibles sur un Android d'entrée de gamme.
- Correction : regroupement par étape avec `useMemo`, 20 cartes par colonne avec « Voir plus », `useMemo` sur la
  valeur du contexte. Effort S.

### Accessibilité dans le code

**F14 · MOYEN · Menu mobile fermé mais toujours focalisable**
- `styles.css:505` : à 820 px et moins, la barre latérale est seulement décalée (`transform: translateX(-100%)`).
- Preuve (`PREUVES/mesures.txt`, ligne B) : à 360 px, menu fermé, la 3e tabulation arrive sur le sélecteur d'espace à
  x = -246 px, puis « Accueil », « AI Copilot »… : **19 éléments focalisables hors écran**. Un utilisateur au clavier
  ou avec un lecteur d'écran parcourt un menu invisible.
- Correction : attribut `inert` (ou `visibility: hidden`) sur la barre fermée, focus sur le premier lien à
  l'ouverture, retour du focus sur le bouton du menu à la fermeture, icône SVG avec libellé « Ouvrir le menu »
  (`Layout.tsx:39-40`). Effort S. Complète U18.

**F15 · MOYEN · Pas de titre ni de focus au changement de page**
- `document.title` n'est jamais modifié (0 occurrence) : toutes les pages s'appellent comme `index.html:11` (mesure :
  même titre sur `/crm`). Après une navigation, le focus reste sur le lien cliqué et rien n'est annoncé.
- `<main id="contenu">` existe (`Layout.tsx:161`) mais aucun lien d'évitement n'y mène (U18).
- Correction : `PageHeader` règle `document.title` (« CRM et prospects · Forlife Com ») et place le focus sur le `h1`
  (`tabIndex={-1}`) à chaque route ; lien « Aller au contenu » en tête de `Layout`. Effort S.

**F16 · MOYEN · Glisser-déposer sans alternative et dialogues natifs**
- `Crm.tsx:145-168` : `move()` n'est appelée que dans `onDrop` ; la fiche prospect (`Crm.tsx:322-…`) n'a aucun sélecteur
  d'étape. `Calendar.tsx:100-134` : même chose pour la date, et la carte des contenus à programmer est un `div`
  `draggable` non focalisable (`Calendar.tsx:134`). C'est U03 d'Aya, avec le détail du code.
- 7 dialogues natifs `confirm`/`prompt` : `Crm.tsx:58` (motif de perte saisi dans un `prompt`), `Crm.tsx:347`,
  `Copilot.tsx:135`, `SocialHub.tsx:64`, `Settings.tsx:88`, `SettingsData.tsx:115`, `ContentDetail.tsx:78`. Ils ne
  suivent pas le thème, sont mal rendus dans certaines WebView Android, et ne permettent ni libellé ni annulation.
- Correction : composant `StageSelect` (étape, montant en FCFA pour « Gagné », motif pour « Perdu ») dans la fiche
  prospect et sur chaque carte ; « Changer la date » dans la fiche du contenu programmé ; composant `ConfirmDialog`
  basé sur `Modal`. Effort M.

**F17 · MOYEN · Modale : identifiant de titre dupliqué**
- `components/ui.tsx:115-117` : `aria-labelledby="modal-title"` et `<h2 id="modal-title">` fixes. `DemoVideoHost` est
  toujours monté dans `Layout.tsx:170`, donc toute page qui a sa propre modale contient au moins 2 `<dialog>` avec le
  même identifiant (3 sur le CRM : nouveau prospect, fiche prospect, vidéo). La fiche prospect (`Crm.tsx:322`) et la
  seconde modale d'`Admin.tsx` sont annoncées avec le titre d'une autre modale.
- Correction : `const id = useId()` dans `Modal`. Effort S.

**F18 · FAIBLE · Points d'accessibilité restants**
- Deux `h1` sur la connexion et l'inscription (`AuthAside.tsx:122` et `Login.tsx:34`, mesure A : 2). Le titre du
  panneau doit être un `p` ou un `h2`.
- Onglets `role="tab"` (4 occurrences, par exemple `Crm.tsx:118`) sans `aria-controls`, sans `role="tabpanel"` et sans
  navigation aux flèches.
- Focus des champs : `outline: none` (`styles.css:203`, répété à `:644`), seulement un halo à 18 % : c'est U08.
- Champ du Copilot sans libellé (`Copilot.tsx:247-253`, placeholder seul) : U04.
- `scrollIntoView({ behavior: "smooth" })` (`Copilot.tsx:96`) ne tient pas compte du mouvement réduit.
- Correction : composant `Tabs` accessible, `h1` unique, contour de focus visible sur les champs. Effort S.

### Qualité du code, composants, traduction

**F19 · MOYEN · Pages monolithiques et logique dupliquée**
- Tailles (lignes, `useState`, `useResource`, appels API, styles en ligne) : `Crm.tsx` 583 / 18 / 7 / 12 / 18 ;
  `Brand.tsx` 517 / 17 / 2 / 11 / 6 ; `Strategy.tsx` 486 / 11 / 2 / 7 / 5 ; `VideoStudio.tsx` 459 / 10 / 5 / 6 / 4 ;
  `Copilot.tsx` 397 / 13 ; `Admin.tsx` 324 / 16. Chaque fichier mélange appels API, état et rendu (avis de Zana
  confirmé).
- Répétitions mesurées : 51 `setErr(errorMessage(e))`, 57 blocs `catch (e)`, 25 `setBusy(true)` : c'est le hook
  `useAction()` qui manque (il réglerait aussi F01 à F03 et F09). 33 blocs `className="kpi"` recopiés (composant `Kpi`
  manquant), 4 barres d'onglets recopiées (composant `Tabs` manquant).
- Styles : 118 attributs `style={{…}}` dans les TSX ; `styles.css` (742 lignes, 54 578 o) contient deux couches
  successives, avec 25 sélecteurs définis deux fois (`.btn`, `.card`, `.sidebar`, `.tabs`, `input:focus`…) et 98
  couleurs hexadécimales écrites en dur à côté de 203 usages de variables. Les jetons existent (`styles.css:4-57`, mode
  sombre compris) mais ne sont pas utilisés partout.
- Composants à créer : `useAction`, `ResourceView`, `Kpi`, `Tabs`, `ConfirmDialog`, `StageSelect`, `PhoneInput`,
  `ActionBar` (barre d'action fixe en bas d'écran demandée par Aya pour U04, U15, U16).
- Correction : extraire d'abord les hooks et composants transverses (S à M), puis découper `Crm.tsx` et `Brand.tsx` en
  sous-dossiers (`pages/crm/Pipeline.tsx`, `LeadModal.tsx`, `TasksTab.tsx`, `FormsTab.tsx`). Fusionner les deux
  couches de `styles.css`. Effort M, puis L pour la totalité, à faire au fil des évolutions.

**F20 · MOYEN · Traduction : architecture annoncée mais pas utilisée**
- `lib/i18n.ts` contient 16 clés et `t()` est appelée 12 fois dans 3 fichiers (`Layout.tsx`, `ui.tsx`, `Login.tsx`).
  Tout le reste des 28 pages est écrit en dur.
- Libellés anglais en dur dans le menu : « AI Copilot » (`Layout.tsx:81`), « Creative Studio » (`:98`), « Video
  Studio » (`:101`), « Social Hub » (`:110`), « Content Studio » et « Brand DNA » (`i18n.ts:8-10`). Codes techniques
  affichés tels quels : `Settings.tsx:296` (`a.action`), `:331` (`r.taskType`), `:337` (`r.status`, donc
  « SUCCEEDED »), `VideoStudio.tsx:261` (repli sur le code de statut). C'est U12 d'Aya.
- Messages d'erreur réseau : voir F05.
- Correction : pas besoin d'une bibliothèque d'internationalisation aujourd'hui. Centraliser dans `i18n.ts` le
  glossaire (menu, statuts, types de tâches IA, actions du journal) et les messages d'erreur, avec le glossaire de
  David. Effort M.

**F21 · FAIBLE · Pas de lint, règles de hooks désactivées sans contrôle**
- Aucune configuration ESLint (`eslint.config.*` absent à la racine et dans `apps/web`), aucun script `lint` dans
  `platform/package.json` ni `apps/web/package.json`. Pourtant 5 commentaires `eslint-disable` désactivent
  `react-hooks/exhaustive-deps` : `Home.tsx:343`, `Copilot.tsx:91`, `SocialAudit.tsx:90`, `VideoStudio.tsx:219`,
  `CreativeStudio.tsx:237`. Celui du Copilot cache la boucle d'interrogation décrite en F08.
- Typage : strict et sans erreur ; 0 `any`, mais 17 assertions `org!` et 40 conversions `as`.
- Correction : ESLint (configuration plate) avec `typescript-eslint`, `eslint-plugin-react-hooks` et
  `eslint-plugin-jsx-a11y`, lancé en CI. Effort S. À voir avec Franck (D07).

### Sécurité côté client

**F22 · FAIBLE · Bonne base, quelques durcissements**
- Vérifié et correct : jeton d'accès en mémoire seulement (`lib/api.ts:3`), refresh en cookie httpOnly avec en-tête
  anti-CSRF (`api.ts:26`, `:41`), 0 `dangerouslySetInnerHTML`, 0 `innerHTML`, 0 `eval`, 12 liens `target="_blank"`
  tous avec `rel="noreferrer"` ou `rel="noopener noreferrer"`, aucune variable `import.meta.env` ni secret dans le
  bundle.
- `localStorage` ne contient pas de données sensibles : espace sélectionné (`auth.tsx:16`, `:57`), série de jours
  (`Delight.tsx:145-147`), vidéo vue (`DemoVideo.tsx:32`, `:39`), badges (`Home.tsx:333-335`). La sélection d'espace
  n'est pas liée à l'utilisateur et rien n'est effacé à la déconnexion (`auth.tsx:94-98`) : sur un appareil partagé
  (cybercafé, téléphone familial), l'utilisateur suivant hérite de ces clés.
- URL venant de données externes utilisées sans contrôle du schéma : `SocialHub.tsx:288` et `ContentDetail.tsx:295`
  (`externalUrl`), `SocialAudit.tsx:334` (`p.url`), redirection `Billing.tsx:50` et lien `:166` (`checkoutUrl`). React
  19 bloque les URL `javascript:`, donc le risque restant est faible, mais une liste blanche des domaines de paiement
  avant `location.href` est une bonne défense.
- `crypto.randomUUID` (8 appels) exige HTTPS et Chrome 92 ou plus : sur une vieille WebView Android, l'action plante
  avec une erreur JavaScript.
- Correction : fonction `safeUrl()` (http et https seulement), liste blanche pour la redirection de paiement, nettoyage
  des clés `forlife.*` à la déconnexion, solution de repli pour `randomUUID`. Effort S. Pour avis de Caporal (D06).

### Correspondance avec les constats d'Aya (D02)

| Constat Aya | Cause dans le code | Constat D03 |
|---|---|---|
| U03 glisser-déposer seul | `Crm.tsx:145-168`, `Calendar.tsx:100-134` | F16 |
| U04 champ Copilot | `Copilot.tsx:247-257` (libellé, double envoi) | F03, F18 |
| U06 « Failed to fetch », zéros hors ligne | `lib/hooks.ts:63-66`, `lib/api.ts:49`, erreurs non lues | F05, F06, F07 |
| U07 déconnexion sur 429 | `lib/api.ts:28-33`, `:50-53` | F05 |
| U08 focus des champs | `styles.css:203`, `:644` | F18 |
| U12 anglais et codes bruts | `Layout.tsx:81-110`, `Settings.tsx:296-337`, `i18n.ts` | F20 |
| U13 accord WhatsApp coché | `Crm.tsx:201` | F04 |
| U16 résultat hors écran | suivi `useJob`, pas de défilement ni de focus | F06, F19 (`ActionBar`) |
| U18 lien d'évitement, menu « ☰ » | `Layout.tsx:39-40`, `:161`, `styles.css:505` | F14, F15 |
| U24 pas d'état d'erreur dans les listes | 29 ressources sur 41 sans erreur lue | F07 |

## VÉRIFICATIONS

| Commande / action | Résultat réel |
|---|---|
| `cd platform && npm run typecheck` | succès (code 0, 18 s) : `@forlife/shared` construit, API et web sans erreur de typage |
| Lint | aucun script `lint`, aucune configuration ESLint : **non exécuté** (F21) |
| `cp -a apps/web/dist …/dist-avant` puis `npm run build -w @forlife/web` | succès en 5,3 s (Vite 8.3.4, 68 modules) ; `index.html` 0,80 kB, CSS 45,11 kB (gzip 10,09), JS 515,65 kB (gzip 152,14) ; avertissement « chunks larger than 500 kB » |
| `gzip -9` sur `dist/assets` | JS 150 196 o, CSS 9 989 o ; `brotli` absent de l'environnement : non mesuré |
| `diff -rq dist-avant apps/web/dist` | aucune différence : `dist` restauré à l'identique ; `git check-ignore` : ignoré par `platform/.gitignore:2` |
| `npx vite build --sourcemap --outDir <scratchpad>` puis `node bundle-attrib.mjs` | attribution de 514 302 o sur 515 701 : bibliothèques 259 551 o, pages 212 846 o, cœur 41 905 o |
| `npx tsx button-test.tsx` (rendu serveur du vrai `Button`) | `busy` + `disabled={false}` : bouton sans attribut `disabled` |
| `service postgresql start`, `npm run dev:api`, `vite preview --port 4173` | API 200 sur `/api/health`, build de production servi sur 4173 avec le proxy `/api` ; IA simulée (aucun appel payant) |
| `node mesures.mjs` (Playwright, 360 × 740) | A : connexion visible en 851 ms avec CPU ralenti 4 fois, FCP 588 ms, 5 requêtes Google Fonts, 2 `h1` ; B : 19 éléments focalisables hors écran, titre identique sur `/crm` ; D : 2 × POST conversations et 2 × POST messages ; E : hors ligne, 0 alerte et colonnes « 0 · 0 FCFA » |
| `node double-envoi.mjs` (POST retardés de 1,5 s) | bouton `disabled=false aria-busy=true` pendant l'envoi ; 3 × POST `/crm/leads`, 3 cartes créées |
| Nettoyage de la base locale | 2 contacts de test et 2 conversations de test supprimés par l'API locale (200) |
| Fin de session | `vite preview` et API arrêtés, PostgreSQL arrêté, ports 4000 et 4173 fermés (000) ; `git status --short` vide |

Non vérifié : téléchargement réel en 3G (vite preview ne compresse pas, j'ai donc mesuré le CPU et calculé le réseau à
partir des tailles gzip) ; Lighthouse (absent) ; appareil Android réel et TalkBack (Princesse, D05) ; rendu MP4 réel ;
comportement de la vraie IA (durées plus longues, ce qui aggrave F01, F02 et F06) ; production (hors périmètre).

## HYPOTHÈSES

- Le gain du découpage par route (environ 35 % de JS initial en moins) est estimé à partir de l'attribution par
  sourcemap ; la somme des gzip par groupe surestime un peu le gzip réel. À confirmer par un build découpé.
- Je suppose que l'API ne déduplique pas les jobs IA sans clé d'idempotence stable. C'est cohérent avec la mesure sur
  les prospects (3 créés) et le Copilot (2 messages), mais je ne l'ai pas mesuré sur chaque génération IA (José, D04).
- Le coût réel d'un double clic sur une génération dépend de la grille de crédits (`billing.ts`) : de 2 crédits
  (Copilot) jusqu'au rendu vidéo.

## RISQUES ET POINTS OUVERTS

1. Argent et confiance : F01, F02, F03 et F06 font payer deux fois la même génération, ce qui est d'autant plus probable
   que le réseau est lent et que l'utilisateur ne voit pas d'état « occupé » pendant les premières secondes. Un client
   qui voit son solde baisser sans résultat appelle le support ou part.
2. Données CRM : prospects en double (prouvé) qui faussent les statistiques et le ROI en FCFA.
3. Faux vides et déconnexions en 3G (F05, F07) : l'utilisateur croit avoir perdu ses données.
4. Aucune protection automatique contre la régression : pas de lint, pas de test front, pas de budget de bundle en CI
   (Franck, D07 ; Brice, D10).
5. La correction de F11 dépend d'un choix côté serveur (URL signées ou cookie), à arbitrer avec José et Caporal.

## SUGGESTIONS PRIORISÉES

| # | Priorité | Suggestion | Effort | Constats | Aya / Zana | Agent |
|---|---|---|---|---|---|---|
| 1 | P0 | Corriger `Button` (`disabled` non écrasable) et ajouter un test de rendu | S | F01 | | Grâce |
| 2 | P0 | Hook `useAction()` : occupé dès le clic, second appel ignoré, clé d'idempotence stable par intention, erreur affichée ; l'appliquer aux générations IA, au Copilot (Entrée), au CRM et aux suppressions | S à M | F02, F03, F09 | U04 | Grâce, José (idempotence côté API) |
| 3 | P0 | Client HTTP robuste : délais, reprises (GET, 429), erreurs classées et traduites, déconnexion seulement sur un vrai 401, écran « Hors connexion » au démarrage ; `fetchBlobUrl` passe par `request()` | M | F05, F09 | U06, U07 | Grâce, Princesse |
| 4 | P0 | `useJob` tolérant aux coupures (reprise, durée maximale, reprise après rechargement par `sessionStorage`) | M | F06 | U06, U16 | Grâce |
| 5 | P0 | `useResource` avec statut et `AbortController`, composant `ResourceView` (squelette, erreur avec « Réessayer », vide explicite) sur CRM, Calendrier, Analytics, Content Studio, puis partout | M | F07, F08 | U06, U24 | Grâce |
| 6 | P1 | Découpage par route (`React.lazy`), préchargement des liens, budget JS initial ≤ 100 Ko gzip en CI | S | F10 | Zana P1 n° 9 | Grâce, Brice |
| 7 | P1 | Alternatives au glisser-déposer (`StageSelect`, « Changer la date ») et `ConfirmDialog` à la place des 7 dialogues natifs | M | F16 | U03 | Grâce |
| 8 | P1 | Accessibilité transverse : `inert` sur le menu fermé, titre et focus par route, lien d'évitement, `useId` dans `Modal`, `h1` unique, `Tabs` accessible, contour de focus sur les champs | S | F14, F15, F17, F18 | U08, U18 | Grâce |
| 9 | P1 | Interrogations par `setTimeout` avec attente progressive et pause onglet caché ; Copilot sans rechargement de l'accueil à chaque tour | S | F08 | Zana §5 | Grâce |
| 10 | P1 | Médias : URL signées ou cookie, `<video preload="none">` natif, miniatures WebP 320 px, `width`/`height` | M | F11 | Zana §5 | José, Grâce |
| 11 | P1 | `PhoneInput` (+225, 10 chiffres, `normalizePhone` partagé) et accord WhatsApp non coché | S | F04 | U13 | Grâce |
| 12 | P1 | ESLint (hooks, jsx-a11y, typescript-eslint) en CI, suppression des `eslint-disable` injustifiés | S | F21 | | Grâce, Franck |
| 13 | P2 | Glossaire et messages centralisés dans `i18n.ts` (menu, statuts, codes IA, journal) | M | F20 | U12 | Grâce, David |
| 14 | P2 | Composants `Kpi`, `Tabs`, `ActionBar` ; découpage de `Crm.tsx` et `Brand.tsx` ; fusion des deux couches de `styles.css` et jetons à la place des 98 couleurs en dur | M puis L | F19 | U04, U15, U16 | Grâce |
| 15 | P2 | Police auto-hébergée (3 graisses, `preload`, `swap`) | S | F12 | Zana | Grâce |
| 16 | P2 | Pagination des colonnes CRM, contexte d'authentification mémorisé | S | F13 | | Grâce |
| 17 | P2 | `safeUrl()`, liste blanche de la redirection de paiement, nettoyage du `localStorage` à la déconnexion, repli pour `randomUUID` | S | F22 | | Grâce, Caporal |

## SUITE PROPOSÉE

1. Grâce : livrer en un seul lot les suggestions 1 et 2 (une à deux journées) : elles stoppent les pertes de crédits et
   les doublons, puis 3 à 5, qui forment le socle réseau faible attendu par Princesse.
2. José (D04) : confirmer quelles routes IA acceptent une clé d'idempotence et la respectent (F02), et décider de la
   stratégie d'accès aux fichiers (F11) ; relever ou changer la limite du refresh (U07).
3. Princesse (D05) : tester sur Android réel en 3G les corrections 3 à 5, le menu mobile (F14) et le poids des médias
   (F11).
4. Caporal (D06) : avis sur F22 (redirection de paiement, `localStorage` sur appareil partagé) et sur l'option URL
   signées de F11.
5. Franck (D07) : test de rendu de `Button`, tests de `useResource` et `useJob` (coupure, 429, course), ESLint en CI.
6. Brice (D10) : budget de bundle et contrôle `diff` du build dans le pipeline.
