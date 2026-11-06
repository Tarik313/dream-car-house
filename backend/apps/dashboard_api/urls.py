from django.urls import path
from .views import (
    AccessProbeView,
    LoginView,
    LogoutView,
    MeView,
    BrandListCreateView,
    BrandDetailView,
    BrandCascadeImpactView,
    ModelGenerationListCreateView,
    ModelGenerationDetailView,
    BodyStyleListCreateView,
    BodyStyleDetailView,
    InventoryListCreateView,
    InventoryDetailView,
    InventoryImageUploadView,
    InventoryImageDetailView,
    StockListCreateView,
    StockDetailView,
    InventoryQuoteListCreateView,
    InventoryQuoteDetailView,
    SellCarListCreateView,
    SellCarDetailView,
    SellCarImageDetailView,
    ContactMessageListCreateView,
    ContactMessageDetailView,
    SubscriberListCreateView,
    SubscriberDetailView,
    SliderListCreateView,
    SliderDetailView,
    SocialMediaListCreateView,
    SocialMediaDetailView,
    PeopleTalkListCreateView,
    PeopleTalkDetailView,
    SalesRepresentativeListCreateView,
    SalesRepresentativeDetailView,
    SEOConfigListCreateView,
    SEOConfigDetailView,
    CategoryPageSEOListCreateView,
    CategoryPageSEODetailView,
    UserListCreateView,
    UserDetailView,
    GroupListCreateView,
    GroupDetailView,
    PermissionListView,
    OverviewAggregateView,
    SiteSettingsManagementView,
    ShowroomBranchListCreateView,
    ShowroomBranchDetailView,
    PreferenceSectionManagementView,
    PreferenceCategoryListCreateView,
    PreferenceCategoryDetailView,
    ConsultationSectionManagementView,
    ExperienceSectionManagementView,
    ExperiencePillarListCreateView,
    ExperiencePillarDetailView,
    VisualChroniclesSectionManagementView,
    VisualChroniclesItemListCreateView,
    VisualChroniclesItemDetailView,
    VipSanctuarySectionManagementView,
    AboutSectionManagementView,
    ShowroomStoryListCreateView,
    ShowroomStoryDetailView,
)



app_name = "dashboard_api"

