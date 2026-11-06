import "server-only";
import { cookies } from "next/headers";
import { requestDashboard, type ApiResult } from "./transport";
import { getManagementAccess } from "./api";
import { hasPermission } from "./auth";

import type {
  BrandItem,
  ModelGenerationItem,
  BodyStyleItem,
  InventoryGalleryImage,
  InventoryListItem,
  InventoryDetailItem,
  StockItem,
  InventoryQuoteItem,
  SellCarItem,
  SellYourCarImageItem,
  ContactMessageItem,
  SubscriberItem,
  SliderItem,
  SocialMediaItem,
  PeopleTalkItem,
  SalesRepresentativeItem,
  SEOConfigItem,
  CategoryPageSEOItem,
  UserListItem,
  UserDetailItem,
  GroupItem,
  PermissionItem,
  OverviewData,
  PaginatedList,
  BrandCascadeImpact,
  SiteSettingsItem,
  ShowroomBranchItem,
  PreferenceSectionItem,
  ConsultationSectionItem,
  ExperienceSectionItem,
  ExperiencePillarItem,
  VisualChroniclesSectionItem,
  VisualChroniclesItemData,
  VipSanctuarySectionItem,
  AboutSectionItem,
} from "../types";

export type {
  BrandItem,
  ModelGenerationItem,
  BodyStyleItem,
  InventoryGalleryImage,
  InventoryListItem,
  InventoryDetailItem,
  StockItem,
  InventoryQuoteItem,
  SellCarItem,
  SellYourCarImageItem,
  PaginatedList,
  BrandCascadeImpact,
};

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;
  const cookieHeader = `sessionid=${sessionid}${csrftoken ? `; csrftoken=${csrftoken}` : ""}`;
  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  return { origin, cookieHeader, csrftoken };
}

// ----------------- Brand -----------------
export async function getBrands(searchParams?: {
  q?: string;
  status?: string;
  segment?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<BrandItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_brand")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_brand permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.segment) params.set("segment", searchParams.segment);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `brands/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<BrandItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<BrandItem>,
  });
}

export async function getBrand(id: number): Promise<ApiResult<BrandItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_brand")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_brand permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<BrandItem>({
    origin,
    path: `brands/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as BrandItem,
  });
}

export async function getBrandImpact(id: number): Promise<ApiResult<BrandCascadeImpact>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<BrandCascadeImpact>({
    origin,
    path: `brands/${id}/impact/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as BrandCascadeImpact,
  });
}

// ----------------- Model Generations -----------------
export async function getModelGenerations(searchParams?: {
  brand?: string | number;
  q?: string;
  status?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<ModelGenerationItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_modelgeneration")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_modelgeneration permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.brand) params.set("brand", String(searchParams.brand));
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `model-generations/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<ModelGenerationItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<ModelGenerationItem>,
  });
}

// ----------------- Body Styles -----------------
export async function getBodyStyles(searchParams?: {
  q?: string;
  status?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<BodyStyleItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_bodystyle")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_bodystyle permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `body-styles/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<BodyStyleItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<BodyStyleItem>,
  });
}

// ----------------- Inventory -----------------
export async function getInventoryList(searchParams?: {
  q?: string;
  status?: string;
  registered?: string;
  brand?: string | number;
  car_type?: string;
  is_featured?: string;
  ordering?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<InventoryListItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_inventory")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_inventory permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.registered) params.set("registered", searchParams.registered);
  if (searchParams?.brand) params.set("brand", String(searchParams.brand));
  if (searchParams?.car_type) params.set("car_type", searchParams.car_type);
  if (searchParams?.is_featured) params.set("is_featured", searchParams.is_featured);
  if (searchParams?.ordering) params.set("ordering", searchParams.ordering);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `inventory/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<InventoryListItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<InventoryListItem>,
  });
}

export async function getInventoryDetail(id: number): Promise<ApiResult<InventoryDetailItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_inventory")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_inventory permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<InventoryDetailItem>({
    origin,
    path: `inventory/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as InventoryDetailItem,
  });
}

// ----------------- Stock -----------------
export async function getStockList(searchParams?: {
  q?: string;
  status?: string;
  ordering?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<StockItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_stock")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_stock permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.ordering) params.set("ordering", searchParams.ordering);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `stocks/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<StockItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<StockItem>,
  });
}

export const getStocks = getStockList;

