import "server-only";
import { cookies } from "next/headers";
import {
  buildDashboardCookieHeader,
  validateSafeRedirect,
  verifyDashboardSession,
} from "./session";

import type { DashboardUser, DashboardAccess } from "../types";
export type { DashboardUser, DashboardAccess };
export { validateSafeRedirect };

/**
 * Resolves cookie credentials for dashboard server actions.
 * Returns an empty cookieHeader if no valid sessionid cookie is present so
 * transport.ts rejects unauthenticated calls before hitting the backend.
 */
export async function getDashboardActionAuthContext(): Promise<{
  origin: string;
  cookieHeader: string;
  csrftoken: string | undefined;
}> {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value?.trim();
  const csrftoken = cookieStore.get("csrftoken")?.value?.trim();
  const origin = process.env.DASHBOARD_API_ORIGIN || "http://127.0.0.1:8000";
  const cookieHeader = buildDashboardCookieHeader(sessionid, csrftoken);
  return { origin, cookieHeader, csrftoken };
}

/**
 * Checks current request session against Django auth/me endpoint.
 * Fails closed if no session cookie or backend rejects.
 */
export async function getDashboardAccess(): Promise<DashboardAccess> {
  const cookieStore = await cookies();
  const sessionid = cookieStore.get("sessionid")?.value;
  const csrftoken = cookieStore.get("csrftoken")?.value;
  return verifyDashboardSession({ sessionid, csrftoken });
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
