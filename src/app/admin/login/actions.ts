"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";
import { authenticateAdmin } from "@/services/auth.service";
import type { ActionState } from "@/types";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Informe um e-mail e uma senha válidos." };
  }

  const result = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!result.ok) return { ok: false, message: result.message };

  await createSession(result.admin.id, result.admin.tokenVersion);
  redirect("/admin");
}
