from django.db import models
from django.utils.translation import gettext_lazy as _
from base.models import BaseModel
from apps.home.models.socialmedia_model import SocialMedia


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
        default="/assets/supercar_wheel.png",
        verbose_name=_("Logo Asset Path"),
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
        default="Sat – Thu: 10:00 AM – 9:00 PM",
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

    def __str__(self):
        return self.name
