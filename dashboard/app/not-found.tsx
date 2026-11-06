import Link from "next/link";
import { EmptyState } from "@/components/states";
export default function NotFound() {
  return <><EmptyState title="Page not found" description="This dashboard page is not available." /><Link href="/">Return to access status</Link></>;
}
