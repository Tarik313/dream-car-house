from django.db import migrations


# indexing moved from 2 values to 3 full robots directives.
# Existing rows hold the old short values and must be converted, otherwise
# the sitemap and the robots meta tag stop recognising them.
FORWARD_MAP = {
    'index': 'index, follow',
    'noindex': 'noindex, nofollow',
}

REVERSE_MAP = {
    'index, follow': 'index',
    'index, nofollow': 'index',
    'noindex, nofollow': 'noindex',
}


def convert(apps, schema_editor, mapping, default):
    Inventory = apps.get_model('inventory', 'Inventory')
    for old_value, new_value in mapping.items():
        Inventory.objects.filter(indexing=old_value).update(indexing=new_value)

    # Anything unrecognised (blank, legacy junk) gets the safe default so no
    # row is left holding a value outside the field's choices.
    Inventory.objects.exclude(indexing__in=set(mapping.values())).update(
        indexing=default
    )


def forwards(apps, schema_editor):
    convert(apps, schema_editor, FORWARD_MAP, 'index, follow')


def backwards(apps, schema_editor):
    convert(apps, schema_editor, REVERSE_MAP, 'index')


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0035_inventory_h1_title_inventory_target_keyword_and_more'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
