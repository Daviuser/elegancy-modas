import { z } from "zod";
import { emptyToNull } from "./common";

export const stockMovementSchema = z
  .object({
    variantId: z.string().min(1, "Variação inválida."),
    type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT"]),
    quantity: z
      .number({ invalid_type_error: "Informe uma quantidade válida." })
      .int("A quantidade deve ser um número inteiro.")
      .min(0, "A quantidade não pode ser negativa.")
      .max(1_000_000, "Quantidade muito alta."),
    note: z.string().trim().max(300, "Observação muito longa (máx. 300).").optional().transform(emptyToNull),
  })
  .superRefine((d, ctx) => {
    if (d.type !== "ADJUSTMENT" && d.quantity < 1) {
      ctx.addIssue({ code: "custom", path: ["quantity"], message: "A quantidade deve ser de pelo menos 1." });
    }
    if (d.type === "ADJUSTMENT" && !d.note) {
      ctx.addIssue({ code: "custom", path: ["note"], message: "Explique o motivo do ajuste na observação." });
    }
  });

export type StockMovementInput = z.output<typeof stockMovementSchema>;
