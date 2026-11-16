import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { requireAdmin } from "@/lib/auth/dal";
import { getDashboardStats, LOW_STOCK_THRESHOLD } from "@/services/dashboard.service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const stats = await getDashboardStats();

  return (
    <>
      <PageHeader title={`Olá, ${admin.name.split(" ")[0]}`} description="Resumo atual da loja." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Produtos" value={stats.products} />
        <StatCard label="Categorias" value={stats.categories} />
        <StatCard label="Pedidos pendentes" value={stats.pendingOrders} />
        <StatCard
          label="Estoque baixo"
          value={stats.lowStockVariants}
          hint={`Variações com até ${LOW_STOCK_THRESHOLD} unidades`}
        />
      </div>
    </>
  );
}
