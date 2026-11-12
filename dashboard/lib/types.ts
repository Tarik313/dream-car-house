export type DashboardUser = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  permissions: string[];
};

export type DashboardAccess =
  | { allowed: true; user: DashboardUser; csrfToken?: string }
  | { allowed: false; reason: "UNAUTHENTICATED" | "FORBIDDEN" | "AUTH_UNAVAILABLE" };

export type BrandItem = {
  id: number;
  name: string;
  slug?: string;
  segment: string;
  image: string;
  logo_alt?: string;
  order: number;
  is_in_runway: boolean;
  destination_url?: string;
  listing_footer_text: string;
  status: string;
  target_keyword: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string;
  schema_json: Record<string, unknown> | null;
  h1_title: string | null;
  short_description: string | null;
  long_description: string | null;
  feature_image: string | null;
  feature_image_alt: string | null;
  seo_updated_at: string;
};

export type BrandCascadeImpact = {
  brand_id: number;
  brand_name: string;
  inventory_count: number;
  model_generation_count: number;
  has_cascades: boolean;
  blocked?: boolean;
  block_reason?: string | null;
};

export type ModelGenerationItem = {
  id: number;
  brand: number;
  brand_name: string;
  model: string;
  status: string;
};

export type BodyStyleItem = {
  id: number;
  body: string;
  status: string;
};

export type InventoryGalleryImage = {
  id: number;
  inventory: number;
  image: string;
  caption: string | null;
  alt_text: string;
  tag?: string;
  order: number;
};

export type InventoryListItem = {
  id: number;
  name: string;
  car_type: string | null;
  brand: number;
  brand_name: string;
  model: number | null;
  model_generation_name: string;
  model_name: string;
  branch?: number | null;
  branch_name?: string | null;
  year: number | null;
  price: string | null;
  is_call_for_price?: boolean;
  registration_number?: string;
  fuel_type: string;
  transmission: string;
  registered: string;
  status: string;
  is_featured: boolean;
  feature_image: string | null;
  slug: string;
  indexing: string;
  created_at: string;
  updated_at: string;
};

export type InventoryDetailItem = InventoryListItem & {
  condition: string;
  body_style: number | null;
  body_style_name: string;
  branch_detail?: {
    id: number;
    branch_id: string;
    name: string;
    short_name: string;
    address: string;
    phone: string;
    hotline: string;
    hours: string;
    map_link: string;
  } | null;
  inventory_type: string;
  engine_capacity: string | null;
  drive_type: string | null;
  wheel_base: string | null;
  mileage: string | null;
  color: string | null;
  slightly_negotiable: string;
  youtube: string | null;
  inventory_images: InventoryGalleryImage[];
  description: string | null;
  h1_title: string;
  target_keyword: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  featured_image_alt: string;
  redirect_url: string | null;
  previous_slug: string;
  schema_override: Record<string, unknown> | null;
};

