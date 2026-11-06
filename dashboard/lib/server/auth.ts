import "server-only";
import { cookies } from "next/headers";
import { requestDashboard } from "./transport";

import type { DashboardUser, DashboardAccess } from "../types";
export type { DashboardUser, DashboardAccess };

function decodeUserData(val: unknown): DashboardUser | undefined {
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

export function validateSafeRedirect(target: string | null | undefined, fallback = "/workspace"): string {
  if (!target) return fallback;
  // Must start with '/' and must not start with '//' or contain control characters
  if (target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")) {
    // avoid any open redirect attempt with protocol-like strings
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

/**
 * Checks current request session against Django auth/me endpoint.
 * Fails closed if no session cookie or backend rejects.
 */
export async function getDashboardAccess(): Promise<DashboardAccess> {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;

  if (!sessionid) {
    return { allowed: false, reason: "UNAUTHENTICATED" };
  }

  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  const cookieHeader = `sessionid=${sessionid}${csrftoken ? `; csrftoken=${csrftoken}` : ""}`;

  const result = await requestDashboard<DashboardUser>({
    origin,
    path: "auth/me/",
    method: "GET",
    cookie: cookieHeader,
    csrfToken: csrftoken,
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

  return { allowed: true, user: result.data, csrfToken: csrftoken };
}

/**
 * Checks if the user holds a specific model permission.
 * e.g. "inventory.view_inventory"
 */
export function hasPermission(user: DashboardUser, permission: string): boolean {
  if (user.is_superuser || user.permissions.includes("*")) {
    return true;
  }
  return user.permissions.includes(permission);
}
