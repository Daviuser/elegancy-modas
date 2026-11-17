import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { requireAdmin } from "@/lib/auth/dal";
import { one, pageParam, type SearchParams } from "@/lib/search-params";
import { formatBRL } from "@/lib/utils";
import { listCategoryOptions } from "@/services/category.service";
import { listProducts, PRODUCTS_PER_PAGE } from "@/services/product.service";

export const metadata: Metadata = { title: "Produtos" };

const statusLabel = { ACTIVE: "Ativo", DRAFT: "Inativo", ARCHIVED: "Arquivado" } as const;
const statusTone = { ACTIVE: "gold", DRAFT: "neutral", ARCHIVED: "muted" } as const;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;

  const q = one(sp.q);
  const categoryId = one(sp.categoria);
  const rawStatus = one(sp.status);
  const status =
    rawStatus === "ACTIVE" || rawStatus === "DRAFT" || rawStatus === "ARCHIVED" || rawStatus === "ALL"
      ? rawStatus
      : undefined;
  const page = pageParam(sp.page);

  const [{ items, total }, categories] = await Promise.all([
    listProducts({ q, categoryId, status, page }),
    listCategoryOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastro de roupas, galeria de imagens e variações."
        action={
          <Link href="/admin/produtos/novo" className={buttonClass("primary")}>
            <Plus size={16} /> Novo produto
          </Link>
        }
      />

      <form method="get" className="mb-6 grid gap-3 rounded-sm border border-beige-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <Field label="Buscar" name="q" defaultValue={q} placeholder="Nome ou código" />
        <SelectField label="Categoria" name="categoria" defaultValue={categoryId ?? ""}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Status" name="status" defaultValue={status ?? ""}>
          <option value="">Ativos e inativos</option>
          <option value="ACTIVE">Somente ativos</option>
          <option value="DRAFT">Somente inativos</option>
          <option value="ARCHIVED">Arquivados</option>
          <option value="ALL">Todos</option>
        </SelectField>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("primary", "flex-1")}>
            Filtrar
          </button>
          <Link href="/admin/produtos" className={buttonClass("ghost", "px-4")}>
            Limpar
          </Link>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-beige-300 p-10 text-center">
          <p className="font-display text-xl">Nenhum produto encontrado</p>
          <p className="mt-1 text-sm text-ink-soft">Ajuste os filtros ou cadastre um novo produto.</p>
        </div>
      ) : (
        <ul className="divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/produtos/${p.id}`}
                className="grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-2 p-4 transition-colors hover:bg-beige-100/50 sm:px-6 md:grid-cols-[56px_minmax(0,2fr)_1fr_1fr_auto]"
              >
                <div className="relative h-[72px] w-14 overflow-hidden rounded-sm bg-beige-100">
                  {p.imageUrl ? <Image src={p.imageUrl} alt="" fill sizes="56px" className="object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-xl leading-tight">{p.name}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {p.categoryName}
                    {p.sku ? ` · ${p.sku}` : ""}
                  </p>
                </div>
                <div className="col-start-2 text-sm md:col-start-auto">
                  {p.promoPrice !== null ? (
                    <>
                      <span className="text-gold-600">{formatBRL(p.promoPrice)}</span>{" "}
                      <span className="text-ink-soft line-through">{formatBRL(p.price)}</span>
                    </>
                  ) : (
                    formatBRL(p.price)
                  )}
                </div>
                <div className="col-start-2 text-sm text-ink-soft md:col-start-auto">
                  <span className={p.totalStock === 0 ? "text-red-700" : undefined}>{p.totalStock} un.</span> ·{" "}
                  {p.variantCount} variação(ões)
                </div>
                <div className="col-start-2 md:col-start-auto">
                  <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-sm text-ink-soft">{total} produto(s)</p>
      <Pagination
        page={page}
        total={total}
        perPage={PRODUCTS_PER_PAGE}
        basePath="/admin/produtos"
        params={{ q, categoria: categoryId, status }}
      />
    </>
  );
}
