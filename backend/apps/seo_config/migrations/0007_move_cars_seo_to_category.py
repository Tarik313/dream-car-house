from django.db import migrations


# Fields that exist on both models and can be copied straight across.
SHARED_FIELDS = [
    'visibility',
    'target_keyword',
    'feature_image',
    'feature_image_alt',
    'meta_title',
    'meta_description',
    'canonical_url',
    'schema_json',
]

# SEOConfig allowed 'noindex, follow'; CategoryPageSEO does not, so map it
# onto the closest valid value rather than writing an invalid choice.
ROBOTS_FALLBACK = {'noindex, follow': 'noindex, nofollow'}


def move_cars_config(apps, schema_editor):
    """'cars' moved out of SEOConfig into CategoryPageSEO — carry the row over."""
    SEOConfig = apps.get_model('seo_config', 'SEOConfig')
    CategoryPageSEO = apps.get_model('seo_config', 'CategoryPageSEO')

    old = SEOConfig.objects.filter(page='cars').first()
    if not old:
        return

    if not CategoryPageSEO.objects.filter(page='cars').exists():
        values = {f: getattr(old, f) for f in SHARED_FIELDS}
        robots = old.robots or 'index, follow'
        values['robots'] = ROBOTS_FALLBACK.get(robots, robots)
        CategoryPageSEO.objects.create(page='cars', **values)

    old.delete()


def restore_cars_config(apps, schema_editor):
    """Reverse: move it back so the migration is not one-way."""
    SEOConfig = apps.get_model('seo_config', 'SEOConfig')
    CategoryPageSEO = apps.get_model('seo_config', 'CategoryPageSEO')

    current = CategoryPageSEO.objects.filter(page='cars').first()
    if not current or SEOConfig.objects.filter(page='cars').exists():
        return

    values = {f: getattr(current, f) for f in SHARED_FIELDS}
    values['robots'] = current.robots
    SEOConfig.objects.create(page='cars', **values)


class Migration(migrations.Migration):

    dependencies = [
        ('seo_config', '0006_categorypageseo_alter_seoconfig_page'),
    ]

    operations = [
        migrations.RunPython(move_cars_config, restore_cars_config),
    ]
