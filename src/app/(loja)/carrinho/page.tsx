import type { Metadata } from "next";
import { CartView } from "@/components/store/CartView";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";

export const metadata: Metadata = { title: "Sacola", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-8 pt-10 sm:px-8 lg:pt-16">
      <CheckoutSteps current={1} />
      <h1 className="mb-10 font-display text-5xl leading-none sm:text-7xl">Sacola</h1>
      <CartView />
    </div>
  );
}
