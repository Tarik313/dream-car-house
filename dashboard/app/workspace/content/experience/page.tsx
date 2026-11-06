import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getExperienceSectionDashboard } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { ExperienceClient } from "./experience-client";

export const dynamic = "force-dynamic";

export default async function ExperienceSectionPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/experience");
    }
    return (
      <>
        <PageHeader href="/workspace/content/experience" description="Homepage Experience Pillars" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const res = await getExperienceSectionDashboard();
  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/experience" description="Homepage Experience Pillars" />
        <State title="Failed to Load Experience Section" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  return (
    <>
      <PageHeader
        href="/workspace/content/experience"
        description="Configure homepage Experience Beyond Ordinary: Section title, subtitle, showroom video reel trigger, and the 3 architectural delivery pillars (VIP Vault, Certified Audit, Bespoke Import)."
      />
      <ExperienceClient
        initialData={res.data}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
