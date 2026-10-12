/** Énumérations métier partagées (doivent rester alignées sur prisma/schema.prisma). */

export const CONTENT_STATUSES = [
  "DRAFT",
  "GENERATING",
  "REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "FAILED",
  "ARCHIVED",
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/**
 * Machine à états du contenu. La publication réelle (SCHEDULED → PUBLISHED) sera
 * pilotée par le Social Hub (Phase 3) ; elle est déjà modélisée ici.
 */
export const CONTENT_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  DRAFT: ["GENERATING", "REVIEW", "ARCHIVED"],
  GENERATING: ["DRAFT", "FAILED"],
  REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["DRAFT", "SCHEDULED", "ARCHIVED"],
  SCHEDULED: ["APPROVED", "PUBLISHED", "FAILED"],
  PUBLISHED: ["ARCHIVED"],
  FAILED: ["DRAFT", "SCHEDULED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return CONTENT_TRANSITIONS[from].includes(to);
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Brouillon",
  GENERATING: "Génération",
  REVIEW: "En revue",
  APPROVED: "Approuvé",
  SCHEDULED: "Programmé",
  PUBLISHED: "Publié",
  FAILED: "Échec",
  ARCHIVED: "Archivé",
};

export const CHANNELS = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "LINKEDIN", "YOUTUBE", "X", "WHATSAPP", "EMAIL"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<Channel, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  X: "X",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
};

/** Contraintes éditoriales par canal (utilisées par l'IA et par la prévisualisation). */
export const CHANNEL_LIMITS: Record<Channel, { maxChars: number; maxHashtags: number }> = {
  FACEBOOK: { maxChars: 2000, maxHashtags: 5 },
  INSTAGRAM: { maxChars: 2200, maxHashtags: 15 },
  TIKTOK: { maxChars: 2200, maxHashtags: 6 },
  LINKEDIN: { maxChars: 3000, maxHashtags: 5 },
  YOUTUBE: { maxChars: 5000, maxHashtags: 15 },
  X: { maxChars: 280, maxHashtags: 2 },
  WHATSAPP: { maxChars: 1000, maxHashtags: 0 },
  EMAIL: { maxChars: 5000, maxHashtags: 0 },
};

export const CONTENT_TYPES = ["POST", "CAROUSEL", "STORY", "VIDEO_SCRIPT", "EMAIL", "WHATSAPP_MESSAGE"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const OBJECTIVE_TYPES = ["AWARENESS", "ENGAGEMENT", "LEADS", "SALES", "LAUNCH", "SOCIAL_PROOF", "RETENTION"] as const;
export type ObjectiveType = (typeof OBJECTIVE_TYPES)[number];

export const OBJECTIVE_LABELS: Record<ObjectiveType, string> = {
  AWARENESS: "Notoriété",
  ENGAGEMENT: "Engagement",
  LEADS: "Génération de prospects",
  SALES: "Ventes",
  LAUNCH: "Lancement",
  SOCIAL_PROOF: "Preuve sociale",
  RETENTION: "Fidélisation",
};

export const JOB_STATUSES = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED", "DEAD"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const AI_MODES = ["ASSISTED", "COPILOT", "AUTOPILOT"] as const;
export type AiMode = (typeof AI_MODES)[number];

// ───── CRM ─────
export const LEAD_STAGES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "Nouveau",
  CONTACTED: "Contacté",
  QUALIFIED: "Qualifié",
  PROPOSAL: "Devis envoyé",
  WON: "Gagné",
  LOST: "Perdu",
};

export const LEAD_SOURCES = ["WHATSAPP", "FORM", "FACEBOOK", "INSTAGRAM", "TIKTOK", "LINKEDIN", "WEBSITE", "REFERRAL", "WALK_IN", "OTHER"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  WHATSAPP: "WhatsApp",
  FORM: "Formulaire",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  LINKEDIN: "LinkedIn",
  WEBSITE: "Site web",
  REFERRAL: "Recommandation",
  WALK_IN: "Visite en boutique",
  OTHER: "Autre",
};

export const CAMPAIGN_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = { DRAFT: "Brouillon", ACTIVE: "Active", PAUSED: "En pause", COMPLETED: "Terminée" };

