import json
import bleach
from django.contrib.auth import password_validation
from django.contrib.auth.models import User, Group, Permission
from rest_framework import serializers
from core.mixins.image_optimization_mixins import OptimizedImageSerializerMixin
from core.utils.media import build_media_url
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

from apps.seo_config.models import SEOConfig, CategoryPageSEO


class BrandManagementSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = [
            "id",
            "name",
            "segment",
            "image",
            "image_url",
            "logo_alt",
            "order",
            "is_in_runway",
            "destination_url",
            "listing_footer_text",
            "status",
            "target_keyword",
            "meta_title",
            "meta_description",
            "canonical_url",
            "robots",
            "schema_json",
            "h1_title",
            "short_description",
            "long_description",
            "feature_image",
            "feature_image_alt",
            "seo_updated_at",
        ]
        read_only_fields = ["id", "image_url", "seo_updated_at"]

    def get_image_url(self, obj):
        if not obj.image:
            return None
        return build_media_url(obj.image.url)

    def validate_image(self, value):
        if not value:
            return value
        if hasattr(value, "size") and value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Brand logo file exceeds 10MB limit.")
        name_lower = getattr(value, "name", "").lower()
        if name_lower.endswith(".svg"):
            try:
                content = value.read()
                if hasattr(value, "seek"):
                    value.seek(0)
                from core.utils.svg_sanitizer import validate_and_sanitize_svg
                validate_and_sanitize_svg(content)
            except serializers.ValidationError:
                raise
            except Exception as e:
                raise serializers.ValidationError(f"Unable to validate SVG file: {str(e)}")
        return value

    def validate_destination_url(self, value):
        from core.utils.url_validator import validate_destination_url
        return validate_destination_url(value)

    def validate_name(self, value):
        name_str = value.strip()
        qs = Brand.objects.filter(name__iexact=name_str)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"A brand with the name '{name_str}' already exists.")
        return name_str

    def validate_schema_json(self, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as err:
                raise serializers.ValidationError(f"Invalid JSON-LD schema: {err.msg}")
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError("JSON-LD schema must be a valid JSON object or list.")
        return value

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        if self.partial and isinstance(data, dict):
            for field in ["image", "feature_image"]:
                if field in data:
                    val = data.get(field)
                    if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                        data = data.copy() if hasattr(data, "copy") else dict(data)
                        data.pop(field, None)
        return super().to_internal_value(data)


class ModelGenerationManagementSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source="brand.name", read_only=True)

    class Meta:
        model = ModelGeneration
        fields = [
            "id",
            "brand",
            "brand_name",
            "model",
            "status",
        ]
        read_only_fields = ["id", "brand_name"]

    def validate(self, attrs):
        brand = attrs.get("brand") or (self.instance.brand if self.instance else None)
        model = attrs.get("model") or (self.instance.model if self.instance else None)

        if brand and model:
            model_str = model.strip()
            qs = ModelGeneration.objects.filter(brand=brand, model__iexact=model_str)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    "model": f"A model named '{model_str}' already exists for {brand.name}."
                })
        return attrs


class BodyStyleManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyStyle
        fields = [
            "id",
            "body",
            "status",
        ]
        read_only_fields = ["id"]


class InventoryImageManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryImage
        fields = [
            "id",
            "inventory",
            "image",
            "caption",
            "alt_text",
            "tag",
            "order",
        ]
        read_only_fields = ["id"]

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        if self.partial and isinstance(data, dict) and "image" in data:
            val = data.get("image")
            if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                data = data.copy() if hasattr(data, "copy") else dict(data)
                data.pop("image", None)
        return super().to_internal_value(data)



class InventoryListManagementSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    model_generation_name = serializers.CharField(source="model.model", read_only=True)
    body_style_name = serializers.CharField(source="body_style.body", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id",
            "name",
            "car_type",
            "brand",
            "brand_name",
            "model",
            "model_generation_name",
            "model_name",
            "body_style",
            "body_style_name",
            "branch",
            "branch_name",
            "year",
            "price",
            "is_call_for_price",
            "registration_number",
            "fuel_type",
            "transmission",
            "registered",
            "status",
            "is_featured",
            "feature_image",
            "slug",
            "indexing",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "brand_name",
            "model_generation_name",
            "body_style_name",
            "branch_name",
            "slug",
            "created_at",
            "updated_at",
        ]


class InventoryDetailManagementSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    model_generation_name = serializers.CharField(source="model.model", read_only=True)
    body_style_name = serializers.CharField(source="body_style.body", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    branch_detail = serializers.SerializerMethodField()
    inventory_images = InventoryImageManagementSerializer(many=True, read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)
    engine_capacity = serializers.CharField(required=False, allow_blank=True, max_length=100)
    wheel_base = serializers.CharField(required=False, allow_blank=True, max_length=20)
    mileage = serializers.CharField(required=False, allow_blank=True, max_length=20)
    year = serializers.IntegerField(required=False, allow_null=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    model = serializers.PrimaryKeyRelatedField(queryset=ModelGeneration.objects.all(), required=False, allow_null=True)
    branch = serializers.PrimaryKeyRelatedField(queryset=ShowroomBranch.objects.all(), required=False, allow_null=True)
    body_style = serializers.PrimaryKeyRelatedField(queryset=BodyStyle.objects.all(), required=False, allow_null=True)
    youtube = serializers.URLField(max_length=500, required=False, allow_blank=True, allow_null=True)

    def get_branch_detail(self, obj):
        if not obj.branch:
            return None
        return {
            "id": obj.branch.id,
            "branch_id": obj.branch.branch_id,
            "name": obj.branch.name,
            "short_name": obj.branch.short_name,
            "address": obj.branch.address,
            "phone": obj.branch.phone,
            "hotline": obj.branch.hotline,
            "hours": obj.branch.hours,
            "map_link": obj.branch.map_link,
        }

    class Meta:
        model = Inventory
        fields = [
            "id",
            # General
            "name",
            "car_type",
            "brand",
            "brand_name",
            "model",
            "model_generation_name",
            "model_name",
            "year",
            "condition",
            "body_style",
            "body_style_name",
            "branch",
            "branch_name",
            "branch_detail",
            "inventory_type",
            "is_featured",
            "status",
            # Specifications
            "engine_capacity",
            "fuel_type",
            "transmission",
            "drive_type",
            "wheel_base",
            "mileage",
            "color",
            # Pricing & Availability
            "price",
            "is_call_for_price",
            "slightly_negotiable",
            "registered",
            "registration_number",
            # Media
            "feature_image",
            "youtube",
            "inventory_images",
            # Description
            "description",
            # SEO
            "h1_title",
            "target_keyword",
            "meta_title",
            "meta_description",
            "slug",
            "canonical_url",
            "featured_image_alt",
            "indexing",
            "redirect_url",
            "previous_slug",
            "schema_override",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "brand_name",
            "model_generation_name",
            "body_style_name",
            "branch_name",
            "branch_detail",
            "created_at",
            "updated_at",
        ]

    def validate_description(self, value):
        if not value:
            return value
        allowed_tags = [
            'p', 'b', 'i', 'u', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'span', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody',
            'tr', 'th', 'td', 'div'
        ]
        allowed_attrs = {
            'a': ['href', 'title', 'target', 'rel'],
            '*': ['class', 'style', 'id']
        }
        return bleach.clean(value, tags=allowed_tags, attributes=allowed_attrs, strip=True)

    def validate_schema_override(self, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as err:
                raise serializers.ValidationError(f"Invalid JSON-LD schema: {err.msg}")
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError("Schema override must be a valid JSON object or list.")
        return value

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = data.copy()
        else:
            data = dict(data)

        # Handle empty feature_image:
        # On partial updates (PATCH) or create (POST): pop empty or 0-byte file
        if "feature_image" in data:
            val = data.get("feature_image")
            if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                data.pop("feature_image", None)

        # Normalize nullable foreign keys, numeric, and URL fields when explicitly submitted as empty string
        nullable_fields = ["model", "branch", "body_style", "year", "price", "redirect_url", "youtube"]
        for field in nullable_fields:
            if field in data:
                val = data.get(field)
                if val == "" or val is None:
                    data[field] = None

        # Handle schema_override parsing from form data
        if "schema_override" in data:
            val = data.get("schema_override")
            if val == "" or val is None:
                data["schema_override"] = None
            elif isinstance(val, str):
                val_str = val.strip()
                if not val_str:
                    data["schema_override"] = None
                else:
                    try:
                        data["schema_override"] = json.loads(val_str)
                    except Exception:
                        pass  # Let validate_schema_override report invalid JSON

        return super().to_internal_value(data)

    def validate(self, attrs):
        # Distinguish explicit null from omission:
        # If 'brand' or 'model' key is present in attrs, use the explicit value (even if None).
        # Only fall back to instance when the key was omitted during partial update.
        if "brand" in attrs:
            brand = attrs["brand"]
        else:
            brand = self.instance.brand if self.instance else None

        if "model" in attrs:
            model = attrs["model"]
        else:
            model = self.instance.model if self.instance else None

        if model and brand and model.brand_id != brand.id:
            raise serializers.ValidationError({
                "model": f"Model generation '{model.model}' does not belong to brand '{brand.name}'."
            })
        return attrs


class StockManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = [
            "id",
            "title",
            "image",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def to_internal_value(self, data):
        # On partial updates (PATCH), if image is empty string or None, retain existing image
        if self.partial and isinstance(data, dict) and "image" in data:
            val = data.get("image")
            if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                data = data.copy() if hasattr(data, "copy") else dict(data)
                data.pop("image", None)
        return super().to_internal_value(data)


class InventoryQuoteManagementSerializer(serializers.ModelSerializer):
    car_name = serializers.CharField(source="car.name", read_only=True, default=None, allow_null=True)
    car_slug = serializers.CharField(source="car.slug", read_only=True, default=None, allow_null=True)
    car_price = serializers.DecimalField(source="car.price", max_digits=12, decimal_places=2, read_only=True, default=None, allow_null=True)

    class Meta:
        model = InventoryQuote
        fields = [
            "id",
            "car",
            "car_name",
            "car_slug",
            "car_price",
            "name",
            "email",
            "phone",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SellYourCarImageManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellYourCarImages
        fields = ["id", "sellcar", "image"]
        read_only_fields = ["id", "sellcar"]


class SellCarManagementSerializer(serializers.ModelSerializer):
    inventory_images = SellYourCarImageManagementSerializer(many=True, read_only=True)

    class Meta:
        model = SellCar
        fields = [
            "id",
            "name",
            "phone",
            "car_name",
            "car_model",
            "car_year",
            "mileage",
            "offered_price",
            "inventory_images",
        ]
        read_only_fields = ["id"]


class ContactMessageManagementSerializer(serializers.ModelSerializer):
    topic_display = serializers.CharField(source="get_topic_display", read_only=True)
    preferred_contact_display = serializers.CharField(source="get_preferred_contact_display", read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "topic",
            "topic_display",
            "name",
            "phone",
            "email",
            "vehicle",
            "message",
            "preferred_contact",
            "preferred_contact_display",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SubscriberManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ["id", "email"]
        read_only_fields = ["id"]


class SliderManagementSerializer(serializers.ModelSerializer):
    is_public_active = serializers.SerializerMethodField()
    is_published = serializers.BooleanField(default=True)

    class Meta:
        model = Slider
        fields = [
            "id",
            "heading",
            "poster",
            "video_provider",
            "video_source",
            "video_start_time",
            "video_title",
            "cta_buttons",
            "scroll_link_label",
            "scroll_link_target",
            "is_published",
            "image",
            "is_public_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_public_active", "created_at", "updated_at"]

    def get_is_public_active(self, obj):
        last = Slider.objects.filter(is_published=True).order_by("id").last()
        if not last:
            last = Slider.objects.order_by("id").last()
        return bool(last and last.id == obj.id)

    def validate_image(self, value):
        if not value:
            return value
        allowed_exts = ["jpg", "jpeg", "png", "webp", "mp4", "webm"]
        ext = value.name.split(".")[-1].lower() if "." in value.name else ""
        if ext not in allowed_exts:
            raise serializers.ValidationError(
                f"Unsupported file format '.{ext}'. Allowed formats: {', '.join(allowed_exts)}."
            )
        return value

    def validate_video_provider(self, value):
        allowed = ["youtube", "vimeo", "direct"]
        if value not in allowed:
            raise serializers.ValidationError(
                f"Unsupported video provider '{value}'. Allowed providers: {', '.join(allowed)}."
            )
        return value

    def validate_video_source(self, value):
        val = (value or "").strip()
        if not val:
            return val
        # Check against dangerous URI schemes
        lower_val = val.lower()
        if lower_val.startswith("javascript:") or lower_val.startswith("data:") or "<script" in lower_val:
            raise serializers.ValidationError("Executable code and unsafe URI schemes are strictly prohibited.")
        return val

    def validate_cta_buttons(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError("CTA buttons must be a list of button objects.")

        allowed_actions = ["link", "appointment_modal"]
        cleaned_buttons = []

        for idx, btn in enumerate(value):
            if not isinstance(btn, dict):
                raise serializers.ValidationError(f"CTA button #{idx + 1} must be an object.")

            label = str(btn.get("label", "")).strip()
            action = str(btn.get("action", "link")).strip()
            destination = str(btn.get("destination", "")).strip()

            if not label:
                raise serializers.ValidationError(f"CTA button #{idx + 1} requires a label.")

            if action not in allowed_actions:
                raise serializers.ValidationError(
                    f"CTA button #{idx + 1} action '{action}' is invalid. Allowed actions: {', '.join(allowed_actions)}."
                )

            if action == "link":
                dest_lower = destination.lower()
                if dest_lower.startswith("javascript:") or dest_lower.startswith("data:") or "<script" in dest_lower:
                    raise serializers.ValidationError(
                        f"CTA button #{idx + 1} destination contains an unsafe URI scheme or executable code."
                    )
                if not (dest_lower.startswith("/") or dest_lower.startswith("http://") or dest_lower.startswith("https://") or dest_lower.startswith("#")):
                    raise serializers.ValidationError(
                        f"CTA button #{idx + 1} link destination must start with '/', '#', 'http://', or 'https://'."
                    )

            cleaned_buttons.append({
                "label": label,
                "action": action,
                "destination": destination if action == "link" else "",
            })

        return cleaned_buttons

    def validate_poster(self, value):
        val = (value or "").strip()
        if not val:
            return val
        lower_val = val.lower()
        if lower_val.startswith("javascript:") or "<script" in lower_val:
            raise serializers.ValidationError("Unsafe poster URL or executable script detected.")
        return val

    def validate_scroll_link_target(self, value):
        val = (value or "").strip()
        if not val:
            return val
        lower_val = val.lower()
        if lower_val.startswith("javascript:") or "<script" in lower_val:
            raise serializers.ValidationError("Unsafe scroll link target.")
        return val

    def to_internal_value(self, data):
        # Convert QueryDict to standard dict to prevent DRF html-form coercion on JSON fields
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        else:
            data = dict(data)

        # Parse JSON string for cta_buttons if sent via FormData / multipart
        if "cta_buttons" in data and isinstance(data["cta_buttons"], str):
            try:
                import json
                data["cta_buttons"] = json.loads(data["cta_buttons"])
            except Exception:
                raise serializers.ValidationError({"cta_buttons": "Must be valid JSON array."})

        # Coerce boolean string for is_published
        if "is_published" in data and isinstance(data["is_published"], str):
            data["is_published"] = data["is_published"].lower() in ("true", "1", "yes")

        # Coerce int for video_start_time
        if "video_start_time" in data and isinstance(data["video_start_time"], str):
            try:
                data["video_start_time"] = int(data["video_start_time"])
            except ValueError:
                raise serializers.ValidationError({"video_start_time": "Must be a valid integer."})

        # On partial updates (PATCH), if image is empty string or None, retain existing file
        if self.partial and "image" in data:
            val = data.get("image")
            if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                data.pop("image", None)

        return super().to_internal_value(data)

    def validate(self, attrs):
        is_published = attrs.get("is_published", self.instance.is_published if self.instance else True)
        heading = attrs.get("heading", self.instance.heading if self.instance else "")
        if is_published and (not heading or not heading.strip()):
            raise serializers.ValidationError({
                "heading": "Published slider requires a valid heading."
            })
        return attrs



class SocialMediaManagementSerializer(serializers.ModelSerializer):
    is_public_active = serializers.SerializerMethodField()

    class Meta:
        model = SocialMedia
        fields = ["id", "facebook", "instagram", "twitter", "youtube", "is_public_active"]
        read_only_fields = ["id", "is_public_active"]

    def get_is_public_active(self, obj):
        last = SocialMedia.objects.order_by("id").last()
        return bool(last and last.id == obj.id)

    def validate_facebook(self, value):
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Please provide a valid URL starting with http:// or https://")
        return val

    def validate_instagram(self, value):
        if not value:
            return value
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Please provide a valid URL starting with http:// or https://")
        return val

    def validate_twitter(self, value):
        if not value:
            return value
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Please provide a valid URL starting with http:// or https://")
        return val

    def validate_youtube(self, value):
        if not value:
            return value
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Please provide a valid URL starting with http:// or https://")
        return val


class PeopleTalkAboutUsManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeopleTalkAboutUs
        fields = [
            "id",
            "title",
            "image",
            "url",
            "is_featured",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Title cannot be blank.")
        return val

    def validate_image(self, value):
        if not value:
            return value
        allowed_exts = ["jpg", "jpeg", "png", "webp"]
        ext = value.name.split(".")[-1].lower() if "." in value.name else ""
        if ext not in allowed_exts:
            raise serializers.ValidationError(
                f"Unsupported image format '.{ext}'. Allowed formats: {', '.join(allowed_exts)}."
            )
        return value

    def validate_url(self, value):
        if not value:
            return value
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Please provide a valid URL starting with http:// or https://")
        return val

    def to_internal_value(self, data):
        # On partial updates (PATCH), if image is empty string or None, retain existing file
        if self.partial and isinstance(data, dict) and "image" in data:
            val = data.get("image")
            if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                data = data.copy() if hasattr(data, "copy") else dict(data)
                data.pop("image", None)
        return super().to_internal_value(data)


class SalesRepresentativeManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesRepresentative
        fields = [
            "id",
            "name",
            "phone_number",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Representative name cannot be blank.")
        return val

    def validate_phone_number(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Phone number cannot be blank.")
        return val


class SEOConfigManagementSerializer(serializers.ModelSerializer):
    page_display = serializers.CharField(source="get_page_display", read_only=True)

    class Meta:
        model = SEOConfig
        fields = [
            "id",
            "page",
            "page_display",
            "visibility",
            "target_keyword",
            "feature_image",
            "feature_image_alt",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "robots",
            "canonical_url",
            "og_title",
            "og_description",
            "og_image",
            "og_type",
            "og_site_name",
            "twitter_card",
            "twitter_title",
            "twitter_description",
            "twitter_image",
            "schema_json",
            "updated_at",
        ]
        read_only_fields = ["id", "page_display", "updated_at"]

    def validate_page(self, value):
        val = value.strip()
        qs = SEOConfig.objects.filter(page=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"An SEO configuration for page '{val}' already exists.")
        return val

    def validate_canonical_url(self, value):
        if not value:
            return value
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Canonical URL must start with http:// or https://")
        return val

    def validate_schema_json(self, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as err:
                raise serializers.ValidationError(f"Invalid JSON-LD schema: {err.msg}")
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError("JSON-LD schema must be a valid JSON object or list.")
        return value

    def _validate_image_file(self, field_name, value):
        if not value or not hasattr(value, "name"):
            return value
        allowed_exts = ["jpg", "jpeg", "png", "webp"]
        ext = value.name.split(".")[-1].lower() if "." in value.name else ""
        if ext not in allowed_exts:
            raise serializers.ValidationError(
                f"Unsupported image format '.{ext}' for {field_name}. Allowed formats: {', '.join(allowed_exts)}."
            )
        return value

    def validate_feature_image(self, value):
        return self._validate_image_file("feature_image", value)

    def validate_og_image(self, value):
        return self._validate_image_file("og_image", value)

    def validate_twitter_image(self, value):
        return self._validate_image_file("twitter_image", value)

    def to_internal_value(self, data):
        # On partial updates (PATCH), if file fields are empty string or None, retain existing files
        if self.partial and isinstance(data, dict):
            for field in ["feature_image", "og_image", "twitter_image"]:
                if field in data:
                    val = data.get(field)
                    if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                        data = data.copy() if hasattr(data, "copy") else dict(data)
                        data.pop(field, None)
        return super().to_internal_value(data)


class CategoryPageSEOManagementSerializer(serializers.ModelSerializer):
    page_display = serializers.CharField(source="get_page_display", read_only=True)

    class Meta:
        model = CategoryPageSEO
        fields = [
            "id",
            "page",
            "page_display",
            "category_name",
            "visibility",
            "target_keyword",
            "meta_title",
            "meta_description",
            "canonical_url",
            "robots",
            "feature_image",
            "feature_image_alt",
            "schema_json",
            "h1_title",
            "short_description",
            "long_description",
            "updated_at",
        ]
        read_only_fields = ["id", "page_display", "updated_at"]

    def validate_page(self, value):
        val = value.strip()
        qs = CategoryPageSEO.objects.filter(page=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"A category SEO configuration for page '{val}' already exists.")
        return val

    def validate_canonical_url(self, value):
        if not value:
            return value
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Canonical URL must start with http:// or https://")
        return val

    def validate_schema_json(self, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as err:
                raise serializers.ValidationError(f"Invalid JSON-LD schema: {err.msg}")
        if not isinstance(value, (dict, list)):
            raise serializers.ValidationError("JSON-LD schema must be a valid JSON object or list.")
        return value

    def validate_feature_image(self, value):
        if not value or not hasattr(value, "name"):
            return value
        allowed_exts = ["jpg", "jpeg", "png", "webp"]
        ext = value.name.split(".")[-1].lower() if "." in value.name else ""
        if ext not in allowed_exts:
            raise serializers.ValidationError(
                f"Unsupported image format '.{ext}' for feature_image. Allowed formats: {', '.join(allowed_exts)}."
            )
        return value

    def to_internal_value(self, data):
        # On partial updates (PATCH), if feature_image is empty string or None, retain existing file
        if self.partial and isinstance(data, dict) and "feature_image" in data:
            val = data.get("feature_image")
            if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                data = data.copy() if hasattr(data, "copy") else dict(data)
                data.pop("feature_image", None)
        return super().to_internal_value(data)


# ==============================================================================
# Authentication & Authorization Management Serializers
# ==============================================================================

class PermissionSerializer(serializers.ModelSerializer):
    app_label = serializers.CharField(source="content_type.app_label", read_only=True)

    class Meta:
        model = Permission
        fields = ["id", "name", "codename", "app_label"]
        read_only_fields = ["id", "name", "codename", "app_label"]


class GroupManagementSerializer(serializers.ModelSerializer):
    permissions_details = PermissionSerializer(source="permissions", many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="permissions",
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            "id",
            "name",
            "user_count",
            "permissions_details",
            "permission_ids",
        ]
        read_only_fields = ["id", "user_count", "permissions_details"]

    def get_user_count(self, obj):
        return obj.user_set.count()

    def validate_name(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Group name cannot be blank.")
        qs = Group.objects.filter(name__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"A group with the name '{val}' already exists.")
        return val


class UserListManagementSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "is_active",
            "groups",
            "last_login",
            "date_joined",
        ]
        read_only_fields = fields


class UserDetailManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    groups_details = serializers.SerializerMethodField()
    group_ids = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="groups",
    )
    user_permissions_details = PermissionSerializer(source="user_permissions", many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source="user_permissions",
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_superuser",
            "is_active",
            "password",
            "groups_details",
            "group_ids",
            "user_permissions_details",
            "permission_ids",
            "last_login",
            "date_joined",
        ]
        read_only_fields = ["id", "last_login", "date_joined", "groups_details", "user_permissions_details"]

    def get_groups_details(self, obj):
        return [{"id": g.id, "name": g.name} for g in obj.groups.all()]

    def validate_username(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Username cannot be blank.")
        qs = User.objects.filter(username__iexact=val)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"A user with the username '{val}' already exists.")
        return val

    def validate(self, attrs):
        request = self.context.get("request")
        current_user = getattr(request, "user", None)
        target_user = self.instance

        # Privilege assignment & escalation guards:
        # 1. Non-superuser cannot touch is_superuser or grant is_superuser
        if "is_superuser" in attrs:
            new_superuser = attrs["is_superuser"]
            if not current_user or not current_user.is_superuser:
                if target_user and target_user.is_superuser != new_superuser:
                    raise serializers.ValidationError({"is_superuser": "Only superusers can grant or revoke superuser status."})
                elif not target_user and new_superuser:
                    raise serializers.ValidationError({"is_superuser": "Only superusers can create superuser accounts."})

        # 2. Prevent self-demotion / deactivation of the last superuser
        if target_user and target_user.is_superuser:
            is_active_target = attrs.get("is_active", target_user.is_active)
            is_staff_target = attrs.get("is_staff", target_user.is_staff)
            is_superuser_target = attrs.get("is_superuser", target_user.is_superuser)

            if not is_active_target or not is_staff_target or not is_superuser_target:
                active_superusers = User.objects.filter(is_superuser=True, is_active=True, is_staff=True).exclude(pk=target_user.pk)
                if not active_superusers.exists():
                    raise serializers.ValidationError("Cannot deactivate or remove superuser privileges from the last active administrator.")

        # 3. Only superusers or staff with change_user can manage staff status
        if "is_staff" in attrs and (not current_user or not current_user.is_superuser):
            new_staff = attrs["is_staff"]
            if target_user and target_user.is_staff != new_staff and not current_user.has_perm("auth.change_user"):
                raise serializers.ValidationError({"is_staff": "Permission required to change staff status."})

        # 4. Password validation via Django password APIs
        password = attrs.get("password")
        if password:
            if len(password) < 8:
                raise serializers.ValidationError({"password": ["This password is too short. It must contain at least 8 characters."]})
            try:
                password_validation.validate_password(password, user=target_user)
            except serializers.ValidationError as err:
                raise err
            except Exception as err:
                raise serializers.ValidationError({"password": list(err)})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        groups = validated_data.pop("groups", None)
        user_permissions = validated_data.pop("user_permissions", None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        if groups is not None:
            user.groups.set(groups)
        if user_permissions is not None:
            user.user_permissions.set(user_permissions)

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        groups = validated_data.pop("groups", None)
        user_permissions = validated_data.pop("user_permissions", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.save()

        if groups is not None:
            instance.groups.set(groups)
        if user_permissions is not None:
            instance.user_permissions.set(user_permissions)

        return instance


class SiteSettingsManagementSerializer(serializers.ModelSerializer):
    clear_favicon = serializers.BooleanField(write_only=True, required=False, default=False)
    clear_logo_icon = serializers.BooleanField(write_only=True, required=False, default=False)
    clear_logo_icon_light = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "name",
            "tagline",
            "logo_text",
            "logo_asset",
            "logo",
            "logo_light",
            "logo_icon",
            "logo_icon_light",
            "clear_logo_icon",
            "clear_logo_icon_light",
            "favicon",
            "clear_favicon",
            "hotline",
            "phone",
            "email",
            "whatsapp",
            "website",
            "primary_address",
            "footer_tagline",
            "footer_copy_text",
            "opening_hours_text",
            "social_media",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def to_representation(self, instance):
        from core.utils.media import normalize_media_fields
        ret = super().to_representation(instance)
        return normalize_media_fields(ret, ("logo", "logo_light", "logo_icon", "logo_icon_light", "favicon"))

    def _validate_uploaded_icon(self, value, label: str):
        if not value:
            return value
        from django.core.exceptions import ValidationError as DjangoValidationError
        from core.utils.media import validate_icon_file
        try:
            return validate_icon_file(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)

    def validate_favicon(self, value):
        return self._validate_uploaded_icon(value, "favicon")

    def validate_logo_icon(self, value):
        return self._validate_uploaded_icon(value, "logo_icon")

    def validate_logo_icon_light(self, value):
        return self._validate_uploaded_icon(value, "logo_icon_light")

    def update(self, instance, validated_data):
        clear_favicon = validated_data.pop("clear_favicon", False)
        if clear_favicon and "favicon" not in validated_data:
            if instance.favicon:
                instance.favicon.delete(save=False)
            instance.favicon = None

        clear_logo_icon = validated_data.pop("clear_logo_icon", False)
        if clear_logo_icon and "logo_icon" not in validated_data:
            if instance.logo_icon:
                instance.logo_icon.delete(save=False)
            instance.logo_icon = None

        clear_logo_icon_light = validated_data.pop("clear_logo_icon_light", False)
        if clear_logo_icon_light and "logo_icon_light" not in validated_data:
            if instance.logo_icon_light:
                instance.logo_icon_light.delete(save=False)
            instance.logo_icon_light = None

        return super().update(instance, validated_data)

    def validate_name(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Business name cannot be empty.")
        return val

    def validate_website(self, value):
        val = value.strip()
        if not (val.startswith("http://") or val.startswith("https://")):
            raise serializers.ValidationError("Website URL must start with http:// or https://")
        return val

    def validate_whatsapp(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("WhatsApp destination cannot be empty.")
        return val


class ShowroomBranchManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShowroomBranch
        fields = [
            "id",
            "branch_id",
            "name",
            "short_name",
            "tag",
            "address",
            "phone",
            "hotline",
            "email",
            "hours",
            "map_link",
            "embed_map",
            "order",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_branch_id(self, value):
        val = value.strip().lower()
        if not val:
            raise serializers.ValidationError("Branch identifier cannot be empty.")
        # Ensure only alphanumeric and hyphens/underscores
        import re
        if not re.match(r"^[a-z0-9_-]+$", val):
            raise serializers.ValidationError("Branch identifier must be lowercase alphanumeric with hyphens or underscores.")

        # Check uniqueness excluding self
        instance = self.instance
        qs = ShowroomBranch.objects.filter(branch_id=val)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(f"Showroom branch with identifier '{val}' already exists.")
        return val

    def validate_map_link(self, value):
        val = value.strip()
        if not val.startswith("https://"):
            raise serializers.ValidationError("Map link must start with https://")
        return val

    def validate_embed_map(self, value):
        val = value.strip()
        if not (val.startswith("https://") or "<iframe" in val):
            raise serializers.ValidationError("Embed map must be a secure https:// URL or iframe.")
        # Restrict map provider
        allowed_domains = ["maps.google.com", "google.com/maps"]
        if not any(domain in val for domain in allowed_domains):
            raise serializers.ValidationError("Embed map must use Google Maps as the provider.")
        return val


class PreferenceCategoryManagementSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PreferenceCategory
        fields = [
            "id",
            "section",
            "category_key",
            "label",
            "badge",
            "subtext",
            "image",
            "image_url",
            "cta_text",
            "cta_url",
            "highlights",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "image_url", "created_at", "updated_at"]

    def get_image_url(self, obj):
        return self.get_optimized_image_url(obj, "image")

    def validate_image(self, value):
        if value:
            import os
            ext = os.path.splitext(value.name)[1].lower().lstrip(".")
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError("Only jpg, jpeg, png, and webp images are permitted.")
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Image file size cannot exceed 10MB.")
        return value

    def validate_highlights(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Highlights must be an array of card objects.")
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each highlight must be an object with title and description.")
            if not item.get("title"):
                raise serializers.ValidationError("Each highlight must specify a title.")
        return value

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        if isinstance(data, dict):
            if "highlights" in data and isinstance(data["highlights"], str):
                try:
                    data["highlights"] = json.loads(data["highlights"])
                except Exception:
                    pass
            if self.partial and "image" in data:
                val = data.get("image")
                if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                    data = data.copy() if hasattr(data, "copy") else dict(data)
                    data.pop("image", None)
        return super().to_internal_value(data)



class PreferenceSectionManagementSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = PreferenceSection
        fields = [
            "id",
            "heading",
            "badge",
            "subtext",
            "is_active",
            "categories",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "categories", "created_at", "updated_at"]

    def validate(self, attrs):
        is_active = attrs.get("is_active", self.instance.is_active if self.instance else False)
        if is_active:
            section = self.instance or PreferenceSection.objects.first()
            if section:
                active_count = section.categories.filter(is_active=True).count()
                if active_count < 1:
                    raise serializers.ValidationError({
                        "is_active": "Cannot publish Preference Section with fewer than 1 active category. Please ensure at least 1 category is active."
                    })
            else:
                raise serializers.ValidationError({
                    "is_active": "Cannot publish Preference Section with fewer than 1 active category. Please create and activate at least 1 category first."
                })
        return attrs

    def get_categories(self, obj):
        cats = obj.categories.all().order_by("order", "id")
        return PreferenceCategoryManagementSerializer(cats, many=True, context=self.context).data


class ConsultationSectionManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationSection
        fields = [
            "id",
            "tag",
            "heading",
            "description",
            "trust_pills",
            "primary_cta_label",
            "primary_cta_action",
            "primary_cta_url",
            "whatsapp_cta_label",
            "representative",
            "whatsapp_number",
            "whatsapp_message",
            "status_beacon_text",
            "is_active",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]

    def validate_trust_pills(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Trust pills must be a list of objects.")
        for pill in value:
            if not isinstance(pill, dict):
                raise serializers.ValidationError("Each trust pill must be an object with title and icon.")
            if not pill.get("title") or not pill.get("icon"):
                raise serializers.ValidationError("Each trust pill must specify title and icon.")
        return value

    def validate(self, attrs):
        action = attrs.get("primary_cta_action")
        url = attrs.get("primary_cta_url")
        if action in ["internal_link", "external_link"] and not url:
            raise serializers.ValidationError({"primary_cta_url": "URL is required when action is link."})
        return attrs


class ExperiencePillarManagementSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ExperiencePillar
        fields = [
            "id",
            "section",
            "pillar_number",
            "badge",
            "title",
            "description",
            "image",
            "image_url",
            "tags",
            "order",
            "is_active",
        ]
        read_only_fields = ["id", "image_url"]

    def get_image_url(self, obj):
        if not obj.image:
            return None
        val = str(obj.image)
        if val.startswith("http://") or val.startswith("https://"):
            return val
        return self.get_optimized_image_url(obj, "image")

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list of strings.")
        return [str(t).strip() for t in value if str(t).strip()]

    def validate_image(self, value):
        if value and hasattr(value, "size"):
            import os
            ext = os.path.splitext(value.name)[1].lower().lstrip(".")
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError("Only jpg, jpeg, png, and webp images are permitted.")
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Image file size cannot exceed 10MB.")
    def validate(self, attrs):
        if "is_active" in attrs and attrs["is_active"] is False and self.instance:
            if self.instance.section and self.instance.section.is_active:
                remaining_active = self.instance.section.pillars.filter(is_active=True).exclude(pk=self.instance.pk).count()
                if remaining_active < 3:
                    raise serializers.ValidationError({
                        "is_active": "Cannot deactivate pillar: published Experience Section requires at least 3 active pillars."
                    })
        return attrs

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        if isinstance(data, dict):
            if "tags" in data and isinstance(data["tags"], str):
                try:
                    data["tags"] = json.loads(data["tags"])
                except Exception:
                    pass
            if self.partial and "image" in data:
                val = data.get("image")
                if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                    data = data.copy() if hasattr(data, "copy") else dict(data)
                    data.pop("image", None)
        return super().to_internal_value(data)



class ExperienceSectionManagementSerializer(serializers.ModelSerializer):
    pillars = serializers.SerializerMethodField()

    class Meta:
        model = ExperienceSection
        fields = [
            "id",
            "title",
            "subtitle",
            "video_cta_label",
            "video_target",
            "is_active",
            "pillars",
            "updated_at",
        ]
        read_only_fields = ["id", "pillars", "updated_at"]

    def validate(self, attrs):
        is_active = attrs.get("is_active", self.instance.is_active if self.instance else False)
        if is_active:
            section = self.instance or ExperienceSection.objects.first()
            if section:
                active_count = section.pillars.filter(is_active=True).count()
                if active_count < 3:
                    raise serializers.ValidationError({
                        "is_active": "Cannot publish Experience Section with fewer than 3 active pillars. Please ensure at least 3 pillars are active."
                    })
            else:
                raise serializers.ValidationError({
                    "is_active": "Cannot publish Experience Section with fewer than 3 active pillars. Please create and activate at least 3 pillars first."
                })
        return attrs

    def get_pillars(self, obj):
        pillars = obj.pillars.all().order_by("order", "id")
        return ExperiencePillarManagementSerializer(pillars, many=True, context=self.context).data


class VisualChroniclesItemManagementSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = VisualChroniclesItem
        fields = [
            "id",
            "section",
            "card_type",
            "order",
            "front_image",
            "front_image_url",
            "image_url",
            "front_alt",
            "front_badge",
            "back_pill",
            "back_number",
            "title",
            "description",
            "specs",
            "cta_label",
            "cta_url",
            "is_active",
        ]
        read_only_fields = ["id", "image_url"]

    def get_image_url(self, obj):
        if obj.front_image:
            return self.get_optimized_image_url(obj, "front_image")
        return obj.front_image_url or None

    def validate_specs(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Specs must be a list of spec items or tag strings.")
        return value

    def validate_front_image(self, value):
        if value and hasattr(value, "size"):
            import os
            ext = os.path.splitext(value.name)[1].lower().lstrip(".")
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError("Only jpg, jpeg, png, and webp images are permitted.")
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Image file size cannot exceed 10MB.")
        return value

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        if isinstance(data, dict):
            if "specs" in data and isinstance(data["specs"], str):
                try:
                    data["specs"] = json.loads(data["specs"])
                except Exception:
                    pass
            if self.partial and "front_image" in data:
                val = data.get("front_image")
                if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                    data = data.copy() if hasattr(data, "copy") else dict(data)
                    data.pop("front_image", None)
        return super().to_internal_value(data)



class VisualChroniclesSectionManagementSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = VisualChroniclesSection
        fields = [
            "id",
            "heading",
            "subtitle",
            "stats_number",
            "stats_label",
            "archive_tag",
            "archive_description",
            "archive_cta_label",
            "archive_cta_url",
            "is_active",
            "items",
            "updated_at",
        ]
        read_only_fields = ["id", "items", "updated_at"]

    def validate(self, attrs):
        is_active = attrs.get("is_active", self.instance.is_active if self.instance else False)
        if is_active:
            section = self.instance or VisualChroniclesSection.objects.first()
            if section:
                active_count = section.items.filter(is_active=True).count()
                if active_count < 1:
                    raise serializers.ValidationError({
                        "is_active": "Cannot publish Visual Chronicles Section with fewer than 1 active item. Please ensure at least 1 item is active."
                    })
            else:
                raise serializers.ValidationError({
                    "is_active": "Cannot publish Visual Chronicles Section with fewer than 1 active item. Please create and activate at least 1 item first."
                })
        return attrs

    def get_items(self, obj):
        items = obj.items.all().order_by("order", "id")
        return VisualChroniclesItemManagementSerializer(items, many=True, context=self.context).data


class VipSanctuarySectionManagementSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = VipSanctuarySection
        fields = [
            "id",
            "background_image",
            "background_image_url",
            "image_url",
            "eyebrow",
            "title",
            "description",
            "value_pillars",
            "primary_cta_label",
            "primary_cta_action",
            "primary_cta_url",
            "secondary_cta_label",
            "secondary_cta_url",
            "card_badge",
            "card_title",
            "card_live_pill",
            "branch",
            "location_text",
            "hours_text",
            "phone_text",
            "whatsapp_cta_label",
            "whatsapp_url",
            "tour_cta_label",
            "tour_video_target",
            "is_active",
            "updated_at",
        ]
        read_only_fields = ["id", "image_url", "updated_at"]

    def get_image_url(self, obj):
        if obj.background_image:
            return self.get_optimized_image_url(obj, "background_image")
        return obj.background_image_url or None

    def validate_value_pillars(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Value pillars must be a list of objects.")
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each value pillar must be an object with title and subtitle.")
            if not item.get("title"):
                raise serializers.ValidationError("Each value pillar must specify a title.")
        return value

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        if isinstance(data, dict):
            if "value_pillars" in data and isinstance(data["value_pillars"], str):
                try:
                    data["value_pillars"] = json.loads(data["value_pillars"])
                except Exception:
                    pass
            if self.partial and "background_image" in data:
                val = data.get("background_image")
                if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                    data = data.copy() if hasattr(data, "copy") else dict(data)
                    data.pop("background_image", None)
        return super().to_internal_value(data)



class AboutSectionManagementSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    reel_image_display = serializers.SerializerMethodField()

    class Meta:
        model = AboutSection
        fields = [
            "id",
            "hero_badge",
            "hero_title",
            "hero_subtitle",
            "stats",
            "story_eyebrow",
            "story_title",
            "story_content_p1",
            "story_content_p2",
            "quote_text",
            "quote_author",
            "reel_image",
            "reel_image_url",
            "reel_image_display",
            "reel_title",
            "reel_duration",
            "reel_video_target",
            "tour_cta_label",
            "tour_video_target",
            "pillars_eyebrow",
            "pillars_title",
            "pillars",
            "cta_title",
            "cta_description",
            "cta_primary_label",
            "cta_secondary_label",
            "cta_whatsapp_label",
            "is_active",
            "updated_at",
        ]
        read_only_fields = ["id", "reel_image_display", "updated_at"]

    def get_reel_image_display(self, obj):
        if obj.reel_image:
            return self.get_optimized_image_url(obj, "reel_image")
        return obj.reel_image_url or None

    def validate_stats(self, value):
        if isinstance(value, str):
            import json
            try:
                value = json.loads(value)
            except Exception:
                raise serializers.ValidationError("Stats must be valid JSON.")
        if not isinstance(value, list):
            raise serializers.ValidationError("Stats must be a list of objects.")
        for item in value:
            if not isinstance(item, dict) or not item.get("label"):
                raise serializers.ValidationError("Each stat must be an object with 'number' and 'label'.")
        return value

    def validate_pillars(self, value):
        if isinstance(value, str):
            import json
            try:
                value = json.loads(value)
            except Exception:
                raise serializers.ValidationError("Pillars must be valid JSON.")
        if not isinstance(value, list):
            raise serializers.ValidationError("Pillars must be a list of objects.")
        for item in value:
            if not isinstance(item, dict) or not item.get("title"):
                raise serializers.ValidationError("Each pillar must be an object with 'title' and 'description'.")
        return value

    def to_internal_value(self, data):
        if hasattr(data, "dict"):
            data = data.dict()
        elif hasattr(data, "copy"):
            data = dict(data)
        if isinstance(data, dict):
            if "stats" in data and isinstance(data["stats"], str):
                try:
                    data["stats"] = json.loads(data["stats"])
                except Exception:
                    pass
            if "pillars" in data and isinstance(data["pillars"], str):
                try:
                    data["pillars"] = json.loads(data["pillars"])
                except Exception:
                    pass
            if self.partial and "reel_image" in data:
                val = data.get("reel_image")
                if val == "" or val is None or (hasattr(val, "size") and val.size == 0):
                    data = data.copy() if hasattr(data, "copy") else dict(data)
                    data.pop("reel_image", None)
        return super().to_internal_value(data)







from apps.home.models.showroom_story_model import ShowroomStory

class ShowroomStoryManagementSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    resolved_media_url = serializers.SerializerMethodField()

    class Meta:
        model = ShowroomStory
        fields = [
            "id",
            "title",
            "tag",
            "subtitle",
            "price_note",
            "media_type",
            "media_file",
            "media_url",
            "resolved_media_url",
            "cta_text",
            "cta_link",
            "whatsapp_message",
            "brand",
            "accent_color",
            "order",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "resolved_media_url", "created_at", "updated_at"]

    def get_resolved_media_url(self, obj):
        if obj.media_file:
            return build_media_url(obj.media_file.url)
        return obj.media_url or ""