export async function getStockDetail(id: number): Promise<ApiResult<StockItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_stock")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_stock permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<StockItem>({
    origin,
    path: `stocks/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as StockItem,
  });
}

export const getStock = getStockDetail;

// ----------------- Quotes (Customer Enquiries) -----------------
export async function getQuoteList(searchParams?: {
  q?: string;
  car?: string | number;
  ordering?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<InventoryQuoteItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_inventoryquote")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_inventoryquote permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.car) params.set("car", String(searchParams.car));
  if (searchParams?.ordering) params.set("ordering", searchParams.ordering);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `quotes/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<InventoryQuoteItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<InventoryQuoteItem>,
  });
}

export const getQuotes = getQuoteList;

export async function getQuoteDetail(id: number): Promise<ApiResult<InventoryQuoteItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "inventory.view_inventoryquote")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_inventoryquote permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<InventoryQuoteItem>({
    origin,
    path: `quotes/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as InventoryQuoteItem,
  });
}

export const getQuote = getQuoteDetail;

// ----------------- SellCar (Vehicle Submissions) -----------------
export async function getSellCarList(searchParams?: {
  q?: string;
  car_year?: string;
  ordering?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<SellCarItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_sellcar")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_sellcar permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.car_year) params.set("car_year", searchParams.car_year);
  if (searchParams?.ordering) params.set("ordering", searchParams.ordering);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `sell-cars/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<SellCarItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<SellCarItem>,
  });
}

export const getSellCars = getSellCarList;

export async function getSellCarDetail(id: number): Promise<ApiResult<SellCarItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_sellcar")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_sellcar permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<SellCarItem>({
    origin,
    path: `sell-cars/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SellCarItem,
  });
}

export const getSellCar = getSellCarDetail;


// ----------------- Customer Inbox: ContactMessage -----------------
export async function getContactMessageList(searchParams?: {
  q?: string;
  topic?: string;
  preferred_contact?: string;
  ordering?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<ContactMessageItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_contactmessage")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_contactmessage permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.topic) params.set("topic", searchParams.topic);
  if (searchParams?.preferred_contact) params.set("preferred_contact", searchParams.preferred_contact);
  if (searchParams?.ordering) params.set("ordering", searchParams.ordering);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `contact-messages/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<ContactMessageItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<ContactMessageItem>,
  });
}

export const getContactMessages = getContactMessageList;

export async function getContactMessageDetail(id: number): Promise<ApiResult<ContactMessageItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_contactmessage")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_contactmessage permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<ContactMessageItem>({
    origin,
    path: `contact-messages/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ContactMessageItem,
  });
}

export const getContactMessage = getContactMessageDetail;


// ----------------- Customer Inbox: Subscribers -----------------
export async function getSubscriberList(searchParams?: {
  q?: string;
  ordering?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<SubscriberItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_subscriber")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_subscriber permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.ordering) params.set("ordering", searchParams.ordering);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `subscribers/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<SubscriberItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<SubscriberItem>,
  });
}

export const getSubscribers = getSubscriberList;

export async function getSubscriberDetail(id: number): Promise<ApiResult<SubscriberItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_subscriber")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_subscriber permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<SubscriberItem>({
    origin,
    path: `subscribers/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SubscriberItem,
  });
}

export const getSubscriber = getSubscriberDetail;


// ----------------- Slider Configuration -----------------
export async function getSliderList(searchParams?: {
  q?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<SliderItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_slider")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_slider permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `sliders/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<SliderItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<SliderItem>,
  });
}

export const getSliders = getSliderList;

export async function getSliderDetail(id: number): Promise<ApiResult<SliderItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_slider")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_slider permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<SliderItem>({
    origin,
    path: `sliders/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SliderItem,
  });
}

export const getSlider = getSliderDetail;


// ----------------- Social Media Configuration -----------------
export async function getSocialMediaList(searchParams?: {
  q?: string;
  page?: string | number;
  page_size?: string | number;
}): Promise<ApiResult<PaginatedList<SocialMediaItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_socialmedia")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_socialmedia permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `social-media/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<SocialMediaItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<SocialMediaItem>,
  });
}

export const getSocialMedias = getSocialMediaList;

