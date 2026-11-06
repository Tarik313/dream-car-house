"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type { ShowroomStoryItem } from "@/lib/types";

async function getAuthContext() {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  return { origin, cookieHeader, csrftoken };
}

export async function getStoriesDashboardAction(): Promise<ApiResult<ShowroomStoryItem[]>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  return requestDashboard<ShowroomStoryItem[]>({
    origin,
    path: "stories/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ShowroomStoryItem[],
  });
}

export async function createStoryAction(
  formData: FormData
): Promise<ApiResult<ShowroomStoryItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ShowroomStoryItem>({
    origin,
    path: "stories/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ShowroomStoryItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/stories");
  }
  return res;
}

export async function updateStoryAction(
  id: number,
  formData: FormData
): Promise<ApiResult<ShowroomStoryItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ShowroomStoryItem>({
    origin,
    path: `stories/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ShowroomStoryItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/stories");
  }
  return res;
}

export async function deleteStoryAction(
  id: number
): Promise<ApiResult<{ success: boolean }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ success: boolean }>({
    origin,
    path: `stories/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => (val || { success: true }) as { success: boolean },
  });
  if (res.ok) {
    revalidatePath("/workspace/content/stories");
  }
  return res;
}

export async function toggleStoryStatusAction(
  id: number,
  isActive: boolean
): Promise<ApiResult<ShowroomStoryItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const body = new FormData();
  body.append("is_active", String(isActive));
  const res = await requestDashboard<ShowroomStoryItem>({
    origin,
    path: `stories/${id}/`,
    method: "PATCH",
    body,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ShowroomStoryItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/stories");
  }
  return res;
}

