# Brief — Diagnostic de Forlife Com (AI Growth & Creative OS)

## Objectif
Diagnostic complet de l'application existante par chaque spécialiste, l'un après l'autre, avec un rapport
détaillé et des suggestions priorisées. **Aucune modification du code de l'application** pendant ce diagnostic.

## Produit
- SaaS marketing pour PME d'Afrique francophone (Côte d'Ivoire d'abord) : Business Brain (Analyser mes réseaux,
  Brand DNA, stratégie), Content / Creative / Video Studio, validation et calendrier, Social Hub (Meta, LinkedIn,
  TikTok, YouTube), campagnes, CRM et WhatsApp, Analytics & ROI en FCFA, AI Copilot (12 agents), crédits et
  paiement mobile money (CinetPay), back-office.
- En ligne : https://forlifecomai.ci (et https://ai-growth-et-creative-os.web.app).

## Dépôt
- `platform/` : monorepo npm workspaces. `apps/api` (Fastify 5, Prisma, PostgreSQL, zod, vitest),
  `apps/web` (React 19, Vite, react-router), `packages/shared` (RBAC, domaine, facturation), `marketing/ad`
  (vidéos Remotion), `deploy/production.env`, `docs/` (00 à 07, dont l'audit du cahier des charges).
- Racine du dépôt : site vitrine statique de l'agence (hors périmètre sauf mention).
- CI/CD : `.github/workflows/platform-ci.yml` et `platform-deploy.yml` (Cloud Run + Firebase Hosting, région
  europe-west1), branche `claude/app-development-sbl2ff`.

## Environnement de diagnostic
- PostgreSQL local : `service postgresql start`. Tests : `cd platform && npm test`. Typage : `npm run typecheck`.
- Lancement local : `npm run dev:api` (port 4000) et `npm run dev:web` (port 5173), compte de test
  awa@test.ci / motdepasse123. Playwright : `/opt/node-tools/node_modules/playwright/index.mjs`.
- Le site en ligne n'est pas joignable depuis cet environnement (proxy) : diagnostiquer sur le code et en local.

## Contraintes
- Pas de modification du code applicatif, pas de push, pas de commande payante, rien contre la production.
- Rapports en français, au format commun, dans `.equipe/rapports/`.
