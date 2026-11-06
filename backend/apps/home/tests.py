from django.test import TestCase, Client
from django.core.exceptions import ValidationError
from apps.home.models.slider_model import Slider
from apps.home.models.preference_model import PreferenceSection, PreferenceCategory
from apps.home.models.consultation_model import ConsultationSection
from apps.home.models.experience_model import ExperienceSection, ExperiencePillar
from apps.home.models.visual_chronicles_model import VisualChroniclesSection, VisualChroniclesItem
from apps.home.models.vip_sanctuary_model import VipSanctuarySection
from apps.home.models.showroom_branch_model import ShowroomBranch
from apps.home.models.site_settings_model import SiteSettings
from apps.home.models import ContactMessage, IdempotencyKey
from base.models import BaseModel
from django.core.cache import cache


class HomeNoFallbackRegressionTests(TestCase):
    def setUp(self):
        self.client = Client()
        cache.clear()

    def _extract_error(self, res):
        body = res.json()
        if "details" in body and isinstance(body["details"], dict):
            return body["details"].get("error", {})
        return body.get("error", {})

    def _extract_data(self, res):
        body = res.json()
        return body.get("data", body)

    # --- 1. Hero Slider ---
    def test_slider_unpublished_returns_404(self):
        Slider.objects.all().delete()
        res = self.client.get("/api/v1/home/slider/")
        self.assertEqual(res.status_code, 404)
        self.assertFalse(res.json()["success"])

        # Also when record exists but is_published=False
        Slider.objects.create(heading="Test Heading", is_published=False)
        res = self.client.get("/api/v1/home/slider/")
        self.assertEqual(res.status_code, 404)

    def test_slider_published_missing_heading_returns_422(self):
        Slider.objects.all().delete()
        Slider.objects.create(heading="", is_published=True)
        res = self.client.get("/api/v1/home/slider/")
        self.assertEqual(res.status_code, 422)
        err = self._extract_error(res)
        self.assertEqual(err.get("code"), "UNPROCESSABLE_ENTITY")

    def test_slider_model_clean_validation(self):
        slider = Slider(heading="   ", is_published=True)
        with self.assertRaises(ValidationError):
            slider.clean()

        slider.heading = "Valid Heading"
        slider.clean()  # should pass without error

    def test_slider_valid_published_returns_200(self):
        Slider.objects.all().delete()
        Slider.objects.create(heading="The Pinnacle of Luxury Automobiles", is_published=True)
        res = self.client.get("/api/v1/home/slider/")
        self.assertEqual(res.status_code, 200)
        data = self._extract_data(res)
        self.assertEqual(data["heading"], "The Pinnacle of Luxury Automobiles")

    # --- 2. Preference Section ---
    def test_preference_section_unpublished_returns_404(self):
        PreferenceSection.objects.all().delete()
        res = self.client.get("/api/v1/home/preference-section/")
        self.assertEqual(res.status_code, 404)

        PreferenceSection.objects.create(heading="Curated Inventory", is_active=False)
        res = self.client.get("/api/v1/home/preference-section/")
        self.assertEqual(res.status_code, 404)

    def test_preference_section_zero_categories_returns_422(self):
        PreferenceSection.objects.all().delete()
        PreferenceSection.objects.create(heading="Curated Inventory", is_active=True)
        res = self.client.get("/api/v1/home/preference-section/")
        self.assertEqual(res.status_code, 422)
        err = self._extract_error(res)
        self.assertEqual(err.get("code"), "UNPROCESSABLE_ENTITY")

    def test_preference_section_model_clean_validation(self):
        sec = PreferenceSection.objects.create(heading="Curated Inventory", is_active=True)
        with self.assertRaises(ValidationError):
            sec.clean()

        PreferenceCategory.objects.create(
            section=sec,
            category_key="BRAND_NEW",
            label="Brand New",
            cta_text="Explore Brand New",
            is_active=True,
        )
        sec.clean()  # should pass now with 1 category

    def test_preference_section_valid_returns_200(self):
        PreferenceSection.objects.all().delete()
        sec = PreferenceSection.objects.create(heading="Curated Inventory", is_active=True)
        PreferenceCategory.objects.create(
            section=sec,
            category_key="BRAND_NEW",
            label="Brand New",
            cta_text="Explore Brand New",
            is_active=True,
        )
        res = self.client.get("/api/v1/home/preference-section/")
        self.assertEqual(res.status_code, 200)
        data = self._extract_data(res)
        self.assertEqual(len(data["categories"]), 1)

    # --- 3. Experience Section ---
    def test_experience_section_unpublished_returns_404(self):
        ExperienceSection.objects.all().delete()
        res = self.client.get("/api/v1/home/experience/")
        self.assertEqual(res.status_code, 404)

        ExperienceSection.objects.create(title="Experience Beyond Ordinary", is_active=False)
        res = self.client.get("/api/v1/home/experience/")
        self.assertEqual(res.status_code, 404)

    def test_experience_section_fewer_than_3_pillars_returns_422(self):
        ExperienceSection.objects.all().delete()
        sec = ExperienceSection.objects.create(title="Experience Beyond Ordinary", is_active=True)
        ExperiencePillar.objects.create(
            section=sec, pillar_number="01", title="Pillar 1", description="Desc 1", is_active=True
        )
        res = self.client.get("/api/v1/home/experience/")
        self.assertEqual(res.status_code, 422)
        err = self._extract_error(res)
        self.assertEqual(err.get("code"), "UNPROCESSABLE_ENTITY")

    def test_experience_section_model_clean_validation(self):
        sec = ExperienceSection.objects.create(title="Experience Beyond Ordinary", is_active=True)
        with self.assertRaises(ValidationError):
            sec.clean()

        # Add 3 active pillars
        for i in range(1, 4):
            ExperiencePillar.objects.create(
                section=sec,
                pillar_number=f"0{i}",
                title=f"Pillar {i}",
                description=f"Desc {i}",
                is_active=True,
            )
        sec.clean()  # should pass with 3 pillars

    # --- 4. Visual Chronicles Section ---
    def test_visual_chronicles_unpublished_returns_404(self):
        VisualChroniclesSection.objects.all().delete()
        res = self.client.get("/api/v1/home/visual-chronicles/")
        self.assertEqual(res.status_code, 404)

    def test_visual_chronicles_zero_items_returns_422(self):
        VisualChroniclesSection.objects.all().delete()
        VisualChroniclesSection.objects.create(heading="Visual Chronicles", is_active=True)
        res = self.client.get("/api/v1/home/visual-chronicles/")
        self.assertEqual(res.status_code, 422)
        err = self._extract_error(res)
        self.assertEqual(err.get("code"), "UNPROCESSABLE_ENTITY")

    def test_visual_chronicles_model_clean_validation(self):
        sec = VisualChroniclesSection.objects.create(heading="Visual Chronicles", is_active=True)
        with self.assertRaises(ValidationError):
            sec.clean()

        VisualChroniclesItem.objects.create(
            section=sec, title="Showroom Flagship", description="Desc", is_active=True
        )
        sec.clean()  # should pass with 1 item

    # --- 5. VIP Sanctuary Dynamic Branch & Fallback Avoidance ---
    def test_vip_sanctuary_dynamic_branch_resolution_without_kakrail_override(self):
        VipSanctuarySection.objects.all().delete()
        branch = ShowroomBranch.objects.create(
            name="Banani VIP Studio",
            short_name="Banani",
            branch_id="banani",
            address="House #42, Road #11, Block D, Banani",
            hotline="01799-887766",
            hours="Mon - Sat: 9:00 AM - 8:00 PM",
            order=1,
            status=BaseModel.StatusChoices.PUBLISHED,
        )
        sec = VipSanctuarySection.objects.create(
            title="Sanctuary Title",
            branch=branch,
            is_active=True,
        )
        res = self.client.get("/api/v1/home/vip-sanctuary/")
        self.assertEqual(res.status_code, 200)
        data = self._extract_data(res)
        # Renders the exact configured branch address, not a hardcoded Kakrail fallback
        self.assertEqual(data["location_text"], "House #42, Road #11, Block D, Banani")
        self.assertEqual(data["hours_text"], "Mon - Sat: 9:00 AM - 8:00 PM")
        self.assertEqual(data["phone_text"], "01799-887766")
        self.assertIn("01799887766", data["whatsapp_url"])
        self.assertNotIn("8801615121312", data["whatsapp_url"])

    def test_vip_sanctuary_custom_override(self):
        VipSanctuarySection.objects.all().delete()
        sec = VipSanctuarySection.objects.create(
            title="Custom Location",
            location_text="Custom Pop-Up Suite, Baridhara Diplomatic Zone",
            hours_text="By Appointment Only",
            phone_text="01811-223344",
            is_active=True,
        )
        res = self.client.get("/api/v1/home/vip-sanctuary/")
        self.assertEqual(res.status_code, 200)
        data = self._extract_data(res)
        self.assertEqual(data["location_text"], "Custom Pop-Up Suite, Baridhara Diplomatic Zone")
        self.assertEqual(data["hours_text"], "By Appointment Only")
        self.assertEqual(data["phone_text"], "01811-223344")

    # --- 6. Consultation Section Fallback Check ---
    def test_consultation_section_no_hardcoded_phone(self):
        ConsultationSection.objects.all().delete()
        SiteSettings.objects.all().delete()
        sec = ConsultationSection.objects.create(
            heading="Private Consultation",
            whatsapp_number="",
            is_active=True,
        )
        res = self.client.get("/api/v1/home/consultation/")
        self.assertEqual(res.status_code, 200)
        data = self._extract_data(res)
        # When neither section, representative, nor site settings has a phone, returns empty string, NOT 8801615121312
        self.assertEqual(data["whatsapp_url"], "")

    # --- 7. Contact & Appointment Enquiry Idempotency and Validation ---
    def test_direct_api_validation_rejects_invalid_fields(self):
        # Name too short
        res = self.client.post("/api/v1/home/contact/", {
            "name": "A",
            "phone": "01711223344",
            "enquiry": "Need details on BMW X5.",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("name", str(res.json()))

        # Name too long (>100 chars)
        res = self.client.post("/api/v1/home/contact/", {
            "name": "A" * 105,
            "phone": "01711223344",
            "enquiry": "Need details on BMW X5.",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("name", str(res.json()))

        # Invalid phone (<7 digits)
        res = self.client.post("/api/v1/home/contact/", {
            "name": "Rahim Khan",
            "phone": "123",
            "enquiry": "Need details on BMW X5.",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("phone", str(res.json()))

        # Invalid email when preferred_contact is EMAIL
        res = self.client.post("/api/v1/home/contact/", {
            "name": "Rahim Khan",
            "phone": "01711223344",
            "email": "not-an-email",
            "enquiry": "Need details on BMW X5.",
            "topic": "BUYING",
            "preferred_contact": "EMAIL",
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("email", str(res.json()))

        # Missing enquiry message
        res = self.client.post("/api/v1/home/contact/", {
            "name": "Rahim Khan",
            "phone": "01711223344",
            "enquiry": "   ",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("enquiry", str(res.json()))

        # Valid direct submission succeeds
        valid_res = self.client.post("/api/v1/home/contact/", {
            "name": "Rahim Khan",
            "phone": "01711223344",
            "email": "rahim@example.com",
            "vehicle": "BMW X5 xDrive40i",
            "enquiry": "I would like to schedule a private viewing this Saturday.",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        })
        self.assertEqual(valid_res.status_code, 201)
        self.assertTrue(ContactMessage.objects.filter(phone="01711223344").exists())

    def test_idempotency_returns_original_result_without_duplicate_row(self):
        cache.clear()
        key = "idemp-test-unique-key-101"
        payload = {
            "name": "Tariq Ahmed",
            "phone": "+8801712345678",
            "email": "tariq@example.com",
            "vehicle": "Mercedes-Benz G 63 AMG",
            "enquiry": "Requesting confidential price quote and showroom allocation.",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        }

        # 1. First submission
        res1 = self.client.post("/api/v1/home/contact/", payload, HTTP_IDEMPOTENCY_KEY=key, REMOTE_ADDR="127.0.0.21")
        self.assertEqual(res1.status_code, 201)
        data1 = self._extract_data(res1)
        self.assertEqual(ContactMessage.objects.filter(name="Tariq Ahmed").count(), 1)

        # 2. Duplicate retry with same key and same payload
        res2 = self.client.post("/api/v1/home/contact/", payload, HTTP_IDEMPOTENCY_KEY=key, REMOTE_ADDR="127.0.0.21")
        self.assertEqual(res2.status_code, 201)
        data2 = self._extract_data(res2)

        # Exactly ONE record must exist in the database (duplicate prevented)
        self.assertEqual(ContactMessage.objects.filter(name="Tariq Ahmed").count(), 1)
        self.assertEqual(data1["name"], data2["name"])
        self.assertEqual(data1["phone"], data2["phone"])

    def test_idempotency_different_payload_returns_409_conflict(self):
        cache.clear()
        key = "idemp-test-conflict-key-202"
        payload_a = {
            "name": "Arman Hossain",
            "phone": "+8801811223344",
            "enquiry": "Initial enquiry for Range Rover SV.",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        }
        res_a = self.client.post("/api/v1/home/contact/", payload_a, HTTP_IDEMPOTENCY_KEY=key, REMOTE_ADDR="127.0.0.22")
        self.assertEqual(res_a.status_code, 201)

        # Re-using the same submission key with a conflicting payload
        payload_b = {
            "name": "Different Client",
            "phone": "+8801999887766",
            "enquiry": "Different enquiry message.",
            "topic": "SELLING",
            "preferred_contact": "PHONE",
        }
        res_b = self.client.post("/api/v1/home/contact/", payload_b, HTTP_IDEMPOTENCY_KEY=key, REMOTE_ADDR="127.0.0.22")
        self.assertEqual(res_b.status_code, 409)
        err = self._extract_error(res_b)
        self.assertEqual(err.get("code"), "IDEMPOTENCY_CONFLICT")

    def test_concurrent_idempotency_creates_single_record(self):
        from unittest.mock import patch
        from django.db import IntegrityError
        key = "idemp-test-thread-concurrent-303"
        payload = {
            "name": "Concurrent Client",
            "phone": "+8801555443322",
            "enquiry": "Testing concurrent reservation requests.",
            "topic": "BUYING",
            "preferred_contact": "WHATSAPP",
        }

        # 1. First request creates the record
        res1 = self.client.post("/api/v1/home/contact/", payload, HTTP_IDEMPOTENCY_KEY=key, REMOTE_ADDR="127.0.0.10")
        self.assertEqual(res1.status_code, 201)
        self.assertEqual(ContactMessage.objects.filter(name="Concurrent Client").count(), 1)

        # 2. Simulate concurrent race condition where another worker committed
        # the key right as IdempotencyKey.objects.create executes.
        # IntegrityError is caught and the original response is replayed safely.
        def _mock_race_create(*args, **kwargs):
            raise IntegrityError("UNIQUE constraint failed: tbl_idempotency_key.key")

        with patch.object(IdempotencyKey.objects, "create", side_effect=_mock_race_create):
            res_concurrent = self.client.post(
                "/api/v1/home/contact/",
                payload,
                HTTP_IDEMPOTENCY_KEY=key,
                REMOTE_ADDR="127.0.0.11",
            )
            self.assertEqual(res_concurrent.status_code, 201)

        # Exactly ONE ContactMessage in database
        self.assertEqual(ContactMessage.objects.filter(name="Concurrent Client").count(), 1)

    def test_client_ip_does_not_trust_arbitrary_forwarded_for(self):
        from core.utils.network import get_client_ip
        from django.test import RequestFactory
        factory = RequestFactory()

        # By default (not behind trusted proxy), arbitrary X-Forwarded-For is ignored
        req = factory.post("/api/v1/home/contact/", REMOTE_ADDR="192.168.1.100", HTTP_X_FORWARDED_FOR="10.0.0.99, 1.2.3.4")
        ip = get_client_ip(req)
        self.assertEqual(ip, "192.168.1.100")

    def test_shared_throttling_enforces_rate_limit(self):
        from core.throttling import check_shared_throttle
        from rest_framework.exceptions import Throttled
        from django.core.cache import cache
        cache.clear()

        # 3 requests within 60s window allowed, 4th throttled
        check_shared_throttle("test_enquiry", "127.0.0.1", max_requests=3, window_seconds=60)
        check_shared_throttle("test_enquiry", "127.0.0.1", max_requests=3, window_seconds=60)
        check_shared_throttle("test_enquiry", "127.0.0.1", max_requests=3, window_seconds=60)

        with self.assertRaises(Throttled):
            check_shared_throttle("test_enquiry", "127.0.0.1", max_requests=3, window_seconds=60)

