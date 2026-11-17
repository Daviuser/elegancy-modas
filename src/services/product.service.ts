import "server-only";
import { Prisma, type ProductStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import type { ProductInput } from "@/lib/validations/product";
import type { ProductFormData } from "@/types/product";

export const PRODUCTS_PER_PAGE = 20;

export type ProductListFilters = {
  q?: string;
  categoryId?: string;
  status?: ProductStatus | "ALL";
  page: number;
};

export async function listProducts(filters: ProductListFilters) {
  const where: Prisma.ProductWhereInput = {};
  if (filters.status === "ALL") {
    // sem filtro de status
  } else if (filters.status) {
    where.status = filters.status;
  } else {
    where.status = { not: "ARCHIVED" };
  }
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { sku: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
      select: {
        id: true,
        name: true,
        sku: true,
        status: true,
        price: true,
        promoPrice: true,
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        variants: { select: { stock: true, active: true } },
      },
    }),
  ]);

  const items = rows.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    status: p.status,
    price: p.price.toNumber(),
    promoPrice: p.promoPrice ? p.promoPrice.toNumber() : null,
    categoryName: p.category.name,
    imageUrl: p.images[0]?.url ?? null,
    variantCount: p.variants.length,
    totalStock: p.variants.filter((v) => v.active).reduce((sum, v) => sum + v.stock, 0),
  }));
  return { items, total };
}

export async function getProductForEdit(id: string): Promise<ProductFormData | null> {
  const p = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ colorName: "asc" }, { size: "asc" }] },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    categoryId: p.categoryId,
    price: p.price.toNumber(),
    promoPrice: p.promoPrice ? p.promoPrice.toNumber() : null,
    sku: p.sku ?? "",
    status: p.status,
    images: p.images.map((i) => ({ id: i.id, url: i.url, pathname: i.pathname })),
    variants: p.variants.map((v) => ({
      id: v.id,
      size: v.size,
      colorName: v.colorName,
      active: v.active,
      stock: v.stock,
    })),
  };
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "produto";
  let slug = base;
  let i = 2;
  while (await db.product.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${i++}`;
  return slug;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = String(error.meta?.target ?? "");
    if (target.includes("sku")) throw new AppError("Este código de referência já está em uso por outro produto.");
    if (target.includes("colorName") || target.includes("productId")) {
      throw new AppError("Já existe uma variação com este tamanho e cor neste produto.");
    }
    if (target.includes("slug")) throw new AppError("Já existe um produto com este nome. Tente outro nome.");
  }
  throw error;
}

const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };

/** Cria ou atualiza um produto com imagens e variações em uma única transação. */
export async function saveProduct(input: ProductInput, adminId: string) {
  const category = await db.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
  if (!category) throw new AppError("Categoria não encontrada.");

  const base = {
    name: input.name,
    description: input.description,
    sku: input.sku,
    price: input.price,
    promoPrice: input.promoPrice,
    status: input.status,
    categoryId: input.categoryId,
  };

  try {
    if (!input.id) {
      const slug = await uniqueSlug(input.name);
      const created = await db.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            ...base,
            slug,
            images: {
              create: input.images.map((img, i) => ({
                url: img.url,
                pathname: img.pathname,
                position: i,
                isPrimary: i === 0,
              })),
            },
            variants: {
              create: input.variants.map((v) => ({
                size: v.size,
                colorName: v.colorName,
                active: v.active,
                stock: v.initialStock,
              })),
            },
          },
          select: { id: true, variants: { select: { id: true, stock: true } } },
        });
        const initial = product.variants
          .filter((v) => v.stock > 0)
          .map((v) => ({
            variantId: v.id,
            type: "INITIAL" as const,
            quantity: v.stock,
            balanceAfter: v.stock,
            reason: "Estoque inicial no cadastro do produto",
            adminId,
          }));
        if (initial.length > 0) await tx.stockMovement.createMany({ data: initial });
        return product;
      }, TX_OPTIONS);
      return { id: created.id, removedUrls: [] as string[] };
    }

    const id = input.id;
    const existing = await db.product.findUnique({
      where: { id },
      select: { id: true, images: { select: { id: true, url: true } }, variants: { select: { id: true } } },
    });
    if (!existing) throw new AppError("Produto não encontrado.");

    const existingImageIds = new Set(existing.images.map((i) => i.id));
    const existingVariantIds = new Set(existing.variants.map((v) => v.id));
    if (input.images.some((i) => i.id && !existingImageIds.has(i.id))) throw new AppError("Imagem inválida.");
    if (input.variants.some((v) => v.id && !existingVariantIds.has(v.id))) throw new AppError("Variação inválida.");

    const keptImageIds = new Set(input.images.flatMap((i) => (i.id ? [i.id] : [])));
    const removed = existing.images.filter((i) => !keptImageIds.has(i.id));

    await db.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: base });

      if (removed.length > 0) {
        await tx.productImage.deleteMany({ where: { id: { in: removed.map((r) => r.id) } } });
      }
      for (const [i, img] of input.images.entries()) {
        if (img.id) {
          await tx.productImage.update({ where: { id: img.id }, data: { position: i, isPrimary: i === 0 } });
        } else {
          await tx.productImage.create({
            data: { productId: id, url: img.url, pathname: img.pathname, position: i, isPrimary: i === 0 },
          });
        }
      }

      for (const v of input.variants) {
        if (v.id) {
          // O saldo de variações existentes NUNCA é alterado aqui: somente via movimentação.
          await tx.productVariant.update({
            where: { id: v.id },
            data: { size: v.size, colorName: v.colorName, active: v.active },
          });
        } else {
          const created = await tx.productVariant.create({
            data: { productId: id, size: v.size, colorName: v.colorName, active: v.active, stock: v.initialStock },
            select: { id: true },
          });
          if (v.initialStock > 0) {
            await tx.stockMovement.create({
              data: {
                variantId: created.id,
                type: "INITIAL",
                quantity: v.initialStock,
                balanceAfter: v.initialStock,
                reason: "Estoque inicial no cadastro da variação",
                adminId,
              },
            });
          }
        }
      }
    }, TX_OPTIONS);

    return { id, removedUrls: removed.map((r) => r.url) };
  } catch (error) {
    return mapPrismaError(error);
  }
}

/**
 * Exclusão segura: produto com pedidos ou histórico de estoque é ARQUIVADO,
 * preservando todo o histórico. Só é apagado de fato quando não há nenhum vínculo.
 */
export async function deleteProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, images: { select: { url: true } }, _count: { select: { orderItems: true } } },
  });
  if (!product) throw new AppError("Produto não encontrado.");

  const movements = await db.stockMovement.count({ where: { variant: { productId: id } } });
  if (product._count.orderItems > 0 || movements > 0) {
    await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    return { result: "archived" as const, urls: [] as string[] };
  }

  await db.product.delete({ where: { id } });
  return { result: "deleted" as const, urls: product.images.map((i) => i.url) };
}
