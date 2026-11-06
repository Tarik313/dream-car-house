import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getBrands, getModelGenerations, getBodyStyles, getShowroomBranchList } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { InventoryFormClient } from "./form-client";

export const dynamic = "force-dynamic";

export default async function NewInventoryPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/inventory/new");
    }
    return (
      <>
        <PageHeader href="/workspace/inventory" description="Add Vehicle" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const [brandsRes, modelsRes, stylesRes, branchesRes] = await Promise.all([
    getBrands({ page_size: 100 }),
    getModelGenerations({ page_size: 200 }),
    getBodyStyles({ page_size: 100 }),
    getShowroomBranchList({ page_size: 100 }),
  ]);

  const brands = brandsRes.ok ? brandsRes.data.results : [];
  const models = modelsRes.ok ? modelsRes.data.results : [];
  const bodyStyles = stylesRes.ok ? stylesRes.data.results : [];
  const branches = branchesRes.ok ? branchesRes.data.results : [];

  return (
    <>
      <PageHeader href="/workspace/inventory" description="Create a new showroom vehicle entry." />
      <InventoryFormClient
        brands={brands}
        allModels={models}
        bodyStyles={bodyStyles}
        branches={branches}
      />
    </>
  );
}
