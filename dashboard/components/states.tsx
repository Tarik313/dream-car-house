import type { ReactNode } from "react";
export function State({ title, children, tone = "neutral" }: {
  title: string; children: ReactNode; tone?: "neutral" | "error";
}) {
  return <section className={`state state--${tone}`} aria-label={title}>
    <h2>{title}</h2><div className="muted">{children}</div>
  </section>;
}
export function LoadingState() {
  return <div role="status" aria-live="polite" className="state"><h2>Loading workspace…</h2><p>Please wait.</p></div>;
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <State title={title}><p>{description}</p></State>;
}
export function LockedState() {
  return <State title="Workspace access is locked">
    <p>Dashboard sign-in is not available yet. Business records remain protected.</p>
    <p>Continue using your existing Django admin workflow.</p>
  </State>;
}
