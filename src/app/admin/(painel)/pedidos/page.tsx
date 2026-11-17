import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { orderStatusLabels, orderStatusList, orderStatusTone, type OrderStatusValue } from "@/config/orders";
import { requireAdmin } from "@/lib/auth/dal";
import { formatOrderNumber } from "@/lib/order-format";
import { one, pageParam, type SearchParams } from "@/lib/search-params";
import { formatBRL, formatDateTime } from "@/lib/utils";
import { listOrders, ORDERS_PER_PAGE } from "@/services/order.service";

export const metadata: Metadata = { title: "Pedidos" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q);
  const rawStatus = one(sp.status);
  const status = orderStatusList.includes(rawStatus as OrderStatusValue) ? (rawStatus as OrderStatusValue) : undefined;
  const from = one(sp.de);
  const to = one(sp.ate);
  const page = pageParam(sp.page);

  const { items, total } = await listOrders({ q, status, from, to, page });

  return (
    <>
      <PageHeader title="Pedidos" description="Pedidos recebidos pela loja. O estoque só é descontado na confirmação." />

      <form method="get" className="mb-6 grid gap-3 rounded-sm border border-beige-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
        <Field label="Nº do pedido ou cliente" name="q" defaultValue={q} placeholder="EM-00012 ou nome" />
        <SelectField label="Situação" name="status" defaultValue={status ?? ""}>
          <option value="">Todas</option>
          {orderStatusList.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabels[s]}
            </option>
          ))}
        </SelectField>
        <Field label="De" name="de" type="date" defaultValue={from} />
        <Field label="Até" name="ate" type="date" defaultValue={to} />
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("primary", "flex-1")}>
            Filtrar
          </button>
          <Link href="/admin/pedidos" className={buttonClass("ghost", "px-4")}>
            Limpar
          </Link>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-beige-300 p-10 text-center">
          <p className="font-display text-xl">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <ul className="divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
          {items.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/pedidos/${o.id}`}
                className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 p-4 transition-colors hover:bg-beige-100/50 sm:px-6 md:grid-cols-[7rem_minmax(0,1.2fr)_minmax(0,1.6fr)_8rem_10rem] md:items-center"
              >
                <p className="font-display text-xl">{formatOrderNumber(o.number)}</p>
                <div className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-start">
                  <Badge tone={orderStatusTone[o.status]}>{orderStatusLabels[o.status]}</Badge>
                </div>
                <div className="col-span-2 min-w-0 md:col-span-1 md:row-start-auto">
                  <p className="truncate">{o.customerName}</p>
                  <p className="text-sm text-ink-soft">{formatDateTime(o.createdAt)}</p>
                </div>
                <p className="col-span-2 truncate text-sm text-ink-soft md:col-span-1">
                  {o.firstItem}
                  {o.extraItems > 0 ? ` +${o.extraItems}` : ""} · {o.itemCount} un.
                </p>
                <p className="col-span-2 md:col-span-1 md:text-right">{formatBRL(o.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm text-ink-soft">{total} pedido(s)</p>
      <Pagination page={page} total={total} perPage={ORDERS_PER_PAGE} basePath="/admin/pedidos" params={{ q, status, de: from, ate: to }} />
    </>
  );
}
