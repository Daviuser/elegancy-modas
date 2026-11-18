export type StoreProductCard = {
  id: string;
  slug: string;
  name: string;
  price: number;
  /** Preço efetivo promocional (já validado como menor que o preço). */
  promoPrice: number | null;
  imageUrl: string | null;
  /** Segunda foto, usada na troca ao passar o mouse. */
  hoverImageUrl: string | null;
  available: boolean;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  promoPrice: number | null;
  category: { name: string; slug: string };
  images: { id: string; url: string }[];
  variants: { id: string; size: string; colorName: string; stock: number }[];
};

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  sku: string | null;
  size: string;
  colorName: string;
  imageUrl: string | null;
  unitPrice: number;
  originalPrice: number;
  onSale: boolean;
  quantity: number;
  stock: number;
  /** null = pode ser comprado; senão, motivo do bloqueio. */
  issue: string | null;
};
