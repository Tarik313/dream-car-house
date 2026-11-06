from django.shortcuts import render, redirect, get_object_or_404
from django.http import Http404
from rest_framework import generics
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import F, Case, When, Value, IntegerField


from base.models import BaseModel
from apps.inventory.filters import (
    InventoryFilter
)
from apps.inventory.models import (
    Brand, ModelGeneration, BodyStyle, Inventory, InventoryImage, Stock, InventoryQuote
)
from apps.inventory.serializers import (
    InventoryListSerializer, InventoryDetailSerializer, BrandListSerializer, BrandSEOSerializer,
    ModelGenerationListSerializer, BodyStyleListSerializer, StockListSerializer, InventoryQuoteCreateSerializer
)


class InventoryListView(generics.ListAPIView):
    permission_classes = []
    serializer_class = InventoryListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = InventoryFilter
    search_fields = ['name', 'description']

    # def get_queryset(self):
    #     try:
    #         custom_order = [
    #             'Mercedes-Benz',
    #             'BMW',
    #             'Audi',
    #             'Land Rover',
    #             'Toyota'
    #         ]
    #
    #         brand_order_case = Case(
    #             *[
    #                 When(brand__name=brand, then=Value(index))
    #                 for index, brand in enumerate(custom_order)
    #             ],
    #             default=Value(len(custom_order)),
    #             output_field=IntegerField()
    #         )
    #
    #         return (
    #             Inventory.objects
    #             .filter(status=BaseModel.StatusChoices.PUBLISHED)
    #             .annotate(brand_priority=brand_order_case)
    #             .order_by('brand_priority', '-created_at')  # then by latest
    #         )
    #     except Exception as e:
    #         from django.http import Http404
    #         raise Http404(f"Inventory query failed due to: {str(e)}")

    def get_queryset(self):
        # Sold cars sink to the bottom of every listing (regardless of which
        # `registered` filter is applied) instead of being excluded outright —
        # the availability filter defaults to showing everything now.
        sold_last = Case(
            When(registered=Inventory.AvailabilityChoices.SOLD, then=Value(1)),
            default=Value(0),
            output_field=IntegerField(),
        )
        return (
            Inventory.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)
            .select_related('brand', 'model', 'body_style')
            .annotate(sold_last=sold_last)
            .order_by('sold_last', F('price').desc(nulls_first=True), '-updated_at')
        )


class InventoryDetailView(generics.RetrieveAPIView):
    permission_classes = []
    serializer_class = InventoryDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return (
            Inventory.objects.filter(status__in=[BaseModel.StatusChoices.PUBLISHED, BaseModel.StatusChoices.UNLISTED])
            .select_related('brand', 'model', 'body_style')
            .prefetch_related('inventory_images')
            .order_by('-updated_at')
        )

    def get_object(self):
        queryset = self.get_queryset()
        slug = self.kwargs.get(self.lookup_field)
        
        try:
            return queryset.get(slug__iexact=slug)
        except queryset.model.DoesNotExist:
            raise Http404("No Inventory matches the given query.")
        except queryset.model.MultipleObjectsReturned:
            import logging
            logger = logging.getLogger(__name__)
            # Return the first available published one if duplicate exists
            instance = queryset.filter(slug__iexact=slug).first()
            if instance:
                logger.warning(f"Multiple cars found for slug '{slug}'. Returning the first one ID {instance.id}.")
                return instance
            raise Http404("No Inventory matches the given query.")

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Http404:
            # Secondary lookup: check if the requested slug is a known old/broken
            # slug stored in previous_slug — if so, 301 to the current clean slug.
            requested_slug = self.kwargs.get(self.lookup_field, '')
            try:
                instance = Inventory.objects.get(
                    previous_slug=requested_slug,
                    status=BaseModel.StatusChoices.PUBLISHED,
                )
                new_api_url = request.build_absolute_uri(
                    f"/api/v1/inventory/detail/{instance.slug}/"
                )
                return Response(
                    status=status.HTTP_301_MOVED_PERMANENTLY,
                    headers={'Location': new_api_url},
                )
            except Inventory.DoesNotExist:
                raise Http404()

        # If admin has set a manual redirect_url, honour it.
        if instance.redirect_url:
            return Response(
                status=status.HTTP_301_MOVED_PERMANENTLY,
                headers={'Location': instance.redirect_url}
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class InventoryDetailByIdView(generics.RetrieveAPIView):
    """Legacy ID-based detail view — returns 301 redirect to slug-based URL."""
    permission_classes = []
    serializer_class = InventoryDetailSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Inventory.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        slug_url = f"/api/v1/inventory/detail/{instance.slug}/"
        return Response(
            status=status.HTTP_301_MOVED_PERMANENTLY,
            headers={'Location': request.build_absolute_uri(slug_url)}
        )


class BrandListView(generics.ListAPIView):
    permission_classes = []
    serializer_class = BrandListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Brand.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)
        if self.request.query_params.get('runway') in ('true', '1'):
            qs = qs.filter(is_in_runway=True).exclude(image='').exclude(image__isnull=True)
        return qs.order_by('order', 'name')


