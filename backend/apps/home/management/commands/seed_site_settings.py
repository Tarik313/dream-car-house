import sys
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.home.models import SiteSettings, ShowroomBranch, SocialMedia


class Command(BaseCommand):
    help = "Explicit, idempotent seed/import command for Site Settings and Showroom Branches."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate the import without committing changes to the database.",
        )

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)
        mode_text = "[DRY-RUN]" if dry_run else "[APPLY]"
        self.stdout.write(self.style.NOTICE(f"{mode_text} Starting Site Settings and Showroom Branch seed..."))

        # Baseline Data matching current authentic website copy and assets
        SITE_SETTINGS_DATA = {
            "name": "DREAM CAR HOUSE",
            "tagline": "Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka.",
            "logo_text": "DREAM CAR HOUSE",
            "logo_asset": "/assets/supercar_wheel.png",
            "hotline": "01615-121312",
            "phone": "+880 1615-121312",
            "email": "dreamcarhouse101@gmail.com",
            "whatsapp": "+8801615121312",
            "website": "https://dreamcarhouse.com",
            "primary_address": "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka - 1000",
            "footer_tagline": "Where Extraordinary Dreams Meet The Road • Kakrail & Gulshan, Dhaka.",
            "footer_copy_text": "© 2026 DREAM CAR HOUSE. All rights reserved. Kakrail & Gulshan, Dhaka, Bangladesh.",
            "opening_hours_text": "Sat – Thu: 10:00 AM – 9:00 PM",
        }

        BRANCHES_DATA = [
            {
                "branch_id": "kakrail",
                "name": "Kakrail Branch & Showroom",
                "short_name": "Kakrail Branch",
                "tag": "Main Flagship Showroom",
                "address": "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka-1000",
                "phone": "01615-121312",
                "hotline": "+880 1615-121312",
                "email": "dreamcarhouse101@gmail.com",
                "hours": "Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)",
                "map_link": "https://maps.google.com/?q=18+Shaheed+Captain+Mansur+Ali+Soroni+Kakrail+Dhaka",
                "embed_map": "https://maps.google.com/maps?width=600&height=400&hl=en&q=18%20Shaheed%20Captain%20Mansur%20Ali%20Soroni%20Kakrail%20Dhaka&t=&z=15&ie=UTF8&iwloc=B&output=embed",
                "order": 1,
                "status": "PUBLISHED",
            },
            {
                "branch_id": "gulshan",
                "name": "Gulshan Branch & Showroom",
                "short_name": "Gulshan Branch",
                "tag": "Gulshan Avenue Showroom",
                "address": "House #07, Road #127, Gulshan Avenue, Dhaka-1212",
                "phone": "01615-121312",
                "hotline": "+880 1615-121312",
                "email": "dreamcarhouse101@gmail.com",
                "hours": "Saturday – Thursday: 10:00 AM – 9:00 PM (Friday Closed)",
                "map_link": "https://maps.google.com/?q=House+07+Road+127+Gulshan+Avenue+Dhaka",
                "embed_map": "https://maps.google.com/maps?width=600&height=400&hl=en&q=House%2007%20Road%20127%20Gulshan%20Avenue%20Dhaka&t=&z=15&ie=UTF8&iwloc=B&output=embed",
                "order": 2,
                "status": "PUBLISHED",
            },
        ]

        with transaction.atomic():
            # 1. Site Settings Check
            existing_settings = SiteSettings.objects.first()
            if existing_settings:
                self.stdout.write(
                    self.style.WARNING(
                        f"{mode_text} SiteSettings already exists (ID: {existing_settings.id}, Name: '{existing_settings.name}'). Preserving existing record without overwrite."
                    )
                )
            else:
                self.stdout.write(f"{mode_text} SiteSettings missing. Preparing to create default settings...")
                if not dry_run:
                    social_media = SocialMedia.objects.order_by("id").last()
                    new_settings = SiteSettings.objects.create(
                        **SITE_SETTINGS_DATA,
                        social_media=social_media,
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"{mode_text} Created SiteSettings (ID: {new_settings.id}) successfully.")
                    )
                else:
                    self.stdout.write(f"{mode_text} [DRY-RUN] Would create SiteSettings with name '{SITE_SETTINGS_DATA['name']}'.")

            # 2. Showroom Branches Check
            for b_data in BRANCHES_DATA:
                branch_id = b_data["branch_id"]
                existing_branch = ShowroomBranch.objects.filter(branch_id=branch_id).first()
                if existing_branch:
                    self.stdout.write(
                        self.style.WARNING(
                            f"{mode_text} ShowroomBranch '{branch_id}' already exists (ID: {existing_branch.id}, Name: '{existing_branch.name}'). Preserving existing record without overwrite."
                        )
                    )
                else:
                    self.stdout.write(f"{mode_text} ShowroomBranch '{branch_id}' missing. Preparing to insert...")
                    if not dry_run:
                        created_branch = ShowroomBranch.objects.create(**b_data)
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"{mode_text} Created ShowroomBranch '{branch_id}' (ID: {created_branch.id}) successfully."
                            )
                        )
                    else:
                        self.stdout.write(
                            f"{mode_text} [DRY-RUN] Would create ShowroomBranch '{branch_id}' with name '{b_data['name']}'."
                        )

            if dry_run:
                # Rollback transaction in dry-run mode
                transaction.set_rollback(True)
                self.stdout.write(self.style.NOTICE(f"{mode_text} Dry-run simulation completed. Zero database changes committed."))
            else:
                self.stdout.write(self.style.SUCCESS(f"{mode_text} Seed operation completed successfully."))
