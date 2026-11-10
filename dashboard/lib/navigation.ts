export type NavigationItem = Readonly<{
  href:
    | "/"
    | "/workspace"
    | "/workspace/inventory"
    | "/workspace/brands"
    | "/workspace/model-generations"
    | "/workspace/body-styles"
    | "/workspace/quotes"
    | "/workspace/sell-cars"
    | "/workspace/inbox/contact"
    | "/workspace/content/sliders"
    | "/workspace/content/stories"
    | "/workspace/content/preferences"
    | "/workspace/content/consultation"
    | "/workspace/content/experience"
    | "/workspace/content/visual-chronicles"
    | "/workspace/content/vip-sanctuary"
    | "/workspace/content/about-us"
    | "/workspace/content/social-media"
    | "/workspace/content/social-features"
    | "/workspace/content/sales-representatives"
    | "/workspace/seo/pages"
    | "/workspace/seo/categories"
    | "/workspace/users"
    | "/workspace/groups"
    | "/workspace/site-settings"
    | "/workspace/branches"
    | "/workspace/preview"
    | "/login";
  label: string;
  symbol: string;
  permission?: string;
}>;

// Only implemented destinations belong here. Future modules live in MODULE_MATRIX.md.
export const navigation: readonly NavigationItem[] = [
  { href: "/", label: "Access status", symbol: "ðŸ“Š" },
  { href: "/workspace", label: "Workspace", symbol: "âš¡" },
  { href: "/workspace/inventory", label: "Inventory", symbol: "ðŸŽï¸", permission: "inventory.view_inventory" },
  { href: "/workspace/brands", label: "Brands", symbol: "ðŸ·ï¸", permission: "inventory.view_brand" },
  { href: "/workspace/model-generations", label: "Models", symbol: "ðŸš˜", permission: "inventory.view_modelgeneration" },
  { href: "/workspace/body-styles", label: "Body Styles", symbol: "ðŸš—", permission: "inventory.view_bodystyle" },
  { href: "/workspace/quotes", label: "Customer Quotes", symbol: "ðŸ’¬", permission: "inventory.view_inventoryquote" },
  { href: "/workspace/sell-cars", label: "Sell Car Leads", symbol: "ðŸ¤", permission: "home.view_sellcar" },
  { href: "/workspace/inbox/contact", label: "Contact Inbox", symbol: "ðŸ“¬", permission: "home.view_contactmessage" },
  { href: "/workspace/content/sliders", label: "Slider Videos", symbol: "ðŸŽ¬", permission: "home.view_slider" },
  { href: "/workspace/content/stories", label: "Showroom Stories", symbol: "ðŸ“±", permission: "home.view_showroomstory" },
  { href: "/workspace/content/preferences", label: "Preference Section", symbol: "âš™ï¸", permission: "home.view_preferencesection" },
  { href: "/workspace/content/consultation", label: "Consultation", symbol: "ðŸ’¬", permission: "home.view_consultationsection" },
  { href: "/workspace/content/experience", label: "Experience Pillars", symbol: "ðŸ›ï¸", permission: "home.view_experiencesection" },
  { href: "/workspace/content/visual-chronicles", label: "Visual Chronicles", symbol: "ðŸ“¸", permission: "home.view_visualchroniclessection" },
  { href: "/workspace/content/vip-sanctuary", label: "VIP Sanctuary", symbol: "ðŸ‘‘", permission: "home.view_vipsanctuarysection" },
  { href: "/workspace/content/about-us", label: "About Us Page", symbol: "ðŸ“–", permission: "home.view_aboutsection" },
  { href: "/workspace/content/social-media", label: "Social Links", symbol: "ðŸŒ", permission: "home.view_socialmedia" },
  { href: "/workspace/content/social-features", label: "Social Features", symbol: "ðŸ‘¥", permission: "home.view_peopletalkaboutus" },
  { href: "/workspace/content/sales-representatives", label: "Sales Reps", symbol: "ðŸ‘”", permission: "home.view_salesrepresentative" },
  { href: "/workspace/seo/pages", label: "Page SEO", symbol: "ðŸ”", permission: "seo_config.view_seoconfig" },
  { href: "/workspace/seo/categories", label: "Category SEO", symbol: "ðŸ“‘", permission: "seo_config.view_categorypageseo" },
  { href: "/workspace/site-settings", label: "Site Settings", symbol: "ðŸ› ï¸", permission: "home.view_sitesettings" },
  { href: "/workspace/branches", label: "Showroom Branches", symbol: "ðŸ¢", permission: "home.view_showroombranch" },
  { href: "/workspace/users", label: "Users", symbol: "ðŸ‘¤", permission: "auth.view_user" },
  { href: "/workspace/groups", label: "Groups", symbol: "ðŸ‘¥", permission: "auth.view_group" },
  { href: "/workspace/preview", label: "UI Components", symbol: "ðŸ‘ï¸" },
];

export const allRoutes: Record<string, { label: string; symbol: string }> = {
  "/": { label: "Access status", symbol: "ðŸ“Š" },
  "/workspace": { label: "Workspace", symbol: "âš¡" },
  "/workspace/inventory": { label: "Inventory", symbol: "ðŸŽï¸" },
  "/workspace/brands": { label: "Brands", symbol: "ðŸ·ï¸" },
  "/workspace/model-generations": { label: "Models", symbol: "ðŸš˜" },
  "/workspace/body-styles": { label: "Body Styles", symbol: "ðŸš—" },
  "/workspace/quotes": { label: "Customer Quotes", symbol: "ðŸ’¬" },
  "/workspace/sell-cars": { label: "Sell Car Leads", symbol: "ðŸ¤" },
  "/workspace/inbox/contact": { label: "Contact Inbox", symbol: "ðŸ“¬" },
  "/workspace/content/sliders": { label: "Slider Videos", symbol: "ðŸŽ¬" },
  "/workspace/content/stories": { label: "Showroom Stories", symbol: "ðŸ“±" },
  "/workspace/content/preferences": { label: "Preference Section", symbol: "âš™ï¸" },
  "/workspace/content/consultation": { label: "Consultation Section", symbol: "ðŸ’¬" },
  "/workspace/content/experience": { label: "Experience Pillars", symbol: "ðŸ›ï¸" },
  "/workspace/content/visual-chronicles": { label: "Visual Chronicles", symbol: "ðŸ“¸" },
  "/workspace/content/vip-sanctuary": { label: "VIP Sanctuary", symbol: "ðŸ‘‘" },
  "/workspace/content/about-us": { label: "About Us Page", symbol: "ðŸ“–" },
  "/workspace/content/social-media": { label: "Social Links", symbol: "ðŸŒ" },
  "/workspace/content/social-features": { label: "Social Features", symbol: "ðŸ‘¥" },
  "/workspace/content/sales-representatives": { label: "Sales Reps", symbol: "ðŸ‘”" },
  "/workspace/seo/pages": { label: "Page SEO", symbol: "ðŸ”" },
  "/workspace/seo/categories": { label: "Category SEO", symbol: "ðŸ“‘" },
  "/workspace/site-settings": { label: "Site Settings", symbol: "ðŸ› ï¸" },
  "/workspace/branches": { label: "Showroom Branches", symbol: "ðŸ¢" },
  "/workspace/users": { label: "Users", symbol: "ðŸ‘¤" },
  "/workspace/groups": { label: "Groups", symbol: "ðŸ‘¥" },
  "/workspace/preview": { label: "UI Components Preview", symbol: "ðŸ‘ï¸" },
  "/login": { label: "Sign in", symbol: "ðŸ”‘" },
};
