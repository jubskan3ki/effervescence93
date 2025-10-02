#!/bin/bash

echo "Arrêt Effervescence93"

# Arrêter le frontend
pm2 stop eff93-web

# Arrêter Docker
docker-compose down

echo "Tout est arrêté"