export async function getSocialMediaDetail(id: number): Promise<ApiResult<SocialMediaItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_socialmedia")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_socialmedia permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<SocialMediaItem>({
    origin,
    path: `social-media/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SocialMediaItem,
  });
}

export const getSocialMedia = getSocialMediaDetail;

export async function getPeopleTalkList(searchParams?: {
  q?: string;
  status?: string;
  is_featured?: string;
  page?: number | string;
  page_size?: number | string;
}): Promise<ApiResult<PaginatedList<PeopleTalkItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_peopletalkaboutus")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_peopletalkaboutus permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.is_featured) params.set("is_featured", searchParams.is_featured);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `social-features/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<PeopleTalkItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<PeopleTalkItem>,
  });
}

export const getPeopleTalks = getPeopleTalkList;

export async function getPeopleTalkDetail(id: number): Promise<ApiResult<PeopleTalkItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_peopletalkaboutus")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_peopletalkaboutus permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<PeopleTalkItem>({
    origin,
    path: `social-features/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PeopleTalkItem,
  });
}

export const getPeopleTalk = getPeopleTalkDetail;

export async function getSalesRepresentativeList(searchParams?: {
  q?: string;
  status?: string;
  page?: number | string;
  page_size?: number | string;
}): Promise<ApiResult<PaginatedList<SalesRepresentativeItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_salesrepresentative")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_salesrepresentative permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `sales-representatives/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<SalesRepresentativeItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<SalesRepresentativeItem>,
  });
}

export const getSalesRepresentatives = getSalesRepresentativeList;

export async function getSalesRepresentativeDetail(id: number): Promise<ApiResult<SalesRepresentativeItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_salesrepresentative")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_salesrepresentative permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<SalesRepresentativeItem>({
    origin,
    path: `sales-representatives/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SalesRepresentativeItem,
  });
}

export const getSalesRepresentative = getSalesRepresentativeDetail;

// ----------------- General Page SEO (SEOConfig) -----------------
export async function getSEOConfigList(searchParams?: {
  q?: string;
  visibility?: string;
  robots?: string;
  page?: number | string;
  page_size?: number | string;
}): Promise<ApiResult<PaginatedList<SEOConfigItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "seo_config.view_seoconfig")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_seoconfig permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.visibility) params.set("visibility", searchParams.visibility);
  if (searchParams?.robots) params.set("robots", searchParams.robots);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `page-seo/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<SEOConfigItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<SEOConfigItem>,
  });
}

export const getSEOConfigs = getSEOConfigList;

export async function getSEOConfigDetail(id: number): Promise<ApiResult<SEOConfigItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "seo_config.view_seoconfig")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_seoconfig permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<SEOConfigItem>({
    origin,
    path: `page-seo/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SEOConfigItem,
  });
}

export const getSEOConfig = getSEOConfigDetail;

// ----------------- Category Page SEO (CategoryPageSEO) -----------------
export async function getCategoryPageSEOList(searchParams?: {
  q?: string;
  visibility?: string;
  robots?: string;
  page?: number | string;
  page_size?: number | string;
}): Promise<ApiResult<PaginatedList<CategoryPageSEOItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "seo_config.view_categorypageseo")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_categorypageseo permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.visibility) params.set("visibility", searchParams.visibility);
  if (searchParams?.robots) params.set("robots", searchParams.robots);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `category-seo/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<CategoryPageSEOItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<CategoryPageSEOItem>,
  });
}

export const getCategoryPageSEOs = getCategoryPageSEOList;

export async function getCategoryPageSEODetail(id: number): Promise<ApiResult<CategoryPageSEOItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "seo_config.view_categorypageseo")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_categorypageseo permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<CategoryPageSEOItem>({
    origin,
    path: `category-seo/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as CategoryPageSEOItem,
  });
}

export const getCategoryPageSEO = getCategoryPageSEODetail;

// ----------------- Permissions Catalog -----------------
export async function getPermissions(): Promise<ApiResult<PermissionItem[]>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "auth.view_permission") && !access.data.user.is_superuser && !hasPermission(access.data.user, "auth.view_user") && !hasPermission(access.data.user, "auth.view_group")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing permission to view permissions." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<PermissionItem[]>({
    origin,
    path: "permissions/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PermissionItem[],
  });
}

// ----------------- Groups -----------------
export async function getGroups(searchParams?: {
  q?: string;
  page?: number | string;
  page_size?: number | string;
}): Promise<ApiResult<PaginatedList<GroupItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "auth.view_group")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_group permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `groups/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<GroupItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<GroupItem>,
  });
}

