import { z } from "zod";
import { emptyToNull } from "./common";

export const categorySchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(2, "O nome deve ter ao menos 2 caracteres.").max(80, "Nome muito longo (máx. 80)."),
  description: z.string().trim().max(300, "Descrição muito longa (máx. 300).").optional().transform(emptyToNull),
  sortOrder: z.number({ invalid_type_error: "Ordem inválida." }).int("Ordem inválida.").min(0).max(9999),
  active: z.boolean(),
});

export type CategoryInput = z.output<typeof categorySchema>;