export type StockItem = {
  id: number;
  title: string | null;
  image: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type InventoryQuoteItem = {
  id: number;
  car: number | null;
  car_name: string | null;
  car_slug: string | null;
  car_price: string | null;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type SellYourCarImageItem = {
  id: number;
  sellcar: number;
  image: string;
};

export type SellCarItem = {
  id: number;
  name: string;
  phone: string;
  car_name: string;
  car_model: string;
  car_year: string;
  mileage: number;
  offered_price: number | null;
  inventory_images: SellYourCarImageItem[];
};

export type ContactMessageItem = {
  id: number;
  topic: string;
  topic_display: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  message: string;
  preferred_contact: string;
  preferred_contact_display: string;
  created_at: string;
  updated_at: string;
};

export type SubscriberItem = {
  id: number;
  email: string;
};

export type HeroCtaButton = {
  label: string;
  action: "link" | "appointment_modal";
  destination: string;
};

export type SliderItem = {
  id: number;
  heading: string;
  poster?: string;
  video_provider?: "youtube" | "vimeo" | "direct";
  video_source?: string;
  video_start_time?: number;
  video_title?: string;
  cta_buttons?: HeroCtaButton[];
  scroll_link_label?: string;
  scroll_link_target?: string;
  is_published?: boolean;
  image?: string | null;
  is_public_active: boolean;
  created_at?: string;
  updated_at?: string;
};


export type SocialMediaItem = {
  id: number;
  facebook: string;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  is_public_active: boolean;
};

export type PeopleTalkItem = {
  id: number;
  title: string;
  image: string;
  url: string | null;
  is_featured: boolean;
  status: "PUBLISHED" | "DRAFT";
  created_at: string;
  updated_at: string;
};

export type SalesRepresentativeItem = {
  id: number;
  name: string;
  phone_number: string;
  status: "PUBLISHED" | "DRAFT";
  created_at: string;
  updated_at: string;
};

export type SEOConfigItem = {
  id: number;
  page: string;
  page_display: string;
  visibility: "PUBLISHED" | "HIDDEN";
  target_keyword: string | null;
  feature_image: string | null;
  feature_image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  robots: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_type: string | null;
  og_site_name: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  schema_json: Record<string, unknown> | null;
  updated_at: string;
};

export type CategoryPageSEOItem = {
  id: number;
  page: string;
  page_display: string;
  category_name: string | null;
  visibility: "PUBLISHED" | "HIDDEN";
  target_keyword: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string;
  feature_image: string | null;
  feature_image_alt: string | null;
  schema_json: Record<string, unknown> | null;
  h1_title: string | null;
  short_description: string | null;
  long_description: string | null;
  updated_at: string;
};

export type PermissionItem = {
  id: number;
  name: string;
  codename: string;
  app_label: string;
};

export type GroupItem = {
  id: number;
  name: string;
  user_count: number;
  permission_ids: number[];
  permissions_details: PermissionItem[];
};

export type UserListItem = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  groups: string[];
  last_login: string | null;
  date_joined: string;
};

export type UserDetailItem = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  group_ids: number[];
  groups_details: { id: number; name: string }[];
  permission_ids: number[];
  user_permissions_details: PermissionItem[];
  last_login: string | null;
  date_joined: string;
};

export type OverviewMetrics = {
  inventory?: {
    total: number;
    available: number;
    sold: number;
    booked: number;
    pre_order: number;
  };
  stocks?: {
    total: number;
    published: number;
    unpublished: number;
  };
  quotes?: {
    total: number;
  };
  sell_cars?: {
    total: number;
  };
  contact_messages?: {
    total: number;
    buying: number;
    selling: number;
    after_sales: number;
    other: number;
  };
  subscribers?: {
    total: number;
  };
  users?: {
    total: number;
    active: number;
    staff: number;
    superuser: number;
  };
  groups?: {
    total: number;
  };
};

export type OverviewRecentSubmissions = {
  quotes?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    car_name: string | null;
    created_at: string | null;
  }[];
  sell_cars?: {
    id: number;
    name: string;
    phone: string;
    car_name: string;
    car_model: string;
    car_year: string;
    offered_price: number | null;
    mileage: number;
  }[];
  contact_messages?: {
    id: number;
    name: string;
    topic: string;
    topic_display: string;
    phone: string;
    email: string;
    vehicle: string;
    created_at: string | null;
  }[];
};

export type OverviewData = {
  metrics: OverviewMetrics;
  recent_submissions: OverviewRecentSubmissions;
};

