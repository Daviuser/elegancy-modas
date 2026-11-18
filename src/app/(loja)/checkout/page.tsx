import type { Metadata } from "next";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { CheckoutView } from "@/components/store/CheckoutView";

export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-8 pt-10 sm:px-8 lg:pt-16">
      <CheckoutSteps current={2} />
      <h1 className="mb-10 font-display text-5xl leading-none sm:text-7xl">Finalizar pedido</h1>
      <CheckoutView />
    </div>
  );
}
