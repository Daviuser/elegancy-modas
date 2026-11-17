"use server";

import { revalidatePath } from "next/cache";
import { firstIssue, withAdmin } from "@/lib/action-utils";
import { stockMovementSchema } from "@/lib/validations/stock";
import { registerMovement } from "@/services/stock.service";
import type { ActionResult } from "@/types";

export async function registerMovementAction(input: unknown): Promise<ActionResult<{ balance: number }>> {
  return withAdmin(async (admin) => {
    const parsed = stockMovementSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

    const { balance } = await registerMovement(parsed.data, admin.id);
    revalidatePath("/admin/estoque");
    revalidatePath("/admin/estoque/historico");
    revalidatePath("/admin/produtos");
    return { ok: true, message: `Movimentação registrada. Novo saldo: ${balance} un.`, data: { balance } };
  });
}
