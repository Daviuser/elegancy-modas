"use server";

import { revalidatePath } from "next/cache";
import { firstIssue, withAdmin } from "@/lib/action-utils";
import { deleteBlobsQuietly } from "@/lib/storage/blob";
import { productSchema } from "@/lib/validations/product";
import { deleteProduct, saveProduct } from "@/services/product.service";
import type { ActionResult } from "@/types";

export async function saveProductAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return withAdmin(async (admin) => {
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

    const { id, removedUrls } = await saveProduct(parsed.data, admin.id);
    await deleteBlobsQuietly(removedUrls);

    revalidatePath("/admin/produtos");
    revalidatePath("/admin/estoque");
    return { ok: true, message: parsed.data.id ? "Produto atualizado." : "Produto cadastrado.", data: { id } };
  });
}

export async function deleteProductAction(id: string): Promise<ActionResult<{ result: "deleted" | "archived" }>> {
  return withAdmin(async () => {
    if (typeof id !== "string" || !id) return { ok: false, message: "Produto inválido." };
    const { result, urls } = await deleteProduct(id);
    await deleteBlobsQuietly(urls);

    revalidatePath("/admin/produtos");
    revalidatePath("/admin/estoque");
    return {
      ok: true,
      data: { result },
      message:
        result === "deleted"
          ? "Produto excluído."
          : "Produto arquivado. O histórico de estoque e pedidos foi preservado.",
    };
  });
}
