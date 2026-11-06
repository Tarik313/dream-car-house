import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getConsultationSectionDashboard, getSalesRepresentatives } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { ConsultationClient } from "./consultation-client";

export const dynamic = "force-dynamic";

export default async function ConsultationSectionPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/consultation");
    }
    return (
      <>
        <PageHeader href="/workspace/content/consultation" description="Homepage Consultation Section" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const res = await getConsultationSectionDashboard();
  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/consultation" description="Homepage Consultation Section" />
        <State title="Failed to Load Consultation Section" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const repsRes = await getSalesRepresentatives({ page_size: 100 }).catch(() => ({ ok: true, data: { results: [] } }));
  const reps = repsRes.ok && repsRes.data ? repsRes.data.results : [];

  return (
    <>
      <PageHeader
        href="/workspace/content/consultation"
        description="Configure homepage Private Automotive Concierge: Pill tag, heading, advisory description, 3 trust pills, primary appointment action, and WhatsApp representative routing."
      />
      <ConsultationClient
        initialData={res.data}
        representatives={reps}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
