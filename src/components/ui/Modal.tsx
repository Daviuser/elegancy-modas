"use client";

import { useEffect, useRef } from "react";

type Props = { open: boolean; onClose: () => void; title: string; children: React.ReactNode };

/** Modal acessível baseado em <dialog> nativo (foco preso, Esc fecha). */
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(92vw,34rem)] rounded-sm border border-beige-200 bg-white p-0 text-ink shadow-xl backdrop:bg-ink/30"
    >
      {open ? (
        <div className="animate-rise p-6 sm:p-8">
          <h2 className="font-display text-2xl">{title}</h2>
          <div className="mt-5">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
