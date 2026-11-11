from django.test import TestCase
from rest_framework.test import APIClient
from base.models import BaseModel
from apps.inventory.models import Brand, BodyStyle, Inventory
from apps.inventory.seo import (
    SITE_NAME,
    build_car_meta_description,
    build_car_meta_title,
    build_featured_image_alt,
    format_engine_capacity,
    format_mileage,
)
from apps.inventory.serializers import BrandListSerializer, BrandSEOSerializer, InventoryDetailSerializer


REAL_12_CARS = [
    {"pk": 1, "slug": "mercedes-benz-g-580-2025-black", "name": "Mercedes-Benz G 580", "year": 2025, "brand": "Mercedes-Benz", "model_name": "G 580", "body_style": "SUV", "engine_capacity": "116 kWh", "fuel_type": "ELECTRIC", "color": None, "mileage": "0 km", "price": "35000000.00", "is_call_for_price": True, "branch": "Kakrail Branch"},
    {"pk": 2, "slug": "toyota-land-cruiser-250-2024-black-5000km", "name": "Land Cruiser 250", "year": 2024, "brand": "Toyota", "model_name": "Land Cruiser 250", "body_style": "SUV", "engine_capacity": "2400 cc Turbo Hybrid", "fuel_type": "HYBRID", "color": None, "mileage": "5,000 km", "price": "28500000.00", "is_call_for_price": True, "branch": "Gulshan Branch"},
    {"pk": 3, "slug": "bmw-x7-2022-blue-8000km", "name": "BMW X7 xDrive40i M-Sport", "year": 2022, "brand": "BMW", "model_name": "X7", "body_style": "SUV", "engine_capacity": "3000 cc TwinPower Turbo", "fuel_type": "OCTANE", "color": None, "mileage": "8,000 km", "price": "24000000.00", "is_call_for_price": True, "branch": "Kakrail Branch"},
    {"pk": 4, "slug": "lexus-lx-600-2023-white-00km", "name": "Lexus LX 600 Ultra Luxury", "year": 2023, "brand": "Lexus", "model_name": "LX 600", "body_style": "SUV", "engine_capacity": "3500 cc", "fuel_type": "OCTANE", "color": "", "mileage": "0 km", "price": "38000000.00", "is_call_for_price": True, "branch": "Gulshan Branch"},
    {"pk": 5, "slug": "mercedes-benz-s-560e-2019-black-11000km", "name": "Mercedes-Benz S 560e Long Wheelbase", "year": 2019, "brand": "Mercedes-Benz", "model_name": "S-Class", "body_style": "Sedan", "engine_capacity": "3000 cc Plug-in Hybrid", "fuel_type": "HYBRID", "color": None, "mileage": "11,000 km", "price": "21000000.00", "is_call_for_price": True, "branch": "Kakrail Branch"},
    {"pk": 6, "slug": "nissan-patrol-2013-black-62000km", "name": "Nissan Patrol Y62 (NISMO Kitted)", "year": 2013, "brand": "Nissan", "model_name": "Patrol", "body_style": "SUV", "engine_capacity": "5600 cc V8 Naturally Aspirated", "fuel_type": "OCTANE", "color": None, "mileage": "62,000 km", "price": "14500000.00", "is_call_for_price": True, "branch": "Gulshan Branch"},
    {"pk": 7, "slug": "toyota-land-cruiser-vx-v8-2015-black-74000km", "name": "Land Cruiser VX-V8", "year": 2015, "brand": "Toyota", "model_name": "Land Cruiser", "body_style": "SUV", "engine_capacity": "4600 cc V8 Dual VVT-i", "fuel_type": "OCTANE", "color": None, "mileage": "74,000 km", "price": "16500000.00", "is_call_for_price": True, "branch": "Kakrail Branch"},
    {"pk": 8, "slug": "bmw-745le-2019-silver-9000", "name": "BMW 745Le xDrive Executive Lounge", "year": 2019, "brand": "BMW", "model_name": "7 Series", "body_style": "Sedan", "engine_capacity": "3000 cc Plug-in Hybrid", "fuel_type": "HYBRID", "color": None, "mileage": "9,000 km", "price": "22500000.00", "is_call_for_price": True, "branch": "Gulshan Branch"},
    {"pk": 9, "slug": "volvo-xc-90-2019-white-32000km", "name": "Volvo XC90 T5 Inscription", "year": 2019, "brand": "Volvo", "model_name": "XC 90", "body_style": "SUV", "engine_capacity": "2000 cc Turbocharged", "fuel_type": "OCTANE", "color": None, "mileage": "32,000 km", "price": "13500000.00", "is_call_for_price": True, "branch": "Kakrail Branch"},
    {"pk": 10, "slug": "lexus-rx-500h-2023-copper-22000km", "name": "Lexus RX 500h Turbo F-Sport", "year": 2023, "brand": "Lexus", "model_name": "RX 500h", "body_style": "SUV", "engine_capacity": "2400 cc Turbo Hybrid", "fuel_type": "HYBRID", "color": None, "mileage": "22,000 km", "price": "23500000.00", "is_call_for_price": True, "branch": "Gulshan Branch"},
    {"pk": 11, "slug": "toyota-land-cruiser-300-gr-sport-2024", "name": "Toyota Land Cruiser 300 GR Sport", "year": 2024, "brand": "Toyota", "model_name": "Land Cruiser 300", "body_style": "SUV", "engine_capacity": "3500 cc Twin Turbo V6", "fuel_type": "OCTANE", "color": None, "mileage": "0 km", "price": "34500000.00", "is_call_for_price": True, "branch": "Kakrail Branch"},
    {"pk": 12, "slug": "porsche-macan-gts-2024-miami-blue", "name": "Porsche Macan GTS", "year": 2024, "brand": "Porsche", "model_name": "MACAN GTS", "body_style": "SUV", "engine_capacity": "2900 cc", "fuel_type": "OCTANE", "color": "", "mileage": "0 km", "price": "29500000.00", "is_call_for_price": True, "branch": "Gulshan Branch"},
]


