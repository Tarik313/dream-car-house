from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
import requests


@receiver(post_save, sender="inventory.Inventory")
def handle_inventory_save(sender, instance, **kwargs):
    NEXT_REVALIDATE_URL = getattr(
        settings,
        "NEXT_REVALIDATE_URL",
        "http://127.0.0.1:3000/api/revalidate"
    )
    REVALIDATE_SECRET = getattr(
        settings,
        "REVALIDATE_SECRET",
        "beg2025secret"
    )

    slug_path = f"/cars/{instance.slug}"

    paths_to_revalidate = [
        slug_path,
        "/cars",
        "/cars/brand-new",
        "/cars/pre-owned",
        "/",
        "/sitemap.xml",
    ]

    for path in paths_to_revalidate:
        try:
            requests.get(
                f"{NEXT_REVALIDATE_URL}"
                f"?secret={REVALIDATE_SECRET}"
                f"&path={path}",
                timeout=5
            )
        except Exception:
            pass