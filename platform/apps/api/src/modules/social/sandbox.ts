import { createHash } from "node:crypto";
import { SocialError, type SocialProviderAdapter } from "./types.js";
import { SANDBOX_NETWORKS, type SandboxNetwork } from "@forlife/shared";
import { loadConfig } from "../../config.js";

const NETWORK_NAMES: Record<SandboxNetwork, string> = {
  FACEBOOK: "Page Facebook (test)",
  INSTAGRAM: "Compte Instagram (test)",
  LINKEDIN: "Page LinkedIn (test)",
  TIKTOK: "Compte TikTok (test)",
  YOUTUBE: "Chaîne YouTube (test)",
};

/**
 * Bac à sable : simule une page connectée et des publications.
 * Utile pour la démo, la formation et les tests ; les mesures sont marquées « simulées ».
 */
export class SandboxAdapter implements SocialProviderAdapter {
  readonly key = "sandbox";
  readonly providers = ["SANDBOX"] as const;
  isConfigured() {
    return loadConfig().SOCIAL_SANDBOX_ENABLED;
  }
  /** Le réseau simulé voyage dans le code d'autorisation (aucun échange réel). */
  authorizeUrl(state: string, redirectUri: string, options?: { network?: string }) {
    const network = options?.network && (SANDBOX_NETWORKS as readonly string[]).includes(options.network) ? options.network : "";
    const code = network ? `sandbox-code-${network.toLowerCase()}` : "sandbox-code";
    return `${redirectUri}?code=${code}&state=${encodeURIComponent(state)}`;
  }
  async exchange(code: string) {
    const network = SANDBOX_NETWORKS.find((n) => code === `sandbox-code-${n.toLowerCase()}`);
    if (network) {
      return [{ provider: "SANDBOX" as const, externalId: `test-${network.toLowerCase()}`, name: NETWORK_NAMES[network], accessToken: "sandbox-token", scopes: ["publish"] }];
    }
    return [{ provider: "SANDBOX" as const, externalId: "sandbox-page", name: "Page de démonstration", accessToken: "sandbox-token", scopes: ["publish"] }];
  }
  async publish(_a: unknown, _t: string, post: { text: string }, idempotencyKey: string) {
    if (/#echec-test/.test(post.text)) {
      throw new SocialError("INVALID", "Publication refusée par le bac à sable (#echec-test)");
    }
    const id = createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 16);
    return { externalId: `sandbox_${id}`, url: null };
  }
  async fetchMetrics(_a: unknown, _t: string, externalPostId: string) {
    // Valeurs déterministes dérivées de l'identifiant (mêmes chiffres à chaque appel).
    const seed = parseInt(createHash("sha256").update(externalPostId).digest("hex").slice(0, 8), 16);
    const impressions = 200 + (seed % 1800);
    const reach = Math.round(impressions * 0.7);
    return { impressions, reach, engagement: Math.round(reach * 0.06), clicks: Math.round(reach * 0.015), isSimulated: true };
  }
}
