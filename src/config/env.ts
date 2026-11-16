import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET deve ter ao menos 32 caracteres"),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Valida e devolve as variáveis de ambiente (somente servidor). */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    ...process.env,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || undefined,
    DIRECT_URL: process.env.DIRECT_URL || undefined,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  });
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Variáveis de ambiente inválidas — ${problems}`);
  }
  cached = parsed.data;
  return cached;
}
