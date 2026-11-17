import { formatBRL } from "@/lib/utils";
import { formatOrderNumber } from "@/lib/order-format";

/** Normaliza para DDI+DDD+número (só dígitos). Assume Brasil (55) quando vier sem DDI. */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 12 && digits.length <= 15) return digits;
  return null;
}

/** Link oficial click-to-chat. O navegador não anexa imagens por este link. */
export function buildWhatsAppUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export type OrderMessageData = {
  number: number;
  customerName: string;
  storeName: string;
  total: number;
  items: { productName: string; size: string; colorName: string; quantity: number; unitPrice: number; lineTotal: number }[];
};

const money = (n: number) => formatBRL(n).replace(/\u00a0/g, " ");

export function buildOrderMessage(o: OrderMessageData) {
  const lines = o.items.map(
    (it, i) =>
      `${i + 1}. ${it.productName}\n   Tamanho: ${it.size} | Cor: ${it.colorName}\n   ${it.quantity} x ${money(it.unitPrice)} = ${money(it.lineTotal)}`,
  );
  return [
    `Olá, ${o.storeName}! Gostaria de finalizar meu pedido.`,
    "",
    `*Pedido ${formatOrderNumber(o.number)}*`,
    `Cliente: ${o.customerName}`,
    "",
    "*Itens*",
    lines.join("\n\n"),
    "",
    `*Total: ${money(o.total)}*`,
  ].join("\n");
}
