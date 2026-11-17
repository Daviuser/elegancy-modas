"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error";
type Toast = { id: number; message: string; tone: Tone };
type Ctx = { push: (message: string, tone?: Tone) => void };

const ToastContext = createContext<Ctx | null>(null);
let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, tone: Tone = "success") => {
    const id = ++counter;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 6000 : 3500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border bg-white px-4 py-3 text-sm shadow-lg",
              t.tone === "error" ? "border-red-800/30" : "border-gold-400/50",
            )}
          >
            {t.tone === "error" ? (
              <XCircle size={18} className="mt-0.5 shrink-0 text-red-700" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-gold-500" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
  return ctx;
}
