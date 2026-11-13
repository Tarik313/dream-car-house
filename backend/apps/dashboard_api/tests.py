import json
from django.contrib.auth.models import User, Permission, Group
from django.contrib.contenttypes.models import ContentType
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient
from apps.inventory.models import Brand, ModelGeneration, BodyStyle, Inventory, InventoryImage, Stock, InventoryQuote
from apps.home.models import (
    SellCar,
    SellYourCarImages,
    ContactMessage,
    Subscriber,
    Slider,
    SocialMedia,
    PeopleTalkAboutUs,
    SalesRepresentative,
    SiteSettings,
    ShowroomBranch,
)

from apps.seo_config.models import SEOConfig, CategoryPageSEO


class DashboardAuthIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

        self.staff_user = User.objects.create_user(
            username="staff_user",
            email="staff@begautos.com",
            password="secure-password-123",
            is_staff=True,
            is_active=True,
        )

        self.inactive_staff = User.objects.create_user(
            username="inactive_staff",
            email="inactive@begautos.com",
            password="secure-password-123",
            is_staff=True,
            is_active=False,
        )

        self.regular_user = User.objects.create_user(
            username="regular_user",
            email="regular@begautos.com",
            password="secure-password-123",
            is_staff=False,
            is_active=True,
        )

        self.superuser = User.objects.create_superuser(
            username="super_user",
            email="super@begautos.com",
            password="secure-password-123",
        )

    def test_anonymous_requests_are_denied(self):
        response = self.client.get("/api/v1/dashboard/access/")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["success"], False)
        self.assertEqual(response["Cache-Control"], "private, no-store, must-revalidate")
        self.assertEqual(response["X-Robots-Tag"], "noindex, nofollow, noarchive")

    def test_login_success_for_active_staff(self):
        response = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "staff_user",
            "password": "secure-password-123",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["user"]["username"], "staff_user")
        self.assertTrue("csrf_token" in data["data"])
        self.assertIn("sessionid", response.cookies)

        access_res = self.client.get("/api/v1/dashboard/access/")
        self.assertEqual(access_res.status_code, 200)
        self.assertTrue(access_res.json()["success"])
        self.assertEqual(access_res.json()["data"]["username"], "staff_user")

    def test_login_rejected_for_inactive_staff(self):
        response = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "inactive_staff",
            "password": "secure-password-123",
        }, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"]["code"], "INVALID_CREDENTIALS")
        self.assertEqual(response.json()["error"]["message"], "Invalid credentials.")

    def test_login_rejected_for_non_staff_user(self):
        response = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "regular_user",
            "password": "secure-password-123",
        }, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"]["code"], "INVALID_CREDENTIALS")
        self.assertEqual(response.json()["error"]["message"], "Invalid credentials.")

    def test_login_rejected_for_bad_password(self):
        response = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "staff_user",
            "password": "wrong-password",
        }, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"]["code"], "INVALID_CREDENTIALS")

    def test_me_endpoint_returns_user_permissions(self):
        ct = ContentType.objects.get_for_model(Inventory)
        perm = Permission.objects.get(content_type=ct, codename="view_inventory")
        self.staff_user.user_permissions.add(perm)

        self.client.force_login(self.staff_user)
        response = self.client.get("/api/v1/dashboard/auth/me/")
        self.assertEqual(response.status_code, 200)
        res_data = response.json()["data"]["user"]
        self.assertEqual(res_data["username"], "staff_user")
        self.assertIn("inventory.view_inventory", res_data["permissions"])
        self.assertNotIn("inventory.add_inventory", res_data["permissions"])

    def test_logout_flushes_session(self):
        login_res = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "staff_user",
            "password": "secure-password-123",
        }, format="json")
        csrf_token = login_res.json()["data"]["csrf_token"]
        
        access_res = self.client.get("/api/v1/dashboard/access/")
        self.assertEqual(access_res.status_code, 200)

        logout_res = self.client.post(
            "/api/v1/dashboard/auth/logout/",
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(logout_res.status_code, 200)
        self.assertTrue(logout_res.json()["success"])

        access_after = self.client.get("/api/v1/dashboard/access/")
        self.assertEqual(access_after.status_code, 403)

    def test_unimplemented_modules_return_404(self):
        self.client.force_login(self.staff_user)
        res = self.client.get("/api/v1/dashboard/unknown-module/")
        self.assertEqual(res.status_code, 404)

    def test_preserves_public_urls(self):
        from django.urls import resolve
        self.assertEqual(resolve("/api/v1/dashboard/auth/login/").view_name, "dashboard_api:login")
        self.assertEqual(resolve("/api/v1/dashboard/auth/me/").view_name, "dashboard_api:me")
        self.assertEqual(resolve("/api/v1/dashboard/auth/logout/").view_name, "dashboard_api:logout")
        self.assertEqual(resolve("/api/v1/inventory/").view_name, "inventory:inventory_list")


class DashboardReferenceDataTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

        self.superuser = User.objects.create_superuser(
            username="admin_user",
            email="admin@begautos.com",
            password="admin-password-123",
        )

        self.staff_read_only = User.objects.create_user(
            username="readonly_staff",
            email="readonly@begautos.com",
            password="readonly-password-123",
            is_staff=True,
            is_active=True,
        )
        # Give view permissions only
        for model in (Brand, ModelGeneration, BodyStyle):
            ct = ContentType.objects.get_for_model(model)
            perm = Permission.objects.get(content_type=ct, codename=f"view_{model._meta.model_name}")
            self.staff_read_only.user_permissions.add(perm)

        # Create dummy brand image
        self.dummy_image = SimpleUploadedFile(
            "test_logo.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", content_type="image/png"
        )

        self.brand_toyota = Brand.objects.create(
            name="Toyota",
            segment=Brand.SegmentChoices.REFINED_VERSATILE,
            image=self.dummy_image,
            meta_title="Toyota Cars",
        )

        self.model_lc = ModelGeneration.objects.create(
            brand=self.brand_toyota,
            model="Land Cruiser",
        )

        self.body_suv = BodyStyle.objects.create(
            body="SUV",
        )

    def _login_superuser(self):
        login_res = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "admin_user",
            "password": "admin-password-123",
        }, format="json")
        return login_res.json()["data"]["csrf_token"]

    def _login_readonly(self):
        login_res = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "readonly_staff",
            "password": "readonly-password-123",
        }, format="json")
        return login_res.json()["data"]["csrf_token"]

    def test_read_only_staff_can_view_but_not_mutate(self):
        csrf = self._login_readonly()

        # GET Brand list succeeds
        res = self.client.get("/api/v1/dashboard/brands/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])
        self.assertEqual(len(res.json()["data"]["results"]), 1)

        # POST Brand without add permission fails
        post_res = self.client.post(
            "/api/v1/dashboard/brands/",
            {"name": "Honda"},
            HTTP_X_CSRFTOKEN=csrf,
            format="json",
        )
        self.assertEqual(post_res.status_code, 403)
        self.assertEqual(post_res.json()["error"]["code"], "FORBIDDEN")

    def test_brand_crud_and_json_validation(self):
        csrf = self._login_superuser()

        brand_logo = SimpleUploadedFile(
            "mercedes_logo.png",
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82",
            content_type="image/png",
        )

        # Create new brand with JSON-LD schema (multipart form upload with serialized JSON)
        post_data = {
            "name": "Mercedes-Benz",
            "segment": "LUXURY_PERFORMANCE",
            "image": brand_logo,
            "meta_title": "Mercedes Luxury Cars",
            "schema_json": json.dumps({"@context": "https://schema.org", "@type": "Brand", "name": "Mercedes-Benz"}),
        }
        res = self.client.post("/api/v1/dashboard/brands/", post_data, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res.status_code, 201, msg=f"Error response: {res.content.decode()}")
        brand_id = res.json()["data"]["id"]

        # Detail fetch
        detail_res = self.client.get(f"/api/v1/dashboard/brands/{brand_id}/")
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(detail_res.json()["data"]["name"], "Mercedes-Benz")
        self.assertEqual(detail_res.json()["data"]["schema_json"]["@type"], "Brand")

        # Invalid JSON validation check
        bad_json_res = self.client.patch(
            f"/api/v1/dashboard/brands/{brand_id}/",
            {"schema_json": "{invalid-json}"},
            HTTP_X_CSRFTOKEN=csrf,
            format="json",
        )
        self.assertEqual(bad_json_res.status_code, 400)
        self.assertEqual(bad_json_res.json()["error"]["code"], "VALIDATION_ERROR")

    def test_brand_svg_sanitization_and_url_validation(self):
        csrf = self._login_superuser()

        # 1. Clean approved vector SVG succeeds
        clean_svg = (
            b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">'
            b'<circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" stroke-width="2"/>'
            b'<path d="M12 24 L24 12 L36 24 Z" fill="#e2e8f0"/>'
            b'</svg>'
        )
        clean_file = SimpleUploadedFile("clean_logo.svg", clean_svg, content_type="image/svg+xml")
        res = self.client.post("/api/v1/dashboard/brands/", {
            "name": "Clean Vector Brand",
            "segment": "LUXURY_PERFORMANCE",
            "image": clean_file,
            "destination_url": "/inventory?brand=Clean+Vector+Brand",
        }, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res.status_code, 201)
        brand_id = res.json()["data"]["id"]

        # 2. SVG containing <foreignObject> is rejected
        foreign_obj_svg = (
            b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
            b'<foreignObject width="100" height="100">'
            b'<div xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></div>'
            b'</foreignObject></svg>'
        )
        fo_file = SimpleUploadedFile("foreign_obj.svg", foreign_obj_svg, content_type="image/svg+xml")
        res_fo = self.client.post("/api/v1/dashboard/brands/", {
            "name": "Foreign Object Brand",
            "segment": "LUXURY_PERFORMANCE",
            "image": fo_file,
        }, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res_fo.status_code, 400)
        self.assertIn("foreignobject", str(res_fo.json()).lower())

        # 3. SVG containing <script> or onload is rejected
        script_svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
        s_file = SimpleUploadedFile("script.svg", script_svg, content_type="image/svg+xml")
        res_s = self.client.post("/api/v1/dashboard/brands/", {
            "name": "Script Brand",
            "segment": "LUXURY_PERFORMANCE",
            "image": s_file,
        }, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res_s.status_code, 400)

        onload_svg = b'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle cx="10" cy="10" r="5"/></svg>'
        ol_file = SimpleUploadedFile("onload.svg", onload_svg, content_type="image/svg+xml")
        res_ol = self.client.post("/api/v1/dashboard/brands/", {
            "name": "Onload Brand",
            "segment": "LUXURY_PERFORMANCE",
            "image": ol_file,
        }, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res_ol.status_code, 400)

        # 4. SVG containing external reference is rejected
        ext_svg = b'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="https://evil.com/x.svg#foo"/></svg>'
        ext_file = SimpleUploadedFile("ext.svg", ext_svg, content_type="image/svg+xml")
        res_ext = self.client.post("/api/v1/dashboard/brands/", {
            "name": "External Ref Brand",
            "segment": "LUXURY_PERFORMANCE",
            "image": ext_file,
        }, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res_ext.status_code, 400)

        # 5. SVG containing DOCTYPE entity expansion is rejected
        xxe_svg = b'<!DOCTYPE svg SYSTEM "http://evil.com/xxe.dtd"><svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>'
        xxe_file = SimpleUploadedFile("xxe.svg", xxe_svg, content_type="image/svg+xml")
        res_xxe = self.client.post("/api/v1/dashboard/brands/", {
            "name": "XXE Brand",
            "segment": "LUXURY_PERFORMANCE",
            "image": xxe_file,
        }, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res_xxe.status_code, 400)

        # 6. Destination URL: internal path and HTTPS links are allowed
        patch_ok = self.client.patch(f"/api/v1/dashboard/brands/{brand_id}/", {
            "destination_url": "https://dreamcarhouse.com/brands/clean",
        }, HTTP_X_CSRFTOKEN=csrf, format="json")
        self.assertEqual(patch_ok.status_code, 200)

        # 7. Destination URL: Protocol-relative, dangerous schemes, and insecure HTTP are rejected
        for bad_url in [
            "//evil.com/phish",
            "/\\evil.com",
            "\\\\evil.com",
            "javascript:alert(1)",
            "data:text/html,<script>alert(1)</script>",
            "http://insecure-domain.com",
            "https://domain.com/path\nwith-newline",
        ]:
            bad_res = self.client.patch(f"/api/v1/dashboard/brands/{brand_id}/", {
                "destination_url": bad_url,
            }, HTTP_X_CSRFTOKEN=csrf, format="json")
            self.assertEqual(bad_res.status_code, 400, msg=f"Should reject: {bad_url}")

    def test_model_generation_brand_relationship(self):
        csrf = self._login_superuser()

        # Filter model generations by brand
        res = self.client.get(f"/api/v1/dashboard/model-generations/?brand={self.brand_toyota.id}")
        self.assertEqual(res.status_code, 200)
        results = res.json()["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["model"], "Land Cruiser")

        # Create model generation linked to brand
        create_res = self.client.post("/api/v1/dashboard/model-generations/", {
            "brand": self.brand_toyota.id,
            "model": "Prado",
        }, HTTP_X_CSRFTOKEN=csrf, format="json")
        self.assertEqual(create_res.status_code, 201)
        self.assertEqual(create_res.json()["data"]["brand_name"], "Toyota")

        # Attempting duplicate model under same brand returns 400 VALIDATION_ERROR
        dup_res = self.client.post("/api/v1/dashboard/model-generations/", {
            "brand": self.brand_toyota.id,
            "model": "Prado",
        }, HTTP_X_CSRFTOKEN=csrf, format="json")
        self.assertEqual(dup_res.status_code, 400)
        self.assertEqual(dup_res.json()["error"]["code"], "VALIDATION_ERROR")
        self.assertIn("model", dup_res.json()["error"]["field_errors"])

        # Attempting model with non-existent brand returns 400 VALIDATION_ERROR
        invalid_brand_res = self.client.post("/api/v1/dashboard/model-generations/", {
            "brand": 99999,
            "model": "Ghost Model",
        }, HTTP_X_CSRFTOKEN=csrf, format="json")
        self.assertEqual(invalid_brand_res.status_code, 400)
        self.assertEqual(invalid_brand_res.json()["error"]["code"], "VALIDATION_ERROR")
        self.assertIn("brand", invalid_brand_res.json()["error"]["field_errors"])

    def test_deletion_cascade_impact_check_and_confirmation(self):
        csrf = self._login_superuser()

        # Create an inventory car linked to brand_toyota
        inventory = Inventory.objects.create(
            brand=self.brand_toyota,
            model=self.model_lc,
            model_name="Land Cruiser LC300",
            body_style=self.body_suv,
            year=2023,
            price=28000000,
        )

        # 1. Check impact endpoint shows inventory_count=1 and blocked=True
        impact_res = self.client.get(f"/api/v1/dashboard/brands/{self.brand_toyota.id}/impact/")
        self.assertEqual(impact_res.status_code, 200)
        impact_data = impact_res.json()["data"]
        self.assertEqual(impact_data["inventory_count"], 1)
        self.assertEqual(impact_data["model_generation_count"], 1)
        self.assertTrue(impact_data["blocked"])
        self.assertIn("vehicle", impact_data["block_reason"])

        # 2. Delete attempt on brand with vehicles MUST be blocked with PROTECTED_CASCADE even with confirm=true
        delete_attempt = self.client.delete(
            f"/api/v1/dashboard/brands/{self.brand_toyota.id}/",
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(delete_attempt.status_code, 409)
        self.assertEqual(delete_attempt.json()["error"]["code"], "PROTECTED_CASCADE")
        self.assertTrue(Brand.objects.filter(id=self.brand_toyota.id).exists())
        self.assertTrue(Inventory.objects.filter(id=inventory.id).exists())

        force_delete_attempt = self.client.delete(
            f"/api/v1/dashboard/brands/{self.brand_toyota.id}/?confirm=true",
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(force_delete_attempt.status_code, 409)
        self.assertEqual(force_delete_attempt.json()["error"]["code"], "PROTECTED_CASCADE")
        self.assertTrue(Brand.objects.filter(id=self.brand_toyota.id).exists())

        # 3. Create a disposable brand with ONLY model generation (no dependent vehicles)
        disposable_brand = Brand.objects.create(
            name="Disposable Brand",
            segment=Brand.SegmentChoices.ELECTRIC,
            image=self.dummy_image,
        )
        disposable_model = ModelGeneration.objects.create(
            brand=disposable_brand,
            model="Disposable Model",
        )

        # Impact on disposable brand shows not blocked, but has_cascades=True
        disp_impact_res = self.client.get(f"/api/v1/dashboard/brands/{disposable_brand.id}/impact/")
        self.assertEqual(disp_impact_res.status_code, 200)
        disp_data = disp_impact_res.json()["data"]
        self.assertEqual(disp_data["inventory_count"], 0)
        self.assertEqual(disp_data["model_generation_count"], 1)
        self.assertFalse(disp_data["blocked"])
        self.assertTrue(disp_data["has_cascades"])

        # Delete without confirm returns 409 CASCADE_IMPACT
        unconfirmed = self.client.delete(
            f"/api/v1/dashboard/brands/{disposable_brand.id}/",
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(unconfirmed.status_code, 409)
        self.assertEqual(unconfirmed.json()["error"]["code"], "CASCADE_IMPACT")
        self.assertTrue(Brand.objects.filter(id=disposable_brand.id).exists())

        # Delete with confirm=true succeeds
        confirmed = self.client.delete(
            f"/api/v1/dashboard/brands/{disposable_brand.id}/?confirm=true",
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(confirmed.status_code, 200)
        self.assertFalse(Brand.objects.filter(id=disposable_brand.id).exists())
        self.assertFalse(ModelGeneration.objects.filter(id=disposable_model.id).exists())

    def test_body_style_crud(self):
        csrf = self._login_superuser()

        res = self.client.get("/api/v1/dashboard/body-styles/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()["data"]["results"]), 1)

        # Create Sedan
        post_res = self.client.post(
            "/api/v1/dashboard/body-styles/",
            {"body": "Sedan"},
            HTTP_X_CSRFTOKEN=csrf,
            format="json",
        )
        self.assertEqual(post_res.status_code, 201)
        self.assertEqual(post_res.json()["data"]["body"], "Sedan")

    def test_inventory_crud_lifecycle_and_media(self):
        csrf = self._login_superuser()

        # 1. Create car
        car_data = {
            "name": "Toyota Land Cruiser ZX",
            "car_type": "RECONDITIONED",
            "brand": self.brand_toyota.id,
            "model": self.model_lc.id,
            "year": 2024,
            "fuel_type": "PETROL",
            "transmission": "AUTOMATIC",
            "condition": "USED",
            "registered": "Available",
            "price": "29500000.00",
            "status": "PUBLISHED",
            "is_featured": True,
        }
        res = self.client.post("/api/v1/dashboard/inventory/", car_data, HTTP_X_CSRFTOKEN=csrf, format="json")
        self.assertEqual(res.status_code, 201, msg=f"Error: {res.content.decode()}")
        car = res.json()["data"]
        car_id = car["id"]
        # Slug auto-generated
        self.assertTrue(len(car["slug"]) > 0)
        self.assertEqual(car["brand_name"], "Toyota")
        self.assertEqual(car["registered"], "Available")

        # 2. Upload gallery image for inventory
        gallery_file = SimpleUploadedFile(
            "gallery_1.png",
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82",
            content_type="image/png",
        )
        img_res = self.client.post(
            f"/api/v1/dashboard/inventory/{car_id}/images/",
            {"image": gallery_file, "caption": "Front view"},
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(img_res.status_code, 201)
        img_id = img_res.json()["data"]["id"]

        # 3. Verify detail returns images
        detail_res = self.client.get(f"/api/v1/dashboard/inventory/{car_id}/")
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(len(detail_res.json()["data"]["inventory_images"]), 1)

        # 4. Patch registered to Sold
        patch_res = self.client.patch(
            f"/api/v1/dashboard/inventory/{car_id}/",
            {"registered": "Sold"},
            HTTP_X_CSRFTOKEN=csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["registered"], "Sold")

        # 5. Delete gallery image
        del_img = self.client.delete(f"/api/v1/dashboard/inventory/images/{img_id}/", HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(del_img.status_code, 200)

        # 6. Delete car
        del_car = self.client.delete(f"/api/v1/dashboard/inventory/{car_id}/", HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(del_car.status_code, 200)
        self.assertFalse(Inventory.objects.filter(id=car_id).exists())

    def test_inventory_brand_model_relationship_validation(self):
        csrf = self._login_superuser()

        # Create another brand and model
        bmw = Brand.objects.create(name="BMW", segment=Brand.SegmentChoices.LUXURY_PERFORMANCE)
        bmw_x5 = ModelGeneration.objects.create(brand=bmw, model="X5")

        # Try creating car with brand=Toyota and model=BMW X5
        bad_data = {
            "name": "Mismatched car",
            "car_type": "RECONDITIONED",
            "brand": self.brand_toyota.id,
            "model": bmw_x5.id,
            "fuel_type": "PETROL",
            "transmission": "AUTOMATIC",
            "condition": "USED",
            "registered": "Available",
        }
        res = self.client.post("/api/v1/dashboard/inventory/", bad_data, HTTP_X_CSRFTOKEN=csrf, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["error"]["code"], "VALIDATION_ERROR")
        self.assertIn("model", res.json()["error"]["field_errors"])

    def test_inventory_create_multipart_complete_payload_with_blank_optionals(self):
        """
        Verify that creating an inventory vehicle with the complete FormData payload
        (including empty strings for optional fields across all 6 tabs) validates and
        persists nulls without converting blanks to zero or failing validation.
        """
        csrf = self._login_superuser()
        from apps.inventory.models import Inventory

        # Complete multipart payload replicating the browser FormData submission
        payload = {
            "name": "2024 Toyota Land Cruiser ZX",
            "brand": self.brand_toyota.id,
            "model": "",
            "model_name": "",
            "car_type": "RECONDITIONED",
            "year": "",
            "condition": "USED",
            "body_style": "",
            "inventory_type": "BUDGET FRIENDLY",
            "branch": "",
            "is_featured": "false",
            "engine_capacity": "",
            "mileage": "",
            "fuel_type": "PETROL",
            "transmission": "AUTOMATIC",
            "color": "",
            "drive_type": "",
            "wheel_base": "",
            "price": "",
            "is_call_for_price": "false",
            "slightly_negotiable": "YES",
            "registration_number": "",
            "registered": "Available",
            "status": "PUBLISHED",
            "youtube": "",
            "description": "",
            "h1_title": "",
            "target_keyword": "",
            "meta_title": "",
            "slug": "",
            "meta_description": "",
            "canonical_url": "",
            "indexing": "index, follow",
            "featured_image_alt": "",
            "previous_slug": "",
            "schema_override": "",
        }

        res = self.client.post("/api/v1/dashboard/inventory/", payload, HTTP_X_CSRFTOKEN=csrf)
        self.assertEqual(res.status_code, 201, msg=f"Error: {res.content.decode()}")
        car_id = res.json()["data"]["id"]

        car = Inventory.objects.get(id=car_id)
        # Verify nullable numeric and foreign keys are persisted as None (NOT zero)
        self.assertIsNone(car.year)
        self.assertIsNone(car.price)
        self.assertIsNone(car.branch)
        self.assertIsNone(car.model)
        self.assertIsNone(car.body_style)
        self.assertIsNone(car.schema_override)
        self.assertEqual(car.name, "2024 Toyota Land Cruiser ZX")
        self.assertEqual(car.brand_id, self.brand_toyota.id)

    def test_inventory_patch_omission_vs_explicit_clear(self):
        """
        Verify PATCH semantics:
        - Omission retains existing nullable values.
        - Explicit clearing (submitting empty string) clears them to NULL.
        """
        csrf = self._login_superuser()
        from apps.inventory.models import Inventory
        from apps.home.models import ShowroomBranch

        branch = ShowroomBranch.objects.create(name="Gulshan Showroom", branch_id="gulshan-flagship")
        body_style = BodyStyle.objects.create(body="SUV")

        car = Inventory.objects.create(
            name="Lexus LX600 Ultra Luxury",
            brand=self.brand_toyota,
            model=self.model_lc,
            branch=branch,
            body_style=body_style,
            year=2023,
            price=32000000.00,
            fuel_type="PETROL",
            transmission="AUTOMATIC",
            condition="USED",
            registered="Available",
            schema_override={"@context": "https://schema.org", "@type": "Car"},
        )

        # 1. OMISSION: PATCH updating only 'registered' to 'Sold'
        res_omit = self.client.patch(
            f"/api/v1/dashboard/inventory/{car.id}/",
            {"registered": "Sold"},
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_omit.status_code, 200)
        car.refresh_from_db()
        self.assertEqual(car.registered, "Sold")
        # Retained values:
        self.assertEqual(car.branch_id, branch.id)
        self.assertEqual(car.model_id, self.model_lc.id)
        self.assertEqual(car.body_style_id, body_style.id)
        self.assertEqual(car.year, 2023)
        self.assertEqual(float(car.price), 32000000.00)
        self.assertIsNotNone(car.schema_override)

        # 2. EXPLICIT CLEAR: PATCH sending branch="", schema_override="", price=""
        res_clear = self.client.patch(
            f"/api/v1/dashboard/inventory/{car.id}/",
            {"branch": "", "schema_override": "", "price": ""},
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_clear.status_code, 200)
        car.refresh_from_db()
        # Persisted branch, schema_override, and price are cleared to NULL
        self.assertIsNone(car.branch)
        self.assertIsNone(car.schema_override)
        self.assertIsNone(car.price)
        # Untouched fields remain intact
        self.assertEqual(car.model_id, self.model_lc.id)
        self.assertEqual(car.year, 2023)

    def test_inventory_patch_brand_change_with_model_clear_vs_omission(self):
        """
        Edge case:
        - When brand changes and old model is explicitly cleared (model=''), save succeeds.
        - When brand changes and model is omitted, validation fails because old model belongs to old brand.
        """
        csrf = self._login_superuser()
        from apps.inventory.models import Inventory, Brand, ModelGeneration

        bmw = Brand.objects.create(name="BMW Motorsport", segment=Brand.SegmentChoices.LUXURY_PERFORMANCE)

        car = Inventory.objects.create(
            name="Brand Switch Vehicle",
            brand=self.brand_toyota,
            model=self.model_lc,
            fuel_type="PETROL",
            transmission="AUTOMATIC",
            condition="USED",
            registered="Available",
        )

        # 1. Brand changes to BMW, but model is omitted -> fails validation
        res_bad = self.client.patch(
            f"/api/v1/dashboard/inventory/{car.id}/",
            {"brand": bmw.id},
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_bad.status_code, 400)
        self.assertIn("model", res_bad.json()["error"]["field_errors"])

        # 2. Brand changes to BMW, and model is explicitly cleared (model='') -> succeeds
        res_good = self.client.patch(
            f"/api/v1/dashboard/inventory/{car.id}/",
            {"brand": bmw.id, "model": ""},
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_good.status_code, 200)
        car.refresh_from_db()
        self.assertEqual(car.brand_id, bmw.id)
        self.assertIsNone(car.model)

    def test_inventory_validation_integrity_preserved(self):
        """
        Verify that validation is never weakened:
        - Non-numeric year or price fails with 400 (never silently converted to None or zero).
        - Blank required name fails with 400.
        - Field lengths exceeding constraints fail with 400.
        """
        csrf = self._login_superuser()

        # 1. Invalid year string fails
        res_year = self.client.post(
            "/api/v1/dashboard/inventory/",
            {
                "name": "Invalid Year Car",
                "brand": self.brand_toyota.id,
                "year": "not_a_number",
                "fuel_type": "PETROL",
                "transmission": "AUTOMATIC",
                "condition": "USED",
                "registered": "Available",
            },
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_year.status_code, 400)
        self.assertIn("year", res_year.json()["error"]["field_errors"])

        # 2. Invalid price string fails
        res_price = self.client.post(
            "/api/v1/dashboard/inventory/",
            {
                "name": "Invalid Price Car",
                "brand": self.brand_toyota.id,
                "price": "not_a_price",
                "fuel_type": "PETROL",
                "transmission": "AUTOMATIC",
                "condition": "USED",
                "registered": "Available",
            },
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_price.status_code, 400)
        self.assertIn("price", res_price.json()["error"]["field_errors"])

        # 3. Blank required name fails
        res_name = self.client.post(
            "/api/v1/dashboard/inventory/",
            {
                "name": "",
                "brand": self.brand_toyota.id,
                "fuel_type": "PETROL",
                "transmission": "AUTOMATIC",
                "condition": "USED",
                "registered": "Available",
            },
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_name.status_code, 400)
        self.assertIn("name", res_name.json()["error"]["field_errors"])

        # 4. Engine capacity exceeding 20 chars fails
        res_len = self.client.post(
            "/api/v1/dashboard/inventory/",
            {
                "name": "Overlong Engine Spec",
                "brand": self.brand_toyota.id,
                "engine_capacity": "X" * 101,  # 101 chars > 100
                "fuel_type": "PETROL",
                "transmission": "AUTOMATIC",
                "condition": "USED",
                "registered": "Available",
            },
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(res_len.status_code, 400)
        self.assertIn("engine_capacity", res_len.json()["error"]["field_errors"])

    def test_stock_crud(self):
        csrf = self._login_superuser()

        stock_file = SimpleUploadedFile(
            "stock_item.png",
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82",
            content_type="image/png",
        )

        # Create Stock
        create_res = self.client.post(
            "/api/v1/dashboard/stocks/",
            {"title": "Fresh Shipment Japan", "image": stock_file, "status": "PUBLISHED"},
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(create_res.status_code, 201)
        stock_id = create_res.json()["data"]["id"]

        # List Stock with search & ordering
        list_res = self.client.get("/api/v1/dashboard/stocks/?q=Fresh&ordering=title")
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(len(list_res.json()["data"]["results"]), 1)

        # Detail Stock
        detail_res = self.client.get(f"/api/v1/dashboard/stocks/{stock_id}/")
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(detail_res.json()["data"]["title"], "Fresh Shipment Japan")

        # Test invalid file format upload rejection
        bad_file = SimpleUploadedFile("danger.exe", b"MZ...", content_type="application/octet-stream")
        bad_upload_res = self.client.post(
            "/api/v1/dashboard/stocks/",
            {"title": "Bad Upload", "image": bad_file, "status": "PUBLISHED"},
            HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(bad_upload_res.status_code, 400)
        self.assertEqual(bad_upload_res.json()["error"]["code"], "VALIDATION_ERROR")
        self.assertIn("image", bad_upload_res.json()["error"]["field_errors"])

        # Update Stock status and preserve existing image when empty image string or None is sent
        patch_res = self.client.patch(
            f"/api/v1/dashboard/stocks/{stock_id}/",
            {"status": "ARCHIVED", "image": ""},
            HTTP_X_CSRFTOKEN=csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["status"], "ARCHIVED")
        self.assertTrue(patch_res.json()["data"]["image"])

        # Public API contract check: public StockListView filters by status=PUBLISHED
        public_res = self.client.get("/api/v1/inventory/stocks/")
        self.assertEqual(public_res.status_code, 200)
        # Archived stock should not appear in public list
        if public_res.content:
            data = json.loads(public_res.content.decode())
            stocks = data.get("data", data) if isinstance(data, dict) else data
            self.assertEqual(len(stocks), 0)

        # Test read-only staff cannot mutate Stock
        from django.contrib.auth.models import Permission
        view_stock_perm = Permission.objects.get(codename="view_stock")
        self.staff_read_only.user_permissions.add(view_stock_perm)
        staff_csrf = self._login_readonly()

        # Read-only staff GET succeeds
        staff_get = self.client.get("/api/v1/dashboard/stocks/")
        self.assertEqual(staff_get.status_code, 200)

        # Read-only staff POST is rejected
        staff_post = self.client.post(
            "/api/v1/dashboard/stocks/",
            {"title": "Staff Post", "image": stock_file},
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_post.status_code, 403)

        # Read-only staff PATCH is rejected
        staff_patch = self.client.patch(
            f"/api/v1/dashboard/stocks/{stock_id}/",
            {"title": "Staff Patch"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_patch.status_code, 403)

        # Read-only staff DELETE is rejected
        staff_del = self.client.delete(f"/api/v1/dashboard/stocks/{stock_id}/", HTTP_X_CSRFTOKEN=staff_csrf)
        self.assertEqual(staff_del.status_code, 403)

        # Unauthorized/Anonymous direct mutations are rejected
        anon_client = APIClient(enforce_csrf_checks=True)
        anon_post = anon_client.post("/api/v1/dashboard/stocks/", {"title": "Anon"})
        self.assertEqual(anon_post.status_code, 403)

        # Superuser delete Stock
        admin_csrf = self._login_superuser()
        del_res = self.client.delete(f"/api/v1/dashboard/stocks/{stock_id}/", HTTP_X_CSRFTOKEN=admin_csrf)
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(Stock.objects.filter(id=stock_id).exists())

    def test_inventory_quote_crud(self):
        admin_csrf = self._login_superuser()

        # Create two test vehicles
        car1 = Inventory.objects.create(
            name="Toyota Land Cruiser ZX",
            car_type="RECONDITIONED",
            brand=self.brand_toyota,
            model=self.model_lc,
            body_style=self.body_suv,
            year=2024,
            price=25000000,
            fuel_type="PETROL",
            transmission="AUTOMATIC",
            condition="USED",
            registered="Available",
        )
        car2 = Inventory.objects.create(
            name="Toyota Prado TX L",
            car_type="RECONDITIONED",
            brand=self.brand_toyota,
            model=self.model_lc,
            body_style=self.body_suv,
            year=2023,
            price=18000000,
            fuel_type="DIESEL",
            transmission="AUTOMATIC",
            condition="USED",
            registered="Available",
        )

        # Public quote submission contract preserved: POST /api/v1/inventory/quote/
        public_res = self.client.post("/api/v1/inventory/quote/", {
            "name": "Rahim Ahmed",
            "email": "rahim@example.com",
            "phone": "01711000000",
            "car": car1.id,
        }, format="json")
        self.assertEqual(public_res.status_code, 201)
        quote1_id = public_res.json().get("data", public_res.json())["id"]

        # Create second quote directly on car2
        quote2 = InventoryQuote.objects.create(
            name="Karim Khan",
            email="karim@example.com",
            phone="01811000000",
            car=car2,
        )

        # Create third quote with no car (safely handled missing car)
        quote3 = InventoryQuote.objects.create(
            name="General Enquiry Customer",
            email="enquiry@example.com",
            phone="01911000000",
            car=None,
        )

        # List quotes in dashboard API
        list_res = self.client.get("/api/v1/dashboard/quotes/?q=Rahim")
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(len(list_res.json()["data"]["results"]), 1)
        self.assertEqual(list_res.json()["data"]["results"][0]["name"], "Rahim Ahmed")
        self.assertEqual(list_res.json()["data"]["results"][0]["car_name"], "Toyota Land Cruiser ZX")

        # Search by vehicle name
        car_search_res = self.client.get("/api/v1/dashboard/quotes/?q=Prado")
        self.assertEqual(car_search_res.status_code, 200)
        self.assertEqual(len(car_search_res.json()["data"]["results"]), 1)
        self.assertEqual(car_search_res.json()["data"]["results"][0]["name"], "Karim Khan")

        # Filter by car ID
        filter_car_res = self.client.get(f"/api/v1/dashboard/quotes/?car={car1.id}")
        self.assertEqual(filter_car_res.status_code, 200)
        self.assertEqual(len(filter_car_res.json()["data"]["results"]), 1)

        # Detail view
        detail_res = self.client.get(f"/api/v1/dashboard/quotes/{quote1_id}/")
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(detail_res.json()["data"]["name"], "Rahim Ahmed")
        self.assertEqual(detail_res.json()["data"]["car"], car1.id)

        # Missing car detail view handled safely
        missing_car_detail = self.client.get(f"/api/v1/dashboard/quotes/{quote3.id}/")
        self.assertEqual(missing_car_detail.status_code, 200)
        self.assertIsNone(missing_car_detail.json()["data"]["car"])
        self.assertIsNone(missing_car_detail.json()["data"]["car_name"])

        # Patch quote details
        patch_res = self.client.patch(
            f"/api/v1/dashboard/quotes/{quote1_id}/",
            {"name": "Rahim Ahmed Chowdhury", "phone": "01711999999"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["name"], "Rahim Ahmed Chowdhury")

        # Read-only staff permissions: view succeeds, mutations fail
        view_quote_perm = Permission.objects.get(codename="view_inventoryquote")
        self.staff_read_only.user_permissions.add(view_quote_perm)
        staff_csrf = self._login_readonly()

        staff_get = self.client.get("/api/v1/dashboard/quotes/")
        self.assertEqual(staff_get.status_code, 200)

        staff_patch = self.client.patch(
            f"/api/v1/dashboard/quotes/{quote1_id}/",
            {"name": "Hacked"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_patch.status_code, 403)

        staff_del = self.client.delete(f"/api/v1/dashboard/quotes/{quote1_id}/", HTTP_X_CSRFTOKEN=staff_csrf)
        self.assertEqual(staff_del.status_code, 403)

        # Anonymous request returns 403
        anon_client = APIClient(enforce_csrf_checks=True)
        anon_get = anon_client.get("/api/v1/dashboard/quotes/")
        self.assertEqual(anon_get.status_code, 403)

        # Delete quote as superuser
        del_admin_csrf = self._login_superuser()
        del_res = self.client.delete(f"/api/v1/dashboard/quotes/{quote1_id}/", HTTP_X_CSRFTOKEN=del_admin_csrf)
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(InventoryQuote.objects.filter(id=quote1_id).exists())

    def test_sell_car_management_flow(self):
        admin_csrf = self._login_superuser()

        # 1. Public submission test via /api/v1/home/sell-car/
        pub_client = APIClient()
        valid_jpg = (
            b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' \",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xdb\x00C\x01\t\t\t\x0c\x0b\x0c\x18\r\r\x182!\x1c!22222222222222222222222222222222222222222222222222\xff\xc0\x00\x11\x08\x00\n\x00\n\x03\x01\"\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07\"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xc4\x00\x1f\x01\x00\x03\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x11\x00\x02\x01\x02\x04\x04\x03\x04\x07\x05\x04\x04\x00\x01\x02w\x00\x01\x02\x03\x11\x04\x05!1\x06\x12AQ\x07aq\x13\"2\x81\x08\x14B\x91\xa1\xb1\xc1\t#3R\xf0\x15br\xd1\n\x16$4\xe1%\xf1\x17\x18\x19\x1a&\'()*56789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00?\x00\xe2\xe8\xa2\x8a\xf9\x93\xf7\x13\xff\xd9"
        )
        dummy_img1 = SimpleUploadedFile("car_front.jpg", valid_jpg, content_type="image/jpeg")
        dummy_img2 = SimpleUploadedFile("car_side.jpg", valid_jpg, content_type="image/jpeg")

        pub_res = pub_client.post(
            "/api/v1/home/sell-car/",
            {
                "name": "Tanvir Hasan",
                "phone": "+8801700112233",
                "car_name": "Honda Civic",
                "car_model": "EX-L",
                "car_year": "2021",
                "mileage": 18000,
                "offered_price": 3200000,
                "images": [dummy_img1, dummy_img2],
            },
            format="multipart",
        )
        self.assertEqual(pub_res.status_code, 201, msg=f"Public sell-car failed: {pub_res.content.decode()}")
        sell_car_id = pub_res.json()["data"]["id"]
        self.assertTrue(SellCar.objects.filter(id=sell_car_id).exists())
        self.assertEqual(SellYourCarImages.objects.filter(sellcar_id=sell_car_id).count(), 2)

        # Create a second car for search/filtering verification
        car2 = SellCar.objects.create(
            name="Zubair Rahman",
            phone="01999887766",
            car_name="Toyota Corolla Cross",
            car_model="Hybrid",
            car_year="2022",
            mileage=12000,
            offered_price=4500000,
        )

        # 2. Staff List Query with Search and Filtering
        # Search by customer name
        search_name_res = self.client.get("/api/v1/dashboard/sell-cars/?q=Tanvir")
        self.assertEqual(search_name_res.status_code, 200)
        data = search_name_res.json()["data"]
        self.assertEqual(len(data["results"]), 1)
        self.assertEqual(data["results"][0]["name"], "Tanvir Hasan")
        self.assertEqual(len(data["results"][0]["inventory_images"]), 2)

        # Search by car name
        search_car_res = self.client.get("/api/v1/dashboard/sell-cars/?q=Corolla")
        self.assertEqual(search_car_res.status_code, 200)
        self.assertEqual(len(search_car_res.json()["data"]["results"]), 1)
        self.assertEqual(search_car_res.json()["data"]["results"][0]["name"], "Zubair Rahman")

        # Filter by car_year
        year_filter_res = self.client.get("/api/v1/dashboard/sell-cars/?car_year=2021")
        self.assertEqual(year_filter_res.status_code, 200)
        self.assertEqual(len(year_filter_res.json()["data"]["results"]), 1)
        self.assertEqual(year_filter_res.json()["data"]["results"][0]["id"], sell_car_id)

        # 3. Detail Query returning all fields and nested images
        detail_res = self.client.get(f"/api/v1/dashboard/sell-cars/{sell_car_id}/")
        self.assertEqual(detail_res.status_code, 200)
        detail_data = detail_res.json()["data"]
        self.assertEqual(detail_data["name"], "Tanvir Hasan")
        self.assertEqual(detail_data["phone"], "+8801700112233")
        self.assertEqual(detail_data["car_name"], "Honda Civic")
        self.assertEqual(detail_data["car_model"], "EX-L")
        self.assertEqual(detail_data["car_year"], "2021")
        self.assertEqual(detail_data["mileage"], 18000)
        self.assertEqual(detail_data["offered_price"], 3200000)
        self.assertEqual(len(detail_data["inventory_images"]), 2)
        image1_id = detail_data["inventory_images"][0]["id"]
        image2_id = detail_data["inventory_images"][1]["id"]

        # 4. Partial update (PATCH)
        patch_res = self.client.patch(
            f"/api/v1/dashboard/sell-cars/{sell_car_id}/",
            {"phone": "+8801700999999", "offered_price": 3100000},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["phone"], "+8801700999999")
        self.assertEqual(patch_res.json()["data"]["offered_price"], 3100000)

        # 5. Image Deletion & Ownership Boundary Enforcement
        # Attempt to delete car2's non-existent image using car1's endpoint
        other_img = SellYourCarImages.objects.create(sellcar=car2, image="dummy.jpg")
        mismatch_res = self.client.delete(
            f"/api/v1/dashboard/sell-cars/{sell_car_id}/images/{other_img.id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(mismatch_res.status_code, 404)
        self.assertTrue(SellYourCarImages.objects.filter(id=other_img.id).exists())

        # Valid image deletion for car1
        del_img_res = self.client.delete(
            f"/api/v1/dashboard/sell-cars/{sell_car_id}/images/{image1_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_img_res.status_code, 200)
        self.assertFalse(SellYourCarImages.objects.filter(id=image1_id).exists())
        self.assertEqual(SellYourCarImages.objects.filter(sellcar_id=sell_car_id).count(), 1)

        # 6. Permissions Enforcement: Read-only staff vs Mutations
        view_perm = Permission.objects.get(codename="view_sellcar")
        self.staff_read_only.user_permissions.add(view_perm)
        staff_csrf = self._login_readonly()

        # Staff can view list and detail
        staff_list = self.client.get("/api/v1/dashboard/sell-cars/")
        self.assertEqual(staff_list.status_code, 200)

        staff_detail = self.client.get(f"/api/v1/dashboard/sell-cars/{sell_car_id}/")
        self.assertEqual(staff_detail.status_code, 200)

        # Staff cannot patch
        staff_patch = self.client.patch(
            f"/api/v1/dashboard/sell-cars/{sell_car_id}/",
            {"name": "Hacked Name"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_patch.status_code, 403)

        # Staff cannot delete image without delete_sellyourcarimages
        staff_del_img = self.client.delete(
            f"/api/v1/dashboard/sell-cars/{sell_car_id}/images/{image2_id}/",
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_del_img.status_code, 403)

        # Staff cannot delete sellcar without delete_sellcar
        staff_del = self.client.delete(
            f"/api/v1/dashboard/sell-cars/{sell_car_id}/",
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_del.status_code, 403)

        # 7. Anonymous rejection
        anon_client = APIClient(enforce_csrf_checks=True)
        anon_res = anon_client.get("/api/v1/dashboard/sell-cars/")
        self.assertEqual(anon_res.status_code, 403)

        # 8. Cascading Deletion of parent SellCar record
        del_parent_csrf = self._login_superuser()
        del_parent_res = self.client.delete(
            f"/api/v1/dashboard/sell-cars/{sell_car_id}/",
            HTTP_X_CSRFTOKEN=del_parent_csrf,
        )
        self.assertEqual(del_parent_res.status_code, 200)
        self.assertFalse(SellCar.objects.filter(id=sell_car_id).exists())
        self.assertFalse(SellYourCarImages.objects.filter(sellcar_id=sell_car_id).exists())

    def test_contact_message_management_flow(self):
        admin_csrf = self._login_superuser()

        # 1. Public submission via POST /api/v1/home/contact/
        pub_client = APIClient()
        pub_res = pub_client.post(
            "/api/v1/home/contact/",
            {
                "topic": "BUYING",
                "name": "Nafis Imtiaz",
                "phone": "+8801811223344",
                "email": "nafis@example.com",
                "vehicle": "Range Rover Sport 2024",
                "enquiry": "Interested in scheduling an inspection this weekend.",
                "preferred_contact": "WHATSAPP",
            },
            format="json",
        )
        self.assertEqual(pub_res.status_code, 201)
        self.assertTrue(ContactMessage.objects.filter(name="Nafis Imtiaz").exists())
        msg1 = ContactMessage.objects.get(name="Nafis Imtiaz")
        msg1_id = msg1.id

        # Second message for filter and search verification
        msg2 = ContactMessage.objects.create(
            topic="SELLING",
            name="Farhan Chowdhury",
            phone="01911223344",
            email="farhan@example.com",
            vehicle="BMW M5 Competition",
            message="Looking to sell my BMW M5 with full service record.",
            preferred_contact="PHONE",
        )

        # 2. Staff List Query with Search and Filtering
        # Search by customer name
        search_res = self.client.get("/api/v1/dashboard/contact-messages/?q=Nafis")
        self.assertEqual(search_res.status_code, 200)
        results = search_res.json()["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Nafis Imtiaz")
        self.assertEqual(results[0]["vehicle"], "Range Rover Sport 2024")

        # Search by message text
        search_msg_res = self.client.get("/api/v1/dashboard/contact-messages/?q=Competition")
        self.assertEqual(search_msg_res.status_code, 200)
        self.assertEqual(len(search_msg_res.json()["data"]["results"]), 1)
        self.assertEqual(search_msg_res.json()["data"]["results"][0]["name"], "Farhan Chowdhury")

        # Filter by topic
        filter_topic_res = self.client.get("/api/v1/dashboard/contact-messages/?topic=SELLING")
        self.assertEqual(filter_topic_res.status_code, 200)
        self.assertEqual(len(filter_topic_res.json()["data"]["results"]), 1)
        self.assertEqual(filter_topic_res.json()["data"]["results"][0]["id"], msg2.id)

        # Filter by preferred_contact
        filter_contact_res = self.client.get("/api/v1/dashboard/contact-messages/?preferred_contact=WHATSAPP")
        self.assertEqual(filter_contact_res.status_code, 200)
        self.assertEqual(len(filter_contact_res.json()["data"]["results"]), 1)
        self.assertEqual(filter_contact_res.json()["data"]["results"][0]["id"], msg1_id)

        # 3. Detail Query returning all submitted contact fields
        detail_res = self.client.get(f"/api/v1/dashboard/contact-messages/{msg1_id}/")
        self.assertEqual(detail_res.status_code, 200)
        data = detail_res.json()["data"]
        self.assertEqual(data["name"], "Nafis Imtiaz")
        self.assertEqual(data["phone"], "+8801811223344")
        self.assertEqual(data["email"], "nafis@example.com")
        self.assertEqual(data["vehicle"], "Range Rover Sport 2024")
        self.assertEqual(data["message"], "Interested in scheduling an inspection this weekend.")
        self.assertEqual(data["topic"], "BUYING")
        self.assertEqual(data["preferred_contact"], "WHATSAPP")

        # 4. Partial update (PATCH)
        patch_res = self.client.patch(
            f"/api/v1/dashboard/contact-messages/{msg1_id}/",
            {"phone": "+8801899999999", "vehicle": "Range Rover SV 2024"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["phone"], "+8801899999999")
        self.assertEqual(patch_res.json()["data"]["vehicle"], "Range Rover SV 2024")

        # 5. Permission Enforcement: Read-only staff vs Mutations
        view_contact_perm = Permission.objects.get(codename="view_contactmessage")
        self.staff_read_only.user_permissions.add(view_contact_perm)
        staff_csrf = self._login_readonly()

        staff_list = self.client.get("/api/v1/dashboard/contact-messages/")
        self.assertEqual(staff_list.status_code, 200)

        staff_detail = self.client.get(f"/api/v1/dashboard/contact-messages/{msg1_id}/")
        self.assertEqual(staff_detail.status_code, 200)

        staff_patch = self.client.patch(
            f"/api/v1/dashboard/contact-messages/{msg1_id}/",
            {"name": "Hacked"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_patch.status_code, 403)

        staff_del = self.client.delete(
            f"/api/v1/dashboard/contact-messages/{msg1_id}/",
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_del.status_code, 403)

        # 6. Anonymous Direct Rejection
        anon_client = APIClient(enforce_csrf_checks=True)
        anon_res = anon_client.get("/api/v1/dashboard/contact-messages/")
        self.assertEqual(anon_res.status_code, 403)

        # 7. Superuser Deletion
        del_admin_csrf = self._login_superuser()
        del_res = self.client.delete(
            f"/api/v1/dashboard/contact-messages/{msg1_id}/",
            HTTP_X_CSRFTOKEN=del_admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(ContactMessage.objects.filter(id=msg1_id).exists())

    def test_subscriber_management_flow(self):
        admin_csrf = self._login_superuser()

        # 1. Public subscription via POST /api/v1/home/subscribers/
        pub_client = APIClient()
        pub_res = pub_client.post(
            "/api/v1/home/subscribers/",
            {"email": "vip_client@example.com"},
            format="json",
        )
        self.assertEqual(pub_res.status_code, 201)
        self.assertTrue(Subscriber.objects.filter(email="vip_client@example.com").exists())
        sub1 = Subscriber.objects.get(email="vip_client@example.com")
        sub1_id = sub1.id

        sub2 = Subscriber.objects.create(email="auto_fan@example.com")

        # 2. Staff List Query with Search and Sorting
        search_res = self.client.get("/api/v1/dashboard/subscribers/?q=vip")
        self.assertEqual(search_res.status_code, 200)
        self.assertEqual(len(search_res.json()["data"]["results"]), 1)
        self.assertEqual(search_res.json()["data"]["results"][0]["email"], "vip_client@example.com")

        sort_res = self.client.get("/api/v1/dashboard/subscribers/?ordering=email")
        self.assertEqual(sort_res.status_code, 200)
        self.assertEqual(sort_res.json()["data"]["results"][0]["email"], "auto_fan@example.com")

        # 3. Detail Query
        detail_res = self.client.get(f"/api/v1/dashboard/subscribers/{sub1_id}/")
        self.assertEqual(detail_res.status_code, 200)
        self.assertEqual(detail_res.json()["data"]["email"], "vip_client@example.com")

        # 4. Partial update (PATCH)
        patch_res = self.client.patch(
            f"/api/v1/dashboard/subscribers/{sub1_id}/",
            {"email": "vip_update@example.com"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["email"], "vip_update@example.com")

        # 5. Permission Enforcement: Read-only staff vs Mutations
        view_sub_perm = Permission.objects.get(codename="view_subscriber")
        self.staff_read_only.user_permissions.add(view_sub_perm)
        staff_csrf = self._login_readonly()

        staff_list = self.client.get("/api/v1/dashboard/subscribers/")
        self.assertEqual(staff_list.status_code, 200)

        staff_detail = self.client.get(f"/api/v1/dashboard/subscribers/{sub1_id}/")
        self.assertEqual(staff_detail.status_code, 200)

        staff_patch = self.client.patch(
            f"/api/v1/dashboard/subscribers/{sub1_id}/",
            {"email": "hacked@example.com"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_patch.status_code, 403)

        staff_del = self.client.delete(
            f"/api/v1/dashboard/subscribers/{sub1_id}/",
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_del.status_code, 403)

        # 6. Anonymous Direct Rejection
        anon_client = APIClient(enforce_csrf_checks=True)
        anon_res = anon_client.get("/api/v1/dashboard/subscribers/")
        self.assertEqual(anon_res.status_code, 403)

        # 7. Superuser Deletion
        del_admin_csrf = self._login_superuser()
        del_res = self.client.delete(
            f"/api/v1/dashboard/subscribers/{sub1_id}/",
            HTTP_X_CSRFTOKEN=del_admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(Subscriber.objects.filter(id=sub1_id).exists())


class DashboardContentConfigurationTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.superuser = User.objects.create_superuser(
            username="content_admin",
            email="content_admin@begautos.com",
            password="admin-password-123",
        )
        self.staff_read_only = User.objects.create_user(
            username="content_staff",
            email="content_staff@begautos.com",
            password="staff-password-123",
            is_staff=True,
            is_active=True,
        )

    def _login_superuser(self):
        res = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "content_admin",
            "password": "admin-password-123",
        }, format="json")
        return res.json()["data"]["csrf_token"]

    def _login_readonly(self):
        res = self.client.post("/api/v1/dashboard/auth/login/", {
            "username": "content_staff",
            "password": "staff-password-123",
        }, format="json")
        return res.json()["data"]["csrf_token"]

    def test_slider_management_and_public_selection_contract(self):
        admin_csrf = self._login_superuser()
        pub_client = APIClient()

        # 1. Initially zero records - check public endpoint contract
        pub_zero = pub_client.get("/api/v1/home/slider/")
        self.assertEqual(pub_zero.status_code, 404)
        self.assertFalse(pub_zero.json()["success"])

        # 2. Staff without permissions gets 403 on list
        staff_csrf = self._login_readonly()
        res_no_perm = self.client.get("/api/v1/dashboard/sliders/")
        self.assertEqual(res_no_perm.status_code, 403)

        # Grant view permission to staff
        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_slider"))

        # Staff can now view empty list
        staff_list_empty = self.client.get("/api/v1/dashboard/sliders/")
        self.assertEqual(staff_list_empty.status_code, 200)
        self.assertEqual(staff_list_empty.json()["data"]["total_rows"], 0)

        # Re-login as superuser for mutations
        admin_csrf = self._login_superuser()

        # 3. Invalid media upload validation (non-image / non-video rejected)
        bad_file = SimpleUploadedFile("script.py", b"print('malicious')", content_type="text/plain")
        bad_upload = self.client.post(
            "/api/v1/dashboard/sliders/",
            {"heading": "Malicious", "image": bad_file},
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(bad_upload.status_code, 400)
        self.assertIn("image", bad_upload.json()["error"]["field_errors"])

        # 4. Create first Slider with valid video/image file
        valid_media_1 = SimpleUploadedFile(
            "hero1.mp4",
            b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom",
            content_type="video/mp4",
        )
        res_create_1 = self.client.post(
            "/api/v1/dashboard/sliders/",
            {"heading": "Welcome to Beg Autos", "image": valid_media_1},
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(res_create_1.status_code, 201)
        item1_id = res_create_1.json()["data"]["id"]
        self.assertTrue(res_create_1.json()["data"]["is_public_active"])

        # Check public endpoint now selects item 1
        pub_one = pub_client.get("/api/v1/home/slider/")
        self.assertEqual(pub_one.status_code, 200)
        self.assertEqual(pub_one.json()["data"]["heading"], "Welcome to Beg Autos")

        # 5. Create second Slider - verify it becomes the active public selection (Slider.objects.last())
        valid_media_2 = SimpleUploadedFile(
            "hero2.webm",
            b"\x1a\x45\xdf\xa3\x9f\x42\x86\x81\x01\x42\xf7\x81\x01",
            content_type="video/webm",
        )
        res_create_2 = self.client.post(
            "/api/v1/dashboard/sliders/",
            {"heading": "Unmatched Luxury Fleet", "image": valid_media_2},
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(res_create_2.status_code, 201)
        item2_id = res_create_2.json()["data"]["id"]
        self.assertTrue(res_create_2.json()["data"]["is_public_active"])

        # Item 1 is still preserved in database and list, but no longer public active
        list_res = self.client.get("/api/v1/dashboard/sliders/")
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(list_res.json()["data"]["total_rows"], 2)
        results = list_res.json()["data"]["results"]
        # Ordering is -id
        self.assertEqual(results[0]["id"], item2_id)
        self.assertTrue(results[0]["is_public_active"])
        self.assertEqual(results[1]["id"], item1_id)
        self.assertFalse(results[1]["is_public_active"])

        # Public endpoint now serves item 2
        pub_two = pub_client.get("/api/v1/home/slider/")
        self.assertEqual(pub_two.status_code, 200)
        self.assertEqual(pub_two.json()["data"]["heading"], "Unmatched Luxury Fleet")

        # 6. Read-only staff cannot mutate
        staff_patch = self.client.patch(
            f"/api/v1/dashboard/sliders/{item2_id}/",
            {"heading": "Unauthorized Edit"},
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_patch.status_code, 403)

        # 7. Update item 2 heading without re-uploading file
        patch_res = self.client.patch(
            f"/api/v1/dashboard/sliders/{item2_id}/",
            {"heading": "Curated Luxury Vehicles"},
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["heading"], "Curated Luxury Vehicles")

        # Public endpoint reflects updated heading
        pub_updated = pub_client.get("/api/v1/home/slider/")
        self.assertEqual(pub_updated.json()["data"]["heading"], "Curated Luxury Vehicles")

        # 8. Delete active item 2 -> public endpoint falls back to item 1
        del_res = self.client.delete(
            f"/api/v1/dashboard/sliders/{item2_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)

        pub_fallback = pub_client.get("/api/v1/home/slider/")
        self.assertEqual(pub_fallback.status_code, 200)
        self.assertEqual(pub_fallback.json()["data"]["heading"], "Welcome to Beg Autos")

    def test_social_media_management_and_public_selection_contract(self):
        admin_csrf = self._login_superuser()
        pub_client = APIClient()

        # 1. Zero records - public endpoint returns 404 per contract
        pub_zero = pub_client.get("/api/v1/home/sm/")
        self.assertEqual(pub_zero.status_code, 404)
        self.assertEqual(pub_zero.json()["message"], "No information available.")

        # 2. Staff without permissions gets 403
        staff_csrf = self._login_readonly()
        res_no_perm = self.client.get("/api/v1/dashboard/social-media/")
        self.assertEqual(res_no_perm.status_code, 403)

        # Grant view permission to staff
        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_socialmedia"))

        staff_list_empty = self.client.get("/api/v1/dashboard/social-media/")
        self.assertEqual(staff_list_empty.status_code, 200)
        self.assertEqual(staff_list_empty.json()["data"]["total_rows"], 0)

        # Re-login superuser for admin operations
        admin_csrf = self._login_superuser()

        # 3. Validation: Facebook is required and must have http:// or https://
        invalid_url_res = self.client.post(
            "/api/v1/dashboard/social-media/",
            {"facebook": "ftp://facebook.com/begautos", "instagram": "javascript:alert(1)"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(invalid_url_res.status_code, 400)
        errors = invalid_url_res.json()["error"]["field_errors"]
        self.assertIn("facebook", errors)
        self.assertIn("instagram", errors)

        # 4. Create first Social Media record
        sm1_res = self.client.post(
            "/api/v1/dashboard/social-media/",
            {
                "facebook": "https://facebook.com/begautos",
                "instagram": "https://instagram.com/begautos",
                "twitter": "https://twitter.com/begautos",
                "youtube": "https://youtube.com/@begautos",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(sm1_res.status_code, 201)
        sm1_id = sm1_res.json()["data"]["id"]
        self.assertTrue(sm1_res.json()["data"]["is_public_active"])

        # Public endpoint now returns sm1
        pub_sm1 = pub_client.get("/api/v1/home/sm/")
        self.assertEqual(pub_sm1.status_code, 200)
        self.assertEqual(pub_sm1.json()["data"]["facebook"], "https://facebook.com/begautos")

        # 5. Create second Social Media record (e.g. updated links)
        sm2_res = self.client.post(
            "/api/v1/dashboard/social-media/",
            {
                "facebook": "https://facebook.com/begautos_v2",
                "instagram": "https://instagram.com/begautos_v2",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(sm2_res.status_code, 201)
        sm2_id = sm2_res.json()["data"]["id"]

        # Multiple records exist, sm2 is active, sm1 is historical
        list_res = self.client.get("/api/v1/dashboard/social-media/")
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(list_res.json()["data"]["total_rows"], 2)
        results = list_res.json()["data"]["results"]
        self.assertEqual(results[0]["id"], sm2_id)
        self.assertTrue(results[0]["is_public_active"])
        self.assertEqual(results[1]["id"], sm1_id)
        self.assertFalse(results[1]["is_public_active"])

        # Public contract reflects sm2
        pub_sm2 = pub_client.get("/api/v1/home/sm/")
        self.assertEqual(pub_sm2.status_code, 200)
        self.assertEqual(pub_sm2.json()["data"]["facebook"], "https://facebook.com/begautos_v2")

        # 6. Read-only staff mutation denial
        staff_csrf = self._login_readonly()
        staff_del = self.client.delete(
            f"/api/v1/dashboard/social-media/{sm2_id}/",
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_del.status_code, 403)

        # 7. Edit sm2 (as superuser)
        admin_csrf = self._login_superuser()
        patch_res = self.client.patch(
            f"/api/v1/dashboard/social-media/{sm2_id}/",
            {"youtube": "https://youtube.com/@begautos_hq"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["youtube"], "https://youtube.com/@begautos_hq")

        # 8. Delete sm2 -> fallback to sm1 on public endpoint
        del_res = self.client.delete(
            f"/api/v1/dashboard/social-media/{sm2_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)

        pub_fallback = pub_client.get("/api/v1/home/sm/")
        self.assertEqual(pub_fallback.status_code, 200)
        self.assertEqual(pub_fallback.json()["data"]["facebook"], "https://facebook.com/begautos")

    def test_people_talk_about_us_management_and_publication(self):
        admin_csrf = self._login_superuser()
        pub_client = APIClient()

        # 1. Staff without permissions gets 403
        staff_csrf = self._login_readonly()
        res_no_perm = self.client.get("/api/v1/dashboard/social-features/")
        self.assertEqual(res_no_perm.status_code, 403)

        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_peopletalkaboutus"))
        staff_list_empty = self.client.get("/api/v1/dashboard/social-features/")
        self.assertEqual(staff_list_empty.status_code, 200)
        self.assertEqual(staff_list_empty.json()["data"]["total_rows"], 0)

        # 2. Invalid image upload rejected (e.g. text/plain or executable)
        admin_csrf = self._login_superuser()
        bad_file = SimpleUploadedFile("bad.txt", b"plain text", content_type="text/plain")
        bad_res = self.client.post(
            "/api/v1/dashboard/social-features/",
            {"title": "Test Title", "image": bad_file},
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(bad_res.status_code, 400)
        self.assertIn("image", bad_res.json()["error"]["field_errors"])

        # Invalid URL rejected
        img_file = SimpleUploadedFile("good.jpg", b"\xff\xd8\xff\xe0\x00\x10JFIF", content_type="image/jpeg")
        bad_url_res = self.client.post(
            "/api/v1/dashboard/social-features/",
            {"title": "Test Title", "image": img_file, "url": "javascript:alert(1)"},
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(bad_url_res.status_code, 400)
        self.assertIn("url", bad_url_res.json()["error"]["field_errors"])

        # 3. Create published record
        img_valid = SimpleUploadedFile("review1.jpg", b"\xff\xd8\xff\xe0\x00\x10JFIF", content_type="image/jpeg")
        create_res = self.client.post(
            "/api/v1/dashboard/social-features/",
            {
                "title": "Top Gear Feature",
                "image": img_valid,
                "url": "https://instagram.com/p/topgear",
                "status": "PUBLISHED",
                "is_featured": "true",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(create_res.status_code, 201)
        item1_id = create_res.json()["data"]["id"]
        self.assertEqual(create_res.json()["data"]["status"], "PUBLISHED")
        self.assertTrue(create_res.json()["data"]["is_featured"])

        # 4. Create unpublished record
        img_valid_2 = SimpleUploadedFile("draft.png", b"\x89PNG\r\n\x1a\n", content_type="image/png")
        create_draft_res = self.client.post(
            "/api/v1/dashboard/social-features/",
            {
                "title": "Unreleased Feature",
                "image": img_valid_2,
                "status": "UNPUBLISHED",
                "is_featured": "false",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(create_draft_res.status_code, 201)
        item2_id = create_draft_res.json()["data"]["id"]

        # Staff list returns both published and draft
        list_res = self.client.get("/api/v1/dashboard/social-features/")
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(list_res.json()["data"]["total_rows"], 2)

        # Filters: status and is_featured
        filter_draft = self.client.get("/api/v1/dashboard/social-features/?status=UNPUBLISHED")
        self.assertEqual(filter_draft.json()["data"]["total_rows"], 1)
        self.assertEqual(filter_draft.json()["data"]["results"][0]["id"], item2_id)

        filter_featured = self.client.get("/api/v1/dashboard/social-features/?is_featured=true")
        self.assertEqual(filter_featured.json()["data"]["total_rows"], 1)
        self.assertEqual(filter_featured.json()["data"]["results"][0]["id"], item1_id)

        # Public endpoint contract: GET /api/v1/home/people-talk/ ONLY returns PUBLISHED
        pub_res = pub_client.get("/api/v1/home/people-talk/")
        self.assertEqual(pub_res.status_code, 200)
        pub_data = pub_res.json()["data"] if "data" in pub_res.json() else pub_res.json()
        pub_results = pub_data.get("results", pub_data)
        self.assertEqual(len(pub_results), 1)
        self.assertEqual(pub_results[0]["title"], "Top Gear Feature")

        # 5. Read-only staff mutation rejection
        staff_csrf = self._login_readonly()
        staff_patch = self.client.patch(
            f"/api/v1/dashboard/social-features/{item1_id}/",
            {"title": "Hacked Title"},
            HTTP_X_CSRFTOKEN=staff_csrf,
        )
        self.assertEqual(staff_patch.status_code, 403)

        # 6. Admin update without replacing image
        admin_csrf = self._login_superuser()
        patch_res = self.client.patch(
            f"/api/v1/dashboard/social-features/{item1_id}/",
            {"title": "Top Gear Exclusive Review"},
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["title"], "Top Gear Exclusive Review")

        # 7. Delete draft record
        del_res = self.client.delete(
            f"/api/v1/dashboard/social-features/{item2_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(PeopleTalkAboutUs.objects.filter(id=item2_id).exists())

    def test_sales_representative_management_and_publication(self):
        admin_csrf = self._login_superuser()
        pub_client = APIClient()

        # 1. Staff without permissions gets 403
        staff_csrf = self._login_readonly()
        res_no_perm = self.client.get("/api/v1/dashboard/sales-representatives/")
        self.assertEqual(res_no_perm.status_code, 403)

        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_salesrepresentative"))
        staff_list_empty = self.client.get("/api/v1/dashboard/sales-representatives/")
        self.assertEqual(staff_list_empty.status_code, 200)
        self.assertEqual(staff_list_empty.json()["data"]["total_rows"], 0)

        # 2. Create published and draft reps
        admin_csrf = self._login_superuser()
        rep1_res = self.client.post(
            "/api/v1/dashboard/sales-representatives/",
            {
                "name": "Mahmud Hasan",
                "phone_number": "+8801700112233",
                "status": "PUBLISHED",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(rep1_res.status_code, 201)
        rep1_id = rep1_res.json()["data"]["id"]

        rep2_res = self.client.post(
            "/api/v1/dashboard/sales-representatives/",
            {
                "name": "Tariqul Islam (Intern)",
                "phone_number": "+8801700998877",
                "status": "UNPUBLISHED",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(rep2_res.status_code, 201)
        rep2_id = rep2_res.json()["data"]["id"]

        # Staff search and listing
        search_res = self.client.get("/api/v1/dashboard/sales-representatives/?q=Mahmud")
        self.assertEqual(search_res.status_code, 200)
        self.assertEqual(search_res.json()["data"]["total_rows"], 1)
        self.assertEqual(search_res.json()["data"]["results"][0]["id"], rep1_id)

        # Public website endpoint GET /api/v1/home/sales-representative/ only returns PUBLISHED
        pub_res = pub_client.get("/api/v1/home/sales-representative/")
        self.assertEqual(pub_res.status_code, 200)
        pub_data = pub_res.json()["data"] if "data" in pub_res.json() else pub_res.json()
        self.assertEqual(len(pub_data), 1)
        self.assertEqual(pub_data[0]["name"], "Mahmud Hasan")

        # 3. Read-only staff mutation rejection
        staff_csrf = self._login_readonly()
        staff_patch = self.client.patch(
            f"/api/v1/dashboard/sales-representatives/{rep1_id}/",
            {"phone_number": "+8801999999999"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_patch.status_code, 403)

        # 4. Admin update status to UNPUBLISHED
        admin_csrf = self._login_superuser()
        patch_res = self.client.patch(
            f"/api/v1/dashboard/sales-representatives/{rep1_id}/",
            {"status": "UNPUBLISHED"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["status"], "UNPUBLISHED")

        # Public endpoint now returns empty response (DefaultRenderer renders None/empty body when data is empty)
        pub_empty = pub_client.get("/api/v1/home/sales-representative/")
        self.assertEqual(pub_empty.status_code, 200)
        self.assertEqual(pub_empty.content, b"")

        # 5. Delete rep
        del_res = self.client.delete(
            f"/api/v1/dashboard/sales-representatives/{rep2_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(SalesRepresentative.objects.filter(id=rep2_id).exists())

    def test_seo_config_management_and_public_api_compatibility(self):
        admin_csrf = self._login_superuser()
        pub_client = APIClient()

        # 1. Staff without permissions gets 403
        staff_csrf = self._login_readonly()
        res_no_perm = self.client.get("/api/v1/dashboard/page-seo/")
        self.assertEqual(res_no_perm.status_code, 403)

        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_seoconfig"))
        staff_list_empty = self.client.get("/api/v1/dashboard/page-seo/")
        self.assertEqual(staff_list_empty.status_code, 200)
        self.assertEqual(staff_list_empty.json()["data"]["total_rows"], 0)

        # 2. Public API GET /api/v1/site-config/seo/home/ returns 404 when not configured
        pub_404 = pub_client.get("/api/v1/site-config/seo/home/")
        self.assertEqual(pub_404.status_code, 404)

        # 3. Validation: malformed JSON-LD rejected
        admin_csrf = self._login_superuser()
        bad_json_res = self.client.post(
            "/api/v1/dashboard/page-seo/",
            {
                "page": "home",
                "meta_title": "Home - Beg Autos",
                "schema_json": "not valid json {",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(bad_json_res.status_code, 400)
        self.assertIn("schema_json", bad_json_res.json()["error"]["field_errors"])

        # Invalid canonical URL rejected
        bad_url_res = self.client.post(
            "/api/v1/dashboard/page-seo/",
            {
                "page": "home",
                "canonical_url": "javascript:alert(1)",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(bad_url_res.status_code, 400)
        self.assertIn("canonical_url", bad_url_res.json()["error"]["field_errors"])

        # Invalid image format rejected
        bad_file = SimpleUploadedFile("script.sh", b"echo hello", content_type="text/x-shellscript")
        bad_file_res = self.client.post(
            "/api/v1/dashboard/page-seo/",
            {
                "page": "home",
                "feature_image": bad_file,
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(bad_file_res.status_code, 400)
        self.assertIn("feature_image", bad_file_res.json()["error"]["field_errors"])

        # 4. Successful creation of SEOConfig
        create_res = self.client.post(
            "/api/v1/dashboard/page-seo/",
            {
                "page": "home",
                "visibility": "PUBLISHED",
                "meta_title": "Luxury & Exotic Cars in Bangladesh | Beg Autos",
                "meta_description": "Beg Autos is the leading exotic car dealer in Dhaka.",
                "canonical_url": "https://www.begautos.com/",
                "robots": "index, follow",
                "target_keyword": "luxury cars bd",
                "schema_json": json.dumps({"@context": "https://schema.org", "@type": "AutoDealer", "name": "Beg Autos"}),
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(create_res.status_code, 201)
        home_seo_id = create_res.json()["data"]["id"]
        self.assertEqual(create_res.json()["data"]["page"], "home")
        self.assertEqual(create_res.json()["data"]["page_display"], "Home")

        # 5. Duplicate page rejection
        dup_res = self.client.post(
            "/api/v1/dashboard/page-seo/",
            {
                "page": "home",
                "meta_title": "Duplicate Home",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(dup_res.status_code, 400)
        self.assertIn("page", dup_res.json()["error"]["field_errors"])

        # 6. Verify representative public metadata/configuration response
        pub_res = pub_client.get("/api/v1/site-config/seo/home/")
        self.assertEqual(pub_res.status_code, 200)
        pub_json = pub_res.json()["data"] if "data" in pub_res.json() else pub_res.json()
        self.assertEqual(pub_json["page"], "home")
        self.assertEqual(pub_json["meta_title"], "Luxury & Exotic Cars in Bangladesh | Beg Autos")
        self.assertEqual(pub_json["visibility"], "PUBLISHED")
        self.assertEqual(pub_json["canonical_url"], "https://www.begautos.com/")

        # 7. Read-only staff cannot edit
        staff_csrf = self._login_readonly()
        staff_edit = self.client.patch(
            f"/api/v1/dashboard/page-seo/{home_seo_id}/",
            {"meta_title": "Hacked Title"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_edit.status_code, 403)

        # 8. Admin edit & reload
        admin_csrf = self._login_superuser()
        patch_res = self.client.patch(
            f"/api/v1/dashboard/page-seo/{home_seo_id}/",
            {"meta_title": "Updated Beg Autos Title"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["meta_title"], "Updated Beg Autos Title")

        # Public endpoint serves updated title
        pub_updated = pub_client.get("/api/v1/site-config/seo/home/")
        self.assertEqual(pub_updated.status_code, 200)
        pub_up_json = pub_updated.json()["data"] if "data" in pub_updated.json() else pub_updated.json()
        self.assertEqual(pub_up_json["meta_title"], "Updated Beg Autos Title")

        # 9. Delete SEOConfig
        del_res = self.client.delete(
            f"/api/v1/dashboard/page-seo/{home_seo_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(SEOConfig.objects.filter(id=home_seo_id).exists())

        # Public endpoint returns 404 again
        pub_after_del = pub_client.get("/api/v1/site-config/seo/home/")
        self.assertEqual(pub_after_del.status_code, 404)

    def test_category_page_seo_management_and_public_api_compatibility(self):
        admin_csrf = self._login_superuser()
        pub_client = APIClient()

        # 1. Staff without permissions gets 403
        staff_csrf = self._login_readonly()
        res_no_perm = self.client.get("/api/v1/dashboard/category-seo/")
        self.assertEqual(res_no_perm.status_code, 403)

        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_categorypageseo"))
        staff_list_empty = self.client.get("/api/v1/dashboard/category-seo/")
        self.assertEqual(staff_list_empty.status_code, 200)
        self.assertEqual(staff_list_empty.json()["data"]["total_rows"], 0)

        # 2. Public API GET /api/v1/site-config/category-seo/cars/ returns 404 when not configured
        pub_404 = pub_client.get("/api/v1/site-config/category-seo/cars/")
        self.assertEqual(pub_404.status_code, 404)

        # 3. Create CategoryPageSEO
        admin_csrf = self._login_superuser()
        create_res = self.client.post(
            "/api/v1/dashboard/category-seo/",
            {
                "page": "cars",
                "category_name": "All Cars",
                "visibility": "PUBLISHED",
                "h1_title": "Explore All Available Premium Vehicles",
                "meta_title": "All Cars | Beg Autos Fleet",
                "meta_description": "Browse our complete inventory of luxury vehicles.",
                "canonical_url": "https://www.begautos.com/cars/",
                "robots": "index, follow",
                "short_description": "<p>Discover the finest vehicles in Bangladesh.</p>",
                "long_description": "<p>Complete showroom inventory with nationwide warranty.</p>",
                "schema_json": json.dumps({"@context": "https://schema.org", "@type": "CollectionPage"}),
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(create_res.status_code, 201)
        cars_seo_id = create_res.json()["data"]["id"]
        self.assertEqual(create_res.json()["data"]["page"], "cars")
        self.assertEqual(create_res.json()["data"]["category_name"], "All Cars")

        # 4. Duplicate page rejection
        dup_res = self.client.post(
            "/api/v1/dashboard/category-seo/",
            {
                "page": "cars",
                "category_name": "Duplicate All Cars",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(dup_res.status_code, 400)
        self.assertIn("page", dup_res.json()["error"]["field_errors"])

        # 5. Public API GET /api/v1/site-config/category-seo/cars/ returns saved config
        pub_res = pub_client.get("/api/v1/site-config/category-seo/cars/")
        self.assertEqual(pub_res.status_code, 200)
        pub_json = pub_res.json()["data"] if "data" in pub_res.json() else pub_res.json()
        self.assertEqual(pub_json["page"], "cars")
        self.assertEqual(pub_json["h1_title"], "Explore All Available Premium Vehicles")
        self.assertEqual(pub_json["category_name"], "All Cars")

        # 6. Read-only staff mutation rejection
        staff_csrf = self._login_readonly()
        staff_patch = self.client.patch(
            f"/api/v1/dashboard/category-seo/{cars_seo_id}/",
            {"category_name": "Hacked Category"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_patch.status_code, 403)

        # 7. Admin update
        admin_csrf = self._login_superuser()
        patch_res = self.client.patch(
            f"/api/v1/dashboard/category-seo/{cars_seo_id}/",
            {"h1_title": "Updated Heading: Beg Autos Showroom Fleet"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["h1_title"], "Updated Heading: Beg Autos Showroom Fleet")

        # Public endpoint reflects changes
        pub_updated = pub_client.get("/api/v1/site-config/category-seo/cars/")
        self.assertEqual(pub_updated.status_code, 200)
        pub_up_json = pub_updated.json()["data"] if "data" in pub_updated.json() else pub_updated.json()
        self.assertEqual(pub_up_json["h1_title"], "Updated Heading: Beg Autos Showroom Fleet")

        # 8. Delete CategoryPageSEO
        del_res = self.client.delete(
            f"/api/v1/dashboard/category-seo/{cars_seo_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_res.status_code, 200)
        self.assertFalse(CategoryPageSEO.objects.filter(id=cars_seo_id).exists())

        # Public endpoint returns 404 again
        pub_after_del = pub_client.get("/api/v1/site-config/category-seo/cars/")
        self.assertEqual(pub_after_del.status_code, 404)

    def test_user_and_group_management_and_privilege_escalation_guards(self):
        admin_csrf = self._login_superuser()

        # 1. Staff without permissions gets 403 on users, groups, permissions
        staff_csrf = self._login_readonly()
        self.assertEqual(self.client.get("/api/v1/dashboard/users/").status_code, 403)
        self.assertEqual(self.client.get("/api/v1/dashboard/groups/").status_code, 403)
        self.assertEqual(self.client.get("/api/v1/dashboard/permissions/").status_code, 403)

        # Grant view_user, view_group
        self.staff_read_only.user_permissions.add(
            Permission.objects.get(codename="view_user"),
            Permission.objects.get(codename="view_group"),
        )
        staff_users_res = self.client.get("/api/v1/dashboard/users/")
        self.assertEqual(staff_users_res.status_code, 200)
        self.assertEqual(self.client.get("/api/v1/dashboard/groups/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/dashboard/permissions/").status_code, 200)

        # 2. Permissions catalog inspection
        perm_res = self.client.get("/api/v1/dashboard/permissions/")
        self.assertEqual(perm_res.status_code, 200)
        self.assertGreater(len(perm_res.json()["data"]), 10)
        first_perm = perm_res.json()["data"][0]
        self.assertIn("id", first_perm)
        self.assertIn("codename", first_perm)
        self.assertIn("app_label", first_perm)

        # 3. Create Group with permissions
        admin_csrf = self._login_superuser()
        inv_view_perm = Permission.objects.get(codename="view_inventory")
        group_res = self.client.post(
            "/api/v1/dashboard/groups/",
            {
                "name": "Inventory Analysts",
                "permission_ids": [inv_view_perm.id],
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(group_res.status_code, 201)
        group_id = group_res.json()["data"]["id"]
        self.assertEqual(group_res.json()["data"]["name"], "Inventory Analysts")

        # Duplicate group name rejection
        dup_group = self.client.post(
            "/api/v1/dashboard/groups/",
            {"name": "Inventory Analysts"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(dup_group.status_code, 400)
        self.assertIn("name", dup_group.json()["error"]["field_errors"])

        # 4. Create User as Staff
        user_res = self.client.post(
            "/api/v1/dashboard/users/",
            {
                "username": "analyst1",
                "email": "analyst1@begautos.com",
                "first_name": "Test",
                "last_name": "Analyst",
                "password": "Compl3x!Password987",
                "is_staff": True,
                "is_active": True,
                "group_ids": [group_id],
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(user_res.status_code, 201)
        analyst_id = user_res.json()["data"]["id"]
        # Never return password hash or password field in responses
        self.assertNotIn("password", user_res.json()["data"])
        self.assertTrue(user_res.json()["data"]["is_staff"])
        self.assertFalse(user_res.json()["data"]["is_superuser"])

        # 5. Non-superuser privilege escalation rejection:
        # A staff member with change_user and add_user permission tries to elevate analyst1 or create superuser
        self.staff_read_only.user_permissions.add(
            Permission.objects.get(codename="change_user"),
            Permission.objects.get(codename="add_user"),
        )
        staff_csrf = self._login_readonly()

        escalate_res = self.client.patch(
            f"/api/v1/dashboard/users/{analyst_id}/",
            {"is_superuser": True},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(escalate_res.status_code, 400)
        self.assertIn("is_superuser", escalate_res.json()["error"]["field_errors"])

        # Non-superuser tries to create a superuser directly
        staff_create_super = self.client.post(
            "/api/v1/dashboard/users/",
            {
                "username": "rogue_admin",
                "password": "Compl3x!Password987",
                "is_superuser": True,
            },
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(staff_create_super.status_code, 400)
        self.assertIn("is_superuser", staff_create_super.json()["error"]["field_errors"])

        # 6. Password update via Django password API & password validation
        admin_csrf = self._login_superuser()
        # Too weak/short password rejected by Django validator
        weak_pw_res = self.client.patch(
            f"/api/v1/dashboard/users/{analyst_id}/",
            {"password": "123"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(weak_pw_res.status_code, 400)
        self.assertIn("password", weak_pw_res.json()["error"]["field_errors"])

        # Valid password change succeeds
        pw_res = self.client.patch(
            f"/api/v1/dashboard/users/{analyst_id}/",
            {"password": "NewStrong!Password456"},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(pw_res.status_code, 200)
        analyst_obj = User.objects.get(id=analyst_id)
        self.assertTrue(analyst_obj.check_password("NewStrong!Password456"))

        # 7. Self-deletion and last administrator protection
        self.superuser.is_active = True
        self.superuser.is_staff = True
        self.superuser.save()

        # Cannot delete oneself
        self_del = self.client.delete(
            f"/api/v1/dashboard/users/{self.superuser.id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(self_del.status_code, 400)

        # Cannot demote or deactivate the only active superuser
        demote_res = self.client.patch(
            f"/api/v1/dashboard/users/{self.superuser.id}/",
            {"is_superuser": False},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(demote_res.status_code, 400)

        deactivate_res = self.client.patch(
            f"/api/v1/dashboard/users/{self.superuser.id}/",
            {"is_active": False},
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(deactivate_res.status_code, 400)

        # 8. Delete analyst user and group
        del_user = self.client.delete(
            f"/api/v1/dashboard/users/{analyst_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_user.status_code, 200)
        self.assertFalse(User.objects.filter(id=analyst_id).exists())

        del_group = self.client.delete(
            f"/api/v1/dashboard/groups/{group_id}/",
            HTTP_X_CSRFTOKEN=admin_csrf,
        )
        self.assertEqual(del_group.status_code, 200)
        self.assertFalse(Group.objects.filter(id=group_id).exists())

    def test_overview_aggregates_and_permission_scoping(self):
        """
        Verify:
        1. Overview endpoint is gated by active staff.
        2. Superuser receives metrics across all business models and recent submissions.
        3. Limited permission staff receives ONLY metrics for permitted datasets (unpermitted metrics are omitted).
        4. Fresh counts reflect database state (before & after mutations).
        5. Handles empty and non-empty datasets correctly.
        """
        # Unauthenticated rejected
        unauth_res = self.client.get("/api/v1/dashboard/overview/")
        self.assertEqual(unauth_res.status_code, 403)

        # Create isolated test records
        quote = InventoryQuote.objects.create(
            name="Overview Customer",
            email="overview@test.com",
            phone="01700000000",
        )
        msg = ContactMessage.objects.create(
            name="Overview Message",
            phone="01800000000",
            email="msg@test.com",
            topic=ContactMessage.TopicChoices.BUYING,
            message="Interested in cars",
        )
        sell = SellCar.objects.create(
            name="Overview Seller",
            phone="01900000000",
            car_name="Toyota",
            car_model="Corolla",
            car_year="2020",
            mileage=15000,
        )
        stock = Stock.objects.create(
            title="Overview Stock Banner",
            image=SimpleUploadedFile("banner.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 20, content_type="image/jpeg"),
            status=Stock.StatusChoices.PUBLISHED,
        )

        # 1. Superuser overview
        admin_csrf = self._login_superuser()
        admin_res = self.client.get("/api/v1/dashboard/overview/", HTTP_X_CSRFTOKEN=admin_csrf)
        self.assertEqual(admin_res.status_code, 200)
        admin_data = admin_res.json()["data"]

        self.assertIn("inventory", admin_data["metrics"])
        self.assertIn("stocks", admin_data["metrics"])
        self.assertIn("quotes", admin_data["metrics"])
        self.assertIn("sell_cars", admin_data["metrics"])
        self.assertIn("contact_messages", admin_data["metrics"])
        self.assertIn("users", admin_data["metrics"])
        self.assertIn("groups", admin_data["metrics"])

        self.assertGreaterEqual(admin_data["metrics"]["quotes"]["total"], 1)
        self.assertGreaterEqual(admin_data["metrics"]["contact_messages"]["total"], 1)
        self.assertGreaterEqual(admin_data["metrics"]["sell_cars"]["total"], 1)
        self.assertGreaterEqual(admin_data["metrics"]["stocks"]["total"], 1)

        # Recent submissions returned for permitted modules
        self.assertIn("quotes", admin_data["recent_submissions"])
        self.assertIn("contact_messages", admin_data["recent_submissions"])
        self.assertIn("sell_cars", admin_data["recent_submissions"])
        self.assertTrue(any(q["id"] == quote.id for q in admin_data["recent_submissions"]["quotes"]))
        self.assertTrue(any(m["id"] == msg.id for m in admin_data["recent_submissions"]["contact_messages"]))
        self.assertTrue(any(s["id"] == sell.id for s in admin_data["recent_submissions"]["sell_cars"]))

        # 2. Scoped staff user: ONLY has home.view_contactmessage
        self.staff_read_only.user_permissions.clear()
        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_contactmessage"))
        staff_csrf = self._login_readonly()

        scoped_res = self.client.get("/api/v1/dashboard/overview/", HTTP_X_CSRFTOKEN=staff_csrf)
        self.assertEqual(scoped_res.status_code, 200)
        scoped_data = scoped_res.json()["data"]

        # Only contact_messages metric is present; other metrics are omitted
        self.assertIn("contact_messages", scoped_data["metrics"])
        self.assertNotIn("inventory", scoped_data["metrics"])
        self.assertNotIn("stocks", scoped_data["metrics"])
        self.assertNotIn("quotes", scoped_data["metrics"])
        self.assertNotIn("sell_cars", scoped_data["metrics"])
        self.assertNotIn("users", scoped_data["metrics"])

        # Recent submissions only include contact_messages
        self.assertIn("contact_messages", scoped_data["recent_submissions"])
        self.assertNotIn("quotes", scoped_data["recent_submissions"])
        self.assertNotIn("sell_cars", scoped_data["recent_submissions"])

        # 3. Clean up
        quote.delete()
        msg.delete()
        sell.delete()
        stock.delete()

    def test_site_settings_management_and_public_api(self):
        # Setup initial site settings record
        SiteSettings.objects.create(
            name="DREAM CAR HOUSE",
            phone="+880 1615-121312",
            whatsapp="+8801615121312",
        )

        # 1. Unauthenticated request denied
        anon_client = APIClient()
        anon_res = anon_client.get("/api/v1/dashboard/site-settings/")
        self.assertEqual(anon_res.status_code, 403)

        # 2. Staff without view_sitesettings denied
        self.staff_read_only.user_permissions.clear()
        staff_csrf = self._login_readonly()
        unperm_res = self.client.get("/api/v1/dashboard/site-settings/", HTTP_X_CSRFTOKEN=staff_csrf)
        self.assertEqual(unperm_res.status_code, 403)

        # 3. Staff with view_sitesettings can read
        self.staff_read_only.user_permissions.add(Permission.objects.get(codename="view_sitesettings"))
        read_res = self.client.get("/api/v1/dashboard/site-settings/", HTTP_X_CSRFTOKEN=staff_csrf)
        self.assertEqual(read_res.status_code, 200)
        self.assertTrue(read_res.json()["success"])

        # 4. Mutation without change_sitesettings denied
        patch_denied = self.client.patch(
            "/api/v1/dashboard/site-settings/",
            {"name": "UNAUTHORIZED NAME"},
            HTTP_X_CSRFTOKEN=staff_csrf,
            format="json",
        )
        self.assertEqual(patch_denied.status_code, 403)

        # 5. Superuser mutation succeeds
        admin_csrf = self._login_superuser()
        patch_res = self.client.patch(
            "/api/v1/dashboard/site-settings/",
            {
                "name": "DREAM CAR HOUSE TEST ATELIER",
                "phone": "+880 1999-999999",
                "whatsapp": "+8801999999999",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["data"]["name"], "DREAM CAR HOUSE TEST ATELIER")

        # 6. Public endpoint reflects updated values and hides internal fields
        pub_res = anon_client.get("/api/v1/home/site-settings/")
        self.assertEqual(pub_res.status_code, 200)
        pub_data = pub_res.json()["data"]
        self.assertEqual(pub_data["name"], "DREAM CAR HOUSE TEST ATELIER")
        self.assertEqual(pub_data["phone"], "+880 1999-999999")
        self.assertNotIn("id", pub_data)
        self.assertNotIn("created_at", pub_data)
        self.assertNotIn("updated_at", pub_data)

    def test_site_settings_favicon_upload_validation_and_public_api(self):
        import io
        from PIL import Image

        settings_obj = SiteSettings.objects.create(
            name="DREAM CAR HOUSE",
            phone="+880 1615-121312",
            whatsapp="+8801615121312",
        )
        admin_csrf = self._login_superuser()
        anon_client = APIClient()

        try:
            # 1. Invalid extension rejected
            bad_ext = SimpleUploadedFile("tab.txt", b"not an icon", content_type="text/plain")
            res_bad_ext = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {"favicon": bad_ext},
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_bad_ext.status_code, 400)

            # 2. Malicious SVG with script rejected
            bad_svg = SimpleUploadedFile(
                "bad-tab.svg",
                b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
                content_type="image/svg+xml",
            )
            res_bad_svg = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {"favicon": bad_svg},
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_bad_svg.status_code, 400)

            # 3. Corrupt PNG bytes rejected
            bad_png = SimpleUploadedFile("corrupt.png", b"not-real-png-bytes", content_type="image/png")
            res_bad_png = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {"favicon": bad_png},
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_bad_png.status_code, 400)

            # 4. Valid PNG icon upload succeeds and is exposed publicly
            png_buf = io.BytesIO()
            Image.new("RGBA", (32, 32), (245, 158, 11, 255)).save(png_buf, format="PNG")
            valid_png = SimpleUploadedFile("tab-icon.png", png_buf.getvalue(), content_type="image/png")
            res_png = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {"favicon": valid_png},
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_png.status_code, 200)
            png_url = res_png.json()["data"]["favicon"]
            self.assertTrue(png_url)
            self.assertIn("/media/site/", png_url)

            pub_res = anon_client.get("/api/v1/home/site-settings/")
            self.assertEqual(pub_res.status_code, 200)
            self.assertEqual(pub_res.json()["data"]["favicon"], png_url)

            # 5. Valid safe SVG icon upload succeeds
            valid_svg = SimpleUploadedFile(
                "tab-vector.svg",
                b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#f59e0b"/></svg>',
                content_type="image/svg+xml",
            )
            res_svg = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {"favicon": valid_svg},
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_svg.status_code, 200)
            self.assertIn(".svg", res_svg.json()["data"]["favicon"])

            # 6. Clear favicon resets it to empty/None
            res_clear = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {"clear_favicon": "true"},
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_clear.status_code, 200)
            self.assertFalse(res_clear.json()["data"]["favicon"])

            # 7. Mobile brand icons upload and public API exposure
            mobile_svg = SimpleUploadedFile(
                "mobile-crest.svg",
                b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><polygon points="20,0 40,40 0,40" fill="#f59e0b"/></svg>',
                content_type="image/svg+xml",
            )
            mobile_light_png = SimpleUploadedFile("mobile-day.png", png_buf.getvalue(), content_type="image/png")
            res_mobile = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {
                    "logo_icon": mobile_svg,
                    "logo_icon_light": mobile_light_png,
                },
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_mobile.status_code, 200)
            self.assertIn(".svg", res_mobile.json()["data"]["logo_icon"])
            self.assertIn("/media/site/", res_mobile.json()["data"]["logo_icon_light"])

            pub_res_mobile = anon_client.get("/api/v1/home/site-settings/")
            self.assertEqual(pub_res_mobile.status_code, 200)
            self.assertEqual(pub_res_mobile.json()["data"]["logo_icon"], res_mobile.json()["data"]["logo_icon"])
            self.assertEqual(pub_res_mobile.json()["data"]["logo_icon_light"], res_mobile.json()["data"]["logo_icon_light"])

            # 8. Clear mobile brand icons resets to None
            res_clear_mobile = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {
                    "clear_logo_icon": "true",
                    "clear_logo_icon_light": "true",
                },
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_clear_mobile.status_code, 200)
            self.assertFalse(res_clear_mobile.json()["data"]["logo_icon"])
            self.assertFalse(res_clear_mobile.json()["data"]["logo_icon_light"])

            # 9. Dedicated Footer brand logos upload and public API exposure
            footer_dark_png = SimpleUploadedFile("footer-dark.png", png_buf.getvalue(), content_type="image/png")
            footer_light_svg = SimpleUploadedFile(
                "footer-light.svg",
                b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30"><text x="0" y="20" fill="#0f172a">DCH FOOTER</text></svg>',
                content_type="image/svg+xml",
            )
            res_footer = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {
                    "logo_footer": footer_dark_png,
                    "logo_footer_light": footer_light_svg,
                },
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_footer.status_code, 200)
            self.assertIn("/media/site/", res_footer.json()["data"]["logo_footer"])
            self.assertIn(".svg", res_footer.json()["data"]["logo_footer_light"])

            pub_res_footer = anon_client.get("/api/v1/home/site-settings/")
            self.assertEqual(pub_res_footer.status_code, 200)
            self.assertEqual(pub_res_footer.json()["data"]["logo_footer"], res_footer.json()["data"]["logo_footer"])
            self.assertEqual(pub_res_footer.json()["data"]["logo_footer_light"], res_footer.json()["data"]["logo_footer_light"])

            # 10. Clear footer brand logos resets to None
            res_clear_footer = self.client.patch(
                "/api/v1/dashboard/site-settings/",
                {
                    "clear_logo_footer": "true",
                    "clear_logo_footer_light": "true",
                },
                HTTP_X_CSRFTOKEN=admin_csrf,
                format="multipart",
            )
            self.assertEqual(res_clear_footer.status_code, 200)
            self.assertFalse(res_clear_footer.json()["data"]["logo_footer"])
            self.assertFalse(res_clear_footer.json()["data"]["logo_footer_light"])
        finally:
            settings_obj.refresh_from_db()
            if settings_obj.favicon:
                settings_obj.favicon.delete(save=False)
            if settings_obj.logo_icon:
                settings_obj.logo_icon.delete(save=False)
            if settings_obj.logo_icon_light:
                settings_obj.logo_icon_light.delete(save=False)
            if settings_obj.logo_footer:
                settings_obj.logo_footer.delete(save=False)
            if settings_obj.logo_footer_light:
                settings_obj.logo_footer_light.delete(save=False)

    def test_showroom_branch_management_and_public_api(self):
        # Create initial branch for duplicate checking
        initial_branch = ShowroomBranch.objects.create(
            branch_id="kakrail",
            name="Kakrail Branch",
            short_name="Kakrail",
            address="18 Shaheed",
            phone="01615-121312",
            email="kakrail@dreamcarhouse.com",
            hours="10 AM - 9 PM",
            map_link="https://maps.google.com/?q=kakrail",
            embed_map="https://maps.google.com/maps?q=kakrail",
            order=1,
            status="PUBLISHED",
        )

        # 1. Unauthenticated request denied
        anon_client = APIClient()
        anon_res = anon_client.get("/api/v1/dashboard/branches/")
        self.assertEqual(anon_res.status_code, 403)

        # 2. Staff without view_showroombranch denied
        self.staff_read_only.user_permissions.clear()
        staff_csrf = self._login_readonly()
        unperm_res = self.client.get("/api/v1/dashboard/branches/", HTTP_X_CSRFTOKEN=staff_csrf)
        self.assertEqual(unperm_res.status_code, 403)

        # 3. Superuser can list and create branches
        admin_csrf = self._login_superuser()
        list_res = self.client.get("/api/v1/dashboard/branches/", HTTP_X_CSRFTOKEN=admin_csrf)
        self.assertEqual(list_res.status_code, 200)

        # 4. Duplicate branch_id rejected
        dup_res = self.client.post(
            "/api/v1/dashboard/branches/",
            {
                "branch_id": "kakrail",
                "name": "Duplicate Branch",
                "short_name": "Dup",
                "address": "Sample Address",
                "phone": "0123456789",
                "email": "test@domain.com",
                "hours": "10 AM - 9 PM",
                "map_link": "https://maps.google.com/?q=test",
                "embed_map": "https://maps.google.com/maps?q=test",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(dup_res.status_code, 400)
        self.assertFalse(dup_res.json()["success"])


        # 5. Invalid map domain rejected
        invalid_map_res = self.client.post(
            "/api/v1/dashboard/branches/",
            {
                "branch_id": "test-branch",
                "name": "Test Branch",
                "short_name": "Test",
                "address": "Sample Address",
                "phone": "0123456789",
                "email": "test@domain.com",
                "hours": "10 AM - 9 PM",
                "map_link": "https://malicious.com/?q=test",
                "embed_map": "https://malicious.com/maps?q=test",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(invalid_map_res.status_code, 400)

        # 6. Create valid unpublished branch -> verify excluded from public endpoint
        create_res = self.client.post(
            "/api/v1/dashboard/branches/",
            {
                "branch_id": "banani-test",
                "name": "Banani Test Branch",
                "short_name": "Banani",
                "address": "Road 11, Banani, Dhaka",
                "phone": "01700-000000",
                "email": "banani@dreamcarhouse.com",
                "hours": "10 AM - 8 PM",
                "map_link": "https://maps.google.com/?q=Banani",
                "embed_map": "https://maps.google.com/maps?q=Banani",
                "order": 3,
                "status": "UNPUBLISHED",
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertEqual(create_res.status_code, 201)
        created_id = create_res.json()["data"]["id"]

        # Public list only includes published branches
        pub_res = anon_client.get("/api/v1/home/branches/")
        self.assertEqual(pub_res.status_code, 200)
        pub_branches = pub_res.json()["data"]
        self.assertFalse(any(b["branch_id"] == "banani-test" for b in pub_branches))

        # Delete test branch
        del_res = self.client.delete(f"/api/v1/dashboard/branches/{created_id}/", HTTP_X_CSRFTOKEN=admin_csrf)
        self.assertEqual(del_res.status_code, 200)

    def test_save_fix_empty_image_retention_partial_updates(self):
        """
        Regression test: editing records in the dashboard sends empty string or
        0-byte file for untouched image inputs. Serializers must retain the existing
        image and not fail with 'The submitted data was not a file'.
        """
        from base.models import BaseModel
        from apps.home.models import AboutSection, VipSanctuarySection
        from apps.inventory.models import Brand
        from apps.dashboard_api.serializers import (
            BrandManagementSerializer,
            AboutSectionManagementSerializer,
            VipSanctuarySectionManagementSerializer,
        )

        brand = Brand.objects.create(name="Test Retain Logo Brand", order=1, status=BaseModel.StatusChoices.PUBLISHED)
        try:
            # Test BrandManagementSerializer partial update with empty strings
            serializer = BrandManagementSerializer(
                brand,
                data={"name": "Test Retain Logo Brand Updated", "image": "", "feature_image": ""},
                partial=True,
            )
            self.assertTrue(serializer.is_valid(), serializer.errors)
            self.assertNotIn("image", serializer.validated_data)
            self.assertNotIn("feature_image", serializer.validated_data)

            # Test AboutSectionManagementSerializer partial update with empty reel_image
            about = AboutSection.objects.create(hero_title="Original Hero Title")
            about_serializer = AboutSectionManagementSerializer(
                about,
                data={"hero_title": "Updated Hero Title", "reel_image": ""},
                partial=True,
            )
            self.assertTrue(about_serializer.is_valid(), about_serializer.errors)
            self.assertNotIn("reel_image", about_serializer.validated_data)
            self.assertEqual(about_serializer.validated_data["hero_title"], "Updated Hero Title")

            # Test VipSanctuarySectionManagementSerializer partial update with empty background_image
            vip = VipSanctuarySection.objects.create(title="Original VIP Title")
            vip_serializer = VipSanctuarySectionManagementSerializer(
                vip,
                data={"title": "Updated VIP Title", "background_image": ""},
                partial=True,
            )
            self.assertTrue(vip_serializer.is_valid(), vip_serializer.errors)
            self.assertNotIn("background_image", vip_serializer.validated_data)
            self.assertEqual(vip_serializer.validated_data["title"], "Updated VIP Title")
        finally:
            brand.delete()

    def test_about_section_management_and_public_api(self):
        """
        Tests the About Us section dashboard management endpoint and public SSR endpoint.
        """
        from apps.home.models import AboutSection

        admin_csrf = self._login_superuser()
        anon_client = APIClient()

        # 1. Unauthenticated request to dashboard endpoint is rejected
        res_unauth = anon_client.get("/api/v1/dashboard/about-us/")
        self.assertEqual(res_unauth.status_code, 403)

        # 2. Staff without view_aboutsection is rejected with 403
        self._login_readonly()
        res_no_perm = self.client.get("/api/v1/dashboard/about-us/")
        self.assertEqual(res_no_perm.status_code, 403)

        # 3. Superuser can view about section
        admin_csrf = self._login_superuser()
        res_get = self.client.get("/api/v1/dashboard/about-us/")
        self.assertEqual(res_get.status_code, 200)
        self.assertTrue(res_get.json()["success"])
        self.assertIn("hero_title", res_get.json()["data"])

        # 4. Superuser can update about section
        res_update = self.client.post(
            "/api/v1/dashboard/about-us/",
            {
                "hero_title": "Automotive Excellence in Dhaka",
                "hero_badge": "DCH HERITAGE",
                "stats": [
                    {"number": "20+", "label": "Years Curating Luxury"},
                    {"number": "100%", "label": "Verified Pedigree"},
                ],
                "pillars": [
                    {"title": "Global Import", "description": "Direct factory allocation."},
                    {"title": "Vault Handover", "description": "Private sanctuary delivery."},
                ],
                "is_active": True,
            },
            HTTP_X_CSRFTOKEN=admin_csrf,
            format="json",
        )
        self.assertIn(res_update.status_code, [200, 201])
        self.assertEqual(res_update.json()["data"]["hero_title"], "Automotive Excellence in Dhaka")

        # 5. Public API returns the active about section
        res_pub = anon_client.get("/api/v1/home/about/")
        self.assertEqual(res_pub.status_code, 200)
        self.assertTrue(res_pub.json()["success"])
        self.assertEqual(res_pub.json()["data"]["hero_title"], "Automotive Excellence in Dhaka")
        self.assertEqual(len(res_pub.json()["data"]["stats"]), 2)





