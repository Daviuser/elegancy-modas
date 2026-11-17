"use server";

import { revalidatePath } from "next/cache";
import { firstIssue, withAdmin } from "@/lib/action-utils";
import { categorySchema } from "@/lib/validations/category";
import { deleteCategory, saveCategory, setCategoryActive } from "@/services/category.service";
import type { ActionResult } from "@/types";

export async function saveCategoryAction(input: unknown): Promise<ActionResult> {
  return withAdmin(async () => {
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
    await saveCategory(parsed.data);
    revalidatePath("/admin/categorias");
    return { ok: true, message: parsed.data.id ? "Categoria atualizada." : "Categoria criada." };
  });
}

export async function setCategoryActiveAction(id: string, active: boolean): Promise<ActionResult> {
  return withAdmin(async () => {
    if (typeof id !== "string" || !id || typeof active !== "boolean") return { ok: false, message: "Dados inválidos." };
    await setCategoryActive(id, active);
    revalidatePath("/admin/categorias");
    return { ok: true, message: active ? "Categoria ativada." : "Categoria desativada." };
  });
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  return withAdmin(async () => {
    if (typeof id !== "string" || !id) return { ok: false, message: "Categoria inválida." };
    await deleteCategory(id);
    revalidatePath("/admin/categorias");
    return { ok: true, message: "Categoria excluída." };
  });
}
