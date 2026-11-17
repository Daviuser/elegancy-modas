import "server-only";
import { Prisma, type StockMovementType } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { StockMovementInput } from "@/lib/validations/stock";
import { LOW_STOCK_THRESHOLD } from "./dashboard.service";

export const STOCK_PER_PAGE = 25;
export const MOVEMENTS_PER_PAGE = 30;

export type StockLevel = "all" | "low" | "out";

export async function listStockVariants(filters: { q?: string; level: StockLevel; page: number }) {
  const where: Prisma.ProductVariantWhereInput = { product: { status: { not: "ARCHIVED" } } };
  if (filters.level === "out") where.stock = 0;
  if (filters.level === "low") where.stock = { gt: 0, lte: LOW_STOCK_THRESHOLD };
  if (filters.q) {
    where.OR = [
      { product: { name: { contains: filters.q, mode: "insensitive" } } },
      { product: { sku: { contains: filters.q, mode: "insensitive" } } },
      { size: { contains: filters.q, mode: "insensitive" } },
      { colorName: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    db.productVariant.count({ where }),
    db.productVariant.findMany({
      where,
      orderBy: [{ product: { name: "asc" } }, { colorName: "asc" }, { size: "asc" }],
      skip: (filters.page - 1) * STOCK_PER_PAGE,
      take: STOCK_PER_PAGE,
      select: {
        id: true,
        size: true,
        colorName: true,
        stock: true,
        active: true,
        product: { select: { id: true, name: true, sku: true } },
      },
    }),
  ]);
  return { total, items: rows };
}

/** Entrada, saída ou ajuste manual — saldo e histórico mudam juntos, em uma transação. */
export async function registerMovement(input: StockMovementInput, adminId: string) {
  return db.$transaction(
    async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: input.variantId },
        select: { id: true, stock: true },
      });
      if (!variant) throw new AppError("Variação não encontrada.");

      let delta: number;
      if (input.type === "ENTRY") {
        delta = input.quantity;
      } else if (input.type === "EXIT") {
        delta = -input.quantity;
      } else {
        delta = input.quantity - variant.stock; // quantity = novo saldo
        if (delta === 0) throw new AppError("O saldo informado é igual ao saldo atual.");
      }

      const balanceAfter = variant.stock + delta;
      if (balanceAfter < 0) {
        throw new AppError(`Saída maior que o estoque disponível (${variant.stock} un.).`);
      }

      // Atualização condicional: falha se outra pessoa alterou o saldo no meio do caminho.
      const updated = await tx.productVariant.updateMany({
        where: { id: variant.id, stock: variant.stock },
        data: { stock: balanceAfter },
      });
      if (updated.count !== 1) {
        throw new AppError("O estoque foi alterado por outra operação. Atualize a página e tente novamente.");
      }

      await tx.stockMovement.create({
        data: {
          variantId: variant.id,
          type: input.type,
          quantity: delta,
          balanceAfter,
          reason: input.note,
          adminId,
        },
      });
      return { balance: balanceAfter };
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

export async function listMovements(filters: { q?: string; type?: StockMovementType; page: number }) {
  const where: Prisma.StockMovementWhereInput = {};
  if (filters.type) where.type = filters.type;
  if (filters.q) {
    where.variant = {
      OR: [
        { product: { name: { contains: filters.q, mode: "insensitive" } } },
        { product: { sku: { contains: filters.q, mode: "insensitive" } } },
      ],
    };
  }

  const [total, rows] = await Promise.all([
    db.stockMovement.count({ where }),
    db.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * MOVEMENTS_PER_PAGE,
      take: MOVEMENTS_PER_PAGE,
      select: {
        id: true,
        type: true,
        quantity: true,
        balanceAfter: true,
        reason: true,
        createdAt: true,
        admin: { select: { name: true } },
        variant: { select: { size: true, colorName: true, product: { select: { id: true, name: true } } } },
      },
    }),
  ]);
  return { total, items: rows };
}
