import Link from "next/link";

export function SectionHeading({ title, href, linkLabel = "Ver tudo" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-3xl font-light tracking-wide sm:text-4xl">{title}</h2>
        <span className="mt-3 block h-px w-12 bg-gold-400" aria-hidden />
      </div>
      {href ? (
        <Link href={href} className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-gold-600 hover:underline">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
