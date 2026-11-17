export type SearchParams = Record<string, string | string[] | undefined>;

export function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() ? v.trim() : undefined;
}

export function pageParam(value: string | string[] | undefined): number {
  const n = parseInt(one(value) ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000) : 1;
}
