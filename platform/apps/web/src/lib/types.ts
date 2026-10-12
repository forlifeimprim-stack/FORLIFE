import type { Channel, ContentStatus, ContentType, ObjectiveType, Permission, PlanCode, Role } from "@forlife/shared";

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  timezone: string;
}
export interface OrgSummary {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  role: Role;
  permissions: Permission[];
  plan: PlanCode;
  status: "ACTIVE" | "SUSPENDED";
  credits: number;
  workspaces: WorkspaceSummary[];
}
export interface Me {
  user: { id: string; email: string; name: string; locale: string; isPlatformAdmin: boolean };
  organizations: OrgSummary[];
}

export interface JobState<R = unknown> {
  id: string;
  type: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "DEAD";
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  result: R | null;
}

export interface SafetyResult {
  passed: boolean;
  flags: { code: string; detail: string }[];
}

export interface Idea {
  angle: string;
  hook: string;
  message: string;
  cta: string;
  format: ContentType;
}

export interface Variant {
  id: string;
  channel: Channel;
  label: string;
  body: string;
  cta: string | null;
  hashtags: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  angle: string | null;
  hook: string | null;
  body: string;
  cta: string | null;
  status: ContentStatus;
  scheduledAt: string | null;
  revision: number;
  aiRunId: string | null;
  updatedAt: string;
  createdAt: string;
  pillar?: { id: string; name: string } | null;
  objective?: { id: string; title: string; type: ObjectiveType } | null;
  variants: Variant[];
  approvals?: { id: string; status: string; comment: string | null; createdAt: string; decidedAt: string | null }[];
}

export interface Objective {
  id: string;
  type: ObjectiveType;
  title: string;
  metric: string;
  target: number;
  periodStart: string;
  periodEnd: string;
  status: string;
}

export interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  impact: number;
  effort: number;
  status: string;
  isEstimate: boolean;
}

export interface Guideline {
  id: string;
  version: number;
  status: "DRAFT" | "APPROVED" | "SUPERSEDED";
  tone: string | null;
  voiceByChannel: { channel: Channel; guidance: string }[];
  vocabulary: string[];
  forbiddenWords: string[];
  promises: string[];
  proofs: string[];
  objections: string[];
  colors: { name: string; hex: string }[];
  fonts: string[];
  visualRules: string[];
  source: string;
  createdAt: string;
  approvedAt: string | null;
}
