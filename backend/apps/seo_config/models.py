from django.db import models
from django.utils.translation import gettext_lazy as _

from tinymce.models import HTMLField


class SEOConfig(models.Model):
    """
    Per-page SEO configuration managed from the Django admin.
    One record per page — enforced by unique=True on the page field.
    """

    class PageChoices(models.TextChoices):
        HOME = 'home', _('Home')
        GALLERY = 'gallery', _('Gallery')
        ABOUT = 'about', _('About Us')
        SELL = 'sell', _('Sell Your Car')
        BYD = 'byd-cars', _('BYD')
        CONTACT = 'contact', _('Contact Us')

    class RobotsChoices(models.TextChoices):
        INDEX_FOLLOW = 'index, follow', _('index, follow')
        NOINDEX_FOLLOW = 'noindex, follow', _('noindex, follow')
        INDEX_NOFOLLOW = 'index, nofollow', _('index, nofollow')
        NOINDEX_NOFOLLOW = 'noindex, nofollow', _('noindex, nofollow')

    class OGTypeChoices(models.TextChoices):
        WEBSITE = 'website', _('website')
        ARTICLE = 'article', _('article')

    class TwitterCardChoices(models.TextChoices):
        SUMMARY_LARGE = 'summary_large_image', _('summary_large_image')
        SUMMARY = 'summary', _('summary')

    class VisibilityChoices(models.TextChoices):
        PUBLISHED = 'PUBLISHED', _('Published')
        HIDDEN = 'HIDDEN', _('Hidden')

    # --- Page identifier ---
    page = models.CharField(
        max_length=50,
        choices=PageChoices.choices,
        unique=True,
        verbose_name=_('Page'),
        help_text=_('The page this SEO configuration applies to.'),
    )

    # --- Visibility ---
    visibility = models.CharField(
        max_length=10,
        choices=VisibilityChoices.choices,
        default=VisibilityChoices.PUBLISHED,
        verbose_name=_('Visibility'),
        help_text=_('Hidden pages return a 404 and are removed from the sitemap.'),
    )

    # --- Target keyword ---
    target_keyword = models.CharField(
        max_length=120,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Target / Primary Keyword'),
        help_text=_('The single primary keyword this page is optimised for.'),
    )

    # --- Feature image (used for social sharing) ---
    feature_image = models.ImageField(
        upload_to='seo/feature/',
        blank=True,
        null=True,
        verbose_name=_('Feature Image'),
        help_text=_(
            'Image shown when this page is shared on social media '
            '(recommended: 1200×630 px). Used for both Open Graph and Twitter '
            'unless overridden below.'
        ),
    )
    feature_image_alt = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Feature Image ALT Text'),
        help_text=_('Describes the feature image for screen readers and search engines.'),
    )

    # --- Basic meta tags ---
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Meta Title'),
        help_text=_('Page title shown in browser tab and search results (max 70 chars).'),
    )
    meta_description = models.TextField(
        max_length=500,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Meta Description'),
        help_text=_('Brief page description for search engines (max 500 chars).'),
    )
    meta_keywords = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Meta Keywords'),
        help_text=_('Comma-separated keywords (optional).'),
    )

    # --- Robots ---
    robots = models.CharField(
        max_length=50,
        choices=RobotsChoices.choices,
        blank=True,
        null=True,
        default=RobotsChoices.INDEX_FOLLOW,
        verbose_name=_('Robots'),
        help_text=_('Controls search engine indexing and link following.'),
    )

    # --- Canonical URL ---
    canonical_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Canonical URL'),
        help_text=_('Preferred URL for this page (e.g. https://dreamcarhouse.com/).'),
    )

    # --- Open Graph ---
    og_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('OG Title'),
        help_text=_('Title shown when the page is shared on social media.'),
    )
    og_description = models.TextField(
        max_length=500,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('OG Description'),
        help_text=_('Description shown when the page is shared on social media.'),
    )
    og_image = models.ImageField(
        upload_to='seo/og/',
        blank=True,
        null=True,
        verbose_name=_('OG Image'),
        help_text=_('Image shown when the page is shared (recommended: 1200×630 px).'),
    )
    og_type = models.CharField(
        max_length=50,
        choices=OGTypeChoices.choices,
        blank=True,
        null=True,
        default=OGTypeChoices.WEBSITE,
        verbose_name=_('OG Type'),
    )
    og_site_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default='Dream Car House',
        verbose_name=_('OG Site Name'),
    )

    # --- Twitter Card ---
    twitter_card = models.CharField(
        max_length=50,
        choices=TwitterCardChoices.choices,
        blank=True,
        null=True,
        default=TwitterCardChoices.SUMMARY_LARGE,
        verbose_name=_('Twitter Card Type'),
    )
    twitter_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Twitter Title'),
        help_text=_('Overrides OG title specifically for Twitter/X.'),
    )
    twitter_description = models.TextField(
        max_length=500,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Twitter Description'),
        help_text=_('Overrides OG description specifically for Twitter/X.'),
    )
    twitter_image = models.ImageField(
        upload_to='seo/twitter/',
        blank=True,
        null=True,
        verbose_name=_('Twitter Image'),
        help_text=_('Overrides OG image specifically for Twitter/X.'),
    )

    # --- JSON-LD Schema ---
    schema_json = models.JSONField(
        blank=True,
        null=True,
        verbose_name=_('JSON-LD Schema'),
        help_text=_('Optional custom JSON-LD structured data (schema.org).'),
    )

    # --- Timestamps ---
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('SEO configuration for general pages')
        verbose_name_plural = _('SEO configuration for general pages')
        ordering = ['page']

    def __str__(self):
        return f'SEO Config — {self.get_page_display()}'


