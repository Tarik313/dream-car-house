from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.home.models.sales_representative import SalesRepresentative

def default_consultation_trust_pills():
    return [
        {
            "title": "1-on-1 Dedicated Specialist",
            "icon": "specialist",
        },
        {
            "title": "VIP Handover Lounge Access",
            "icon": "vip",
        },
        {
            "title": "Confidential Valuation & Quota",
            "icon": "shield",
        },
    ]

class ConsultationSection(models.Model):
    class CtaAction(models.TextChoices):
        APPOINTMENT_MODAL = "appointment_modal", _("Open Appointment Modal")
        INTERNAL_LINK = "internal_link", _("Navigate to Link")

    tag = models.CharField(
        max_length=100,
        default="PRIVATE AUTOMOTIVE CONCIERGE",
        verbose_name=_("Section Tag / Badge"),
    )
    heading = models.CharField(
        max_length=200,
        default="Connect to Consult",
        verbose_name=_("Section Heading"),
    )
    description = models.TextField(
        default="Our dedicated automotive advisors offer bespoke consultations—whether you seek an exclusive allocation, custom reconditioned import, or confidential valuation for your vehicle trade-in.",
        verbose_name=_("Descriptive Content"),
    )
    trust_pills = models.JSONField(
        default=default_consultation_trust_pills,
        verbose_name=_("Trust & Guarantee Badges"),
        help_text=_("List of 3 trust pills with title and icon indicator."),
    )
    primary_cta_label = models.CharField(
        max_length=100,
        default="Book Private Appointment",
        verbose_name=_("Primary CTA Label"),
    )
    primary_cta_action = models.CharField(
        max_length=50,
        choices=CtaAction.choices,
        default=CtaAction.APPOINTMENT_MODAL,
        verbose_name=_("Primary CTA Action"),
    )
    primary_cta_url = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name=_("Primary CTA URL"),
    )
    whatsapp_cta_label = models.CharField(
        max_length=100,
        default="Chat on WhatsApp",
        verbose_name=_("WhatsApp CTA Label"),
    )
    whatsapp_number = models.CharField(
        max_length=30,
        blank=True,
        default="",
        verbose_name=_("Direct WhatsApp Number"),
        help_text=_("Leave blank to inherit from assigned advisor or SiteSettings hotline."),
    )
    whatsapp_message = models.CharField(
        max_length=255,
        blank=True,
        default="Hello Dream Car House, I would like to consult regarding a luxury vehicle.",
        verbose_name=_("Default WhatsApp Message"),
    )
    representative = models.ForeignKey(
        SalesRepresentative,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="consultation_sections",
        verbose_name=_("Assigned Sales Advisor"),
        help_text=_("Dedicated advisor for direct WhatsApp forwarding."),
    )
    status_beacon_text = models.CharField(
        max_length=200,
        default="Showroom Open Today • Kakrail & Gulshan, Dhaka",
        verbose_name=_("Status Beacon Text"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consultation Section: {self.heading}"

    class Meta:
        verbose_name = _("Consultation Section")
        verbose_name_plural = _("Consultation Section")
        db_table = "tbl_consultation_section"
