#!/bin/bash
set -e

echo "Démarrage initial Effervescence93"

# 1. Démarrer Docker (API + DB)
echo "Démarrage API + DB..."
docker-compose up -d

echo "Attendre que l'API soit prête..."
sleep 10

# 2. Build et démarrer le frontend
echo "Build frontend..."
cd apps/web
pnpm install --frozen-lockfile
pnpm run build

echo "Démarrage frontend..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

cd ../..

echo "Démarrage terminé"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8080"
