import type { UsageKind } from "@forlife/shared";
import type { AIProvider, ProviderCall, ProviderResult } from "../types.js";

/**
 * Fournisseur simulé : sorties déterministes construites à partir du contexte.
 * Permet de faire tourner toute la plateforme (démo, tests, CI) sans clé API.
 * Les résultats sont marqués `isSimulated` dans l'interface.
 */
export class MockProvider implements AIProvider {
  readonly name = "mock";
  readonly kinds: ReadonlySet<UsageKind> = new Set<UsageKind>(["TEXT"]);
  isAvailable(): boolean {
    return true;
  }
  async generate<I, O>(call: ProviderCall<I, O>): Promise<ProviderResult> {
    const output = call.prompt.mock(call.input);
    const size = JSON.stringify(output).length;
    return { output, model: "forlife-mock-1", inputTokens: Math.ceil(call.prompt.render(call.input).length / 4), outputTokens: Math.ceil(size / 4) };
  }
}
