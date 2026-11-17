import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StockMovementButton } from "@/components/admin/StockMovementButton";
import { StockTabs } from "@/components/admin/StockTabs";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { requireAdmin } from "@/lib/auth/dal";
import { one, pageParam, type SearchParams } from "@/lib/search-params";
import { LOW_STOCK_THRESHOLD } from "@/services/dashboard.service";
import { listStockVariants, STOCK_PER_PAGE, type StockLevel } from "@/services/stock.service";

export const metadata: Metadata = { title: "Estoque" };

export default async function StockPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = one(sp.q);
  const rawLevel = one(sp.nivel);
  const level: StockLevel = rawLevel === "low" || rawLevel === "out" ? rawLevel : "all";
  const page = pageParam(sp.page);

  const { items, total } = await listStockVariants({ q, level, page });

  return (
    <>
      <PageHeader title="Estoque" description="Saldo por tamanho e cor. Toda alteração fica registrada no histórico." />
      <StockTabs active="saldo" />

      <form method="get" className="mb-6 grid gap-3 rounded-sm border border-beige-200 bg-white p-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <Field label="Buscar" name="q" defaultValue={q} placeholder="Produto, código, tamanho ou cor" />
        <SelectField label="Situação" name="nivel" defaultValue={level}>
          <option value="all">Todas</option>
          <option value="low">Estoque baixo (até {LOW_STOCK_THRESHOLD})</option>
          <option value="out">Esgotadas</option>
        </SelectField>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("primary", "flex-1")}>
            Filtrar
          </button>
          <Link href="/admin/estoque" className={buttonClass("ghost", "px-4")}>
            Limpar
          </Link>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-beige-300 p-10 text-center">
          <p className="font-display text-xl">Nenhuma variação encontrada</p>
          <p className="mt-1 text-sm text-ink-soft">Cadastre produtos com variações para controlar o estoque.</p>
        </div>
      ) : (
        <ul className="divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
          {items.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-6">
              <div className="min-w-0 flex-1 basis-56">
                <Link href={`/admin/produtos/${v.product.id}`} className="font-display text-xl leading-tight hover:text-gold-600">
                  {v.product.name}
                </Link>
                <p className="text-sm text-ink-soft">
                  Tamanho {v.size} · {v.colorName}
                  {v.product.sku ? ` · ${v.product.sku}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!v.active ? <Badge tone="muted">Inativa</Badge> : null}
                {v.stock === 0 ? (
                  <Badge tone="danger">Esgotada</Badge>
                ) : v.stock <= LOW_STOCK_THRESHOLD ? (
                  <Badge tone="gold">Baixo</Badge>
                ) : null}
                <span className="w-16 text-right font-display text-2xl">{v.stock}</span>
              </div>
              <StockMovementButton
                variantId={v.id}
                stock={v.stock}
                label={`${v.product.name} — ${v.size} / ${v.colorName}`}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm text-ink-soft">{total} variação(ões)</p>
      <Pagination page={page} total={total} perPage={STOCK_PER_PAGE} basePath="/admin/estoque" params={{ q, nivel: level === "all" ? undefined : level }} />
    </>
  );
}
