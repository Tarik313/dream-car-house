"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type {
  BrandItem,
  BrandCascadeImpact,
  ModelGenerationItem,
  BodyStyleItem,
  InventoryDetailItem,
  InventoryGalleryImage,
  StockItem,
  InventoryQuoteItem,
  SellCarItem,
  ContactMessageItem,
  SubscriberItem,
  SliderItem,
  SocialMediaItem,
  PeopleTalkItem,
  SalesRepresentativeItem,
  SEOConfigItem,
  CategoryPageSEOItem,
  UserDetailItem,
  GroupItem,
} from "@/lib/types";

async function getAuthContext() {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;
  const cookieHeader = `sessionid=${sessionid}${csrftoken ? `; csrftoken=${csrftoken}` : ""}`;
  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  return { origin, cookieHeader, csrftoken };
}

// ----------------- Brand Actions -----------------
export async function createBrandAction(formData: FormData): Promise<ApiResult<BrandItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<BrandItem>({
    origin,
    path: "brands/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as BrandItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/brands");
  }
  return res;
}

export async function updateBrandAction(id: number, formData: FormData): Promise<ApiResult<BrandItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<BrandItem>({
    origin,
    path: `brands/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as BrandItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/brands");
    revalidatePath(`/workspace/brands/${id}`);
  }
  return res;
}

export async function getBrandCascadeImpactAction(id: number): Promise<ApiResult<BrandCascadeImpact>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  return requestDashboard<BrandCascadeImpact>({
    origin,
    path: `brands/${id}/impact/`,
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as BrandCascadeImpact,
  });
}

export async function deleteBrandAction(id: number, confirm = false): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `brands/${id}/${confirm ? "?confirm=true" : ""}`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/brands");
  }
  return res;
}

// ----------------- Model Generation Actions -----------------
export async function createModelGenerationAction(data: {
  brand: number;
  model: string;
  status?: string;
}): Promise<ApiResult<ModelGenerationItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ModelGenerationItem>({
    origin,
    path: "model-generations/",
    method: "POST",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ModelGenerationItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/model-generations");
  }
  return res;
}

export async function updateModelGenerationAction(id: number, data: {
  brand?: number;
  model?: string;
  status?: string;
}): Promise<ApiResult<ModelGenerationItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ModelGenerationItem>({
    origin,
    path: `model-generations/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ModelGenerationItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/model-generations");
  }
  return res;
}

export async function deleteModelGenerationAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `model-generations/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/model-generations");
  }
  return res;
}

// ----------------- Body Style Actions -----------------
export async function createBodyStyleAction(data: { body: string; status?: string }): Promise<ApiResult<BodyStyleItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<BodyStyleItem>({
    origin,
    path: "body-styles/",
    method: "POST",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as BodyStyleItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/body-styles");
  }
  return res;
}

export async function updateBodyStyleAction(id: number, data: { body?: string; status?: string }): Promise<ApiResult<BodyStyleItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<BodyStyleItem>({
    origin,
    path: `body-styles/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as BodyStyleItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/body-styles");
  }
  return res;
}

export async function deleteBodyStyleAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `body-styles/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/body-styles");
  }
  return res;
}

// ----------------- Inventory Actions -----------------
export async function createInventoryAction(formData: FormData): Promise<ApiResult<InventoryDetailItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<InventoryDetailItem>({
    origin,
    path: "inventory/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as InventoryDetailItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/inventory");
  }
  return res;
}

export async function updateInventoryAction(id: number, formData: FormData): Promise<ApiResult<InventoryDetailItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<InventoryDetailItem>({
    origin,
    path: `inventory/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as InventoryDetailItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/inventory");
    revalidatePath(`/workspace/inventory/${id}`);
  }
  return res;
}

export async function deleteInventoryAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `inventory/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/inventory");
  }
  return res;
}

export async function uploadInventoryGalleryImageAction(inventoryId: number, formData: FormData): Promise<ApiResult<InventoryGalleryImage>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<InventoryGalleryImage>({
    origin,
    path: `inventory/${inventoryId}/images/`,
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as InventoryGalleryImage,
  });
  if (res.ok) {
    revalidatePath(`/workspace/inventory/${inventoryId}`);
  }
  return res;
}

export async function deleteInventoryGalleryImageAction(imageId: number, inventoryId: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `inventory/images/${imageId}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath(`/workspace/inventory/${inventoryId}`);
  }
  return res;
}

