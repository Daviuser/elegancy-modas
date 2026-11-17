import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BannerHero } from "@/components/store/BannerHero";
import { Hero } from "@/components/store/Hero";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";
import { buttonClass } from "@/components/ui/Button";
import { getActiveBanner } from "@/services/banner.service";
import { getHomeData } from "@/services/store.service";

export const metadata: Metadata = { title: { absolute: "Elegancy Modas — moda feminina" } };

export default async function HomePage() {
  const [banner, home] = await Promise.all([getActiveBanner(), getHomeData()]);
  const empty = home.newest.length === 0;

  return (
    <>
      {banner ? <BannerHero {...banner} /> : <Hero />}

      {home.categories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <SectionHeading title="Categorias" />
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {home.categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo?categoria=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-beige-200">
                  {c.imageUrl ? (
                    <Image src={c.imageUrl} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  ) : null}
                  <span className="absolute inset-0 bg-ink/20 transition-colors group-hover:bg-ink/10" aria-hidden />
                  <span className="absolute inset-x-0 bottom-0 p-4 font-display text-2xl text-white">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {home.newest.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <SectionHeading title="Novidades" href="/catalogo?ordem=novidades" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {home.newest.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </section>
      ) : null}

      {home.featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <SectionHeading title="Em destaque" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {home.featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 pt-20 text-center">
        {empty ? (
          <p className="font-display text-2xl text-ink-soft">Nossa coleção está sendo preparada. Volte em breve.</p>
        ) : (
          <>
            <h2 className="font-display text-3xl font-light sm:text-4xl">Explore o catálogo completo</h2>
            <Link href="/catalogo" className={buttonClass("primary", "mt-6")}>Ver todas as peças</Link>
          </>
        )}
      </section>
    </>
  );
}
