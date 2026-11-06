from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.seo_config.models import SEOConfig, CategoryPageSEO
from apps.seo_config.serializers import SEOConfigSerializer, CategoryPageSEOSerializer


class SEOConfigListView(APIView):
    """
    GET /api/v1/site-config/seo/
    Returns all page SEO configurations.
    """
    def get(self, request, format=None):
        configs = SEOConfig.objects.all()
        serializer = SEOConfigSerializer(configs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class SEOConfigDetailView(APIView):
    """
    GET /api/v1/site-config/seo/<page>/
    Returns the SEO configuration for the given page slug.
    Returns 404 if no configuration has been saved for that page yet.
    """

    def get(self, request, page, format=None):
        try:
            seo_config = SEOConfig.objects.get(page=page)
        except SEOConfig.DoesNotExist:
            return Response(
                {'detail': f'No SEO configuration found for page "{page}".'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SEOConfigSerializer(seo_config, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryPageSEOListView(APIView):
    """
    GET /api/v1/site-config/category-seo/
    Returns all category SEO configurations.
    """
    def get(self, request, format=None):
        configs = CategoryPageSEO.objects.all()
        serializer = CategoryPageSEOSerializer(configs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryPageSEODetailView(APIView):
    """
    GET /api/v1/site-config/category-seo/<page>/
    Returns the SEO + on-page content for a car listing page
    ('cars', 'brand-new', 'pre-owned'). 404 if nothing saved yet.
    """

    def get(self, request, page, format=None):
        try:
            config = CategoryPageSEO.objects.get(page=page)
        except CategoryPageSEO.DoesNotExist:
            return Response(
                {'detail': f'No category SEO configuration found for page "{page}".'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CategoryPageSEOSerializer(config, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
