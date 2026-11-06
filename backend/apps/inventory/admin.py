from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from apps.inventory.models import (
    Brand, ModelGeneration, BodyStyle, Inventory, InventoryImage, Stock, InventoryQuote
)

class InventoryAdminForm(forms.ModelForm):
    class Meta:
        model = Inventory
        fields = '__all__'
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'slug' in self.fields:
            self.fields['slug'].required = False
            self.fields['slug'].help_text = "Leave blank to auto-generate from car details. If provided, must be unique."

    def clean_slug(self):
        slug = self.cleaned_data.get('slug')
        if slug:
            qs = Inventory.objects.filter(slug=slug)
            if self.instance and self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise ValidationError("This slug is already in use. Please provide a unique slug.")
        return slug

class InventoryImageInline(admin.TabularInline):
    model = InventoryImage
    extra = 1
    fields = ['image', 'image_preview', 'caption', 'alt_text', 'order']
    readonly_fields = ['image_preview']
    ordering = ['order']

    @admin.display(description='Preview')
    def image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" style="max-height:120px; max-width:180px; object-fit:cover; border-radius:6px;" />',
                obj.image.url,
            )
        return '-'

    class Media:
        js = ('inventory/js/admin_image_preview.js',)


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    form = InventoryAdminForm
    list_display = [
        'name', 'car_type', 'brand', 'model', 'fuel_type', 'transmission', 'year', 'condition', 'registered',
        'slightly_negotiable', 'status', 'slug', 'indexing', 'meta_title'
    ]
    list_filter = [
        'car_type', 'brand', 'model', 'fuel_type', 'transmission', 'year', 'condition', 'registered', 'status',
        'indexing'
    ]
    search_fields = ['name', 'description', 'slug', 'meta_title']
    inlines = [InventoryImageInline]
    readonly_fields = ['feature_image_preview']

    fieldsets = (
        ('General', {
            'fields': (
                'name', 'car_type', 'brand', 'model', 'year', 'engine_capacity',
                'fuel_type', 'mileage', 'price', 'transmission', 'drive_type',
                'wheel_base', 'color', 'condition', 'registered', 'body_style',
                'feature_image', 'feature_image_preview', 'description', 'youtube', 'is_featured',
                'inventory_type', 'slightly_negotiable', 'status',
            )
        }),
        ('SEO Settings', {
            'fields': (
                'h1_title', 'target_keyword',
                'meta_title', 'meta_description',
                'slug', 'canonical_url',
                'featured_image_alt', 'indexing',
                'redirect_url', 'previous_slug',
                'schema_override',
            )
        }),
    )

    @admin.display(description='Feature Image Preview')
    def feature_image_preview(self, obj):
        if obj and obj.feature_image:
            return format_html(
                '<img src="{}" style="max-height:180px; max-width:280px; object-fit:cover; border-radius:8px;" />',
                obj.feature_image.url,
            )
        return '-'

    class Media:
        js = ('inventory/js/admin_image_preview.js',)

# @admin.register(InventoryImage)
# class InventoryImageAdmin(admin.ModelAdmin):
#     list_display = ['inventory', 'caption', 'image']
#     search_fields = ['caption']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'segment', 'image', 'status']
    list_filter = ['segment', 'status']
    search_fields = ['name']
    readonly_fields = ['seo_updated_at']

    fieldsets = (
        ('General', {
            'fields': ('name', 'segment', 'image', 'listing_footer_text', 'status'),
        }),
        ('On-Page Content', {
            'fields': ('h1_title', 'short_description', 'long_description'),
            'description': 'H1 heading, the intro shown above the car grid, and the '
                           'detailed text shown below pagination on this brand\'s '
                           'listing page (/cars/brand/&lt;slug&gt;).',
        }),
        ('Search Meta', {
            'fields': (
                'target_keyword', 'meta_title', 'meta_description',
                'canonical_url', 'robots',
            ),
        }),
        ('Feature Image (social sharing)', {
            'fields': ('feature_image', 'feature_image_alt'),
            'description': 'Shown when this brand\'s listing page is shared on social media.',
        }),
        ('Structured Data (JSON-LD)', {
            'classes': ('collapse',),
            'fields': ('schema_json',),
        }),
        ('Timestamps', {
            'fields': ('seo_updated_at',),
        }),
    )


@admin.register(ModelGeneration)
class ModelGenerationAdmin(admin.ModelAdmin):
    list_display = ['brand', 'model', 'status']


@admin.register(BodyStyle)
class BodyStyleAdmin(admin.ModelAdmin):
    list_display = ['body', 'status']


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'created_at']
    ordering = ('-created_at',)


@admin.register(InventoryQuote)
class InventoryQuoteAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'car', 'created_at']
    ordering = ('-created_at',)
