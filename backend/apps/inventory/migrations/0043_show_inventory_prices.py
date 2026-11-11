from decimal import Decimal
from django.db import migrations


def enable_public_price_display(apps, schema_editor):
    Inventory = apps.get_model("inventory", "Inventory")
    Inventory.objects.filter(
        price__isnull=False,
        price__gt=Decimal("0"),
        is_call_for_price=True,
    ).update(is_call_for_price=False)


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0042_repair_car_seo_metadata"),
    ]

    operations = [
        migrations.RunPython(enable_public_price_display, migrations.RunPython.noop),
    ]
