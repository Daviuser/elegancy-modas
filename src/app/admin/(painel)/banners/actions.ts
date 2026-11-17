"use server";

import { revalidatePath } from "next/cache";
import { firstIssue, withAdmin } from "@/lib/action-utils";
import { deleteBlobsQuietly } from "@/lib/storage/blob";
import { bannerSchema } from "@/lib/validations/banner";
import { createBanner, deleteBanner, setBannerActive } from "@/services/banner.service";
import type { ActionResult } from "@/types";

export async function createBannerAction(input: unknown): Promise<ActionResult> {
  return withAdmin(async () => {
    const parsed = bannerSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
    await createBanner(parsed.data);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true, message: "Banner criado." };
  });
}

export async function setBannerActiveAction(id: string, active: boolean): Promise<ActionResult> {
  return withAdmin(async () => {
    if (typeof id !== "string" || !id || typeof active !== "boolean") return { ok: false, message: "Dados inválidos." };
    await setBannerActive(id, active);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true, message: active ? "Banner ativado." : "Banner desativado." };
  });
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  return withAdmin(async () => {
    if (typeof id !== "string" || !id) return { ok: false, message: "Banner inválido." };
    const urls = await deleteBanner(id);
    await deleteBlobsQuietly(urls);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { ok: true, message: "Banner excluído." };
  });
}
