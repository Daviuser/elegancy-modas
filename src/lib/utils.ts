import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: number | string) {
  return brl.format(Number(value));
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bahia",
  }).format(new Date(value));
}

/** 129.9 -> "129,90" (valor inicial de campos de preço). */
export function formatMoneyInput(value: number) {
  return value.toFixed(2).replace(".", ",");
}

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG", "ÚNICO", "UNICO", "U"];

/** Ordena tamanhos: PP, P, M, G, GG… depois numéricos. */
export function compareSizes(a: string, b: string) {
  const ia = SIZE_ORDER.indexOf(a.toUpperCase());
  const ib = SIZE_ORDER.indexOf(b.toUpperCase());
  if (ia >= 0 && ib >= 0) return ia - ib;
  if (ia >= 0) return -1;
  if (ib >= 0) return 1;
  return a.localeCompare(b, "pt-BR", { numeric: true });
}
