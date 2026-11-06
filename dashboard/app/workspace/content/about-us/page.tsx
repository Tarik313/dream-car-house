import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getAboutSectionDashboard, getShowroomBranchList } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { AboutClient } from "./about-client";

export const dynamic = "force-dynamic";

export default async function AboutUsManagementPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/about-us");
    }
    return (
      <>
        <PageHeader href="/workspace/content/about-us" description="About Us Page Management" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const [aboutRes, branchesRes] = await Promise.all([
    getAboutSectionDashboard(),
    getShowroomBranchList({ page_size: 50 }).catch(() => ({ ok: false as const })),
  ]);

  if (!aboutRes.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/about-us" description="About Us Page Management" />
        <State title="Failed to Load About Us Content" tone="error">
          <p>{aboutRes.error.message}</p>
        </State>
      </>
    );
  }

  const branches = branchesRes.ok ? branchesRes.data.results : [];

  return (
    <>
      <PageHeader
        href="/workspace/content/about-us"
        description="Configure About Us page: Cinematic Hero narrative, 4 trust metrics/counters, split heritage story, 4K showroom reel video, 4 Distinction Pillars, and VIP Consultation CTA."
      />
      <AboutClient
        initialData={aboutRes.data}
        branches={branches}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
