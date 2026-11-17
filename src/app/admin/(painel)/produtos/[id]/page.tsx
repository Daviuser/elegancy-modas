import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth/dal";
import { listCategoryOptions } from "@/services/category.service";
import { getProductForEdit } from "@/services/product.service";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductForEdit(id), listCategoryOptions()]);
  if (!product) notFound();

  return (
    <>
      <PageHeader title={product.name} description="Edite os dados, a galeria e as variações." />
      <ProductForm key={product.id} categories={categories} product={product} />
    </>
  );
}
