import Image from "next/image";
import Link from "next/link";
import { cn, formatBRL } from "@/lib/utils";
import type { StoreProductCard } from "@/types/store";

export function ProductCard({ product, priority = false }: { product: StoreProductCard; priority?: boolean }) {
  const { name, slug, price, promoPrice, imageUrl, available } = product;
  return (
    <Link href={`/produto/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-beige-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority={priority}
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
            className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]", !available && "opacity-60")}
          />
        ) : (
          <div className="grid h-full place-items-center font-display text-lg text-beige-300">Sem foto</div>
        )}
        {promoPrice !== null && available ? (
          <span className="absolute left-2 top-2 bg-gold-500 px-2.5 py-1 text-xs tracking-wide text-white">Promoção</span>
        ) : null}
        {!available ? (
          <span className="absolute left-2 top-2 bg-ivory/95 px-2.5 py-1 text-xs tracking-wide text-ink-soft">Esgotado</span>
        ) : null}
      </div>
      <div className="mt-3">
        <h3 className="font-display text-xl leading-tight transition-colors group-hover:text-gold-600">{name}</h3>
        <p className="mt-1 text-sm">
          {promoPrice !== null ? (
            <>
              <span className="text-gold-600">{formatBRL(promoPrice)}</span>{" "}
              <span className="text-ink-soft line-through">{formatBRL(price)}</span>
            </>
          ) : (
            <span className="text-ink-soft">{formatBRL(price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
