import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Car,
  Building2,
  GitBranch,
  Shapes,
  MessageSquare,
  Handshake,
  Mail,
  Users,
  Clapperboard,
  Globe,
  ArrowRight,
  LogOut,
  ShieldCheck,
  User,
  Search,
  FileText,
  Settings,
} from "lucide-react";
import { getManagementAccess } from "@/lib/server/api";
import { hasPermission } from "@/lib/server/auth";
import { getOverviewAggregates } from "@/lib/server/inventory";
import { PageHeader } from "@/components/page-header";
import { State } from "@/components/states";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const access = await getManagementAccess();

  if (!access.ok) {
    if (access.error.code === "UNAUTHENTICATED") {
      redirect("/login?next=/workspace");
    }

    return (
      <>
        <PageHeader href="/workspace" description="Management access" />
        <State title="Access Forbidden" tone="error">
          <p>{access.error.message}</p>
          <p>Active authorized staff credentials are required.</p>
        </State>
      </>
    );
  }

  const { user } = access.data;
  const overviewRes = await getOverviewAggregates();
  const overviewData = overviewRes.ok ? overviewRes.data : null;
  const metrics = overviewData?.metrics || {};
  const recent = overviewData?.recent_submissions || {};

  return (
    <>
      <PageHeader
        href="/workspace"
        description="Authenticated management workspace."
      />
      <div className="state">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <User size={20} style={{ color: "var(--accent)" }} />
          <h2 style={{ margin: 0 }}>Welcome, {user.username}</h2>
        </div>
        <p className="muted" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
          <ShieldCheck size={16} style={{ color: "var(--success)" }} />
          Role: <strong>{user.is_superuser ? "Superuser" : user.is_staff ? "Staff Member" : "Regular User"}</strong>
        </p>
        <p className="muted">
          Active permissions: {user.is_superuser ? "Full system access (*)" : `${user.permissions.length} model permission(s) granted`}
        </p>

        <section style={{ marginTop: "var(--space-4)" }}>
          <form action={logoutAction} className="logout-form">
            <button
              type="submit"
              className="button"
              style={{
                background: "var(--hover)",
                color: "var(--text)",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </section>
      </div>

      {/* Permission-Scoped Key Metrics Overview */}
      {overviewData && Object.keys(metrics).length > 0 && (
        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-1)" }}>Authorized Business Metrics</h2>
          <p className="muted" style={{ fontSize: "var(--font-size-sm)", marginBottom: "var(--space-4)" }}>
            Real-time ORM aggregates across authorized datasets. Metrics are omitted if permission is not granted.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
            {metrics.inventory && (
              <div style={{ padding: "var(--space-4)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--muted)", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>Vehicles in Fleet</span>
                  <Car size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{metrics.inventory.total}</div>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", fontSize: "var(--font-size-xs)" }}>
                  <span className="badge badge--success">{metrics.inventory.available} available</span>
                  <span className="badge badge--neutral">{metrics.inventory.sold} sold</span>
                </div>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Link href="/workspace/inventory" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    View inventory →
                  </Link>
                </div>
              </div>
            )}


            {metrics.quotes && (
              <div style={{ padding: "var(--space-4)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--muted)", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>Customer Quotes</span>
                  <MessageSquare size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{metrics.quotes.total}</div>
                <p className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "var(--space-3)", margin: "var(--space-3) 0 0 0" }}>
                  Submitted vehicle price enquiries
                </p>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Link href="/workspace/quotes" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    View all quotes →
                  </Link>
                </div>
              </div>
            )}

            {metrics.sell_cars && (
              <div style={{ padding: "var(--space-4)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--muted)", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>Sell Car Leads</span>
                  <Handshake size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{metrics.sell_cars.total}</div>
                <p className="muted" style={{ fontSize: "var(--font-size-xs)", margin: "var(--space-3) 0 0 0" }}>
                  Vehicle trade-in & valuation submissions
                </p>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Link href="/workspace/sell-cars" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    View sell car submissions →
                  </Link>
                </div>
              </div>
            )}

            {metrics.contact_messages && (
              <div style={{ padding: "var(--space-4)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--muted)", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>Contact Messages</span>
                  <Mail size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{metrics.contact_messages.total}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "var(--space-3)", fontSize: "11px" }}>
                  <span className="badge badge--neutral">{metrics.contact_messages.buying} buying</span>
                  <span className="badge badge--neutral">{metrics.contact_messages.selling} selling</span>
                  <span className="badge badge--neutral">{metrics.contact_messages.after_sales} after-sales</span>
                </div>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Link href="/workspace/inbox/contact" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    Open message inbox →
                  </Link>
                </div>
              </div>
            )}


            {metrics.users && (
              <div style={{ padding: "var(--space-4)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--muted)", marginBottom: "var(--space-2)" }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase" }}>User Accounts</span>
                  <ShieldCheck size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{metrics.users.total}</div>
                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", fontSize: "var(--font-size-xs)" }}>
                  <span className="badge badge--info">{metrics.users.staff} staff</span>
                  <span className="badge badge--danger">{metrics.users.superuser} admin</span>
                </div>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Link href="/workspace/users" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    Manage accounts →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bounded Recent Submissions */}
      {overviewData && (recent.quotes?.length || recent.sell_cars?.length || recent.contact_messages?.length) ? (
        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--font-size-lg)", marginBottom: "var(--space-1)" }}>Recent Submissions</h2>
          <p className="muted" style={{ fontSize: "var(--font-size-sm)", marginBottom: "var(--space-4)" }}>
            Initial server-rendered bounded records for swift inspection without extra roundtrips.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-4)" }}>
            {recent.quotes && recent.quotes.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <MessageSquare size={16} style={{ color: "var(--accent)" }} /> Recent Quotes
                  </h3>
                  <Link href="/workspace/quotes" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    All quotes →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {recent.quotes.map((q) => (
                    <div key={q.id} style={{ padding: "var(--space-2)", background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-sm)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                        <span>{q.name}</span>
                        <span className="muted" style={{ fontSize: "11px", fontWeight: 400 }}>
                          {q.created_at ? new Date(q.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <div className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "2px" }}>
                        {q.phone} • {q.car_name ? q.car_name : "General Enquiry"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recent.sell_cars && recent.sell_cars.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <Handshake size={16} style={{ color: "var(--accent)" }} /> Recent Sell Car Leads
                  </h3>
                  <Link href="/workspace/sell-cars" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    All leads →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {recent.sell_cars.map((s) => (
                    <div key={s.id} style={{ padding: "var(--space-2)", background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-sm)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                        <span>{s.car_name} {s.car_model} ({s.car_year})</span>
                      </div>
                      <div className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "2px" }}>
                        Seller: {s.name} • {s.phone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recent.contact_messages && recent.contact_messages.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <Mail size={16} style={{ color: "var(--accent)" }} /> Recent Contact Messages
                  </h3>
                  <Link href="/workspace/inbox/contact" className="link-button" style={{ fontSize: "var(--font-size-xs)" }}>
                    All messages →
                  </Link>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {recent.contact_messages.map((m) => (
                    <div key={m.id} style={{ padding: "var(--space-2)", background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-sm)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                        <span>{m.name}</span>
                        <span className="badge badge--neutral" style={{ fontSize: "10px" }}>{m.topic_display}</span>
                      </div>
                      <div className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "2px" }}>
                        {m.phone} • {m.vehicle || "General topic"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="note">
        <h2>Management Modules</h2>
        <p className="muted" style={{ marginBottom: "var(--space-4)" }}>
          All business modules enforce active staff and specific Django model permissions.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-3)" }}>
          {hasPermission(user, "inventory.view_inventory") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Car size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Inventory</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Showroom car stock, pricing, specs, media galleries, and search indexing.
                </p>
              </div>
              <Link
                href="/workspace/inventory"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Vehicles <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "inventory.view_brand") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Building2 size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Brands</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Vehicle brands, logos, segments, on-page rich content, and JSON-LD schema.
                </p>
              </div>
              <Link
                href="/workspace/brands"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Brands <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "inventory.view_modelgeneration") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <GitBranch size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Model Generations</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Model generations linked strictly to parent brands with cascade guards.
                </p>
              </div>
              <Link
                href="/workspace/model-generations"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Models <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "inventory.view_bodystyle") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Shapes size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Body Styles</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Vehicle body styles (SUV, Sedan, Hatchback, Coupe, etc.).
                </p>
              </div>
              <Link
                href="/workspace/body-styles"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Body Styles <ArrowRight size={14} />
              </Link>
            </div>
          )}


          {hasPermission(user, "inventory.view_inventoryquote") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <MessageSquare size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Customer Quotes</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Customer vehicle price quotes and showroom enquiries.
                </p>
              </div>
              <Link
                href="/workspace/quotes"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Quotes <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "home.view_sellcar") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Handshake size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Sell Car Leads</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Customer vehicle submissions, specifications, and photo gallery submissions.
                </p>
              </div>
              <Link
                href="/workspace/sell-cars"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Submissions <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "home.view_contactmessage") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Mail size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Contact Inbox</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Customer contact enquiries, service requests, and message submissions.
                </p>
              </div>
              <Link
                href="/workspace/inbox/contact"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                View Messages <ArrowRight size={14} />
              </Link>
            </div>
          )}


          {hasPermission(user, "home.view_slider") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Clapperboard size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Slider Videos</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Homepage banner videos and headlines (public API selects newest record).
                </p>
              </div>
              <Link
                href="/workspace/content/sliders"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Sliders <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "home.view_socialmedia") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Globe size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Social Links</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Dealership social media handles and channels (public API selects newest record).
                </p>
              </div>
              <Link
                href="/workspace/content/social-media"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Social Links <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "home.view_peopletalkaboutus") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Users size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Social Features</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  &quot;DCH across socials&quot; feature highlights, publications, and featured social media cards.
                </p>
              </div>
              <Link
                href="/workspace/content/social-features"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Social Features <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "home.view_salesrepresentative") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <User size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Sales Representatives</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Showroom sales advisors and direct contact representative directory.
                </p>
              </div>
              <Link
                href="/workspace/content/sales-representatives"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Representatives <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "seo_config.view_seoconfig") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Search size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>General Page SEO</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Search metadata, Open Graph, Twitter cards, and JSON-LD schema for static pages.
                </p>
              </div>
              <Link
                href="/workspace/seo/pages"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Page SEO <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "seo_config.view_categorypageseo") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <FileText size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Category Page SEO</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Listing pages editorial copy (H1, intro, long copy) and search indexing configurations.
                </p>
              </div>
              <Link
                href="/workspace/seo/categories"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Category SEO <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "home.view_sitesettings") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Settings size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>Site Settings &amp; Tab Icon</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Day/Night brand logos, browser tab icon (favicon), hotline, email, and footer identity.
                </p>
              </div>
              <Link
                href="/workspace/site-settings"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Site Settings <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "auth.view_user") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <Users size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>User Accounts</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Django staff accounts, group assignments, permissions, and credential management.
                </p>
              </div>
              <Link
                href="/workspace/users"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Users <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {hasPermission(user, "auth.view_group") && (
            <div style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                  <ShieldCheck size={18} style={{ color: "var(--accent)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--font-size-md)" }}>User Groups</h3>
                </div>
                <p className="muted" style={{ fontSize: "var(--font-size-sm)", margin: "0 0 var(--space-3) 0" }}>
                  Role-based permission groups and access policy management.
                </p>
              </div>
              <Link
                href="/workspace/groups"
                className="button button--secondary"
                style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "fit-content" }}
              >
                Manage Groups <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>


    </>
  );
}
