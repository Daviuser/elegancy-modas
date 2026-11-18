"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import { useCartLines } from "@/components/store/useCartLines";
import { buttonClass } from "@/components/ui/Button";
import { cn, formatBRL } from "@/lib/utils";

export function CartView() {
  const cart = useCart();
  const { lines, error, total, hasIssues, loading } = useCartLines();
  const [leaving, setLeaving] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function removeLine(id: string) {
    setLeaving(id); // anima a saída antes de remover de fato
    timer.current = setTimeout(() => {
      cart.remove(id);
      setLeaving(null);
    }, 320);
  }

  if (loading || !cart.ready) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]" role="status" aria-busy>
        <span className="sr-only">Carregando sua sacola…</span>
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="grid grid-cols-[96px_1fr] gap-5">
              <div className="aspect-[3/4] animate-pulse bg-paper-deep" />
              <div className="space-y-3 pt-2">
                <div className="h-5 w-2/3 animate-pulse bg-paper-deep" />
                <div className="h-4 w-1/3 animate-pulse bg-paper-deep" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 animate-pulse bg-paper-deep" />
      </div>
    );
  }
  if (error) return <p className="py-20 text-center text-wine" role="alert">{error}</p>;

  if (!lines || lines.length === 0) {
    return (
      <div className="animate-rise py-20 text-center">
        <p className="font-display text-5xl">Sua sacola está vazia</p>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">Explore o catálogo e escolha as peças que combinam com você.</p>
        <Link href="/catalogo" className={buttonClass("primary", "mt-8 h-14 px-10")}>Explorar o catálogo</Link>
      </div>
    );
  }

  const count = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_24rem] lg:gap-16">
      <ul className="border-t border-line">
        {lines.map((l) => (
          <li
            key={l.variantId}
            className={cn(
              "grid border-b border-line transition-[grid-template-rows,opacity] duration-300 ease-soft",
              leaving === l.variantId ? "[grid-template-rows:0fr] opacity-0" : "[grid-template-rows:1fr]",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-[96px_1fr] gap-4 py-6 sm:grid-cols-[128px_1fr] sm:gap-6">
                <Link href={`/produto/${l.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-paper-deep">
                  {l.imageUrl ? <Image src={l.imageUrl} alt={l.name} fill sizes="128px" className="object-cover" /> : null}
                </Link>

                <div className="flex min-w-0 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/produto/${l.slug}`} className="font-display text-xl leading-tight transition-colors hover:text-wine sm:text-2xl">{l.name}</Link>
                      <p className="mt-1 text-sm text-ink-soft">{l.colorName} · Tamanho {l.size}</p>
                    </div>
                    <button type="button" onClick={() => removeLine(l.variantId)} aria-label={`Remover ${l.name} da sacola`} className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center text-mute transition-colors hover:text-wine">
                      <X size={18} strokeWidth={1.4} />
                    </button>
                  </div>

                  {l.issue ? <p className="animate-shake mt-2 text-sm text-wine" role="alert">{l.issue}</p> : null}

                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div className="flex items-center border border-line" role="group" aria-label={`Quantidade de ${l.name}`}>
                      <button type="button" aria-label="Diminuir quantidade" className="grid h-11 w-11 place-items-center transition-colors hover:text-wine active:scale-90" onClick={() => cart.setQuantity(l.variantId, l.quantity - 1)}>
                        <Minus size={15} strokeWidth={1.5} />
                      </button>
                      <span key={l.quantity} className="animate-fade w-7 text-center text-sm">{l.quantity}</span>
                      <button type="button" aria-label="Aumentar quantidade" className="grid h-11 w-11 place-items-center transition-colors hover:text-wine active:scale-90 disabled:opacity-30" disabled={l.quantity >= l.stock} onClick={() => cart.setQuantity(l.variantId, l.quantity + 1)}>
                        <Plus size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="text-right">
                      <span key={l.quantity} className="animate-fade block font-display text-2xl">{formatBRL(l.unitPrice * l.quantity)}</span>
                      {l.onSale ? <span className="block text-xs text-mute line-through">{formatBRL(l.originalPrice * l.quantity)}</span> : l.quantity > 1 ? <span className="block text-xs text-mute">{formatBRL(l.unitPrice)} cada</span> : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit bg-paper-deep p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-3xl">Resumo</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-ink-soft">{count} {count === 1 ? "item" : "itens"}</dt><dd>{formatBRL(total)}</dd></div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-ink/15 pt-5">
          <span>Total</span>
          <span key={total} className="animate-fade font-display text-4xl">{formatBRL(total)}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">Preços e disponibilidade são conferidos novamente ao finalizar o pedido.</p>

        {hasIssues ? <p className="mt-4 text-sm text-wine" role="alert">Ajuste ou remova os itens indisponíveis para continuar.</p> : null}

        <Link
          href="/checkout"
          aria-disabled={hasIssues}
          tabIndex={hasIssues ? -1 : undefined}
          className={cn(buttonClass("primary", "group mt-6 h-14 w-full text-[15px]"), hasIssues && "pointer-events-none opacity-50")}
        >
          Ir para a finalização
          <ArrowRight size={18} strokeWidth={1.5} className="transition-transform duration-300 ease-soft group-hover:translate-x-1" />
        </Link>
        <Link href="/catalogo" className="link-underline mt-5 block w-fit pb-0.5 text-sm">Continuar comprando</Link>
      </aside>
    </div>
  );
}
