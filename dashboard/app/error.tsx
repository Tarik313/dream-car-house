"use client";
import { State } from "@/components/states";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <State title="Unable to load this page" tone="error">
    <p>Please try again. No changes have been submitted.</p>
    <button className="button" onClick={reset}>Try again</button>
  </State>;
}
