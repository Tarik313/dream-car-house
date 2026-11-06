"""Isolated tests: in-memory sqlite with sessions, auth, and dashboard_api."""
SECRET_KEY = "dashboard-tests-only-not-a-production-secret"
DEBUG = False
ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]
INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "rest_framework",
    "apps.dashboard_api",
    "apps.home",
    "apps.inventory",
    "apps.seo_config",
    "tinymce",
]
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
ROOT_URLCONF = "apps.dashboard_api.test_urls"
MIDDLEWARE = [
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
]
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["apis.renderers.DefaultRenderer"],
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
