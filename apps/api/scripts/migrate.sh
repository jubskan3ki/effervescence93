#!/bin/sh
set -euo pipefail

echo "🔗 DATABASE_URL check"
: "${DATABASE_URL:?❌ DATABASE_URL is missing}"

echo "📦 prisma generate (idempotent)"
pnpm prisma generate >/dev/null 2>&1 || true

# 1) Assure l'existence du dossier migrations
mkdir -p prisma/migrations

# 2) Si aucune migration n'est présente, on en crée une
if [ -z "$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d -print -quit)" ]; then
  echo "🧱 No migrations present → creating initial migration…"

  if pnpm prisma migrate dev --name init --create-only; then
    echo "✅ Migration 'init' créée (create-only)"
  else
    echo "⚠️ 'migrate dev --create-only' a échoué → fallback 'migrate diff' baseline"
    TS=$(date -u +%Y%m%d%H%M%S)
    DIR="prisma/migrations/${TS}_init"
    mkdir -p "$DIR"

    pnpm prisma migrate diff \
      --from-empty \
      --to-schema-datamodel prisma/schema.prisma \
      --script > "${DIR}/migration.sql"

    [ -s "${DIR}/migration.sql" ] || { echo "❌ Baseline vide. Vérifie prisma/schema.prisma"; exit 1; }

    [ -f prisma/migrations/migration_lock.toml ] || printf 'provider = "postgresql"\n' > prisma/migrations/migration_lock.toml
    echo "✅ Baseline SQL generated at ${DIR}/migration.sql"
  fi
else
  echo "ℹ️ Migrations already present → skip creation"
fi

# 3) Applique les migrations en prod
echo "🧭 Applying migrations (deploy)…"
pnpm prisma migrate deploy

# 4) Regénère le client après application (par précaution)
pnpm prisma generate >/dev/null 2>&1 || true

# 5) Seed (si activé ou par défaut true)
if [ "${SEED:-true}" = "true" ]; then
  echo "🌱 Seeding database…"
  pnpm prisma:seed || echo "⚠️ Seed failed (continuing)."
fi

# 6) Vérification simple: lister les tables publiques
node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  const rows = await p.\$queryRaw\`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1\`;
  console.log('📊 Tables en base:', rows.map(r => r.table_name));
  await p.\$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
"

echo "✅ migrations + seed OK"
