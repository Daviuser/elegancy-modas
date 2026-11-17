import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="mx-auto max-w-2xl px-6 py-16">
      {url ? <OpenWhatsAppAuto url={url} enabled={one(sp.novo) === "1"} /> : null}

      <div className="text-center">
        <p className="text-sm text-gold-600">Pedido registrado</p>
        <h1 className="mt-2 font-display text-5xl font-light">{formatOrderNumber(order.number)}</h1>
        <p className="mt-4 text-ink-soft">
          Obrigada, {order.customerName}! Seu pedido está salvo. Envie-o pelo WhatsApp para a loja confirmar a disponibilidade e combinar a retirada.
        </p>
        {url ? (
          <>
            <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "mt-8 h-12 px-8")}>
              Abrir WhatsApp com o pedido
            </a>
            <p className="mt-3 text-xs text-ink-soft">Se o WhatsApp não abrir sozinho, use o botão acima. Guarde esta página para tentar de novo.</p>
          </>
        ) : (
          <p className="mt-8 text-red-700">O WhatsApp da loja não está configurado. Entre em contato com a loja informando o número do pedido.</p>
        )}
      </div>

      <section className="mt-12 border border-beige-200 bg-white">
        <ul className="divide-y divide-beige-200">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-4 p-4 text-sm">
              <div>
                <p className="font-display text-lg">{i.productName}</p>
                <p className="text-ink-soft">Tam. {i.size} · {i.colorName} · {i.quantity} × {formatBRL(i.unitPrice)}</p>
              </div>
              <p>{formatBRL(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-beige-200 p-4 font-display text-2xl">
          <span>Total</span>
          <span>{formatBRL(order.total)}</span>
        </div>
      </section>

      <p className="mt-8 text-center text-sm">
        <Link href="/catalogo" className="text-gold-600 underline underline-offset-4">Continuar comprando</Link>
      </p>
    </div>
  );
}
