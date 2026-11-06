import type { InputHTMLAttributes, ReactNode } from "react";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: string;
}

export function Switch({
  label,
  description,
  id,
  className = "",
  disabled,
  checked,
  ...props
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={`ui-switch-label ${disabled ? "ui-switch-label--disabled" : ""} ${className}`.trim()}
    >
      <input
        type="checkbox"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        checked={checked}
        className="ui-switch"
        {...props}
      />
      <span className="ui-switch-track" aria-hidden="true">
        <span className="ui-switch-thumb" />
      </span>
      {(label || description) && (
        <span className="ui-switch-content">
          {label && <span className="ui-switch-text">{label}</span>}
          {description && <span className="ui-switch-desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
