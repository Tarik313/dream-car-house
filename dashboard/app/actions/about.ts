"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type { AboutSectionItem } from "@/lib/types";

async function getAuthContext() {
  const cookieStore = await cookies();
  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const csrftoken = cookieStore.get("csrftoken")?.value;
  return { origin, cookieHeader, csrftoken };
}

export async function updateAboutSectionAction(
  formData: FormData
): Promise<ApiResult<AboutSectionItem>> {
  const { origin, cookieHeader, csrftoken } = await getAuthContext();
  const res = await requestDashboard<AboutSectionItem>({
    origin,
    path: "about-us/",
    method: "POST",
    body: formData,
    cookie: cookieHeader,
    csrfToken: csrftoken,
    decode: (val) => val as AboutSectionItem,
  });
  if (res.ok) {
    revalidatePath("/workspace/content/about-us");
  }
  return res;
}