export type PaginatedList<T> = {
  results: T[];
  total_rows: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

export type SiteSettingsItem = {
  id: number;
  name: string;
  tagline: string;
  logo_text: string;
  logo_asset: string;
  logo?: string | null;
  logo_light?: string | null;
  favicon?: string | null;
  hotline: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  primary_address: string;
  footer_tagline: string;
  footer_copy_text: string;
  opening_hours_text: string;
  social_media: number | null;
  created_at: string;
  updated_at: string;
};

export type ShowroomBranchItem = {
  id: number;
  branch_id: string;
  name: string;
  short_name: string;
  tag: string;
  address: string;
  phone: string;
  hotline: string;
  email: string;
  hours: string;
  map_link: string;
  embed_map: string;
  order: number;
  status: "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED" | string;
  created_at: string;
  updated_at: string;
};

export type PreferenceHighlightItem = {
  title: string;
  description: string;
};

export type PreferenceCategoryItem = {
  id: number;
  section: number | null;
  category_key: "BRAND_NEW" | "PRE_OWNED" | string;
  label: string;
  badge?: string;
  subtext?: string;
  image?: string | null;
  image_url?: string | null;
  cta_text: string;
  cta_url: string;
  highlights: PreferenceHighlightItem[];
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PreferenceSectionItem = {
  id: number;
  heading: string;
  badge: string;
  subtext: string;
  is_active: boolean;
  categories: PreferenceCategoryItem[];
  created_at?: string;
  updated_at?: string;
};

export type ConsultationTrustPill = {
  title: string;
  icon: string;
};

export type ConsultationSectionItem = {
  id: number;
  tag: string;
  heading: string;
  description: string;
  trust_pills: ConsultationTrustPill[];
  primary_cta_label: string;
  primary_cta_action: "appointment_modal" | "internal_link" | "external_link" | string;
  primary_cta_url: string;
  whatsapp_cta_label: string;
  representative: number | null;
  whatsapp_number: string;
  whatsapp_message: string;
  status_beacon_text: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ExperiencePillarItem = {
  id: number;
  section: number | null;
  pillar_number: string;
  badge: string;
  title: string;
  description: string;
  image?: string | null;
  image_url?: string | null;
  tags: string[];
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ExperienceSectionItem = {
  id: number;
  title: string;
  subtitle: string;
  video_cta_label: string;
  video_target: string;
  is_active: boolean;
  pillars: ExperiencePillarItem[];
  created_at?: string;
  updated_at?: string;
};

export type VisualChroniclesSpec = {
  label: string;
  value: string;
};

export type VisualChroniclesItemData = {
  id: number;
  section: number | null;
  card_type: "hero" | "portrait" | "tri" | string;
  order: number;
  front_image?: string | null;
  front_image_url?: string | null;
  front_alt?: string;
  front_badge: string;
  back_pill: string;
  back_number: string;
  title: string;
  description: string;
  specs: VisualChroniclesSpec[];
  cta_label: string;
  cta_url: string;
  is_active: boolean;
};

export type VisualChroniclesSectionItem = {
  id: number;
  heading: string;
  subtitle: string;
  stats_number: string;
  stats_label: string;
  archive_tag: string;
  archive_description: string;
  archive_cta_label: string;
  archive_cta_url: string;
  is_active: boolean;
  items: VisualChroniclesItemData[];
};

export type VipSanctuaryPillarData = {
  title: string;
  subtitle: string;
  icon: string;
};

export type VipSanctuarySectionItem = {
  id: number;
  background_image?: string | null;
  background_image_url?: string | null;
  eyebrow: string;
  title: string;
  description: string;
  value_pillars: VipSanctuaryPillarData[];
  primary_cta_label: string;
  primary_cta_action: "appointment_modal" | "link" | string;
  primary_cta_url?: string | null;
  secondary_cta_label: string;
  secondary_cta_url: string;
  card_badge: string;
  card_title: string;
  card_live_pill: string;
  branch?: number | null;
  location_text?: string;
  hours_text?: string;
  phone_text?: string;
  whatsapp_cta_label: string;
  whatsapp_url: string;
  tour_cta_label: string;
  tour_video_target: string;
  is_active: boolean;
};

export type AboutStatItem = {
  number: string;
  label: string;
};

export type AboutPillarItem = {
  title: string;
  description: string;
  icon?: string;
};

export type AboutSectionItem = {
  id: number;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  stats: AboutStatItem[];
  story_eyebrow: string;
  story_title: string;
  story_content_p1: string;
  story_content_p2: string;
  quote_text: string;
  quote_author: string;
  reel_image: string | null;
  reel_image_url: string;
  reel_image_display: string | null;
  reel_title: string;
  reel_duration: string;
  reel_video_target: string;
  tour_cta_label: string;
  tour_video_target: string;
  pillars_eyebrow: string;
  pillars_title: string;
  pillars: AboutPillarItem[];
  cta_title: string;
  cta_description: string;
  cta_primary_label: string;
  cta_secondary_label: string;
  cta_whatsapp_label: string;
  is_active: boolean;
  updated_at: string;
};




export type ShowroomStoryItem = {
  id: number;
  title: string;
  tag: string;
  subtitle: string;
  price_note: string;
  media_type: "image" | "video";
  media_file: string | null;
  media_url: string;
  resolved_media_url?: string;
  cta_text: string;
  cta_link: string;
  whatsapp_message: string;
  brand: string;
  accent_color: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};
