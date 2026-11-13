import re

import bleach
from rest_framework import serializers

from core.mixins.image_optimization_mixins import OptimizedImageSerializerMixin
from core.utils.media import build_media_url

from apps.home.models import (
    Slider, SocialMedia, SellCar, PeopleTalkAboutUs, SellYourCarImages, Subscriber, SalesRepresentative,
    ContactMessage, SiteSettings, ShowroomBranch, PreferenceSection, PreferenceCategory,
    ConsultationSection, ExperienceSection, ExperiencePillar,
    VisualChroniclesSection, VisualChroniclesItem, VipSanctuarySection,
)



class SliderSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Slider
        fields = [
            'id',
            'heading',
            'poster',
            'video_provider',
            'video_source',
            'video_start_time',
            'video_title',
            'cta_buttons',
            'scroll_link_label',
            'scroll_link_target',
            'image',
            'is_published',
            'updated_at',
        ]

    def get_image(self, obj):
        return self.get_optimized_image_url(obj, 'image')



class SocialMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMedia
        fields = ['facebook', 'instagram', 'twitter', 'youtube']


class SellYourCarImageSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = SellYourCarImages
        fields = ['id', 'image']

    def get_image(self, obj):
        return self.get_optimized_image_url(obj, 'image')


class SellCarSerializer(serializers.ModelSerializer):

    class Meta:
        model = SellCar
        fields = '__all__'

    def validate_name(self, value):
        # Sanitize to prevent XSS
        return bleach.clean(value, tags=[], strip=True)


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = '__all__'

    def validate_name(self, value):
        # Sanitize to prevent XSS
        return bleach.clean(value, tags=[], strip=True)


class PeopleTalkAboutUsSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PeopleTalkAboutUs
        fields = [
            'id', 'title', 'image', 'url', 'is_featured', 'status'
        ]

    def get_image(self, obj):
        return self.get_optimized_image_url(obj, 'image')


class ContactMessageSerializer(serializers.ModelSerializer):
    PHONE_RE = re.compile(r'^[+0-9\s-]{8,20}$')

    # Exposed as `enquiry`, not `message`: apis.renderers.DefaultRenderer treats a
    # top-level `message` key as the response message, which would swallow the
    # other field errors and flatten the success payload.
    enquiry = serializers.CharField(source='message', max_length=3000, allow_blank=True)

    class Meta:
        model = ContactMessage
        fields = ['topic', 'name', 'phone', 'email', 'vehicle', 'enquiry', 'preferred_contact']
        # Blank values are rejected by the validate_* methods below with the
        # same wording the frontend form uses, rather than DRF's generic text.
        extra_kwargs = {'name': {'allow_blank': True}, 'phone': {'allow_blank': True}}

    def _clean(self, value):
        if not value:
            return ""
        return bleach.clean(value, tags=[], strip=True).strip()

    def validate_name(self, value):
        value = self._clean(value)
        if not value or len(value) < 2:
            raise serializers.ValidationError('Please enter your name (minimum 2 characters).')
        if len(value) > 100:
            raise serializers.ValidationError('Name must be 100 characters or fewer.')
        return value

    def validate_email(self, value):
        if not value:
            return ""
        val = value.strip()
        if val:
            from django.core.validators import validate_email as django_validate_email
            from django.core.exceptions import ValidationError as DjangoValidationError
            try:
                django_validate_email(val)
            except DjangoValidationError:
                raise serializers.ValidationError('Please enter a valid email address.')
        return val

    def validate_phone(self, value):
        val = value.strip() if value else ""
        if not val or not self.PHONE_RE.match(val):
            raise serializers.ValidationError('Please enter a valid phone number (at least 8 digits with country code or local format).')
        digits = re.sub(r'[^0-9]', '', val)
        if len(digits) < 7:
            raise serializers.ValidationError('Please enter a valid phone number with at least 7 digits.')
        return val

    def validate_vehicle(self, value):
        return self._clean(value)[:150]

    def validate_enquiry(self, value):
        value = self._clean(value)
        if not value:
            raise serializers.ValidationError('Tell us a little about your enquiry.')
        if len(value) > 3000:
            raise serializers.ValidationError('Enquiry must be 3000 characters or fewer.')
        return value

    def validate(self, attrs):
        preferred = attrs.get('preferred_contact')
        if preferred == ContactMessage.PreferredContactChoices.EMAIL and not attrs.get('email'):
            raise serializers.ValidationError({'email': 'Add an email so we can reply.'})
        return attrs


class SalesRepresentativeListSearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = SalesRepresentative
        fields = [
            'name',
            'phone_number'
        ]


