import { NextRequest, NextResponse } from "next/server";
import { validateSafeRedirect, verifyDashboardSession } from "@/lib/server/session";

function resolveRequestOrigin(request: NextRequest): string {
  const protoHeader = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    protoHeader === "https" || protoHeader === "http"
      ? protoHeader
      : request.nextUrl.protocol.replace(/:$/, "") || "http";

  const rawHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host")?.split(",")[0]?.trim() ||
    request.nextUrl.host;

  if (rawHost && !/[\s/\\@]/.test(rawHost) && !rawHost.startsWith("0.0.0.0")) {
    try {
      const candidate = new URL(`${proto}://${rawHost}`);
      if (candidate.host === rawHost) {
        return candidate.origin;
      }
    } catch {
      // Fall back to NextRequest origin
    }
  }
  return request.nextUrl.origin;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const sessionid = request.cookies.get("sessionid")?.value;
  const csrftoken = request.cookies.get("csrftoken")?.value;

  const access = await verifyDashboardSession({ sessionid, csrftoken });
  if (!access.allowed) {
    const requestedPath = validateSafeRedirect(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      "/workspace"
    );
    const loginUrl = new URL("/login", resolveRequestOrigin(request));
    loginUrl.searchParams.set("next", requestedPath);
    return NextResponse.redirect(loginUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, private",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace", "/workspace/:path*"],
};

