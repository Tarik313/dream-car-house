from django.urls import path

from apps.home.views import (
    SliderAPIView, SocialMediaAPIView, SellCarCreateAPIView, PeopleTalkListAPIView, SubscriberAPIView,
    SalesRepresentativeListAPI, ContactMessageCreateAPIView, PublicSiteSettingsAPIView,
    PublicShowroomBranchListAPIView, PublicPreferenceSectionAPIView,
    PublicConsultationSectionAPIView, PublicExperienceSectionAPIView,
    PublicVisualChroniclesSectionAPIView, PublicVipSanctuarySectionAPIView,
    PublicAboutSectionAPIView, PublicShowroomStoryListAPIView,
)

app_name = 'home'


urlpatterns = [
    path('slider/', SliderAPIView.as_view(), name='slider'),
    path('sm/', SocialMediaAPIView.as_view(), name='sm'),
    path('sell-car/', SellCarCreateAPIView.as_view(), name='sell_car'),
    path('sell-car', SellCarCreateAPIView.as_view(), name='sell_car_noslash'),
    path('contact/', ContactMessageCreateAPIView.as_view(), name='contact'),
    path('contact', ContactMessageCreateAPIView.as_view(), name='contact_noslash'),
    path('subscribers/', SubscriberAPIView.as_view(), name='subscribers'),
    path('subscribers', SubscriberAPIView.as_view(), name='subscribers_noslash'),
    path('people-talk/', PeopleTalkListAPIView.as_view(), name='people_talk'),
    path('sales-representative/', SalesRepresentativeListAPI.as_view(), name='sales_representative'),
    path('site-settings/', PublicSiteSettingsAPIView.as_view(), name='site_settings'),
    path('branches/', PublicShowroomBranchListAPIView.as_view(), name='branches'),
    path('preference-section/', PublicPreferenceSectionAPIView.as_view(), name='preference_section'),
    path('consultation/', PublicConsultationSectionAPIView.as_view(), name='consultation_section'),
    path('experience/', PublicExperienceSectionAPIView.as_view(), name='experience_section'),
    path('visual-chronicles/', PublicVisualChroniclesSectionAPIView.as_view(), name='visual_chronicles'),
    path('vip-sanctuary/', PublicVipSanctuarySectionAPIView.as_view(), name='vip_sanctuary'),
    path('about/', PublicAboutSectionAPIView.as_view(), name='about_section'),
    path('stories/', PublicShowroomStoryListAPIView.as_view(), name='stories'),
]
