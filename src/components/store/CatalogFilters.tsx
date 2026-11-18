"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  categoria?: string;
  q?: string;
  min?: string;
  max?: string;
  ordem: "novidades" | "menor" | "maior";
  activeCount: number;
};

const sorts = [
  { value: "novidades", label: "Novidades" },
  { value: "menor", label: "Menor preço" },
  { value: "maior", label: "Maior preço" },
] as const;

const input = "h-12 w-full border-b border-line bg-transparent text-base placeholder:text-mute/70 focus:border-ink focus:outline-none";

/** Painel lateral de filtros. Continua sendo um formulário GET comum (funciona sem estado no servidor). */
export function CatalogFilters({ categoria, q, min, max, ordem, activeCount }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-11 items-center gap-2.5 border border-ink/80 px-5 text-sm transition-colors duration-300 hover:bg-ink hover:text-paper active:scale-[0.98]"
      >
        <SlidersHorizontal size={16} strokeWidth={1.4} />
        Filtrar e ordenar
        {activeCount > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-wine px-1 text-[11px] text-paper">{activeCount}</span> : null}
      </button>

      <div className={cn("fixed inset-0 z-50", open ? "visible" : "invisible delay-300")} aria-hidden={!open}>
        <button type="button" tabIndex={-1} aria-label="Fechar filtros" onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-ink/35 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
        <aside
          role="dialog"
          aria-label="Filtros"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-500 ease-soft",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
            <p className="font-display text-2xl">Filtrar e ordenar</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" tabIndex={open ? 0 : -1} className="-mr-2 grid h-11 w-11 place-items-center hover:text-wine">
              <X size={22} strokeWidth={1.4} />
            </button>
          </div>

          <form action="/catalogo" method="get" className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-9 overflow-y-auto px-6 py-8">
              {categoria ? <input type="hidden" name="categoria" value={categoria} /> : null}

              <div>
                <label htmlFor="f-q" className="text-sm text-ink-soft">Pesquisar</label>
                <input id="f-q" name="q" defaultValue={q} placeholder="Nome da peça" maxLength={80} tabIndex={open ? 0 : -1} className={input} />
              </div>

              <fieldset>
                <legend className="text-sm text-ink-soft">Ordenar por</legend>
                <div className="mt-3 divide-y divide-line border-y border-line">
                  {sorts.map((s) => (
                    <label key={s.value} className="flex cursor-pointer items-center justify-between py-3.5 text-base">
                      {s.label}
                      <input type="radio" name="ordem" value={s.value} defaultChecked={ordem === s.value} tabIndex={open ? 0 : -1} className="h-4 w-4 accent-[var(--color-wine)]" />
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm text-ink-soft">Faixa de preço (R$)</legend>
                <div className="mt-2 grid grid-cols-2 gap-6">
                  <input name="min" aria-label="Preço mínimo" inputMode="decimal" defaultValue={min} placeholder="Mínimo" tabIndex={open ? 0 : -1} className={input} />
                  <input name="max" aria-label="Preço máximo" inputMode="decimal" defaultValue={max} placeholder="Máximo" tabIndex={open ? 0 : -1} className={input} />
                </div>
              </fieldset>
            </div>

            <div className="grid shrink-0 grid-cols-[auto_1fr] gap-3 border-t border-line bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <a href="/catalogo" tabIndex={open ? 0 : -1} className="grid h-12 place-items-center px-6 text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
                Limpar
              </a>
              <button type="submit" tabIndex={open ? 0 : -1} className="h-12 bg-ink text-sm tracking-[0.03em] text-paper transition-[background-color,transform] duration-300 hover:bg-wine active:scale-[0.98]">
                Ver resultados
              </button>
            </div>
          </form>
        </aside>
      </div>
    </>
  );
}
