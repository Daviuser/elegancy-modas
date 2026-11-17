import { z } from "zod";
import { BANNER_BLOB_PREFIX, BLOB_HOST_SUFFIX } from "@/config/uploads";
import { emptyToNull } from "./common";

export const bannerSchema = z
  .object({
    title: z.string().trim().min(2, "Informe um título.").max(80),
    subtitle: z.string().trim().max(160).optional().transform(emptyToNull),
    linkUrl: z
      .string()
      .trim()
      .max(300)
      .optional()
      .transform(emptyToNull)
      .refine((v) => v === null || /^\/(?!\/)/.test(v) || /^https:\/\//.test(v), "O link deve começar com / ou https://"),
    imageUrl: z.string().url(),
    imagePathname: z.string().min(1).max(300),
  })
  .superRefine((b, ctx) => {
    try {
      const u = new URL(b.imageUrl);
      const ok =
        u.protocol === "https:" &&
        u.hostname.endsWith(BLOB_HOST_SUFFIX) &&
        b.imagePathname.startsWith(BANNER_BLOB_PREFIX) &&
        decodeURIComponent(u.pathname) === `/${b.imagePathname}`;
      if (!ok) ctx.addIssue({ code: "custom", message: "Imagem inválida." });
    } catch {
      ctx.addIssue({ code: "custom", message: "Imagem inválida." });
    }
  });
export type BannerInput = z.output<typeof bannerSchema>;
