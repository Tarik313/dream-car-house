import os
import logging.config
from django.contrib.messages import constants as messages

# REST FRAMEWORK CONFIGURATION
from core.settings.restconf.main import *

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
from app_libs.logger_config import LOGGING

# Build paths inside the project like this: BASE_DIR / 'subdir'.
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(PROJECT_DIR)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY") or os.environ.get("JTRO_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(
        "CRITICAL SECURITY ERROR: SECRET_KEY or JTRO_SECRET_KEY environment variable is mandatory and missing."
    )

# SECURITY WARNING: define the correct hosts in production!
_allowed_hosts_env = os.environ.get("ALLOWED_HOSTS") or os.environ.get("JTRO_ALLOWED_HOSTS")
if _allowed_hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts_env.split(",") if h.strip()]
else:
    if os.environ.get("DJANGO_SETTINGS_MODULE", "").endswith("production"):
        raise ValueError(
            "CRITICAL SECURITY ERROR: ALLOWED_HOSTS or JTRO_ALLOWED_HOSTS environment variable is mandatory and missing in production."
        )
    ALLOWED_HOSTS = ["*"]

# Application definition
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

LOCALE_APPS = [
    'apps.home',
    'apps.inventory',
    'apps.seo_config',
    'apps.dashboard_api',
]

THIRD_PARTY_APPS = [
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'fontawesomefree',
    'django_countries',
    'tinymce',
    'csp',
]

INSTALLED_APPS += LOCALE_APPS + THIRD_PARTY_APPS

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

CRISPY_TEMPLATE_PACK = 'bootstrap4'

DEFAULT_MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ON_TOP_MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
]

THIRD_PARTY_MIDDLEWARE = [
    'csp.middleware.CSPMiddleware'
]

SERVICE_MIDDLEWARE = [
]

MIDDLEWARE = ON_TOP_MIDDLEWARE + DEFAULT_MIDDLEWARE + THIRD_PARTY_MIDDLEWARE + SERVICE_MIDDLEWARE

CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": ["'self'"],
        "script-src": [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
        ],
        "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
        ],
        "font-src": [
            "'self'",
            "https://fonts.gstatic.com",
            "data:",
        ],
        "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://dreamcarhouse.com",
            "https://www.dreamcarhouse.com",
        ],
        "connect-src": [
            "'self'",
            "https://dreamcarhouse.com",
            "https://www.dreamcarhouse.com",
        ],
    }
}



if os.environ.get('JTRO_SSL_ENABLED') == 'True':
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_X_FORWARDED_HOST = True
else:
    SECURE_PROXY_SSL_HEADER = None
    USE_X_FORWARDED_HOST = False

# -----------------------------------------------------------------------------
# Cache Configuration (Shared Across Multi-Process Workers)
# -----------------------------------------------------------------------------
# In production with multiple WSGI/ASGI workers, configure Redis via REDIS_URL
# or a database-backed cache via DatabaseCache. Default uses LocMemCache for local dev/testing.
#
# Configuration Environment Variables:
#   - REDIS_URL: 'redis://127.0.0.1:6379/1' (uses RedisCache)
#   - DJANGO_CACHE_BACKEND: full python path to cache backend
#   - DJANGO_CACHE_LOCATION: cache table name or redis URI
#   - TRUSTED_PROXY_IPS: comma-separated list of trusted proxy IPs (e.g. '127.0.0.1,10.0.0.1')
#   - NUM_PROXIES: number of reverse proxies in front of app (default: 0)
#   - USE_X_FORWARDED_FOR: True/False whether to parse XFF from trusted proxies
# -----------------------------------------------------------------------------
if os.environ.get("REDIS_URL"):
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": os.environ["REDIS_URL"],
            "TIMEOUT": 300,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": os.environ.get("DJANGO_CACHE_BACKEND", "django.core.cache.backends.locmem.LocMemCache"),
            "LOCATION": os.environ.get("DJANGO_CACHE_LOCATION", "dch-shared-cache"),
            "TIMEOUT": 300,
        }
    }

# Trusted Proxy IP Configuration for get_client_ip
_trusted_proxies_env = os.environ.get("TRUSTED_PROXY_IPS", "127.0.0.1,::1,localhost")
TRUSTED_PROXY_IPS = {ip.strip() for ip in _trusted_proxies_env.split(",") if ip.strip()}
NUM_PROXIES = int(os.environ.get("NUM_PROXIES", "0"))
USE_X_FORWARDED_FOR = os.environ.get("USE_X_FORWARDED_FOR", "False").lower() in ("true", "1", "yes")





ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        "DIRS": [
            os.path.join(PROJECT_DIR, "templates"),
        ],
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

