import Link from "next/link";

type Props = {
  page: number;
  total: number;
  perPage: number;
  basePath: string;
  params?: Record<string, string | undefined>;
};

export function Pagination({ page, total, perPage, basePath, params = {} }: Props) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    qs.set("page", String(p));
    return `${basePath}?${qs.toString()}`;
  };
  const link = "rounded-sm border border-beige-300 px-4 py-2 text-sm transition-colors hover:border-gold-500";

  return (
    <nav aria-label="Paginação" className="mt-6 flex items-center justify-between gap-3 text-sm text-ink-soft">
      {page > 1 ? <Link href={href(page - 1)} className={link}>Anterior</Link> : <span />}
      <span>
        Página {page} de {pages}
      </span>
      {page < pages ? <Link href={href(page + 1)} className={link}>Próxima</Link> : <span />}
    </nav>
  );
}
