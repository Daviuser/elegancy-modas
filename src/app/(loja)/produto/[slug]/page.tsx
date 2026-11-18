import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductPurchase } from "@/components/store/ProductPurchase";
import { Reveal } from "@/components/store/Reveal";
import { SectionHeading } from "@/components/store/SectionHeading";
import { getProductBySlug, listRelatedProducts } from "@/services/store.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Produto não encontrado" };
  const description = p.description?.slice(0, 160) ?? `${p.name} — Elegancy Modas`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/produto/${p.slug}` },
    openGraph: { title: p.name, description, images: p.images[0] ? [p.images[0].url] : undefined },
  };
}

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex items-center justify-between py-5 font-display text-xl">
        {title}
        <Plus size={18} strokeWidth={1.4} className="transition-transform duration-300 ease-soft group-open:rotate-45" />
      </summary>
      <div className="details-panel pb-6 leading-relaxed text-ink-soft">{children}</div>
    </details>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await listRelatedProducts(product.category.slug, product.id);

  const price = product.promoPrice ?? product.price;
  const inStock = product.variants.some((v) => v.stock > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku ?? undefined,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: price.toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-24 pt-6 sm:px-8 lg:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Você está em" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
        <Link href="/" className="link-underline pb-0.5">Início</Link>
        <ChevronRight size={14} strokeWidth={1.4} />
        <Link href={`/catalogo?categoria=${product.category.slug}`} className="link-underline pb-0.5">{product.category.name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-display text-lg italic text-wine">{product.category.name}</p>
          <h1 className="mt-1 font-display text-[2.6rem] leading-[1.02] sm:text-6xl">{product.name}</h1>
          {product.sku ? <p className="mt-3 text-xs text-mute">Ref. {product.sku}</p> : null}

          <div className="mt-7">
            <ProductPurchase product={{ name: product.name, price: product.price, promoPrice: product.promoPrice, variants: product.variants }} />
          </div>

          <div className="mt-10 border-t border-line">
            {product.description ? (
              <Accordion title="Descrição" open>
                <p className="whitespace-pre-line">{product.description}</p>
              </Accordion>
            ) : null}
            <Accordion title="Como comprar">
              <p>Monte a sua sacola, informe apenas o seu nome e envie o pedido pelo WhatsApp. A loja confirma a disponibilidade e combina os próximos passos com você.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-24 lg:mt-32">
          <Reveal>
            <SectionHeading kicker="Combine com" title="Você também pode gostar" />
          </Reveal>
          <Reveal>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      ) : null}
    </div>
  );
}
