/**
 * Plans et coûts en crédits. Les crédits sont la seule unité facturée à
 * l'usage IA : transparents, prévisibles, affichés avant toute génération lourde.
 */

export const PLAN_CODES = ["FREE", "STARTER", "BUSINESS", "PRO", "AGENCY"] as const;
export type PlanCode = (typeof PLAN_CODES)[number];

export interface PlanDefinition {
  code: PlanCode;
  name: string;
  target: string;
  /** Prix mensuel en FCFA (XOF), grille validée le 12/10/2026 — l'encaissement (mobile money, carte) sera branché en Phase 7. */
  monthlyPriceXof: number;
  monthlyCredits: number;
  maxWorkspaces: number;
  maxMembers: number;
  features: string[];
}

export const PLANS: Record<PlanCode, PlanDefinition> = {
  FREE: {
    code: "FREE",
    name: "Free",
    target: "Découverte",
    monthlyPriceXof: 0,
    monthlyCredits: 200,
    maxWorkspaces: 1,
    maxMembers: 2,
    features: ["Audit", "Brand DNA", "Contenus (quota limité)"],
  },
  STARTER: {
    code: "STARTER",
    name: "Starter",
    target: "Indépendant / TPE",
    monthlyPriceXof: 15000,
    monthlyCredits: 1500,
    maxWorkspaces: 1,
    maxMembers: 3,
    features: ["Content Factory", "Brand DNA", "Calendrier", "Création limitée"],
  },
  BUSINESS: {
    code: "BUSINESS",
    name: "Business",
    target: "PME",
    monthlyPriceXof: 45000,
    monthlyCredits: 5000,
    maxWorkspaces: 3,
    maxMembers: 10,
    features: ["CRM", "Campagnes", "Analytics", "Automatisation"],
  },
  PRO: {
    code: "PRO",
    name: "Pro",
    target: "Marque / équipe",
    monthlyPriceXof: 95000,
    monthlyCredits: 12000,
    maxWorkspaces: 10,
    maxMembers: 25,
    features: ["Multi-workspace", "Creative avancé", "Agents IA", "Reporting"],
  },
  AGENCY: {
    code: "AGENCY",
    name: "Agency",
    target: "Agence",
    monthlyPriceXof: 250000,
    monthlyCredits: 40000,
    maxWorkspaces: 100,
    maxMembers: 100,
    features: ["Multi-client", "Rôles avancés", "White-label (à venir)", "Volume"],
  },
};

/** Types d'usage mesurés séparément (cahier des charges §18). */
export const USAGE_KINDS = ["TEXT", "IMAGE", "VIDEO", "TRANSCRIPTION", "VOICE"] as const;
export type UsageKind = (typeof USAGE_KINDS)[number];

/** Coût forfaitaire en crédits par tâche IA (estimation affichée avant exécution). */
export const TASK_CREDIT_COST = {
  "brand.dna": 15,
  "strategy.plan": 25,
  "content.ideas": 8,
  "content.post": 10,
  "crm.followup": 3,
  "creative.concepts": 6,
  "creative.render": 2,
  "video.storyboard": 8,
  "video.render": 15,
} as const;
export type AiTaskType = keyof typeof TASK_CREDIT_COST;

/** Seuils d'alerte de consommation (pourcentage de l'allocation mensuelle restante). */
export const CREDIT_ALERT_THRESHOLDS = [0.2, 0.05] as const;
