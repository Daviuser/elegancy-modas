import type { Metadata } from "next";
import { CheckoutView } from "@/components/store/CheckoutView";

export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 font-display text-4xl font-light tracking-wide sm:text-5xl">Finalizar pedido</h1>
      <CheckoutView />
    </div>
  );
}
