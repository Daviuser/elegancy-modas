import "server-only";
import { Prisma, type OrderStatus } from "@prisma/client";
import { orderStatusLabels, orderTransitions } from "@/config/orders";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { formatOrderNumber } from "@/lib/order-format";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import type { CreateOrderInput } from "@/lib/validations/order";
import { resolveCartLines } from "./cart.service";
import { getStoreSettings } from "./settings.service";

export const ORDERS_PER_PAGE = 20;
const TX = { maxWait: 10_000, timeout: 20_000 };

// ───────────── Criação (checkout público) ─────────────

/**
 * Cria o pedido a partir do carrinho, recalculando tudo no servidor.
 * NÃO mexe no estoque: a baixa só acontece quando o administrador confirma.
 * Idempotente: a mesma idempotencyKey devolve o pedido já criado.
 */
export async function createOrder(input: CreateOrderInput) {
  const existing = await db.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { publicToken: true, number: true },
  });
  if (existing) return existing;

  const settings = await getStoreSettings();
  if (!normalizeWhatsAppNumber(settings.whatsappNumber)) {
    throw new AppError("A loja ainda não configurou o WhatsApp para receber pedidos. Tente novamente mais tarde.");
  }

  // Freio simples contra rajadas de pedidos automatizados.
  const recent = await db.order.count({ where: { createdAt: { gte: new Date(Date.now() - 60_000) } } });
  if (recent >= 20) throw new AppError("Muitos pedidos neste momento. Tente novamente em instantes.");

  const { lines, missingIds } = await resolveCartLines(input.items);
  if (missingIds.length > 0) throw new AppError("Alguns itens não estão mais disponíveis. Revise seu carrinho.");
  const blocked = lines.filter((l) => l.issue);
  if (blocked.length > 0) {
    throw new AppError(
      `Revise seu carrinho: ${blocked.map((l) => `${l.name} (${l.size}/${l.colorName}) — ${l.issue}`).join("; ")}.`,
    );
  }
  if (lines.length === 0) throw new AppError("Seu carrinho está vazio.");

  const cents = lines.map((l) => Math.round(l.unitPrice * 100) * l.quantity);
  const totalCents = cents.reduce((a, b) => a + b, 0);

  try {
    return await db.order.create({
      data: {
        customerName: input.customerName,
        idempotencyKey: input.idempotencyKey,
        subtotal: totalCents / 100,
        discount: 0,
        total: totalCents / 100,
        items: {
          create: lines.map((l, i) => ({
            productId: l.productId,
            variantId: l.variantId,
            productName: l.name,
            productSku: l.sku,
            size: l.size,
            colorName: l.colorName,
            imageUrl: l.imageUrl,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            lineTotal: cents[i] / 100,
          })),
        },
      },
      select: { publicToken: true, number: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const again = await db.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        select: { publicToken: true, number: true },
      });
      if (again) return again;
    }
    throw error;
  }
}

export async function getOrderByToken(token: string) {
  const o = await db.order.findUnique({
    where: { publicToken: token },
    select: {
      number: true,
      customerName: true,
      status: true,
      total: true,
      createdAt: true,
      items: {
        orderBy: { createdAt: "asc" },
        select: { productName: true, size: true, colorName: true, quantity: true, unitPrice: true, lineTotal: true },
      },
    },
  });
  if (!o) return null;
  return {
    number: o.number,
    customerName: o.customerName,
    status: o.status,
    total: o.total.toNumber(),
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      productName: i.productName,
      size: i.size,
      colorName: i.colorName,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toNumber(),
      lineTotal: i.lineTotal.toNumber(),
    })),
  };
}

