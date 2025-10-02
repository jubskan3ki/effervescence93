#!/bin/bash
set -e

echo "Déploiement Effervescence93"

# 1. Build le frontend localement
echo "Build frontend..."
cd apps/web
pnpm install --frozen-lockfile
pnpm run build
cd ../..

# 2. Redémarrer le frontend
echo "Redémarrage frontend..."
cd apps/web
pm2 reload ecosystem.config.cjs || pm2 start ecosystem.config.cjs
pm2 save
cd ../..

# 3. Rebuild Docker si nécessaire (API + DB)
echo "Rebuild API (si changements)..."
docker-compose up -d --build

echo "Déploiement terminé"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8080"
