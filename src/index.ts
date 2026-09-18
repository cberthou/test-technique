import { OrderService } from "./OrderService.js";

// Entry point: nothing here but a call into the god class.
const service = new OrderService();

const [,, customerEmail, customerName] = process.argv;

await service.placeOrder({
  customerEmail: customerEmail ?? "jane@example.com",
  customerName: customerName ?? "Jane Doe",
  customerTier: "premium",
  items: [
    { sku: "WIDGET-1", quantity: 2, unitPrice: 299.0 },
    { sku: "GADGET-9", quantity: 1, unitPrice: 149.5 },
  ],
});

console.log("Order placed.");
