"use client";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="font-display text-3xl">Não foi possível carregar a página</p>
      <p className="mt-2 text-ink-soft">Tente novamente em instantes.</p>
      <button type="button" onClick={reset} className="mt-8 h-11 border border-beige-300 px-6 text-sm hover:border-gold-500">
        Tentar novamente
      </button>
    </div>
  );
}
