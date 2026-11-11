from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from core.utils.revalidation import trigger_next_revalidation


_PAGE_PATH_MAP = {
    "home": "/",
    "cars": "/cars/",
    "about": "/about/",
    "sell": "/sell/",
    "gallery": "/gallery/",
    "byd-cars": "/byd-cars/",
    "contact": "/contact/",
}


@receiver(post_save, sender="seo_config.SEOConfig")
@receiver(post_delete, sender="seo_config.SEOConfig")
def handle_seo_config_change(sender, instance, **kwargs):
    path = _PAGE_PATH_MAP.get(getattr(instance, "page", ""), "/")
    paths = [path, "/sitemap.xml"]
    if path != "/":
        paths.append("/")
    trigger_next_revalidation(paths=paths, tags=["seo"])


@receiver(post_save, sender="seo_config.CategoryPageSEO")
@receiver(post_delete, sender="seo_config.CategoryPageSEO")
def handle_category_seo_change(sender, instance, **kwargs):
    page = getattr(instance, "page", "")
    paths = [
        "/cars/",
        "/cars/brand-new/",
        "/cars/pre-owned/",
        "/cars/reconditioned/",
        "/inventory/",
        "/",
        "/sitemap.xml",
    ]
    if page:
        paths.append(f"/cars/{page}/")
    trigger_next_revalidation(paths=paths, tags=["seo"])
