#!/bin/bash
echo "🚀 Démarrage de Buxium en mode développement..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  N'oubliez pas de modifier le fichier .env avec vos valeurs réelles"
fi

# Construire et lancer les services
echo "🐳 Construction des conteneurs..."
docker compose up --build

echo "✅ Buxium est démarré!"
echo "🌐 Frontend: http://localhost:5174"
echo "🔗 Backend: http://localhost:8000"
echo "🌐 Application: http://localhost:8080"