#!/bin/bash
echo "🚀 Démarrage de Buxium..."

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    exit 1
fi

# Nettoyer
echo "🧹 Nettoyage..."
docker compose down 2>/dev/null || true

# Vérifier .env
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  Modifiez le fichier .env avec vos valeurs !"
fi

echo "🐳 Construction sans cache..."
docker compose build --no-cache

echo "🚀 Lancement..."
docker compose up

echo ""
echo "✅ Si tout marche :"
echo "   Frontend: http://localhost:5174"
echo "   Backend:  http://localhost:8000"