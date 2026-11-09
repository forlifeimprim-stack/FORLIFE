import { CHANNEL_LIMITS, type Channel } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";

/** Contexte persistant de l'entreprise injecté dans chaque génération (Business Brain + Brand DNA). */
export interface BrandContext {
  workspaceName: string;
  brandName: string;
  mission: string | null;
  positioning: string | null;
  sector: string;
  country: string;
  city: string | null;
  offer: string | null;
  target: string | null;
  differentiators: string | null;
  tone: string | null;
  vocabulary: string[];
  forbiddenWords: string[];
  promises: string[];
  proofs: string[];
  lockedFacts: string[];
  products: { name: string; price: string | null }[];
  channels: string[];
  businessProfileVersion: number | null;
  guidelineVersion: number | null;
}

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export async function loadBrandContext(workspaceId: string): Promise<BrandContext> {
  const ws = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    include: {
      brand: { include: { guidelines: { where: { status: "APPROVED" }, take: 1 } } },
      businessProfiles: { orderBy: { version: "desc" }, take: 1 },
      products: { take: 20, orderBy: { createdAt: "asc" } },
    },
  });
  const profile = ws.businessProfiles[0];
  const guideline = ws.brand?.guidelines[0];
  return {
    workspaceName: ws.name,
    brandName: ws.brand?.name ?? ws.name,
    mission: ws.brand?.mission ?? null,
    positioning: ws.brand?.positioning ?? null,
    sector: profile?.sector ?? "non précisé",
    country: profile?.country ?? "CI",
    city: profile?.city ?? null,
    offer: profile?.offerSummary ?? null,
    target: profile?.targetSummary ?? null,
    differentiators: profile?.differentiators ?? null,
    tone: guideline?.tone ?? null,
    vocabulary: strArr(guideline?.vocabulary),
    forbiddenWords: strArr(guideline?.forbiddenWords),
    promises: strArr(guideline?.promises),
    proofs: strArr(guideline?.proofs),
    lockedFacts: strArr(ws.brand?.lockedFacts),
    products: ws.products.map((p) => ({
      name: p.name,
      price: p.priceAmount != null ? `${p.priceAmount.toLocaleString("fr-FR")} ${p.currency === "XOF" ? "FCFA" : p.currency}` : null,
    })),
    channels: strArr(profile?.channels),
    businessProfileVersion: profile?.version ?? null,
    guidelineVersion: guideline?.version ?? null,
  };
}

export function renderContext(c: BrandContext): string {
  const lines = [
    `Entreprise : ${c.brandName} (espace « ${c.workspaceName} »)`,
    `Secteur : ${c.sector} — ${c.city ? `${c.city}, ` : ""}${c.country}`,
    c.mission && `Mission : ${c.mission}`,
    c.positioning && `Positionnement : ${c.positioning}`,
    c.offer && `Offre : ${c.offer}`,
    c.target && `Cible : ${c.target}`,
    c.differentiators && `Différenciation : ${c.differentiators}`,
    c.tone && `Ton de marque : ${c.tone}`,
    c.vocabulary.length && `Vocabulaire à privilégier : ${c.vocabulary.join(", ")}`,
    c.forbiddenWords.length && `Mots interdits : ${c.forbiddenWords.join(", ")}`,
    c.promises.length && `Promesses : ${c.promises.join(" ; ")}`,
    c.proofs.length && `Preuves : ${c.proofs.join(" ; ")}`,
    c.products.length && `Produits (noms et prix à reprendre À L'IDENTIQUE) : ${c.products.map((p) => (p.price ? `${p.name} = ${p.price}` : p.name)).join(" ; ")}`,
    c.lockedFacts.length && `Faits verrouillés (ne jamais modifier) : ${c.lockedFacts.join(" ; ")}`,
    c.channels.length && `Canaux actifs : ${c.channels.join(", ")}`,
  ];
  return lines.filter(Boolean).join("\n");
}

export function channelRules(channels: Channel[]): string {
  return channels.map((ch) => `- ${ch} : ${CHANNEL_LIMITS[ch].maxChars} caractères max, ${CHANNEL_LIMITS[ch].maxHashtags} hashtags max`).join("\n");
}
