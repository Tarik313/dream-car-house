from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0041_sitesettings_footer_cta'),
    ]

    operations = [
        migrations.AddField(
            model_name='preferencecategory',
            name='featured_vehicle_ids',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='List of up to 3 Inventory IDs to showcase under this category on the homepage.',
                verbose_name='Featured Vehicle IDs (Max 3)',
            ),
        ),
    ]
