import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const GENERIC_ERROR = "E-mail ou senha incorretos.";

// Hash descartável: mantém o tempo de resposta parecido quando o e-mail não existe.
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("elegancy-dummy-password", 12));

export type AuthResult =
  | { ok: true; admin: { id: string; tokenVersion: number } }
  | { ok: false; message: string };

export async function authenticateAdmin(email: string, password: string): Promise<AuthResult> {
  const admin = await db.admin.findUnique({ where: { email } });

  if (!admin || !admin.active) {
    await bcrypt.compare(password, getDummyHash());
    return { ok: false, message: GENERIC_ERROR };
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    return { ok: false, message: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);

  if (!valid) {
    const attempts = admin.failedLoginCount + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
    await db.admin.update({
      where: { id: admin.id },
      data: {
        failedLoginCount: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
    return { ok: false, message: GENERIC_ERROR };
  }

  await db.admin.update({
    where: { id: admin.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
  return { ok: true, admin: { id: admin.id, tokenVersion: admin.tokenVersion } };
}
