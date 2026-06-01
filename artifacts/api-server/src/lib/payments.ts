/**
 * payments.ts — Serviço central de pagamento e liberação de downloads.
 *
 * ATENÇÃO: Esta função é a única responsável por:
 *   1. marcar um pedido como "paid"
 *   2. criar download_grants para cada item
 *   3. incrementar totalSales
 *
 * Hoje é chamada apenas pelo fluxo fake de desenvolvimento.
 * No futuro, será chamada pelo webhook de um gateway real
 * (Mercado Pago, Pagar.me, Stripe etc.) — sem alterar a lógica de negócio.
 */

import {
  db,
  ordersTable,
  orderItemsTable,
  productsTable,
  downloadGrantsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

type DownloadSource = "purchase" | "credit" | "rateio";

export async function markOrderAsPaidAndGrantDownloads(
  orderId: number,
  source: DownloadSource = "purchase"
): Promise<void> {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) throw new Error(`Pedido ${orderId} não encontrado`);
  if (order.status === "paid") throw new Error(`Pedido ${orderId} já está pago`);

  await db
    .update(ordersTable)
    .set({ status: "paid" })
    .where(eq(ordersTable.id, orderId));

  const items = await db
    .select()
    .from(orderItemsTable)
    .leftJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .where(eq(orderItemsTable.orderId, orderId));

  for (const row of items) {
    await db.insert(downloadGrantsTable).values({
      userId: order.userId,
      productId: row.order_items.productId,
      orderItemId: row.order_items.id,
      source,
    });

    if (row.products) {
      await db
        .update(productsTable)
        .set({ totalSales: sql`${productsTable.totalSales} + 1` })
        .where(eq(productsTable.id, row.order_items.productId));
    }
  }
}
