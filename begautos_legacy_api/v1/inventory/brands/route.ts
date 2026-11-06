const backendBaseUrl =
  process.env.NEXT_INTERNAL_API_ORIGIN?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export async function GET() {
  try {
    const upstream = await fetch(`${backendBaseUrl}/api/v1/inventory/brands/`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Brands proxy error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to fetch brands",
        data: [],
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
