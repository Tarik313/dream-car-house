import "server-only";

export type ApiErrorCode =
  | "AUTH_NOT_CONFIGURED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "CONFIGURATION"
  | "INVALID_CREDENTIALS"
  | "CSRF_REJECTED"
  | "THROTTLED"
  | "VALIDATION_ERROR"
  | "CASCADE_IMPACT"
  | "PROTECTED_CASCADE";

export type ApiResult<T> =
  | { ok: true; data: T; cookies?: string[] }
  | {
      ok: false;
      error: {
        code: ApiErrorCode;
        message: string;
        status?: number;
        fieldErrors?: Record<string, string[] | string>;
        details?: unknown;
      };
    };

export function failure(
  code: ApiErrorCode,
  message: string,
  status?: number,
  fieldErrors?: Record<string, string[] | string>,
  details?: unknown
): ApiResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(status === undefined ? {} : { status }),
      ...(fieldErrors ? { fieldErrors } : {}),
      ...(details !== undefined ? { details } : {}),
    },
  };
}

export type DashboardPath =
  | "access/"
  | "auth/login/"
  | "auth/logout/"
  | "auth/me/"
  | (string & {});

/** Internal transport: callers must authorize the user first; never pass browser-supplied origins. */
export async function requestDashboard<T>({
  origin,
  path,
  method = "GET",
  body,
  cookie,
  csrfToken,
  credential,
  decode,
  timeoutMs = 5000,
}: {
  origin: string | undefined;
  path: DashboardPath;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  cookie?: string;
  csrfToken?: string;
  credential?: string;
  decode: (value: unknown) => T | undefined;
  timeoutMs?: number;
}): Promise<ApiResult<T>> {
  // If no cookie and no credential provided, and not a login request, reject early
  if (path !== "auth/login/" && !cookie?.trim() && !credential?.trim()) {
    return failure("UNAUTHENTICATED", "Dashboard credentials are required.");
  }

  if (!origin) return failure("CONFIGURATION", "Dashboard backend is not configured.");

  let url: URL;
  try {
    url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
      return failure("CONFIGURATION", "Dashboard backend origin is invalid.");
    }
    const [pathPart, searchPart] = path.split("?");
    const cleanPath = (pathPart || "").replace(/^\/+/, "");
    url.pathname = `/api/v1/dashboard/${cleanPath}`;
    if (searchPart) {
      url.search = searchPart;
    }
  } catch {
    return failure("CONFIGURATION", "Dashboard backend origin is invalid.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (credential) {
    headers["Authorization"] = credential;
  }
  if (cookie) {
    headers["Cookie"] = cookie;
  }
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    // When sending FormData, let fetch automatically set multipart boundary header
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });

    const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];

    if (!response.ok) {
      let code: ApiErrorCode =
        response.status === 401
          ? "UNAUTHENTICATED"
          : response.status === 403
          ? "FORBIDDEN"
          : response.status === 404
          ? "NOT_FOUND"
          : response.status === 429
          ? "THROTTLED"
          : response.status === 409
          ? "CASCADE_IMPACT"
          : response.status === 400
          ? "VALIDATION_ERROR"
          : "UNAVAILABLE";

      let parsedMessage = "Dashboard request could not be completed.";
      let fieldErrors: Record<string, string[] | string> | undefined;
      let details: unknown;

      try {
        const errJson: unknown = await response.json();
        if (
          typeof errJson === "object" &&
          errJson !== null &&
          "error" in errJson &&
          typeof errJson.error === "object" &&
          errJson.error !== null &&
          "code" in errJson.error
        ) {
          const errObj = errJson.error as Record<string, unknown>;
          const rawCode = String(errObj.code || "");
          const rawMessage = String(errObj.message || "");
          if (rawMessage) parsedMessage = rawMessage;
          if (rawCode === "INVALID_CREDENTIALS") code = "INVALID_CREDENTIALS";
          else if (rawCode === "AUTH_NOT_CONFIGURED") code = "AUTH_NOT_CONFIGURED";
          else if (rawCode === "VALIDATION_ERROR") code = "VALIDATION_ERROR";
          else if (rawCode === "CASCADE_IMPACT") code = "CASCADE_IMPACT";
          else if (rawCode === "CSRF_FAILED" || (response.status === 403 && rawMessage.toLowerCase().includes("csrf"))) {
            code = "CSRF_REJECTED";
          }
          if ("field_errors" in errObj && typeof errObj.field_errors === "object") {
            fieldErrors = errObj.field_errors as Record<string, string[] | string>;
          }
          if ("details" in errObj) {
            details = errObj.details;
          }
        }
      } catch {
        // use default fallback
      }

      return failure(code, parsedMessage, response.status, fieldErrors, details);
    }

    const resJson: unknown = await response.json();
    if (
      typeof resJson !== "object" ||
      resJson === null ||
      !("success" in resJson) ||
      resJson.success !== true ||
      !("data" in resJson)
    ) {
      return failure("INVALID_RESPONSE", "Dashboard returned an unexpected response.");
    }

    const data = decode(resJson.data);
    return data === undefined
      ? failure("INVALID_RESPONSE", "Dashboard returned invalid data.")
      : { ok: true, data, cookies: setCookies };
  } catch (error) {
    if (controller.signal.aborted) return failure("TIMEOUT", "Dashboard request timed out.");
    if (error instanceof SyntaxError) return failure("INVALID_RESPONSE", "Dashboard returned invalid JSON.");
    return failure("UNAVAILABLE", "Dashboard backend is unavailable.");
  } finally {
    clearTimeout(timer);
  }
}