urlpatterns = [
    path("access/", AccessProbeView.as_view(), name="access"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("overview/", OverviewAggregateView.as_view(), name="overview"),

    # Brands
    path("brands/", BrandListCreateView.as_view(), name="brand_list_create"),
    path("brands/<int:pk>/", BrandDetailView.as_view(), name="brand_detail"),
    path("brands/<int:pk>/impact/", BrandCascadeImpactView.as_view(), name="brand_impact"),

    # Model Generations
    path("model-generations/", ModelGenerationListCreateView.as_view(), name="model_generation_list_create"),
    path("model-generations/<int:pk>/", ModelGenerationDetailView.as_view(), name="model_generation_detail"),

    # Body Styles
    path("body-styles/", BodyStyleListCreateView.as_view(), name="body_style_list_create"),
    path("body-styles/<int:pk>/", BodyStyleDetailView.as_view(), name="body_style_detail"),

    # Inventory
    path("inventory/", InventoryListCreateView.as_view(), name="inventory_list_create"),
    path("inventory/<int:pk>/", InventoryDetailView.as_view(), name="inventory_detail"),
    path("inventory/<int:inventory_pk>/images/", InventoryImageUploadView.as_view(), name="inventory_image_upload"),
    path("inventory/images/<int:pk>/", InventoryImageDetailView.as_view(), name="inventory_image_detail"),

    # Stocks
    path("stocks/", StockListCreateView.as_view(), name="stock_list_create"),
    path("stocks/<int:pk>/", StockDetailView.as_view(), name="stock_detail"),

    # Quotes (Customer Enquiries)
    path("quotes/", InventoryQuoteListCreateView.as_view(), name="quote_list_create"),
    path("quotes/<int:pk>/", InventoryQuoteDetailView.as_view(), name="quote_detail"),

    # SellCar Submissions
    path("sell-cars/", SellCarListCreateView.as_view(), name="sell_car_list_create"),
    path("sell-cars/<int:pk>/", SellCarDetailView.as_view(), name="sell_car_detail"),
    path("sell-cars/<int:sellcar_pk>/images/<int:image_pk>/", SellCarImageDetailView.as_view(), name="sell_car_image_detail"),

    # Customer Inbox: Contact Messages
    path("contact-messages/", ContactMessageListCreateView.as_view(), name="contact_message_list_create"),
    path("contact-messages/<int:pk>/", ContactMessageDetailView.as_view(), name="contact_message_detail"),

    # Customer Inbox: Subscribers
    path("subscribers/", SubscriberListCreateView.as_view(), name="subscriber_list_create"),
    path("subscribers/<int:pk>/", SubscriberDetailView.as_view(), name="subscriber_detail"),

    # Slider Video/Banner Configuration
    path("sliders/", SliderListCreateView.as_view(), name="slider_list_create"),
    path("sliders/<int:pk>/", SliderDetailView.as_view(), name="slider_detail"),

    # Social Media Configuration
    path("social-media/", SocialMediaListCreateView.as_view(), name="social_media_list_create"),
    path("social-media/<int:pk>/", SocialMediaDetailView.as_view(), name="social_media_detail"),

    # Social Features (PeopleTalkAboutUs)
    path("social-features/", PeopleTalkListCreateView.as_view(), name="social_features_list_create"),
    path("social-features/<int:pk>/", PeopleTalkDetailView.as_view(), name="social_features_detail"),

    # Sales Representatives
    path("sales-representatives/", SalesRepresentativeListCreateView.as_view(), name="sales_representative_list_create"),
    path("sales-representatives/<int:pk>/", SalesRepresentativeDetailView.as_view(), name="sales_representative_detail"),

    # SEO: General Pages (SEOConfig)
    path("page-seo/", SEOConfigListCreateView.as_view(), name="page_seo_list_create"),
    path("page-seo/<int:pk>/", SEOConfigDetailView.as_view(), name="page_seo_detail"),

    # SEO: Category / Listing Pages (CategoryPageSEO)
    path("category-seo/", CategoryPageSEOListCreateView.as_view(), name="category_seo_list_create"),
    path("category-seo/<int:pk>/", CategoryPageSEODetailView.as_view(), name="category_seo_detail"),

    # Users & Accounts (auth.User)
    path("users/", UserListCreateView.as_view(), name="user_list_create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),

    # Groups & Roles (auth.Group)
    path("groups/", GroupListCreateView.as_view(), name="group_list_create"),
    path("groups/<int:pk>/", GroupDetailView.as_view(), name="group_detail"),

    # Permissions Catalogue (auth.Permission)
    path("permissions/", PermissionListView.as_view(), name="permission_list"),

    # Site Settings (home.SiteSettings)
    path("site-settings/", SiteSettingsManagementView.as_view(), name="site_settings"),

    # Showroom Branches (home.ShowroomBranch)
    path("branches/", ShowroomBranchListCreateView.as_view(), name="branch_list_create"),
    path("branches/<int:pk>/", ShowroomBranchDetailView.as_view(), name="branch_detail"),

    # Homepage Preference Section (home.PreferenceSection, home.PreferenceCategory)
    path("preference-section/", PreferenceSectionManagementView.as_view(), name="preference_section"),
    path("preference-categories/", PreferenceCategoryListCreateView.as_view(), name="preference_category_list_create"),
    path("preference-categories/<int:pk>/", PreferenceCategoryDetailView.as_view(), name="preference_category_detail"),

    # Homepage Consultation Section (home.ConsultationSection)
    path("consultation/", ConsultationSectionManagementView.as_view(), name="consultation_section"),

    # Homepage Experience Section (home.ExperienceSection, home.ExperiencePillar)
    path("experience/", ExperienceSectionManagementView.as_view(), name="experience_section"),
    path("experience-pillars/", ExperiencePillarListCreateView.as_view(), name="experience_pillar_list_create"),
    path("experience-pillars/<int:pk>/", ExperiencePillarDetailView.as_view(), name="experience_pillar_detail"),

    # Homepage Visual Chronicles Section (home.VisualChroniclesSection, home.VisualChroniclesItem)
    path("visual-chronicles/", VisualChroniclesSectionManagementView.as_view(), name="visual_chronicles"),
    path("visual-chronicles/items/", VisualChroniclesItemListCreateView.as_view(), name="visual_chronicles_items"),
    path("visual-chronicles/items/<int:pk>/", VisualChroniclesItemDetailView.as_view(), name="visual_chronicles_item_detail"),

    # Homepage VIP Sanctuary Section (home.VipSanctuarySection)
    path("vip-sanctuary/", VipSanctuarySectionManagementView.as_view(), name="vip_sanctuary"),

    # About Us Page Section (home.AboutSection)
    path("about-us/", AboutSectionManagementView.as_view(), name="about_us"),

    # Showroom Stories (home.ShowroomStory)
    path("stories/", ShowroomStoryListCreateView.as_view(), name="story_list_create"),
    path("stories/<int:pk>/", ShowroomStoryDetailView.as_view(), name="story_detail"),
]






