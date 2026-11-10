export interface PublicSocialMedia {
  id?: number;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
}

export interface PublicSiteSettings {
  id: number;
  name: string;
  tagline: string;
  logo_text: string;
  logo_asset: string;
  logo?: string | null;
  logo_light?: string | null;
  hotline: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  primary_address: string;
  footer_tagline: string;
  footer_copy_text: string;
  opening_hours_text: string;
  social_media?: PublicSocialMedia | null;
}

export interface PublicShowroomBranch {
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
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | string;
  features?: string[];
}

export interface PublicHeroCta {
  label: string;
  action: "link" | "appointment_modal";
  destination: string;
}

export interface PublicHeroSlider {
  id: number | null;
  heading: string;
  poster: string;
  video_provider: "youtube" | "vimeo" | "direct";
  video_source: string;
  video_start_time: number;
  video_title: string;
  cta_buttons: PublicHeroCta[];
  scroll_link_label: string;
  scroll_link_target: string;
  image?: string | null;
  is_published: boolean;
}

export interface PublicVehicleImage {
  id?: number;
  url: string;
  caption: string;
  tag?: string;
  order?: number;
}

export interface PublicVehicle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  car_type: "BRAND_NEW" | "PRE_OWNED";
  fuel_type: string;
  engine_capacity: string;
  mileage: string;
  price: string;
  raw_price?: string | null;
  is_call_for_price?: boolean;
  registered: string;
  branch_id: string;
  branch_name: string;
  branch_address: string;
  branch?: PublicShowroomBranch | null;
  image: string;
  images: PublicVehicleImage[];
  description: string;
  slug: string;
  drivetrain?: string;
  registration_number?: string;
  is_featured?: boolean;
  transmission?: string;
  color?: string;
  wheel_base?: string;
  condition?: string;
  body_style?: string;
  youtube?: string;
  slightly_negotiable?: string;
  h1_title?: string;
  target_keyword?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  featured_image_alt?: string;
  indexing?: string;
  schema_data?: Record<string, unknown>;
  previous_slug?: string;
  status?: string;
}

export interface PublicInventoryFilterOptions {
  brands: { id: number; name: string }[];
  models: { id: number; model: string; brand: number }[];
  bodyStyles: { id: number; body: string }[];
  colors: string[];
}

export interface PublicPreferenceHighlight {
  title: string;
  description: string;
}

export interface PublicPreferenceCategory {
  id: number;
  category_key: "BRAND_NEW" | "PRE_OWNED" | string;
  label: string;
  badge?: string | null;
  subtext?: string | null;
  image?: string | null;
  cta_text: string;
  cta_url: string;
  highlights: PublicPreferenceHighlight[];
  order: number;
}

export interface PublicPreferenceSection {
  heading: string;
  badge?: string | null;
  subtext?: string | null;
  categories: PublicPreferenceCategory[];
}

export interface PublicBrand {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  car_names?: string[];
  starting_price?: number | null;
  segment?: string;
  listing_footer_text?: string;
  logo_alt?: string;
  order?: number;
  is_in_runway?: boolean;
  destination_url?: string;
}

export interface PublicTrustPill {
  title: string;
  icon: string;
}

export interface PublicConsultationSection {
  tag?: string | null;
  heading: string;
  description: string;
  trust_pills: PublicTrustPill[];
  primary_cta_label: string;
  primary_cta_action: "appointment_modal" | "internal_link" | "external_link" | string;
  primary_cta_url?: string | null;
  whatsapp_cta_label: string;
  whatsapp_url: string;
  status_beacon_text?: string | null;
}

export interface PublicExperiencePillar {
  id: number;
  pillar_number: string;
  badge: string;
  title: string;
  description: string;
  image?: string | null;
  tags: string[];
  order: number;
}

export interface PublicExperienceSection {
  title: string;
  subtitle?: string | null;
  video_cta_label: string;
  video_target: string;
  pillars: PublicExperiencePillar[];
}

export interface PublicVisualChroniclesSpec {
  label: string;
  value: string;
}

