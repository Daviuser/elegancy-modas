import Image from "next/image";
import Link from "next/link";
import { cn, formatBRL } from "@/lib/utils";
import type { StoreProductCard } from "@/types/store";

type Props = { product: StoreProductCard; priority?: boolean; variant?: "default" | "feature" };

export function ProductCard({ product, priority = false, variant = "default" }: Props) {
  const { name, slug, price, promoPrice, imageUrl, hoverImageUrl, available } = product;
  const feature = variant === "feature";
  const discount = promoPrice !== null ? Math.round((1 - promoPrice / price) * 100) : 0;
  const sizes = feature
    ? "(min-width:1024px) 50vw, 100vw"
    : "(min-width:1280px) 22vw, (min-width:768px) 30vw, 60vw";

  return (
    <Link href={`/produto/${slug}`} className={cn("group block", feature && "flex h-full flex-col")}>
      <div className={cn("relative overflow-hidden bg-paper-deep", feature ? "min-h-[26rem] flex-1" : "aspect-[3/4]")}>
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={name}
              fill
              priority={priority}
              sizes={sizes}
              className={cn(
                "object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.04]",
                !available && "opacity-60",
              )}
            />
            {hoverImageUrl && available ? (
              <Image
                src={hoverImageUrl}
                alt=""
                fill
                sizes={sizes}
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : (
          <div className="grid h-full place-items-center font-display text-3xl italic text-mute/60">{name.slice(0, 1)}</div>
        )}

        <div className="absolute left-0 top-3 flex flex-col items-start gap-1.5">
          {!available ? (
            <span className="bg-paper px-3 py-1 text-[11px] tracking-[0.08em] text-ink-soft">ESGOTADO</span>
          ) : discount > 0 ? (
            <span className="bg-wine px-3 py-1 text-[11px] tracking-[0.08em] text-paper">-{discount}%</span>
          ) : null}
        </div>
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <h3 className={cn("font-display leading-snug transition-colors duration-300 group-hover:text-wine", feature ? "text-3xl" : "text-lg sm:text-xl")}>
          {name}
        </h3>
        <p className="shrink-0 pt-1 text-sm">
          {promoPrice !== null && available ? (
            <>
              <span className="block text-right font-medium text-wine">{formatBRL(promoPrice)}</span>
              <span className="block text-right text-xs text-mute line-through">{formatBRL(price)}</span>
            </>
          ) : (
            <span className="text-ink-soft">{formatBRL(promoPrice ?? price)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
