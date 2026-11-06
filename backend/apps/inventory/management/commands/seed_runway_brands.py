import os
import re
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.inventory.models import Brand
from base.models import BaseModel

APPROVED_BRANDS = [
    # Batch 1 - Flagship Luxury
    {
        "name": "Mercedes-Benz",
        "display_name": "MERCEDES",
        "filterBrand": "Mercedes-Benz",
        "order": 1,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2"/><line x1="24" y1="2" x2="24" y2="24" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="24" x2="5" y2="35" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="24" x2="43" y2="35" stroke="currentColor" stroke-width="2.2"/><path d="M24 2 L22 24 L24 21 L26 24 Z" fill="currentColor"/><path d="M5 35 L24 24 L22 26 L8 38 Z" fill="currentColor"/><path d="M43 35 L24 24 L26 26 L40 38 Z" fill="currentColor"/></svg>',
    },
    {
        "name": "BMW",
        "display_name": "BMW",
        "filterBrand": "BMW",
        "order": 2,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M24 9 A15 15 0 0 1 39 24 L24 24 Z" fill="#0066b1"/><path d="M9 24 A15 15 0 0 1 24 9 L24 24 Z" fill="#ffffff"/><path d="M24 24 L39 24 A15 15 0 0 1 24 39 Z" fill="#ffffff"/><path d="M24 24 L9 24 A15 15 0 0 0 24 39 Z" fill="#0066b1"/></svg>',
    },
    {
        "name": "Lexus",
        "display_name": "LEXUS",
        "filterBrand": "Lexus",
        "order": 3,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><ellipse cx="24" cy="24" rx="22" ry="16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 17 L22 17 L22 31 L34 31" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 17 L32 23" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    },
    {
        "name": "Toyota",
        "display_name": "TOYOTA",
        "filterBrand": "Toyota",
        "order": 4,
        "segment": "REFINED_VERSATILE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><ellipse cx="24" cy="24" rx="22" ry="15" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="20" rx="14" ry="7" fill="none" stroke="currentColor" stroke-width="2.2"/><ellipse cx="24" cy="24" rx="6" ry="14" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    },
    {
        "name": "Audi",
        "display_name": "AUDI",
        "filterBrand": "Audi",
        "order": 5,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 68 32" class="brand-svg-wide"><circle cx="14" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="27" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="41" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="54" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    },
    {
        "name": "Porsche",
        "display_name": "PORSCHE",
        "filterBrand": "Porsche",
        "order": 6,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 8 L36 8 L33 34 L24 42 L15 34 Z" fill="none" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" stroke-width="1.5"/><line x1="13" y1="22" x2="35" y2="22" stroke="currentColor" stroke-width="1.5"/><rect x="20" y="14" width="8" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    },
    {
        "name": "Land Rover",
        "display_name": "LAND ROVER",
        "filterBrand": "Land Rover",
        "order": 7,
        "segment": "REFINED_VERSATILE",
        "svg": '<svg viewBox="0 0 54 32" class="brand-svg-wide"><ellipse cx="27" cy="16" rx="25" ry="14" fill="none" stroke="#22c55e" stroke-width="2.2"/><text x="27" y="19" text-anchor="middle" fill="#4ade80" font-size="8.5" font-family="sans-serif" font-weight="800" letter-spacing="1">LAND ROVER</text></svg>',
    },
    {
        "name": "BYD",
        "display_name": "BYD",
        "filterBrand": "BYD",
        "order": 8,
        "segment": "ELECTRIC",
        "svg": '<svg viewBox="0 0 52 32" class="brand-svg-wide"><rect x="3" y="6" width="46" height="20" rx="10" fill="none" stroke="currentColor" stroke-width="2.2"/><text x="26" y="20" text-anchor="middle" fill="currentColor" font-size="11" font-family="sans-serif" font-weight="900" letter-spacing="2">BYD</text></svg>',
    },
    # Batch 2 - Supercar & Exotics
    {
        "name": "Rolls-Royce",
        "display_name": "ROLLS-ROYCE",
        "filterBrand": "Rolls-Royce",
        "order": 9,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><rect x="10" y="6" width="28" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><text x="20" y="24" fill="currentColor" font-size="14" font-weight="900" font-family="serif">R</text><text x="27" y="32" fill="currentColor" font-size="14" font-weight="900" font-family="serif">R</text></svg>',
    },
    {
        "name": "Bentley",
        "display_name": "BENTLEY",
        "filterBrand": "Bentley",
        "order": 10,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 60 32" class="brand-svg-wide"><path d="M4 20 C14 10 24 10 30 16 C36 10 46 10 56 20 C46 22 36 18 30 18 C24 18 14 22 4 20 Z" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="30" cy="17" rx="8" ry="7" fill="none" stroke="currentColor" stroke-width="2"/><text x="30" y="21" text-anchor="middle" fill="currentColor" font-size="11" font-weight="900" font-family="sans-serif">B</text></svg>',
    },
    {
        "name": "Ferrari",
        "display_name": "FERRARI",
        "filterBrand": "Ferrari",
        "order": 11,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 6 L36 6 L33 36 L24 44 L15 36 Z" fill="#ffd700" stroke="#ffd700" stroke-width="1.5"/><path d="M22 13 C23 11 25 11 26 13 C26 15 24 16 26 19 C28 20 30 19 31 22 C31 24 29 25 27 25 C28 27 29 29 28 31 C26 31 25 29 24 27 C23 29 22 31 20 31 C20 28 21 26 22 24 C20 23 19 21 21 19 C22 17 21 15 22 13 Z" fill="#111111"/><rect x="15" y="7" width="6" height="3" fill="#22c55e"/><rect x="21" y="7" width="6" height="3" fill="#ffffff"/><rect x="27" y="7" width="6" height="3" fill="#ef4444"/></svg>',
    },
    {
        "name": "Lamborghini",
        "display_name": "LAMBORGHINI",
        "filterBrand": "Lamborghini",
        "order": 12,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><polygon points="24,5 40,11 36,41 24,46 12,41 8,11" fill="none" stroke="#d97706" stroke-width="2.2"/><path d="M18 20 C20 18 22 19 24 21 C26 19 28 18 30 20 C28 23 29 26 27 29 C25 28 23 28 21 29 C19 26 20 23 18 20 Z" fill="#f59e0b"/><polygon points="24,20 21,24 27,24" fill="#d97706"/></svg>',
    },
    {
        "name": "Aston Martin",
        "display_name": "ASTON MARTIN",
        "filterBrand": "Aston Martin",
        "order": 13,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 64 32" class="brand-svg-wide"><path d="M4 17 C16 9 26 10 32 15 C38 10 48 9 60 17 C50 20 38 18 32 18 C26 18 14 20 4 17 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="15" x2="24" y2="17" stroke="currentColor" stroke-width="1.2"/><line x1="52" y1="15" x2="40" y2="17" stroke="currentColor" stroke-width="1.2"/><rect x="20" y="14" width="24" height="6" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><text x="32" y="18.5" text-anchor="middle" fill="currentColor" font-size="5" font-family="sans-serif" font-weight="800" letter-spacing="0.5">ASTON MARTIN</text></svg>',
    },
    {
        "name": "Maserati",
        "display_name": "MASERATI",
        "filterBrand": "Maserati",
        "order": 14,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><path d="M24 6 L26 18 L34 11 L32 24 L27 26 L27 34 L29 36 L24 40 L19 36 L21 34 L21 26 L16 24 L14 11 L22 18 Z" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round"/><ellipse cx="24" cy="24" rx="20" ry="19" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.6"/></svg>',
    },
    {
        "name": "McLaren",
        "display_name": "MCLAREN",
        "filterBrand": "McLaren",
        "order": 15,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 54 32" class="brand-svg-wide"><path d="M12 21 C22 13 36 12 44 19 C38 15 26 15 12 21 Z" fill="#ef4444"/><text x="27" y="27" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" font-weight="900" letter-spacing="1.5">MCLAREN</text></svg>',
    },
    {
        "name": "Jaguar",
        "display_name": "JAGUAR",
        "filterBrand": "Jaguar",
        "order": 16,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 60 32" class="brand-svg-wide"><path d="M10 22 C14 18 20 16 28 17 C34 15 42 12 50 14 C48 16 44 17 40 18 C46 19 50 20 48 23 C42 22 36 21 30 22 C24 23 18 25 10 22 Z" fill="currentColor"/><text x="30" y="29" text-anchor="middle" fill="currentColor" font-size="7" font-family="sans-serif" font-weight="900" letter-spacing="2">JAGUAR</text></svg>',
    },
    # Batch 3 - Hypercars & Bespoke
    {
        "name": "Bugatti",
        "display_name": "BUGATTI",
        "filterBrand": "Bugatti",
        "order": 17,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 54 32" class="brand-svg-wide"><ellipse cx="27" cy="16" rx="25" ry="14" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/><ellipse cx="27" cy="16" rx="23" ry="12" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="2,2"/><text x="27" y="20" text-anchor="middle" fill="#ffffff" font-size="9" font-family="sans-serif" font-weight="900" letter-spacing="1">BUGATTI</text></svg>',
    },
    {
        "name": "Koenigsegg",
        "display_name": "KOENIGSEGG",
        "filterBrand": "Koenigsegg",
        "order": 18,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><polygon points="24,6 40,12 37,38 24,44 11,38 8,12" fill="none" stroke="#fbbf24" stroke-width="2"/><polygon points="24,12 32,18 24,24 16,18" fill="#3b82f6" opacity="0.8"/><polygon points="24,24 32,30 24,36 16,30" fill="#fbbf24" opacity="0.8"/><circle cx="24" cy="24" r="3" fill="#ffffff"/></svg>',
    },
    {
        "name": "Maybach",
        "display_name": "MAYBACH",
        "filterBrand": "Mercedes-Benz",
        "order": 19,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><path d="M12 12 L36 12 L24 40 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M16 20 L20 32 L24 23 L28 32 L32 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 16 L22 28 L24 22 L26 28 L30 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    },
    {
        "name": "Cadillac",
        "display_name": "CADILLAC",
        "filterBrand": "Cadillac",
        "order": 20,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 54 32" class="brand-svg-wide"><polygon points="27,6 45,13 41,27 27,30 13,27 9,13" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="18" x2="42" y2="18" stroke="currentColor" stroke-width="1.2"/><rect x="22" y="11" width="10" height="12" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="27" cy="17" r="2" fill="currentColor"/></svg>',
    },
    {
        "name": "Alfa Romeo",
        "display_name": "ALFA ROMEO",
        "filterBrand": "Alfa Romeo",
        "order": 21,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="22" fill="none" stroke="#dc2626" stroke-width="2.2"/><circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" stroke-width="1.2"/><path d="M14 24 L24 24" stroke="#dc2626" stroke-width="3"/><path d="M24 14 L24 34" stroke="#dc2626" stroke-width="3"/><path d="M24 18 C28 18 31 20 31 24 C31 28 28 30 24 30" fill="none" stroke="#22c55e" stroke-width="2"/></svg>',
    },
    {
        "name": "Volvo",
        "display_name": "VOLVO",
        "filterBrand": "Volvo",
        "order": 22,
        "segment": "REFINED_VERSATILE",
        "svg": '<svg viewBox="0 0 48 48" class="brand-svg"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="33" y1="15" x2="42" y2="6" stroke="currentColor" stroke-width="3"/><polygon points="42,6 36,6 42,12" fill="currentColor"/><rect x="8" y="21" width="32" height="6" fill="#0f172a" stroke="currentColor" stroke-width="1.2"/><text x="24" y="26" text-anchor="middle" fill="currentColor" font-size="5" font-family="sans-serif" font-weight="900" letter-spacing="1">VOLVO</text></svg>',
    },
    {
        "name": "Genesis",
        "display_name": "GENESIS",
        "filterBrand": "Genesis",
        "order": 23,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 64 32" class="brand-svg-wide"><path d="M6 18 C18 12 26 12 32 17 C38 12 46 12 58 18 C50 20 40 18 32 19 C24 18 14 20 6 18 Z" fill="none" stroke="currentColor" stroke-width="1.8"/><polygon points="32,15 37,20 32,24 27,20" fill="currentColor"/><text x="32" y="29" text-anchor="middle" fill="currentColor" font-size="6" font-family="sans-serif" font-weight="800" letter-spacing="2">GENESIS</text></svg>',
    },
    {
        "name": "Range Rover",
        "display_name": "RANGE ROVER",
        "filterBrand": "Land Rover",
        "order": 24,
        "segment": "LUXURY_PERFORMANCE",
        "svg": '<svg viewBox="0 0 56 32" class="brand-svg-wide"><rect x="3" y="6" width="50" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="28" y="19" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" font-weight="800" letter-spacing="1.5">RANGE ROVER</text></svg>',
    },
]

class Command(BaseCommand):
    help = "Seeds all 24 authentic Brand Runway logos and database records."

    def handle(self, *args, **options):
        media_brands_dir = os.path.join(settings.MEDIA_ROOT, "brands")
        os.makedirs(media_brands_dir, exist_ok=True)

        created_count = 0
        updated_count = 0

        for item in APPROVED_BRANDS:
            slug = re.sub(r'[^a-z0-9]+', '_', item["name"].lower()).strip('_')
            filename = f"{slug}.svg"
            filepath = os.path.join(media_brands_dir, filename)

            # Ensure clean standalone SVG and replace currentColor with bright #e2e8f0
            svg_content = item["svg"].replace("currentColor", "#e2e8f0")
            if not svg_content.startswith('<?xml'):
                if 'xmlns="http://www.w3.org/2000/svg"' not in svg_content:
                    svg_content = svg_content.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(svg_content)

            rel_image_path = f"brands/{filename}"
            dest_url = f"/inventory?brand={item['filterBrand']}"

            brand, created = Brand.objects.get_or_create(
                name=item["name"],
                defaults={
                    "segment": item["segment"],
                    "status": BaseModel.StatusChoices.PUBLISHED,
                    "order": item["order"],
                    "is_in_runway": True,
                    "logo_alt": f"{item['display_name']} luxury marque",
                    "destination_url": dest_url,
                    "image": rel_image_path,
                }
            )

            if not created:
                brand.order = item["order"]
                brand.is_in_runway = True
                brand.status = BaseModel.StatusChoices.PUBLISHED
                brand.logo_alt = f"{item['display_name']} luxury marque"
                if not brand.destination_url:
                    brand.destination_url = dest_url
                if not brand.image or not os.path.exists(os.path.join(settings.MEDIA_ROOT, str(brand.image))):
                    brand.image = rel_image_path
                brand.save()
                updated_count += 1
            else:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully processed runway brands: {created_count} created, {updated_count} updated."
            )
        )
