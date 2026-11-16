import "server-only";
import { db } from "@/lib/db";

export const LOW_STOCK_THRESHOLD = 3;

export async function getDashboardStats() {
  const [products, categories, pendingOrders, lowStockVariants] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.productVariant.count({ where: { active: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
  ]);
  return { products, categories, pendingOrders, lowStockVariants };
}
