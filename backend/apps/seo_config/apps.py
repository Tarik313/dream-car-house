from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class SeoConfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.seo_config'
    verbose_name = _('SEO Configuration')

    def ready(self):
        import apps.seo_config.signals
