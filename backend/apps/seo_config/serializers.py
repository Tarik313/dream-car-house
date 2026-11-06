from rest_framework import serializers
from apps.seo_config.models import SEOConfig, CategoryPageSEO
from core.mixins.image_optimization_mixins import OptimizedImageSerializerMixin


class SEOConfigSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    og_image = serializers.SerializerMethodField()
    twitter_image = serializers.SerializerMethodField()
    feature_image = serializers.SerializerMethodField()

    class Meta:
        model = SEOConfig
        fields = [
            'page',
            'visibility',
            'target_keyword',
            'feature_image',
            'feature_image_alt',
            'meta_title',
            'meta_description',
            'meta_keywords',
            'robots',
            'canonical_url',
            'og_title',
            'og_description',
            'og_image',
            'og_type',
            'og_site_name',
            'twitter_card',
            'twitter_title',
            'twitter_description',
            'twitter_image',
            'schema_json',
            'updated_at',
        ]

    def get_feature_image(self, obj):
        return self.get_optimized_image_url(obj, 'feature_image')

    def get_og_image(self, obj):
        return self.get_optimized_image_url(obj, 'og_image')

    def get_twitter_image(self, obj):
        return self.get_optimized_image_url(obj, 'twitter_image')


class CategoryPageSEOSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    feature_image = serializers.SerializerMethodField()

    class Meta:
        model = CategoryPageSEO
        fields = [
            'page',
            'category_name',
            'visibility',
            'feature_image',
            'feature_image_alt',
            'target_keyword',
            'meta_title',
            'meta_description',
            'canonical_url',
            'robots',
            'schema_json',
            'h1_title',
            'short_description',
            'long_description',
            'updated_at',
        ]

    def get_feature_image(self, obj):
        return self.get_optimized_image_url(obj, 'feature_image')
