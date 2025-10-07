# ---- Étape 1 : image de base ----
FROM python:3.10-slim

# ---- Étape 2 : installation des dépendances système ----
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# ---- Étape 3 : définir le dossier de travail ----
WORKDIR /app

# ---- Étape 4 : copier les dépendances ----
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# ---- Étape 5 : copier tout le code ----
COPY backend/ .

# ---- Étape 6 : exposer le port ----
EXPOSE 8000

# ---- Étape 7 : lancer gunicorn ----
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
