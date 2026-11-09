import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { UsageKind } from "@forlife/shared";
import { ProviderError, type AIProvider, type ProviderCall, type ProviderResult } from "../types.js";

/** Adaptateur Claude (Anthropic). Sorties structurées validées par schéma. */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly kinds: ReadonlySet<UsageKind> = new Set<UsageKind>(["TEXT"]);
  private client: Anthropic | null;

  constructor(
    private readonly apiKey: string | undefined,
    private readonly model: string,
  ) {
    this.client = apiKey ? new Anthropic({ apiKey, maxRetries: 2, timeout: 120_000 }) : null;
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generate<I, O>(call: ProviderCall<I, O>): Promise<ProviderResult> {
    if (!this.client) throw new ProviderError(this.name, "Clé API Anthropic absente", true);
    try {
      const response = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: call.prompt.maxTokens ?? 16000,
        system: call.prompt.system,
        messages: [{ role: "user", content: call.prompt.render(call.input) }],
        output_config: { effort: "medium", format: betaZodOutputFormat(call.prompt.output) },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      if (response.stop_reason === "refusal") {
        throw new ProviderError(this.name, "Requête refusée par le fournisseur (politique de sécurité)", false);
      }
      if (response.stop_reason === "max_tokens") {
        throw new ProviderError(this.name, "Réponse tronquée (max_tokens)", true);
      }
      if (response.parsed_output == null) {
        throw new ProviderError(this.name, "Sortie structurée illisible", true);
      }
      return {
        output: response.parsed_output,
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    } catch (e) {
      if (e instanceof ProviderError) throw e;
      if (e instanceof Anthropic.BadRequestError || e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
        throw new ProviderError(this.name, `Erreur de configuration ou de requête fournisseur (${e.status})`, true);
      }
      if (e instanceof Anthropic.APIError) {
        throw new ProviderError(this.name, `Erreur fournisseur (${e.status ?? "réseau"})`, true);
      }
      throw new ProviderError(this.name, "Erreur inattendue du fournisseur", true);
    }
  }
}
