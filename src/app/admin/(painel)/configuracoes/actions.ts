"use server";

import { revalidatePath } from "next/cache";
import { firstIssue, withAdmin } from "@/lib/action-utils";
import { settingsSchema } from "@/lib/validations/settings";
import { saveStoreSettings } from "@/services/settings.service";
import type { ActionResult } from "@/types";

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  return withAdmin(async () => {
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };
    await saveStoreSettings(parsed.data);
    revalidatePath("/", "layout");
    return { ok: true, message: "Configurações salvas." };
  });
}
