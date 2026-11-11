from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from django.utils.text import slugify

from tinymce.models import HTMLField

from base.models import BaseModel
from core.utils import images_path_dir


class Inventory(BaseModel):
    CANONICAL_BASE_URL = "https://dreamcarhouse.com"

    class AvailabilityChoices(models.TextChoices):
        AVAILABLE = "Available", _("Available")
        SOLD = "Sold", _("Sold")
        BOOKED = "Booked", _("Booked")
        PRE_ORDER = "Pre-Order", _("Pre-Order")

    class CarTypeChooser(models.TextChoices):
        RECOMMENDATION = 'RECONDITIONED', _('RECONDITIONED')
        BRAND_NEW = 'BRAND_NEW', _('BRAND NEW')
        PRE_OWNED = 'PRE_OWNED', _('PRE OWNED')

    class ConditionChoices(models.TextChoices):
        NEW = 'NEW', _('NEW')
        USED = 'USED', _('USED')

    class TransmissionChoices(models.TextChoices):
        MANUAL = 'MANUAL', _('MANUAL')
        AUTOMATIC = 'AUTOMATIC', _('AUTOMATIC')

    class FuelTypeChoices(models.TextChoices):
        PETROL = 'PETROL', _('PETROL')
        DIESEL = 'DIESEL', _('DIESEL')
        OCTANE = 'OCTANE', _('OCTANE')
        ELECTRIC = 'ELECTRIC', _('ELECTRIC')
        HYBRID = 'HYBRID', _('HYBRID')
        PETROL_HYBRID = 'PETROL+HYBRID', _('PETROL+HYBRID')
        DIESEL_HYBRID = 'DIESEL+HYBRID', _('DIESEL+HYBRID')
        OCTANE_HYBRID = 'OCTANE+HYBRID', _('OCTANE+HYBRID')
        CNG_HYBRID = 'CNG+HYBRID', _('CNG+HYBRID')
        LPG_HYBRID = 'LPG+HYBRID', _('LPG+HYBRID')
        PETROL_PHEV = 'PETROL+PLUG-IN HYBRID', _('PETROL+PHEV')
        DIESEL_PHEV = 'DIESEL+PLUG-IN HYBRID', _('DIESEL+PHEV')
        OCTANE_PHEV = 'OCTANE+PLUG-IN HYBRID', _('OCTANE+PHEV')
        CNG_PHEV = 'CNG+PLUG-IN HYBRID', _('CNG+PHEV')
        LPG_PHEV = 'LPG+PLUG-IN HYBRID', _('LPG+PHEV')
        CNG = 'CNG', _('CNG')
        LPG = 'LPG', _('LPG')
        ETHANOL = 'ETHANOL', _('ETHANOL')
        HYDROGEN = 'HYDROGEN', _('HYDROGEN')
        BIO_DIESEL = 'BIO-DIESEL', _('BIO-DIESEL')
        FLEX_FUEL = 'FLEX-FUEL', _('FLEX-FUEL')
        OTHERS = 'OTHERS', _('OTHERS')

    class InventoryTypeChoices(models.TextChoices):
        LUXURY = 'LUXURY', _('LUXURY')
        BUDGET_FRIENDLY = 'BUDGET FRIENDLY', _('BUDGET FRIENDLY')

    class SlightlyNegotiable(models.TextChoices):
        YES = "YES", _("YES")
        NO = "NO", _("NO")

    name = models.CharField(
        max_length=100,
        verbose_name=_("Name")
    )
    car_type = models.CharField(
        max_length=25,
        choices=CarTypeChooser.choices,
        null=True,
        blank=True,
        verbose_name=_("Car Type")
    )
    brand = models.ForeignKey(
        'inventory.Brand',
        on_delete=models.CASCADE,
        related_name='inventories_brand',
        verbose_name=_("Brand")
    )
    model = models.ForeignKey(
        'inventory.ModelGeneration',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventories_model',
        verbose_name=_("Model Generation")
    )
    model_name = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name=_("Model Name")
    )
    year = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_("Reg. Year")
    )
    engine_capacity = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Engine Capacity (cc)")
    )
    fuel_type = models.CharField(
        max_length=30,
        choices=FuelTypeChoices.choices,
        verbose_name=_("Fuel Type")
    )
    mileage = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name=_("Mileage")
    )
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_("Price (BDT)")
    )
    transmission = models.CharField(
        max_length=20,
        choices=TransmissionChoices.choices,
        verbose_name=_("Transmission")
    )
    drive_type = models.CharField(
        max_length=150,
        verbose_name=_("Drive Type/Train"),
        blank=True,
        null=True
    )
    wheel_base = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        verbose_name=_("Wheel")
    )
    color = models.CharField(
        max_length=30,
        verbose_name=_("Color/Exterior"),
        blank=True,
        null=True
    )
    condition = models.CharField(
        max_length=10,
        choices=ConditionChoices.choices,
        verbose_name=_("Condition")
    )
    registered = models.CharField(
        max_length=12,
        choices=AvailabilityChoices.choices,
        default=AvailabilityChoices.AVAILABLE,
        verbose_name=_("Availability")
    )
    body_style = models.ForeignKey(
        'inventory.BodyStyle',
        on_delete=models.SET_NULL,
        related_name='inventories_body_style',
        verbose_name=_("Body Style"),
        blank=True,
        null=True
    )
    branch = models.ForeignKey(
        'home.ShowroomBranch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventories',
        verbose_name=_("Showroom Branch")
    )
    is_call_for_price = models.BooleanField(
        default=False,
        verbose_name=_("Call for Price / VIP Valuation")
    )
    registration_number = models.CharField(
        max_length=100,
        blank=True,
        default='',
        verbose_name=_("Registration Number / Paper Details")
    )
    feature_image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        validators=[FileExtensionValidator(
            ['jpg', 'jpeg', 'png', 'webp']
        )],
        help_text=_("jpg, jpeg, png, webp"),
        null=True,
        blank=True,
        verbose_name=_("Image")
    )
    description = HTMLField(
        blank=True,
        null=True,
        verbose_name=_("Description")
    )
    youtube = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name=_("Youtube URL")
    )
    is_featured = models.BooleanField(
        default=False,
        verbose_name=_("Is Featured?")
    )
    inventory_type = models.CharField(
        max_length=20,
        choices=InventoryTypeChoices.choices,
        default=InventoryTypeChoices.BUDGET_FRIENDLY,
        verbose_name=_("Inventory Type")
    )
    slightly_negotiable = models.CharField(
        max_length=5,
        choices=SlightlyNegotiable.choices,
        default=SlightlyNegotiable.YES,
        verbose_name=_("Is Slightly Negotiable?")
    )

    status = models.CharField(
        max_length=12,
        choices=BaseModel.StatusChoices.choices,
        default=BaseModel.StatusChoices.PUBLISHED,
        verbose_name=_("Status")
    )

    # ── SEO Fields ──────────────────────────────────────────────
    h1_title = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("H1 Title"),
        help_text=_(
            "Main heading shown on the car page, separate from Name. "
            'e.g. "2022 Honda CR-V 1.5L Turbo SUV in Gloss Red". '
            "Leave blank to fall back to Name."
        )
    )
    target_keyword = models.CharField(
        max_length=120,
        blank=True,
        verbose_name=_("Target / Primary Keyword"),
        help_text=_("The single primary keyword this car page is optimised for.")
    )
    meta_title = models.CharField(
        max_length=70,
        blank=True,
        verbose_name=_("Meta Title"),
        help_text=_("Browser tab title (max 70 chars). Leave blank to auto-generate.")
    )
    meta_description = models.TextField(
        max_length=500,
        blank=True,
        verbose_name=_("Meta Description"),
        help_text=_("Search result snippet (max 500 chars). Leave blank to auto-generate.")
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        db_index=True,
        blank=False,
        null=False,
        verbose_name=_("URL Slug")
    )
    redirect_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name=_("301 Redirect URL")
    )
    canonical_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_("Canonical URL")
    )
    schema_override = models.JSONField(
        blank=True,
        null=True,
        verbose_name=_("Schema Override (JSON-LD)")
    )
    featured_image_alt = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_("Featured Image Alt Text"),
        help_text=_("Alt text for the feature image. Leave blank to auto-generate from car details.")
    )

    class IndexingChoices(models.TextChoices):
        INDEX_FOLLOW = "index, follow", _("Index & follow")
        INDEX_NOFOLLOW = "index, nofollow", _("Index & nofollow")
        NOINDEX_NOFOLLOW = "noindex, nofollow", _("Noindex & nofollow")

    indexing = models.CharField(
        max_length=20,
        choices=IndexingChoices.choices,
        default=IndexingChoices.INDEX_FOLLOW,
        verbose_name=_("Indexing Status"),
        help_text=_(
            "Value is emitted directly as the robots meta tag. Sold, "
            "unpublished, archived and unlisted cars are forced to "
            "'Noindex & nofollow' automatically."
        )
    )

    previous_slug = models.CharField(
        max_length=255,
        blank=True,
        default='',
        verbose_name=_("Previous Slug (for 301 redirect)"),
        help_text=_("Auto-populated when slug is regenerated. Enables 301 redirect from old URL.")
    )

    def _get_brand_name(self):
        return self.brand.name if self.brand_id and self.brand else ''

    def _get_model_name(self):
        return self.model_name or (self.model.model if self.model_id and self.model else '')

    def _get_body_style_name(self):
        return self.body_style.body if self.body_style_id and self.body_style else ''

    def _generate_unique_slug(self, base_str=None):
        if base_str:
            base_slug = slugify(base_str)
        else:
            from apps.inventory.seo import format_engine_capacity
            brand_name = self._get_brand_name()
            model_name = self._get_model_name()
            color = self.color or ''
            year = self.year or ''
            engine = format_engine_capacity(self.engine_capacity)
            base_slug = slugify(f"{year}-{brand_name}-{model_name}-{engine}-{color}")
            if not base_slug:
                base_slug = slugify(self.name) or 'car'
        slug = base_slug
        counter = 1
        while Inventory.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def _build_canonical_url(self, slug=None):
        effective_slug = slug or self.slug or ''
        return f"{self.CANONICAL_BASE_URL}/cars/{effective_slug}/"

    def save(self, *args, **kwargs):
        old_slug = ''
        old_canonical_url = ''
        if self.pk:
            try:
                previous = Inventory.objects.get(pk=self.pk)
                old_slug = previous.slug or ''
                old_canonical_url = previous.canonical_url or ''
            except Inventory.DoesNotExist:
                pass

        # Only auto-set indexing if admin has NOT manually changed it
        # If car is sold/unpublished/archived AND indexing is currently index → force noindex
        # If admin explicitly sets indexing = index, respect it always
        if (self.registered == self.AvailabilityChoices.SOLD or
                self.status == BaseModel.StatusChoices.UNPUBLISHED or
                self.status == BaseModel.StatusChoices.ARCHIVED or
                self.status == BaseModel.StatusChoices.UNLISTED):
            # NOTE: behaviour preserved 1:1 from the 2-choice version. This only
            # rewrites a value that is already a noindex variant, so in practice
            # it never downgrades an indexable car. See the "auto-noindex" note
            # raised alongside the 3-way indexing change.
            if self.indexing not in (
                self.IndexingChoices.INDEX_FOLLOW,
                self.IndexingChoices.INDEX_NOFOLLOW,
            ):
                self.indexing = self.IndexingChoices.NOINDEX_NOFOLLOW

        # Auto-generate slug
        if not self.slug:
            self.slug = self._generate_unique_slug()
        else:
            self.slug = self._generate_unique_slug(base_str=self.slug)

        if old_slug and self.slug and old_slug != self.slug and not self.previous_slug:
            self.previous_slug = old_slug

        brand_name = self._get_brand_name()
        # Normalize model_name: trim whitespace and uppercase (BYD cars enter e.g. "m20" → "M20")
        if self.model_name:
            self.model_name = self.model_name.strip().upper()
        # Auto-populate model_name from ModelGeneration FK only when not manually set
        if not self.model_name and self.model_id and self.model:
            self.model_name = self.model.model
        model_name = self.model_name
        body_style_name = self._get_body_style_name()
        year = self.year or ''
        color = self.color or ''
        engine = self.engine_capacity or ''
        mileage = self.mileage or ''
        price = self.price or ''

        from apps.inventory.seo import (
            build_car_meta_title,
            build_car_meta_description,
            build_featured_image_alt,
            is_malformed_auto_seo_title,
            is_malformed_auto_seo_description,
            is_malformed_auto_alt,
        )

        branch_name = ''
        if self.branch_id and self.branch:
            branch_name = self.branch.short_name or self.branch.name or ''

        # Auto-generate meta_title (or repair malformed legacy auto-generated titles)
        if not self.meta_title or is_malformed_auto_seo_title(self.meta_title):
            self.meta_title = build_car_meta_title(
                year=year,
                brand_name=brand_name,
                model_name=model_name,
                name=self.name or '',
                engine_capacity=engine,
                body_style=body_style_name,
            )[:70]

        # Auto-generate meta_description (or repair malformed legacy auto-generated descriptions)
        if not self.meta_description or is_malformed_auto_seo_description(self.meta_description):
            self.meta_description = build_car_meta_description(
                year=year,
                brand_name=brand_name,
                model_name=model_name,
                name=self.name or '',
                color=color,
                engine_capacity=engine,
                fuel_type=self.fuel_type or '',
                body_style=body_style_name,
                mileage=mileage,
                price=price,
                is_call_for_price=bool(self.is_call_for_price),
                branch_name=branch_name,
            )

        # Auto-generate featured_image_alt (or repair malformed legacy alt text)
        if not self.featured_image_alt or is_malformed_auto_alt(self.featured_image_alt):
            self.featured_image_alt = build_featured_image_alt(
                year=year,
                brand_name=brand_name,
                model_name=model_name,
                name=self.name or '',
                color=color,
            )

        # Auto-generate canonical_url
        if not self.canonical_url:
            self.canonical_url = self._build_canonical_url()
        elif old_slug and self.slug and old_slug != self.slug:
            old_default_canonical = self._build_canonical_url(slug=old_slug)
            if old_canonical_url in {
                old_default_canonical,
                old_default_canonical.replace('dreamcarhouse.com', 'dreamcarhouse.com'),
                old_default_canonical.replace('dreamcarhouse.com', 'bigautos.com'),
            }:
                self.canonical_url = self._build_canonical_url()

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Inventory"
        verbose_name_plural = "Inventories"
        db_table = "tbl_inventories"
        indexes = [
            models.Index(fields=['status', 'registered']),
            models.Index(fields=['status', 'car_type']),
            models.Index(fields=['status', 'price']),
            models.Index(fields=['status', 'created_at']),
        ]