class CategoryPageSEO(models.Model):
    """
    SEO + on-page content for the car listing ("category") pages, plus the
    brand index page.

    These pages render a grid of cars or brands, so in addition to the SEO
    fields they carry editorial copy: an H1, a short intro shown near the
    top, and a long description shown near the bottom, before the footer.
    """

    class PageChoices(models.TextChoices):
        ALL_CARS = 'cars', _('All Cars  (/cars)')
        BRAND_NEW = 'brand-new', _('Brand New  (/cars/brand-new)')
        PRE_OWNED = 'pre-owned', _('Pre-Owned  (/cars/pre-owned)')
        BRAND_INDEX = 'brand', _('Brand Index  (/cars/brand)')

    class RobotsChoices(models.TextChoices):
        INDEX_FOLLOW = 'index, follow', _('Index & follow')
        INDEX_NOFOLLOW = 'index, nofollow', _('Index & nofollow')
        NOINDEX_NOFOLLOW = 'noindex, nofollow', _('Noindex & nofollow')

    class VisibilityChoices(models.TextChoices):
        PUBLISHED = 'PUBLISHED', _('Published')
        HIDDEN = 'HIDDEN', _('Hidden')

    # --- Identity ---
    page = models.CharField(
        max_length=50,
        choices=PageChoices.choices,
        unique=True,
        verbose_name=_('Page'),
        help_text=_('Which listing page this configuration applies to.'),
    )
    category_name = models.CharField(
        max_length=120,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Category Name'),
        help_text=_('Display name for this category, e.g. "Brand New Cars".'),
    )
    visibility = models.CharField(
        max_length=10,
        choices=VisibilityChoices.choices,
        default=VisibilityChoices.PUBLISHED,
        verbose_name=_('Visibility'),
        help_text=_('Hidden pages return a 404 and are removed from the sitemap.'),
    )

    # --- Feature image (social sharing) ---
    feature_image = models.ImageField(
        upload_to='seo/category/',
        blank=True,
        null=True,
        verbose_name=_('Feature Image'),
        help_text=_('Image shown when this page is shared on social media (recommended: 1200×630 px).'),
    )
    feature_image_alt = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Feature Image ALT Text'),
    )

    # --- Search meta ---
    target_keyword = models.CharField(
        max_length=120,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Target / Primary Keyword'),
        help_text=_('The single primary keyword this page is optimised for.'),
    )
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Meta Title'),
        help_text=_('Shown in the browser tab and search results (max 70 chars).'),
    )
    meta_description = models.TextField(
        max_length=500,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Meta Description'),
        help_text=_('Brief description for search engines (max 500 chars).'),
    )
    canonical_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('Canonical URL'),
        help_text=_('Preferred URL for this page, e.g. https://dreamcarhouse.com/cars/.'),
    )
    robots = models.CharField(
        max_length=50,
        choices=RobotsChoices.choices,
        default=RobotsChoices.INDEX_FOLLOW,
        verbose_name=_('Indexing Status'),
        help_text=_('Controls search engine indexing and link following.'),
    )
    schema_json = models.JSONField(
        blank=True,
        null=True,
        verbose_name=_('JSON-LD Schema'),
        help_text=_('Optional custom schema.org structured data.'),
    )

    # --- On-page content ---
    h1_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        default=None,
        verbose_name=_('H1 Title'),
        help_text=_('Main heading shown on the page. Separate from the Meta Title.'),
    )
    short_description = HTMLField(
        blank=True,
        null=True,
        verbose_name=_('Short Description'),
        help_text=_('Shown near the top of the page, above the main content '
                    '(the car grid, or the brand groups on the Brand Index).'),
    )
    long_description = HTMLField(
        blank=True,
        null=True,
        verbose_name=_('Long / Detailed Description'),
        help_text=_('Shown near the bottom of the page, before the footer. '
                    'Collapsed behind a "See more" toggle when long.'),
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('SEO configuration for category pages')
        verbose_name_plural = _('SEO configuration for category pages')
        db_table = 'tbl_category_page_seo'
        ordering = ['page']

    def __str__(self):
        return f'Category SEO — {self.get_page_display()}'
