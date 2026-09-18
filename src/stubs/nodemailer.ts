/**
 * STUB of the `nodemailer` module.
 *
 * Mimics createTransport(...).sendMail(...) just enough for the
 * deliberately-bad OrderService to type-check and run without a real
 * SMTP server. Sent mails are recorded in memory.
 *
 * ⚠️ This stub exists so the repo has zero third-party dependencies.
 * The DIP violation being demonstrated is the *direct import of a concrete
 * mailer* here, not the stub itself.
 */

export interface SentMail {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export interface TransportOptions {
  host: string;
  port: number;
  auth: { user: string; pass: string };
}

export interface Transporter {
  sendMail(mail: SentMail): Promise<{ messageId: string }>;
}

const sentMails: SentMail[] = [];

export function createTransport(_opts: TransportOptions): Transporter {
  return {
    async sendMail(mail: SentMail) {
      sentMails.push(mail);
      return { messageId: `stub-${sentMails.length}@local` };
    },
  };
}

/** Test helper: inspect what the god class "sent". */
export function __getSentMails() {
  return [...sentMails];
}

/** Test helper: reset the in-memory outbox. */
export function __reset() {
  sentMails.length = 0;
}

// The real nodemailer is CommonJS and imported as a default; mimic that shape.
export default { createTransport };
