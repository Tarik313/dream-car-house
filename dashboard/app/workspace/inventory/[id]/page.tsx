import { notFound, redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import {
  getInventoryDetail,
  getBrands,
  getModelGenerations,
  getBodyStyles,
  getShowroomBranchList,
} from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { InventoryFormClient } from "../new/form-client";

export const dynamic = "force-dynamic";

export default async function EditInventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/inventory");
    }
    return (
      <>
        <PageHeader href="/workspace/inventory" description="Edit Vehicle" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    notFound();
  }

  const [carRes, brandsRes, modelsRes, stylesRes, branchesRes] = await Promise.all([
    getInventoryDetail(numId),
    getBrands({ page_size: 100 }),
    getModelGenerations({ page_size: 200 }),
    getBodyStyles({ page_size: 100 }),
    getShowroomBranchList({ page_size: 100 }),
  ]);

  if (!carRes.ok) {
    if (carRes.error.code === "NOT_FOUND") {
      notFound();
    }
    return (
      <>
        <PageHeader href="/workspace/inventory" description="Edit Vehicle" />
        <State title="Failed to Load Vehicle" tone="error">
          <p>{carRes.error.message}</p>
        </State>
      </>
    );
  }

  const car = carRes.data;
  const brands = brandsRes.ok ? brandsRes.data.results : [];
  const models = modelsRes.ok ? modelsRes.data.results : [];
  const bodyStyles = stylesRes.ok ? stylesRes.data.results : [];
  const branches = branchesRes.ok ? branchesRes.data.results : [];

  return (
    <>
      <PageHeader
        href="/workspace/inventory"
        description={`Edit vehicle: ${car.name}`}
      />
      <InventoryFormClient
        initialCar={car}
        brands={brands}
        allModels={models}
        bodyStyles={bodyStyles}
        branches={branches}
      />
    </>
  );
}
