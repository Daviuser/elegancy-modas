import type { Metadata } from "next";
import { CartView } from "@/components/store/CartView";

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 font-display text-4xl font-light tracking-wide sm:text-5xl">Carrinho</h1>
      <CartView />
    </div>
  );
}
