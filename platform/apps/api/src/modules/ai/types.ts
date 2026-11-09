import type { z } from "zod";
import type { AiTaskType, UsageKind } from "@forlife/shared";

/** Définition versionnée d'une instruction IA (Prompt/Instruction Registry, §21). */
export interface PromptDefinition<I = unknown, O = unknown> {
  key: string;
  version: number;
  task: AiTaskType;
  usageKind: UsageKind;
  system: string;
  render(input: I): string;
  output: z.ZodType<O>;
  /** Sortie déterministe du fournisseur simulé (démo, tests, absence de clé). */
  mock(input: I): O;
  /** Texte à contrôler par la couche sécurité (mots interdits, mentions). */
  textForSafety(output: O): string[];
  maxTokens?: number;
}

export interface ProviderCall<I, O> {
  prompt: PromptDefinition<I, O>;
  input: I;
  traceId: string;
}

export interface ProviderResult {
  output: unknown;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

/** Contrat interne d'un fournisseur IA : le domaine métier ne dépend jamais d'une API externe. */
export interface AIProvider {
  readonly name: string;
  readonly kinds: ReadonlySet<UsageKind>;
  isAvailable(): boolean;
  generate<I, O>(call: ProviderCall<I, O>): Promise<ProviderResult>;
}

export class ProviderError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
    /** true = erreur transitoire, on peut tenter le fournisseur suivant. */
    public readonly retryable = true,
  ) {
    super(message);
  }
}

export interface SafetyResult {
  passed: boolean;
  flags: { code: string; detail: string }[];
}

export interface AIRequest<I> {
  organizationId: string;
  workspaceId: string | null;
  actorId: string | null;
  prompt: PromptDefinition<I, unknown>;
  input: I;
  traceId: string;
  /** Liste de mots interdits issue du Brand DNA approuvé. */
  forbiddenWords?: string[];
  /** Clé d'idempotence du débit de crédits (ex. id du job). */
  idempotencyKey: string;
}

export interface AIResponse<O> {
  runId: string;
  output: O;
  provider: string;
  model: string;
  creditsCharged: number;
  safety: SafetyResult;
  isSimulated: boolean;
  latencyMs: number;
  traceId: string;
}