export interface PublicVisualChroniclesItem {
  id: number;
  card_type: "hero" | "portrait" | "tri" | string;
  order: number;
  image?: string | null;
  front_alt?: string;
  front_badge: string;
  back_pill: string;
  back_number: string;
  title: string;
  description: string;
  specs: PublicVisualChroniclesSpec[];
  cta_label: string;
  cta_url: string;
}

export interface PublicVisualChroniclesSection {
  heading: string;
  subtitle: string;
  stats_number: string;
  stats_label: string;
  archive_tag: string;
  archive_description: string;
  archive_cta_label: string;
  archive_cta_url: string;
  items: PublicVisualChroniclesItem[];
}

export interface PublicVipSanctuaryPillar {
  title: string;
  subtitle: string;
  icon: string;
}

export interface PublicVipSanctuarySection {
  background_image?: string | null;
  eyebrow: string;
  title: string;
  description: string;
  value_pillars: PublicVipSanctuaryPillar[];
  primary_cta_label: string;
  primary_cta_action: "appointment_modal" | "link" | string;
  primary_cta_url?: string | null;
  secondary_cta_label: string;
  secondary_cta_url: string;
  card_badge: string;
  card_title: string;
  card_live_pill: string;
  location_text?: string | null;
  hours_text?: string | null;
  phone_text?: string | null;
  whatsapp_cta_label: string;
  whatsapp_url: string;
  tour_cta_label: string;
  tour_video_target: string;
}

export interface PublicPageSEO {
  page: string;
  visibility: "PUBLISHED" | "HIDDEN" | string;
  target_keyword?: string | null;
  feature_image?: string | null;
  feature_image_alt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  robots?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  og_type?: string | null;
  og_site_name?: string | null;
  twitter_card?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  schema_json?: Record<string, unknown> | null;
  updated_at?: string;
}

export interface PublicCategorySEO {
  page: string;
  category_name?: string | null;
  visibility: "PUBLISHED" | "HIDDEN" | string;
  feature_image?: string | null;
  feature_image_alt?: string | null;
  target_keyword?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  schema_json?: Record<string, unknown> | null;
  h1_title?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  updated_at?: string;
}

export interface PublicBrandSEO {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  logo_alt?: string | null;
  segment?: string | null;
  destination_url?: string | null;
  listing_footer_text?: string | null;
  feature_image?: string | null;
  feature_image_alt?: string | null;
  target_keyword?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  schema_json?: Record<string, unknown> | null;
  h1_title?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  seo_updated_at?: string;
}

export interface PublicAboutStat {
  id?: string | number;
  number: string;
  label: string;
  order?: number;
}

export interface PublicAboutPillar {
  id?: string | number;
  title: string;
  description: string;
  icon?: string;
  icon_key?: string;
  order?: number;
}

export interface PublicAboutSection {
  id: number;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  stats: PublicAboutStat[];
  story_eyebrow: string;
  story_title: string;
  story_content_p1: string;
  story_content_p2: string;
  quote_text: string;
  quote_author: string;
  reel_image?: string | null;
  reel_image_url?: string | null;
  reel_title: string;
  reel_duration: string;
  reel_video_target: string;
  tour_cta_label: string;
  tour_video_target: string;
  pillars_eyebrow: string;
  pillars_title: string;
  pillars: PublicAboutPillar[];
  cta_title: string;
  cta_description: string;
  cta_primary_label: string;
  cta_secondary_label: string;
  cta_whatsapp_label: string;
  updated_at?: string;
}



export interface PublicShowroomStory {
  id: number;
  title: string;
  tag: string;
  subtitle: string;
  price_note: string;
  media_type: "image" | "video";
  media_url: string;
  cta_text: string;
  cta_link: string;
  whatsapp_message: string;
  brand: string;
  accent_color: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublicSalesRepresentative {
  id?: number;
  name: string;
  phone_number: string;
}

export interface PublicPeopleTalk {
  id: number;
  title: string;
  image: string;
  url?: string;
  is_featured: boolean;
  status?: string;
}

