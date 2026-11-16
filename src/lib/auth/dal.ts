import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "./session";

export type CurrentAdmin = { id: string; name: string; email: string };

/**
 * Fonte da verdade da autenticação. Confere o token E o banco
 * (admin existe, está ativo e a versão do token confere), sem depender só do middleware.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await readSession();
  if (!session) return null;

  const admin = await db.admin.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, active: true, tokenVersion: true },
  });
  if (!admin || !admin.active || admin.tokenVersion !== session.ver) return null;

  return { id: admin.id, name: admin.name, email: admin.email };
});

/** Use em layouts, páginas e Server Actions administrativas. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
