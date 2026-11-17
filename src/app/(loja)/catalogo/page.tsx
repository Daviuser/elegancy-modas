import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { buttonClass } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { one, pageParam, type SearchParams } from "@/lib/search-params";
import { parseMoney } from "@/lib/validations/common";
import { listNavCategories, listStoreProducts, STORE_PER_PAGE, type StoreSort } from "@/services/store.service";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explore todas as peças da Elegancy Modas.",
};

function money(v: string | undefined) {
  const n = parseMoney(v);
  return n !== null && Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = one(sp.q)?.slice(0, 80);
  const categoria = one(sp.categoria);
  const minRaw = one(sp.min);
  const maxRaw = one(sp.max);
  const ordem = one(sp.ordem);
  const sort: StoreSort = ordem === "menor" || ordem === "maior" ? ordem : "novidades";
  const page = pageParam(sp.page);

  const [categories, { items, total }] = await Promise.all([
    listNavCategories(),
    listStoreProducts({ q, categorySlug: categoria, min: money(minRaw), max: money(maxRaw), sort, page }),
  ]);
  const current = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl">{current ? current.name : "Catálogo"}</h1>
      <span className="mt-4 block h-px w-12 bg-gold-400" aria-hidden />

      <form method="get" className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_1.3fr_auto] lg:items-end">
        <Field label="Pesquisar" name="q" defaultValue={q} placeholder="Nome da peça" />
        <SelectField label="Categoria" name="categoria" defaultValue={categoria ?? ""}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </SelectField>
        <Field label="Preço mín. (R$)" name="min" inputMode="decimal" defaultValue={minRaw} placeholder="0" />
        <Field label="Preço máx. (R$)" name="max" inputMode="decimal" defaultValue={maxRaw} placeholder="500" />
        <SelectField label="Ordenar por" name="ordem" defaultValue={sort}>
          <option value="novidades">Novidades</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </SelectField>
        <div className="flex gap-2">
          <button type="submit" className={buttonClass("primary", "flex-1")}>Filtrar</button>
          <Link href="/catalogo" className={buttonClass("ghost", "px-4")}>Limpar</Link>
        </div>
      </form>

      <p className="mt-8 text-sm text-ink-soft">{total} peça(s)</p>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-3xl">Nenhuma peça encontrada</p>
          <p className="mt-2 text-ink-soft">Tente outros termos ou limpe os filtros.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        total={total}
        perPage={STORE_PER_PAGE}
        basePath="/catalogo"
        params={{ q, categoria, min: minRaw, max: maxRaw, ordem: ordem === "novidades" ? undefined : ordem }}
      />
    </div>
  );
}
