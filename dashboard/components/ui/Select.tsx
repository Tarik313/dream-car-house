import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly SelectOption[];
  isError?: boolean;
  placeholder?: string;
}

export function Select({
  options,
  isError,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  const classes = ["ui-select", isError ? "ui-select--error" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ui-select-wrapper">
      <select className={classes} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="ui-select-arrow" aria-hidden="true">
        ▼
      </span>
    </div>
  );
}
