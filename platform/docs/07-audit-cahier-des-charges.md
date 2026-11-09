# Audit de conformité au cahier des charges (17 octobre 2026)

**Référentiel :**
- Cahier des charges v1.0 (31 sections) ;
- Spécification technique v1.0 : backlog P0-01 à P3-03, gates G0 à G8.

**Méthode :** chaque exigence a été vérifiée dans le code (routes, schéma de données, écrans), puis confirmée
par un test automatisé quand il existe. Le code est **contrôlé par 128 tests API et 8 tests du paquet
partagé, tous verts**.

## 1. Synthèse

| Bloc | Résultat |
|---|---|
| Critères d'acceptation (§28) | **15 / 15 couverts** |
| Backlog P0 (§27) | **Complet**, y compris la génération d'images par IA (ajoutée le 17/10) |
| Backlog P1 | **Complet** |
| Backlog P2 | Video Studio ✅ · Attribution revenus ✅ · AI Autopilot borné ✅ · **WhatsApp Business API ⏸** (aujourd'hui : liens wa.me + consentement) |
| Backlog P3 (apps mobiles, marque blanche, API publique, marketplace) | ⏸ Prévu par la feuille de route (phase 8) |
| Mise en service réelle | **Bloquée par 5 démarches de votre côté** (§ 4) : emails, paiement, domaine, validation des plateformes, activation de 2 API Google |

## 2. Conformité par section

✅ fait · 🟡 partiel · ⏸ phase ultérieure prévue par la spec · ❌ absent

| § | Exigence | Statut | Preuve / reste |
|---|---|---|---|
| 6 | Profil business, objectifs, audiences, concurrents, plan stratégique, recommandations impact/effort | ✅ | `strategy/*`, recommandations avec contexte et mention « estimation » |
| 6 | Audit des réseaux à partir des liens | ✅ | « Analyser mes réseaux » (Business Brain), `social-audit.test.ts` |
| 6 | Veille concurrentielle (suivi des changements) | 🟡 | Fiches concurrents ; pas de suivi automatique |
| 7 | Brand DNA versionné et validé par un humain, voix par canal, mots interdits, faits verrouillés | ✅ | `brand/*` |
| 7 | Extraction depuis les documents | ✅ | TXT **et PDF** (ajouté le 17/10, `brand-pdf.test.ts`) ; pas encore l'import d'une URL de site |
| 7 | Base de connaissances à recherche sémantique (embeddings) | ❌ | À développer (§ 5) |
| 8 | Idées, posts, variantes par réseau, approbation, calendrier, aperçus | ✅ | `content-flow.test.ts` |
| 8 | Repurposing, variantes A/B, détection de lassitude | ❌ | À développer (§ 5) |
| 9 | Brief → 3 concepts → rendu → Critic → versions → régénération | ✅ | `creative.test.ts` |
| 9 | Génération d'images par IA | ✅ | **Fonds photo Imagen (Vertex AI)**, en option, 4 crédits par image (ajouté le 17/10, `creative-ai-image.test.ts`) |
| 9 | Carrousels, « Human Feel Score » | 🟡 | Type carrousel modélisé, rendu en image unique |
| 10 | Script → storyboard → scènes modifiables → MP4 9:16 + SRT, 10/12/15 s | ✅ | `video.test.ts` |
| 10 | Voix off | ✅ | **Voix féminine ou masculine** (Google Text-to-Speech, ajoutée le 17/10, `video-voice.test.ts`) |
| 10 | 30 à 60 s, exports spécifiques par plateforme | ⏸ / 🟡 | La spec prévoit 30–60 s « ultérieurement » ; un seul export 9:16 |
| 11 | OAuth Meta, LinkedIn, TikTok, YouTube ; jetons chiffrés ; publication programmée idempotente ; relances ; statistiques | ✅ | `social.test.ts` ; applications encore en mode test chez les plateformes (§ 4) |
| 11 | Révocation à la déconnexion | ✅ | TikTok et Google révoqués côté réseau (ajouté le 17/10) |
| 11 | Webhooks entrants des réseaux, messagerie, connecteur X | ❌ / ⏸ | X est en P2 dans la spec (API payante) |
| 12 | Leads par source / campagne / contenu / formulaire, pipeline, tâches, relance WhatsApp assistée | ✅ | `crm-campaigns.test.ts` |
| 12 | Lead scoring | 🟡 | Règles explicites, sans IA |
| 13 | Campagnes (budget FCFA, canaux, période), pack de contenus IA, validation | ✅ | `campaigns/*` |
| 13 | Automatisation par déclencheurs (nouveau lead, inactivité, performance faible) | ❌ | À développer (§ 5) |
| 14 | Tableau de bord ROI par campagne, réel ≠ simulé, rapport CSV / PDF | ✅ | `payments-analytics.test.ts` |
| 14 | Creative Score comparatif, anomalies | 🟡 | Constats par règles |
| 15 | AI Copilot, 12 agents, modes assisté / copilot / autopilot borné, actions plafonnées | ✅ | `copilot.test.ts` |
| 16 | FCFA, mobile money, WhatsApp, fuseau Abidjan, mobile d'abord | ✅ | CinetPay prêt (à configurer), interface 360 → 1440 px |
| 16 | Architecture multilingue, langues africaines | 🟡 | Socle i18n en place, textes encore majoritairement en dur |
| 17 | Multi-tenant strict, 8 rôles, permissions module:action, agence limitée à ses clients, journal d'audit | ✅ | `tenancy.test.ts` |
| 17 | Workspace par marque / client, sélecteur | ✅ | **Création des espaces depuis Paramètres → Espaces & données** (ajoutée le 17/10) |
| 18 | Offres et packs aux prix validés, crédits, compteur d'usage par type | ✅ | `billing.ts`, `ledger-ai.test.ts` |
| 18 | Alertes de consommation | ✅ | Écran + **emails à 20 % et 5 %** (ajoutés le 17/10) |
| 19 | File de jobs fiable, logs structurés et corrélation, secrets en Secret Manager | ✅ | `jobs.test.ts`, `01-architecture.md` |
| 19 | Métriques, traces, alertes, feature flags dynamiques | ⏸ / 🟡 | Observabilité prévue à la gate G8 ; flags par variables d'environnement |
| 21 | Passerelle IA, registre de prompts versionné, sorties validées, traçabilité coût / modèle, remboursement en cas d'échec | ✅ | `ai/*` |
| 21 | Modération réelle, jeu d'évaluation | 🟡 / ❌ | Contrôle des mots interdits ; pas de jeu d'évaluation |
| 22 | Chiffrement, RBAC, journal immuable, CSP, contrôle des fichiers, protection SSRF | ✅ | `firebase.json`, `storage.ts`, `links.ts` |
| 22 | Pages légales, page de suppression des données | ✅ | `/confidentialite`, `/conditions`, `/suppression-des-donnees` |
| 22 | Export des données, suppression d'organisation, droit à l'effacement d'un contact, conservation | ✅ | **Ajoutés le 17/10** (`governance.test.ts`) ; données YouTube effacées après 30 jours |
| 22 | Antivirus des fichiers | 🟡 | Liste blanche + vérification de signature ; antivirus « si nécessaire » selon la spec |
| 23 | API publique, marketplace | ⏸ | Phase 8 |
| 24 | Design system, accessibilité WCAG AA, responsive | ✅ | `04-audit-ui.md` (115 vérifications, 0 violation) |
| 25 | Tests automatisés de bout en bout (navigateur) et lint en CI | 🟡 | Tests API complets ; vérifications navigateur faites mais pas encore versionnées |

## 3. Corrigé pendant cet audit (17 octobre)

1. Export JSON des données d'un espace.
2. Suppression d'organisation : annulable pendant 30 jours, puis effacement automatique. Les écritures comptables
   et le journal d'audit sont conservés.
3. Effacement d'un contact du CRM et de tout son historique.
4. Révocation des autorisations TikTok et Google à la déconnexion.
5. Création et gestion des espaces de travail dans l'interface (offres Business, Pro, Agency).
6. Brand DNA nourri par les PDF.
7. Alertes de crédits par email.
8. Voix off du Video Studio.
9. Fonds photo générés par IA dans le Creative Studio.
10. Conformité des plateformes :
    - page de suppression des données ;
    - politique de confidentialité complète ;
    - autorisation Instagram pour les statistiques ;
    - règle YouTube des 30 jours.
11. Dossiers de validation Meta, TikTok, Google/YouTube et LinkedIn (`06-validation/`).

## 4. Ce qui dépend de vous (bloquant pour une vraie mise en service)

| # | Action | Pourquoi |
|---|---|---|
| 1 | **Emails (Resend)** : domaine vérifié + secret `forlife-resend-key` | Sans email, pas de vérification de compte (donc pas de crédits offerts), pas de mot de passe oublié, pas d'invitation |
| 2 | **Paiement (CinetPay)** : compte marchand + secrets | Aucun encaissement possible aujourd'hui |
| 3 | **Domaine `forlifecomai.ci`** actif, puis bascule de l'application | Prérequis des validations des plateformes et de l'email professionnel |
| 4 | **Validation des applications** Meta, TikTok, Google (dossiers prêts) | Sans elle, seuls les testeurs peuvent connecter leurs pages |
| 5 | **Activer 2 API Google** : Text-to-Speech (voix off) et Vertex AI + rôle (fonds photo) | Une commande chacune, voir `05-installer-les-api.md` |

## 5. Développements restants (non bloquants pour démarrer)

| Priorité | Fonction (§) | Effort |
|---|---|---|
| 1 | Automatisation par déclencheurs : nouveau lead → relance, inactivité, performance faible (§13) | L |
| 2 | WhatsApp Business API : messages entrants → leads, modèles (§16, P2) | L (compte WhatsApp Business validé par Meta) |
| 3 | Base de connaissances avec recherche sémantique, import d'une URL de site (§7) | L |
| 4 | Repurposing (1 idée → carrousel, email, WhatsApp), variantes A/B, détection de lassitude (§8, §14) | L |
| 5 | Modération réelle + jeu d'évaluation des sorties IA (§21) | M |
| 6 | Supervision : alertes Cloud Monitoring, disponibilité, erreurs, test de restauration (§19, G8) | M |
| 7 | Tests navigateur de bout en bout et lint dans la CI (§25) | M |
| 8 | Webhooks entrants des réseaux, exports vidéo par plateforme, régénération IA d'une scène | M |
| 9 | Traduction complète de l'interface (anglais, puis langues africaines) (§16) | M |
| 10 | Phase 8 : marque blanche, API publique, marketplace, applications mobiles | L |

Recommandation : lancer d'abord les 5 actions du § 4, qui conditionnent l'ouverture au public. Ensuite, attaquer
l'automatisation par déclencheurs et WhatsApp Business, qui ont le plus d'impact sur les ventes des clients.
