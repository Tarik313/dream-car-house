import "server-only";
import { getDashboardAccess, type DashboardUser } from "./auth";
import { failure, type ApiResult } from "./transport";

export type ManagementAccess = {
  user: DashboardUser;
  csrfToken?: string;
};

// Public entry point for Server Components. Fails closed before any business
// fetch if the user session is missing, inactive, non-staff or invalid.
export async function getManagementAccess(): Promise<ApiResult<ManagementAccess>> {
  const access = await getDashboardAccess();
  if (!access.allowed) {
    if (access.reason === "UNAUTHENTICATED") {
      return failure("UNAUTHENTICATED", "Sign in required to access management workspace.", 401);
    }
    if (access.reason === "FORBIDDEN") {
      return failure("FORBIDDEN", "Active staff credentials required.", 403);
    }
    return failure("UNAVAILABLE", "Authentication service is currently unavailable.", 503);
  }
  return {
    ok: true,
    data: {
      user: access.user,
      csrfToken: access.csrfToken,
    },
  };
}
