from django.db import migrations
from django.utils.text import slugify


def populate_seo_fields(apps, schema_editor):
    Inventory = apps.get_model('inventory', 'Inventory')
    InventoryImage = apps.get_model('inventory', 'InventoryImage')

    # Track used slugs to avoid duplicates
    used_slugs = set(
        Inventory.objects.exclude(slug__isnull=True)
        .exclude(slug='')
        .values_list('slug', flat=True)
    )

    for inv in Inventory.objects.all():
        changed = False
        brand_name = str(inv.brand) if inv.brand_id else ''
        model_name = str(inv.model) if inv.model_id else ''
        body_style_name = str(inv.body_style) if inv.body_style_id else ''
        year = inv.year or ''
        color = inv.color or ''
        engine = inv.engine_capacity or ''
        mileage = inv.mileage or ''
        price = inv.price or ''

        # Generate slug
        if not inv.slug:
            base_slug = slugify(f"{year}-{brand_name}-{model_name}-{engine}cc-{color}")
            if not base_slug:
                base_slug = slugify(inv.name) or 'car'
            slug = base_slug
            counter = 2
            while slug in used_slugs:
                slug = f"{base_slug}-{counter}"
                counter += 1
            inv.slug = slug
            used_slugs.add(slug)
            changed = True

        # Generate meta_title
        if not inv.meta_title:
            variant = f"{engine}cc" if engine else ''
            parts = [str(year), brand_name, model_name, variant, body_style_name]
            title_base = ' '.join(p for p in parts if p).strip()
            inv.meta_title = f"{title_base} for Sale | Beg Autos"[:70]
            changed = True

        # Generate meta_description
        if not inv.meta_description:
            price_str = ''
            if price:
                try:
                    price_str = f"BDT {int(float(str(price))):,}"
                except (ValueError, TypeError):
                    price_str = str(price)
            desc = f"Buy this {year} {brand_name} {model_name} in {color} for {price_str}. {mileage}km driven. View full details on Beg Autos."
            inv.meta_description = desc[:160]
            changed = True

        # Generate h1_title
        if not inv.h1_title:
            variant = f"{engine}cc" if engine else ''
            parts = [str(year), brand_name, model_name, variant, body_style_name]
            if color:
                parts.append(f"in {color}")
            inv.h1_title = ' '.join(p for p in parts if p).strip()[:200]
            changed = True

        # Generate canonical_url
        if not inv.canonical_url:
            inv.canonical_url = f"https://bigautos.com/cars/{inv.slug}/"
            changed = True

        # Generate featured_image_alt
        if not inv.featured_image_alt:
            inv.featured_image_alt = f"Front view of {year} {brand_name} {model_name} in {color}".strip()[:200]
            changed = True

        # Set indexing based on status/availability
        if inv.registered == 'Sold' or inv.status in ('UNPUBLISHED', 'ARCHIVED'):
            inv.indexing = 'noindex'
            changed = True

        if changed:
            inv.save()

    # Set order=1 for gallery images with order=0
    InventoryImage.objects.filter(order=0).update(order=1)

    # Auto-generate alt_text for gallery images
    for img in InventoryImage.objects.filter(alt_text=''):
        try:
            inv = img.inventory
            year = inv.year or ''
            brand_name = str(inv.brand) if inv.brand_id else ''
            model_name = str(inv.model) if inv.model_id else ''
            color = inv.color or ''
            img.alt_text = f"View of {year} {brand_name} {model_name} in {color}".strip()[:200]
            img.save()
        except Exception:
            pass


def reverse_seo_fields(apps, schema_editor):
    # No-op reverse — we don't want to delete generated data
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0016_inventory_seo_fields'),
    ]

    operations = [
        migrations.RunPython(populate_seo_fields, reverse_seo_fields),
    ]
