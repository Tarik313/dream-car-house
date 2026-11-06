import Link from "next/link";
import { allRoutes } from "@/lib/navigation";

export function PageHeader({
  href,
  description,
  title,
}: {
  href: string;
  description: string;
  title?: string;
}) {
  const meta = allRoutes[href];
  const label = title || meta?.label || "Page";

  return (
    <header className="page-header">
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumbs">
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li aria-current="page">{label}</li>
        </ol>
      </nav>
      <h1>{label}</h1>
      <p className="muted">{description}</p>
    </header>
  );
}
