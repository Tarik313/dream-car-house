from rest_framework import status
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from base.models import BaseModel
from core.mixins.image_validation import ImageValidationMixin

from core.settings.restconf.pagination import PeopleTalkPagination

from apps.home.models import (
    Slider, SocialMedia, SellCar, SellYourCarImages, PeopleTalkAboutUs, Subscriber, SalesRepresentative,
    ContactMessage, SiteSettings, ShowroomBranch, PreferenceSection, PreferenceCategory,
    ConsultationSection, ExperienceSection,
    VisualChroniclesSection, VipSanctuarySection,
)

from apps.home.serializers import (
    SliderSerializer, SocialMediaSerializer, SellYourCarImageSerializer, SellCarSerializer,
    PeopleTalkAboutUsSerializer, SubscriberSerializer, SalesRepresentativeListSearchSerializer,
    ContactMessageSerializer, PublicSiteSettingsSerializer, PublicShowroomBranchSerializer,
    PublicPreferenceSectionSerializer, PublicPreferenceCategorySerializer,
    PublicConsultationSectionSerializer, PublicExperienceSectionSerializer,
    PublicVisualChroniclesSectionSerializer, PublicVipSanctuarySectionSerializer,
)



class SliderAPIView(APIView):
    def get(self, request, format=None):
        slider_info = Slider.objects.filter(is_published=True).order_by("id").last()
        if slider_info is None:
            return Response(
                {"success": False, "error": {"code": "NOT_FOUND", "message": "Hero slider is not published."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not slider_info.heading or not slider_info.heading.strip():
            return Response(
                {"success": False, "error": {"code": "UNPROCESSABLE_ENTITY", "message": "Published slider requires a valid heading."}},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        serializer = SliderSerializer(slider_info, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)




class SocialMediaAPIView(APIView):

    def get(self, request, format=None):
        sm_info = SocialMedia.objects.last()
        if sm_info is not None:
            serializer = SocialMediaSerializer(sm_info, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No information available."}, status=status.HTTP_404_NOT_FOUND)


class SubscriberAPIView(generics.CreateAPIView):
    serializer_class = SubscriberSerializer
    queryset = Subscriber.objects.all()


class SellCarCreateAPIView(ImageValidationMixin, generics.CreateAPIView):
    serializer_class = SellCarSerializer
    queryset = SellCar.objects.all()

    def create(self, request, *args, **kwargs):
        # Use the serializer to validate the base SellCar data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sell_car = serializer.save()

        # Handle multiple images from the "images" field
        images = request.FILES.getlist('images')

        images = request.FILES.getlist('images')
        self.validate_and_save_images(images, sell_car, SellYourCarImages, 'sellcar')

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ContactMessageCreateAPIView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()

    def get_throttles(self):
        from core.throttling import EnquiryRateThrottle
        return [EnquiryRateThrottle()]

    def create(self, request, *args, **kwargs):
        import hashlib
        import json
        from django.db import transaction, IntegrityError
        from apps.home.models import IdempotencyKey

        # 1. Extract submission / idempotency key
        raw_key = (
            request.META.get("HTTP_IDEMPOTENCY_KEY")
            or request.META.get("HTTP_X_SUBMISSION_KEY")
            or request.META.get("HTTP_X_IDEMPOTENCY_KEY")
            or (request.data.get("idempotency_key") if isinstance(request.data, dict) else None)
            or (request.data.get("submission_key") if isinstance(request.data, dict) else None)
        )
        submission_key = str(raw_key).strip() if raw_key else None

        if not submission_key:
            # Direct request without idempotency key; execute standard validated flow
            return super().create(request, *args, **kwargs)

        # 2. Canonicalize payload and compute hash
        data_copy = dict(request.data) if isinstance(request.data, dict) else {}
        data_copy.pop("idempotency_key", None)
        data_copy.pop("submission_key", None)
        canonical_str = json.dumps(data_copy, sort_keys=True, separators=(",", ":"), default=str)
        req_hash = hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

        # 3. Persistent atomic idempotency check
        with transaction.atomic():
            existing = IdempotencyKey.objects.filter(
                key=submission_key,
                scope="contact_enquiry"
            ).first()

            if existing:
                if existing.request_hash == req_hash:
                    # Same submission key and same payload: return original result
                    return Response(existing.response_data, status=existing.response_code)
                else:
                    # Same submission key with different payload: reject
                    return Response(
                        {
                            "success": False,
                            "error": {
                                "code": "IDEMPOTENCY_CONFLICT",
                                "message": f"Submission key '{submission_key}' was already used with a different request payload.",
                            },
                        },
                        status=status.HTTP_409_CONFLICT,
                    )

            # Validate input before persisting
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data

            try:
                IdempotencyKey.objects.create(
                    key=submission_key,
                    scope="contact_enquiry",
                    request_hash=req_hash,
                    response_code=status.HTTP_201_CREATED,
                    response_data=response_data,
                )
            except IntegrityError:
                # Concurrent race condition: another worker committed the key simultaneously
                winner = IdempotencyKey.objects.get(key=submission_key, scope="contact_enquiry")
                if winner.request_hash == req_hash:
                    return Response(winner.response_data, status=winner.response_code)
                return Response(
                    {
                        "success": False,
                        "error": {
                            "code": "IDEMPOTENCY_CONFLICT",
                            "message": f"Submission key '{submission_key}' was already used with a different request payload.",
                        },
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class PeopleTalkListAPIView(generics.ListAPIView):
    serializer_class = PeopleTalkAboutUsSerializer
    pagination_class = PeopleTalkPagination

    def get_queryset(self):
        return PeopleTalkAboutUs.objects.filter(
            status=BaseModel.StatusChoices.PUBLISHED
        ).order_by('-updated_at')


class SalesRepresentativeListAPI(generics.ListAPIView):
    serializer_class = SalesRepresentativeListSearchSerializer
    queryset = SalesRepresentative.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)
    pagination_class = None


class PublicSiteSettingsAPIView(APIView):
    def get(self, request, format=None):
        settings_obj = SiteSettings.objects.first()
        if settings_obj is None:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Public site settings have not been configured.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PublicSiteSettingsSerializer(settings_obj, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class PublicShowroomBranchListAPIView(APIView):
    def get(self, request, format=None):
        branches = ShowroomBranch.objects.filter(
            status=BaseModel.StatusChoices.PUBLISHED
        ).order_by("order", "id")
        serializer = PublicShowroomBranchSerializer(branches, many=True, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class PublicPreferenceSectionAPIView(APIView):
    def get(self, request, format=None):
        section = PreferenceSection.objects.filter(is_active=True).first()
        if not section:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Preference section is not published.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        active_cats = section.categories.count()
        if active_cats < 1:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "UNPROCESSABLE_ENTITY",
                        "message": "Preference section configuration error: requires at least 1 category.",
                    },
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        serializer = PublicPreferenceSectionSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class PublicConsultationSectionAPIView(APIView):
    def get(self, request, format=None):
        section = ConsultationSection.objects.filter(is_active=True).first()
        if not section:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Consultation section is not published.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PublicConsultationSectionSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class PublicExperienceSectionAPIView(APIView):
    def get(self, request, format=None):
        section = ExperienceSection.objects.filter(is_active=True).first()
        if not section:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Experience section is not published.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        active_pillars = section.pillars.filter(is_active=True).count()
        if active_pillars < 3:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "UNPROCESSABLE_ENTITY",
                        "message": f"Experience section configuration error: requires at least 3 active pillars (found {active_pillars}).",
                    },
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        serializer = PublicExperienceSectionSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class PublicVisualChroniclesSectionAPIView(APIView):
    def get(self, request, format=None):
        section = VisualChroniclesSection.objects.filter(is_active=True).first()
        if not section:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Visual Chronicles section is not published.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        active_items = section.items.filter(is_active=True).count()
        if active_items < 1:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "UNPROCESSABLE_ENTITY",
                        "message": "Visual Chronicles section configuration error: requires at least 1 active story card item.",
                    },
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        serializer = PublicVisualChroniclesSectionSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class PublicVipSanctuarySectionAPIView(APIView):
    def get(self, request, format=None):
        section = VipSanctuarySection.objects.filter(is_active=True).first()
        if not section:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "VIP Sanctuary section is not published.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PublicVipSanctuarySectionSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


from apps.home.models.about_model import AboutSection
from apps.home.serializers import PublicAboutSectionSerializer

class PublicAboutSectionAPIView(APIView):
    def get(self, request, format=None):
        section = AboutSection.objects.filter(is_active=True).first()
        if not section:
            section = AboutSection.objects.first()
            if not section:
                section = AboutSection()
        serializer = PublicAboutSectionSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)








from apps.home.models.showroom_story_model import ShowroomStory
from apps.home.serializers import PublicShowroomStorySerializer

class PublicShowroomStoryListAPIView(APIView):
    def get(self, request, format=None):
        stories = ShowroomStory.objects.filter(is_active=True).order_by("order", "-created_at")
        serializer = PublicShowroomStorySerializer(stories, many=True, context={"request": request})
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
