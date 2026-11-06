import type { ReactNode } from "react";

export interface FormFieldProps {
  id?: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  description,
  error,
  required,
  children,
  className = "",
}: FormFieldProps) {
  const effectiveId = id || label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const descId = description ? `${effectiveId}-desc` : undefined;
  const errId = error ? `${effectiveId}-error` : undefined;

  return (
    <div className={`ui-form-field ${error ? "ui-form-field--error" : ""} ${className}`.trim()}>
      <div className="ui-form-field__label-row">
        <label htmlFor={effectiveId} className="ui-form-field__label">
          {label}
          {required && <span className="ui-form-field__required" aria-hidden="true">*</span>}
        </label>
      </div>
      {description && (
        <p id={descId} className="ui-form-field__desc">
          {description}
        </p>
      )}
      <div className="ui-form-field__control">{children}</div>
      {error && (
        <p id={errId} role="alert" className="ui-form-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
