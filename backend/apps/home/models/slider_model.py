from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator

from core.utils import images_path_dir


def default_cta_buttons():
    return [
        {"label": "Brand New", "action": "link", "destination": "/inventory?type=BRAND_NEW"},
        {"label": "Pre-Owned", "action": "link", "destination": "/inventory?type=PRE_OWNED"},
        {"label": "Connect to Consult", "action": "appointment_modal", "destination": ""},
    ]


class Slider(models.Model):
    heading = models.CharField(
        max_length=255,
        default="The Pinnacle of Luxury Automobiles",
        verbose_name=_("Heading"),
    )
    poster = models.CharField(
        max_length=500,
        default="/assets/maybach_hero_poster.jpg",
        blank=True,
        verbose_name=_("Poster Image URL / Path"),
    )
    video_provider = models.CharField(
        max_length=20,
        choices=[
            ("youtube", "YouTube"),
            ("vimeo", "Vimeo"),
            ("direct", "Direct File/URL"),
        ],
        default="youtube",
        verbose_name=_("Video Provider"),
    )
    video_source = models.CharField(
        max_length=500,
        default="7cxfVWs4YGw",
        blank=True,
        verbose_name=_("Video ID or URL"),
    )
    video_start_time = models.PositiveIntegerField(
        default=45,
        verbose_name=_("Video Start Time (seconds)"),
    )
    video_title = models.CharField(
        max_length=255,
        default="DREAM CAR HOUSE Flagship Cinema",
        blank=True,
        verbose_name=_("Accessible Video Title"),
    )
    cta_buttons = models.JSONField(
        default=default_cta_buttons,
        blank=True,
        verbose_name=_("CTA Buttons"),
    )
    scroll_link_label = models.CharField(
        max_length=150,
        default="Scroll to Current Inventory",
        blank=True,
        verbose_name=_("Scroll Link Label"),
    )
    scroll_link_target = models.CharField(
        max_length=100,
        default="#carousel-section",
        blank=True,
        verbose_name=_("Scroll Link Target"),
    )
    is_published = models.BooleanField(
        default=True,
        verbose_name=_("Is Published"),
    )
    image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        blank=True,
        null=True,
        verbose_name=_("Video"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
        blank=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        null=True,
        blank=True,
    )

    def clean(self):
        super().clean()
        if self.is_published:
            from django.core.exceptions import ValidationError
            if not self.heading or not self.heading.strip():
                raise ValidationError({
                    "heading": _("Published slider requires a valid heading.")
                })

    def __str__(self):
        return self.heading or f"Slider #{self.id}"

    class Meta:
        verbose_name = "Slider Video"
        verbose_name_plural = "Slider Video"
        db_table = "tbl_video"
