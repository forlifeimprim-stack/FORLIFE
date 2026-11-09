import type { Permission } from "./rbac.js";

/**
 * AI Copilot & Agents (Phase 6). Le Copilot répond avec la mémoire de l'entreprise et peut PROPOSER des
 * actions internes. Aucune action externe (publication, email, WhatsApp, paiement) n'est jamais déclenchée
 * par le Copilot : tout ce qu'il crée reste un brouillon soumis au circuit de validation habituel.
 */

export const COPILOT_MODES = ["ASSISTED", "COPILOT", "AUTOPILOT"] as const;
export type CopilotMode = (typeof COPILOT_MODES)[number];

export const COPILOT_MODE_LABELS: Record<CopilotMode, { label: string; description: string }> = {
  ASSISTED: { label: "Assisté", description: "Le Copilot conseille et répond ; il ne propose aucune action." },
  COPILOT: { label: "Copilot", description: "Le Copilot propose des actions ; chacune attend votre accord explicite." },
  AUTOPILOT: {
    label: "Autopilot borné",
    description:
      "Les actions que vous avez autorisées sont exécutées automatiquement, dans une limite quotidienne. Elles ne créent que des brouillons internes, jamais de publication.",
  },
};

export const COPILOT_ACTION_TYPES = ["content.draft", "crm.task", "strategy.recommendation", "campaign.draft"] as const;
export type CopilotActionType = (typeof COPILOT_ACTION_TYPES)[number];

export const COPILOT_ACTIONS: Record<CopilotActionType, { label: string; permission: Permission; result: string }> = {
  "content.draft": { label: "Créer un brouillon de contenu", permission: "content:create", result: "Brouillon créé dans le Content Studio (à relire et faire approuver)" },
  "crm.task": { label: "Créer une tâche de relance", permission: "crm:create", result: "Tâche ajoutée au CRM" },
  "strategy.recommendation": { label: "Ajouter une recommandation", permission: "strategy:create", result: "Recommandation ajoutée à la stratégie" },
  "campaign.draft": { label: "Préparer une campagne", permission: "campaigns:create", result: "Campagne créée en brouillon" },
};

export const COPILOT_AGENT_KEYS = [
  "copilot",
  "strategist",
  "brand_guardian",
  "content_writer",
  "creative_director",
  "critic",
  "video_producer",
  "social_manager",
  "campaign_planner",
  "sales_coach",
  "analyst",
  "optimizer",
] as const;
export type CopilotAgentKey = (typeof COPILOT_AGENT_KEYS)[number];

export interface CopilotAgent {
  key: CopilotAgentKey;
  name: string;
  role: string;
  mission: string;
  /** Exemples de questions affichés dans l'interface. */
  starters: string[];
  actions: CopilotActionType[];
}

export const COPILOT_AGENTS: Record<CopilotAgentKey, CopilotAgent> = {
  copilot: {
    key: "copilot",
    name: "Copilot",
    role: "Assistant général",
    mission: "Répondre à toute question sur l'entreprise, orienter vers le bon module et proposer la prochaine meilleure action.",
    starters: ["Que dois-je faire en priorité cette semaine ?", "Fais-moi le point sur mon activité."],
    actions: ["content.draft", "crm.task", "strategy.recommendation", "campaign.draft"],
  },
  strategist: {
    key: "strategist",
    name: "Strategist",
    role: "Stratège business",
    mission: "Relier chaque action aux objectifs, prioriser selon l'impact et l'effort, repérer les opportunités.",
    starters: ["Mes objectifs sont-ils réalistes ?", "Quelles sont les 3 priorités du mois ?"],
    actions: ["strategy.recommendation", "campaign.draft"],
  },
  brand_guardian: {
    key: "brand_guardian",
    name: "Brand Guardian",
    role: "Gardien de la marque",
    mission: "Veiller au respect du Brand DNA : ton, vocabulaire, mots interdits, promesses et faits verrouillés.",
    starters: ["Ce message respecte-t-il notre ton ?", "Quels mots devrions-nous éviter ?"],
    actions: ["strategy.recommendation"],
  },
  content_writer: {
    key: "content_writer",
    name: "Content Writer",
    role: "Rédacteur",
    mission: "Écrire des publications engageantes, adaptées à chaque réseau et au marché local.",
    starters: ["Écris un post pour notre offre phare.", "Propose 3 accroches pour Facebook."],
    actions: ["content.draft"],
  },
  creative_director: {
    key: "creative_director",
    name: "Creative Director",
    role: "Directeur artistique",
    mission: "Proposer des concepts visuels et des directions créatives cohérentes avec la marque.",
    starters: ["Quel visuel pour notre prochaine promo ?", "Donne-moi 3 concepts créatifs."],
    actions: ["content.draft"],
  },
  critic: {
    key: "critic",
    name: "Critic",
    role: "Relecteur exigeant",
    mission: "Évaluer contenus et idées sans complaisance : clarté, preuve, appel à l'action, risques.",
    starters: ["Critique notre dernier contenu.", "Qu'est-ce qui affaiblit notre message ?"],
    actions: ["strategy.recommendation"],
  },
  video_producer: {
    key: "video_producer",
    name: "Video Producer",
    role: "Producteur vidéo",
    mission: "Imaginer des vidéos courtes (9:16) : accroche en 2 secondes, scènes, sous-titres, appel à l'action.",
    starters: ["Idée de vidéo TikTok de 15 secondes ?", "Comment montrer nos coulisses ?"],
    actions: ["content.draft"],
  },
  social_manager: {
    key: "social_manager",
    name: "Social Manager",
    role: "Community manager",
    mission: "Organiser le calendrier éditorial, la fréquence et le mix des publications par réseau.",
    starters: ["Mon calendrier est-il équilibré ?", "Quand publier cette semaine ?"],
    actions: ["content.draft", "strategy.recommendation"],
  },
  campaign_planner: {
    key: "campaign_planner",
    name: "Campaign Planner",
    role: "Planificateur de campagnes",
    mission: "Concevoir des campagnes complètes : objectif, cible, offre, budget en FCFA, canaux, KPI.",
    starters: ["Prépare une campagne pour la rentrée.", "Quel budget pour 50 leads ?"],
    actions: ["campaign.draft", "content.draft"],
  },
  sales_coach: {
    key: "sales_coach",
    name: "Sales Coach",
    role: "Coach commercial",
    mission: "Aider à convertir les leads : priorités de relance, arguments, réponses aux objections.",
    starters: ["Quels leads relancer aujourd'hui ?", "Comment répondre à « c'est trop cher » ?"],
    actions: ["crm.task"],
  },
  analyst: {
    key: "analyst",
    name: "Analyst",
    role: "Analyste ROI",
    mission: "Lire les chiffres réels (contenus, leads, ventes, crédits) et en tirer des constats factuels.",
    starters: ["Qu'est-ce qui génère le plus de leads ?", "Résume nos résultats du mois."],
    actions: ["strategy.recommendation"],
  },
  optimizer: {
    key: "optimizer",
    name: "Optimizer",
    role: "Optimiseur",
    mission: "Identifier ce qui bloque (contenus en attente, leads oubliés, crédits) et proposer des améliorations concrètes.",
    starters: ["Qu'est-ce qui bloque en ce moment ?", "Comment gagner du temps chaque semaine ?"],
    actions: ["crm.task", "strategy.recommendation", "content.draft"],
  },
};

/** Taille maximale d'un message utilisateur. */
export const COPILOT_MESSAGE_MAX = 4000;
