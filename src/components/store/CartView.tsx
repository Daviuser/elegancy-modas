"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import { useCartLines } from "@/components/store/useCartLines";
import { buttonClass } from "@/components/ui/Button";
import { cn, formatBRL } from "@/lib/utils";

export function CartView() {
  const cart = useCart();
  const { lines, error, total, hasIssues, loading } = useCartLines();

  if (loading || !cart.ready) return <p className="py-20 text-center text-ink-soft" role="status">Carregando seu carrinho…</p>;
  if (error) return <p className="py-20 text-center text-red-700" role="alert">{error}</p>;

  if (!lines || lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-3xl">Seu carrinho está vazio</p>
        <p className="mt-2 text-ink-soft">Descubra as peças da nossa coleção.</p>
        <Link href="/catalogo" className={buttonClass("primary", "mt-8")}>Ver catálogo</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-beige-200 border-y border-beige-200">
        {lines.map((l) => (
          <li key={l.variantId} className="grid grid-cols-[88px_1fr] gap-4 py-6 sm:grid-cols-[112px_1fr]">
            <Link href={`/produto/${l.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-beige-100">
              {l.imageUrl ? <Image src={l.imageUrl} alt={l.name} fill sizes="112px" className="object-cover" /> : null}
            </Link>
            <div className="flex min-w-0 flex-col">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/produto/${l.slug}`} className="font-display text-xl leading-tight hover:text-gold-600">{l.name}</Link>
                  <p className="mt-1 text-sm text-ink-soft">Tamanho {l.size} · {l.colorName}</p>
                </div>
                <button type="button" onClick={() => cart.remove(l.variantId)} aria-label={`Remover ${l.name}`} className="grid h-9 w-9 shrink-0 place-items-center text-ink-soft hover:text-ink">
                  <Trash2 size={17} strokeWidth={1.5} />
                </button>
              </div>

              <p className="mt-2 text-sm">
                {l.onSale ? (
                  <>
                    <span className="text-gold-600">{formatBRL(l.unitPrice)}</span>{" "}
                    <span className="text-ink-soft line-through">{formatBRL(l.originalPrice)}</span>
                  </>
                ) : (
                  formatBRL(l.unitPrice)
                )}
              </p>
              {l.issue ? <p className="mt-1 text-sm text-red-700" role="alert">{l.issue}</p> : null}

              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="flex items-center border border-beige-300 bg-white">
                  <button type="button" aria-label="Diminuir quantidade" className="grid h-10 w-10 place-items-center" onClick={() => cart.setQuantity(l.variantId, l.quantity - 1)}>
                    <Minus size={15} />
                  </button>
                  <span className="w-9 text-center text-sm">{l.quantity}</span>
                  <button type="button" aria-label="Aumentar quantidade" className="grid h-10 w-10 place-items-center disabled:opacity-30" disabled={l.quantity >= l.stock} onClick={() => cart.setQuantity(l.variantId, l.quantity + 1)}>
                    <Plus size={15} />
                  </button>
                </div>
                <p className="font-display text-xl">{formatBRL(l.unitPrice * l.quantity)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-beige-200 bg-white p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">Resumo</h2>
        <div className="mt-5 flex items-baseline justify-between border-t border-beige-200 pt-4">
          <span className="text-ink-soft">Total</span>
          <span className="font-display text-3xl">{formatBRL(total)}</span>
        </div>
        {hasIssues ? <p className="mt-4 text-sm text-red-700">Ajuste ou remova os itens indisponíveis para continuar.</p> : null}
        <Link
          href="/checkout"
          aria-disabled={hasIssues}
          tabIndex={hasIssues ? -1 : undefined}
          className={cn(buttonClass("primary", "mt-6 w-full"), hasIssues && "pointer-events-none opacity-50")}
        >
          Ir para a finalização
        </Link>
        <Link href="/catalogo" className={buttonClass("outline", "mt-3 w-full")}>Continuar comprando</Link>
      </aside>
    </div>
  );
}
