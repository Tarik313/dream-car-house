from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0024_alter_brand_image_alter_inventory_meta_description_and_more"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="bodystyle",
            index=models.Index(fields=["status"], name="tbl_body_st_status_2512df_idx"),
        ),
        migrations.AddIndex(
            model_name="brand",
            index=models.Index(fields=["status"], name="tbl_brand_status_1cfa4c_idx"),
        ),
        migrations.AddIndex(
            model_name="inventory",
            index=models.Index(fields=["status", "registered"], name="tbl_invento_status_f3181a_idx"),
        ),
        migrations.AddIndex(
            model_name="inventory",
            index=models.Index(fields=["status", "car_type"], name="tbl_invento_status_8f9f3f_idx"),
        ),
        migrations.AddIndex(
            model_name="inventory",
            index=models.Index(fields=["status", "price"], name="tbl_invento_status_954ac2_idx"),
        ),
        migrations.AddIndex(
            model_name="inventory",
            index=models.Index(fields=["status", "created_at"], name="tbl_invento_status_0a0ecd_idx"),
        ),
        migrations.AddIndex(
            model_name="modelgeneration",
            index=models.Index(fields=["status"], name="tbl_model_g_status_dfb58c_idx"),
        ),
    ]