/**
 * Normalise un numéro ivoirien / international en E.164.
 * « 07 49 56 70 82 » → « +2250749567082 » (numéros CI à 10 chiffres depuis 2021).
 */
export function normalizePhone(raw: string, defaultCountryCode = "225"): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return null;
  let n = digits.startsWith("+") ? digits.slice(1) : digits.startsWith("00") ? digits.slice(2) : `${defaultCountryCode}${digits}`;
  n = n.replace(/\D/g, "");
  return n.length >= 8 && n.length <= 15 ? `+${n}` : null;
}

/**
 * Score de lead transparent (0–100) : chaque point est expliqué.
 * Les signaux viennent de données réelles du CRM, pas d'une estimation opaque.
 */
export function scoreLead(input: { hasPhone: boolean; hasEmail: boolean; consent: boolean; source: LeadSource; fromCampaign: boolean; activities: number; valueAmount: number | null; stage: LeadStage }) {
  const reasons: { label: string; points: number }[] = [];
  const add = (label: string, points: number) => points && reasons.push({ label, points });
  add("Téléphone renseigné", input.hasPhone ? 20 : 0);
  add("Email renseigné", input.hasEmail ? 5 : 0);
  add("Accepte d'être contacté sur WhatsApp", input.consent ? 15 : 0);
  add("Source à forte intention", ["WHATSAPP", "REFERRAL", "WALK_IN", "FORM"].includes(input.source) ? 15 : 5);
  add("Issu d'une campagne", input.fromCampaign ? 10 : 0);
  add("Échanges récents", Math.min(20, input.activities * 5));
  add("Valeur estimée renseignée", input.valueAmount ? 10 : 0);
  add("Avancement dans le pipeline", { NEW: 0, CONTACTED: 3, QUALIFIED: 8, PROPOSAL: 12, WON: 0, LOST: 0 }[input.stage]);
  const score = Math.min(100, reasons.reduce((n, r) => n + r.points, 0));
  return { score, reasons };
}

// ───── Social Hub ─────
export const SOCIAL_PROVIDERS = ["FACEBOOK_PAGE", "INSTAGRAM_BUSINESS", "LINKEDIN", "TIKTOK", "YOUTUBE", "SANDBOX"] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];
export const SOCIAL_PROVIDER_LABELS: Record<SocialProvider, string> = {
  FACEBOOK_PAGE: "Page Facebook",
  INSTAGRAM_BUSINESS: "Instagram professionnel",
  LINKEDIN: "LinkedIn",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  SANDBOX: "Compte de démonstration",
};
/** Canal éditorial → types de comptes capables de le publier. */
export const CHANNEL_PROVIDERS: Partial<Record<Channel, SocialProvider[]>> = {
  FACEBOOK: ["FACEBOOK_PAGE", "SANDBOX"],
  INSTAGRAM: ["INSTAGRAM_BUSINESS", "SANDBOX"],
  LINKEDIN: ["LINKEDIN"],
  TIKTOK: ["TIKTOK"],
  YOUTUBE: ["YOUTUBE"],
};
export const PUBLICATION_STATUS_LABELS = { QUEUED: "En file", PUBLISHING: "Publication…", PUBLISHED: "Publié", FAILED: "Échec", CANCELLED: "Annulé" } as const;

// ───── Creative Studio ─────
export const CREATIVE_FORMATS = {
  SQUARE: { label: "Carré 1:1 (post)", width: 1080, height: 1080 },
  PORTRAIT: { label: "Portrait 4:5 (Instagram)", width: 1080, height: 1350 },
  STORY: { label: "Story / Reel 9:16", width: 1080, height: 1920 },
  LANDSCAPE: { label: "Paysage (Facebook, lien)", width: 1200, height: 628 },
} as const;
export type CreativeFormat = keyof typeof CREATIVE_FORMATS;
export const CREATIVE_LAYOUTS = {
  BOLD: "Titre impactant",
  PRODUCT_HERO: "Produit en vedette",
  SPLIT: "Image et texte côte à côte",
  OFFER_BADGE: "Offre en pastille",
  QUOTE: "Témoignage / citation",
} as const;
export type CreativeLayout = keyof typeof CREATIVE_LAYOUTS;
