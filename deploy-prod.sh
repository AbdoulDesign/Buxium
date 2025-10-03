#!/bin/bash
echo "🚀 Déploiement de Buxium en production..."

# Vérifier le fichier .env
if [ ! -f .env ]; then
    echo "❌ Fichier .env manquant"
    exit 1
fi

# Arrêter les services existants
echo "🛑 Arrêt des services existants..."
docker-compose -f docker-compose.prod.yml down

# Pull des dernières images (si applicable)
echo "📥 Mise à jour des images..."
docker-compose -f docker-compose.prod.yml pull

# Démarrer les services
echo "🐳 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Buxium est déployé en production!"
echo "🌐 Application: http://localhost"