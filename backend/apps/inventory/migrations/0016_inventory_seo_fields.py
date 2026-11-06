from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0015_inventory_slightly_negotiable'),
    ]

    operations = [
        # Inventory SEO fields
        migrations.AddField(
            model_name='inventory',
            name='meta_title',
            field=models.CharField(blank=True, max_length=70, verbose_name='Meta Title'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='meta_description',
            field=models.TextField(blank=True, max_length=160, verbose_name='Meta Description'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, unique=True, null=True, verbose_name='URL Slug'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='redirect_url',
            field=models.CharField(blank=True, max_length=500, null=True, verbose_name='301 Redirect URL'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='canonical_url',
            field=models.CharField(blank=True, max_length=500, verbose_name='Canonical URL'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='schema_override',
            field=models.JSONField(blank=True, null=True, verbose_name='Schema Override (JSON-LD)'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='h1_title',
            field=models.CharField(blank=True, max_length=200, verbose_name='H1 Title'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='featured_image_alt',
            field=models.CharField(blank=True, max_length=200, verbose_name='Featured Image Alt Text'),
        ),
        migrations.AddField(
            model_name='inventory',
            name='indexing',
            field=models.CharField(choices=[('index', 'Index'), ('noindex', 'No Index')], default='index', max_length=10, verbose_name='Indexing'),
        ),
        # InventoryImage new fields
        migrations.AddField(
            model_name='inventoryimage',
            name='alt_text',
            field=models.CharField(blank=True, max_length=200, verbose_name='Alt Text'),
        ),
        migrations.AddField(
            model_name='inventoryimage',
            name='order',
            field=models.PositiveIntegerField(default=0, verbose_name='Display Order'),
        ),
        migrations.AlterModelOptions(
            name='inventoryimage',
            options={'ordering': ['order'], 'verbose_name': 'Inventory Image', 'verbose_name_plural': 'Inventory Images'},
        ),
    ]