class BrandSEODetailView(APIView):
    """
    GET /api/v1/inventory/brands/<brand_id>/seo/
    GET /api/v1/inventory/brands/<slug>/seo/
    Returns the SEO + on-page content for a single brand's listing page.
    404 if the brand doesn't exist or isn't published.
    """
    permission_classes = []

    def get(self, request, brand_id=None, slug=None, format=None):
        brand = None
        if brand_id is not None:
            brand = Brand.objects.filter(id=brand_id, status=BaseModel.StatusChoices.PUBLISHED).first()
        elif slug:
            norm_slug = slug.strip().lower()
            from django.utils.text import slugify
            for b in Brand.objects.filter(status=BaseModel.StatusChoices.PUBLISHED):
                if slugify(b.name) == norm_slug:
                    brand = b
                    break
            if not brand:
                brand = Brand.objects.filter(
                    name__iexact=norm_slug.replace('-', ' '),
                    status=BaseModel.StatusChoices.PUBLISHED
                ).first()
            if not brand and norm_slug.isdigit():
                brand = Brand.objects.filter(
                    id=int(norm_slug),
                    status=BaseModel.StatusChoices.PUBLISHED
                ).first()


        if not brand:
            identifier = brand_id if brand_id is not None else slug
            return Response(
                {'detail': f'No published brand found for "{identifier}".'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BrandSEOSerializer(brand, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ModelGenerationListView(generics.ListAPIView):
    permission_classes = []
    serializer_class = ModelGenerationListSerializer
    queryset = ModelGeneration.objects.filter(status=BaseModel.StatusChoices.PUBLISHED).order_by('model')
    pagination_class = None


class BodyStyleListView(generics.ListAPIView):
    permission_classes = []
    serializer_class = BodyStyleListSerializer
    queryset = BodyStyle.objects.filter(status=BaseModel.StatusChoices.PUBLISHED).order_by('body')
    pagination_class = None


@method_decorator(cache_page(60 * 10), name='dispatch')
class InventoryFiltersView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request, *args, **kwargs):
        requested_brand = (request.query_params.get('brand') or '').strip()
        brand_qs = Brand.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)

        if requested_brand:
            brand_qs = brand_qs.filter(name__iexact=requested_brand)

        brands = brand_qs.order_by('name')

        generations = ModelGeneration.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)
        body_styles = BodyStyle.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)
        inventory_qs = Inventory.objects.filter(status=BaseModel.StatusChoices.PUBLISHED)

        if requested_brand:
            generations = generations.filter(brand__name__iexact=requested_brand)
            inventory_qs = inventory_qs.filter(brand__name__iexact=requested_brand)

        generations = generations.order_by('model')
        body_style_ids = inventory_qs.exclude(body_style__isnull=True).values_list('body_style_id', flat=True).distinct()
        body_styles = body_styles.filter(id__in=body_style_ids).order_by('body')

        colors = (
            inventory_qs.filter(color__isnull=False)
            .exclude(color__exact='')
            .values_list('color', flat=True)
            .order_by('color')
            .distinct()
        )

        return Response({
            'brands': BrandListSerializer(brands, many=True, context={'request': request}).data,
            'models': ModelGenerationListSerializer(generations, many=True).data,
            'bodyStyles': BodyStyleListSerializer(body_styles, many=True).data,
            'colors': list(colors),
        })


class InventoryFeaturedListView(generics.ListAPIView):
    serializer_class = InventoryListSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Inventory.objects.filter(
                is_featured=True,
                status=BaseModel.StatusChoices.PUBLISHED
            )
            .select_related('brand', 'model', 'body_style')
            .order_by('-updated_at')[:10]
        )


class InventoryRelatedBrandListView(generics.ListAPIView):
    permission_classes = []
    serializer_class = InventoryListSerializer

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        inventory_id = self.kwargs.get('id')
        try:
            if slug:
                inventory = Inventory.objects.get(slug=slug)
            elif inventory_id:
                inventory = Inventory.objects.get(id=inventory_id)
            else:
                return Inventory.objects.none()
        except Inventory.DoesNotExist:
            return Inventory.objects.none()

        return Inventory.objects.filter(
            brand=inventory.brand,
            status=BaseModel.StatusChoices.PUBLISHED
        ).exclude(id=inventory.id).select_related('brand', 'model', 'body_style').order_by('-updated_at')


class StockListView(generics.ListAPIView):
    permission_classes = []
    serializer_class = StockListSerializer
    queryset = Stock.objects.filter(status=BaseModel.StatusChoices.PUBLISHED).order_by('-updated_at')[:20]
    pagination_class = None


class InventoryQuoteCreateAPI(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = InventoryQuoteCreateSerializer
    queryset = InventoryQuote.objects.all()
