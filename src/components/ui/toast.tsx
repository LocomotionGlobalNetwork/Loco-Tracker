"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "destructive" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let memoryToasts: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener(memoryToasts);
  }
}

export const toast = {
  custom(item: Omit<ToastItem, "id">) {
    const id = Math.random().toString(36).slice(2, 9);
    const duration = item.duration ?? 3500;
    const newToast: ToastItem = { ...item, id, duration };
    memoryToasts = [...memoryToasts, newToast];
    emitChange();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },

  success(title: string, description?: string) {
    return toast.custom({ title, description, variant: "success" });
  },

  error(title: string, description?: string) {
    return toast.custom({ title, description, variant: "destructive" });
  },

  info(title: string, description?: string) {
    return toast.custom({ title, description, variant: "info" });
  },

  dismiss(id?: string) {
    if (id) {
      memoryToasts = memoryToasts.filter((t) => t.id !== id);
    } else {
      memoryToasts = [];
    }
    emitChange();
  },
};

const EMPTY_TOASTS: ToastItem[] = [];

function subscribe(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return memoryToasts;
}

function getServerSnapshot() {
  return EMPTY_TOASTS;
}

export function useToasts() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function Toaster() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  // Show up to 4 most recent toasts in top-down stack
  const visibleToasts = toasts.slice(-4);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-3.5 inset-x-3.5 sm:inset-x-auto sm:top-[76px] sm:right-6 z-[60] flex flex-col gap-2.5 pointer-events-none w-auto sm:w-full sm:max-w-sm"
    >
      {visibleToasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 sm:p-4 shadow-lg transition-all text-xs animate-in fade-in-0 slide-in-from-top-2 duration-150",
            "bg-card text-card-foreground border-border",
            t.variant === "destructive" && "border-destructive/30 bg-destructive/5 text-destructive",
            t.variant === "success" && "border-emerald-500/30 bg-emerald-500/5 text-foreground",
            t.variant === "info" && "border-sky-500/30 bg-sky-500/5 text-foreground"
          )}
        >
          {t.variant === "success" && (
            <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          {t.variant === "destructive" && (
            <AlertCircle className="size-4.5 text-destructive shrink-0 mt-0.5" />
          )}
          {t.variant === "info" && (
            <Info className="size-4.5 text-sky-500 shrink-0 mt-0.5" />
          )}
          {(!t.variant || t.variant === "default") && (
            <Info className="size-4.5 text-muted-foreground shrink-0 mt-0.5" />
          )}

          <div className="flex-1 space-y-0.5 min-w-0">
            {t.title && <p className="font-semibold text-xs sm:text-[13px] leading-tight">{t.title}</p>}
            {t.description && (
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-normal">{t.description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tutup notifikasi"
          >
            <X className="size-3.5 sm:size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

