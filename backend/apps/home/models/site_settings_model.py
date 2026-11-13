from django.db import models
from django.utils.translation import gettext_lazy as _
from base.models import BaseModel
from apps.home.models.socialmedia_model import SocialMedia
from core.utils.media import validate_icon_file


class SiteSettings(BaseModel):
    name = models.CharField(
        max_length=200,
        default="DREAM CAR HOUSE",
        verbose_name=_("Business Name"),
    )
    tagline = models.CharField(
        max_length=300,
        blank=True,
        default="Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka.",
        verbose_name=_("Tagline"),
    )
    logo_text = models.CharField(
        max_length=100,
        default="DREAM CAR HOUSE",
        verbose_name=_("Logo Text"),
    )
    logo_asset = models.CharField(
        max_length=255,
        default="/assets/supercar_wheel.webp",
        verbose_name=_("Logo Asset Path"),
    )
    logo = models.ImageField(
        upload_to="site/",
        null=True,
        blank=True,
        verbose_name=_("Night Mode / Default Logo"),
        help_text=_("Main brand logo displayed on dark backgrounds, header in Night Mode, and footer. (Recommended: light/white/gold)."),
    )
    logo_light = models.ImageField(
        upload_to="site/",
        null=True,
        blank=True,
        verbose_name=_("Day Mode Logo"),
        help_text=_("Alternative brand logo displayed on white/light backgrounds in Day Mode. (Recommended: dark/black/gold)."),
    )
    logo_icon = models.FileField(
        upload_to="site/",
        null=True,
        blank=True,
        verbose_name=_("Night Mode Mobile Icon"),
        help_text=_("Compact emblem/icon for mobile header in Night Mode. (Recommended: square SVG or PNG with transparent background)."),
    )
    logo_icon_light = models.FileField(
        upload_to="site/",
        null=True,
        blank=True,
        verbose_name=_("Day Mode Mobile Icon"),
        help_text=_("Compact emblem/icon for mobile header in Day Mode. (Recommended: square SVG or PNG with transparent background)."),
    )
    logo_footer = models.FileField(
        upload_to="site/",
        null=True,
        blank=True,
        verbose_name=_("Night Mode Footer Logo"),
        help_text=_("Brand logo displayed on dark backgrounds in the showroom footer. (Optional - falls back to Night Mode Logo)."),
    )
    logo_footer_light = models.FileField(
        upload_to="site/",
        null=True,
        blank=True,
        verbose_name=_("Day Mode Footer Logo"),
        help_text=_("Brand logo displayed on light backgrounds in the showroom footer in Day Mode. (Optional - falls back to Day Mode Logo)."),
    )
    favicon = models.FileField(
        upload_to="site/",
        null=True,
        blank=True,
        verbose_name=_("Browser Tab Icon (Favicon)"),
        help_text=_("Browser tab icon (ICO, PNG, SVG, WebP, or JPG; recommended square e.g. 64x64 or 512x512)."),
    )
    hotline = models.CharField(
        max_length=50,
        default="01615-121312",
        verbose_name=_("Hotline"),
    )
    phone = models.CharField(
        max_length=50,
        default="+880 1615-121312",
        verbose_name=_("Phone"),
    )
    email = models.EmailField(
        default="dreamcarhouse101@gmail.com",
        verbose_name=_("Email"),
    )
    whatsapp = models.CharField(
        max_length=50,
        default="+8801615121312",
        verbose_name=_("WhatsApp Number"),
    )
    website = models.URLField(
        max_length=255,
        default="https://dreamcarhouse.com",
        verbose_name=_("Website URL"),
    )
    primary_address = models.CharField(
        max_length=300,
        default="18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka - 1000",
        verbose_name=_("Primary Address"),
    )
    footer_tagline = models.CharField(
        max_length=300,
        blank=True,
        default="Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka.",
        verbose_name=_("Footer Tagline"),
    )
    footer_copy_text = models.CharField(
        max_length=300,
        default="© 2026 DREAM CAR HOUSE. All rights reserved. Kakrail & Gulshan, Dhaka, Bangladesh.",
        verbose_name=_("Footer Copyright Text"),
    )
    opening_hours_text = models.CharField(
        max_length=200,
        default="Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)",
        verbose_name=_("General Opening Hours Text"),
    )
    social_media = models.ForeignKey(
        SocialMedia,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="site_settings",
        verbose_name=_("Social Media Accounts"),
    )

    class Meta:
        verbose_name = _("Site Setting")
        verbose_name_plural = _("Site Settings")
        db_table = "tbl_site_settings"

    def clean(self):
        super().clean()
        if self.favicon and not getattr(self.favicon, "_committed", True):
            validate_icon_file(self.favicon)
        if self.logo_icon and not getattr(self.logo_icon, "_committed", True):
            validate_icon_file(self.logo_icon)
        if self.logo_icon_light and not getattr(self.logo_icon_light, "_committed", True):
            validate_icon_file(self.logo_icon_light)
        if self.logo_footer and not getattr(self.logo_footer, "_committed", True):
            validate_icon_file(self.logo_footer)
        if self.logo_footer_light and not getattr(self.logo_footer_light, "_committed", True):
            validate_icon_file(self.logo_footer_light)

    def __str__(self):
        return self.name
