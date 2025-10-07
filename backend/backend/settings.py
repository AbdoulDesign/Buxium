from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# Charger le .env depuis la racine du projet
load_dotenv(Path(__file__).resolve().parent.parent / '.env')

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-in-production")
DEBUG = os.getenv("DEBUG", "False").lower() in ["true", "1", "yes"]

ALLOWED_HOSTS = ['*']  # ← Pour le développement, autoriser tout


# 🔐 Corrige la boucle de redirection HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False

# 🍪 Autoriser les cookies sur HTTPS
CSRF_TRUSTED_ORIGINS = [
    "https://competent-shina-buxium-7e607554.koyeb.app",
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# CORS Configuration COMPLÈTE
CORS_ALLOW_ALL_ORIGINS = False  # ← True en développement
CORS_ALLOW_CREDENTIALS = True
"""
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://127.0.0.1:5174", 
    "http://frontend:5174",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://nginx:80",
]
"""

CORS_ALLOWED_ORIGINS = [
    "https://buxium-frontend.koyeb.app",
]


CORS_ALLOW_METHODS = [
    'DELETE',
    'GET', 
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
"""
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8080", 
    "http://127.0.0.1:8080",
]
"""
# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',  # ← Doit être après les apps Django
    'accounts', 
    'gestion_stock',
    'core',
    'pawapay',
]

# MIDDLEWARE - CORS en PREMIER
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← TRÈS IMPORTANT: Premier!
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database - utilise vos variables d'environnement
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv("DATABASE_NAME", "buxium_db"),
        'USER': os.getenv("DATABASE_USER", "postgres"),
        'PASSWORD': os.getenv("DATABASE_PASSWORD", "abdoul1"),
        'HOST': os.getenv("DATABASE_HOST", "db"),
        'PORT': os.getenv("DATABASE_PORT", "5432"),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Dakar'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

PAWAPAY_TOKEN = os.getenv("PAWAPAY_TOKEN")

# Security settings - désactivées en développement
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
else:
    # En développement
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
