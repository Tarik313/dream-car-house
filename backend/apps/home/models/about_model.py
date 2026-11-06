from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from core.utils import images_path_dir


def default_about_stats():
    return [
        {
            "number": "15+",
            "label": "Years of Motoring Trust",
        },
        {
            "number": "150+",
            "label": "Point Diagnostic Audit",
        },
        {
            "number": "100%",
            "label": "Verified Global Provenance",
        },
        {
            "number": "2",
            "label": "Dhaka Flagship Showrooms",
        },
    ]


def default_about_pillars():
    return [
        {
            "title": "Direct Global Import",
            "description": "Exclusive relationships with premier authorized dealerships in Stuttgart, Tokyo, and London facilitate direct, turnkey container importation with verified manifests.",
            "icon": "globe",
        },
        {
            "title": "150+ Point Diagnostic Audit",
            "description": "Every vehicle undergoes exhaustive computerized diagnostic scans, chassis laser measurements, high-voltage battery audits, and genuine BRTA paper verifications.",
            "icon": "check",
        },
        {
            "title": "Private Handover Vault",
            "description": "An exclusive soundproof delivery sanctuary featuring theatrical automotive unveilings, champagne reception, and confidential documentation management.",
            "icon": "vault",
        },
        {
            "title": "White-Glove Concierge",
            "description": "Lifetime vehicle documentation support, tailored financing advisory, genuine factory parts procurement, and guaranteed priority buy-back valuations.",
            "icon": "concierge",
        },
    ]


class AboutSection(models.Model):
    # ── 1. Hero Header ──────────────────────────────────────
    hero_badge = models.CharField(
        max_length=150,
        default="THE DREAM CAR HOUSE STORY",
        verbose_name=_("Hero Badge / Pill"),
    )
    hero_title = models.CharField(
        max_length=255,
        default="Where Automotive Passion Meets Unrivaled Luxury",
        verbose_name=_("Hero Main Title"),
    )
    hero_subtitle = models.TextField(
        default="Dhaka's benchmark in factory-fresh zero-meter imports, bespoke executive saloons, and confidential white-glove automotive advisory.",
        verbose_name=_("Hero Subtitle"),
    )

    # ── 2. Trust Metrics (Stats Grid) ───────────────────────
    stats = models.JSONField(
        default=default_about_stats,
        verbose_name=_("Key Trust Metrics / Stats"),
        help_text=_("Array of key metric objects with 'number' and 'label'."),
    )

    # ── 3. Split Heritage Story & Cinema Reel ───────────────
    story_eyebrow = models.CharField(
        max_length=150,
        default="OUR HERITAGE & PHILOSOPHY",
        verbose_name=_("Story Eyebrow"),
    )
    story_title = models.CharField(
        max_length=255,
        default="An Uncompromising Pursuit of Automotive Perfection",
        verbose_name=_("Story Section Title"),
    )
    story_content_p1 = models.TextField(
        default="DREAM CAR HOUSE was founded with a singular, uncompromising vision: to establish Dhaka’s foremost luxury automotive destination where discerning connoisseurs can explore, acquire, and commission the world's most coveted motorcars with absolute peace of mind.",
        verbose_name=_("Story Paragraph 1"),
    )
    story_content_p2 = models.TextField(
        default="Operating across two flagship showrooms in Kakrail (Shaheed Captain Monsur Ali Soroni) and Gulshan Avenue (Road #127), our curated portfolio encompasses zero-meter factory imports, bespoke executive saloons, track-bred supercars, and certified pre-owned collectors' editions from Mercedes-Maybach, Rolls-Royce, Porsche, Lexus, BMW, and Toyota.",
        verbose_name=_("Story Paragraph 2"),
    )
    quote_text = models.TextField(
        default="We do not merely deliver motorcars; we curate trust, pedigree, and lifelong relationships for Dhaka's most discerning motorists.",
        verbose_name=_("Foundational Quote Text"),
    )
    quote_author = models.CharField(
        max_length=150,
        blank=True,
        default="DREAM CAR HOUSE Directorate",
        verbose_name=_("Quote Author / Attribution"),
    )

    # Reel & Tour Videos
    reel_image = models.FileField(
        upload_to=images_path_dir,
        max_length=500,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
        verbose_name=_("Showroom Reel Poster Image"),
    )
    reel_image_url = models.URLField(
        max_length=500,
        blank=True,
        default="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
        verbose_name=_("Showroom Reel Image Remote URL Fallback"),
    )
    reel_title = models.CharField(
        max_length=150,
        default="Flagship Automotive Showcase",
        verbose_name=_("Showroom Reel Title"),
    )
    reel_duration = models.CharField(
        max_length=50,
        default="4K REEL • 01:45",
        verbose_name=_("Showroom Reel Duration Pill"),
    )
    reel_video_target = models.CharField(
        max_length=255,
        default="reel",
        verbose_name=_("Showroom Reel Video Target / Modal Key"),
        help_text=_("Identifier passed to video modal (e.g. 'reel') or full video URL."),
    )
    tour_cta_label = models.CharField(
        max_length=100,
        default="Watch Full Showroom Tour (02:30)",
        verbose_name=_("Showroom Tour Button Label"),
    )
    tour_video_target = models.CharField(
        max_length=255,
        default="tour",
        verbose_name=_("Showroom Tour Video Target / Modal Key"),
        help_text=_("Identifier passed to video modal (e.g. 'tour') or full video URL."),
    )

    # ── 4. The Four Pillars of Showroom Distinction ─────────
    pillars_eyebrow = models.CharField(
        max_length=150,
        default="THE FOUR PILLARS",
        verbose_name=_("Pillars Eyebrow"),
    )
    pillars_title = models.CharField(
        max_length=255,
        default="Why Connoisseurs Choose DREAM CAR HOUSE",
        verbose_name=_("Pillars Title"),
    )
    pillars = models.JSONField(
        default=default_about_pillars,
        verbose_name=_("4 Distinction Pillars"),
        help_text=_("List of distinction pillars with title, description, and icon identifier."),
    )

    # ── 5. VIP Consultation CTA ─────────────────────────────
    cta_title = models.CharField(
        max_length=255,
        default="Experience The Difference in Person",
        verbose_name=_("CTA Title"),
    )
    cta_description = models.TextField(
        default="Schedule an exclusive showroom walkthrough or speak directly with our senior automotive curators to discuss custom procurement of your next masterpiece.",
        verbose_name=_("CTA Description"),
    )
    cta_primary_label = models.CharField(
        max_length=100,
        default="Explore Current Inventory",
        verbose_name=_("CTA Primary Button Label"),
    )
    cta_secondary_label = models.CharField(
        max_length=100,
        default="Schedule Showroom Tour",
        verbose_name=_("CTA Secondary Button Label"),
    )
    cta_whatsapp_label = models.CharField(
        max_length=100,
        default="Inquire on WhatsApp",
        verbose_name=_("CTA WhatsApp Button Label"),
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Is Active"),
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"About Section: {self.hero_title}"

    class Meta:
        verbose_name = _("About Section")
        verbose_name_plural = _("About Section")
        db_table = "tbl_about_section"
