import { z } from "zod";
import { BLOB_HOST_SUFFIX, MAX_PRODUCT_IMAGES, PRODUCT_BLOB_PREFIX } from "@/config/uploads";
import { emptyToNull, moneyOptional, moneyRequired } from "./common";

const imageSchema = z
  .object({
    id: z.string().min(1).optional(),
    url: z.string().url("Imagem inválida."),
    pathname: z.string().min(1).max(300),
  })
  .superRefine((img, ctx) => {
    // Só aceitamos arquivos que realmente estejam no nosso Blob, em products/.
    try {
      const u = new URL(img.url);
      const ok =
        u.protocol === "https:" &&
        u.hostname.endsWith(BLOB_HOST_SUFFIX) &&
        img.pathname.startsWith(PRODUCT_BLOB_PREFIX) &&
        decodeURIComponent(u.pathname) === `/${img.pathname}`;
      if (!ok) ctx.addIssue({ code: "custom", message: "Imagem inválida." });
    } catch {
      ctx.addIssue({ code: "custom", message: "Imagem inválida." });
    }
  });

const variantSchema = z.object({
  id: z.string().min(1).optional(),
  size: z
    .string()
    .trim()
    .min(1, "Informe o tamanho de todas as variações.")
    .max(20, "Tamanho muito longo (máx. 20).")
    .transform((s) => s.replace(/\s+/g, " ").toUpperCase()),
  colorName: z
    .string()
    .trim()
    .min(1, "Informe a cor de todas as variações.")
    .max(40, "Nome da cor muito longo (máx. 40).")
    .transform((s) => s.replace(/\s+/g, " ")),
  active: z.boolean(),
  /** Usado só em variações novas; o saldo de existentes muda apenas por movimentação. */
  initialStock: z
    .number({ invalid_type_error: "Estoque inicial inválido." })
    .int("O estoque deve ser um número inteiro.")
    .min(0, "O estoque não pode ser negativo.")
    .max(1_000_000, "Estoque muito alto."),
});

export const productSchema = z
  .object({
    id: z.string().min(1).optional(),
    name: z.string().trim().min(2, "O nome deve ter ao menos 2 caracteres.").max(140, "Nome muito longo (máx. 140)."),
    description: z.string().trim().max(5000, "Descrição muito longa (máx. 5000).").optional().transform(emptyToNull),
    categoryId: z.string().min(1, "Escolha uma categoria."),
    price: moneyRequired,
    promoPrice: moneyOptional,
    sku: z
      .string()
      .trim()
      .max(40, "Código de referência muito longo (máx. 40).")
      .optional()
      .transform((v) => (v ? v.toUpperCase() : null)),
    status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
    images: z.array(imageSchema).max(MAX_PRODUCT_IMAGES, `Máximo de ${MAX_PRODUCT_IMAGES} imagens.`),
    variants: z.array(variantSchema).min(1, "Cadastre ao menos uma variação.").max(80, "Máximo de 80 variações."),
  })
  .superRefine((data, ctx) => {
    if (data.promoPrice !== null && data.promoPrice >= data.price) {
      ctx.addIssue({ code: "custom", path: ["promoPrice"], message: "O preço promocional deve ser menor que o preço." });
    }
    const seen = new Set<string>();
    for (const v of data.variants) {
      const key = `${v.size.toLowerCase()}|${v.colorName.toLowerCase()}`;
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["variants"], message: `Variação duplicada: ${v.size} — ${v.colorName}.` });
        break;
      }
      seen.add(key);
    }
  });

export type ProductInput = z.output<typeof productSchema>;
