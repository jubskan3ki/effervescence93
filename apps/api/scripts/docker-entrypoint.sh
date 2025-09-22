#!/bin/sh
set -euo pipefail

echo "🔎 Checking DATABASE_URL..."
: "${DATABASE_URL:?❌ DATABASE_URL is missing}"

# Regenerate client (idempotent)
pnpm prisma generate >/dev/null 2>&1 || true

# Choisit le bon point d'entrée selon l’output du build
MAIN_JS=""
if [ -f "dist/main.js" ]; then
  MAIN_JS="dist/main.js"
elif [ -f "dist/src/main.js" ]; then
  MAIN_JS="dist/src/main.js"
else
  echo "❌ Build manquant: ni dist/main.js ni dist/src/main.js."
  echo "📂 Contenu du répertoire courant:"
  ls -la
  echo "📂 Contenu de dist (si présent):"
  ls -la dist || true
  echo "💡 Rebuild l'image API: 'docker compose build api'"
  exit 1
fi

echo "🚀 Starting API with $MAIN_JS ..."
exec node --enable-source-maps "$MAIN_JS"
