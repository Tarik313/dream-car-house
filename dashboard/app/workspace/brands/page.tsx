import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getBrands } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { BrandListClient } from "./brand-client";

export const dynamic = "force-dynamic";

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; segment?: string; page?: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/brands");
    }
    return (
      <>
        <PageHeader href="/workspace/brands" description="Brand catalog management" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getBrands({
    q: sp.q,
    status: sp.status,
    segment: sp.segment,
    page: sp.page,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/brands" description="Brand catalog management" />
        <State title="Failed to Load Brands" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/brands"
        description="Manage vehicle brands, brand logos, on-page SEO, rich descriptions, and search indexing."
      />
      <BrandListClient
        initialBrands={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        status={sp.status || ""}
        segment={sp.segment || ""}
      />
    </>
  );
}
