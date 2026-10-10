# Suivi — critères d'acceptation et backlog

## Critères d'acceptation (cahier des charges §28)

| Critère | Statut | Preuve |
|---|---|---|
| Créer organisation + premier workspace sans intervention humaine | ✅ | `POST /api/auth/signup`, test `identity.test.ts` |
| Importer des assets et obtenir un Brand DNA exploitable | ✅ | upload validé + `brand/analyze` → version brouillon à valider |
| Générer une stratégie à partir d'objectifs et du contexte | ✅ | `strategy/plans/generate`, traçabilité profil v. + objectifs |
| Générer un post et l'adapter à plusieurs réseaux | ✅ | `contents/generate`, variantes par canal |
| Création image depuis le brief et l'identité | ⏳ Phase 2 | — |
| Conserver les versions et permettre la régénération | ✅ (Brand DNA, profil, plans) / ⏳ (créations) | |
| Vidéo 10–15 s script → storyboard → rendu | ⏳ Phase 4 | |
| Comptes sociaux en OAuth, tokens jamais en clair | 🟡 chiffrement prêt, OAuth Phase 3 | `lib/crypto.ts` + test |
| Publication programmée idempotente et observable | 🟡 programmation + jobs idempotents ; publication réelle Phase 3 | |
| Performances d'un contenu reliées à une campagne | 🟡 lien contenu → campagne modélisé ; métriques Phase 3/5 | |
| Leads associés à une source/campagne | ⏳ Phase 5 | |
| Rapport de performance | ⏳ Phase 6 | |
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
| P1-01 → P1-08 | Creative, image, critic, OAuth social, publication, métriques, CRM, campagnes | ⏳ prochaines itérations |
| P2 / P3 | Vidéo, analytics, optimizer, WhatsApp, autopilot, agence, API publique | ⏳ |

## Prochaines étapes recommandées

1. **Phase 2 — Creative AI** : choisir le premier fournisseur image, pipeline Brief → Concepts → Critic → Brand/Safety Check.
2. **Phase 3 — Social Hub** : apps Meta/TikTok (délais de revue des permissions à anticiper), OAuth + `SocialCredential` chiffré,
   publication idempotente (`Publication` + `PublicationAttempt`).
3. Invitations membres par email, réinitialisation de mot de passe, driver S3, renouvellement mensuel automatique des crédits.
