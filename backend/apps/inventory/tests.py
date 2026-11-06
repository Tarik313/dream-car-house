from django.test import TestCase
from rest_framework.test import APIClient
from base.models import BaseModel
from apps.inventory.models import Brand
from apps.inventory.serializers import BrandListSerializer, BrandSEOSerializer


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