class CarSEOMetadataTests(TestCase):
    def test_unit_formatting_edge_cases(self):
        self.assertEqual(format_engine_capacity("2900"), "2900 cc")
        self.assertEqual(format_engine_capacity("116 kWh EQ Technology"), "116 kWh EQ Technology")
        self.assertEqual(format_engine_capacity("3000 cc TwinPower Turbo"), "3000 cc TwinPower Turbo")
        self.assertEqual(format_engine_capacity(""), "")
        self.assertEqual(format_mileage("0"), "0 km")
        self.assertEqual(format_mileage("5000"), "5,000 km")
        self.assertEqual(format_mileage("0 kmkm"), "0 km")
        self.assertEqual(format_mileage("62,000 km"), "62,000 km")

    def test_all_12_real_cars_clean_seo(self):
        for car in REAL_12_CARS:
            title = build_car_meta_title(
                year=car["year"],
                brand_name=car["brand"],
                model_name=car["model_name"],
                name=car["name"],
                engine_capacity=car["engine_capacity"],
                body_style=car["body_style"],
            )
            desc = build_car_meta_description(
                year=car["year"],
                brand_name=car["brand"],
                model_name=car["model_name"],
                name=car["name"],
                color=car["color"] or "",
                engine_capacity=car["engine_capacity"],
                fuel_type=car["fuel_type"],
                body_style=car["body_style"],
                mileage=car["mileage"],
                price=car["price"],
                is_call_for_price=car["is_call_for_price"],
                branch_name=car["branch"],
            )
            self.assertLessEqual(len(title), 60, msg=f"Title too long ({len(title)}): {title}")
            self.assertEqual(title.upper().count(SITE_NAME), 1, msg=title)
            self.assertNotIn("  ", title)
            self.assertNotIn("  ", desc)
            self.assertNotIn("kmkm", desc.lower())
            self.assertNotIn("hybrid hybrid", desc.lower())
            self.assertNotIn("in  for", desc.lower())
            self.assertNotRegex(title, r"[^\d\s]cc\b")

    def test_empty_color_and_location_and_eq_tech(self):
        title = build_car_meta_title(
            year=2025,
            brand_name="Mercedes-Benz",
            model_name="G 580",
            name="Mercedes-Benz G 580",
            engine_capacity="116 kWh EQ Technology",
            body_style="SUV",
        )
        self.assertLessEqual(len(title), 60)
        self.assertNotIn("cc", title.lower())
        desc = build_car_meta_description(
            year=2025,
            brand_name="Mercedes-Benz",
            model_name="G 580",
            name="Mercedes-Benz G 580",
            color="",
            engine_capacity="116 kWh EQ Technology",
            fuel_type="ELECTRIC",
            body_style="SUV",
            mileage="0 kmkm",
            price="35000000",
            is_call_for_price=False,
            branch_name="",
        )
        self.assertNotIn("in  for", desc)
        self.assertNotIn("  ", desc)
        self.assertIn("0 km", desc)
        self.assertNotIn("kmkm", desc)
        self.assertIn("BDT 35,000,000", desc)

    def test_inventory_save_repairs_legacy_corrupted_seo(self):
        brand = Brand.objects.create(name="Mercedes-Benz", status=BaseModel.StatusChoices.PUBLISHED)
        suv = BodyStyle.objects.create(body="SUV", status=BaseModel.StatusChoices.PUBLISHED)
        car = Inventory.objects.create(
            name="Mercedes-Benz G 580",
            brand=brand,
            model_name="G 580",
            year=2025,
            body_style=suv,
            engine_capacity="116 kWh EQ Technology",
            fuel_type="ELECTRIC",
            mileage="0 km",
            color="",
            price="35000000.00",
            is_call_for_price=True,
            meta_title="2025 Mercedes-Benz G 580 116 kWh EQ Technologycc SUV for Sale | Dream ",
            meta_description="Buy this 2025 Mercedes-Benz G 580 in  for BDT 35,000,000. 0 kmkm driven. View full details on Dream Car House.",
            featured_image_alt="Front view of 2025 Mercedes-Benz G 580 in",
            slug="mercedes-benz-g-580-seo-test",
        )
        self.assertLessEqual(len(car.meta_title), 60)
        self.assertNotIn("cc", car.meta_title.lower())
        self.assertTrue(car.meta_title.endswith("| DREAM CAR HOUSE"))
        self.assertNotIn("kmkm", car.meta_description.lower())
        self.assertNotIn("in  for", car.meta_description.lower())
        self.assertFalse(car.featured_image_alt.endswith(" in"))

        schema = InventoryDetailSerializer(car).data["schema_data"]
        self.assertNotIn("kmkm", schema["description"].lower())
        self.assertEqual(schema["mileageFromOdometer"]["value"], "0 km")

    def test_price_display_and_schema_offer_when_not_call_for_price(self):
        brand = Brand.objects.create(name="Lexus", status=BaseModel.StatusChoices.PUBLISHED)
        car = Inventory.objects.create(
            name="Lexus LX 600 Ultra Luxury",
            brand=brand,
            model_name="LX 600",
            year=2023,
            price="38000000.00",
            is_call_for_price=False,
            slug="lexus-lx-600-price-test",
        )
        data = InventoryDetailSerializer(car).data
        self.assertEqual(str(data["price"]), "38000000.00")
        self.assertFalse(data["is_call_for_price"])
        self.assertEqual(data["schema_data"]["offers"]["price"], "38000000")


class BrandSEOTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.published_brand = Brand.objects.create(
            name="Mercedes-Benz",
            order=1,
            segment=Brand.SegmentChoices.LUXURY_PERFORMANCE,
            status=BaseModel.StatusChoices.PUBLISHED,
            meta_title="Mercedes-Benz Luxury Cars in Dhaka",
            meta_description="Explore curated Mercedes-Benz collection.",
            h1_title="Mercedes-Benz Fleet",
        )
        self.unpublished_brand = Brand.objects.create(
            name="Unpublished Brand",
            order=2,
            status=BaseModel.StatusChoices.UNPUBLISHED,
        )

    def test_brand_list_serializer_includes_slug_and_segment(self):
        serializer = BrandListSerializer(self.published_brand)
        data = serializer.data
        self.assertIn("slug", data)
        self.assertEqual(data["slug"], "mercedes-benz")
        self.assertIn("segment", data)
        self.assertEqual(data["segment"], "Luxury & Performance")

    def test_brand_seo_by_id_success(self):
        res = self.client.get(f"/api/v1/inventory/brands/{self.published_brand.id}/seo/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(data["name"], "Mercedes-Benz")
        self.assertEqual(data["slug"], "mercedes-benz")
        self.assertEqual(data["meta_title"], "Mercedes-Benz Luxury Cars in Dhaka")
        self.assertEqual(data["h1_title"], "Mercedes-Benz Fleet")

    def test_brand_seo_by_slug_success(self):
        res = self.client.get("/api/v1/inventory/brands/mercedes-benz/seo/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(data["id"], self.published_brand.id)
        self.assertEqual(data["name"], "Mercedes-Benz")
        self.assertEqual(data["slug"], "mercedes-benz")

    def test_brand_seo_case_insensitive_slug(self):
        res = self.client.get("/api/v1/inventory/brands/Mercedes-Benz/seo/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(data["id"], self.published_brand.id)

    def test_brand_seo_numeric_slug_fallback(self):
        res = self.client.get(f"/api/v1/inventory/brands/{self.published_brand.id}/seo/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(data["id"], self.published_brand.id)

    def test_brand_seo_unpublished_returns_404(self):
        res = self.client.get(f"/api/v1/inventory/brands/{self.unpublished_brand.id}/seo/")
        self.assertEqual(res.status_code, 404)
        res_slug = self.client.get("/api/v1/inventory/brands/unpublished-brand/seo/")
        self.assertEqual(res_slug.status_code, 404)

    def test_brand_seo_nonexistent_returns_404(self):
        res = self.client.get("/api/v1/inventory/brands/nonexistent-brand/seo/")
        self.assertEqual(res.status_code, 404)

