import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getSubscribers } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { SubscriberClient } from "./subscriber-client";

export const dynamic = "force-dynamic";

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    ordering?: string;
    page?: string;
    page_size?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/inbox/subscribers");
    }
    return (
      <>
        <PageHeader href="/workspace/inbox/subscribers" description="Subscribers" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getSubscribers({
    q: sp.q,
    ordering: sp.ordering,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/inbox/subscribers" description="Subscribers" />
        <State title="Failed to Load Subscribers" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/inbox/subscribers"
        description="Dealership newsletter subscribers and mailing list registry."
      />
      <SubscriberClient
        initialSubscribers={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        ordering={sp.ordering || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
