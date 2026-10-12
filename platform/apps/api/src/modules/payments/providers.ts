import { createHmac, timingSafeEqual } from "node:crypto";
import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";

export interface CheckoutInput {
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  customer: { name: string; email: string };
}

export interface VerifiedPayment {
  status: "SUCCEEDED" | "FAILED" | "PENDING";
  amount?: number;
  currency?: string;
  method?: string;
  reason?: string;
  raw?: unknown;
}

/** Contrat commun des prestataires de paiement. Le statut fait foi uniquement via `verify`. */
export interface PaymentProvider {
  key: "cinetpay" | "sandbox";
  label: string;
  createCheckout(input: CheckoutInput): Promise<{ checkoutUrl: string }>;
  verify(transactionId: string): Promise<VerifiedPayment>;
}

// ───── CinetPay : Orange Money, MTN MoMo, Moov Money, Wave, cartes bancaires ─────

const ascii = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 .,'-]/g, " ").replace(/\s+/g, " ").trim();

export class CinetPayProvider implements PaymentProvider {
  key = "cinetpay" as const;
  label = "Mobile money & carte (CinetPay)";
  constructor(
    private apiKey: string,
    private siteId: string,
    private baseUrl: string,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  private async call(path: string, body: Record<string, unknown>) {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ apikey: this.apiKey, site_id: this.siteId, ...body }) });
    const json = (await res.json().catch(() => ({}))) as { code?: string; message?: string; description?: string; data?: Record<string, unknown> };
    return { http: res.status, ...json };
  }

  async createCheckout(i: CheckoutInput) {
    const cfg = loadConfig();
    const [first, ...rest] = i.customer.name.split(" ");
    const r = await this.call("/payment", {
      transaction_id: i.transactionId,
      amount: i.amount,
      currency: i.currency,
      // CinetPay refuse certains caractères spéciaux dans la description.
      description: ascii(i.description).slice(0, 100),
      notify_url: `${cfg.API_PUBLIC_URL}/api/public/payments/cinetpay/notify`,
      return_url: `${cfg.APP_URL}/billing/return?payment=${i.paymentId}`,
      channels: "ALL",
      lang: "fr",
      customer_name: ascii(first ?? "Client") || "Client",
      customer_surname: ascii(rest.join(" ")) || "Forlife",
      customer_email: i.customer.email,
      customer_country: "CI",
      customer_city: "Abidjan",
      customer_address: "Abidjan",
      customer_zip_code: "00225",
      customer_state: "CI",
      metadata: i.paymentId,
    });
    const url = r.data?.payment_url;
    if (r.code !== "201" || typeof url !== "string") throw new Error(`CinetPay : ${r.description ?? r.message ?? `erreur ${r.http}`}`);
    return { checkoutUrl: url };
  }

  async verify(transactionId: string): Promise<VerifiedPayment> {
    const r = await this.call("/payment/check", { transaction_id: transactionId });
    const d = r.data ?? {};
    const status = String(d.status ?? "");
    const base = { amount: Number(d.amount), currency: typeof d.currency === "string" ? d.currency : undefined, method: typeof d.payment_method === "string" ? d.payment_method : undefined, raw: { code: r.code, message: r.message, status } };
    if (r.code === "00" && status === "ACCEPTED") return { status: "SUCCEEDED", ...base };
    if (status === "REFUSED" || r.code === "600" || r.code === "627") return { status: "FAILED", reason: r.description ?? r.message ?? "Paiement refusé", ...base };
    return { status: "PENDING", ...base };
  }
}

// ───── Démonstration : aucun argent réel, parcours identique ─────

export const demoToken = (paymentId: string) => createHmac("sha256", loadConfig().JWT_SECRET).update(`pay-demo:${paymentId}`).digest("base64url").slice(0, 32);

export function verifyDemoToken(paymentId: string, token: string): boolean {
  const a = Buffer.from(demoToken(paymentId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export class SandboxPaymentProvider implements PaymentProvider {
  key = "sandbox" as const;
  label = "Paiement de démonstration";
  async createCheckout(i: CheckoutInput) {
    return { checkoutUrl: `${loadConfig().APP_URL}/pay/demo/${i.paymentId}?t=${demoToken(i.paymentId)}` };
  }
  async verify(transactionId: string): Promise<VerifiedPayment> {
    const p = await prisma.payment.findUnique({ where: { providerRef: transactionId }, include: { events: { where: { type: "DEMO" }, orderBy: { createdAt: "desc" }, take: 1 } } });
    const ev = p?.events[0]?.payload as { outcome?: string; method?: string } | undefined;
    if (!p || !ev) return { status: "PENDING" };
    return ev.outcome === "success" ? { status: "SUCCEEDED", amount: p.amount, currency: p.currency, method: ev.method } : { status: "FAILED", reason: "Paiement refusé (démonstration)", method: ev.method };
  }
}

let override: Partial<Record<PaymentProvider["key"], PaymentProvider>> | undefined;
/** Tests : remplace les prestataires. */
export function setPaymentProviders(p?: Partial<Record<PaymentProvider["key"], PaymentProvider>>) {
  override = p;
}

export function paymentProviders(): Partial<Record<PaymentProvider["key"], PaymentProvider>> {
  if (override) return override;
  const cfg = loadConfig();
  const list: Partial<Record<PaymentProvider["key"], PaymentProvider>> = {};
  if (cfg.CINETPAY_API_KEY && cfg.CINETPAY_SITE_ID) list.cinetpay = new CinetPayProvider(cfg.CINETPAY_API_KEY, cfg.CINETPAY_SITE_ID, cfg.CINETPAY_API_URL);
  if (cfg.PAYMENT_SANDBOX_ENABLED) list.sandbox = new SandboxPaymentProvider();
  return list;
}
