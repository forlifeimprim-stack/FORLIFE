import type { ObjectiveType } from "@forlife/shared";
import { contrast, type CompositionSpec } from "./composer.js";

export interface CriticReport {
  score: number;
  dimensions: { key: string; label: string; score: number; note: string }[];
  recommendations: string[];
  disclaimer: string;
}

const CONVERSION: ObjectiveType[] = ["SALES", "LEADS", "LAUNCH"];

/**
 * Creative Critic — volontairement séparé du générateur (§3.6).
 * Règles mesurables (contraste WCAG, longueur, présence d'éléments) : un score explicable,
 * présenté comme une estimation qualitative et jamais comme une garantie de conversion.
 */
export function critique(input: {
  spec: CompositionSpec;
  objective: ObjectiveType;
  hasPhoto: boolean;
  hasLogo: boolean;
  brandColor: string | null;
  forbiddenWords: string[];
  metrics: { headlineLines: number; headlineSize: number; textOverPhoto: boolean };
}): CriticReport {
  const { spec } = input;
  const dims: CriticReport["dimensions"] = [];
  const recos: string[] = [];

  // Lisibilité : contraste réel texte/fond (WCAG 2.1)
  const ratio = contrast(spec.palette.fg, spec.palette.bg);
  let legibility = ratio >= 7 ? 100 : ratio >= 4.5 ? 82 : ratio >= 3 ? 55 : 25;
  if (input.metrics.textOverPhoto) legibility = Math.min(legibility, 85);
  if (input.metrics.headlineSize < 40) legibility -= 15;
  dims.push({ key: "legibility", label: "Lisibilité", score: Math.max(0, legibility), note: `Contraste ${ratio.toFixed(1)}:1${input.metrics.textOverPhoto ? ", texte sur photo" : ""}` });
  if (ratio < 4.5) recos.push("Augmentez le contraste entre le texte et le fond (palette sombre ou claire).");
  if (input.metrics.headlineSize < 40) recos.push("Le titre devient petit : raccourcissez-le pour qu'il reste lisible sur mobile.");

  // Message : un titre court se lit en moins de 2 secondes dans un fil d'actualité
  const len = spec.headline.length;
  const words = spec.headline.trim().split(/\s+/).length;
  const message = len <= 40 ? 100 : len <= 60 ? 78 : 50;
  dims.push({ key: "message", label: "Clarté du message", score: message, note: `${words} mots, ${len} caractères` });
  if (len > 40) recos.push(`Titre de ${len} caractères : visez 40 maximum pour une lecture instantanée.`);

  // Appel à l'action
  const conversion = CONVERSION.includes(input.objective);
  const cta = spec.cta ? (spec.cta.length <= 30 ? 100 : 80) : conversion ? 30 : 70;
  dims.push({ key: "cta", label: "Appel à l'action", score: cta, note: spec.cta ? `« ${spec.cta} »` : "Absent" });
  if (!spec.cta && conversion) recos.push("Ajoutez un appel à l'action clair (ex. « Commandez sur WhatsApp »).");

  // Marque : logo, couleur de marque, mots interdits
  const hay = [spec.headline, spec.subline, spec.cta, spec.offer].filter(Boolean).join(" ").toLowerCase();
  const forbidden = input.forbiddenWords.filter((w) => w.trim() && hay.includes(w.trim().toLowerCase()));
  let brand = 40 + (input.hasLogo ? 30 : 15) + (input.brandColor ? 30 : 15);
  if (forbidden.length) brand = Math.min(brand, 20);
  dims.push({ key: "brand", label: "Respect de la marque", score: brand, note: forbidden.length ? `Mots interdits : ${forbidden.join(", ")}` : input.hasLogo ? "Logo de la marque présent" : "Repère graphique par défaut" });
  if (forbidden.length) recos.push(`Retirez les mots interdits par votre Brand DNA : ${forbidden.join(", ")}.`);
  if (!input.hasLogo) recos.push("Importez votre logo dans Brand DNA → Assets pour signer vos visuels.");

  // Produit réel
  const product = input.hasPhoto ? 100 : conversion ? 55 : 80;
  dims.push({ key: "product", label: "Produit / preuve visuelle", score: product, note: input.hasPhoto ? "Photo réelle utilisée" : "Visuel graphique sans photo" });
  if (!input.hasPhoto && conversion) recos.push("Ajoutez une vraie photo de votre produit ou réalisation : la preuve visuelle rassure.");

  // Composition
  const lines = input.metrics.headlineLines;
  const composition = lines <= 3 ? 100 : lines <= 4 ? 82 : 62;
  dims.push({ key: "composition", label: "Composition", score: composition, note: `Titre sur ${lines} ligne(s)` });

  const weights: Record<string, number> = { legibility: 0.25, message: 0.2, cta: 0.15, brand: 0.15, product: 0.15, composition: 0.1 };
  const score = Math.round(dims.reduce((n, d) => n + d.score * (weights[d.key] ?? 0), 0));
  return { score, dimensions: dims, recommendations: recos.slice(0, 4), disclaimer: "Estimation qualitative basée sur des règles de design ; ce n'est pas une prédiction de performance." };
}
