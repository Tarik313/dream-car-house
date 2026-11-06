"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requestDashboard } from "@/lib/server/transport";
import { validateSafeRedirect, type DashboardUser } from "@/lib/server/auth";

export type LoginActionState = {
  error?: string;
  fieldErrors?: { username?: string; password?: string };
};

type LoginResponseData = {
  user: DashboardUser;
  csrf_token: string;
};

function decodeLoginResponse(val: unknown): LoginResponseData | undefined {
  if (typeof val !== "object" || val === null) return undefined;
  const d = val as Record<string, unknown>;
  const user = d.user as Record<string, unknown> | undefined;
  if (!user || typeof user !== "object") return undefined;
  if (
    typeof user.id !== "number" ||
    typeof user.username !== "string" ||
    typeof user.email !== "string" ||
    typeof user.is_staff !== "boolean" ||
    typeof user.is_superuser !== "boolean" ||
    !Array.isArray(user.permissions) ||
    typeof d.csrf_token !== "string"
  ) {
    return undefined;
  }
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      permissions: user.permissions.map(String),
    },
    csrf_token: d.csrf_token,
  };
}

export async function loginAction(
  _prevState: LoginActionState | undefined,
  formData: FormData
): Promise<LoginActionState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const nextTarget = formData.get("next") ? String(formData.get("next")) : "/workspace";

  if (!username) {
    return { fieldErrors: { username: "Username is required." } };
  }
  if (!password) {
    return { fieldErrors: { password: "Password is required." } };
  }

  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";

  const result = await requestDashboard<LoginResponseData>({
    origin,
    path: "auth/login/",
    method: "POST",
    body: { username, password },
    decode: decodeLoginResponse,
  });

  if (!result.ok) {
    if (result.error.code === "INVALID_CREDENTIALS" || result.error.code === "FORBIDDEN" || result.error.code === "UNAUTHENTICATED") {
      return { error: "Invalid username or password. Active staff access is required." };
    }
    if (result.error.code === "THROTTLED") {
      return { error: "Too many login attempts. Please wait a moment and try again." };
    }
    return { error: "Login service is currently unavailable. Please check your backend connection." };
  }

  // Set session and CSRF cookies on the Next.js response
  const cookieStore = await cookies();
  const setCookies = result.cookies || [];

  let sessionidValue: string | undefined;
  let csrftokenValue: string | undefined;

  for (const cookieHeader of setCookies) {
    const parts = cookieHeader.split(";")[0]?.split("=") || [];
    const name = parts[0]?.trim();
    const val = parts.slice(1).join("=").trim();
    if (name === "sessionid") sessionidValue = val;
    if (name === "csrftoken") csrftokenValue = val;
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (sessionidValue) {
    cookieStore.set("sessionid", sessionidValue, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });
  }

  const csrfToSet = csrftokenValue || result.data.csrf_token;
  if (csrfToSet) {
    cookieStore.set("csrftoken", csrfToSet, {
      httpOnly: false, // CSRF token needs to be readable for forms/headers
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  const destination = validateSafeRedirect(nextTarget, "/workspace");
  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;

  if (sessionid) {
    const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
    const cookieHeader = `sessionid=${sessionid}${csrftoken ? `; csrftoken=${csrftoken}` : ""}`;

    await requestDashboard({
      origin,
      path: "auth/logout/",
      method: "POST",
      cookie: cookieHeader,
      csrfToken: csrftoken,
      decode: (val) => val,
    });
  }

  cookieStore.delete("sessionid");
  cookieStore.delete("csrftoken");

  redirect("/login");
}
