# ---------- base ----------
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

# ---------- deps ----------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---------- build ----------
FROM deps AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

# Installer les dépendances de dev pour le build
RUN pnpm install --frozen-lockfile

# Générer Prisma et builder
RUN pnpm exec prisma generate
RUN pnpm exec nest build

# ---------- runtime ----------
FROM base AS runtime
WORKDIR /app
ENV PORT=8080

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY --from=build /app/dist ./dist

# Scripts
COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Générer le client Prisma pour le runtime
RUN pnpm exec prisma generate

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["./scripts/docker-entrypoint.sh"]
