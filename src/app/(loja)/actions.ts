"use server";

import { AppError } from "@/lib/errors";
import { cartItemsSchema, createOrderSchema } from "@/lib/validations/order";
import { resolveCartLines } from "@/services/cart.service";
import { createOrder } from "@/services/order.service";
import type { ActionResult } from "@/types";
import type { CartLine } from "@/types/store";

/** Leitura pública: o navegador manda só variantId e quantidade; preços vêm do banco. */
export async function getCartLinesAction(
  items: unknown,
): Promise<ActionResult<{ lines: CartLine[]; missingIds: string[] }>> {
  const parsed = cartItemsSchema.safeParse(items);
  if (!parsed.success) return { ok: false, message: "Carrinho inválido." };
  try {
    return { ok: true, data: await resolveCartLines(parsed.data) };
  } catch (error) {
    console.error("[cart]", error);
    return { ok: false, message: "Não foi possível carregar o carrinho. Tente novamente." };
  }
}

export async function createOrderAction(input: unknown): Promise<ActionResult<{ token: string }>> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  try {
    const order = await createOrder(parsed.data);
    return { ok: true, data: { token: order.publicToken } };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, message: error.message };
    console.error("[createOrder]", error);
    return { ok: false, message: "Não foi possível registrar o pedido. Tente novamente." };
  }
}
