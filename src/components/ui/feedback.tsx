"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackTone = "info" | "success" | "warning";

export type FeedbackItem = {
  id: string;
  title: string;
  description?: string;
  tone?: FeedbackTone;
  durationMs?: number;
};

type FeedbackContextValue = {
  notify: (item: Omit<FeedbackItem, "id">) => void;
  dismiss: (id: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (item: Omit<FeedbackItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const entry: FeedbackItem = {
        tone: "info",
        durationMs: 2800,
        ...item,
        id,
      };
      setItems((prev) => [entry, ...prev].slice(0, 4));
      if (entry.durationMs && entry.durationMs > 0) {
        setTimeout(() => dismiss(id), entry.durationMs);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackViewport items={items} onDismiss={dismiss} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}

function toneStyles(tone: FeedbackTone = "info") {
  switch (tone) {
    case "success":
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-300" />,
        container: "border-emerald-700/60 bg-emerald-950/80 text-emerald-50",
      };
    case "warning":
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-300" />,
        container: "border-amber-700/60 bg-amber-950/80 text-amber-50",
      };
    default:
      return {
        icon: <Info className="h-4 w-4 text-indigo-300" />,
        container: "border-indigo-700/60 bg-slate-950/85 text-slate-50",
      };
  }
}

export function FeedbackViewport({
  items,
  onDismiss,
}: {
  items: FeedbackItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div 
      className="pointer-events-none fixed right-4 top-20 z-[150] flex w-[320px] flex-col gap-3"
      data-tour="notification-viewport"
    >
      {items.map((item) => {
        const styles = toneStyles(item.tone);
        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border px-3 py-2 shadow-lg shadow-slate-950/60 backdrop-blur",
              "text-sm animate-in slide-in-from-right-5 fade-in duration-300",
              styles.container
            )}
            role="status"
            aria-live="polite"
            data-tour="notification-item"
          >
            <div className="mt-0.5">{styles.icon}</div>
            <div className="flex-1 space-y-0.5">
              <div className="font-semibold leading-tight">{item.title}</div>
              {item.description && <div className="text-xs opacity-80">{item.description}</div>}
            </div>
            <button
              className="rounded-full p-1 text-xs opacity-70 transition hover:bg-slate-800/50 hover:opacity-100"
              onClick={() => onDismiss(item.id)}
              aria-label="Dismiss notification"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function StatusChip({
  tone = "info",
  children,
}: {
  tone?: FeedbackTone;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-700/50 bg-emerald-900/30 text-emerald-100"
      : tone === "warning"
        ? "border-amber-700/50 bg-amber-950/30 text-amber-100"
        : "border-slate-700/60 bg-slate-900/60 text-slate-100";
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", toneClass)}>
      {children}
    </span>
  );
}
