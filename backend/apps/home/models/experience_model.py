from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from core.utils import images_path_dir

class ExperienceSection(models.Model):
    title = models.CharField(
        max_length=200,
        default="Experience Beyond Ordinary",
        verbose_name=_("Section Title"),
    )
    subtitle = models.TextField(
        default="Dhaka's benchmark in high-luxury automotive delivery, certified diagnostic inspection, and bespoke global procurement.",
        verbose_name=_("Section Subtitle"),
    )
    video_cta_label = models.CharField(
        max_length=100,
        default="Watch Showroom Reel",
        verbose_name=_("Video Button Label"),
    )
    video_target = models.CharField(
        max_length=255,
        default="reel",
        verbose_name=_("Video Modal Identifier / URL"),
        help_text=_("Key passed to video modal (e.g. 'reel') or external video URL."),
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
            active_pillars = self.pillars.filter(is_active=True).count()
            if active_pillars < 3:
                raise ValidationError({
                    "is_active": _(f"Cannot publish Experience Section with fewer than 3 active pillars (currently has {active_pillars}).")
                })

    def __str__(self):
        return f"Experience Section: {self.title}"

    class Meta:
        verbose_name = _("Experience Section")
        verbose_name_plural = _("Experience Section")
        db_table = "tbl_experience_section"


class ExperiencePillar(models.Model):
    section = models.ForeignKey(
        ExperienceSection,
        on_delete=models.CASCADE,
        related_name="pillars",
        verbose_name=_("Section"),
    )
    pillar_number = models.CharField(
        max_length=10,
        default="01",
        verbose_name=_("Pillar Number Index"),
        help_text=_("e.g. '01', '02', '03'"),
    )
    badge = models.CharField(
        max_length=80,
        default="PRIVATE SANCTUARY",
        verbose_name=_("Card Badge"),
    )
    title = models.CharField(
        max_length=150,
        verbose_name=_("Pillar Title"),
    )
    description = models.TextField(
        verbose_name=_("Pillar Description"),
    )
    image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])],
        help_text=_("jpg, jpeg, png, webp (max 10MB)"),
        verbose_name=_("Media Image"),
    )
    tags = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_("Pillar Feature Tags"),
        help_text=_("Array of tag strings, e.g. ['Soundproof Suite', 'Ceremonial Reveal']"),
    )
    order = models.PositiveIntegerField(
        default=1,
        verbose_name=_("Display Order"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
    )

    def __str__(self):
        return f"{self.pillar_number} - {self.title}"

    class Meta:
        verbose_name = _("Experience Pillar")
        verbose_name_plural = _("Experience Pillars")
        ordering = ("order", "id")
        db_table = "tbl_experience_pillar"