export async function updateInventoryGalleryImageAction(
  imageId: number,
  inventoryId: number,
  data: { order?: number; caption?: string; alt_text?: string; tag?: string }
): Promise<ApiResult<InventoryGalleryImage>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<InventoryGalleryImage>({
    origin,
    path: `inventory/images/${imageId}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as InventoryGalleryImage,
  });
  if (res.ok) {
    revalidatePath(`/workspace/inventory/${inventoryId}`);
  }
  return res;
}

export async function batchUpdateGalleryImagesAction(
  inventoryId: number,
  updates: { id: number; order?: number; caption?: string; alt_text?: string; tag?: string }[],
  deletions: number[] = []
): Promise<ApiResult<{ updated: number; deleted: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();

  // 1. Process deletions first
  let deletedCount = 0;
  for (const delId of deletions) {
    const delRes = await requestDashboard<{ message: string; deleted_id: number }>({
      origin,
      path: `inventory/images/${delId}/`,
      method: "DELETE",
      cookie: cookieHeader,
      csrfToken: csrftoken,
      decode: (val) => val as { message: string; deleted_id: number },
    });
    if (delRes.ok) {
      deletedCount++;
    }
  }

  // 2. Process updates and reordering
  let updatedCount = 0;
  for (const item of updates) {
    if (deletions.includes(item.id)) continue;
    const { id, ...patchData } = item;
    const patchRes = await requestDashboard<InventoryGalleryImage>({
      origin,
      path: `inventory/images/${id}/`,
      method: "PATCH",
      body: patchData,
      cookie: cookieHeader,
      csrfToken: csrftoken,
      decode: (val) => val as InventoryGalleryImage,
    });
    if (patchRes.ok) {
      updatedCount++;
    }
  }

  revalidatePath(`/workspace/inventory/${inventoryId}`);
  return { ok: true, data: { updated: updatedCount, deleted: deletedCount } };
}


// ----------------- Stock Actions -----------------
export async function createStockAction(formData: FormData): Promise<ApiResult<StockItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<StockItem>({
    origin,
    path: "stocks/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as StockItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/stocks");
  }
  return res;
}

export async function updateStockAction(id: number, formData: FormData): Promise<ApiResult<StockItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<StockItem>({
    origin,
    path: `stocks/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as StockItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/stocks");
  }
  return res;
}

export async function deleteStockAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `stocks/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/stocks");
  }
  return res;
}

// ----------------- Quote Actions -----------------
export async function updateQuoteAction(
  id: number,
  data: { name?: string; email?: string; phone?: string; car?: number | null }
): Promise<ApiResult<InventoryQuoteItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<InventoryQuoteItem>({
    origin,
    path: `quotes/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as InventoryQuoteItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/quotes");
  }
  return res;
}

export async function deleteQuoteAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `quotes/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/quotes");
  }
  return res;
}

// ----------------- SellCar Actions -----------------
export async function updateSellCarAction(
  id: number,
  data: {
    name?: string;
    phone?: string;
    car_name?: string;
    car_model?: string;
    car_year?: string;
    mileage?: number;
    offered_price?: number | null;
  }
): Promise<ApiResult<SellCarItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SellCarItem>({
    origin,
    path: `sell-cars/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SellCarItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/sell-cars");
  }
  return res;
}

export async function deleteSellCarAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `sell-cars/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/sell-cars");
  }
  return res;
}

export async function deleteSellCarImageAction(
  sellcarId: number,
  imageId: number
): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `sell-cars/${sellcarId}/images/${imageId}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/sell-cars");
  }
  return res;
}

// ----------------- Contact Messages Actions -----------------
export async function updateContactMessageAction(
  id: number,
  data: {
    topic?: string;
    name?: string;
    phone?: string;
    email?: string;
    vehicle?: string;
    message?: string;
    preferred_contact?: string;
  }
): Promise<ApiResult<ContactMessageItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ContactMessageItem>({
    origin,
    path: `contact-messages/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ContactMessageItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/inbox/contact");
  }
  return res;
}

export async function deleteContactMessageAction(
  id: number
): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `contact-messages/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/inbox/contact");
  }
  return res;
}

// ----------------- Subscribers Actions -----------------
export async function updateSubscriberAction(
  id: number,
  data: {
    email: string;
  }
): Promise<ApiResult<SubscriberItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SubscriberItem>({
    origin,
    path: `subscribers/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SubscriberItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/inbox/subscribers");
  }
  return res;
}

export async function deleteSubscriberAction(
  id: number
): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `subscribers/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/inbox/subscribers");
  }
  return res;
}

// ----------------- Slider Configuration Actions -----------------
export async function createSliderAction(formData: FormData): Promise<ApiResult<SliderItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SliderItem>({
    origin,
    path: "sliders/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SliderItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/sliders");
  }
  return res;
}

export async function updateSliderAction(id: number, formData: FormData): Promise<ApiResult<SliderItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SliderItem>({
    origin,
    path: `sliders/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SliderItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/sliders");
  }
  return res;
}

export async function deleteSliderAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `sliders/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/content/sliders");
  }
  return res;
}

