import { permanentRedirect, notFound } from "next/navigation";
import { getBackendOrigin } from "@/lib/server/api";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CarDetailByIdPage({ params }: PageProps) {
  const { id } = await params;
  const origin = getBackendOrigin();

  let res: Response;
  try {
    res = await fetch(`${origin}/api/v1/inventory/detail/${encodeURIComponent(id)}/`, {
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    notFound();
  }

  if (res.status === 301 || res.status === 302) {
    const loc = res.headers.get("location");
    if (loc) {
      const match = loc.match(/\/api\/v1\/inventory\/detail\/([^/]+)\/?/);
      if (match && match[1]) {
        permanentRedirect(`/cars/${match[1]}`);
      }
    }
  }

  if (res.ok) {
    try {
      const json = await res.json();
      if (json?.data?.slug) {
        permanentRedirect(`/cars/${json.data.slug}`);
      }
    } catch {
      notFound();
    }
  }

  notFound();
}
