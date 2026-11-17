import "server-only";
import { db } from "@/lib/db";
import { effectivePrice } from "./store.service";
import type { CartLine } from "@/types/store";

export type CartRequestItem = { variantId: string; quantity: number };

/**
 * Resolve o carrinho SOMENTE com dados do banco (preço, nome, estoque, ativo).
 * O navegador envia apenas variantId e quantidade; nada mais é confiável.
 */
export async function resolveCartLines(items: CartRequestItem[]): Promise<{ lines: CartLine[]; missingIds: string[] }> {
  const merged = new Map<string, number>();
  for (const it of items) merged.set(it.variantId, Math.min(99, (merged.get(it.variantId) ?? 0) + it.quantity));
  const ids = [...merged.keys()];
  if (ids.length === 0) return { lines: [], missingIds: [] };

  const variants = await db.productVariant.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      size: true,
      colorName: true,
      stock: true,
      active: true,
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          sku: true,
          status: true,
          price: true,
          promoPrice: true,
          category: { select: { active: true } },
          images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: CartLine[] = [];
  const missingIds: string[] = [];
  for (const id of ids) {
    const v = byId.get(id);
    if (!v) {
      missingIds.push(id);
      continue;
    }
    const quantity = merged.get(id)!;
    const price = v.product.price.toNumber();
    const promo = v.product.promoPrice ? v.product.promoPrice.toNumber() : null;
    const unitPrice = effectivePrice(price, promo);

    let issue: string | null = null;
    if (v.product.status !== "ACTIVE" || !v.product.category.active) issue = "Produto indisponível";
    else if (!v.active) issue = "Variação indisponível";
    else if (v.stock <= 0) issue = "Esgotado";
    else if (quantity > v.stock) issue = `Apenas ${v.stock} em estoque`;

    lines.push({
      variantId: v.id,
      productId: v.product.id,
      slug: v.product.slug,
      name: v.product.name,
      sku: v.product.sku,
      size: v.size,
      colorName: v.colorName,
      imageUrl: v.product.images[0]?.url ?? null,
      unitPrice,
      originalPrice: price,
      onSale: unitPrice < price,
      quantity,
      stock: v.stock,
      issue,
    });
  }
  return { lines, missingIds };
}
