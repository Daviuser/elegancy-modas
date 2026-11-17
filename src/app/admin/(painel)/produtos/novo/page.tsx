import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth/dal";
import { listCategoryOptions } from "@/services/category.service";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await listCategoryOptions();
  return (
    <>
      <PageHeader title="Novo produto" />
      <ProductForm categories={categories} />
    </>
  );
}
