import { requestDashboard } from "./transport";
import type { DashboardAccess, DashboardUser } from "../types";

export function validateSafeRedirect(
  target: string | null | undefined,
  fallback = "/workspace"
): string {
  if (!target) return fallback;
  if (target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")) {
    try {
      const parsed = new URL(target, "http://127.0.0.1");
      if (parsed.origin === "http://127.0.0.1") {
        return parsed.pathname + parsed.search;
      }
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function decodeUserData(val: unknown): DashboardUser | undefined {
  if (typeof val !== "object" || val === null) return undefined;
  const user = "user" in val ? (val as { user: unknown }).user : val;
  if (typeof user !== "object" || user === null) return undefined;
  const u = user as Record<string, unknown>;
  if (
    typeof u.id !== "number" ||
    typeof u.username !== "string" ||
    typeof u.email !== "string" ||
    typeof u.is_staff !== "boolean" ||
    typeof u.is_superuser !== "boolean" ||
    !Array.isArray(u.permissions)
  ) {
    return undefined;
  }
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    is_staff: u.is_staff,
    is_superuser: u.is_superuser,
    permissions: u.permissions.map(String),
  };
}

export function buildDashboardCookieHeader(
  sessionid?: string | null,
  csrftoken?: string | null
): string {
  const sid = sessionid?.trim();
  if (!sid) return "";
  const csrf = csrftoken?.trim();
  return `sessionid=${sid}${csrf ? `; csrftoken=${csrf}` : ""}`;
}

export async function verifyDashboardSession(params: {
  sessionid?: string | null;
  csrftoken?: string | null;
  origin?: string;
}): Promise<DashboardAccess> {
  const cookieHeader = buildDashboardCookieHeader(params.sessionid, params.csrftoken);
  if (!cookieHeader) {
    return { allowed: false, reason: "UNAUTHENTICATED" };
  }

  const origin =
    params.origin || process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";

  const result = await requestDashboard<DashboardUser>({
    origin,
    path: "auth/me/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: params.csrftoken?.trim() || undefined,
    decode: decodeUserData,
  });

  if (!result.ok) {
    if (result.error.code === "UNAUTHENTICATED") {
      return { allowed: false, reason: "UNAUTHENTICATED" };
    }
    if (result.error.code === "FORBIDDEN") {
      return { allowed: false, reason: "FORBIDDEN" };
    }
    return { allowed: false, reason: "AUTH_UNAVAILABLE" };
  }

  if (!result.data.is_staff) {
    return { allowed: false, reason: "FORBIDDEN" };
  }

  return {
    allowed: true,
    user: result.data,
    csrfToken: params.csrftoken?.trim() || undefined,
  };
}
