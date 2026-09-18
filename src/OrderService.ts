import { createConnection, Connection } from "./stubs/mysql2-promise.js";
import nodemailer from "./stubs/nodemailer.js";
import fs from "node:fs";

let cachedConnection: Connection | null = null;

async function getConnection(): Promise<Connection> {
  if (!cachedConnection) {
    cachedConnection = await createConnection({
      host: "localhost",
      user: "root",
      password: "hunter2",
      database: "shop",
    });
  }
  return cachedConnection;
}

export class OrderService {
  async placeOrder(order: {
    customerEmail: string;
    customerName: string;
    customerTier: "standard" | "premium" | "vip";
    items: Array<{ sku: string; quantity: number; unitPrice: number }>;
  }): Promise<{ orderId: number; total: number }> {
    if (!order.customerEmail.includes("@")) {
      throw new Error("Invalid email");
    }
    if (order.items.length === 0) {
      throw new Error("Empty order");
    }
    for (const item of order.items) {
      if (item.quantity <= 0 || item.unitPrice < 0) {
        throw new Error(`Invalid item ${item.sku}`);
      }
    }

    let subtotal = 0;
    for (const item of order.items) {
      subtotal += item.unitPrice * item.quantity;
    }

    let discountRate = 0;
    if (order.customerTier === "premium") discountRate = 0.1;
    if (order.customerTier === "vip") discountRate = 0.2;
    if (subtotal > 1000) discountRate += 0.05;

    const discount = subtotal * discountRate;
    const total = subtotal - discount;

    const db = await getConnection();
    const [result]: any = await db.execute(
      "INSERT INTO orders (customer_email, customer_name, total, status) VALUES (?, ?, ?, ?)",
      [order.customerEmail, order.customerName, total, "placed"]
    );
    const orderId = result.insertId;

    for (const item of order.items) {
      await db.execute(
        "INSERT INTO order_items (order_id, sku, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, item.sku, item.quantity, item.unitPrice]
      );
      await db.execute("UPDATE inventory SET stock = stock - ? WHERE sku = ?", [
        item.quantity,
        item.sku,
      ]);
    }

    const invoiceLines: string[] = [];
    invoiceLines.push(`INVOICE #${orderId}`);
    invoiceLines.push(`Customer: ${order.customerName} <${order.customerEmail}>`);
    for (const item of order.items) {
      invoiceLines.push(
        `  ${item.sku} x${item.quantity} @ $${item.unitPrice.toFixed(2)}`
      );
    }
    invoiceLines.push(`Subtotal: $${subtotal.toFixed(2)}`);
    invoiceLines.push(`Discount: -$${discount.toFixed(2)}`);
    invoiceLines.push(`TOTAL:    $${total.toFixed(2)}`);
    fs.mkdirSync("/tmp/invoices", { recursive: true });
    fs.writeFileSync(`/tmp/invoices/invoice-${orderId}.txt`, invoiceLines.join("\n"));

    const transporter = nodemailer.createTransport({
      host: "smtp.example.com",
      port: 587,
      auth: { user: "shop", pass: "s3cret" },
    });
    await transporter.sendMail({
      from: "orders@shop.example.com",
      to: order.customerEmail,
      subject: `Order #${orderId} confirmed`,
      text: `Thanks ${order.customerName}! Your total is $${total.toFixed(2)}.`,
    });

    const logLine = `${new Date().toISOString()} order=${orderId} total=${total} tier=${order.customerTier}`;
    console.log(logLine);
    fs.appendFileSync("/tmp/orders.log", logLine + "\n");

    return { orderId, total };
  }

  async sendNewsletter(email: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: "smtp.example.com",
      port: 587,
      auth: { user: "shop", pass: "s3cret" },
    });
    await transporter.sendMail({
      from: "newsletter@shop.example.com",
      to: email,
      subject: "Shop News",
      text: "Here is what's new this week!",
    });
  }
}
