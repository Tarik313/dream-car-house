import type { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  isError?: boolean;
}

export function Input({
  leftAddon,
  rightAddon,
  isError,
  className = "",
  disabled,
  ...props
}: InputProps) {
  const classes = [
    "ui-input",
    isError ? "ui-input--error" : "",
    leftAddon ? "ui-input--has-left" : "",
    rightAddon ? "ui-input--has-right" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (leftAddon || rightAddon) {
    return (
      <div className={`ui-input-group ${disabled ? "ui-input-group--disabled" : ""}`}>
        {leftAddon && <span className="ui-input-group__addon">{leftAddon}</span>}
        <input className={classes} disabled={disabled} {...props} />
        {rightAddon && <span className="ui-input-group__addon">{rightAddon}</span>}
      </div>
    );
  }

  return <input className={classes} disabled={disabled} {...props} />;
}
