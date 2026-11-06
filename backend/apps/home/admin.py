from django.contrib import admin
from apps.home.models import (
    Slider, SocialMedia, SellCar, PeopleTalkAboutUs, SellYourCarImages, Subscriber, SalesRepresentative,
    ContactMessage, SiteSettings, ShowroomBranch,
)



@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ['heading', 'image']
    search_fields = ['heading']


@admin.register(SocialMedia)
class SocialMediaAdmin(admin.ModelAdmin):
    list_display = ['facebook', 'instagram', 'twitter', 'youtube']


class SellYourCarImagesAdminInline(admin.StackedInline):
    model = SellYourCarImages
    extra = 0


@admin.register(SellCar)
class SellCarAdmin(admin.ModelAdmin):
    inlines = [SellYourCarImagesAdminInline]
    list_display = ['name', 'phone', 'car_name', 'car_model', 'car_year', 'mileage', 'offered_price']
    search_fields = ['name', 'phone', 'car_name', 'car_model']


@admin.register(PeopleTalkAboutUs)
class PeopleTalkAboutUsAdmin(admin.ModelAdmin):
    list_display = ['title', 'url', 'is_featured', 'status']


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ['email']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'topic', 'preferred_contact', 'vehicle', 'created_at']
    list_filter = ['topic', 'preferred_contact']
    search_fields = ['name', 'phone', 'email', 'vehicle', 'message']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(SalesRepresentative)
class SalesRepresentativeAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone_number', 'status']
    search_fields = ['name', 'phone_number']
    list_filter = ['status']


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['name', 'hotline', 'phone', 'email', 'whatsapp', 'updated_at']
    search_fields = ['name', 'hotline', 'phone', 'email']


@admin.register(ShowroomBranch)
class ShowroomBranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'branch_id', 'phone', 'order', 'status', 'updated_at']
    list_filter = ['status']
    search_fields = ['name', 'branch_id', 'address', 'phone']
    list_editable = ['order', 'status']


from apps.home.models import AboutSection

@admin.register(AboutSection)
class AboutSectionAdmin(admin.ModelAdmin):
    list_display = ['hero_title', 'hero_badge', 'is_active', 'updated_at']
    list_editable = ['is_active']



from apps.home.models import ShowroomStory

@admin.register(ShowroomStory)
class ShowroomStoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'brand', 'media_type', 'order', 'is_active', 'updated_at']
    list_filter = ['media_type', 'is_active', 'brand']
    search_fields = ['title', 'tag', 'subtitle', 'brand']
    list_editable = ['order', 'is_active']
