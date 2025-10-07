# Utilise une image légère Python 3.10
FROM python:3.10-slim

WORKDIR /app

# Éviter les fichiers .pyc et forcer le stdout flush
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Installer les dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Copier les dépendances Python
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copier le reste du code du backend
COPY . .

# Créer les répertoires nécessaires pour les fichiers statiques et médias
RUN mkdir -p staticfiles media

# Exposer le port 8000
EXPOSE 8000

# Commande par défaut : exécuter Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.backend.wsgi:application"]
