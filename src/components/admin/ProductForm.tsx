"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { findDuplicateKeys, newVariant, VariantEditor } from "@/components/admin/VariantEditor";
import { Button, buttonClass } from "@/components/ui/Button";
import { Field, SelectField, TextareaField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ALLOWED_IMAGE_TYPES } from "@/config/uploads";
import { saveProductAction } from "@/app/admin/(painel)/produtos/actions";
import { formatMoneyInput } from "@/lib/utils";
import type { CategoryOption, ImageItem, ProductFormData, ProductStatusValue, VariantItem } from "@/types/product";

type Props = { categories: CategoryOption[]; product?: ProductFormData };

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-beige-200 bg-white p-5 sm:p-8">
      <h2 className="font-display text-2xl">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [price, setPrice] = useState(product ? formatMoneyInput(product.price) : "");
  const [promoPrice, setPromoPrice] = useState(product?.promoPrice ? formatMoneyInput(product.promoPrice) : "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [status, setStatus] = useState<ProductStatusValue>(product?.status ?? "ACTIVE");
  const [images, setImages] = useState<ImageItem[]>(
    product?.images.map((i) => ({ key: i.id, id: i.id, url: i.url, pathname: i.pathname })) ?? [],
  );
  const [variants, setVariants] = useState<VariantItem[]>(
    product
      ? product.variants.map((v) => ({
          key: v.id,
          id: v.id,
          size: v.size,
          colorName: v.colorName,
          active: v.active,
          stock: String(v.stock),
        }))
      : [newVariant()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (findDuplicateKeys(variants).size > 0) {
      setError("Há variações repetidas (mesmo tamanho e cor). Corrija antes de salvar.");
      return;
    }

    setSaving(true);
    try {
      // 1) Envia as fotos novas direto ao Vercel Blob (token de curta duração, só para admins).
      const uploaded = new Map<string, { url: string; pathname: string }>();
      for (const img of images) {
        if (!img.file) continue;
        const ext = ALLOWED_IMAGE_TYPES[img.file.type];
        const blob = await upload(`products/${crypto.randomUUID()}.${ext}`, img.file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        uploaded.set(img.key, { url: blob.url, pathname: blob.pathname });
      }

      // 2) Salva o produto (validação e permissão no servidor).
      const result = await saveProductAction({
        id: product?.id,
        name,
        description,
        categoryId,
        price,
        promoPrice,
        sku,
        status,
        images: images.map((img) => {
          const sent = uploaded.get(img.key);
          return { id: img.id, url: sent?.url ?? img.url, pathname: sent?.pathname ?? img.pathname ?? "" };
        }),
        variants: variants.map((v) => ({
          id: v.id,
          size: v.size,
          colorName: v.colorName,
          active: v.active,
          initialStock: v.id ? 0 : Number(v.stock === "" ? 0 : v.stock),
        })),
      });

      if (!result.ok) {
        // Evita reenviar as mesmas fotos numa nova tentativa.
        if (uploaded.size > 0) {
          setImages((prev) =>
            prev.map((img) => {
              const sent = uploaded.get(img.key);
              if (!sent) return img;
              URL.revokeObjectURL(img.url);
              return { key: img.key, url: sent.url, pathname: sent.pathname };
            }),
          );
        }
        setError(result.message);
        toast.push(result.message, "error");
        return;
      }

      toast.push(result.message ?? "Salvo.");
      router.push("/admin/produtos");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar o produto.";
      setError(message);
      toast.push(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      <Section title="Informações">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} required maxLength={140} disabled={saving} />
          </div>
          <div className="sm:col-span-2">
            <TextareaField label="Descrição" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} disabled={saving} />
          </div>
          <SelectField label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required disabled={saving}>
            <option value="">Selecione…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.active ? "" : " (inativa)"}
              </option>
            ))}
          </SelectField>
          <Field label="Código de referência" value={sku} onChange={(e) => setSku(e.target.value)} maxLength={40} placeholder="Opcional" disabled={saving} />
          <Field label="Preço (R$)" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0,00" disabled={saving} />
          <Field label="Preço promocional (R$)" inputMode="decimal" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} placeholder="Opcional" disabled={saving} />
          <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProductStatusValue)} disabled={saving}>
            <option value="ACTIVE">Ativo</option>
            <option value="DRAFT">Inativo</option>
            <option value="ARCHIVED">Arquivado</option>
          </SelectField>
        </div>
        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-red-700">
            Nenhuma categoria cadastrada. <Link href="/admin/categorias" className="underline">Crie uma categoria</Link> primeiro.
          </p>
        ) : null}
      </Section>

      <Section title="Imagens" hint="Defina a foto principal e a ordem da galeria.">
        <ImageManager images={images} onChange={setImages} disabled={saving} />
      </Section>

      <Section title="Variações e estoque" hint="Cada combinação de tamanho e cor tem seu próprio estoque.">
        <VariantEditor variants={variants} onChange={setVariants} disabled={saving} />
      </Section>

      {error ? (
        <p role="alert" className="rounded-sm border border-red-800/30 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-beige-200 bg-white/95 px-5 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 sm:px-3">
          <div>{isEdit && product ? <ProductDeleteButton id={product.id} name={product.name} /> : null}</div>
          <div className="flex gap-3">
            <Link href="/admin/produtos" className={buttonClass("outline")}>
              Cancelar
            </Link>
            <Button type="submit" loading={saving}>
              {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Cadastrar produto"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
