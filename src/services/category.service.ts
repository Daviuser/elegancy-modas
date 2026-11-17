import "server-only";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import type { CategoryInput } from "@/lib/validations/category";

export type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  productCount: number;
};

export async function listCategories(): Promise<CategoryItem[]> {
  const rows = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      active: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });
  return rows.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }));
}

export async function listCategoryOptions() {
  return db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, active: true },
  });
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "categoria";
  let slug = base;
  let i = 2;
  while (await db.category.findUnique({ where: { slug }, select: { id: true } })) slug = `${base}-${i++}`;
  return slug;
}

export async function saveCategory(input: CategoryInput) {
  const duplicate = await db.category.findFirst({
    where: {
      name: { equals: input.name, mode: "insensitive" },
      ...(input.id ? { NOT: { id: input.id } } : {}),
    },
    select: { id: true },
  });
  if (duplicate) throw new AppError("Já existe uma categoria com este nome.");

  const data = {
    name: input.name,
    description: input.description,
    sortOrder: input.sortOrder,
    active: input.active,
  };

  if (input.id) {
    const exists = await db.category.findUnique({ where: { id: input.id }, select: { id: true } });
    if (!exists) throw new AppError("Categoria não encontrada.");
    return db.category.update({ where: { id: input.id }, data, select: { id: true } });
  }
  return db.category.create({ data: { ...data, slug: await uniqueSlug(input.name) }, select: { id: true } });
}

export async function setCategoryActive(id: string, active: boolean) {
  const res = await db.category.updateMany({ where: { id }, data: { active } });
  if (res.count === 0) throw new AppError("Categoria não encontrada.");
}

export async function deleteCategory(id: string) {
  const category = await db.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true, children: true } } },
  });
  if (!category) throw new AppError("Categoria não encontrada.");
  const { products, children } = category._count;
  if (products > 0) {
    throw new AppError(
      `Esta categoria tem ${products} produto(s). Mova-os para outra categoria ou desative-a em vez de excluir.`,
    );
  }
  if (children > 0) throw new AppError("Esta categoria possui subcategorias e não pode ser excluída.");
  await db.category.delete({ where: { id } });
}
