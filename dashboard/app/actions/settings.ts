"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type { SiteSettingsItem, ShowroomBranchItem } from "@/lib/types";

async function getAuthContext() {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;
  const cookieHeader = `sessionid=${sessionid}${csrftoken ? `; csrftoken=${csrftoken}` : ""}`;
  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  return { origin, cookieHeader, csrftoken };
}

// ----------------- Site Settings Actions -----------------
export async function updateSiteSettingsAction(formData: FormData): Promise<ApiResult<SiteSettingsItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<SiteSettingsItem>({
    origin,
    path: "site-settings/",
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as SiteSettingsItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/site-settings");
  }
  return res;
}

// ----------------- Showroom Branch Actions -----------------
export async function createShowroomBranchAction(formData: FormData): Promise<ApiResult<ShowroomBranchItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ShowroomBranchItem>({
    origin,
    path: "branches/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ShowroomBranchItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/branches");
  }
  return res;
}

export async function updateShowroomBranchAction(
  id: number,
  formData: FormData
): Promise<ApiResult<ShowroomBranchItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ShowroomBranchItem>({
    origin,
    path: `branches/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ShowroomBranchItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/branches");
  }
  return res;
}

export async function deleteShowroomBranchAction(
  id: number
): Promise<ApiResult<{ deleted: boolean }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ deleted: boolean }>({
    origin,
    path: `branches/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: () => ({ deleted: true }),
  });
  if (res.ok) {
    revalidatePath("/workspace/branches");
  }
  return res;
}
