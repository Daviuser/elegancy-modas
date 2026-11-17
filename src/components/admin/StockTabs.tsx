import Link from "next/link";
import { cn } from "@/lib/utils";

export function StockTabs({ active }: { active: "saldo" | "historico" }) {
  const tab = (on: boolean) =>
    cn("border-b-2 px-1 pb-2 text-sm transition-colors", on ? "border-gold-500 text-ink" : "border-transparent text-ink-soft hover:text-ink");
  return (
    <nav className="mb-6 flex gap-6 border-b border-beige-200" aria-label="Seções de estoque">
      <Link href="/admin/estoque" className={tab(active === "saldo")}>
        Saldo por variação
      </Link>
      <Link href="/admin/estoque/historico" className={tab(active === "historico")}>
        Histórico de movimentações
      </Link>
    </nav>
  );
}
