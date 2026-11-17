import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/dal";
import { listCategories } from "@/services/category.service";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await listCategories();
  return (
    <>
      <PageHeader title="Categorias" description="Organize o catálogo. Categorias com produtos não podem ser excluídas." />
      <CategoryManager categories={categories} />
    </>
  );
}
