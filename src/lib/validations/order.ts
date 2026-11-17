import { z } from "zod";

export const cartItemSchema = z.object({
  variantId: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(99),
});

export const cartItemsSchema = z.array(cartItemSchema).max(50);

const cleanName = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .max(80, "O nome deve ter no máximo 80 caracteres.")
    .transform(cleanName)
    .refine((v) => v.length >= 2, "Informe seu nome."),
  items: cartItemsSchema.min(1, "Seu carrinho está vazio."),
  idempotencyKey: z.string().min(16).max(64).regex(/^[A-Za-z0-9-]+$/),
});
export type CreateOrderInput = z.output<typeof createOrderSchema>;

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
]);
