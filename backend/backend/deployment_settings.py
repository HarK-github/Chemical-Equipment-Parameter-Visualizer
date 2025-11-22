import os
import dj_database_url
from .settings import *
from .settings import BASE_DIR

# =====================
# Security
# =====================
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-secret-key')
ALLOWED_HOSTS = [os.environ.get('RENDER_EXTERNAL_HOSTNAME', 'localhost')]
CSRF_TRUSTED_ORIGINS = ['https://' + os.environ.get('RENDER_EXTERNAL_HOSTNAME', 'localhost')]

# =====================
# Database
# =====================
DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True
        )
    }
else:
    # Fallback to manual PostgreSQL configuration
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'chemvisbackend'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
            'OPTIONS': {
                'sslmode': 'require',
            }
        }
    }

# =====================
# Middleware
# =====================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# =====================
# Static files
# =====================
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# =====================
# Media files
# =====================
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# =====================
# File storage
# =====================
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

CORS_ALLOW_HEADERS = list(default_headers) + [
    "Authorization",
]
# =====================
# CORS Settings for Production
# =====================
CORS_ALLOWED_ORIGINS = [
    f"https://{os.environ.get('RENDER_EXTERNAL_HOSTNAME', 'localhost')}",
    "http://localhost:5173",  # Keep for local dev
]