WSGI_APPLICATION = 'core.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

_core_static_dir = os.path.join(PROJECT_DIR, "static")
STATICFILES_DIRS = [
    _core_static_dir,
] if os.path.isdir(_core_static_dir) else []

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

STATIC_ROOT = os.path.join(BASE_DIR, "static_root", "static")
STATIC_URL = "/static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media_root", "media")
PUBLIC_BASE_URL = (os.environ.get("PUBLIC_BASE_URL") or os.environ.get("NEXT_PUBLIC_BASE_URL") or "").rstrip("/")

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MESSAGE_TAGS = {
    messages.INFO: 'alert alert-info',
    messages.SUCCESS: 'alert alert-success',
    messages.WARNING: 'alert alert-warning',
    messages.ERROR: 'alert alert-danger',
    messages.DEBUG: 'alert alert-info',
}

TINYMCE_DEFAULT_CONFIG = {
    "height": 500,
    "menubar": "file edit view insert format tools table help",
    "plugins": [
        "a11ychecker","accordion","advlist","anchor","autolink","autosave",
        "charmap","code","codesample","directionality","emoticons","exportpdf",
        "exportword","fullscreen","help","image","importcss","importword",
        "insertdatetime","link","lists","markdown","math","media","nonbreaking",
        "pagebreak","preview","quickbars","save","searchreplace","table",
        "visualblocks","visualchars","wordcount"
    ],
    "toolbar": (
        "undo redo | accordion accordionremove | "
        "importword exportword exportpdf | math | "
        "blocks fontfamily fontsize | bold italic underline strikethrough | "
        "align numlist bullist | link image | table media | "
        "lineheight outdent indent | forecolor backcolor removeformat | "
        "charmap emoticons | code fullscreen preview | save print | "
        "pagebreak anchor codesample | ltr rtl"
    ),
    "external_plugins": {},
    "cleanup_on_startup": True,
    "custom_undo_redo_levels": 20,
}

# JAZZMIN SETTINGS
JAZZMIN_SETTINGS = {
    "site_title": "DCH",
    "site_header": "DCH",
    "site_brand": "DCH",
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "welcome_sign": "Welcome to DCH Admin Portal",
    "copyright": "DCH",
    "user_avatar": None,

    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Location", "model": "location.Location"},
    ],

    "usermenu_links": [
        {"model": "auth.user"}
    ],

    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": ["auth","books","books.author","books.book"],

    "custom_links": {
        "books": [{
            "name": "Make Messages",
            "url": "make_messages",
            "icon": "fas fa-comments",
            "permissions": ["books.view_book"]
        }]
    },

    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
    },

    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    "related_modal_active": False,
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,

    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {"auth.user": "collapsible", "auth.group": "vertical_tabs"},
}

JAZZMIN_UI_TWEAKS = {
    "theme": "flatly",
    "dark_mode_theme": "darkly",
}

# CORS CONFIG
CORS_ORIGIN_ALLOW_ALL = False
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = (
    'GET','POST','PUT','DELETE','OPTIONS','PATCH',
)

_cors_origins_env = os.environ.get("CORS_ALLOWED_ORIGINS")
if _cors_origins_env:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        "https://dreamcarhouse.com",
        "https://www.dreamcarhouse.com",
    ]

CORS_ORIGIN_WHITELIST = CORS_ALLOWED_ORIGINS

_csrf_origins_env = os.environ.get("CSRF_TRUSTED_ORIGINS")
if _csrf_origins_env:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in _csrf_origins_env.split(",") if o.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'https://author.dreamcarhouse.com',
        'https://dreamcarhouse.com',
        'https://www.dreamcarhouse.com',
    ]

CORS_ALLOW_HEADERS = [
    'accept','accept-encoding','authorization','content-type','dnt',
    'origin','user-agent','x-csrftoken','x-requested-with',
]

CORS_EXPOSE_HEADERS = ['Date']

DATA_UPLOAD_MAX_NUMBER_FIELDS = 10240

GEOIP_PATH = os.environ.get("GEOIP_PATH")

RATE_LIMIT_COUNT = 100000
RATE_LIMIT_PERIOD = 60

DATA_UPLOAD_MAX_MEMORY_SIZE = 100 * 1024 * 1024

logging.config.dictConfig(LOGGING)            

NEXT_REVALIDATE_URL = os.environ.get("NEXT_REVALIDATE_URL", "http://frontend:3000/api/revalidate")
REVALIDATE_SECRET = os.environ.get("REVALIDATE_SECRET", "")

APPEND_SLASH = False