export async function getGroupDetail(id: number): Promise<ApiResult<GroupItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "auth.view_group")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_group permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<GroupItem>({
    origin,
    path: `groups/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as GroupItem,
  });
}

// ----------------- Users -----------------
export async function getUsers(searchParams?: {
  q?: string;
  is_staff?: string;
  is_active?: string;
  group?: string;
  page?: number | string;
  page_size?: number | string;
}): Promise<ApiResult<PaginatedList<UserListItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "auth.view_user")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_user permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.is_staff) params.set("is_staff", searchParams.is_staff);
  if (searchParams?.is_active) params.set("is_active", searchParams.is_active);
  if (searchParams?.group) params.set("group", searchParams.group);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `users/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<UserListItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<UserListItem>,
  });
}

export async function getUserDetail(id: number): Promise<ApiResult<UserDetailItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "auth.view_user")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_user permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<UserDetailItem>({
    origin,
    path: `users/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as UserDetailItem,
  });
}

// ----------------- Overview Aggregates -----------------
export async function getOverviewAggregates(): Promise<ApiResult<OverviewData>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<OverviewData>({
    origin,
    path: "overview/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as OverviewData,
  });
}

// ----------------- Site Settings (home.SiteSettings) -----------------
export async function getSiteSettings(): Promise<ApiResult<SiteSettingsItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_sitesettings")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_sitesettings permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<SiteSettingsItem>({
    origin,
    path: "site-settings/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SiteSettingsItem,
  });
}

// ----------------- Showroom Branches (home.ShowroomBranch) -----------------
export async function getShowroomBranchList(searchParams?: {
  q?: string;
  status?: string;
  page?: number | string;
  page_size?: number | string;
}): Promise<ApiResult<PaginatedList<ShowroomBranchItem>>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_showroombranch")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_showroombranch permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.page) params.set("page", String(searchParams.page));
  if (searchParams?.page_size) params.set("page_size", String(searchParams.page_size));

  const path = `branches/${params.toString() ? `?${params.toString()}` : ""}`;
  return requestDashboard<PaginatedList<ShowroomBranchItem>>({
    origin,
    path,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PaginatedList<ShowroomBranchItem>,
  });
}

export const getShowroomBranches = getShowroomBranchList;

export async function getShowroomBranchDetail(id: number): Promise<ApiResult<ShowroomBranchItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;
  if (!hasPermission(access.data.user, "home.view_showroombranch")) {
    return { ok: false, error: { code: "FORBIDDEN", message: "Missing view_showroombranch permission." } };
  }

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<ShowroomBranchItem>({
    origin,
    path: `branches/${id}/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ShowroomBranchItem,
  });
}

// ----------------- Preference Section (home.PreferenceSection, home.PreferenceCategory) -----------------
export async function getPreferenceSectionDashboard(): Promise<ApiResult<PreferenceSectionItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<PreferenceSectionItem>({
    origin,
    path: "preference-section/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PreferenceSectionItem,
  });
}

// ----------------- Consultation Section (home.ConsultationSection) -----------------
export async function getConsultationSectionDashboard(): Promise<ApiResult<ConsultationSectionItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<ConsultationSectionItem>({
    origin,
    path: "consultation/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ConsultationSectionItem,
  });
}

// ----------------- Experience Section (home.ExperienceSection, home.ExperiencePillar) -----------------
export async function getExperienceSectionDashboard(): Promise<ApiResult<ExperienceSectionItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<ExperienceSectionItem>({
    origin,
    path: "experience/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ExperienceSectionItem,
  });
}

// ----------------- Visual Chronicles Section (home.VisualChroniclesSection, home.VisualChroniclesItem) -----------------
export async function getVisualChroniclesSectionDashboard(): Promise<ApiResult<VisualChroniclesSectionItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<VisualChroniclesSectionItem>({
    origin,
    path: "visual-chronicles/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VisualChroniclesSectionItem,
  });
}

// ----------------- VIP Sanctuary Section (home.VipSanctuarySection) -----------------
export async function getVipSanctuarySectionDashboard(): Promise<ApiResult<VipSanctuarySectionItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<VipSanctuarySectionItem>({
    origin,
    path: "vip-sanctuary/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VipSanctuarySectionItem,
  });
}

// ----------------- About Section (home.AboutSection) -----------------
export async function getAboutSectionDashboard(): Promise<ApiResult<AboutSectionItem>> {
  const access = await getManagementAccess();
  if (!access.ok) return access;

  const { origin, cookieHeader, csrftoken } = await getAuthHeaders();
  return requestDashboard<AboutSectionItem>({
    origin,
    path: "about-us/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as AboutSectionItem,
  });
}







