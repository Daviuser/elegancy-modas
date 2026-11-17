import { z } from "zod";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { emptyToNull } from "./common";

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Informe o nome da loja.").max(80),
  whatsappNumber: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const n = normalizeWhatsAppNumber(v);
      if (!n) {
        ctx.addIssue({ code: "custom", message: "WhatsApp inválido. Use DDD + número (ex.: 75 99999-9999)." });
        return z.NEVER;
      }
      return n;
    }),
  email: z.string().trim().max(120).email("E-mail inválido.").optional().or(z.literal("")).transform((v) => emptyToNull(v || undefined)),
  instagram: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => (v ? v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "") : ""))
    .refine((v) => v === "" || /^[A-Za-z0-9._]{1,30}$/.test(v), "Instagram inválido.")
    .transform((v) => (v ? v : null)),
  address: z.string().trim().max(200).optional().transform(emptyToNull),
  about: z.string().trim().max(1000).optional().transform(emptyToNull),
});
export type SettingsInput = z.output<typeof settingsSchema>;
