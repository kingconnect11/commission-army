"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

const variantStyles: Record<
  ToastVariant,
  { bg: string; border: string; icon: typeof CheckCircle2; iconClass: string }
> = {
  success: {
    bg: "bg-forest-900/20",
    border: "border-forest-800/30",
    icon: CheckCircle2,
    iconClass: "text-forest-400",
  },
  error: {
    bg: "bg-crimson-900/20",
    border: "border-crimson-800/30",
    icon: XCircle,
    iconClass: "text-crimson-400",
  },
  info: {
    bg: "bg-navy-800/60",
    border: "border-navy-700/40",
    icon: Info,
    iconClass: "text-navy-300",
  },
};

export function ToastItemView({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const styles = variantStyles[item.variant];
  const Icon = styles.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border shadow-lg animate-fade-in min-w-[280px] max-w-[400px]",
        styles.bg,
        styles.border
      )}
    >
      <Icon size={18} className={cn("shrink-0 mt-0.5", styles.iconClass)} />
      <p className="text-sm text-text-primary flex-1">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="btn-ghost p-1 rounded shrink-0 text-text-muted hover:text-text-primary"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => remove(id), AUTO_DISMISS_MS);
  }, [remove]);

  const toast = useCallback(
    (message: string, variant?: ToastVariant) => add(message, variant ?? "info"),
    [add]
  );
  const success = useCallback((message: string) => add(message, "success"), [add]);
  const error = useCallback((message: string) => add(message, "error"), [add]);
  const info = useCallback((message: string) => add(message, "info"), [add]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        <div className="flex flex-col gap-2 pointer-events-auto">
          {items.map((item) => (
            <ToastItemView key={item.id} item={item} onDismiss={remove} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
