import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getModelGenerations, getBrands } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { ModelGenerationListClient } from "./model-client";

export const dynamic = "force-dynamic";

export default async function ModelGenerationsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; q?: string; status?: string; page?: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/model-generations");
    }
    return (
      <>
        <PageHeader href="/workspace/model-generations" description="Model Generations" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const [modelsRes, brandsRes] = await Promise.all([
    getModelGenerations({
      brand: sp.brand,
      q: sp.q,
      status: sp.status,
      page: sp.page,
    }),
    getBrands({ page_size: 100 }),
  ]);

  if (!modelsRes.ok) {
    return (
      <>
        <PageHeader href="/workspace/model-generations" description="Model Generations" />
        <State title="Failed to Load Model Generations" tone="error">
          <p>{modelsRes.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = modelsRes.data;
  const brands = brandsRes.ok ? brandsRes.data.results : [];

  return (
    <>
      <PageHeader
        href="/workspace/model-generations"
        description="Manage vehicle model generations linked strictly to parent brands."
      />
      <ModelGenerationListClient
        initialModels={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        brands={brands}
        currentBrand={sp.brand || ""}
        q={sp.q || ""}
        status={sp.status || ""}
      />
    </>
  );
}
