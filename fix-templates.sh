#!/bin/bash
echo "🔧 Correction de la configuration des templates..."

# Créer une sauvegarde
cp backend/settings.py backend/settings.py.backup

# Corriger la section TEMPLATES avec sed
sed -i '/TEMPLATES = \[/,/\]/{
    /'"'"'loaders'"'"'/d
    /APP_DIRS/s/False/True/
}' backend/settings.py

echo "✅ Configuration des templates corrigée!"