// ----------------- Social Media Configuration Actions -----------------
export async function createSocialMediaAction(data: {
  facebook: string;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
}): Promise<ApiResult<SocialMediaItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SocialMediaItem>({
    origin,
    path: "social-media/",
    method: "POST",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SocialMediaItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/social-media");
  }
  return res;
}

export async function updateSocialMediaAction(
  id: number,
  data: {
    facebook?: string;
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
  }
): Promise<ApiResult<SocialMediaItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SocialMediaItem>({
    origin,
    path: `social-media/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SocialMediaItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/social-media");
  }
  return res;
}

export async function deleteSocialMediaAction(
  id: number
): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `social-media/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/content/social-media");
  }
  return res;
}

// ----------------- Social Features (PeopleTalkAboutUs) Actions -----------------
export async function createPeopleTalkAction(formData: FormData): Promise<ApiResult<PeopleTalkItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<PeopleTalkItem>({
    origin,
    path: "social-features/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PeopleTalkItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/social-features");
  }
  return res;
}

export async function updatePeopleTalkAction(
  id: number,
  formData: FormData
): Promise<ApiResult<PeopleTalkItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<PeopleTalkItem>({
    origin,
    path: `social-features/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PeopleTalkItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/social-features");
  }
  return res;
}

export async function deletePeopleTalkAction(
  id: number
): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `social-features/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/content/social-features");
  }
  return res;
}

// ----------------- Sales Representative Actions -----------------
export async function createSalesRepresentativeAction(data: {
  name: string;
  phone_number: string;
  status: "PUBLISHED" | "DRAFT";
}): Promise<ApiResult<SalesRepresentativeItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SalesRepresentativeItem>({
    origin,
    path: "sales-representatives/",
    method: "POST",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SalesRepresentativeItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/sales-representatives");
  }
  return res;
}

export async function updateSalesRepresentativeAction(
  id: number,
  data: {
    name?: string;
    phone_number?: string;
    status?: "PUBLISHED" | "DRAFT";
  }
): Promise<ApiResult<SalesRepresentativeItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SalesRepresentativeItem>({
    origin,
    path: `sales-representatives/${id}/`,
    method: "PATCH",
    body: data,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SalesRepresentativeItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/sales-representatives");
  }
  return res;
}

export async function deleteSalesRepresentativeAction(
  id: number
): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `sales-representatives/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/content/sales-representatives");
  }
  return res;
}

// ----------------- General Page SEO Actions -----------------
export async function createSEOConfigAction(formData: FormData): Promise<ApiResult<SEOConfigItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SEOConfigItem>({
    origin,
    path: "page-seo/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SEOConfigItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/seo/pages");
  }
  return res;
}

export async function updateSEOConfigAction(id: number, formData: FormData): Promise<ApiResult<SEOConfigItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SEOConfigItem>({
    origin,
    path: `page-seo/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SEOConfigItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/seo/pages");
  }
  return res;
}

export async function deleteSEOConfigAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `page-seo/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/seo/pages");
  }
  return res;
}

// ----------------- Category Page SEO Actions -----------------
export async function createCategoryPageSEOAction(formData: FormData): Promise<ApiResult<CategoryPageSEOItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<CategoryPageSEOItem>({
    origin,
    path: "category-seo/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as CategoryPageSEOItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/seo/categories");
  }
  return res;
}

export async function updateCategoryPageSEOAction(id: number, formData: FormData): Promise<ApiResult<CategoryPageSEOItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<CategoryPageSEOItem>({
    origin,
    path: `category-seo/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as CategoryPageSEOItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/seo/categories");
  }
  return res;
}

export async function deleteCategoryPageSEOAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `category-seo/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/seo/categories");
  }
  return res;
}

// ----------------- Group Actions -----------------
export async function createGroupAction(formData: FormData): Promise<ApiResult<GroupItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<GroupItem>({
    origin,
    path: "groups/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as GroupItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/groups");
  }
  return res;
}

export async function updateGroupAction(id: number, formData: FormData): Promise<ApiResult<GroupItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<GroupItem>({
    origin,
    path: `groups/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as GroupItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/groups");
  }
  return res;
}

export async function deleteGroupAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `groups/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/groups");
  }
  return res;
}

// ----------------- User Actions -----------------
export async function createUserAction(formData: FormData): Promise<ApiResult<UserDetailItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<UserDetailItem>({
    origin,
    path: "users/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as UserDetailItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/users");
  }
  return res;
}

export async function updateUserAction(id: number, formData: FormData): Promise<ApiResult<UserDetailItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<UserDetailItem>({
    origin,
    path: `users/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as UserDetailItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/users");
  }
  return res;
}

export async function deleteUserAction(id: number): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `users/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/users");
  }
  return res;
}
