export type ProductStatusValue = "ACTIVE" | "DRAFT" | "ARCHIVED";

export type CategoryOption = { id: string; name: string; active: boolean };

/** Dados do produto como chegam ao formulário de edição. */
export type ProductFormData = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  promoPrice: number | null;
  sku: string;
  status: ProductStatusValue;
  images: { id: string; url: string; pathname: string }[];
  variants: { id: string; size: string; colorName: string; active: boolean; stock: number }[];
};

/** Estado local do formulário. */
export type ImageItem = { key: string; id?: string; url: string; pathname?: string; file?: File };
export type VariantItem = {
  key: string;
  id?: string;
  size: string;
  colorName: string;
  active: boolean;
  /** Novo: estoque inicial digitado. Existente: saldo atual (somente leitura). */
  stock: string;
};
