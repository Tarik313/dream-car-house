import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getVipSanctuarySectionDashboard, getShowroomBranchList } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SanctuaryClient } from "./sanctuary-client";

export const dynamic = "force-dynamic";

export default async function VipSanctuaryPage() {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/content/vip-sanctuary");
    }
    return (
      <>
        <PageHeader href="/workspace/content/vip-sanctuary" description="Homepage VIP Sanctuary" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const [sanctuaryRes, branchesRes] = await Promise.all([
    getVipSanctuarySectionDashboard(),
    getShowroomBranchList({ page_size: 50 }).catch(() => ({ ok: false as const })),
  ]);

  if (!sanctuaryRes.ok) {
    return (
      <>
        <PageHeader href="/workspace/content/vip-sanctuary" description="Homepage VIP Sanctuary" />
        <State title="Failed to Load VIP Sanctuary Section" tone="error">
          <p>{sanctuaryRes.error.message}</p>
        </State>
      </>
    );
  }

  const branches = branchesRes.ok ? branchesRes.data.results : [];

  return (
    <>
      <PageHeader
        href="/workspace/content/vip-sanctuary"
        description="Configure homepage VIP Sanctuary: Editorial narrative, 3 brand value pillars (Certified Provenance, Global Bespoke Sourcing, White-Glove VIP Advisory), appointment/vault CTAs, and the flagship studio card (branch association, viewing hours, hotline, WhatsApp concierge, and showroom video tour)."
      />
      <SanctuaryClient
        initialData={sanctuaryRes.data}
        branches={branches}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
