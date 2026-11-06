from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from core.utils import images_path_dir


def default_chronicles_specs_1():
    return [
        {"label": "Engine", "value": "6.0L V12 Bi-Turbo"},
        {"label": "Drivetrain", "value": "4MATIC All-Wheel"},
        {"label": "Interior", "value": "First-Class Lounge"},
        {"label": "Induction", "value": "Showroom Vault"},
    ]


def default_chronicles_specs_2():
    return [
        {"label": "Engine", "value": "6.75L Twin-Turbo V12"},
        {"label": "Suspension", "value": "Planar Magic Carpet"},
        {"label": "Doors", "value": "Power Coach Doors"},
        {"label": "Acoustics", "value": "Whisper Studio 100kg+"},
    ]


class VisualChroniclesSection(models.Model):
    heading = models.CharField(
        max_length=200,
        default="DREAM CAR HOUSE Visual Chronicles",
        verbose_name=_("Section Heading"),
    )
    subtitle = models.TextField(
        default="Curated high-resolution photography, delivery spotlights, and automotive cinema from our Kakrail & Gulshan showrooms.",
        verbose_name=_("Section Subtitle"),
    )
    stats_number = models.CharField(
        max_length=50,
        default="19+",
        verbose_name=_("Stats Number Badge"),
    )
    stats_label = models.CharField(
        max_length=100,
        default="Curated Masterpieces",
        verbose_name=_("Stats Label"),
    )
    archive_tag = models.CharField(
        max_length=100,
        default="19+ SHOWROOM ARCHIVE EDITIONS",
        verbose_name=_("Footer Archive Tag"),
    )
    archive_description = models.TextField(
        default="Explore high-definition exterior profiles, handcrafted cockpits, and delivery chronicles.",
        verbose_name=_("Footer Archive Description"),
    )
    archive_cta_label = models.CharField(
        max_length=150,
        default="See All Gallery & Media (19+ Photos)",
        verbose_name=_("Footer CTA Label"),
    )
    archive_cta_url = models.CharField(
        max_length=255,
        default="/gallery",
        verbose_name=_("Footer CTA Destination URL"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
    )
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.is_active and self.pk:
            from django.core.exceptions import ValidationError
            active_items = self.items.filter(is_active=True).count()
            if active_items < 1:
                raise ValidationError({
                    "is_active": _(f"Cannot publish Visual Chronicles section with fewer than 1 active item (currently has {active_items}).")
                })

    def __str__(self):
        return f"Visual Chronicles Section: {self.heading}"

    class Meta:
        verbose_name = _("Visual Chronicles Section")
        verbose_name_plural = _("Visual Chronicles Section")
        db_table = "tbl_visual_chronicles_section"


class VisualChroniclesItem(models.Model):
    class CardType(models.TextChoices):
        HERO = "hero", _("Widescreen Hero Tile (Col 1-7)")
        PORTRAIT = "portrait", _("Vertical Stature Portrait (Col 8-12)")
        TRI = "tri", _("Tri-Column Card")

    section = models.ForeignKey(
        VisualChroniclesSection,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name=_("Section"),
    )
    card_type = models.CharField(
        max_length=20,
        choices=CardType.choices,
        default=CardType.TRI,
        verbose_name=_("Card Grid Layout Style"),
    )
    order = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Display Order"),
    )
    front_image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
        verbose_name=_("Front Media Image"),
    )
    front_image_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        verbose_name=_("Remote Media Image URL (e.g. Unsplash fallback)"),
    )
    front_alt = models.CharField(
        max_length=200,
        default="",
        verbose_name=_("Front Image Alt Text"),
    )
    front_badge = models.CharField(
        max_length=100,
        default="SHOWROOM FLAGSHIP SPOTLIGHT",
        verbose_name=_("Front Floating Badge"),
    )
    back_pill = models.CharField(
        max_length=100,
        default="FIRST-CLASS COMMISSION",
        verbose_name=_("Back Pill Badge"),
    )
    back_number = models.CharField(
        max_length=10,
        default="01",
        verbose_name=_("Back Number (e.g. 01, 02)"),
    )
    title = models.CharField(
        max_length=200,
        verbose_name=_("Card Title"),
    )
    description = models.TextField(
        verbose_name=_("Card Back Description"),
    )
    specs = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Card Specifications / Tags"),
        help_text=_("Array of spec objects {'label': '', 'value': ''} or tag strings for compact tri cards."),
    )
    cta_label = models.CharField(
        max_length=100,
        default="View Spotlight",
        verbose_name=_("Back CTA Button Label"),
    )
    cta_url = models.CharField(
        max_length=255,
        default="/inventory",
        verbose_name=_("Back CTA URL"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
    )

    def __str__(self):
        return f"{self.back_number} - {self.title}"

    class Meta:
        verbose_name = _("Visual Chronicles Tile")
        verbose_name_plural = _("Visual Chronicles Tiles")
        ordering = ("order", "id")
        db_table = "tbl_visual_chronicles_item"
