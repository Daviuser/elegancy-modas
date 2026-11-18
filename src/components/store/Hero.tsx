import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

export type HeroProduct = { slug: string; name: string; imageUrl: string };

/** Texto da abertura, compartilhado entre a versão com banner e a versão com fotos dos produtos. */
export function HeroCopy({
  title,
  subtitle,
  href,
  cta,
}: {
  title: React.ReactNode;
  subtitle: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col justify-center lg:py-10">
      <p className="animate-rise font-display text-lg italic text-wine">Moda feminina</p>
      <h1 className="animate-rise mt-4 font-display text-[3.4rem] leading-[0.96] sm:text-7xl xl:text-[6rem]" style={{ animationDelay: "80ms" }}>
        {title}
      </h1>
      <p className="animate-rise mt-6 max-w-md text-lg leading-relaxed text-ink-soft" style={{ animationDelay: "180ms" }}>
        {subtitle}
      </p>
      <div className="animate-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: "280ms" }}>
        <Link href={href} className={buttonClass("primary", "group h-14 px-9 text-[15px]")}>
          {cta}
          <ArrowRight size={18} strokeWidth={1.5} className="transition-transform duration-300 ease-soft group-hover:translate-x-1" />
        </Link>
        <Link href="/catalogo?ordem=novidades" className="link-underline pb-0.5 text-[15px]">
          Ver novidades
        </Link>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute bottom-3 left-3 max-w-[80%] truncate bg-paper px-3.5 py-2 text-xs transition-transform duration-500 ease-soft group-hover:-translate-y-1">
      {children}
    </span>
  );
}

/** Abertura sem banner ativo: composição editorial com as fotos reais dos produtos. */
export function Hero({ products }: { products: HeroProduct[] }) {
  const [main, second, third] = products;

  return (
    <section>
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 pb-16 pt-8 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:pb-24 lg:pt-12">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <HeroCopy
            title={
              <>
                Elegância <em className="font-normal italic text-wine">em cada</em> detalhe.
              </>
            }
            subtitle="Peças selecionadas para quem valoriza caimento, qualidade e personalidade — do dia a dia às ocasiões especiais."
            href="/catalogo"
            cta="Ver a coleção"
          />
        </div>

        <div className="order-1 lg:order-2 lg:col-span-7">
          {main ? (
            <div className="grid aspect-[5/6] grid-cols-12 grid-rows-2 gap-2.5 sm:aspect-[7/6] sm:gap-4">
              <Link
                href={`/produto/${main.slug}`}
                className={`group relative row-span-2 overflow-hidden bg-paper-deep animate-settle ${second ? "col-span-8" : "col-span-12"}`}
              >
                <Image src={main.imageUrl} alt={main.name} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover transition-transform duration-[1200ms] ease-soft group-hover:scale-[1.03]" />
                <Tag>{main.name}</Tag>
              </Link>
              {second ? (
                <Link
                  href={`/produto/${second.slug}`}
                  className={`group relative col-span-4 overflow-hidden bg-paper-deep animate-settle ${third ? "row-span-1" : "row-span-2"}`}
                  style={{ animationDelay: "150ms" }}
                >
                  <Image src={second.imageUrl} alt={second.name} fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover transition-transform duration-[1200ms] ease-soft group-hover:scale-[1.04]" />
                </Link>
              ) : null}
              {third ? (
                <Link
                  href={`/produto/${third.slug}`}
                  className="group relative col-span-4 overflow-hidden bg-paper-deep animate-settle"
                  style={{ animationDelay: "300ms" }}
                >
                  <Image src={third.imageUrl} alt={third.name} fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover transition-transform duration-[1200ms] ease-soft group-hover:scale-[1.04]" />
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="relative grid aspect-[5/4] place-items-center overflow-hidden bg-paper-deep">
              <span className="font-display text-[22vw] italic leading-none text-paper lg:text-[12rem]" aria-hidden>
                Elegância
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
