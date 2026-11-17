-- Etapa 3 — migration não destrutiva: preserva pedidos e dados existentes.

-- 1) Novos status de pedido. O tipo é recriado mapeando valores antigos (se houver).
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('PENDING','CONFIRMED','PREPARING','READY_FOR_PICKUP','COMPLETED','CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING (
  CASE "status"::text
    WHEN 'CANCELED'  THEN 'CANCELLED'
    WHEN 'PAID'      THEN 'CONFIRMED'
    WHEN 'SHIPPED'   THEN 'READY_FOR_PICKUP'
    WHEN 'DELIVERED' THEN 'COMPLETED'
    ELSE "status"::text
  END
)::"OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "OrderStatus_old";

-- 2) O checkout pede somente o nome: telefone passa a ser opcional.
ALTER TABLE "Order" ALTER COLUMN "customerPhone" DROP NOT NULL;

-- 3) Novas colunas de pedido.
ALTER TABLE "Order"
  ADD COLUMN "publicToken" TEXT,
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "confirmedAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "stockDeductedAt" TIMESTAMP(3),
  ADD COLUMN "stockRestoredAt" TIMESTAMP(3);
UPDATE "Order" SET "publicToken" = gen_random_uuid()::text WHERE "publicToken" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "publicToken" SET NOT NULL;

-- 4) Índices únicos.
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");
CREATE UNIQUE INDEX "StockMovement_orderId_variantId_type_key" ON "StockMovement"("orderId", "variantId", "type");
