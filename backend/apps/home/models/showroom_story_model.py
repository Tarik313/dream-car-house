from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator

from base.models import BaseModel
from core.utils import stories_media_path_dir


class ShowroomStory(BaseModel):
    class MediaType(models.TextChoices):
        IMAGE = "image", _("Image (Portrait 9:16)")
        VIDEO = "video", _("Video Reel (Portrait 9:16)")

    title = models.CharField(
        max_length=200,
        verbose_name=_("Vehicle / Story Title"),
        help_text=_("e.g. 2025 Mercedes-Benz G 580 EQ"),
    )
    tag = models.CharField(
        max_length=150,
        default="NEW ARRIVAL • KAKRAIL SHOWROOM",
        verbose_name=_("Story Header Tag"),
        help_text=_("e.g. NEW ARRIVAL • KAKRAIL SHOWROOM"),
    )
    subtitle = models.TextField(
        blank=True,
        default="",
        verbose_name=_("Story Subtitle / Key Specs"),
        help_text=_("e.g. 1,164 Nm Torque • 4 Individual Electric Motors • Bespoke Nappa Leather"),
    )
    price_note = models.CharField(
        max_length=100,
        default="Available in Showroom",
        blank=True,
        verbose_name=_("Price Note"),
        help_text=_("e.g. Immediate Delivery or Call for Price"),
    )
    media_type = models.CharField(
        max_length=10,
        choices=MediaType.choices,
        default=MediaType.IMAGE,
        verbose_name=_("Media Type"),
    )
    media_file = models.FileField(
        upload_to=stories_media_path_dir,
        max_length=500,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp", "mp4", "webm"])],
        verbose_name=_("Uploaded Media File (Image or MP4/WebM Video)"),
        help_text=_("Aspect Ratio 9:16 recommended (1080x1920). Video max 25MB, Image max 5MB."),
    )
    media_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
        verbose_name=_("Remote Media URL (Optional CDN / Unsplash fallback)"),
    )
    cta_text = models.CharField(
        max_length=100,
        default="Inspect Vehicle",
        verbose_name=_("CTA Button Text"),
    )
    cta_link = models.CharField(
        max_length=255,
        default="/inventory",
        verbose_name=_("CTA Link URL"),
    )
    whatsapp_message = models.CharField(
        max_length=300,
        blank=True,
        default="Hello Dream Car House, I want to inquire about this vehicle from your Showroom Story.",
        verbose_name=_("WhatsApp Inquiry Message"),
    )
    brand = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name=_("Brand Name"),
    )
    accent_color = models.CharField(
        max_length=30,
        default="#38bdf8",
        verbose_name=_("Accent Color (Hex)"),
        help_text=_("Border ring and highlight hex color e.g. #38bdf8"),
    )
    order = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Display Order"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
    )

    class Meta:
        verbose_name = _("Showroom Story")
        verbose_name_plural = _("Showroom Stories")
        ordering = ("order", "-created_at")
        db_table = "tbl_showroom_stories"

    def __str__(self):
        return f"[{self.get_media_type_display()}] {self.title}"
