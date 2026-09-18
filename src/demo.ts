import { OrderService } from "./OrderService.js";

/**
 * Demo: the god class runs with zero real infrastructure because the
 * drivers it depends on are stubs (src/stubs/) that record side effects
 * in memory. It still writes invoices/logs to /tmp — proving that even
 * the filesystem is hard-wired into the business logic.
 */
const service = new OrderService();

try {
  const { orderId, total } = await service.placeOrder({
    customerEmail: "demo@example.com",
    customerName: "Demo User",
    customerTier: "vip",
    items: [{ sku: "DEMO-1", quantity: 3, unitPrice: 199.99 }],
  });
  console.log(`Order ${orderId} placed, total $${total.toFixed(2)}`);
} catch (err) {
  console.error("Demo failed (expected without real infra):", (err as Error).message);
}

await service.sendNewsletter("list@example.com");
