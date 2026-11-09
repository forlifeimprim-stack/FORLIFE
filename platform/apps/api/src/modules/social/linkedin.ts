import { loadConfig } from "../../config.js";
import type { SocialProvider } from "@prisma/client";
import { SocialError, type ConnectedAccount, type MetricsResult, type PostPayload, type SocialProviderAdapter } from "./types.js";

/** Profil membre : produits « Sign In with LinkedIn using OpenID Connect » + « Share on LinkedIn ». */
const MEMBER_SCOPES = ["openid", "profile", "w_member_social"];
/** Pages entreprise : produit « Community Management API » (validation LinkedIn requise). */
const ORG_SCOPES = ["r_organization_social", "w_organization_social", "rw_organization_admin"];

interface LinkedInError {
  message?: string;
  serviceErrorCode?: number;
  status?: number;
  error?: string;
  error_description?: string;
}

/**
 * Adaptateur LinkedIn (Posts API versionnée). Publie sur le profil du membre et, si l'application a
 * obtenu la Community Management API (LINKEDIN_ORG_SCOPES=true), sur les pages entreprise qu'il administre.
 * Identifiant externe = URN de l'auteur (urn:li:person:… ou urn:li:organization:…).
 */
export class LinkedInAdapter implements SocialProviderAdapter {
  readonly key = "linkedin";
  readonly providers = ["LINKEDIN"] as const;

  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  private get cfg() {
    return loadConfig();
  }
  private get scopes() {
    return this.cfg.LINKEDIN_ORG_SCOPES ? [...MEMBER_SCOPES, ...ORG_SCOPES] : MEMBER_SCOPES;
  }

  isConfigured() {
    return !!(this.cfg.LINKEDIN_CLIENT_ID && this.cfg.LINKEDIN_CLIENT_SECRET);
  }

  authorizeUrl(state: string, redirectUri: string) {
    const q = new URLSearchParams({ response_type: "code", client_id: this.cfg.LINKEDIN_CLIENT_ID ?? "", redirect_uri: redirectUri, state, scope: this.scopes.join(" ") });
    return `https://www.linkedin.com/oauth/v2/authorization?${q}`;
  }

  /** Appel API LinkedIn avec traduction des erreurs pour la file de publication. */
  private async call<T>(url: string, init: { method?: string; json?: unknown; form?: Record<string, string> } = {}, token?: string): Promise<{ body: T; headers: Headers }> {
    const headers: Record<string, string> = { "X-Restli-Protocol-Version": "2.0.0", "LinkedIn-Version": this.cfg.LINKEDIN_API_VERSION };
    if (token) headers.authorization = `Bearer ${token}`;
    let body: string | URLSearchParams | undefined;
    if (init.json !== undefined) {
      headers["content-type"] = "application/json";
      body = JSON.stringify(init.json);
    } else if (init.form) {
      body = new URLSearchParams(init.form);
    }
    let res: Response;
    try {
      res = await this.fetchImpl(url, { method: init.method ?? (body ? "POST" : "GET"), headers, body, signal: AbortSignal.timeout(30_000) });
    } catch {
      throw new SocialError("TRANSIENT", "LinkedIn injoignable (réseau)");
    }
    const json = (await res.json().catch(() => ({}))) as T & LinkedInError;
    if (res.ok) return { body: json, headers: res.headers };
    const message = json.message ?? json.error_description ?? `Erreur LinkedIn ${res.status}`;
    if (res.status === 401) throw new SocialError("AUTH", "Autorisation LinkedIn expirée ou révoquée : reconnectez le compte");
    if (res.status === 429) throw new SocialError("RATE_LIMIT", "Limite de requêtes LinkedIn atteinte");
    if (res.status >= 500) throw new SocialError("TRANSIENT", message);
    throw new SocialError("INVALID", message);
  }

  async exchange(code: string, redirectUri: string): Promise<ConnectedAccount[]> {
    if (!this.isConfigured()) throw new SocialError("NOT_CONFIGURED", "Application LinkedIn non configurée");
    const { body: token } = await this.call<{ access_token: string; expires_in?: number; refresh_token?: string; scope?: string }>("https://www.linkedin.com/oauth/v2/accessToken", {
      form: { grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: this.cfg.LINKEDIN_CLIENT_ID!, client_secret: this.cfg.LINKEDIN_CLIENT_SECRET! },
    });
    const expiresAt = token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null;
    const granted = (token.scope ?? this.scopes.join(" ")).split(/[ ,]+/).filter(Boolean);
    const { body: me } = await this.call<{ sub: string; name?: string; picture?: string }>("https://api.linkedin.com/v2/userinfo", {}, token.access_token);
    const base = { provider: "LINKEDIN" as const, accessToken: token.access_token, refreshToken: token.refresh_token ?? null, expiresAt, scopes: granted };
    const accounts: ConnectedAccount[] = [{ ...base, externalId: `urn:li:person:${me.sub}`, name: me.name ? `${me.name} (profil)` : "Profil LinkedIn", avatarUrl: me.picture ?? null }];

    if (granted.includes("rw_organization_admin")) {
      const { body: acl } = await this.call<{ elements?: { organization?: string; organizationTarget?: string }[] }>(
        "https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
        {},
        token.access_token,
      );
      for (const e of acl.elements ?? []) {
        const urn = e.organization ?? e.organizationTarget;
        const id = urn?.split(":").pop();
        if (!urn || !id) continue;
        const org = await this.call<{ localizedName?: string }>(`https://api.linkedin.com/rest/organizations/${id}`, {}, token.access_token).catch(() => ({ body: {} as { localizedName?: string } }));
        accounts.push({ ...base, externalId: urn, name: org.body.localizedName ?? `Page LinkedIn ${id}`, avatarUrl: null });
      }
    }
    return accounts;
  }

  async publish(account: { provider: SocialProvider; externalId: string }, token: string, post: PostPayload): Promise<{ externalId: string; url?: string | null }> {
    if (account.provider !== "LINKEDIN") throw new SocialError("INVALID", "Type de compte non pris en charge par LinkedIn");
    const text = post.link && !post.text.includes(post.link) ? `${post.text}\n\n${post.link}` : post.text;
    const { headers } = await this.call(
      "https://api.linkedin.com/rest/posts",
      {
        json: {
          author: account.externalId,
          commentary: text.slice(0, 3000),
          visibility: "PUBLIC",
          distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false,
        },
      },
      token,
    );
    const urn = headers.get("x-restli-id") ?? headers.get("x-linkedin-id");
    if (!urn) throw new SocialError("TRANSIENT", "LinkedIn n'a pas renvoyé l'identifiant de la publication");
    return { externalId: urn, url: `https://www.linkedin.com/feed/update/${urn}/` };
  }

  async fetchMetrics(_account: { provider: SocialProvider; externalId: string }, token: string, postUrn: string): Promise<MetricsResult> {
    // Réactions et commentaires (disponibles pour tout auteur) ; les impressions exigent les statistiques de page.
    const { body } = await this.call<{ likesSummary?: { totalLikes?: number }; commentsSummary?: { aggregatedTotalComments?: number } }>(
      `https://api.linkedin.com/rest/socialActions/${encodeURIComponent(postUrn)}`,
      {},
      token,
    );
    const engagement = (body.likesSummary?.totalLikes ?? 0) + (body.commentsSummary?.aggregatedTotalComments ?? 0);
    return { impressions: 0, reach: 0, engagement, clicks: 0, isSimulated: false };
  }
}
