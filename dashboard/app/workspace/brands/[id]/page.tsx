import { notFound, redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getBrand } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { BrandEditClient } from "./edit-client";

export const dynamic = "force-dynamic";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/brands");
    }
    return (
      <>
        <PageHeader href="/workspace/brands" description="Brand details" />
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

  const brandRes = await getBrand(numId);
  if (!brandRes.ok) {
    if (brandRes.error.code === "NOT_FOUND") {
      notFound();
    }
    return (
      <>
        <PageHeader href="/workspace/brands" description="Brand details" />
        <State title="Failed to Load Brand" tone="error">
          <p>{brandRes.error.message}</p>
        </State>
      </>
    );
  }

  const brand = brandRes.data;

  return (
    <>
      <PageHeader
        href="/workspace/brands"
        description={`Edit brand: ${brand.name}`}
      />
      <BrandEditClient brand={brand} />
    </>
  );
}
