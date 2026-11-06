import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getInventoryList, getBrands } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { InventoryListClient } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    registered?: string;
    brand?: string;
    car_type?: string;
    is_featured?: string;
    ordering?: string;
    page?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/inventory");
    }
    return (
      <>
        <PageHeader href="/workspace/inventory" description="Inventory Management" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const [invRes, brandsRes] = await Promise.all([
    getInventoryList({
      q: sp.q,
      status: sp.status,
      registered: sp.registered,
      brand: sp.brand,
      car_type: sp.car_type,
      is_featured: sp.is_featured,
      ordering: sp.ordering,
      page: sp.page,
    }),
    getBrands({ page_size: 100 }),
  ]);

  if (!invRes.ok) {
    return (
      <>
        <PageHeader href="/workspace/inventory" description="Inventory Management" />
        <State title="Failed to Load Inventory" tone="error">
          <p>{invRes.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = invRes.data;
  const brands = brandsRes.ok ? brandsRes.data.results : [];

  return (
    <>
      <PageHeader
        href="/workspace/inventory"
        description="Comprehensive vehicle showroom management, pricing, availability and publishing status."
      />
      <InventoryListClient
        initialInventory={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        brands={brands}
        q={sp.q || ""}
        status={sp.status || ""}
        registered={sp.registered || ""}
        currentBrand={sp.brand || ""}
        carType={sp.car_type || ""}
      />
    </>
  );
}
