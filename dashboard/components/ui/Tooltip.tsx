import type { ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  return (
    <span className={`ui-tooltip-container ${className}`.trim()}>
      {children}
      <span
        role="tooltip"
        className={`ui-tooltip ui-tooltip--${position}`}
      >
        {content}
      </span>
    </span>
  );
}
