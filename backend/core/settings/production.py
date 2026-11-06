from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('JTRO_DEBUG') != 'False'

INSTALLED_APPS = INSTALLED_APPS + [

]

# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }


# DATABASES = {
#         "default": {
#             "ENGINE": "django.db.backends.sqlite3",
#             "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
#         }
#     }

    
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('JTRO_DB_ENGINE'),
        'NAME': os.environ.get('JTRO_DB_NAME'),
        'USER': os.environ.get('JTRO_DB_USER'),
        'PASSWORD': os.environ.get('JTRO_DB_PASSWORD'),
        'HOST': os.environ.get('JTRO_DB_HOST'),
        'PORT': os.environ.get('JTRO_DB_PORT'),
    }
}



if os.environ.get('JTRO_SSL_ENABLED') == 'True':
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


CORS_ALLOWED_ORIGINS = [
    'https://dreamcarhouse.com',
    'https://www.dreamcarhouse.com',
]

CORS_ORIGIN_WHITELIST = [
    'https://dreamcarhouse.com',
    'https://www.dreamcarhouse.com',
]

CSRF_TRUSTED_ORIGINS = [
    'https://author.dreamcarhouse.com',
    'https://dreamcarhouse.com',
    'https://www.dreamcarhouse.com',
]


MIDDLEWARE = ['whitenoise.middleware.WhiteNoiseMiddleware'] + MIDDLEWARE

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

STATIC_ROOT = os.path.join(BASE_DIR, 'static_root', 'static')