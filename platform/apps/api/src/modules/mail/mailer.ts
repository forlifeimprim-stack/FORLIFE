import { loadConfig } from "../../config.js";
import { prisma } from "../../lib/prisma.js";

export interface Email {
  to: string;
  subject: string;
  template: string;
  html: string;
  text: string;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Gabarit HTML sobre aux couleurs Forlife Com (compatible clients mail). */
export function layout(title: string, paragraphs: string[], cta?: { label: string; url: string }): { html: string; text: string } {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.55">${escape(p)}</p>`).join("");
  const button = cta
    ? `<p style="margin:24px 0"><a href="${escape(cta.url)}" style="background:#EA7822;color:#1a0d03;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px;display:inline-block">${escape(cta.label)}</a></p><p style="font-size:12px;color:#6b625b">Si le bouton ne fonctionne pas : ${escape(cta.url)}</p>`
    : "";
  const html = `<div style="font-family:Arial,sans-serif;background:#f9f6f2;padding:24px"><div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:28px;color:#1a1a1a"><p style="font-weight:700;color:#EA7822;margin:0 0 18px">Forlife Com</p><h1 style="font-size:20px;margin:0 0 16px">${escape(title)}</h1>${body}${button}<p style="font-size:12px;color:#6b625b;margin-top:28px">Forlife Com — De la stratégie à la vente, une seule intelligence.</p></div></div>`;
  const text = [title, "", ...paragraphs, ...(cta ? ["", `${cta.label} : ${cta.url}`] : [])].join("\n");
  return { html, text };
}

/** Envoi d'email derrière une interface stable. Driver « log » en dev/test, « resend » en production. */
/** Boîte de réception en mémoire, uniquement en test (permet de lire les liens envoyés). */
export const testMailbox: Email[] = [];

export async function sendEmail(email: Email): Promise<void> {
  const cfg = loadConfig();
  if (cfg.NODE_ENV === "test") testMailbox.push(email);
  if (cfg.EMAIL_DRIVER === "resend" && cfg.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${cfg.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ from: cfg.EMAIL_FROM, to: [email.to], subject: email.subject, html: email.html, text: email.text }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}`);
      await prisma.emailOutbox.create({ data: { to: email.to, subject: email.subject, template: email.template, provider: "resend" } });
    } catch (e) {
      await prisma.emailOutbox.create({ data: { to: email.to, subject: email.subject, template: email.template, provider: "resend", status: "FAILED", error: e instanceof Error ? e.message : String(e) } });
    }
    return;
  }
  // Driver « log » : l'email est journalisé (jamais le lien complet dans les logs de production).
  await prisma.emailOutbox.create({ data: { to: email.to, subject: email.subject, template: email.template, provider: "log", status: "LOGGED" } });
  if (cfg.NODE_ENV === "development") console.info(`[email:${email.template}] → ${email.to}\n${email.text}`);
}
