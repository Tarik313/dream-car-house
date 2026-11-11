from django.db import migrations


def repair_car_seo_metadata(apps, schema_editor):
    from apps.inventory.seo import (
        build_car_seo_for_instance,
        is_malformed_auto_alt,
        is_malformed_auto_seo_description,
        is_malformed_auto_seo_title,
    )

    Inventory = apps.get_model("inventory", "Inventory")
    qs = Inventory.objects.select_related("brand", "model", "body_style", "branch").all()

    for car in qs.iterator():
        generated = build_car_seo_for_instance(car)
        update_fields = []

        if not car.meta_title or is_malformed_auto_seo_title(car.meta_title):
            new_title = generated["meta_title"][:70]
            if car.meta_title != new_title:
                car.meta_title = new_title
                update_fields.append("meta_title")

        if not car.meta_description or is_malformed_auto_seo_description(car.meta_description):
            new_desc = generated["meta_description"][:500]
            if car.meta_description != new_desc:
                car.meta_description = new_desc
                update_fields.append("meta_description")

        if not car.featured_image_alt or is_malformed_auto_alt(car.featured_image_alt):
            new_alt = generated["featured_image_alt"][:200]
            if car.featured_image_alt != new_alt:
                car.featured_image_alt = new_alt
                update_fields.append("featured_image_alt")

        if update_fields:
            car.save(update_fields=update_fields)


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0041_alter_inventory_drive_type_and_more"),
    ]

    operations = [
        migrations.RunPython(repair_car_seo_metadata, migrations.RunPython.noop),
    ]

