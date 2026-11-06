"""
Migration 0019: Regenerate broken slugs.

Broken slugs look like:
  "2019-brand-object-16-modelgeneration-object-19-3000cc-black"

Root cause: earlier migration used str() on historical model ForeignKey
instances whose __str__ was not available, producing "Brand object (16)".

This migration finds every slug containing "object-" and regenerates it
using direct field access (.name / .model / .body).

Old broken slugs are stored in redirect_url so that the API 301-redirects
requests that still use the old slug.
"""
from django.db import migrations
from django.utils.text import slugify


def _make_slug(year, brand_name, model_name, engine, color, name):
    base = slugify(f"{year}-{brand_name}-{model_name}-{engine}cc-{color}")
    if not base:
        base = slugify(name) or 'car'
    return base


def regenerate_broken_slugs(apps, schema_editor):
    Inventory = apps.get_model('inventory', 'Inventory')

    # Collect all *current* slugs to avoid duplicates when assigning new ones.
    all_slugs = set(Inventory.objects.values_list('slug', flat=True))

    # Find records whose slug contains "object-" (the broken pattern).
    broken = Inventory.objects.filter(slug__contains='object-')

    for inv in broken:
        old_slug = inv.slug

        # Use direct field access so this works with historical model proxies.
        brand_name = inv.brand.name if inv.brand_id else ''
        model_name = inv.model.model if inv.model_id else ''
        color = inv.color or ''
        year = inv.year or ''
        engine = inv.engine_capacity or ''

        base_slug = _make_slug(year, brand_name, model_name, engine, color, inv.name)

        # Ensure uniqueness (skip old_slug — we're replacing it)
        all_slugs.discard(old_slug)
        new_slug = base_slug
        counter = 2
        while new_slug in all_slugs:
            new_slug = f"{base_slug}-{counter}"
            counter += 1
        all_slugs.add(new_slug)

        # Store old broken slug as redirect_url so the detail view
        # (which already checks redirect_url) returns a 301 to the new slug.
        old_redirect_path = f"https://bigautos.com/cars/{old_slug}/"
        if not inv.redirect_url:
            inv.redirect_url = old_redirect_path

        inv.slug = new_slug

        # Also regenerate canonical_url to match new slug
        inv.canonical_url = f"https://bigautos.com/cars/{new_slug}/"

        inv.save(update_fields=['slug', 'canonical_url', 'redirect_url'])


def reverse_migration(apps, schema_editor):
    # Non-destructive — we cannot reliably reverse slug regeneration.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0018_alter_inventory_slug_not_null'),
    ]

    operations = [
        migrations.RunPython(
            regenerate_broken_slugs,
            reverse_code=reverse_migration,
        ),
    ]
