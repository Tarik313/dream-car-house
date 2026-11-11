"use server";

import { revalidatePath } from "next/cache";
import { getDashboardActionAuthContext as getAuthContext } from "@/lib/server/auth";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type {
  VisualChroniclesSectionItem,
  VisualChroniclesItemData,
  VipSanctuarySectionItem,
} from "@/lib/types";

// ----------------- Visual Chronicles Section Actions -----------------
export async function getVisualChroniclesSectionDashboardAction(): Promise<ApiResult<VisualChroniclesSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  return requestDashboard<VisualChroniclesSectionItem>({
    origin,
    path: "visual-chronicles/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VisualChroniclesSectionItem,
  });
}

export async function updateVisualChroniclesSectionAction(
  formData: FormData
): Promise<ApiResult<VisualChroniclesSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<VisualChroniclesSectionItem>({
    origin,
    path: "visual-chronicles/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VisualChroniclesSectionItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/visual-chronicles");
  }
  return res;
}

export async function updateVisualChroniclesItemAction(
  id: number,
  formData: FormData
): Promise<ApiResult<VisualChroniclesItemData>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<VisualChroniclesItemData>({
    origin,
    path: `visual-chronicles/items/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VisualChroniclesItemData,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/visual-chronicles");
  }
  return res;
}

export async function createVisualChroniclesItemAction(
  formData: FormData
): Promise<ApiResult<VisualChroniclesItemData>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<VisualChroniclesItemData>({
    origin,
    path: "visual-chronicles/items/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VisualChroniclesItemData,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/visual-chronicles");
  }
  return res;
}

export async function deleteVisualChroniclesItemAction(
  id: number
): Promise<ApiResult<{ success: boolean }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ success: boolean }>({
    origin,
    path: `visual-chronicles/items/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: () => ({ success: true }),
  });
  if (res.ok) {
    revalidatePath("/workspace/content/visual-chronicles");
  }
  return res;
}

// ----------------- VIP Sanctuary Section Actions -----------------
export async function getVipSanctuarySectionDashboardAction(): Promise<ApiResult<VipSanctuarySectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  return requestDashboard<VipSanctuarySectionItem>({
    origin,
    path: "vip-sanctuary/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VipSanctuarySectionItem,
  });
}

export async function updateVipSanctuarySectionAction(
  formData: FormData
): Promise<ApiResult<VipSanctuarySectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<VipSanctuarySectionItem>({
    origin,
    path: "vip-sanctuary/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as VipSanctuarySectionItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/vip-sanctuary");
  }
  return res;
}
