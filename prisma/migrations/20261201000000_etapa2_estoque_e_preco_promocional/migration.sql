-- Etapa 2 — migration não destrutiva (preserva todos os dados existentes).

-- 1) Novo tipo de movimentação: saída manual de mercadoria.
ALTER TYPE "StockMovementType" ADD VALUE IF NOT EXISTS 'EXIT';

-- 2) "compareAtPrice" passa a se chamar "promoPrice" (apenas renomeia a coluna).
ALTER TABLE "Product" RENAME COLUMN "compareAtPrice" TO "promoPrice";

-- 3) Garantia no banco: estoque nunca negativo.
ALTER TABLE "ProductVariant"
  ADD CONSTRAINT "ProductVariant_stock_non_negative" CHECK ("stock" >= 0);
