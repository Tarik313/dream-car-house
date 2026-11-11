"use server";

import { revalidatePath } from "next/cache";
import { getDashboardActionAuthContext as getAuthContext } from "@/lib/server/auth";
import { requestDashboard, type ApiResult } from "@/lib/server/transport";
import type { AboutSectionItem } from "@/lib/types";

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
