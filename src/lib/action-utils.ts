import "server-only";
import type { ZodError } from "zod";
import { getCurrentAdmin, type CurrentAdmin } from "@/lib/auth/dal";
import { AppError } from "@/lib/errors";
import type { ActionResult } from "@/types";

export function firstIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

/**
 * Envolve toda Server Action administrativa: confere a sessão no servidor
 * (não depende da proteção visual) e converte erros em mensagens seguras.
 */
export async function withAdmin<T = undefined>(
  fn: (admin: CurrentAdmin) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, message: "Sessão expirada. Entre novamente." };
  try {
    return await fn(admin);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, message: error.message };
    console.error("[admin action]", error);
    return { ok: false, message: "Erro inesperado. Tente novamente." };
  }
}