class PublicSiteSettingsSerializer(serializers.ModelSerializer):
    social_media = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = [
            'name',
            'tagline',
            'logo_text',
            'logo_asset',
            'logo',
            'logo_light',
            'logo_icon',
            'logo_icon_light',
            'favicon',
            'hotline',
            'phone',
            'email',
            'whatsapp',
            'website',
            'primary_address',
            'footer_tagline',
            'footer_copy_text',
            'opening_hours_text',
            'social_media',
        ]

    def get_social_media(self, obj):
        sm = obj.social_media or SocialMedia.objects.order_by('id').last()
        if sm:
            return SocialMediaSerializer(sm, context=self.context).data
        return None

    def to_representation(self, instance):
        from core.utils.media import normalize_media_fields
        ret = super().to_representation(instance)
        return normalize_media_fields(ret, ('logo', 'logo_light', 'logo_icon', 'logo_icon_light', 'favicon'))


class PublicShowroomBranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShowroomBranch
        fields = [
            'id',
            'branch_id',
            'name',
            'short_name',
            'tag',
            'address',
            'phone',
            'hotline',
            'email',
            'hours',
            'map_link',
            'embed_map',
            'order',
        ]


class PublicPreferenceCategorySerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PreferenceCategory
        fields = [
            'id',
            'category_key',
            'label',
            'badge',
            'subtext',
            'image',
            'cta_text',
            'cta_url',
            'highlights',
            'order',
        ]

    def get_image(self, obj):
        return self.get_optimized_image_url(obj, 'image')


class PublicPreferenceSectionSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = PreferenceSection
        fields = [
            'heading',
            'badge',
            'subtext',
            'categories',
        ]

    def get_categories(self, obj):
        cats = obj.categories.filter(is_active=True).order_by('order', 'id')
        return PublicPreferenceCategorySerializer(cats, many=True, context=self.context).data


class PublicConsultationSectionSerializer(serializers.ModelSerializer):
    whatsapp_url = serializers.SerializerMethodField()

    class Meta:
        model = ConsultationSection
        fields = [
            'tag',
            'heading',
            'description',
            'trust_pills',
            'primary_cta_label',
            'primary_cta_action',
            'primary_cta_url',
            'whatsapp_cta_label',
            'whatsapp_url',
            'status_beacon_text',
        ]

    def get_whatsapp_url(self, obj):
        import urllib.parse
        phone = ""
        if obj.whatsapp_number and obj.whatsapp_number.strip():
            phone = obj.whatsapp_number.strip()
        elif obj.representative and obj.representative.status == "PUBLISHED" and obj.representative.phone_number:
            phone = obj.representative.phone_number.strip()
        else:
            site_settings = SiteSettings.objects.first()
            if site_settings and site_settings.whatsapp:
                phone = site_settings.whatsapp.strip()
            elif site_settings and site_settings.hotline:
                phone = site_settings.hotline.strip()
            else:
                phone = ""

        clean_digits = re.sub(r'[^0-9]', '', phone)
        if not clean_digits:
            return ""
        if clean_digits.startswith("0"):
            clean_digits = "88" + clean_digits
        elif not clean_digits.startswith("880") and len(clean_digits) == 10:
            clean_digits = "880" + clean_digits

        msg = obj.whatsapp_message or "Hello Dream Car House, I would like to consult regarding a luxury vehicle."
        encoded_msg = urllib.parse.quote(msg)
        return f"https://wa.me/{clean_digits}?text={encoded_msg}"


class PublicExperiencePillarSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ExperiencePillar
        fields = [
            'id',
            'pillar_number',
            'badge',
            'title',
            'description',
            'image',
            'tags',
            'order',
        ]

    def get_image(self, obj):
        if not obj.image:
            return None
        val = str(obj.image)
        if val.startswith("http://") or val.startswith("https://"):
            return val
        return self.get_optimized_image_url(obj, 'image')


class PublicExperienceSectionSerializer(serializers.ModelSerializer):
    pillars = serializers.SerializerMethodField()

    class Meta:
        model = ExperienceSection
        fields = [
            'title',
            'subtitle',
            'video_cta_label',
            'video_target',
            'pillars',
        ]

    def get_pillars(self, obj):
        pillars = obj.pillars.filter(is_active=True).order_by('order', 'id')
        return PublicExperiencePillarSerializer(pillars, many=True, context=self.context).data


class PublicVisualChroniclesItemSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    image = serializers.SerializerMethodField()

    class Meta:
        model = VisualChroniclesItem
        fields = [
            'id',
            'card_type',
            'order',
            'image',
            'front_alt',
            'front_badge',
            'back_pill',
            'back_number',
            'title',
            'description',
            'specs',
            'cta_label',
            'cta_url',
        ]

    def get_image(self, obj):
        if obj.front_image:
            return self.get_optimized_image_url(obj, 'front_image')
        return obj.front_image_url or None


class PublicVisualChroniclesSectionSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = VisualChroniclesSection
        fields = [
            'heading',
            'subtitle',
            'stats_number',
            'stats_label',
            'archive_tag',
            'archive_description',
            'archive_cta_label',
            'archive_cta_url',
            'items',
        ]

    def get_items(self, obj):
        items = obj.items.filter(is_active=True).order_by('order', 'id')
        return PublicVisualChroniclesItemSerializer(items, many=True, context=self.context).data


class PublicVipSanctuarySectionSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    background_image = serializers.SerializerMethodField()
    location_text = serializers.SerializerMethodField()
    hours_text = serializers.SerializerMethodField()
    phone_text = serializers.SerializerMethodField()
    card_title = serializers.SerializerMethodField()
    card_badge = serializers.SerializerMethodField()
    whatsapp_url = serializers.SerializerMethodField()

    class Meta:
        model = VipSanctuarySection
        fields = [
            'background_image',
            'eyebrow',
            'title',
            'description',
            'value_pillars',
            'primary_cta_label',
            'primary_cta_action',
            'primary_cta_url',
            'secondary_cta_label',
            'secondary_cta_url',
            'card_badge',
            'card_title',
            'card_live_pill',
            'location_text',
            'hours_text',
            'phone_text',
            'whatsapp_cta_label',
            'whatsapp_url',
            'tour_cta_label',
            'tour_video_target',
        ]

    def get_background_image(self, obj):
        if obj.background_image:
            return self.get_optimized_image_url(obj, 'background_image')
        return obj.background_image_url or None

    def get_location_text(self, obj):
        if obj.branch and obj.branch.address:
            return obj.branch.address
        if obj.location_text and obj.location_text.strip():
            return obj.location_text.strip()
        return None

    def get_hours_text(self, obj):
        if obj.branch and obj.branch.hours:
            return obj.branch.hours
        if obj.hours_text and obj.hours_text.strip():
            return obj.hours_text.strip()
        return None

    def get_phone_text(self, obj):
        if obj.branch and obj.branch.hotline:
            return obj.branch.hotline
        if obj.phone_text and obj.phone_text.strip():
            return obj.phone_text.strip()
        site_settings = SiteSettings.objects.first()
        if site_settings and site_settings.hotline:
            return site_settings.hotline
        return None

    def get_card_title(self, obj):
        if obj.card_title and obj.card_title.strip() and obj.card_title.strip() != "DREAM CAR HOUSE Flagship":
            return obj.card_title.strip()
        if obj.branch and obj.branch.name:
            return obj.branch.name
        return obj.card_title or "DREAM CAR HOUSE Flagship"

    def get_card_badge(self, obj):
        if obj.card_badge and obj.card_badge.strip() and obj.card_badge.strip() != "FLAGSHIP SHOWROOM":
            return obj.card_badge.strip()
        if obj.branch and obj.branch.tag:
            return obj.branch.tag
        return obj.card_badge or "FLAGSHIP SHOWROOM"

    def get_whatsapp_url(self, obj):
        if obj.whatsapp_url and obj.whatsapp_url.strip() and "8801615121312" not in obj.whatsapp_url:
            return obj.whatsapp_url.strip()
        phone = ""
        if obj.branch and obj.branch.hotline:
            phone = obj.branch.hotline
        elif obj.phone_text and obj.phone_text.strip():
            phone = obj.phone_text.strip()
        else:
            site_settings = SiteSettings.objects.first()
            if site_settings and (site_settings.whatsapp or site_settings.hotline):
                phone = site_settings.whatsapp or site_settings.hotline

        clean_digits = re.sub(r'[^0-9]', '', phone or '')
        if clean_digits:
            if clean_digits.startswith("0"):
                clean_digits = "88" + clean_digits
            elif not clean_digits.startswith("880") and len(clean_digits) == 10:
                clean_digits = "880" + clean_digits
            return f"https://wa.me/{clean_digits}?text=Hello%20DREAM%20CAR%20HOUSE,%20I%20would%20like%20to%20inquire%20about%20a%20luxury%20vehicle"
        return ""


from apps.home.models.about_model import AboutSection

class PublicAboutSectionSerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    reel_image = serializers.SerializerMethodField()

    class Meta:
        model = AboutSection
        fields = [
            'id',
            'hero_badge',
            'hero_title',
            'hero_subtitle',
            'stats',
            'story_eyebrow',
            'story_title',
            'story_content_p1',
            'story_content_p2',
            'quote_text',
            'quote_author',
            'reel_image',
            'reel_image_url',
            'reel_title',
            'reel_duration',
            'reel_video_target',
            'tour_cta_label',
            'tour_video_target',
            'pillars_eyebrow',
            'pillars_title',
            'pillars',
            'cta_title',
            'cta_description',
            'cta_primary_label',
            'cta_secondary_label',
            'cta_whatsapp_label',
            'updated_at',
        ]

    def get_reel_image(self, obj):
        if obj.reel_image:
            return self.get_optimized_image_url(obj, 'reel_image')
        return obj.reel_image_url or None





from apps.home.models.showroom_story_model import ShowroomStory

class PublicShowroomStorySerializer(serializers.ModelSerializer, OptimizedImageSerializerMixin):
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = ShowroomStory
        fields = [
            'id',
            'title',
            'tag',
            'subtitle',
            'price_note',
            'media_type',
            'media_url',
            'cta_text',
            'cta_link',
            'whatsapp_message',
            'brand',
            'accent_color',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]

    def get_media_url(self, obj):
        if obj.media_file:
            return build_media_url(obj.media_file.url)
        return obj.media_url or ""
