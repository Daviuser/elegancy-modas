import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { CatalogFilters } from "@/components/store/CatalogFilters";
import { ProductCard } from "@/components/store/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import { one, pageParam, type SearchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { parseMoney } from "@/lib/validations/common";
import { listNavCategories, listStoreProducts, STORE_PER_PAGE, type StoreSort } from "@/services/store.service";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explore todas as peças da Elegancy Modas.",
  alternates: { canonical: "/catalogo" },
};

function money(v: string | undefined) {
  const n = parseMoney(v);
  return n !== null && Number.isFinite(n) && n >= 0 ? n : undefined;
}

type Params = { categoria?: string; q?: string; min?: string; max?: string; ordem?: string };

/** Monta um link do catálogo preservando os demais filtros (e descartando a página). */
function href(base: Params, patch: Partial<Params> = {}) {
  const merged: Params = { ...base, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/catalogo?${s}` : "/catalogo";
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

  const base: Params = { categoria, q, min: minRaw, max: maxRaw, ordem: sort === "novidades" ? undefined : sort };
  const chips = [
    q ? { label: `Busca: “${q}”`, to: href(base, { q: undefined }) } : null,
    minRaw ? { label: `A partir de R$ ${minRaw}`, to: href(base, { min: undefined }) } : null,
    maxRaw ? { label: `Até R$ ${maxRaw}`, to: href(base, { max: undefined }) } : null,
    sort !== "novidades" ? { label: sort === "menor" ? "Menor preço" : "Maior preço", to: href(base, { ordem: undefined }) } : null,
  ].filter((c): c is { label: string; to: string } => c !== null);

  const pill = (on: boolean) =>
    cn(
      "shrink-0 border px-5 py-2.5 text-sm transition-colors duration-300 active:scale-[0.98]",
      on ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
    );

  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-8 pt-10 sm:px-8 lg:pt-16">
      <header>
        <p className="font-display text-lg italic text-wine">{current ? "Categoria" : "Coleção"}</p>
        <h1 className="mt-1 font-display text-5xl leading-none sm:text-7xl">{current ? current.name : "Catálogo"}</h1>
      </header>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <nav aria-label="Categorias" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Link href={href(base, { categoria: undefined })} className={pill(!categoria)}>Todas</Link>
          {categories.map((c) => (
            <Link key={c.slug} href={href(base, { categoria: c.slug })} aria-current={c.slug === categoria ? "page" : undefined} className={pill(c.slug === categoria)}>
              {c.name}
            </Link>
          ))}
        </nav>
        <CatalogFilters categoria={categoria} q={q} min={minRaw} max={maxRaw} ordem={sort} activeCount={chips.length} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-2 text-ink-soft">{total} {total === 1 ? "peça" : "peças"}</span>
        {chips.map((c) => (
          <Link key={c.label} href={c.to} className="group inline-flex items-center gap-1.5 bg-paper-deep py-1.5 pl-3 pr-2 transition-colors hover:bg-line" aria-label={`Remover filtro ${c.label}`}>
            {c.label}
            <X size={14} className="text-ink-soft transition-colors group-hover:text-wine" />
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="py-28 text-center">
          <p className="font-display text-4xl">Nenhuma peça encontrada</p>
          <p className="mt-3 text-ink-soft">Tente outros termos ou remova alguns filtros.</p>
          <Link href="/catalogo" className="link-underline mt-6 inline-block pb-0.5">Ver todo o catálogo</Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-14">
          {items.map((p, i) => (
            <li key={p.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} total={total} perPage={STORE_PER_PAGE} basePath="/catalogo" params={{ q, categoria, min: minRaw, max: maxRaw, ordem: sort === "novidades" ? undefined : sort }} />
    </div>
  );
}
