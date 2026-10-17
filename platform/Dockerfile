# API + worker Forlife Com (Cloud Run). Contexte de build : dossier platform/.
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace @forlife/shared --workspace @forlife/api --include-workspace-root
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build:shared && npm run build -w @forlife/api \
  && npm prune --omit=dev --workspace @forlife/shared --workspace @forlife/api --include-workspace-root \
  && mkdir -p apps/api/node_modules

FROM node:22-bookworm-slim
# FFmpeg : rendu des vidéos ; OpenSSL : moteur Prisma.
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/shared/package.json packages/shared/
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/assets apps/api/assets
ENV NODE_ENV=production PORT=8080 STORAGE_DRIVER=gcs
WORKDIR /app/apps/api
USER node
EXPOSE 8080
# Les migrations ne sont PAS lancées par l'application : un job Cloud Run dédié (« forlife-migrate »)
# les applique avec le compte propriétaire, puis l'API tourne avec un compte aux droits restreints.
CMD ["node", "dist/main.js"]
