# Order System (deliberately bad design)

This repository is a **teaching artifact**: a tiny TypeScript "order placement"
system written on purpose to violate SOLID principles — chiefly **SRP**
(Single Responsibility) and **DIP** (Dependency Inversion).

> ⚠️ Do **not** copy this code into a real project. Every violation is intentional.

## The god class

Everything lives in [`src/OrderService.ts`](src/OrderService.ts). A single
`placeOrder()` call, in order:

1. Validates input
2. Computes pricing and discounts
3. Opens a **hard-coded** database connection and writes SQL
4. Mutates inventory as a hidden side effect
5. Writes an invoice **to the real filesystem**
6. Sends an email via **hard-coded** SMTP credentials
7. Logs to console *and* a file

It also has a `sendNewsletter()` method that has nothing to do with orders.

## Violation catalog

| Principle | Where it's broken |
|---|---|
| **SRP** | One class = validation + pricing + persistence + file I/O + email + logging |
| **DIP** | Direct imports of concrete drivers (`mysql2/promise`, `nodemailer`, `node:fs`); no interfaces anywhere |
| **OCP** | New discount tier or notification channel ⇒ edit `placeOrder()` guts |
| **Testability** | Cannot unit test without a live DB, SMTP server, and writable `/tmp` |

## Stub adapters

The repo has **zero third-party runtime dependencies**. The concrete drivers
the god class depends on are hand-written look-alikes in
[`src/stubs/`](src/stubs) that record their calls in memory:

- `src/stubs/mysql2-promise.ts` — `createConnection(...).execute(...)`; queries go to an in-memory log (`__getExecutedQueries()`)
- `src/stubs/nodemailer.ts` — `createTransport(...).sendMail(...)`; mails go to an in-memory outbox (`__getSentMails()`)

This keeps the DIP violation intact (the god class still *names concrete
technologies*) while making the demo runnable and the class inspectable:
run the demo, then read what it "wrote".

## Intended use

Practice exercises:

- Extract `PricingCalculator`, `OrderRepository`, `InvoiceWriter`, `Notifier`, `Logger`
- Introduce interfaces (`OrderRepository`, `MailSender`, …) and inject them
- Write the first unit test that doesn't need MySQL or SMTP
- Notice how `src/index.ts` and `src/demo.ts` need no changes when the seams appear

## Setup

```sh
npm install
npm run build   # type-checks and emits to dist/
npm run demo    # works out of the box — stubs record the side effects
```
