import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StockTabs } from "@/components/admin/StockTabs";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { movementLabels } from "@/config/stock";
import { requireAdmin } from "@/lib/auth/dal";
import { one, pageParam, type SearchParams } from "@/lib/search-params";
import { formatDateTime } from "@/lib/utils";
import { listMovements, MOVEMENTS_PER_PAGE } from "@/services/stock.service";

export const metadata: Metadata = { title: "Histórico de estoque" };

const TYPES = Object.keys(movementLabels);

export default async function MovementsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q);
  const rawType = one(sp.tipo);
  const type = TYPES.includes(rawType ?? "") ? (rawType as keyof typeof movementLabels) : undefined;
  const page = pageParam(sp.page);

  const { items, total } = await listMovements({
    q,
    type: type as Parameters<typeof listMovements>[0]["type"],
    page,
  });

  return (
    <>
      <PageHeader title="Estoque" description="Histórico imutável de todas as movimentações." />
      <StockTabs active="historico" />

      <form method="get" className="mb-6 grid gap-3 rounded-sm border border-beige-200 bg-white p-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <Field label="Produto" name="q" defaultValue={q} placeholder="Nome ou código" />
        <SelectField label="Tipo" name="tipo" defaultValue={type ?? ""}>
          <option value="">Todos</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {movementLabels[t]}
            </option>
          ))}
        </SelectField>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("primary", "flex-1")}>
            Filtrar
          </button>
          <Link href="/admin/estoque/historico" className={buttonClass("ghost", "px-4")}>
            Limpar
          </Link>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-beige-300 p-10 text-center">
          <p className="font-display text-xl">Nenhuma movimentação</p>
        </div>
      ) : (
        <ul className="divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
          {items.map((m) => (
            <li key={m.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 p-4 sm:px-6 md:grid-cols-[9rem_minmax(0,2fr)_8rem_6rem_6rem_minmax(0,1.2fr)] md:items-center">
              <p className="text-sm text-ink-soft">{formatDateTime(m.createdAt)}</p>
              <div className="col-span-2 row-start-2 min-w-0 md:col-span-1 md:row-start-auto">
                <Link href={`/admin/produtos/${m.variant.product.id}`} className="font-display text-lg hover:text-gold-600">
                  {m.variant.product.name}
                </Link>
                <p className="text-sm text-ink-soft">
                  {m.variant.size} / {m.variant.colorName}
                </p>
              </div>
              <div className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-start">
                <Badge tone={m.quantity < 0 ? "danger" : "gold"}>{movementLabels[m.type]}</Badge>
              </div>
              <p className={m.quantity < 0 ? "text-red-700" : "text-gold-600"}>
                {m.quantity > 0 ? "+" : ""}
                {m.quantity}
              </p>
              <p className="text-sm text-ink-soft">Saldo: {m.balanceAfter}</p>
              <p className="col-span-2 text-sm text-ink-soft md:col-span-1">
                {m.admin?.name ?? "—"}
                {m.reason ? ` · ${m.reason}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm text-ink-soft">{total} movimentação(ões)</p>
      <Pagination page={page} total={total} perPage={MOVEMENTS_PER_PAGE} basePath="/admin/estoque/historico" params={{ q, tipo: type }} />
    </>
  );
}
