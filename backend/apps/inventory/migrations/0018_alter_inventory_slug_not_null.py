from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0017_populate_seo_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inventory',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, unique=True, verbose_name='URL Slug'),
        ),
    ]
