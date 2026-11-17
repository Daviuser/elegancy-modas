"use server";

import { revalidatePath } from "next/cache";
import { firstIssue, withAdmin } from "@/lib/action-utils";
import { z } from "zod";
import { orderStatusSchema } from "@/lib/validations/order";
import { changeOrderStatus } from "@/services/order.service";
import type { ActionResult } from "@/types";

const schema = z.object({ orderId: z.string().min(1), target: orderStatusSchema });

export async function changeOrderStatusAction(orderId: string, target: string): Promise<ActionResult> {
  return withAdmin(async (admin) => {
    const parsed = schema.safeParse({ orderId, target });
    if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
    await changeOrderStatus(parsed.data.orderId, parsed.data.target, admin.id);
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${parsed.data.orderId}`);
    revalidatePath("/admin/estoque");
    revalidatePath("/admin/estoque/historico");
    revalidatePath("/admin");
    return { ok: true, message: "Situação do pedido atualizada." };
  });
}
