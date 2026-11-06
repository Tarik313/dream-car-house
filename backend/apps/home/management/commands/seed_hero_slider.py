from django.core.management.base import BaseCommand
from django.db import transaction

from apps.home.models import Slider


class Command(BaseCommand):
    help = "Explicit, idempotent seed command for Hero Slider configuration."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate the import without committing changes to the database.",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Overwrite existing first slider with default baseline values.",
        )

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)
        force = options.get("force", False)
        mode_text = "[DRY-RUN]" if dry_run else "[APPLY]"
        self.stdout.write(self.style.NOTICE(f"{mode_text} Starting Hero Slider seed..."))

        HERO_BASELINE = {
            "heading": "The Pinnacle of Luxury Automobiles",
            "poster": "/assets/maybach_hero_poster.jpg",
            "video_provider": "youtube",
            "video_source": "7cxfVWs4YGw",
            "video_start_time": 45,
            "video_title": "DREAM CAR HOUSE Flagship Cinema",
            "cta_buttons": [
                {
                    "label": "Brand New",
                    "action": "link",
                    "destination": "/inventory?type=BRAND_NEW",
                },
                {
                    "label": "Pre-Owned",
                    "action": "link",
                    "destination": "/inventory?type=PRE_OWNED",
                },
                {
                    "label": "Connect to Consult",
                    "action": "appointment_modal",
                    "destination": "",
                },
            ],
            "scroll_link_label": "Scroll to Current Inventory",
            "scroll_link_target": "#carousel-section",
            "is_published": True,
        }

        with transaction.atomic():
            slider = Slider.objects.order_by("id").first()
            if slider and not force:
                self.stdout.write(
                    self.style.WARNING(
                        f"  -> Existing Slider found (ID: {slider.id}, Heading: '{slider.heading}'). Preserving without change."
                    )
                )
            else:
                if not slider:
                    slider = Slider()
                    action_msg = "Creating initial baseline Hero Slider..."
                else:
                    action_msg = f"Overwriting existing Slider (ID: {slider.id}) with baseline..."

                self.stdout.write(f"  -> {action_msg}")
                for key, val in HERO_BASELINE.items():
                    setattr(slider, key, val)

                if not dry_run:
                    slider.save()
                    self.stdout.write(self.style.SUCCESS(f"  [SAVED] Slider ID: {slider.id}"))
                else:
                    self.stdout.write(self.style.NOTICE("  [DRY-RUN] Slider record simulated."))

            if dry_run:
                transaction.set_rollback(True)
                self.stdout.write(self.style.NOTICE("Dry run completed. No changes written to database."))
            else:
                self.stdout.write(self.style.SUCCESS("Hero Slider seeding finished successfully."))
