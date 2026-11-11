"use server";

import { revalidatePath } from "next/cache";
import { getDashboardActionAuthContext as getAuthContext } from "@/lib/server/auth";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type { PreferenceSectionItem, PreferenceCategoryItem } from "@/lib/types";

// ----------------- Preference Section Actions -----------------
export async function getPreferenceSectionDashboardAction(): Promise<ApiResult<PreferenceSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  return requestDashboard<PreferenceSectionItem>({
    origin,
    path: "preference-section/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PreferenceSectionItem,
  });
}

export async function updatePreferenceSectionAction(
  formData: FormData
): Promise<ApiResult<PreferenceSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<PreferenceSectionItem>({
    origin,
    path: "preference-section/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PreferenceSectionItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/preferences");
  }
  return res;
}

// ----------------- Preference Category Actions -----------------
export async function updatePreferenceCategoryAction(
  id: number,
  formData: FormData
): Promise<ApiResult<PreferenceCategoryItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<PreferenceCategoryItem>({
    origin,
    path: `preference-categories/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as PreferenceCategoryItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/preferences");
  }
  return res;
}