// ───────────── Administração ─────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function dayBoundary(value: string | undefined, end: boolean): Date | undefined {
  if (!value || !DATE_RE.test(value)) return undefined;
  const d = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}-03:00`); // America/Bahia
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function listOrders(f: { q?: string; status?: OrderStatus; from?: string; to?: string; page: number }) {
  const where: Prisma.OrderWhereInput = {};
  if (f.status) where.status = f.status;

  const from = dayBoundary(f.from, false);
  const to = dayBoundary(f.to, true);
  if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

  if (f.q) {
    const m = f.q.match(/^(?:EM-?)?(\d{1,9})$/i);
    where.OR = [
      { customerName: { contains: f.q, mode: "insensitive" } },
      ...(m ? [{ number: parseInt(m[1], 10) }] : []),
    ];
  }

  const [total, rows] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * ORDERS_PER_PAGE,
      take: ORDERS_PER_PAGE,
      select: {
        id: true,
        number: true,
        customerName: true,
        status: true,
        total: true,
        createdAt: true,
        items: { select: { productName: true, quantity: true } },
      },
    }),
  ]);
  return {
    total,
    items: rows.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      status: o.status,
      total: o.total.toNumber(),
      createdAt: o.createdAt,
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
      firstItem: o.items[0]?.productName ?? "—",
      extraItems: Math.max(0, o.items.length - 1),
    })),
  };
}

export async function getOrderDetail(id: string) {
  const o = await db.order.findUnique({ where: { id }, include: { items: { orderBy: { createdAt: "asc" } } } });
  if (!o) return null;
  return {
    id: o.id,
    number: o.number,
    customerName: o.customerName,
    status: o.status,
    total: o.total.toNumber(),
    createdAt: o.createdAt,
    confirmedAt: o.confirmedAt,
    cancelledAt: o.cancelledAt,
    stockDeductedAt: o.stockDeductedAt,
    stockRestoredAt: o.stockRestoredAt,
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      productSku: i.productSku,
      size: i.size,
      colorName: i.colorName,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toNumber(),
      lineTotal: i.lineTotal.toNumber(),
    })),
  };
}

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

function aggregateByVariant(order: OrderWithItems) {
  const map = new Map<string, number>();
  for (const it of order.items) {
    if (!it.variantId) {
      throw new AppError(`“${it.productName}” (${it.size}/${it.colorName}) não existe mais no cadastro.`);
    }
    map.set(it.variantId, (map.get(it.variantId) ?? 0) + it.quantity);
  }
  return map;
}

/** Baixa de estoque da confirmação: tudo ou nada, dentro da transação do chamador. */
async function deductStock(tx: Prisma.TransactionClient, order: OrderWithItems, adminId: string, now: Date) {
  const needed = aggregateByVariant(order);
  const ids = [...needed.keys()].sort(); // ordem fixa evita deadlocks

  const variants = await tx.productVariant.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      size: true,
      colorName: true,
      active: true,
      stock: true,
      product: { select: { name: true, status: true } },
    },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const problems: string[] = [];
  for (const id of ids) {
    const qty = needed.get(id)!;
    const v = byId.get(id);
    if (!v) {
      problems.push("variação inexistente");
      continue;
    }
    const label = `${v.product.name} (${v.size}/${v.colorName})`;
    if (v.product.status !== "ACTIVE") problems.push(`${label}: produto inativo`);
    else if (!v.active) problems.push(`${label}: variação inativa`);
    else if (v.stock < qty) problems.push(`${label}: estoque insuficiente (disponível ${v.stock}, pedido ${qty})`);
  }
  if (problems.length > 0) {
    throw new AppError(`Pedido não confirmado — nada foi descontado. ${problems.join(" • ")}`);
  }

  for (const id of ids) {
    const qty = needed.get(id)!;
    const upd = await tx.productVariant.updateMany({
      where: { id, stock: { gte: qty } },
      data: { stock: { decrement: qty } },
    });
    if (upd.count !== 1) throw new AppError("O estoque mudou durante a confirmação. Tente novamente.");
    const after = await tx.productVariant.findUniqueOrThrow({ where: { id }, select: { stock: true } });
    await tx.stockMovement.create({
      data: {
        variantId: id,
        type: "SALE",
        quantity: -qty,
        balanceAfter: after.stock,
        reason: `Pedido ${formatOrderNumber(order.number)} confirmado`,
        orderId: order.id,
        adminId,
      },
    });
  }
  await tx.order.update({ where: { id: order.id }, data: { stockDeductedAt: now } });
}

/** Devolução do estoque de pedido confirmado que foi cancelado. */
async function restoreStock(tx: Prisma.TransactionClient, order: OrderWithItems, adminId: string, now: Date) {
  const returned = aggregateByVariant(order);
  for (const id of [...returned.keys()].sort()) {
    const qty = returned.get(id)!;
    await tx.productVariant.update({ where: { id }, data: { stock: { increment: qty } } });
    const after = await tx.productVariant.findUniqueOrThrow({ where: { id }, select: { stock: true } });
    await tx.stockMovement.create({
      data: {
        variantId: id,
        type: "CANCELLATION",
        quantity: qty,
        balanceAfter: after.stock,
        reason: `Pedido ${formatOrderNumber(order.number)} cancelado — estoque devolvido`,
        orderId: order.id,
        adminId,
      },
    });
  }
  await tx.order.update({ where: { id: order.id }, data: { stockRestoredAt: now } });
}

/**
 * Altera a situação do pedido em UMA transação.
 * - PENDING → CONFIRMED: valida tudo, desconta o estoque e registra as movimentações.
 * - Cancelar antes de confirmar: nenhuma movimentação.
 * - Cancelar pedido confirmado: devolve o estoque uma única vez.
 * A "reivindicação" condicional do status + marcadores + índice único impedem duplicidade.
 */
export async function changeOrderStatus(orderId: string, target: OrderStatus, adminId: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new AppError("Pedido não encontrado.");
    if (order.status === target) throw new AppError("O pedido já está nesta situação.");
    if (!orderTransitions[order.status].includes(target)) {
      throw new AppError(
        `Não é possível mudar de “${orderStatusLabels[order.status]}” para “${orderStatusLabels[target]}”.`,
      );
    }

    const now = new Date();
    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: {
        status: target,
        ...(target === "CONFIRMED" ? { confirmedAt: now } : {}),
        ...(target === "CANCELLED" ? { cancelledAt: now } : {}),
      },
    });
    if (claimed.count !== 1) {
      throw new AppError("Este pedido foi alterado por outra pessoa. Atualize a página.");
    }

    if (target === "CONFIRMED") await deductStock(tx, order, adminId, now);
    if (target === "CANCELLED" && order.stockDeductedAt && !order.stockRestoredAt) {
      await restoreStock(tx, order, adminId, now);
    }
    return { status: target };
  }, TX);
}
