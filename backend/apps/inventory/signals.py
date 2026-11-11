from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils.text import slugify

from core.utils.revalidation import trigger_next_revalidation


@receiver(post_save, sender="inventory.Inventory")
@receiver(post_delete, sender="inventory.Inventory")
def handle_inventory_change(sender, instance, **kwargs):
    paths = [
        "/cars/",
        "/cars",
        "/cars/brand-new/",
        "/cars/pre-owned/",
        "/cars/reconditioned/",
        "/inventory/",
        "/",
        "/sitemap.xml",
    ]
    tags = ["inventory", "featured-inventory"]

    if getattr(instance, "slug", None):
        paths.extend([f"/cars/{instance.slug}/", f"/cars/{instance.slug}"])
        tags.append(f"car-{instance.slug}")
    if getattr(instance, "previous_slug", None):
        paths.append(f"/cars/{instance.previous_slug}/")

    trigger_next_revalidation(paths=paths, tags=tags)


@receiver(post_save, sender="inventory.Brand")
@receiver(post_delete, sender="inventory.Brand")
def handle_brand_change(sender, instance, **kwargs):
    brand_slug = slugify(getattr(instance, "name", "") or "")
    paths = ["/cars/brand/", "/cars/", "/inventory/", "/", "/sitemap.xml"]
    if brand_slug:
        paths.append(f"/cars/brand/{brand_slug}/")
    trigger_next_revalidation(paths=paths, tags=["brands", "inventory", "seo"])
