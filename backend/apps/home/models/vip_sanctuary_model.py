from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from core.utils import images_path_dir
from apps.home.models.showroom_branch_model import ShowroomBranch


def default_vip_sanctuary_pillars():
    return [
        {
            "title": "100% Certified Provenance",
            "subtitle": "Verified mechanical inspection & auction grades",
            "icon": "shield",
        },
        {
            "title": "Global Bespoke Sourcing",
            "subtitle": "Direct official imports from UK, DE & Japan",
            "icon": "globe",
        },
        {
            "title": "White-Glove VIP Advisory",
            "subtitle": "Personalized acquisition & dedicated concierge",
            "icon": "star",
        },
    ]


class VipSanctuarySection(models.Model):
    background_image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
        verbose_name=_("Showroom Background Media Image"),
    )
    background_image_url = models.URLField(
        max_length=500,
        blank=True,
        default="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2560&q=95",
        verbose_name=_("Remote Background Image URL"),
    )
    eyebrow = models.CharField(
        max_length=150,
        default="KAKRAIL & GULSHAN • DHAKA",
        verbose_name=_("Eyebrow Location Badge"),
    )
    title = models.CharField(
        max_length=255,
        default="Step Into The Realm of Automotive Excellence",
        verbose_name=_("Sanctuary Title"),
    )
    description = models.TextField(
        default="DREAM CAR HOUSE specializes in bringing you the finest selection of luxury cars from around the world. With a handpicked collection of the most prestigious brands, DREAM CAR HOUSE takes pride in offering only the highest quality vehicles that combine sophistication, performance, and innovation. Whether you're searching for a sleek sports coupe, a refined executive sedan, or an iconic luxury SUV, DREAM CAR HOUSE is your ultimate destination in Dhaka.",
        verbose_name=_("Editorial Description"),
    )
    value_pillars = models.JSONField(
        default=default_vip_sanctuary_pillars,
        verbose_name=_("3 Value Pillars"),
        help_text=_("3 value assurance pillars with title, subtitle, and icon indicator."),
    )
    primary_cta_label = models.CharField(
        max_length=100,
        default="Schedule Private Viewing",
        verbose_name=_("Primary CTA Label"),
    )
    primary_cta_action = models.CharField(
        max_length=50,
        default="appointment_modal",
        verbose_name=_("Primary CTA Action"),
        help_text=_("'appointment_modal' or 'link'"),
    )
    primary_cta_url = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name=_("Primary CTA Link URL (if action is link)"),
    )
    secondary_cta_label = models.CharField(
        max_length=100,
        default="Browse Available Vault →",
        verbose_name=_("Secondary CTA Label"),
    )
    secondary_cta_url = models.CharField(
        max_length=255,
        default="/inventory",
        verbose_name=_("Secondary CTA URL"),
    )

    # Flagship Studio Card (Right column)
    card_badge = models.CharField(
        max_length=100,
        default="FLAGSHIP SHOWROOM",
        verbose_name=_("Studio Card Top Badge"),
    )
    card_title = models.CharField(
        max_length=150,
        default="DREAM CAR HOUSE Flagship",
        verbose_name=_("Studio Card Title"),
    )
    card_live_pill = models.CharField(
        max_length=50,
        default="OPEN TODAY",
        verbose_name=_("Studio Card Status Pill"),
    )
    branch = models.ForeignKey(
        ShowroomBranch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sanctuary_sections",
        verbose_name=_("Associated Branch (Optional)"),
        help_text=_("If set, location and hours can be dynamically inherited from the branch."),
    )
    location_text = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name=_("Showroom Location Text"),
        help_text=_("Optional custom address override. If left blank, inherits from associated branch."),
    )
    hours_text = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name=_("Viewing Hours Text"),
        help_text=_("Optional custom viewing hours. If left blank, inherits from associated branch."),
    )
    phone_text = models.CharField(
        max_length=50,
        blank=True,
        default="",
        verbose_name=_("Direct Concierge Hotline"),
        help_text=_("Optional custom hotline. If left blank, inherits from associated branch or site settings."),
    )
    whatsapp_cta_label = models.CharField(
        max_length=100,
        default="WhatsApp Concierge",
        verbose_name=_("WhatsApp CTA Label"),
    )
    whatsapp_url = models.CharField(
        max_length=500,
        blank=True,
        default="https://wa.me/8801615121312?text=Hello%20DREAM%20CAR%20HOUSE,%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20vehicle",
        verbose_name=_("WhatsApp Concierge Direct URL"),
    )
    tour_cta_label = models.CharField(
        max_length=100,
        default="Showroom Tour",
        verbose_name=_("Tour CTA Label"),
    )
    tour_video_target = models.CharField(
        max_length=50,
        default="tour",
        verbose_name=_("Tour Video Identifier"),
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"VIP Sanctuary: {self.title}"

    class Meta:
        verbose_name = _("VIP Sanctuary Section")
        verbose_name_plural = _("VIP Sanctuary Section")
        db_table = "tbl_vip_sanctuary_section"
