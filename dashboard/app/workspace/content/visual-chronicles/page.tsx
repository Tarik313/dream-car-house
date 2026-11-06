import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getVisualChroniclesSectionDashboard } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { ChroniclesClient } from "./chronicles-client";

export const dynamic = "force-dynamic";

export default async function VisualChroniclesPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/visual-chronicles");
    }
    return (
      <>
        <PageHeader href="/workspace/content/visual-chronicles" description="Homepage Visual Chronicles" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const res = await getVisualChroniclesSectionDashboard();
  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/visual-chronicles" description="Homepage Visual Chronicles" />
        <State title="Failed to Load Visual Chronicles" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  return (
    <>
      <PageHeader
        href="/workspace/content/visual-chronicles"
        description="Configure homepage Visual Chronicles: Header copy, stats badge, archive footer CTA, and the 5 interactive 3D flip mosaic tiles (Widescreen Hero, Portrait GT, Stuttgart Coupe, Cockpit Craftsmanship, Flagship SUV)."
      />
      <ChroniclesClient
        initialData={res.data}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
