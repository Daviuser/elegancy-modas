"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import { cn, compareSizes, formatBRL } from "@/lib/utils";
import type { ProductDetail } from "@/types/store";

type Variant = ProductDetail["variants"][number];
type Props = { product: Pick<ProductDetail, "name" | "price" | "promoPrice" | "variants"> };

export function ProductPurchase({ product }: Props) {
  const cart = useCart();
  const { variants } = product;

  const colors = useMemo(() => [...new Set(variants.map((v) => v.colorName))], [variants]);
  const colorHasStock = (c: string) => variants.some((v) => v.colorName === c && v.stock > 0);
  const sizesOf = (c: string) => variants.filter((v) => v.colorName === c).sort((a, b) => compareSizes(a.size, b.size));

  const initialColor = colors.find(colorHasStock) ?? colors[0] ?? "";
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState<string | null>(() => sizesOf(initialColor).find((v) => v.stock > 0)?.size ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected: Variant | undefined = variants.find((v) => v.colorName === color && v.size === size);
  const inCart = selected ? (cart.items.find((i) => i.variantId === selected.id)?.quantity ?? 0) : 0;
  const room = selected ? Math.max(0, selected.stock - inCart) : 0;
  const soldOutAll = !variants.some((v) => v.stock > 0);
  const canAdd = !!selected && room >= 1;
  const discount = product.promoPrice !== null ? Math.round((1 - product.promoPrice / product.price) * 100) : 0;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Barra de compra fixa (celular): aparece quando o botão principal sai da tela.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [soldOutAll]);

  function pickColor(c: string) {
    setColor(c);
    const list = sizesOf(c);
    setSize(list.find((v) => v.size === size && v.stock > 0)?.size ?? list.find((v) => v.stock > 0)?.size ?? null);
    setQty(1);
    setAdded(false);
  }

  function addToCart() {
    if (!selected || room < 1) return;
    cart.add(selected.id, Math.min(qty, room), selected.stock);
    setQty(1);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2600);
  }

  const availability = !selected
    ? "Selecione cor e tamanho"
    : selected.stock <= 0
      ? "Esgotado nesta combinação"
      : selected.stock <= 5
        ? `Últimas ${selected.stock} unidade(s)`
        : "Em estoque";

  const price = (
    <p className="flex flex-wrap items-baseline gap-x-3">
      {product.promoPrice !== null ? (
        <>
          <span className="font-display text-4xl text-wine">{formatBRL(product.promoPrice)}</span>
          <span className="text-lg text-mute line-through">{formatBRL(product.price)}</span>
          <span className="bg-wine px-2.5 py-1 text-[11px] tracking-[0.08em] text-paper">-{discount}%</span>
        </>
      ) : (
        <span className="font-display text-4xl">{formatBRL(product.price)}</span>
      )}
    </p>
  );

  const chip = (on: boolean, off: boolean) =>
    cn(
      "relative min-h-12 min-w-12 border px-4 text-[15px] transition-[background-color,color,border-color,transform] duration-300 ease-soft active:scale-95",
      on ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
      off && !on && "cursor-not-allowed text-mute/60 hover:border-line active:scale-100",
    );

  const ctaLabel = added ? (
    <>
      <Check size={18} strokeWidth={2} className="animate-pop" /> Adicionado à sacola
    </>
  ) : selected && selected.stock > 0 && room < 1 ? (
    "Quantidade máxima na sacola"
  ) : (
    <>
      <ShoppingBag size={18} strokeWidth={1.5} /> Adicionar à sacola
    </>
  );

  return (
    <div className="space-y-8">
      {price}

      {soldOutAll ? (
        <p className="border border-line bg-paper-deep px-5 py-4 text-ink-soft">Esta peça está esgotada no momento.</p>
      ) : (
        <>
          <fieldset>
            <legend className="mb-3 text-sm">
              <span className="text-ink-soft">Cor</span> <span className="font-medium">{color}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button key={c} type="button" aria-pressed={c === color} onClick={() => pickColor(c)} className={chip(c === color, !colorHasStock(c))}>
                  {c}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm">
              <span className="text-ink-soft">Tamanho</span> <span className="font-medium">{size ?? "—"}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {sizesOf(color).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={v.size === size}
                  disabled={v.stock <= 0}
                  onClick={() => {
                    setSize(v.size);
                    setQty(1);
                    setAdded(false);
                  }}
                  className={cn(chip(v.size === size, v.stock <= 0), v.stock <= 0 && "line-through")}
                >
                  {v.size}
                </button>
              ))}
            </div>
            <p key={`${color}-${size}`} className={cn("animate-fade mt-3 text-sm", selected && selected.stock > 0 ? "text-ink-soft" : "text-wine")} aria-live="polite">
              {availability}
              {inCart > 0 ? ` · ${inCart} na sacola` : ""}
            </p>
          </fieldset>

          <div className="flex items-stretch gap-3">
            <div className="flex items-center border border-line" role="group" aria-label="Quantidade">
              <button type="button" aria-label="Diminuir quantidade" className="grid h-14 w-12 place-items-center transition-colors hover:text-wine disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={16} strokeWidth={1.5} />
              </button>
              <span key={qty} className="animate-fade w-8 text-center" aria-live="polite">{Math.min(qty, Math.max(room, 1))}</span>
              <button type="button" aria-label="Aumentar quantidade" className="grid h-14 w-12 place-items-center transition-colors hover:text-wine disabled:opacity-30" disabled={qty >= room} onClick={() => setQty((q) => Math.min(room, q + 1))}>
                <Plus size={16} strokeWidth={1.5} />
              </button>
            </div>

            <button
              ref={ctaRef}
              type="button"
              onClick={addToCart}
              disabled={!canAdd && !added}
              className={cn(
                "inline-flex h-14 flex-1 items-center justify-center gap-2.5 px-6 text-[15px] tracking-[0.03em] text-paper transition-[background-color,transform] duration-300 ease-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                added ? "bg-wine" : "bg-ink hover:bg-wine",
              )}
            >
              {ctaLabel}
            </button>
          </div>

          <div aria-live="polite" className="min-h-6">
            {added ? (
              <Link href="/carrinho" className="animate-rise group inline-flex items-center gap-2 text-sm">
                <span className="link-underline pb-0.5">Ver sacola e finalizar</span>
                <ArrowRight size={15} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ) : null}
          </div>
        </>
      )}

      {/* Barra fixa no celular */}
      {!soldOutAll ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-500 ease-soft lg:hidden",
            barVisible ? "translate-y-0" : "translate-y-full",
          )}
          aria-hidden={!barVisible}
        >
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-display text-lg">{product.name}</p>
            <p className="truncate text-xs text-ink-soft">{selected ? `${selected.colorName} · ${selected.size}` : availability}</p>
          </div>
          <button type="button" tabIndex={barVisible ? 0 : -1} onClick={addToCart} disabled={!canAdd && !added} className={cn("h-12 shrink-0 px-6 text-sm text-paper transition-colors duration-300 active:scale-[0.98] disabled:opacity-50", added ? "bg-wine" : "bg-ink")}>
            {added ? "Adicionado" : "Adicionar"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
