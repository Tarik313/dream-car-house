from django.db import migrations, models


def populate_model_name(apps, schema_editor):
    Inventory = apps.get_model("inventory", "Inventory")

    batch = []
    for inventory in Inventory.objects.select_related("model").all().iterator():
        inventory.model_name = inventory.model.model if inventory.model_id and inventory.model else ""
        batch.append(inventory)
        if len(batch) >= 500:
            Inventory.objects.bulk_update(batch, ["model_name"])
            batch.clear()

    if batch:
        Inventory.objects.bulk_update(batch, ["model_name"])


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0027_alter_inventory_slug"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventory",
            name="model_name",
            field=models.CharField(blank=True, default="", max_length=255, verbose_name="Model Name"),
        ),
        migrations.RunPython(populate_model_name, migrations.RunPython.noop),
    ]
