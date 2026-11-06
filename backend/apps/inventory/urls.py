from django.urls import path

from apps.inventory.views import (
    InventoryListView, InventoryDetailView, InventoryDetailByIdView,
    BrandListView, BrandSEODetailView, ModelGenerationListView, BodyStyleListView,
    InventoryFeaturedListView, InventoryRelatedBrandListView, StockListView, InventoryQuoteCreateAPI,
    InventoryFiltersView,
)

app_name = 'inventory'


urlpatterns = [
    path('', InventoryListView.as_view(), name='inventory_list'),
    path('brands/', BrandListView.as_view(), name='brand_list'),
    path('brands/<int:brand_id>/seo/', BrandSEODetailView.as_view(), name='brand_seo_detail'),
    path('brands/<slug:slug>/seo/', BrandSEODetailView.as_view(), name='brand_seo_detail_slug'),
    path('generations/', ModelGenerationListView.as_view(), name='generation_list'),
    path('body-style/', BodyStyleListView.as_view(), name='body_style_list'),
    path('filters/', InventoryFiltersView.as_view(), name='inventory_filters'),

    # New slug-based detail URL
    path('detail/<slug:slug>/', InventoryDetailView.as_view(), name='inventory_detail_slug'),
    path('detail/<slug:slug>/related/', InventoryRelatedBrandListView.as_view(), name='inventory_related_slug'),

    # Legacy ID-based URLs — now redirect 301 to slug-based
    path('detail/<int:id>/', InventoryDetailByIdView.as_view(), name='inventory_detail_id'),
    path('detail/<int:id>/related/', InventoryRelatedBrandListView.as_view(), name='inventory_related'),

    path('featured/', InventoryFeaturedListView.as_view(), name='inventory_featured_list'),
    path('stocks/', StockListView.as_view(), name='inventory_stocks'),
    path('quote/', InventoryQuoteCreateAPI.as_view(), name='inventory_quote'),
    path('quote', InventoryQuoteCreateAPI.as_view(), name='inventory_quote_noslash'),
]
