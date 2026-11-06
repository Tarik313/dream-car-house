"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: {
    (toast: Omit<Toast, "id">): void;
    (message: string, type?: ToastType): void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (arg1: Omit<Toast, "id"> | string, arg2: ToastType = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      let toast: Toast;
      if (typeof arg1 === "string") {
        toast = {
          id,
          type: arg2,
          title: arg1,
          duration: 4000,
        };
      } else {
        toast = {
          id,
          type: arg1.type,
          title: arg1.title,
          message: arg1.message,
          duration: arg1.duration ?? 4000,
        };
      }
      setToasts((prev) => [...prev, toast]);

      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div role="region" aria-label="Notifications" className="ui-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`ui-toast ui-toast--${toast.type}`}
          >
            <div className="ui-toast__content">
              <strong className="ui-toast__title">{toast.title}</strong>
              {toast.message && <p className="ui-toast__message">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="ui-toast__close"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const fallbackToastContext: ToastContextValue = {
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
};

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || fallbackToastContext;
}
