from django.contrib import admin
from apps.seo_config.models import SEOConfig, CategoryPageSEO


@admin.register(SEOConfig)
class SEOConfigAdmin(admin.ModelAdmin):
    list_display = ['get_page_display', 'meta_title', 'robots', 'visibility', 'updated_at']
    list_display_links = ['get_page_display', 'meta_title']
    list_filter = ['visibility', 'robots']
    readonly_fields = ['updated_at']

    fieldsets = (
        ('Page', {
            'fields': ('page', 'visibility'),
        }),
        ('Basic Meta Tags', {
            'fields': (
                'target_keyword', 'meta_title', 'meta_description',
                'meta_keywords', 'robots', 'canonical_url',
            ),
            'description': 'Core HTML meta tags used by all search engines.',
        }),
        ('Feature Image (social sharing)', {
            'fields': ('feature_image', 'feature_image_alt'),
            'description': 'Shown when this page is shared on social media. '
                           'Used for both Open Graph and Twitter unless overridden below.',
        }),
        ('Open Graph (Facebook / LinkedIn / WhatsApp)', {
            'classes': ('collapse',),
            'fields': ('og_title', 'og_description', 'og_image', 'og_type', 'og_site_name'),
            'description': 'Optional per-platform overrides. Leave the image blank to use the Feature Image.',
        }),
        ('Twitter / X Card', {
            'classes': ('collapse',),
            'fields': ('twitter_card', 'twitter_title', 'twitter_description', 'twitter_image'),
            'description': 'Optional per-platform overrides. Leave the image blank to use the Feature Image.',
        }),
        ('Structured Data (JSON-LD)', {
            'fields': ('schema_json',),
            'description': 'Optional custom schema.org JSON-LD block for rich search results.',
        }),
        ('Timestamps', {
            'fields': ('updated_at',),
        }),
    )

    def get_page_display(self, obj):
        return obj.get_page_display()
    get_page_display.short_description = 'Page'
    get_page_display.admin_order_field = 'page'


@admin.register(CategoryPageSEO)
class CategoryPageSEOAdmin(admin.ModelAdmin):
    list_display = ['get_page_display', 'category_name', 'h1_title', 'robots', 'visibility', 'updated_at']
    list_display_links = ['get_page_display', 'category_name']
    list_filter = ['visibility', 'robots']
    readonly_fields = ['updated_at']

    fieldsets = (
        ('Page', {
            'fields': ('page', 'category_name', 'visibility'),
        }),
        ('On-Page Content', {
            'fields': ('h1_title', 'short_description', 'long_description'),
            'description': 'H1 heading, the intro shown above the car grid, and the '
                           'detailed text shown below the pagination.',
        }),
        ('Search Meta', {
            'fields': (
                'target_keyword', 'meta_title', 'meta_description',
                'canonical_url', 'robots',
            ),
        }),
        ('Feature Image (social sharing)', {
            'fields': ('feature_image', 'feature_image_alt'),
            'description': 'Shown when this page is shared on social media.',
        }),
        ('Structured Data (JSON-LD)', {
            'classes': ('collapse',),
            'fields': ('schema_json',),
        }),
        ('Timestamps', {
            'fields': ('updated_at',),
        }),
    )

    def get_page_display(self, obj):
        return obj.get_page_display()
    get_page_display.short_description = 'Page'
    get_page_display.admin_order_field = 'page'
