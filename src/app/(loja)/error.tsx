"use client";

import { buttonClass } from "@/components/ui/Button";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-6 py-28 text-center">
      <p className="font-display text-4xl">Algo não saiu como esperado</p>
      <p className="mt-3 text-ink-soft">Não foi possível carregar esta página. Tente novamente em instantes.</p>
      <button type="button" onClick={reset} className={buttonClass("outline", "mt-8 px-8")}>
        Tentar novamente
      </button>
    </div>
  );
}
