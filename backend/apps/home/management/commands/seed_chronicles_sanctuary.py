from django.core.management.base import BaseCommand
from apps.home.models import (
    VisualChroniclesSection,
    VisualChroniclesItem,
    VipSanctuarySection,
    ShowroomBranch,
    default_vip_sanctuary_pillars,
)


class Command(BaseCommand):
    help = "Seed baseline authentic records for Visual Chronicles and VIP Sanctuary"

    def handle(self, *args, **options):
        # 1. Visual Chronicles Section
        section, created = VisualChroniclesSection.objects.get_or_create(
            id=1,
            defaults={
                "heading": "DREAM CAR HOUSE Visual Chronicles",
                "subtitle": "Curated high-resolution photography, delivery spotlights, and automotive cinema from our Kakrail & Gulshan showrooms.",
                "stats_number": "19+",
                "stats_label": "Curated Masterpieces",
                "archive_tag": "19+ SHOWROOM ARCHIVE EDITIONS",
                "archive_description": "Explore high-definition exterior profiles, handcrafted cockpits, and delivery chronicles.",
                "archive_cta_label": "See All Gallery & Media (19+ Photos)",
                "archive_cta_url": "/gallery",
                "is_active": True,
            },
        )
        if not created:
            section.heading = "DREAM CAR HOUSE Visual Chronicles"
            section.subtitle = "Curated high-resolution photography, delivery spotlights, and automotive cinema from our Kakrail & Gulshan showrooms."
            section.stats_number = "19+"
            section.stats_label = "Curated Masterpieces"
            section.archive_tag = "19+ SHOWROOM ARCHIVE EDITIONS"
            section.archive_description = "Explore high-definition exterior profiles, handcrafted cockpits, and delivery chronicles."
            section.archive_cta_label = "See All Gallery & Media (19+ Photos)"
            section.archive_cta_url = "/gallery"
            section.is_active = True
            section.save()

        # Seed the 5 authentic mosaic tiles
        tiles_data = [
            {
                "order": 1,
                "card_type": VisualChroniclesItem.CardType.HERO,
                "front_image_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
                "front_alt": "Mercedes-Maybach S 680",
                "front_badge": "SHOWROOM FLAGSHIP SPOTLIGHT",
                "back_pill": "FIRST-CLASS COMMISSION",
                "back_number": "01",
                "title": "Mercedes-Maybach S 680 Bi-Turbo V12",
                "description": "Obsidian Black over Silk Nappa leather. Exclusive rear executive lounge featuring heated massage ottomans, active road noise cancellation, and handcrafted champagne flutes.",
                "specs": [
                    {"label": "Engine", "value": "6.0L V12 Bi-Turbo"},
                    {"label": "Drivetrain", "value": "4MATIC All-Wheel"},
                    {"label": "Interior", "value": "First-Class Lounge"},
                    {"label": "Induction", "value": "Showroom Vault"},
                ],
                "cta_label": "Explore Available Inventory",
                "cta_url": "/inventory",
            },
            {
                "order": 2,
                "card_type": VisualChroniclesItem.CardType.PORTRAIT,
                "front_image_url": "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1200&q=95",
                "front_alt": "Rolls-Royce Ghost Extended",
                "front_badge": "BESPOKE SANCTUARY",
                "back_pill": "GRAND TOURER",
                "back_number": "02",
                "title": "Rolls-Royce Ghost Extended",
                "description": "Silver Dawn coachwork with handcrafted fiber-optic Starlight headliner and self-closing coach doors. The ultimate pinnacle of Goodwood coachbuilding.",
                "specs": [
                    {"label": "Engine", "value": "6.75L Twin-Turbo V12"},
                    {"label": "Suspension", "value": "Planar Magic Carpet"},
                    {"label": "Doors", "value": "Power Coach Doors"},
                    {"label": "Acoustics", "value": "Whisper Studio 100kg+"},
                ],
                "cta_label": "View Media Spotlight",
                "cta_url": "/gallery",
            },
            {
                "order": 3,
                "card_type": VisualChroniclesItem.CardType.TRI,
                "front_image_url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=95",
                "front_alt": "Porsche 911 Carrera GTS",
                "front_badge": "STUTTGART PERFORMANCE",
                "back_pill": "TRACK BENCHMARK",
                "back_number": "03",
                "title": "Porsche 911 Carrera GTS",
                "description": "Carrara White track stance. 4.0L naturally aspirated flat-6 with razor-sharp response, center-lock wheels, and track precision.",
                "specs": [
                    {"label": "Spec 1", "value": "3.0L Flat-6"},
                    {"label": "Spec 2", "value": "Center-Lock"},
                    {"label": "Spec 3", "value": "Sport Chrono"},
                ],
                "cta_label": "View Spotlight",
                "cta_url": "/inventory",
            },
            {
                "order": 4,
                "card_type": VisualChroniclesItem.CardType.TRI,
                "front_image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=95",
                "front_alt": "Executive Cockpit Craftsmanship",
                "front_badge": "CABIN ARTISANSHIP",
                "back_pill": "VIP FIRST-CLASS SUITE",
                "back_number": "04",
                "title": "Bespoke Lounge Cockpit",
                "description": "Handcrafted semi-aniline hides, open-pore walnut trim, and multi-contour active hot-stone massage chairs.",
                "specs": [
                    {"label": "Spec 1", "value": "Burmester 4D"},
                    {"label": "Spec 2", "value": "Heated Ottomans"},
                    {"label": "Spec 3", "value": "Ambient 64"},
                ],
                "cta_label": "View Spotlight",
                "cta_url": "/gallery",
            },
            {
                "order": 5,
                "card_type": VisualChroniclesItem.CardType.TRI,
                "front_image_url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=95",
                "front_alt": "Range Rover SV Autobiography",
                "front_badge": "FLAGSHIP OFF-ROAD",
                "back_pill": "BRITISH LUXURY",
                "back_number": "05",
                "title": "Range Rover SV Autobiography",
                "description": "Long wheelbase executive edition in Santorini Black. All-wheel steering, electronic air suspension, and deployable executive tables.",
                "specs": [
                    {"label": "Spec 1", "value": "4.4L Twin-Turbo"},
                    {"label": "Spec 2", "value": "Air Suspension"},
                    {"label": "Spec 3", "value": "All-Wheel Steer"},
                ],
                "cta_label": "View Spotlight",
                "cta_url": "/inventory",
            },
        ]

        for item_data in tiles_data:
            VisualChroniclesItem.objects.update_or_create(
                section=section,
                order=item_data["order"],
                defaults=item_data,
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded Visual Chronicles section with {len(tiles_data)} tiles."))

        # 2. VIP Sanctuary Section
        kakrail_branch = ShowroomBranch.objects.filter(branch_id="kakrail").first()
        sanctuary, _ = VipSanctuarySection.objects.update_or_create(
            id=1,
            defaults={
                "background_image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2560&q=95",
                "eyebrow": "KAKRAIL & GULSHAN • DHAKA",
                "title": "Step Into The Realm of Automotive Excellence",
                "description": "DREAM CAR HOUSE specializes in bringing you the finest selection of luxury cars from around the world. With a handpicked collection of the most prestigious brands, DREAM CAR HOUSE takes pride in offering only the highest quality vehicles that combine sophistication, performance, and innovation. Whether you're searching for a sleek sports coupe, a refined executive sedan, or an iconic luxury SUV, DREAM CAR HOUSE is your ultimate destination in Dhaka.",
                "value_pillars": default_vip_sanctuary_pillars(),
                "primary_cta_label": "Schedule Private Viewing",
                "primary_cta_action": "appointment_modal",
                "primary_cta_url": "",
                "secondary_cta_label": "Browse Available Vault →",
                "secondary_cta_url": "/inventory",
                "card_badge": "FLAGSHIP SHOWROOM",
                "card_title": "DREAM CAR HOUSE Flagship",
                "card_live_pill": "OPEN TODAY",
                "branch": kakrail_branch,
                "location_text": "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
                "hours_text": "Daily 10:00 AM – 10:00 PM (Private Viewings by Reservation)",
                "phone_text": "01615-121312",
                "whatsapp_cta_label": "WhatsApp Concierge",
                "whatsapp_url": "https://wa.me/8801615121312?text=Hello%20DREAM%20CAR%20HOUSE,%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20vehicle",
                "tour_cta_label": "Showroom Tour",
                "tour_video_target": "tour",
                "is_active": True,
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Seeded VIP Sanctuary section successfully."))
