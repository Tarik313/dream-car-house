"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type {
  ConsultationSectionItem,
  ExperienceSectionItem,
  ExperiencePillarItem,
} from "@/lib/types";

async function getAuthContext() {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;
  const cookieHeader = `sessionid=${sessionid}${csrftoken ? `; csrftoken=${csrftoken}` : ""}`;
  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  return { origin, cookieHeader, csrftoken };
}

// ----------------- Consultation Section Actions -----------------
export async function getConsultationSectionDashboardAction(): Promise<ApiResult<ConsultationSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  return requestDashboard<ConsultationSectionItem>({
    origin,
    path: "consultation/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ConsultationSectionItem,
  });
}

export async function updateConsultationSectionAction(
  formData: FormData
): Promise<ApiResult<ConsultationSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ConsultationSectionItem>({
    origin,
    path: "consultation/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ConsultationSectionItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/consultation");
    revalidatePath("/workspace/content/experience");
  }
  return res;
}

// ----------------- Experience Section Actions -----------------
export async function getExperienceSectionDashboardAction(): Promise<ApiResult<ExperienceSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  return requestDashboard<ExperienceSectionItem>({
    origin,
    path: "experience/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ExperienceSectionItem,
  });
}

export async function updateExperienceSectionAction(
  formData: FormData
): Promise<ApiResult<ExperienceSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ExperienceSectionItem>({
    origin,
    path: "experience/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ExperienceSectionItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/experience");
  }
  return res;
}

// ----------------- Experience Pillar Actions -----------------
export async function updateExperiencePillarAction(
  id: number,
  formData: FormData
): Promise<ApiResult<ExperiencePillarItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ExperiencePillarItem>({
    origin,
    path: `experience-pillars/${id}/`,
    method: "PATCH",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ExperiencePillarItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/experience");
  }
  return res;
}

export async function createExperiencePillarAction(
  formData: FormData
): Promise<ApiResult<ExperiencePillarItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<ExperiencePillarItem>({
    origin,
    path: "experience-pillars/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as ExperiencePillarItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/experience");
  }
  return res;
}

export async function deleteExperiencePillarAction(
  id: number
): Promise<ApiResult<{ message: string; deleted_id: number }>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<{ message: string; deleted_id: number }>({
    origin,
    path: `experience-pillars/${id}/`,
    method: "DELETE",
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as { message: string; deleted_id: number },
  });
  if (res.ok) {
    revalidatePath("/workspace/content/experience");
  }
  return res;
}
