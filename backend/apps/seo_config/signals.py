from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import requests
import os

@receiver(post_save, sender="seo_config.SEOConfig")
def handle_seo_config_save(sender, instance, **kwargs):
    NEXT_REVALIDATE_URL = getattr(settings, "NEXT_REVALIDATE_URL", "http://127.0.0.1:3000/api/revalidate")
    REVALIDATE_SECRET = getattr(settings, "REVALIDATE_SECRET", "beg2025secret")
    
    if instance.page == "home":
        path = "/"
    elif instance.page == "cars":
        path = "/cars"
    elif instance.page == "about":
        path = "/about"
    elif instance.page == "sell":
        path = "/sell"
    elif instance.page == "gallery":
        path = "/gallery"
    elif instance.page == "byd-cars":
        path = "/byd-cars"
    elif instance.page == "contact":
        path = "/contact"
    else:
        path = "/"

    paths_to_revalidate = [path]
    if path != "/":
        paths_to_revalidate.append("/")

    for p in paths_to_revalidate:
        try:
            requests.get(
                f"{NEXT_REVALIDATE_URL}?secret={REVALIDATE_SECRET}&path={p}",
                timeout=5
            )
        except Exception:
            pass
