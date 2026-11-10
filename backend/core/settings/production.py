import dj_database_url
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('JTRO_DEBUG', '').strip().lower() in ('true', '1')

INSTALLED_APPS = INSTALLED_APPS + [

]

# Database configuration: prefers DATABASE_URL via dj-database-url, with fallback to individual JTRO_DB_* variables
database_url = os.environ.get('DATABASE_URL')
if database_url:
    DATABASES = {
        'default': dj_database_url.parse(database_url, conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': os.environ.get('JTRO_DB_ENGINE', 'django.db.backends.postgresql'),
            'NAME': os.environ.get('JTRO_DB_NAME', 'dreamcarhouse_db'),
            'USER': os.environ.get('JTRO_DB_USER', 'dch_admin'),
            'PASSWORD': os.environ.get('JTRO_DB_PASSWORD', ''),
            'HOST': os.environ.get('JTRO_DB_HOST', 'postgres'),
            'PORT': os.environ.get('JTRO_DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
        }
    }

# SSL, HSTS, and Secure Cookies configuration (activated when JTRO_SSL_ENABLED is true)
ssl_enabled = os.environ.get('JTRO_SSL_ENABLED', '').strip().lower() in ('true', '1')
if ssl_enabled:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    USE_X_FORWARDED_HOST = True
    # Cloudflare Edge and Nginx reverse proxy handle HTTP -> HTTPS redirection.
    # SECURE_SSL_REDIRECT is intentionally False inside Django so internal container-to-container calls
    # (e.g. Next.js SSR or Dashboard calling http://backend:8000) are not blocked or looped with an HTTPS redirect.
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # HSTS: configurable via JTRO_HSTS_SECONDS (default 3600); subdomains/preload default to False
    try:
        SECURE_HSTS_SECONDS = int(os.environ.get('JTRO_HSTS_SECONDS', 3600))
    except (ValueError, TypeError):
        SECURE_HSTS_SECONDS = 3600

    SECURE_HSTS_INCLUDE_SUBDOMAINS = (
        os.environ.get('JTRO_HSTS_INCLUDE_SUBDOMAINS', '').strip().lower() in ('true', '1')
    )
    SECURE_HSTS_PRELOAD = (
        os.environ.get('JTRO_HSTS_PRELOAD', '').strip().lower() in ('true', '1')
    )
else:
    SECURE_PROXY_SSL_HEADER = None
    USE_X_FORWARDED_HOST = False
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False


_cors_origins_env = os.environ.get("CORS_ALLOWED_ORIGINS")
if _cors_origins_env:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'https://dreamcarhouse.com',
        'https://www.dreamcarhouse.com',
    ]

CORS_ORIGIN_WHITELIST = CORS_ALLOWED_ORIGINS
CORS_ALLOW_ALL_ORIGINS = False
CORS_ORIGIN_ALLOW_ALL = False

_csrf_origins_env = os.environ.get("CSRF_TRUSTED_ORIGINS")
if _csrf_origins_env:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_origins_env.split(",") if o.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'https://author.dreamcarhouse.com',
        'https://dreamcarhouse.com',
        'https://www.dreamcarhouse.com',
    ]


MIDDLEWARE = ['whitenoise.middleware.WhiteNoiseMiddleware'] + MIDDLEWARE

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

STATIC_ROOT = os.path.join(BASE_DIR, 'static_root', 'static')