"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface DrawerProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  position?: "left" | "right";
  width?: "sm" | "md" | "lg";
  size?: "sm" | "md" | "lg" | string;
}

export function Drawer({
  isOpen,
  open,
  onClose,
  title,
  description,
  children,
  actions,
  position = "right",
  width,
  size,
}: DrawerProps) {
  const activeOpen = open !== undefined ? open : !!isOpen;
  const effectiveWidth: "sm" | "md" | "lg" =
    width || (size === "sm" || size === "lg" ? size : "md");

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
      className={`ui-drawer ui-drawer--${position} ui-drawer--${effectiveWidth}`}
      aria-labelledby="drawer-title"
      aria-describedby={description ? "drawer-desc" : undefined}
    >
      <div className="ui-drawer__content">
        <header className="ui-drawer__header">
          <div>
            <h2 id="drawer-title" className="ui-drawer__title">
              {title}
            </h2>
            {description && (
              <p id="drawer-desc" className="ui-drawer__desc">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-drawer__close"
            aria-label="Close drawer"
          >
            ×
          </button>
        </header>

        <div className="ui-drawer__body">{children}</div>

        {actions && <footer className="ui-drawer__footer">{actions}</footer>}
      </div>
    </dialog>
  );
}
