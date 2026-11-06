from django.urls import path
from apps.seo_config.views import (
    SEOConfigListView,
    SEOConfigDetailView,
    CategoryPageSEOListView,
    CategoryPageSEODetailView,
)

app_name = 'seo_config'

urlpatterns = [
    path('seo/', SEOConfigListView.as_view(), name='seo_config_list'),
    path('seo/<str:page>/', SEOConfigDetailView.as_view(), name='seo_config_detail'),
    path('category-seo/', CategoryPageSEOListView.as_view(), name='category_seo_list'),
    path('category-seo/<str:page>/', CategoryPageSEODetailView.as_view(), name='category_seo_detail'),
]
