"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const KEY = "elegancy:cart:v1";
const MAX_QTY = 99;

/** O carrinho guarda só variação e quantidade. Preços e nomes sempre vêm do servidor. */
export type CartItem = { variantId: string; quantity: number };

type CartContext = {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (variantId: string, quantity: number, max?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (i): i is CartItem =>
          !!i && typeof i.variantId === "string" && Number.isInteger(i.quantity) && i.quantity > 0,
      )
      .slice(0, 50)
      .map((i) => ({ variantId: i.variantId, quantity: Math.min(i.quantity, MAX_QTY) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* armazenamento indisponível: o carrinho vale só nesta sessão */
    }
  }, [items, ready]);

  const add = useCallback((variantId: string, quantity: number, max?: number) => {
    setItems((prev) => {
      const cap = Math.min(max ?? MAX_QTY, MAX_QTY);
      const found = prev.find((i) => i.variantId === variantId);
      if (found) {
        return prev.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(cap, i.quantity + quantity) } : i));
      }
      return [...prev, { variantId, quantity: Math.min(cap, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i)),
    );
  }, []);

  const remove = useCallback((variantId: string) => setItems((prev) => prev.filter((i) => i.variantId !== variantId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContext>(
    () => ({ items, count: items.reduce((s, i) => s + i.quantity, 0), ready, add, setQuantity, remove, clear }),
    [items, ready, add, setQuantity, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>.");
  return ctx;
}
