export function formatOrderNumber(n: number) {
  return `EM-${String(n).padStart(5, "0")}`;
}
