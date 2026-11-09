import { createHash } from "node:crypto";
import { SocialError, type RecentPost, type SocialProviderAdapter } from "./types.js";
import { SANDBOX_NETWORKS, sandboxNetwork, type SandboxNetwork } from "@forlife/shared";
import { loadConfig } from "../../config.js";

/** Publications fictives du bac à sable (analyse des réseaux en démonstration). */
const SAMPLE_POSTS = [
  { text: "Nouvel arrivage ! Découvrez nos nouveautés en boutique dès aujourd'hui. Écrivez-nous sur WhatsApp pour réserver.", format: "photo" },
  { text: "Les coulisses de notre atelier : 3 étapes pour un travail soigné, du choix des matières à la livraison.", format: "vidéo" },
  { text: "Merci à tous nos clients pour votre fidélité ! Cette semaine, -10 % sur toute la gamme.", format: "carrousel" },
  { text: "Question du jour : quel modèle préférez-vous, le A ou le B ? Répondez en commentaire.", format: "texte" },
  { text: "Livraison partout à Abidjan en 24 h. Paiement mobile money accepté.", format: "photo" },
  { text: "Avant / après : regardez la différence. Prenez rendez-vous par message.", format: "vidéo" },
];

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
  async fetchRecentPosts(account: { externalId: string }, _t: string, limit: number): Promise<RecentPost[]> {
    const network = sandboxNetwork(account.externalId);
    const video = network === "TIKTOK" || network === "YOUTUBE";
    const day = 86_400_000;
    // Dates et chiffres déterministes, ancrés sur un lundi fixe pour des tests stables.
    const anchor = Date.UTC(2026, 9, 12, 18);
    return SAMPLE_POSTS.slice(0, limit).map((p, i) => {
      const seed = parseInt(createHash("sha256").update(`${account.externalId}:${i}`).digest("hex").slice(0, 8), 16);
      const likes = 10 + (seed % 120);
      return {
        externalId: `${account.externalId}-post-${i + 1}`,
        text: p.text,
        createdAt: new Date(anchor - i * 2 * day - (i % 3) * 3_600_000 * 5),
        url: null,
        format: video ? "vidéo" : p.format,
        likes,
        comments: Math.round(likes / 6),
        shares: Math.round(likes / 12),
        views: video ? likes * 25 : null,
      };
    });
  }
}
