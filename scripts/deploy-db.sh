#!/bin/bash

# Script pour déployer les migrations Prisma sur Vercel
# Usage: ./deploy-db.sh

echo "🚀 Déploiement des migrations Prisma..."

# Pull les variables d'environnement depuis Vercel
vercel env pull .env.local

# Exécuter les migrations
npx prisma migrate deploy

echo "✅ Migrations déployées avec succès!"
