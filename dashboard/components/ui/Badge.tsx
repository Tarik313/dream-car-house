import type { ReactNode } from "react";

export type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";

export interface BadgeProps {
  variant?: BadgeVariant;
  tone?: BadgeVariant | "brand" | "error";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, tone, children, className = "" }: BadgeProps) {
  let resolved: BadgeVariant = "neutral";
  const candidate = variant || tone;
  if (candidate === "brand") resolved = "accent";
  else if (candidate === "error") resolved = "danger";
  else if (candidate) resolved = candidate;

  return (
    <span className={`ui-badge ui-badge--${resolved} ${className}`.trim()}>
      {children}
    </span>
  );
}
