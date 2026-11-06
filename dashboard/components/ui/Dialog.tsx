"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export function Dialog({
  isOpen,
  open,
  onClose,
  title,
  description,
  children,
  actions,
  maxWidth = "md",
}: DialogProps) {
  const activeOpen = open !== undefined ? open : !!isOpen;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      previouslyFocusedRef.current?.focus();
    }
  }, [activeOpen]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDialogElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className={`ui-dialog ui-dialog--${maxWidth}`}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-desc" : undefined}
    >
      <div className="ui-dialog__content">
        <header className="ui-dialog__header">
          <div>
            <h2 id="dialog-title" className="ui-dialog__title">
              {title}
            </h2>
            {description && (
              <p id="dialog-desc" className="ui-dialog__desc">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-dialog__close"
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>

        <div className="ui-dialog__body">{children}</div>

        {actions && <footer className="ui-dialog__footer">{actions}</footer>}
      </div>
    </dialog>
  );
}
