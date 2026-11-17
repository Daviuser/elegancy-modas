import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { orderStatusLabels, orderStatusTone } from "@/config/orders";
import { requireAdmin } from "@/lib/auth/dal";
import { formatOrderNumber } from "@/lib/order-format";
import { formatBRL, formatDateTime } from "@/lib/utils";
import { getOrderDetail } from "@/services/order.service";

export const metadata: Metadata = { title: "Pedido" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={`Pedido ${formatOrderNumber(order.number)}`}
        description={`${order.customerName} · ${formatDateTime(order.createdAt)}`}
        action={<Badge tone={orderStatusTone[order.status]}>{orderStatusLabels[order.status]}</Badge>}
      />

      <section className="rounded-sm border border-beige-200 bg-white">
        <ul className="divide-y divide-beige-200">
          {order.items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 p-4 sm:px-6">
              <div className="min-w-0">
                {i.productId ? (
                  <Link href={`/admin/produtos/${i.productId}`} className="font-display text-xl hover:text-gold-600">
                    {i.productName}
                  </Link>
                ) : (
                  <p className="font-display text-xl">{i.productName}</p>
                )}
                <p className="text-sm text-ink-soft">
                  Tamanho {i.size} · {i.colorName}
                  {i.productSku ? ` · ${i.productSku}` : ""}
                </p>
              </div>
              <p className="text-sm text-ink-soft">
                {i.quantity} × {formatBRL(i.unitPrice)} = <span className="text-ink">{formatBRL(i.lineTotal)}</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-beige-200 p-4 font-display text-2xl sm:px-6">
          <span>Total</span>
          <span>{formatBRL(order.total)}</span>
        </div>
      </section>

      <section className="mt-6 space-y-2 rounded-sm border border-beige-200 bg-white p-5 text-sm text-ink-soft sm:px-6">
        <p>Preços registrados no momento do pedido.</p>
        {order.stockDeductedAt ? <p>Estoque descontado em {formatDateTime(order.stockDeductedAt)}.</p> : <p>Estoque ainda não descontado.</p>}
        {order.stockRestoredAt ? <p>Estoque devolvido em {formatDateTime(order.stockRestoredAt)}.</p> : null}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl">Atualizar situação</h2>
        <OrderStatusActions orderId={order.id} status={order.status} />
      </section>

      <p className="mt-10 text-sm">
        <Link href="/admin/pedidos" className="text-gold-600 underline underline-offset-4">
          ← Voltar aos pedidos
        </Link>
      </p>
    </>
  );
}
