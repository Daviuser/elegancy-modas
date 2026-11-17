"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import { cn, compareSizes, formatBRL } from "@/lib/utils";
import type { ProductDetail } from "@/types/store";

type Variant = ProductDetail["variants"][number];

export function ProductPurchase({ product }: { product: Pick<ProductDetail, "name" | "price" | "promoPrice" | "variants"> }) {
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

  const selected: Variant | undefined = variants.find((v) => v.colorName === color && v.size === size);
  const inCart = selected ? (cart.items.find((i) => i.variantId === selected.id)?.quantity ?? 0) : 0;
  const room = selected ? Math.max(0, selected.stock - inCart) : 0;
  const soldOutAll = !variants.some((v) => v.stock > 0);

  function pickColor(c: string) {
    setColor(c);
    const list = sizesOf(c);
    setSize(list.find((v) => v.size === size && v.stock > 0)?.size ?? list.find((v) => v.stock > 0)?.size ?? null);
    setQty(1);
    setAdded(false);
  }

  function addToCart() {
    if (!selected || room < 1) return;
    const q = Math.min(qty, room);
    cart.add(selected.id, q, selected.stock);
    setQty(1);
    setAdded(true);
  }

  const chip = (on: boolean, disabled: boolean) =>
    cn(
      "min-h-11 min-w-11 border px-4 text-sm transition-colors",
      on ? "border-ink bg-ink text-ivory" : "border-beige-300 bg-white hover:border-gold-500",
      disabled && !on && "text-ink-soft/50 line-through hover:border-beige-300",
    );

  const availability = !selected
    ? "Selecione tamanho e cor"
    : selected.stock <= 0
      ? "Esgotado nesta combinação"
      : selected.stock <= 5
        ? `Últimas ${selected.stock} unidade(s)`
        : "Disponível";

  return (
    <div className="space-y-7">
      <p className="text-2xl">
        {product.promoPrice !== null ? (
          <>
            <span className="text-gold-600">{formatBRL(product.promoPrice)}</span>{" "}
            <span className="text-lg text-ink-soft line-through">{formatBRL(product.price)}</span>
          </>
        ) : (
          formatBRL(product.price)
        )}
      </p>

      {soldOutAll ? (
        <p className="border border-beige-300 bg-beige-100 px-4 py-3 text-ink-soft">Este produto está esgotado no momento.</p>
      ) : (
        <>
          <fieldset>
            <legend className="mb-2 text-sm text-ink-soft">
              Cor: <span className="text-ink">{color}</span>
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
            <legend className="mb-2 text-sm text-ink-soft">
              Tamanho: <span className="text-ink">{size ?? "—"}</span>
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
                  className={chip(v.size === size, v.stock <= 0)}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </fieldset>

          <p className={cn("text-sm", selected && selected.stock > 0 ? "text-ink-soft" : "text-red-700")} aria-live="polite">
            {availability}
            {inCart > 0 ? ` · ${inCart} no carrinho` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-beige-300 bg-white">
              <button type="button" aria-label="Diminuir quantidade" className="grid h-12 w-12 place-items-center disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <span className="w-10 text-center" aria-live="polite">{Math.min(qty, Math.max(room, 1))}</span>
              <button type="button" aria-label="Aumentar quantidade" className="grid h-12 w-12 place-items-center disabled:opacity-30" disabled={qty >= room} onClick={() => setQty((q) => Math.min(room, q + 1))}>
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!selected || room < 1}
              className="h-12 flex-1 bg-ink px-8 text-sm tracking-wide text-ivory transition-colors duration-300 hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {selected && selected.stock > 0 && room < 1 ? "Máximo no carrinho" : "Adicionar ao carrinho"}
            </button>
          </div>

          {added ? (
            <p className="animate-rise text-sm text-gold-600" role="status">
              Adicionado ao carrinho.{" "}
              <Link href="/carrinho" className="underline underline-offset-4">Ver carrinho</Link>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
