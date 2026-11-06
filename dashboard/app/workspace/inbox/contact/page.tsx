import { redirect } from "next/navigation";
import { getManagementAccess } from "@/lib/server/api";
import { getContactMessages } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { ContactInboxClient } from "./contact-client";

export const dynamic = "force-dynamic";

export default async function ContactInboxPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    topic?: string;
    preferred_contact?: string;
    ordering?: string;
    page?: string;
    page_size?: string;
  }>;
}) {
  const access = await getManagementAccess();
  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace/inbox/contact");
    }
    return (
      <>
        <PageHeader href="/workspace/inbox/contact" description="Contact Inbox" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
        </State>
      </>
    );
  }

  const sp = await searchParams;
  const res = await getContactMessages({
    q: sp.q,
    topic: sp.topic,
    preferred_contact: sp.preferred_contact,
    ordering: sp.ordering,
    page: sp.page,
    page_size: sp.page_size,
  });

  if (!res.ok) {
    return (
      <>
        <PageHeader href="/workspace/inbox/contact" description="Contact Inbox" />
        <State title="Failed to Load Contact Messages" tone="error">
          <p>{res.error.message}</p>
        </State>
      </>
    );
  }

  const { results, total_rows, current_page, page_size } = res.data;

  return (
    <>
      <PageHeader
        href="/workspace/inbox/contact"
        description="Customer contact enquiries, service requests, and message submissions."
      />
      <ContactInboxClient
        initialMessages={results}
        totalRows={total_rows}
        currentPage={current_page}
        pageSize={page_size}
        q={sp.q || ""}
        topicFilter={sp.topic || ""}
        preferredContactFilter={sp.preferred_contact || ""}
        ordering={sp.ordering || ""}
        userPermissions={access.data.user.permissions}
      />
    </>
  );
}
