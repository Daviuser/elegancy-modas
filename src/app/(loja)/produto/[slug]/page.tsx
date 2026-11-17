import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductPurchase } from "@/components/store/ProductPurchase";
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
    openGraph: { title: p.name, description, images: p.images[0] ? [p.images[0].url] : undefined },
  };
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
    <div className="mx-auto max-w-7xl px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Você está em" className="mb-6 text-sm text-ink-soft">
        <Link href="/" className="hover:text-gold-600">Início</Link> /{" "}
        <Link href={`/catalogo?categoria=${product.category.slug}`} className="hover:text-gold-600">{product.category.name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <div className="lg:pt-4">
          <h1 className="font-display text-4xl font-light leading-tight tracking-wide sm:text-5xl">{product.name}</h1>
          {product.sku ? <p className="mt-2 text-sm text-ink-soft">Ref. {product.sku}</p> : null}
          <span className="my-6 block h-px w-12 bg-gold-400" aria-hidden />
          <ProductPurchase product={{ name: product.name, price: product.price, promoPrice: product.promoPrice, variants: product.variants }} />
          {product.description ? (
            <div className="mt-10 border-t border-beige-200 pt-8">
              <h2 className="font-display text-2xl">Descrição</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{product.description}</p>
            </div>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-24">
          <SectionHeading title="Você também pode gostar" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
