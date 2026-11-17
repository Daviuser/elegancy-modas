import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ProductDetail, StoreProductCard } from "@/types/store";

export const STORE_PER_PAGE = 12;
export type StoreSort = "novidades" | "menor" | "maior";

/** Só produtos ativos, em categorias ativas, aparecem na loja. */
const VISIBLE: Prisma.ProductWhereInput = { status: "ACTIVE", category: { active: true } };

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  promoPrice: true,
  images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
  variants: { where: { active: true }, select: { stock: true } },
} satisfies Prisma.ProductSelect;
type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export function effectivePrice(price: number, promo: number | null) {
  return promo !== null && promo < price ? promo : price;
}

function toCard(p: CardRow): StoreProductCard {
  const price = p.price.toNumber();
  const promo = p.promoPrice ? p.promoPrice.toNumber() : null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price,
    promoPrice: promo !== null && promo < price ? promo : null,
    imageUrl: p.images[0]?.url ?? null,
    available: p.variants.some((v) => v.stock > 0),
  };
}

export async function listNavCategories() {
  return db.category.findMany({
    where: { active: true, products: { some: { status: "ACTIVE" } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true, slug: true },
  });
}

export async function listStoreProducts(f: {
  q?: string;
  categorySlug?: string;
  min?: number;
  max?: number;
  sort: StoreSort;
  page: number;
}) {
  const and: Prisma.ProductWhereInput[] = [VISIBLE];
  if (f.q) and.push({ name: { contains: f.q, mode: "insensitive" } });
  if (f.categorySlug) and.push({ category: { slug: f.categorySlug } });
  if (f.min !== undefined || f.max !== undefined) {
    // Filtra pelo preço efetivo: promocional quando existe, senão o normal.
    const range: { gte?: number; lte?: number } = {};
    if (f.min !== undefined) range.gte = f.min;
    if (f.max !== undefined) range.lte = f.max;
    and.push({ OR: [{ promoPrice: range }, { promoPrice: null, price: range }] });
  }
  const where: Prisma.ProductWhereInput = { AND: and };

  if (f.sort === "novidades") {
    const [total, rows] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (f.page - 1) * STORE_PER_PAGE,
        take: STORE_PER_PAGE,
        select: cardSelect,
      }),
    ]);
    return { items: rows.map(toCard), total };
  }

  // Ordenação por preço efetivo (promoção considerada): feita em memória sobre o conjunto filtrado.
  const rows = await db.product.findMany({ where, orderBy: { createdAt: "desc" }, take: 1000, select: cardSelect });
  const cards = rows.map(toCard);
  const eff = (c: StoreProductCard) => effectivePrice(c.price, c.promoPrice);
  cards.sort((a, b) => (f.sort === "menor" ? eff(a) - eff(b) : eff(b) - eff(a)));
  const start = (f.page - 1) * STORE_PER_PAGE;
  return { items: cards.slice(start, start + STORE_PER_PAGE), total: cards.length };
}

export async function getHomeData() {
  const [newest, featured, categoryRows] = await Promise.all([
    db.product.findMany({ where: VISIBLE, orderBy: { createdAt: "desc" }, take: 8, select: cardSelect }),
    db.product.findMany({
      where: { AND: [VISIBLE, { featured: true }] },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: cardSelect,
    }),
    db.category.findMany({
      where: { active: true, products: { some: { status: "ACTIVE" } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        name: true,
        slug: true,
        products: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } },
        },
      },
    }),
  ]);
  return {
    newest: newest.map(toCard),
    featured: featured.map(toCard),
    categories: categoryRows.map((c) => ({
      name: c.name,
      slug: c.slug,
      imageUrl: c.products[0]?.images[0]?.url ?? null,
    })),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const p = await db.product.findFirst({
    where: { AND: [VISIBLE, { slug }] },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
      variants: { where: { active: true }, orderBy: [{ colorName: "asc" }, { size: "asc" }] },
    },
  });
  if (!p) return null;
  const price = p.price.toNumber();
  const promo = p.promoPrice ? p.promoPrice.toNumber() : null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    sku: p.sku,
    price,
    promoPrice: promo !== null && promo < price ? promo : null,
    category: p.category,
    images: p.images.map((i) => ({ id: i.id, url: i.url })),
    variants: p.variants.map((v) => ({ id: v.id, size: v.size, colorName: v.colorName, stock: v.stock })),
  };
}

export async function listRelatedProducts(categorySlug: string, excludeId: string) {
  const rows = await db.product.findMany({
    where: { AND: [VISIBLE, { category: { slug: categorySlug } }, { NOT: { id: excludeId } }] },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: cardSelect,
  });
  return rows.map(toCard);
}

export async function listSitemapProducts() {
  return db.product.findMany({ where: VISIBLE, select: { slug: true, updatedAt: true } });
}
