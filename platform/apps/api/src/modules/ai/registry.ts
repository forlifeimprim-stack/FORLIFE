import type { UsageKind } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { MockProvider } from "./providers/mock.js";
import type { AIProvider } from "./types.js";

/**
 * AI Provider Registry + Model Router.
 * L'ordre de AI_PROVIDERS (feature flag) fixe la préférence ; un fournisseur indisponible
 * (clé absente, désactivé) est ignoré ; les suivants servent de fallback.
 */
export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  constructor(private readonly order: string[]) {}

  register(provider: AIProvider): this {
    this.providers.set(provider.name, provider);
    return this;
  }

  /** Chaîne de fournisseurs candidats pour un type d'usage, dans l'ordre de préférence. */
  route(kind: UsageKind): AIProvider[] {
    return this.order
      .map((name) => this.providers.get(name))
      .filter((p): p is AIProvider => !!p && p.kinds.has(kind) && p.isAvailable());
  }
}

let registry: ProviderRegistry | undefined;

export function getRegistry(): ProviderRegistry {
  if (!registry) {
    const cfg = loadConfig();
    registry = new ProviderRegistry(cfg.AI_PROVIDERS)
      .register(new AnthropicProvider(cfg.ANTHROPIC_API_KEY || undefined, cfg.ANTHROPIC_MODEL))
      .register(new MockProvider());
  }
  return registry;
}

/** Réservé aux tests : injecter un registre personnalisé. */
export function setRegistry(r: ProviderRegistry | undefined): void {
  registry = r;
}
