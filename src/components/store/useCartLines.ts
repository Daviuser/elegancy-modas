"use client";

import { useEffect, useState } from "react";
import { getCartLinesAction } from "@/app/(loja)/actions";
import { useCart } from "@/components/store/CartProvider";
import type { CartLine } from "@/types/store";

/** Carrega do servidor os dados reais (preço, estoque, situação) das linhas do carrinho. */
export function useCartLines() {
  const cart = useCart();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signature = JSON.stringify(cart.items);

  useEffect(() => {
    if (!cart.ready) return;
    if (cart.items.length === 0) {
      setLines([]);
      return;
    }
    let cancelled = false;
    getCartLinesAction(cart.items).then((res) => {
      if (cancelled) return;
      if (!res.ok) return setError(res.message);
      setError(null);
      setLines(res.data?.lines ?? []);
      (res.data?.missingIds ?? []).forEach((id) => cart.remove(id));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, cart.ready]);

  const totalCents = (lines ?? []).reduce((s, l) => s + Math.round(l.unitPrice * 100) * l.quantity, 0);
  const hasIssues = (lines ?? []).some((l) => l.issue);
  return { lines, error, total: totalCents / 100, hasIssues, loading: lines === null && !error };
}
