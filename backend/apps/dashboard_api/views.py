import logging
import time
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import Permission
from django.db.models import ProtectedError, Q, Count
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied, Throttled, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

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
    PreferenceSection,
    PreferenceCategory,
    ConsultationSection,
    ExperienceSection,
    ExperiencePillar,
    VisualChroniclesSection,
    VisualChroniclesItem,
    VipSanctuarySection,
    AboutSection,
)
from django.contrib.auth.models import User, Group, Permission
from apps.seo_config.models import SEOConfig, CategoryPageSEO
from .permissions import IsActiveStaff, DashboardModelPermission
from .serializers import (
    BrandManagementSerializer,
    ModelGenerationManagementSerializer,
    BodyStyleManagementSerializer,
    InventoryListManagementSerializer,
    InventoryDetailManagementSerializer,
    InventoryImageManagementSerializer,
    StockManagementSerializer,
    InventoryQuoteManagementSerializer,
    SellCarManagementSerializer,
    SellYourCarImageManagementSerializer,
    ContactMessageManagementSerializer,
    SubscriberManagementSerializer,
    SliderManagementSerializer,
    SocialMediaManagementSerializer,
    PeopleTalkAboutUsManagementSerializer,
    SalesRepresentativeManagementSerializer,
    SEOConfigManagementSerializer,
    CategoryPageSEOManagementSerializer,
    UserListManagementSerializer,
    UserDetailManagementSerializer,
    GroupManagementSerializer,
    PermissionSerializer,
    SiteSettingsManagementSerializer,
    ShowroomBranchManagementSerializer,
    PreferenceSectionManagementSerializer,
    PreferenceCategoryManagementSerializer,
    ConsultationSectionManagementSerializer,
    ExperienceSectionManagementSerializer,
    ExperiencePillarManagementSerializer,
    VisualChroniclesItemManagementSerializer,
    VisualChroniclesSectionManagementSerializer,
    VipSanctuarySectionManagementSerializer,
    AboutSectionManagementSerializer,
)



logger = logging.getLogger(__name__)

_LOGIN_ATTEMPTS = {}
_MAX_ATTEMPTS_PER_WINDOW = 5
_WINDOW_SECONDS = 60


def _check_login_throttle(ip_address: str):
    from core.throttling import check_shared_throttle
    check_shared_throttle(
        key_prefix="login",
        ident=ip_address,
        max_requests=_MAX_ATTEMPTS_PER_WINDOW,
        window_seconds=_WINDOW_SECONDS,
        error_message="Too many login attempts. Please try again later.",
    )


def _record_successful_login(ip_address: str):
    from core.throttling import clear_shared_throttle
    clear_shared_throttle(key_prefix="login", ident=ip_address)


class DashboardBaseAPIView(APIView):
    """
    Base view for all dashboard endpoints:
    - Enforces SessionAuthentication with CSRF enforcement on state-changing methods.
    - JSONRenderer only.
    - Private, no-store Cache-Control and X-Robots-Tag headers.
    - Standardized envelope format:
      Success: {"success": true, "data": ...}
      Error: {"success": false, "error": {"code": "...", "message": "...", "field_errors": {...}}}
    """
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsActiveStaff,)
    renderer_classes = (JSONRenderer,)
    schema = None

    def handle_exception(self, exc):
        response = super().handle_exception(exc)
        code = getattr(exc, "default_code", "REQUEST_FAILED")
        message = str(getattr(exc, "detail", "Dashboard request could not be completed."))
        field_errors = None

        if isinstance(exc, ValidationError):
            code = "VALIDATION_ERROR"
            message = "Validation error."
            field_errors = exc.detail
        elif response.status_code == 401:
            code = "UNAUTHENTICATED"
            message = "Authentication required."
        elif response.status_code == 403:
            code = "FORBIDDEN"
            message = "You do not have permission to perform this action."
        elif response.status_code == 404:
            code = "NOT_FOUND"
            message = "Record not found."
        elif response.status_code == 429:
            code = "THROTTLED"

        err_data = {
            "code": code,
            "message": message,
        }
        if field_errors:
            err_data["field_errors"] = field_errors

        response.data = {
            "success": False,
            "error": err_data,
        }
        return response

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "private, no-store, must-revalidate"
        response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
        return response


class LoginView(APIView):
    authentication_classes = ()
    permission_classes = ()
    renderer_classes = (JSONRenderer,)
    schema = None

    def handle_exception(self, exc):
        response = super().handle_exception(exc)
        code = getattr(exc, "default_code", "REQUEST_FAILED")
        message = str(getattr(exc, "detail", "Login failed."))
        if isinstance(exc, (AuthenticationFailed, PermissionDenied)):
            code = "INVALID_CREDENTIALS"
            message = "Invalid credentials."
        elif isinstance(exc, Throttled):
            code = "THROTTLED"

        response.data = {
            "success": False,
            "error": {
                "code": code,
                "message": message,
            },
        }
        return response

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "private, no-store, must-revalidate"
        response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
        return response

    def post(self, request):
        from core.utils.network import get_client_ip
        ip = get_client_ip(request)
        _check_login_throttle(ip)

        data = request.data or {}
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            raise AuthenticationFailed("Invalid credentials.")

        if "@" in username:
            from django.contrib.auth.models import User
            matched_user = User.objects.filter(email__iexact=username).first()
            if matched_user:
                username = matched_user.username

        user = authenticate(request, username=username, password=password)
        if user is None:
            raise AuthenticationFailed("Invalid credentials.")

        if not user.is_active or not user.is_staff:
            logger.warning("Rejected non-active/non-staff login attempt for username: %s", username)
            raise AuthenticationFailed("Invalid credentials.")

        login(request, user)
        _record_successful_login(ip)

        csrf_token = get_token(request)
        permissions = list(user.get_all_permissions()) if not user.is_superuser else ["*"]

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "permissions": permissions,
        }

        return Response({
            "success": True,
            "data": {
                "user": user_data,
                "csrf_token": csrf_token,
            }
        })


class LogoutView(DashboardBaseAPIView):
    def post(self, request):
        logout(request)
        return Response({"success": True, "data": {"message": "Logged out successfully."}})


class MeView(DashboardBaseAPIView):
    def get(self, request):
        user = request.user
        permissions = list(user.get_all_permissions()) if not user.is_superuser else ["*"]
        return Response({
            "success": True,
            "data": {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "permissions": permissions,
                }
            }
        })


class AccessProbeView(DashboardBaseAPIView):
    def get(self, request):
        return Response({
            "success": True,
            "data": {
                "authenticated": True,
                "user_id": request.user.id,
                "username": request.user.username,
            }
        })


# ==============================================================================
# Brand Management Endpoints
# ==============================================================================

class BrandListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Brand

    def get(self, request):
        qs = Brand.objects.all().order_by("name", "id")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(segment__icontains=q))

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)

        segment_param = request.query_params.get("segment", "").strip()
        if segment_param:
            qs = qs.filter(segment=segment_param)

        ordering = request.query_params.get("ordering", "").strip()
        if ordering:
            allowed = {"name", "-name", "segment", "-segment", "status", "-status", "id", "-id"}
            if ordering in allowed:
                qs = qs.order_by(ordering, "id")

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", "12")
        try:
            page = max(1, int(page_str))
            page_size = min(100, max(1, int(page_size_str)))
        except ValueError:
            page, page_size = 1, 12

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = BrandManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = BrandManagementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        brand = serializer.save()
        return Response({"success": True, "data": BrandManagementSerializer(brand).data}, status=status.HTTP_201_CREATED)


class BrandDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Brand

    def get(self, request, pk):
        brand = get_object_or_404(Brand, pk=pk)
        return Response({"success": True, "data": BrandManagementSerializer(brand).data})

    def patch(self, request, pk):
        brand = get_object_or_404(Brand, pk=pk)
        serializer = BrandManagementSerializer(brand, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": BrandManagementSerializer(updated).data})

    def delete(self, request, pk):
        brand = get_object_or_404(Brand, pk=pk)
        
        # Deletion Impact Check
        inventory_count = Inventory.objects.filter(brand=brand).count()
        model_count = ModelGeneration.objects.filter(brand=brand).count()

        # In this phase, block deletion that would remove vehicles
        if inventory_count > 0:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "PROTECTED_CASCADE",
                        "message": (
                            f"Cannot delete brand '{brand.name}'. It is currently associated with "
                            f"{inventory_count} inventory vehicle(s). Deletion of brands with active "
                            "vehicles is blocked in this phase to prevent data loss. Please reassign or "
                            "delete the dependent vehicles first."
                        ),
                        "impact": {
                            "brand_id": brand.id,
                            "brand_name": brand.name,
                            "inventory_count": inventory_count,
                            "model_generation_count": model_count,
                            "blocked": True,
                        },
                    },
                },
                status=status.HTTP_409_CONFLICT,
            )

        # Require explicit confirmation query parameter or body if cascade impact on model generations exists
        force = request.query_params.get("confirm", "").lower() == "true" or (
            isinstance(request.data, dict) and request.data.get("confirm") is True
        )

        if model_count > 0 and not force:
            return Response(
                {
                    "success": False,
                    "error": {
                        "code": "CASCADE_IMPACT",
                        "message": (
                            f"Deleting brand '{brand.name}' will cascade delete "
                            f"{model_count} model generation(s). "
                            "Explicit confirmation ('confirm=true') is required."
                        ),
                        "impact": {
                            "brand_id": brand.id,
                            "brand_name": brand.name,
                            "inventory_count": 0,
                            "model_generation_count": model_count,
                            "blocked": False,
                        },
                    },
                },
                status=status.HTTP_409_CONFLICT,
            )

        brand.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Brand '{brand.name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class BrandCascadeImpactView(DashboardBaseAPIView):
    """
    GET /api/v1/dashboard/brands/<id>/impact/
    Returns affected inventory and model generation counts before delete.
    """
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Brand

    def get(self, request, pk):
        brand = get_object_or_404(Brand, pk=pk)
        inventory_count = Inventory.objects.filter(brand=brand).count()
        model_count = ModelGeneration.objects.filter(brand=brand).count()
        return Response({
            "success": True,
            "data": {
                "brand_id": brand.id,
                "brand_name": brand.name,
                "inventory_count": inventory_count,
                "model_generation_count": model_count,
                "has_cascades": (inventory_count > 0 or model_count > 0),
                "blocked": inventory_count > 0,
                "block_reason": (
                    f"Brand is linked to {inventory_count} inventory vehicle(s). "
                    "Deletion is blocked in this phase to prevent vehicle data loss."
                    if inventory_count > 0
                    else None
                ),
            }
        })


# ==============================================================================
# ModelGeneration Management Endpoints
# ==============================================================================

class ModelGenerationListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ModelGeneration

    def get(self, request):
        qs = ModelGeneration.objects.select_related("brand").all().order_by("brand__name", "model", "id")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(Q(model__icontains=q) | Q(brand__name__icontains=q))

        brand_id = request.query_params.get("brand", "").strip()
        if brand_id:
            qs = qs.filter(brand_id=brand_id)

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)

        ordering = request.query_params.get("ordering", "").strip()
        if ordering:
            allowed = {"model", "-model", "status", "-status", "id", "-id", "brand__name", "-brand__name"}
            if ordering in allowed:
                qs = qs.order_by(ordering, "id")

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", "20")
        try:
            page = max(1, int(page_str))
            page_size = min(100, max(1, int(page_size_str)))
        except ValueError:
            page, page_size = 1, 20

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = ModelGenerationManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = ModelGenerationManagementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        model_obj = serializer.save()
        return Response({"success": True, "data": ModelGenerationManagementSerializer(model_obj).data}, status=status.HTTP_201_CREATED)


class ModelGenerationDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ModelGeneration

    def get(self, request, pk):
        model_obj = get_object_or_404(ModelGeneration.objects.select_related("brand"), pk=pk)
        return Response({"success": True, "data": ModelGenerationManagementSerializer(model_obj).data})

    def patch(self, request, pk):
        model_obj = get_object_or_404(ModelGeneration, pk=pk)
        serializer = ModelGenerationManagementSerializer(model_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": ModelGenerationManagementSerializer(updated).data})

    def delete(self, request, pk):
        model_obj = get_object_or_404(ModelGeneration, pk=pk)
        inventory_count = Inventory.objects.filter(model=model_obj).count()

        # In inventory model: model = models.ForeignKey(on_delete=models.SET_NULL, null=True)
        # Deleting model sets FK to null on affected cars; provide impact notice
        model_obj.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Model '{model_obj.model}' deleted successfully. Set null on {inventory_count} vehicle(s).",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# BodyStyle Management Endpoints
# ==============================================================================

class BodyStyleListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = BodyStyle

    def get(self, request):
        qs = BodyStyle.objects.all().order_by("body", "id")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(body__icontains=q)

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)

        ordering = request.query_params.get("ordering", "").strip()
        if ordering:
            allowed = {"body", "-body", "status", "-status", "id", "-id"}
            if ordering in allowed:
                qs = qs.order_by(ordering, "id")

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", "20")
        try:
            page = max(1, int(page_str))
            page_size = min(100, max(1, int(page_size_str)))
        except ValueError:
            page, page_size = 1, 20

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = BodyStyleManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = BodyStyleManagementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        style = serializer.save()
        return Response({"success": True, "data": BodyStyleManagementSerializer(style).data}, status=status.HTTP_201_CREATED)


class BodyStyleDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = BodyStyle

    def get(self, request, pk):
        style = get_object_or_404(BodyStyle, pk=pk)
        return Response({"success": True, "data": BodyStyleManagementSerializer(style).data})

    def patch(self, request, pk):
        style = get_object_or_404(BodyStyle, pk=pk)
        serializer = BodyStyleManagementSerializer(style, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": BodyStyleManagementSerializer(updated).data})

    def delete(self, request, pk):
        style = get_object_or_404(BodyStyle, pk=pk)
        # body_style has on_delete=models.SET_NULL in Inventory
        inventory_count = Inventory.objects.filter(body_style=style).count()
        style.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Body style '{style.body}' deleted successfully. Set null on {inventory_count} vehicle(s).",
                "deleted_id": int(pk),
            }
        })


class InventoryListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Inventory

    def get(self, request):
        qs = Inventory.objects.all().select_related("brand", "model", "body_style").order_by("-updated_at", "-id")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(slug__icontains=q)
                | Q(model_name__icontains=q)
                | Q(meta_title__icontains=q)
            )

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)

        registered_param = request.query_params.get("registered", "").strip()
        if registered_param:
            qs = qs.filter(registered=registered_param)

        brand_param = request.query_params.get("brand", "").strip()
        if brand_param:
            try:
                qs = qs.filter(brand_id=int(brand_param))
            except ValueError:
                pass

        car_type_param = request.query_params.get("car_type", "").strip()
        if car_type_param:
            qs = qs.filter(car_type=car_type_param)

        is_featured_param = request.query_params.get("is_featured", "").strip()
        if is_featured_param:
            if is_featured_param.lower() in ("true", "1"):
                qs = qs.filter(is_featured=True)
            elif is_featured_param.lower() in ("false", "0"):
                qs = qs.filter(is_featured=False)

        ordering = request.query_params.get("ordering", "").strip()
        if ordering:
            allowed = {
                "name", "-name", "price", "-price", "year", "-year",
                "created_at", "-created_at", "updated_at", "-updated_at",
                "status", "-status", "registered", "-registered",
            }
            if ordering in allowed:
                qs = qs.order_by(ordering, "-id")

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", "15")
        try:
            page = max(1, int(page_str))
            page_size = min(100, max(1, int(page_size_str)))
        except ValueError:
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = InventoryListManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = InventoryDetailManagementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inventory = serializer.save()
        return Response(
            {"success": True, "data": InventoryDetailManagementSerializer(inventory).data},
            status=status.HTTP_201_CREATED,
        )


class InventoryDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Inventory

    def get(self, request, pk):
        inventory = get_object_or_404(
            Inventory.objects.select_related("brand", "model", "body_style").prefetch_related("inventory_images"),
            pk=pk,
        )
        return Response({"success": True, "data": InventoryDetailManagementSerializer(inventory).data})

    def patch(self, request, pk):
        inventory = get_object_or_404(Inventory, pk=pk)
        serializer = InventoryDetailManagementSerializer(inventory, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": InventoryDetailManagementSerializer(updated).data})

    def delete(self, request, pk):
        inventory = get_object_or_404(Inventory, pk=pk)
        name = inventory.name
        inventory.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Inventory item '{name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class InventoryImageUploadView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = InventoryImage

    def post(self, request, inventory_pk):
        inventory = get_object_or_404(Inventory, pk=inventory_pk)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        data["inventory"] = inventory.id

        serializer = InventoryImageManagementSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        img = serializer.save()
        return Response(
            {"success": True, "data": InventoryImageManagementSerializer(img).data},
            status=status.HTTP_201_CREATED,
        )


class InventoryImageDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = InventoryImage

    def patch(self, request, pk):
        img = get_object_or_404(InventoryImage, pk=pk)
        serializer = InventoryImageManagementSerializer(img, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": InventoryImageManagementSerializer(updated).data})

    def delete(self, request, pk):
        img = get_object_or_404(InventoryImage, pk=pk)
        img_id = img.id
        img.delete()
        return Response({
            "success": True,
            "data": {
                "message": "Inventory gallery image deleted successfully.",
                "deleted_id": img_id,
            }
        })


class StockListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Stock

    def get(self, request):
        qs = Stock.objects.all()

        ordering = request.query_params.get("ordering", "").strip()
        allowed_ordering = {
            "title": ("title", "-id"),
            "-title": ("-title", "-id"),
            "status": ("status", "-id"),
            "-status": ("-status", "-id"),
            "created_at": ("created_at", "id"),
            "-created_at": ("-created_at", "-id"),
            "updated_at": ("updated_at", "id"),
            "-updated_at": ("-updated_at", "-id"),
            "id": ("id",),
            "-id": ("-id",),
        }
        if ordering in allowed_ordering:
            qs = qs.order_by(*allowed_ordering[ordering])
        else:
            qs = qs.order_by("-updated_at", "-id")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(title__icontains=q)

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", "15")
        try:
            page = max(1, int(page_str))
            page_size = min(100, max(1, int(page_size_str)))
        except ValueError:
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = StockManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = StockManagementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        stock = serializer.save()
        return Response(
            {"success": True, "data": StockManagementSerializer(stock).data},
            status=status.HTTP_201_CREATED,
        )


class StockDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Stock

    def get(self, request, pk):
        stock = get_object_or_404(Stock, pk=pk)
        return Response({"success": True, "data": StockManagementSerializer(stock).data})

    def patch(self, request, pk):
        stock = get_object_or_404(Stock, pk=pk)
        serializer = StockManagementSerializer(stock, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": StockManagementSerializer(updated).data})

    def delete(self, request, pk):
        stock = get_object_or_404(Stock, pk=pk)
        title = stock.title or f"Stock #{stock.id}"
        stock.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Stock item '{title}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# Inventory Quote (Customer Enquiry) Endpoints
# ==============================================================================

class InventoryQuoteListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = InventoryQuote

    def get(self, request):
        qs = InventoryQuote.objects.select_related("car").all()

        ordering = request.query_params.get("ordering", "").strip()
        allowed_ordering = {
            "name": ("name", "-id"),
            "-name": ("-name", "-id"),
            "email": ("email", "-id"),
            "-email": ("-email", "-id"),
            "phone": ("phone", "-id"),
            "-phone": ("-phone", "-id"),
            "car": ("car__name", "-id"),
            "-car": ("-car__name", "-id"),
            "created_at": ("created_at", "id"),
            "-created_at": ("-created_at", "-id"),
            "updated_at": ("updated_at", "id"),
            "-updated_at": ("-updated_at", "-id"),
            "id": ("id",),
            "-id": ("-id",),
        }
        if ordering in allowed_ordering:
            qs = qs.order_by(*allowed_ordering[ordering])
        else:
            qs = qs.order_by("-created_at", "-id")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(email__icontains=q)
                | Q(phone__icontains=q)
                | Q(car__name__icontains=q)
                | Q(car__model_name__icontains=q)
            )

        car_id = request.query_params.get("car", "").strip()
        if car_id:
            try:
                qs = qs.filter(car_id=int(car_id))
            except ValueError:
                pass

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", "15")
        try:
            page = max(1, int(page_str))
            page_size = min(100, max(1, int(page_size_str)))
        except ValueError:
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = InventoryQuoteManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })


class InventoryQuoteDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = InventoryQuote

    def get(self, request, pk):
        quote = get_object_or_404(InventoryQuote.objects.select_related("car"), pk=pk)
        return Response({"success": True, "data": InventoryQuoteManagementSerializer(quote).data})

    def patch(self, request, pk):
        quote = get_object_or_404(InventoryQuote, pk=pk)
        serializer = InventoryQuoteManagementSerializer(quote, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": InventoryQuoteManagementSerializer(updated).data})

    def delete(self, request, pk):
        quote = get_object_or_404(InventoryQuote, pk=pk)
        name = quote.name or f"Quote #{quote.id}"
        quote.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Quote enquiry from '{name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# SellCar (Customer Vehicle Submissions) Endpoints
# ==============================================================================

class SellCarListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SellCar

    def get(self, request):
        qs = SellCar.objects.prefetch_related("inventory_images").all()

        ordering = request.query_params.get("ordering", "").strip()
        allowed_ordering = {
            "name": ("name", "-id"),
            "-name": ("-name", "-id"),
            "phone": ("phone", "-id"),
            "-phone": ("-phone", "-id"),
            "car_name": ("car_name", "-id"),
            "-car_name": ("-car_name", "-id"),
            "car_model": ("car_model", "-id"),
            "-car_model": ("-car_model", "-id"),
            "car_year": ("car_year", "-id"),
            "-car_year": ("-car_year", "-id"),
            "mileage": ("mileage", "-id"),
            "-mileage": ("-mileage", "-id"),
            "offered_price": ("offered_price", "-id"),
            "-offered_price": ("-offered_price", "-id"),
            "id": ("id",),
            "-id": ("-id",),
        }
        if ordering in allowed_ordering:
            qs = qs.order_by(*allowed_ordering[ordering])
        else:
            qs = qs.order_by("-id")

        q = request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(phone__icontains=q)
                | Q(car_name__icontains=q)
                | Q(car_model__icontains=q)
                | Q(car_year__icontains=q)
            )

        year_filter = request.query_params.get("car_year", "").strip()
        if year_filter:
            qs = qs.filter(car_year=year_filter)

        page_str = request.query_params.get("page", "1")
        page_size_str = request.query_params.get("page_size", "15")
        try:
            page = max(1, int(page_str))
            page_size = min(100, max(1, int(page_size_str)))
        except ValueError:
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = SellCarManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })


class SellCarDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SellCar

    def get(self, request, pk):
        sellcar = get_object_or_404(SellCar.objects.prefetch_related("inventory_images"), pk=pk)
        return Response({"success": True, "data": SellCarManagementSerializer(sellcar).data})

    def patch(self, request, pk):
        sellcar = get_object_or_404(SellCar, pk=pk)
        serializer = SellCarManagementSerializer(sellcar, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": SellCarManagementSerializer(updated).data})

    def delete(self, request, pk):
        sellcar = get_object_or_404(SellCar, pk=pk)
        name = sellcar.name or f"Submission #{sellcar.id}"
        car_info = f"{sellcar.car_name} {sellcar.car_model}".strip() or "Vehicle"
        sellcar.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Sell car submission from '{name}' ({car_info}) deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class SellCarImageDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SellYourCarImages

    def delete(self, request, sellcar_pk, image_pk):
        image = get_object_or_404(SellYourCarImages, pk=image_pk, sellcar_id=sellcar_pk)
        image.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Sell car image #{image_pk} removed successfully.",
                "deleted_id": int(image_pk),
            }
        })


# ==============================================================================
# Customer Inbox: ContactMessage Endpoints
# ==============================================================================

class ContactMessageListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ContactMessage

    def get(self, request):
        qs = ContactMessage.objects.all()

        ordering = request.query_params.get("ordering", "").strip()
        allowed_ordering = {
            "name": ("name", "-id"),
            "-name": ("-name", "-id"),
            "email": ("email", "-id"),
            "-email": ("-email", "-id"),
            "phone": ("phone", "-id"),
            "-phone": ("-phone", "-id"),
            "topic": ("topic", "-id"),
            "-topic": ("-topic", "-id"),
            "preferred_contact": ("preferred_contact", "-id"),
            "-preferred_contact": ("-preferred_contact", "-id"),
            "created_at": ("created_at", "-id"),
            "-created_at": ("-created_at", "-id"),
        }
        order_by_fields = allowed_ordering.get(ordering, ("-created_at", "-id"))
        qs = qs.order_by(*order_by_fields)

        # Filters
        topic = request.query_params.get("topic", "").strip()
        if topic:
            qs = qs.filter(topic=topic)

        preferred_contact = request.query_params.get("preferred_contact", "").strip()
        if preferred_contact:
            qs = qs.filter(preferred_contact=preferred_contact)

        # Search across name, phone, email, vehicle, message
        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(
                Q(name__icontains=query)
                | Q(phone__icontains=query)
                | Q(email__icontains=query)
                | Q(vehicle__icontains=query)
                | Q(message__icontains=query)
            )

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = ContactMessageManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })


class ContactMessageDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ContactMessage

    def get(self, request, pk):
        contact_message = get_object_or_404(ContactMessage, pk=pk)
        return Response({"success": True, "data": ContactMessageManagementSerializer(contact_message).data})

    def patch(self, request, pk):
        contact_message = get_object_or_404(ContactMessage, pk=pk)
        serializer = ContactMessageManagementSerializer(contact_message, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": ContactMessageManagementSerializer(updated).data})

    def delete(self, request, pk):
        contact_message = get_object_or_404(ContactMessage, pk=pk)
        name = contact_message.name or f"Message #{contact_message.id}"
        contact_message.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Contact message from '{name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# Customer Inbox: Subscriber Endpoints
# ==============================================================================

class SubscriberListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Subscriber

    def get(self, request):
        qs = Subscriber.objects.all()

        ordering = request.query_params.get("ordering", "").strip()
        allowed_ordering = {
            "email": ("email", "-id"),
            "-email": ("-email", "-id"),
            "id": ("id",),
            "-id": ("-id",),
        }
        order_by_fields = allowed_ordering.get(ordering, ("-id",))
        qs = qs.order_by(*order_by_fields)

        # Search across email
        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(email__icontains=query)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = SubscriberManagementSerializer(results, many=True)
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })


class SubscriberDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Subscriber

    def get(self, request, pk):
        subscriber = get_object_or_404(Subscriber, pk=pk)
        return Response({"success": True, "data": SubscriberManagementSerializer(subscriber).data})

    def patch(self, request, pk):
        subscriber = get_object_or_404(Subscriber, pk=pk)
        serializer = SubscriberManagementSerializer(subscriber, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": SubscriberManagementSerializer(updated).data})

    def delete(self, request, pk):
        subscriber = get_object_or_404(Subscriber, pk=pk)
        email = subscriber.email or f"Subscriber #{subscriber.id}"
        subscriber.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Subscriber '{email}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# Slider Video/Banner Configuration Endpoints
# ==============================================================================

class SliderListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Slider

    def get(self, request):
        qs = Slider.objects.all().order_by("-id")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(heading__icontains=query)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = SliderManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = SliderManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        slider = serializer.save()
        return Response(
            {"success": True, "data": SliderManagementSerializer(slider, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class SliderDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Slider

    def get(self, request, pk):
        slider = get_object_or_404(Slider, pk=pk)
        return Response({"success": True, "data": SliderManagementSerializer(slider, context={"request": request}).data})

    def patch(self, request, pk):
        slider = get_object_or_404(Slider, pk=pk)
        serializer = SliderManagementSerializer(slider, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": SliderManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        slider = get_object_or_404(Slider, pk=pk)
        heading = slider.heading or f"Slider #{slider.id}"
        slider.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Slider item '{heading}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# Social Media Configuration Endpoints
# ==============================================================================

class SocialMediaListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SocialMedia

    def get(self, request):
        qs = SocialMedia.objects.all().order_by("-id")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(
                Q(facebook__icontains=query)
                | Q(instagram__icontains=query)
                | Q(twitter__icontains=query)
                | Q(youtube__icontains=query)
            )

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = SocialMediaManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = SocialMediaManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        sm = serializer.save()
        return Response(
            {"success": True, "data": SocialMediaManagementSerializer(sm, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class SocialMediaDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SocialMedia

    def get(self, request, pk):
        sm = get_object_or_404(SocialMedia, pk=pk)
        return Response({"success": True, "data": SocialMediaManagementSerializer(sm, context={"request": request}).data})

    def patch(self, request, pk):
        sm = get_object_or_404(SocialMedia, pk=pk)
        serializer = SocialMediaManagementSerializer(sm, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": SocialMediaManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        sm = get_object_or_404(SocialMedia, pk=pk)
        sm.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Social media configuration #{pk} deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# PeopleTalkAboutUs (Social Features) Endpoints
# ==============================================================================

class PeopleTalkListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = PeopleTalkAboutUs

    def get(self, request):
        qs = PeopleTalkAboutUs.objects.all().order_by("-updated_at", "-id")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(url__icontains=query))

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)

        featured_param = request.query_params.get("is_featured", "").strip()
        if featured_param.lower() in ("true", "1"):
            qs = qs.filter(is_featured=True)
        elif featured_param.lower() in ("false", "0"):
            qs = qs.filter(is_featured=False)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = PeopleTalkAboutUsManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = PeopleTalkAboutUsManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(
            {"success": True, "data": PeopleTalkAboutUsManagementSerializer(item, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class PeopleTalkDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = PeopleTalkAboutUs

    def get(self, request, pk):
        item = get_object_or_404(PeopleTalkAboutUs, pk=pk)
        return Response({"success": True, "data": PeopleTalkAboutUsManagementSerializer(item, context={"request": request}).data})

    def patch(self, request, pk):
        item = get_object_or_404(PeopleTalkAboutUs, pk=pk)
        serializer = PeopleTalkAboutUsManagementSerializer(item, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": PeopleTalkAboutUsManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        item = get_object_or_404(PeopleTalkAboutUs, pk=pk)
        title = item.title or f"Feature #{item.id}"
        item.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Social feature '{title}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# SalesRepresentative Endpoints
# ==============================================================================

class SalesRepresentativeListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SalesRepresentative

    def get(self, request):
        qs = SalesRepresentative.objects.all().order_by("name", "-id")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(Q(name__icontains=query) | Q(phone_number__icontains=query))

        status_param = request.query_params.get("status", "").strip()
        if status_param:
            qs = qs.filter(status=status_param)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = SalesRepresentativeManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = SalesRepresentativeManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        rep = serializer.save()
        return Response(
            {"success": True, "data": SalesRepresentativeManagementSerializer(rep, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class SalesRepresentativeDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SalesRepresentative

    def get(self, request, pk):
        rep = get_object_or_404(SalesRepresentative, pk=pk)
        return Response({"success": True, "data": SalesRepresentativeManagementSerializer(rep, context={"request": request}).data})

    def patch(self, request, pk):
        rep = get_object_or_404(SalesRepresentative, pk=pk)
        serializer = SalesRepresentativeManagementSerializer(rep, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": SalesRepresentativeManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        rep = get_object_or_404(SalesRepresentative, pk=pk)
        name = rep.name or f"Representative #{rep.id}"
        rep.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Sales representative '{name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class SEOConfigListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SEOConfig

    def get(self, request):
        qs = SEOConfig.objects.all().order_by("page")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(
                Q(page__icontains=query)
                | Q(meta_title__icontains=query)
                | Q(target_keyword__icontains=query)
            )

        visibility = request.query_params.get("visibility", "").strip()
        if visibility:
            qs = qs.filter(visibility=visibility)

        robots = request.query_params.get("robots", "").strip()
        if robots:
            qs = qs.filter(robots=robots)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = SEOConfigManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = SEOConfigManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        config = serializer.save()
        return Response(
            {"success": True, "data": SEOConfigManagementSerializer(config, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class SEOConfigDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SEOConfig

    def get(self, request, pk):
        config = get_object_or_404(SEOConfig, pk=pk)
        return Response({"success": True, "data": SEOConfigManagementSerializer(config, context={"request": request}).data})

    def patch(self, request, pk):
        config = get_object_or_404(SEOConfig, pk=pk)
        serializer = SEOConfigManagementSerializer(config, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": SEOConfigManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        config = get_object_or_404(SEOConfig, pk=pk)
        page_name = config.get_page_display()
        config.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"SEO configuration for '{page_name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class CategoryPageSEOListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = CategoryPageSEO

    def get(self, request):
        qs = CategoryPageSEO.objects.all().order_by("page")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(
                Q(page__icontains=query)
                | Q(category_name__icontains=query)
                | Q(h1_title__icontains=query)
                | Q(meta_title__icontains=query)
                | Q(target_keyword__icontains=query)
            )

        visibility = request.query_params.get("visibility", "").strip()
        if visibility:
            qs = qs.filter(visibility=visibility)

        robots = request.query_params.get("robots", "").strip()
        if robots:
            qs = qs.filter(robots=robots)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = CategoryPageSEOManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = CategoryPageSEOManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        config = serializer.save()
        return Response(
            {"success": True, "data": CategoryPageSEOManagementSerializer(config, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class CategoryPageSEODetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = CategoryPageSEO

    def get(self, request, pk):
        config = get_object_or_404(CategoryPageSEO, pk=pk)
        return Response({"success": True, "data": CategoryPageSEOManagementSerializer(config, context={"request": request}).data})

    def patch(self, request, pk):
        config = get_object_or_404(CategoryPageSEO, pk=pk)
        serializer = CategoryPageSEOManagementSerializer(config, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": CategoryPageSEOManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        config = get_object_or_404(CategoryPageSEO, pk=pk)
        page_name = config.get_page_display()
        config.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Category SEO configuration for '{page_name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


# ==============================================================================
# Authentication & Authorization Management Endpoints (Users, Groups, Permissions)
# ==============================================================================

class PermissionListView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff,)

    def get(self, request):
        if not (request.user.is_superuser or request.user.has_perm("auth.view_permission") or request.user.has_perm("auth.view_user") or request.user.has_perm("auth.view_group")):
            raise PermissionDenied("Permission required to view permissions catalogue.")

        permissions = Permission.objects.select_related("content_type").all().order_by("content_type__app_label", "codename")
        serializer = PermissionSerializer(permissions, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
        })


class GroupListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Group

    def get(self, request):
        qs = Group.objects.prefetch_related("permissions", "user_set").all().order_by("name")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(name__icontains=query)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = GroupManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = GroupManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(
            {"success": True, "data": GroupManagementSerializer(group, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class GroupDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = Group

    def get(self, request, pk):
        group = get_object_or_404(Group.objects.prefetch_related("permissions", "user_set"), pk=pk)
        return Response({"success": True, "data": GroupManagementSerializer(group, context={"request": request}).data})

    def patch(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        serializer = GroupManagementSerializer(group, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": GroupManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        name = group.name
        user_count = group.user_set.count()
        group.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Group '{name}' with {user_count} assigned user(s) deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class UserListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = User

    def get(self, request):
        qs = User.objects.prefetch_related("groups").all().order_by("-id")

        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(
                Q(username__icontains=query)
                | Q(email__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
            )

        is_staff_param = request.query_params.get("is_staff", "").strip().lower()
        if is_staff_param in ("true", "1"):
            qs = qs.filter(is_staff=True)
        elif is_staff_param in ("false", "0"):
            qs = qs.filter(is_staff=False)

        is_active_param = request.query_params.get("is_active", "").strip().lower()
        if is_active_param in ("true", "1"):
            qs = qs.filter(is_active=True)
        elif is_active_param in ("false", "0"):
            qs = qs.filter(is_active=False)

        group_param = request.query_params.get("group", "").strip()
        if group_param:
            qs = qs.filter(groups__name=group_param)

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = UserListManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = UserDetailManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"success": True, "data": UserDetailManagementSerializer(user, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class UserDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = User

    def get(self, request, pk):
        user = get_object_or_404(User.objects.prefetch_related("groups", "user_permissions"), pk=pk)
        return Response({"success": True, "data": UserDetailManagementSerializer(user, context={"request": request}).data})

    def patch(self, request, pk):
        target_user = get_object_or_404(User, pk=pk)
        serializer = UserDetailManagementSerializer(target_user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": UserDetailManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        target_user = get_object_or_404(User, pk=pk)

        # Protect against self-deletion
        if request.user.pk == target_user.pk:
            raise ValidationError("You cannot delete your own user account from the dashboard.")

        # Protect the last usable administrator
        if target_user.is_superuser:
            active_superusers = User.objects.filter(is_superuser=True, is_active=True, is_staff=True).exclude(pk=target_user.pk)
            if not active_superusers.exists():
                raise ValidationError("Cannot delete the last active administrator.")

        username = target_user.username
        target_user.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"User account '{username}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class OverviewAggregateView(DashboardBaseAPIView):
    """
    Returns permission-scoped ORM aggregates for the management dashboard overview.
    Only computes and returns counts for datasets the requesting staff user is authorized to view.
    Includes bounded recent submissions for fast overview without extra roundtrips.
    """
    def get(self, request):
        user = request.user
        data = {
            "metrics": {},
            "recent_submissions": {},
        }

        # 1. Inventory metrics
        if user.is_superuser or user.has_perm("inventory.view_inventory"):
            inv_counts = Inventory.objects.aggregate(
                total=Count("id"),
                available=Count("id", filter=Q(status=Inventory.AvailabilityChoices.AVAILABLE)),
                sold=Count("id", filter=Q(status=Inventory.AvailabilityChoices.SOLD)),
                booked=Count("id", filter=Q(status=Inventory.AvailabilityChoices.BOOKED)),
                pre_order=Count("id", filter=Q(status=Inventory.AvailabilityChoices.PRE_ORDER)),
            )
            data["metrics"]["inventory"] = inv_counts

        # 2. Stock metrics
        if user.is_superuser or user.has_perm("inventory.view_stock"):
            stock_counts = Stock.objects.aggregate(
                total=Count("id"),
                published=Count("id", filter=Q(status=Stock.StatusChoices.PUBLISHED)),
                unpublished=Count("id", filter=Q(status=Stock.StatusChoices.UNPUBLISHED)),
            )
            data["metrics"]["stocks"] = stock_counts

        # 3. Customer Quotes
        if user.is_superuser or user.has_perm("inventory.view_inventoryquote"):
            quote_counts = InventoryQuote.objects.aggregate(total=Count("id"))
            data["metrics"]["quotes"] = quote_counts
            # Bounded recent 5 quotes with car details
            recent_quotes = (
                InventoryQuote.objects.select_related("car")
                .order_by("-created_at")[:5]
            )
            data["recent_submissions"]["quotes"] = [
                {
                    "id": q.id,
                    "name": q.name,
                    "email": q.email,
                    "phone": q.phone,
                    "car_name": q.car.name if q.car else None,
                    "created_at": q.created_at.isoformat() if q.created_at else None,
                }
                for q in recent_quotes
            ]

        # 4. Sell Car Leads
        if user.is_superuser or user.has_perm("home.view_sellcar"):
            sell_counts = SellCar.objects.aggregate(total=Count("id"))
            data["metrics"]["sell_cars"] = sell_counts
            recent_sell_cars = SellCar.objects.order_by("-id")[:5]
            data["recent_submissions"]["sell_cars"] = [
                {
                    "id": s.id,
                    "name": s.name,
                    "phone": s.phone,
                    "car_name": s.car_name,
                    "car_model": s.car_model,
                    "car_year": s.car_year,
                    "offered_price": s.offered_price,
                    "mileage": s.mileage,
                }
                for s in recent_sell_cars
            ]

        # 5. Contact Messages
        if user.is_superuser or user.has_perm("home.view_contactmessage"):
            msg_counts = ContactMessage.objects.aggregate(
                total=Count("id"),
                buying=Count("id", filter=Q(topic=ContactMessage.TopicChoices.BUYING)),
                selling=Count("id", filter=Q(topic=ContactMessage.TopicChoices.SELLING)),
                after_sales=Count("id", filter=Q(topic=ContactMessage.TopicChoices.AFTER_SALES)),
                other=Count("id", filter=Q(topic=ContactMessage.TopicChoices.OTHER)),
            )
            data["metrics"]["contact_messages"] = msg_counts
            recent_messages = ContactMessage.objects.order_by("-created_at")[:5]
            data["recent_submissions"]["contact_messages"] = [
                {
                    "id": m.id,
                    "name": m.name,
                    "topic": m.topic,
                    "topic_display": m.get_topic_display(),
                    "phone": m.phone,
                    "email": m.email,
                    "vehicle": m.vehicle,
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                }
                for m in recent_messages
            ]

        # 6. Newsletter Subscribers
        if user.is_superuser or user.has_perm("home.view_subscriber"):
            sub_counts = Subscriber.objects.aggregate(total=Count("id"))
            data["metrics"]["subscribers"] = sub_counts

        # 7. Users & Groups
        if user.is_superuser or user.has_perm("auth.view_user"):
            user_counts = User.objects.aggregate(
                total=Count("id"),
                active=Count("id", filter=Q(is_active=True)),
                staff=Count("id", filter=Q(is_staff=True)),
                superuser=Count("id", filter=Q(is_superuser=True)),
            )
            data["metrics"]["users"] = user_counts

        if user.is_superuser or user.has_perm("auth.view_group"):
            group_counts = Group.objects.aggregate(total=Count("id"))
            data["metrics"]["groups"] = group_counts

        return Response({"success": True, "data": data})


# ==============================================================================
# Site Settings Management Endpoints
# ==============================================================================

class SiteSettingsManagementView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = SiteSettings

    def get(self, request):
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            return Response({"success": True, "data": None})
        serializer = SiteSettingsManagementSerializer(settings_obj, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        settings_obj = SiteSettings.objects.first()
        if settings_obj:
            serializer = SiteSettingsManagementSerializer(settings_obj, data=request.data, partial=True, context={"request": request})
        else:
            serializer = SiteSettingsManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            {"success": True, "data": SiteSettingsManagementSerializer(saved, context={"request": request}).data},
            status=status.HTTP_200_OK if settings_obj else status.HTTP_201_CREATED,
        )

    def patch(self, request):
        settings_obj = SiteSettings.objects.first()
        if not settings_obj:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Site settings record not found."}}, status=status.HTTP_404_NOT_FOUND)
        serializer = SiteSettingsManagementSerializer(settings_obj, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": SiteSettingsManagementSerializer(updated, context={"request": request}).data})


# ==============================================================================
# Showroom Branch Management Endpoints
# ==============================================================================

class ShowroomBranchListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ShowroomBranch

    def get(self, request):
        qs = ShowroomBranch.objects.all().order_by("order", "id")
        query = request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(
                Q(name__icontains=query)
                | Q(branch_id__icontains=query)
                | Q(address__icontains=query)
                | Q(phone__icontains=query)
            )

        try:
            page = max(1, int(request.query_params.get("page", 1)))
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page, page_size = 1, 15

        total_rows = qs.count()
        total_pages = max(1, (total_rows + page_size - 1) // page_size)
        offset = (page - 1) * page_size
        results = qs[offset : offset + page_size]

        serializer = ShowroomBranchManagementSerializer(results, many=True, context={"request": request})
        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "total_rows": total_rows,
                "total_pages": total_pages,
                "current_page": page,
                "page_size": page_size,
            }
        })

    def post(self, request):
        serializer = ShowroomBranchManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        branch = serializer.save()
        return Response(
            {"success": True, "data": ShowroomBranchManagementSerializer(branch, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class ShowroomBranchDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ShowroomBranch

    def get(self, request, pk):
        branch = get_object_or_404(ShowroomBranch, pk=pk)
        return Response({"success": True, "data": ShowroomBranchManagementSerializer(branch, context={"request": request}).data})

    def patch(self, request, pk):
        branch = get_object_or_404(ShowroomBranch, pk=pk)
        serializer = ShowroomBranchManagementSerializer(branch, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": ShowroomBranchManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        branch = get_object_or_404(ShowroomBranch, pk=pk)
        branch_name = branch.name
        branch.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Showroom branch '{branch_name}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class PreferenceSectionManagementView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = PreferenceSection

    def get(self, request):
        section = PreferenceSection.objects.first()
        if not section:
            return Response({"success": True, "data": None})
        serializer = PreferenceSectionManagementSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        section = PreferenceSection.objects.first()
        if section:
            serializer = PreferenceSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        else:
            serializer = PreferenceSectionManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            {"success": True, "data": PreferenceSectionManagementSerializer(saved, context={"request": request}).data},
            status=status.HTTP_200_OK if section else status.HTTP_201_CREATED,
        )

    def patch(self, request):
        section = PreferenceSection.objects.first()
        if not section:
            section = PreferenceSection.objects.create(heading="Choose per your preference")
        serializer = PreferenceSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response({"success": True, "data": PreferenceSectionManagementSerializer(saved, context={"request": request}).data})


class PreferenceCategoryListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = PreferenceCategory

    def get(self, request):
        qs = PreferenceCategory.objects.all().order_by("order", "id")
        serializer = PreferenceCategoryManagementSerializer(qs, many=True, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        serializer = PreferenceCategoryManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        cat = serializer.save()
        return Response(
            {"success": True, "data": PreferenceCategoryManagementSerializer(cat, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class PreferenceCategoryDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = PreferenceCategory

    def get(self, request, pk):
        cat = get_object_or_404(PreferenceCategory, pk=pk)
        return Response({"success": True, "data": PreferenceCategoryManagementSerializer(cat, context={"request": request}).data})

    def patch(self, request, pk):
        cat = get_object_or_404(PreferenceCategory, pk=pk)
        serializer = PreferenceCategoryManagementSerializer(cat, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": PreferenceCategoryManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        cat = get_object_or_404(PreferenceCategory, pk=pk)
        label = cat.label
        cat.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Preference category '{label}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class ConsultationSectionManagementView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ConsultationSection

    def get(self, request):
        section = ConsultationSection.objects.first()
        if not section:
            return Response({"success": True, "data": None})
        serializer = ConsultationSectionManagementSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        section = ConsultationSection.objects.first()
        if section:
            serializer = ConsultationSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        else:
            serializer = ConsultationSectionManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            {"success": True, "data": ConsultationSectionManagementSerializer(saved, context={"request": request}).data},
            status=status.HTTP_200_OK if section else status.HTTP_201_CREATED,
        )

    def patch(self, request):
        section = ConsultationSection.objects.first()
        if not section:
            section = ConsultationSection.objects.create(heading="Connect to Consult")
        serializer = ConsultationSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response({"success": True, "data": ConsultationSectionManagementSerializer(saved, context={"request": request}).data})


class ExperienceSectionManagementView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ExperienceSection

    def get(self, request):
        section = ExperienceSection.objects.first()
        if not section:
            return Response({"success": True, "data": None})
        serializer = ExperienceSectionManagementSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        section = ExperienceSection.objects.first()
        if section:
            serializer = ExperienceSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        else:
            serializer = ExperienceSectionManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            {"success": True, "data": ExperienceSectionManagementSerializer(saved, context={"request": request}).data},
            status=status.HTTP_200_OK if section else status.HTTP_201_CREATED,
        )

    def patch(self, request):
        section = ExperienceSection.objects.first()
        if not section:
            section = ExperienceSection.objects.create(title="Experience Beyond Ordinary")
        serializer = ExperienceSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response({"success": True, "data": ExperienceSectionManagementSerializer(saved, context={"request": request}).data})


class ExperiencePillarListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ExperiencePillar

    def get(self, request):
        qs = ExperiencePillar.objects.all().order_by("order", "id")
        serializer = ExperiencePillarManagementSerializer(qs, many=True, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        serializer = ExperiencePillarManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        pillar = serializer.save()
        return Response(
            {"success": True, "data": ExperiencePillarManagementSerializer(pillar, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class ExperiencePillarDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ExperiencePillar

    def get(self, request, pk):
        pillar = get_object_or_404(ExperiencePillar, pk=pk)
        return Response({"success": True, "data": ExperiencePillarManagementSerializer(pillar, context={"request": request}).data})

    def patch(self, request, pk):
        pillar = get_object_or_404(ExperiencePillar, pk=pk)
        serializer = ExperiencePillarManagementSerializer(pillar, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": ExperiencePillarManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        pillar = get_object_or_404(ExperiencePillar, pk=pk)
        if pillar.section and pillar.section.is_active and pillar.is_active:
            remaining = pillar.section.pillars.filter(is_active=True).exclude(pk=pillar.pk).count()
            if remaining < 3:
                return Response(
                    {"success": False, "error": "Cannot delete pillar: published Experience Section requires at least 3 active pillars. Unpublish the section or add another active pillar first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        title = pillar.title
        pillar.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Experience pillar '{title}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class VisualChroniclesSectionManagementView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = VisualChroniclesSection

    def get(self, request):
        section = VisualChroniclesSection.objects.first()
        if not section:
            return Response({"success": True, "data": None})
        serializer = VisualChroniclesSectionManagementSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        section = VisualChroniclesSection.objects.first()
        if section:
            serializer = VisualChroniclesSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        else:
            serializer = VisualChroniclesSectionManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            {"success": True, "data": VisualChroniclesSectionManagementSerializer(saved, context={"request": request}).data},
            status=status.HTTP_200_OK if section else status.HTTP_201_CREATED,
        )

    def patch(self, request):
        section = VisualChroniclesSection.objects.first()
        if not section:
            section = VisualChroniclesSection.objects.create(heading="DREAM CAR HOUSE Visual Chronicles")
        serializer = VisualChroniclesSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response({"success": True, "data": VisualChroniclesSectionManagementSerializer(saved, context={"request": request}).data})


class VisualChroniclesItemListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = VisualChroniclesItem

    def get(self, request):
        qs = VisualChroniclesItem.objects.all().order_by("order", "id")
        serializer = VisualChroniclesItemManagementSerializer(qs, many=True, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        serializer = VisualChroniclesItemManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(
            {"success": True, "data": VisualChroniclesItemManagementSerializer(item, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class VisualChroniclesItemDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = VisualChroniclesItem

    def get(self, request, pk):
        item = get_object_or_404(VisualChroniclesItem, pk=pk)
        return Response({"success": True, "data": VisualChroniclesItemManagementSerializer(item, context={"request": request}).data})

    def patch(self, request, pk):
        item = get_object_or_404(VisualChroniclesItem, pk=pk)
        serializer = VisualChroniclesItemManagementSerializer(item, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": VisualChroniclesItemManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        item = get_object_or_404(VisualChroniclesItem, pk=pk)
        title = item.title
        item.delete()
        return Response({
            "success": True,
            "data": {
                "message": f"Chronicles tile '{title}' deleted successfully.",
                "deleted_id": int(pk),
            }
        })


class VipSanctuarySectionManagementView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = VipSanctuarySection

    def get(self, request):
        section = VipSanctuarySection.objects.first()
        if not section:
            return Response({"success": True, "data": None})
        serializer = VipSanctuarySectionManagementSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        section = VipSanctuarySection.objects.first()
        if section:
            serializer = VipSanctuarySectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        else:
            serializer = VipSanctuarySectionManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            {"success": True, "data": VipSanctuarySectionManagementSerializer(saved, context={"request": request}).data},
            status=status.HTTP_200_OK if section else status.HTTP_201_CREATED,
        )

    def patch(self, request):
        section = VipSanctuarySection.objects.first()
        if not section:
            section = VipSanctuarySection.objects.create(title="Step Into The Realm of Automotive Excellence")
        serializer = VipSanctuarySectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response({"success": True, "data": VipSanctuarySectionManagementSerializer(saved, context={"request": request}).data})


class AboutSectionManagementView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = AboutSection

    def get(self, request):
        section = AboutSection.objects.first()
        if not section:
            section = AboutSection()
        serializer = AboutSectionManagementSerializer(section, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        section = AboutSection.objects.first()
        if section:
            serializer = AboutSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        else:
            serializer = AboutSectionManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response(
            {"success": True, "data": AboutSectionManagementSerializer(saved, context={"request": request}).data},
            status=status.HTTP_200_OK if section else status.HTTP_201_CREATED,
        )

    def patch(self, request):
        section = AboutSection.objects.first()
        if not section:
            section = AboutSection.objects.create()
        serializer = AboutSectionManagementSerializer(section, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        saved = serializer.save()
        return Response({"success": True, "data": AboutSectionManagementSerializer(saved, context={"request": request}).data})







from apps.home.models.showroom_story_model import ShowroomStory
from apps.dashboard_api.serializers import ShowroomStoryManagementSerializer

class ShowroomStoryListCreateView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ShowroomStory

    def get(self, request):
        qs = ShowroomStory.objects.all().order_by("order", "-created_at")
        serializer = ShowroomStoryManagementSerializer(qs, many=True, context={"request": request})
        return Response({"success": True, "data": serializer.data})

    def post(self, request):
        serializer = ShowroomStoryManagementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        story = serializer.save()
        return Response(
            {"success": True, "data": ShowroomStoryManagementSerializer(story, context={"request": request}).data},
            status=status.HTTP_201_CREATED,
        )


class ShowroomStoryDetailView(DashboardBaseAPIView):
    permission_classes = (IsActiveStaff, DashboardModelPermission)
    model = ShowroomStory

    def get(self, request, pk):
        story = get_object_or_404(ShowroomStory, pk=pk)
        return Response({"success": True, "data": ShowroomStoryManagementSerializer(story, context={"request": request}).data})

    def patch(self, request, pk):
        story = get_object_or_404(ShowroomStory, pk=pk)
        serializer = ShowroomStoryManagementSerializer(story, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": ShowroomStoryManagementSerializer(updated, context={"request": request}).data})

    def put(self, request, pk):
        story = get_object_or_404(ShowroomStory, pk=pk)
        serializer = ShowroomStoryManagementSerializer(story, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response({"success": True, "data": ShowroomStoryManagementSerializer(updated, context={"request": request}).data})

    def delete(self, request, pk):
        story = get_object_or_404(ShowroomStory, pk=pk)
        story.delete()
        return Response({"success": True, "message": "Showroom story deleted successfully."}, status=status.HTTP_200_OK)
