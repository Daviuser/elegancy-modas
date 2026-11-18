import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BannerHero } from "@/components/store/BannerHero";
import { Hero, type HeroProduct } from "@/components/store/Hero";
import { InfoStrip } from "@/components/store/InfoStrip";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal } from "@/components/store/Reveal";
import { SectionHeading } from "@/components/store/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getActiveBanner } from "@/services/banner.service";
import { getHomeData } from "@/services/store.service";

export const metadata: Metadata = { title: { absolute: "Elegancy Modas — moda feminina" } };

export default async function HomePage() {
  const [banner, home] = await Promise.all([getActiveBanner(), getHomeData()]);

  // Fotos reais do banco para a abertura (destaques primeiro, depois novidades).
  const seen = new Set<string>();
  const heroProducts: HeroProduct[] = [];
  for (const p of [...home.featured, ...home.newest]) {
    if (p.imageUrl && !seen.has(p.id) && p.available) {
      seen.add(p.id);
      heroProducts.push({ slug: p.slug, name: p.name, imageUrl: p.imageUrl });
    }
    if (heroProducts.length === 3) break;
  }

  const bigFeature = home.featured.length >= 3;
  const bigCategory = home.categories.length >= 3;

  return (
    <>
      {banner ? <BannerHero {...banner} /> : <Hero products={heroProducts} />}
      <InfoStrip />

      {home.categories.length > 0 ? (
        <section className="mx-auto max-w-[90rem] px-4 pt-20 sm:px-8 lg:pt-28">
          <Reveal>
            <SectionHeading kicker="Navegue por" title="Categorias" />
          </Reveal>
          <Reveal>
            <ul className={cn("grid gap-2.5 sm:gap-4", bigCategory ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2")}>
              {home.categories.map((c, i) => {
                const big = bigCategory && i === 0;
                return (
                  <li key={c.slug} className={cn(big && "col-span-2 lg:row-span-2")}>
                    <Link
                      href={`/catalogo?categoria=${c.slug}`}
                      className={cn("group relative block overflow-hidden bg-paper-deep", big ? "aspect-[4/3] lg:aspect-auto lg:h-full" : "aspect-[4/5]")}
                    >
                      {c.imageUrl ? (
                        <Image src={c.imageUrl} alt="" fill sizes={big ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} className="object-cover transition-transform duration-[1200ms] ease-soft group-hover:scale-[1.04]" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center font-display text-8xl italic text-paper">{c.name.slice(0, 1)}</span>
                      )}
                      <span className="absolute bottom-3 left-3 flex items-center gap-2 bg-paper py-2 pl-4 pr-3 font-display text-lg transition-transform duration-500 ease-soft group-hover:-translate-y-1 sm:text-xl">
                        {c.name}
                        <ArrowRight size={15} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </section>
      ) : null}

      {home.newest.length > 0 ? (
        <section className="mx-auto max-w-[90rem] pt-20 sm:px-8 lg:pt-28">
          <Reveal className="px-4 sm:px-0">
            <SectionHeading kicker="Acabou de chegar" title="Novidades" href="/catalogo?ordem=novidades" />
          </Reveal>
          <Reveal>
            {/* Celular: carrossel com rolagem e encaixe. Desktop: grade. */}
            <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:gap-5 sm:px-0 lg:grid lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12 lg:overflow-visible">
              {home.newest.map((p, i) => (
                <li key={p.id} className="w-[66%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
                  <ProductCard product={p} priority={i < 2} />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}

      {home.featured.length > 0 ? (
        <section className="mx-auto max-w-[90rem] px-4 pt-20 sm:px-8 lg:pt-28">
          <Reveal>
            <SectionHeading kicker="Nossa seleção" title="Em destaque" />
          </Reveal>
          <Reveal>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-y-12">
              {home.featured.map((p, i) => {
                const big = bigFeature && i === 0;
                return (
                  <li key={p.id} className={cn(big && "col-span-2 lg:row-span-2")}>
                    <ProductCard product={p} variant={big ? "feature" : "default"} />
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </section>
      ) : null}

      <section className="mt-24 bg-paper-deep lg:mt-32">
        <Reveal className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-8 px-4 py-16 sm:px-8 lg:flex-row lg:items-center lg:py-24">
          <h2 className="max-w-2xl font-display text-4xl leading-[1.05] sm:text-6xl">
            Encontre a peça <em className="italic text-wine">certa</em> para o seu estilo.
          </h2>
          <Link href="/catalogo" className={buttonClass("primary", "group h-14 px-10 text-[15px]")}>
            Explorar o catálogo
            <ArrowRight size={18} strokeWidth={1.5} className="transition-transform duration-300 ease-soft group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
