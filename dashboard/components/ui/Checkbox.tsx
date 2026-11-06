import type { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: string;
  isIndeterminate?: boolean;
}

export function Checkbox({
  label,
  description,
  id,
  className = "",
  isIndeterminate,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`ui-checkbox-label ${disabled ? "ui-checkbox-label--disabled" : ""} ${className}`.trim()}
    >
      <input
        type="checkbox"
        id={id}
        disabled={disabled}
        ref={(el) => {
          if (el) el.indeterminate = !!isIndeterminate;
        }}
        className="ui-checkbox"
        {...props}
      />
      {(label || description) && (
        <span className="ui-checkbox-content">
          {label && <span className="ui-checkbox-text">{label}</span>}
          {description && <span className="ui-checkbox-desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
