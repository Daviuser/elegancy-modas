import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { OpenWhatsAppAuto } from "@/components/store/OpenWhatsAppAuto";
import { buttonClass } from "@/components/ui/Button";
import { formatOrderNumber } from "@/lib/order-format";
import { one, type SearchParams } from "@/lib/search-params";
import { formatBRL } from "@/lib/utils";
import { buildOrderMessage, buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { getOrderByToken } from "@/services/order.service";
import { getStoreSettings } from "@/services/settings.service";

export const metadata: Metadata = { title: "Pedido registrado", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }>; searchParams: Promise<SearchParams> };

const next = [
  "Envie o pedido no WhatsApp da loja.",
  "A loja confirma a disponibilidade das peças.",
  "Combine com a loja os próximos passos.",
];

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  if (!/^[A-Za-z0-9-]{20,64}$/.test(token)) notFound();

  const [order, settings] = await Promise.all([getOrderByToken(token), getStoreSettings()]);
  if (!order) notFound();

  const number = normalizeWhatsAppNumber(settings.whatsappNumber);
  const url = number
    ? buildWhatsAppUrl(
        number,
        buildOrderMessage({
          number: order.number,
          customerName: order.customerName,
          storeName: settings.storeName,
          total: order.total,
          items: order.items,
        }),
      )
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-10 sm:px-8 lg:pt-16">
      <CheckoutSteps current={3} />

      <div className="text-center">
        <svg viewBox="0 0 52 52" className="mx-auto h-16 w-16 text-wine" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="26" cy="26" r="24" pathLength={1} strokeDasharray={1} className="animate-draw" />
          <path d="M15 27l8 8 15-17" pathLength={1} strokeDasharray={1} className="animate-draw" style={{ animationDelay: "0.5s" }} />
        </svg>

        <p className="animate-rise mt-6 font-display text-lg italic text-wine" style={{ animationDelay: "0.4s" }}>Pedido registrado</p>
        <h1 className="animate-rise font-display text-6xl leading-none sm:text-8xl" style={{ animationDelay: "0.5s" }}>
          {formatOrderNumber(order.number)}
        </h1>
        <p className="animate-rise mx-auto mt-6 max-w-md text-ink-soft" style={{ animationDelay: "0.6s" }}>
          Obrigada, {order.customerName}! Seu pedido está salvo. Falta só enviá-lo à loja pelo WhatsApp.
        </p>

        {url ? (
          <>
            <OpenWhatsAppAuto url={url} enabled={one(sp.novo) === "1"} />
            <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "group mt-8 h-14 px-10 text-[15px]")}>
              Abrir WhatsApp com o pedido
              <ArrowUpRight size={18} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="mt-3 text-xs text-ink-soft">Guarde esta página: você pode abrir o WhatsApp novamente a qualquer momento.</p>
          </>
        ) : (
          <p className="mt-8 text-wine">O WhatsApp da loja não está configurado. Entre em contato informando o número do pedido.</p>
        )}
      </div>

      <section className="mt-16 bg-paper-deep p-6 sm:p-8">
        <h2 className="font-display text-3xl">Seu pedido</h2>
        <ul className="mt-5 divide-y divide-ink/10">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-4 py-4 text-sm">
              <div>
                <p className="font-display text-lg leading-tight">{i.productName}</p>
                <p className="mt-0.5 text-ink-soft">{i.colorName} · Tam. {i.size} · {i.quantity} × {formatBRL(i.unitPrice)}</p>
              </div>
              <p>{formatBRL(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t border-ink/15 pt-5">
          <span>Total</span>
          <span className="font-display text-4xl">{formatBRL(order.total)}</span>
        </div>
      </section>

      <ol className="mt-12 grid gap-6 sm:grid-cols-3">
        {next.map((text, i) => (
          <li key={text} className="flex gap-3 sm:block">
            <span className="font-display text-4xl italic leading-none text-wine">{i + 1}</span>
            <p className="text-sm text-ink-soft sm:mt-2">{text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-14 text-center">
        <Link href="/catalogo" className="link-underline pb-0.5 text-sm">Continuar comprando</Link>
      </p>
    </div>
  );
}
