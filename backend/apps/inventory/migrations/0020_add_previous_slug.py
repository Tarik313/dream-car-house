"""
Migration 0020: Add previous_slug field and fix erroneously set redirect_url.

0019 incorrectly stored the OLD broken slug URL into redirect_url.
That would cause the InventoryDetailView to 301-redirect requests for the
NEW clean slug back to the OLD broken slug — a dead link.

This migration:
1. Adds a `previous_slug` CharField (nullable) to store old broken slugs.
2. Extracts the old broken slug from the bad redirect_url values and saves
   it into previous_slug.
3. Clears the erroneous redirect_url values written by 0019.
"""
from django.db import migrations, models


def fix_redirect_url_and_set_previous_slug(apps, schema_editor):
    Inventory = apps.get_model('inventory', 'Inventory')

    # Only touch records whose redirect_url was set by migration 0019:
    # they contain "/cars/<broken-slug>/" where <broken-slug> has "object-" in it.
    for inv in Inventory.objects.filter(redirect_url__contains='object-'):
        # Extract the broken slug from the stored URL, e.g.
        # "https://bigautos.com/cars/brand-object-16.../  →  "brand-object-16..."
        url = inv.redirect_url or ''
        # Strip trailing slash, then get the last path segment
        broken_slug = url.rstrip('/').rsplit('/', 1)[-1]
        if broken_slug:
            inv.previous_slug = broken_slug
        # Clear the bad redirect_url value
        inv.redirect_url = ''
        inv.save(update_fields=['previous_slug', 'redirect_url'])


def reverse_migration(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0019_regenerate_broken_slugs'),
    ]

    operations = [
        migrations.AddField(
            model_name='inventory',
            name='previous_slug',
            field=models.CharField(
                max_length=255,
                blank=True,
                default='',
                verbose_name='Previous Slug (for 301 redirect)',
                help_text='Auto-populated when slug is regenerated. Used to redirect old URLs.'
            ),
        ),
        migrations.RunPython(
            fix_redirect_url_and_set_previous_slug,
            reverse_code=reverse_migration,
        ),
    ]
