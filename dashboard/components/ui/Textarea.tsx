import type { TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export function Textarea({ isError, className = "", ...props }: TextareaProps) {
  const classes = ["ui-textarea", isError ? "ui-textarea--error" : "", className]
    .filter(Boolean)
    .join(" ");

  return <textarea className={classes} {...props} />;
}
