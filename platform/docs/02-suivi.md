# Suivi — critères d'acceptation et backlog

## Critères d'acceptation (cahier des charges §28)

| Critère | Statut | Preuve |
|---|---|---|
| Créer organisation + premier workspace sans intervention humaine | ✅ | `POST /api/auth/signup`, test `identity.test.ts` |
| Importer des assets et obtenir un Brand DNA exploitable | ✅ | upload validé + `brand/analyze` → version brouillon à valider |
| Générer une stratégie à partir d'objectifs et du contexte | ✅ | `strategy/plans/generate`, traçabilité profil v. + objectifs |
| Générer un post et l'adapter à plusieurs réseaux | ✅ | `contents/generate`, variantes par canal |
| Création image depuis le brief et l'identité | ✅ | Creative Studio : 3 concepts, vraie photo produit, Critic — `creative.test.ts` |
| Conserver les versions et permettre la régénération | ✅ | versions Brand DNA, plans, visuels (historique), rendus vidéo |
| Vidéo 10–15 s script → storyboard → rendu | ✅ | Video Studio : storyboard IA, édition par scène, MP4 9:16 + SRT — `video.test.ts` |
| Comptes sociaux en OAuth, tokens jamais en clair | ✅ | OAuth Meta (état haché à usage unique), AES-256-GCM — `social.test.ts` |
| Publication programmée idempotente et observable | ✅ | `Publication` + `PublicationAttempt`, relance, historique |
| Performances d'un contenu reliées à une campagne | ✅ | métriques réelles/simulées séparées, Analytics par campagne |
| Leads associés à une source/campagne | ✅ | source, campagne, contenu, formulaire — `crm-campaigns.test.ts` |
| Rapport de performance | ✅ | Analytics & ROI, export CSV, impression PDF — `payments-analytics.test.ts` |
| Recommandations IA : contexte indiqué, estimations signalées | ✅ | `Recommendation.isEstimate`, `evidence` |
| Les rôles empêchent les actions non autorisées | ✅ | `tenancy.test.ts` |
| Opérations critiques journalisées | ✅ | `AuditLog` append-only |

## Backlog (spécification §6)

| ID | Tâche | Statut |
|---|---|---|
| P0-01 | Audit dépôt | ✅ `00-audit-J0.md` |
| P0-02 | Matrice modules / dépendances sans cycle | ✅ |
| P0-03 | Propagation org/workspace + tests d'isolation | ✅ |
| P0-04 | Workspace / brand / business profile (CRUD + RBAC) | ✅ |
| P0-05 | Storage + métadonnées, upload sécurisé | ✅ (driver local) |
| P0-06 | AI Gateway, mock + tests | ✅ |
| P0-07 | Ledger crédits/coûts idempotent | ✅ |
| P0-08 | Objectifs / audiences / concurrents | ✅ |
| P0-09 | Posts / variantes / calendrier + workflow d'approbation | ✅ |
| P1-01 → P1-08 | Creative, image, critic, OAuth social, publication, métriques, CRM, campagnes | ✅ |
| P2 | Vidéo, analytics, paiements mobile money, back-office | ✅ |
| P3a | AI Copilot & 12 agents, mémoire de l'entreprise, modes assisté / copilot / autopilot borné | ✅ |
| P3b | WhatsApp Business API, optimizer avancé, white-label agence, API publique | ⏳ |

## Tarifs validés (12/10/2026)

| Offre | Prix | Crédits |
|---|---|---|
| Free / Starter / Business / Pro / Agency | 0 / 15 000 / 45 000 / 95 000 / 250 000 FCFA par mois | 200 / 1 500 / 5 000 / 12 000 / 40 000 par mois |
| Pack Essentiel | 5 000 FCFA | 500 |
| Pack Croissance | 18 000 FCFA | 2 000 |
| Pack Volume | 48 000 FCFA | 6 000 |

Abonnements payés d'avance : 3 mois −5 %, 12 mois −15 %.

## Prochaines étapes recommandées

1. **Mise en ligne** : suivre [03-deploiement.md](03-deploiement.md) (Cloud SQL, bucket, secrets, second site Firebase, workflow GitHub).
2. **Clés à ajouter par le propriétaire** : Anthropic (IA réelle), CinetPay (encaissement), Meta (publication), Resend (emails).
3. **Revue d'app Meta** (permissions `pages_manage_posts`, `instagram_content_publish`) : prévoir 1 à 3 semaines.
4. Phase suivante : WhatsApp Business API (messages entrants → leads), connecteurs LinkedIn/TikTok/YouTube.
