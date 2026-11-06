from django.db.models import Min

from rest_framework import serializers

from base.models import BaseModel
from core.mixins.image_optimization_mixins import OptimizedImageSerializerMixin

from apps.inventory.models import (
    Brand, ModelGeneration, BodyStyle, Inventory, InventoryImage, Stock, InventoryQuote
)


class InventoryImageSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = InventoryImage
        fields = ['id', 'caption', 'image', 'alt_text', 'tag', 'order']

    def get_image(self, obj):
        return self.get_optimized_image_url(obj, 'image')


class InventoryListSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    feature_image = serializers.SerializerMethodField()
    brand = serializers.StringRelatedField(read_only=True)
    model = serializers.StringRelatedField(read_only=True)
    model_name = serializers.CharField(read_only=True)
    fuel_type = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    raw_price = serializers.DecimalField(source="price", max_digits=12, decimal_places=2, read_only=True)
    is_call_for_price = serializers.BooleanField(read_only=True)
    branch = serializers.SerializerMethodField()
    registration_number = serializers.CharField(read_only=True)
    slug = serializers.SlugField(required=False, allow_blank=True)

    def validate_slug(self, value):
        if value:
            qs = Inventory.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("This slug is already in use.")
        return value

    def validate(self, attrs):
        if 'slug' in attrs and not attrs.get('slug'):
            attrs.pop('slug', None)
        return attrs

    class Meta:
        model = Inventory
        fields = [
            'id', 'name', 'car_type', 'brand', 'model', 'model_name', 'year', 'engine_capacity', 'fuel_type',
            'mileage', 'price', 'raw_price', 'is_call_for_price', 'branch', 'registration_number',
            'feature_image', 'body_style', 'registered',
            'slug', 'meta_title', 'featured_image_alt', 'indexing',
            'h1_title', 'target_keyword',
        ]

    def get_feature_image(self, obj):
        if obj.feature_image:
            return self.get_optimized_image_url(obj, 'feature_image')

    def get_fuel_type(self, obj):
        # Custom logic to format fuel_type if it contains "+HYBRID"
        if "+HYBRID" in obj.fuel_type:
            return obj.fuel_type.replace("+HYBRID", " (h)")
        if "+PLUG-IN HYBRID" in obj.fuel_type:
            return obj.fuel_type.replace("+PLUG-IN HYBRID", " (PHEV)")
        return obj.fuel_type

    def get_price(self, obj):
        if getattr(obj, "is_call_for_price", False):
            return "Call for Price"
        if obj.registered == Inventory.AvailabilityChoices.SOLD:
            return "Sold"
        if obj.registered == Inventory.AvailabilityChoices.PRE_ORDER:
            return "Pre-Order"
        return obj.price

    def get_branch(self, obj):
        if not obj.branch:
            return None
        return {
            "id": obj.branch.id,
            "branch_id": obj.branch.branch_id,
            "name": obj.branch.name,
            "short_name": obj.branch.short_name,
            "tag": getattr(obj.branch, "tag", ""),
            "address": obj.branch.address,
            "phone": obj.branch.phone,
            "hotline": obj.branch.hotline,
            "hours": obj.branch.hours,
            "map_link": obj.branch.map_link,
        }


class InventoryDetailSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    feature_image = serializers.SerializerMethodField()
    inventory_images = serializers.SerializerMethodField()
    brand = serializers.StringRelatedField(read_only=True)
    model = serializers.StringRelatedField(read_only=True)
    model_name = serializers.CharField(read_only=True)
    body_style = serializers.StringRelatedField(read_only=True)
    price = serializers.SerializerMethodField()
    raw_price = serializers.DecimalField(source="price", max_digits=12, decimal_places=2, read_only=True)
    is_call_for_price = serializers.BooleanField(read_only=True)
    branch = serializers.SerializerMethodField()
    registration_number = serializers.CharField(read_only=True)
    schema_data = serializers.SerializerMethodField()
    slug = serializers.SlugField(required=False, allow_blank=True)

    def validate_slug(self, value):
        if value:
            qs = Inventory.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("This slug is already in use.")
        return value

    def validate(self, attrs):
        if 'slug' in attrs and not attrs.get('slug'):
            attrs.pop('slug', None)
        return attrs

    class Meta:
        model = Inventory
        fields = [
            'id', 'name', 'car_type', 'brand', 'model', 'model_name', 'year', 'engine_capacity', 'fuel_type', 'mileage', 'price',
            'raw_price', 'is_call_for_price', 'branch', 'registration_number',
            'transmission', 'drive_type', 'wheel_base', 'color', 'condition', 'registered', 'body_style',
            'feature_image', 'description', 'youtube', 'status', 'slightly_negotiable', 'inventory_images',
            'slug', 'meta_title', 'meta_description', 'canonical_url',
            'featured_image_alt', 'indexing', 'schema_data',
            'h1_title', 'target_keyword',
        ]

    def get_feature_image(self, obj):
        return self.get_optimized_image_url(obj, 'feature_image')

    def get_inventory_images(self, obj):
        images = obj.inventory_images.all().order_by('order')
        return InventoryImageSerializer(images, many=True, context=self.context).data

    def get_price(self, obj):
        if getattr(obj, "is_call_for_price", False):
            return "Call for Price"
        if obj.registered == Inventory.AvailabilityChoices.SOLD:
            return "Sold"
        if obj.registered == Inventory.AvailabilityChoices.PRE_ORDER:
            return "Pre-Order"
        return obj.price

    def get_branch(self, obj):
        if not obj.branch:
            return None
        return {
            "id": obj.branch.id,
            "branch_id": obj.branch.branch_id,
            "name": obj.branch.name,
            "short_name": obj.branch.short_name,
            "tag": getattr(obj.branch, "tag", ""),
            "address": obj.branch.address,
            "phone": obj.branch.phone,
            "hotline": obj.branch.hotline,
            "hours": obj.branch.hours,
            "map_link": obj.branch.map_link,
        }


    def get_schema_data(self, obj):
        if obj.schema_override:
            return obj.schema_override

        # Build public page URL
        page_url = obj.canonical_url or ''
        if not page_url and obj.slug:
            try:
                page_url = self.context['request'].build_absolute_uri(f'/cars/{obj.slug}/')
            except Exception:
                page_url = f'https://dreamcarhouse.com/inventory/{obj.slug}/'

        # Build feature image URL
        feature_image_url = ''
        if obj.feature_image:
            try:
                feature_image_url = self.context['request'].build_absolute_uri(obj.feature_image.url)
            except Exception:
                feature_image_url = ''

        # Build gallery image URLs
        gallery_urls = []
        for img in obj.inventory_images.all().order_by('order'):
            try:
                gallery_urls.append(self.context['request'].build_absolute_uri(img.image.url))
            except Exception:
                pass

        all_images = []
        if feature_image_url:
            all_images.append(feature_image_url)
        all_images.extend(gallery_urls)

        # Determine availability
        availability = "https://schema.org/InStock"
        if obj.registered == Inventory.AvailabilityChoices.SOLD:
            availability = "https://schema.org/SoldOut"

        price_val = ''
        if obj.price and obj.registered != Inventory.AvailabilityChoices.PRE_ORDER:
            try:
                price_val = str(int(float(str(obj.price))))
            except (ValueError, TypeError):
                price_val = str(obj.price)

        schema = {
            "@context": "https://schema.org",
            "@type": "Car",
            "name": obj.name,
            "description": obj.meta_description or '',
            "url": page_url,
            "brand": {
                "@type": "Brand",
                "name": str(obj.brand) if obj.brand else ''
            },
            "model": str(obj.model) if obj.model else '',
            "modelDate": str(obj.year) if obj.year else '',
            "color": obj.color or '',
            "vehicleTransmission": obj.transmission or '',
            "fuelType": obj.fuel_type or '',
            "bodyType": str(obj.body_style) if obj.body_style else '',
            "driveWheelConfiguration": obj.drive_type or '',
            "mileageFromOdometer": {
                "@type": "QuantitativeValue",
                "value": obj.mileage or '',
                "unitCode": "KMT"
            },
            "offers": {
                "@type": "Offer",
                "price": price_val,
                "priceCurrency": "BDT",
                "availability": availability,
                "url": page_url,
                "seller": {
                    "@type": "Organization",
                    "name": "Dream Car House"
                }
            },
            "image": all_images
        }
        return schema


class BrandListSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    slug = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    car_names = serializers.SerializerMethodField()
    starting_price = serializers.SerializerMethodField()
    # Human-readable label ("Luxury & Performance"), not the raw stored code
    # ("LUXURY_PERFORMANCE") — the frontend groups brands by this value directly.
    segment = serializers.CharField(source='get_segment_display', read_only=True)

    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'image', 'car_names', 'starting_price', 'segment',
            'listing_footer_text', 'logo_alt', 'order', 'is_in_runway', 'destination_url',
        ]

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

    def get_image(self, obj):
        return self.get_optimized_image_url(obj, 'image')

    def get_car_names(self, obj):
        # Listing names (Inventory.name) of this brand's cars that are actually
        # available to buy. Scoped the same way as get_starting_price() so a
        # brand card never lists a car the quoted price doesn't account for.
        return list(
            Inventory.objects.filter(
                brand=obj,
                status=BaseModel.StatusChoices.PUBLISHED,
                registered=Inventory.AvailabilityChoices.AVAILABLE,
            ).exclude(name='').values_list(
                'name', flat=True
            ).distinct().order_by('name')
        )

    def get_starting_price(self, obj):
        result = Inventory.objects.filter(
            brand=obj,
            status=BaseModel.StatusChoices.PUBLISHED,
            registered=Inventory.AvailabilityChoices.AVAILABLE,
            price__gt=0,
        ).aggregate(Min('price'))
        return result['price__min']


class BrandSEOSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    """
    SEO + on-page content for a single brand's listing page
    (/cars/brand/<slug>). Mirrors CategoryPageSEOSerializer's field set
    exactly, just sourced from the Brand row itself instead of a separate
    page-keyed table.
    """
    slug = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    feature_image = serializers.SerializerMethodField()
    segment = serializers.CharField(source='get_segment_display', read_only=True)

    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'image', 'logo_alt', 'segment',
            'listing_footer_text', 'destination_url',
            'feature_image', 'feature_image_alt',
            'target_keyword', 'meta_title', 'meta_description',
            'canonical_url', 'robots', 'schema_json',
            'h1_title', 'short_description', 'long_description',
            'seo_updated_at',
        ]

    def get_slug(self, obj):
        from django.utils.text import slugify
        return slugify(obj.name)

    def get_image(self, obj):
        return self.get_optimized_image_url(obj, 'image')

    def get_feature_image(self, obj):
        return self.get_optimized_image_url(obj, 'feature_image')


class ModelGenerationListSerializer(serializers.ModelSerializer):
    brand = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ModelGeneration
        fields = ['id', 'brand', 'model']


class BodyStyleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyStyle
        fields = ['id', 'body']


class StockListSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = [
            'id',
            'title',
            'image'
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class InventoryQuoteCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = InventoryQuote
        fields = '__all__'
