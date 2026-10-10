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
