from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator

from base.models import BaseModel
from core.utils import images_path_dir


def default_brand_new_highlights():
    return [
        {
            "title": "Zero / Minimal Mileage",
            "description": "Factory-fresh original condition, untouched luxury and precision.",
        },
        {
            "title": "Direct Global Import",
            "description": "Handpicked auction grades with verified import manifests.",
        },
        {
            "title": "Full Showroom Warranty",
            "description": "Complete documentation & personalized post-delivery support.",
        },
    ]


def default_pre_owned_highlights():
    return [
        {
            "title": "150+ Point Multi-Inspection",
            "description": "Comprehensive engine, transmission, suspension & ECU check.",
        },
        {
            "title": "Dhaka Metro Registered",
            "description": "100% verified legal papers with authentic ownership history.",
        },
        {
            "title": "Showroom Ready",
            "description": "Immediate physical test drive & instant ownership handover.",
        },
    ]


class PreferenceSection(BaseModel):
    heading = models.CharField(
        max_length=200,
        default="Choose per your preference",
        verbose_name=_("Section Heading"),
    )
    badge = models.CharField(
        max_length=100,
        blank=True,
        default="CURATED INVENTORY",
        verbose_name=_("Badge Text"),
    )
    subtext = models.CharField(
        max_length=300,
        blank=True,
        default="Toggle between factory-fresh zero mileage units and certified showroom pre-owned vehicles.",
        verbose_name=_("Subtext Description"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active?"),
    )

    def clean(self):
        super().clean()
        if self.is_active and self.pk:
            from django.core.exceptions import ValidationError
            active_cats = self.categories.filter(is_active=True).count()
            if active_cats < 1:
                raise ValidationError({
                    "is_active": _(f"Cannot publish Preference section with fewer than 1 active category (currently has {active_cats}).")
                })

    class Meta:
        verbose_name = _("Preference Section")
        verbose_name_plural = _("Preference Section")

    def __str__(self):
        return self.heading


class PreferenceCategory(BaseModel):
    class CategoryKeyChoices(models.TextChoices):
        BRAND_NEW = "BRAND_NEW", _("Brand New & Reconditioned")
        PRE_OWNED = "PRE_OWNED", _("Certified Pre-Owned")

    section = models.ForeignKey(
        PreferenceSection,
        related_name="categories",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    category_key = models.CharField(
        max_length=50,
        choices=CategoryKeyChoices.choices,
        unique=True,
        verbose_name=_("Category Key / Segment"),
    )
    label = models.CharField(
        max_length=150,
        verbose_name=_("Segment Tab Label"),
    )
    badge = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name=_("Category Badge"),
    )
    subtext = models.CharField(
        max_length=300,
        blank=True,
        default="",
        verbose_name=_("Category Subtext"),
    )
    image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
        null=True,
        blank=True,
        verbose_name=_("Category Image"),
        help_text=_("jpg, jpeg, png, webp"),
    )
    cta_text = models.CharField(
        max_length=255,
        verbose_name=_("CTA Button Text"),
    )
    cta_url = models.CharField(
        max_length=255,
        default="/inventory",
        verbose_name=_("CTA Destination URL"),
    )
    highlights = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Highlights / Trust Cards"),
    )
    order = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Display Order"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active?"),
    )

    class Meta:
        ordering = ["order", "id"]
        verbose_name = _("Preference Category")
        verbose_name_plural = _("Preference Categories")

    def __str__(self):
        return f"{self.label} ({self.category_key})"
