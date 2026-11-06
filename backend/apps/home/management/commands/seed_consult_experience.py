import os
from django.core.management.base import BaseCommand
from apps.home.models import (
    ConsultationSection,
    ExperienceSection,
    ExperiencePillar,
    SalesRepresentative,
    default_consultation_trust_pills,
)

class Command(BaseCommand):
    help = "Seeds homepage Consultation and Experience Pillars default records."

    def handle(self, *args, **options):
        # 1. Seed or get a primary sales representative
        rep, _ = SalesRepresentative.objects.get_or_create(
            name="Tahamidur Taief",
            defaults={
                "phone_number": "8801615121312",
                "status": "PUBLISHED",
            }
        )

        # 2. Consultation Section
        consult, created = ConsultationSection.objects.get_or_create(
            id=1,
            defaults={
                "tag": "PRIVATE AUTOMOTIVE CONCIERGE",
                "heading": "Connect to Consult",
                "description": "Our dedicated automotive advisors offer bespoke consultations—whether you seek an exclusive allocation, custom reconditioned import, or confidential valuation for your vehicle trade-in.",
                "trust_pills": default_consultation_trust_pills(),
                "primary_cta_label": "Book Private Appointment",
                "primary_cta_action": "appointment_modal",
                "primary_cta_url": "",
                "whatsapp_cta_label": "Chat on WhatsApp",
                "whatsapp_number": "8801615121312",
                "whatsapp_message": "Hello Dream Car House, I would like to consult regarding a luxury vehicle.",
                "representative": rep,
                "status_beacon_text": "Showroom Open Today • Kakrail & Gulshan, Dhaka",
                "is_active": True,
            }
        )
        if not created:
            consult.is_active = True
            if not consult.representative:
                consult.representative = rep
            consult.save()

        # 3. Experience Section
        exp_sec, created = ExperienceSection.objects.get_or_create(
            id=1,
            defaults={
                "title": "Experience Beyond Ordinary",
                "subtitle": "Dhaka's benchmark in high-luxury automotive delivery, certified diagnostic inspection, and bespoke global procurement.",
                "video_cta_label": "Watch Showroom Reel",
                "video_target": "reel",
                "is_active": True,
            }
        )
        if not created:
            exp_sec.is_active = True
            exp_sec.save()

        # 4. Experience Pillars (3 Baseline Pillars)
        pillars_data = [
            {
                "pillar_number": "01",
                "badge": "PRIVATE SANCTUARY",
                "title": "The VIP Delivery Vault",
                "description": "An exclusive private handover suite featuring theatrical automotive unveiling, champagne reception, and confidential documentation transfer.",
                "image": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80",
                "tags": ["Soundproof Suite", "Ceremonial Reveal"],
                "order": 1,
            },
            {
                "pillar_number": "02",
                "badge": "PRECISION AUDIT",
                "title": "150-Point Certified Audit",
                "description": "Exhaustive computerized diagnostics, chassis integrity checks, battery health analysis, and robotic paint-depth verification before showroom induction.",
                "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
                "tags": ["Computer Diagnostics", "Zero Imperfection"],
                "order": 2,
            },
            {
                "pillar_number": "03",
                "badge": "BESPOKE IMPORT",
                "title": "Global Bespoke Concierge",
                "description": "Direct sourcing of rare luxury allocations from London, Stuttgart, and Tokyo. Secured container logistics, customs facilitation, and doorstep delivery.",
                "image": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1000&q=80",
                "tags": ["UK & Japan Sourcing", "Turnkey Import"],
                "order": 3,
            },
        ]

        for p in pillars_data:
            pillar, p_created = ExperiencePillar.objects.get_or_create(
                section=exp_sec,
                order=p["order"],
                defaults={
                    "pillar_number": p["pillar_number"],
                    "badge": p["badge"],
                    "title": p["title"],
                    "description": p["description"],
                    "image": p["image"],
                    "tags": p["tags"],
                    "is_active": True,
                }
            )
            if not p_created:
                pillar.pillar_number = p["pillar_number"]
                pillar.badge = p["badge"]
                pillar.title = p["title"]
                pillar.description = p["description"]
                pillar.tags = p["tags"]
                pillar.is_active = True
                pillar.save()

        self.stdout.write(self.style.SUCCESS("Successfully seeded Consultation and Experience Pillars."))
