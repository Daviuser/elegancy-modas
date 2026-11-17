import { z } from "zod";

/** Aceita número ou texto no formato brasileiro ("1.299,90" / "129,9" / "129.90"). */
export function parseMoney(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const raw = String(value).replace(/[R$\s]/g, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  return normalized === "" ? null : Number(normalized);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const moneyRequired = z.preprocess(
  parseMoney,
  z
    .number({ invalid_type_error: "Informe um preço válido.", required_error: "Informe o preço." })
    .positive("O preço deve ser maior que zero.")
    .max(9_999_999.99, "Preço muito alto.")
    .transform(round2),
);

export const moneyOptional = z.preprocess(
  parseMoney,
  z
    .number({ invalid_type_error: "Informe um preço promocional válido." })
    .positive("O preço promocional deve ser maior que zero.")
    .max(9_999_999.99, "Preço muito alto.")
    .nullable()
    .transform((n) => (n === null ? null : round2(n))),
);

export const emptyToNull = (v: string | undefined) => (v && v.length > 0 ? v : null);
