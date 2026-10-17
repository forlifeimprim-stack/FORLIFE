import { loadConfig } from "../../config.js";
import type { SocialProvider } from "@prisma/client";
import { SocialError, type ConnectedAccount, type MetricsResult, type PostPayload, type ProfileInfo, type RecentPost, type SocialProviderAdapter } from "./types.js";

/** Permissions minimales demandées (§5.3 : scopes minimaux). */
const SCOPES = ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "read_insights", "instagram_basic", "instagram_content_publish", "business_management"];

interface GraphError {
  error?: { message?: string; code?: number; type?: string; error_subcode?: number };
}

/**
 * Adaptateur Meta (Facebook Pages + Instagram professionnel) via la Graph API.
 * Nécessite une application Meta validée (META_APP_ID / META_APP_SECRET) et la revue des permissions.
 */
export class MetaAdapter implements SocialProviderAdapter {
  readonly key = "meta";
  readonly providers = ["FACEBOOK_PAGE", "INSTAGRAM_BUSINESS"] as const;

  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  private get cfg() {
    return loadConfig();
  }
  private get base() {
    return `https://graph.facebook.com/${this.cfg.META_GRAPH_VERSION}`;
  }

  isConfigured() {
    return !!(this.cfg.META_APP_ID && this.cfg.META_APP_SECRET);
  }

  authorizeUrl(state: string, redirectUri: string) {
    const q = new URLSearchParams({ client_id: this.cfg.META_APP_ID ?? "", redirect_uri: redirectUri, state, scope: SCOPES.join(","), response_type: "code" });
    return `https://www.facebook.com/${this.cfg.META_GRAPH_VERSION}/dialog/oauth?${q}`;
  }

  /** Appel Graph API avec traduction des erreurs en catégories exploitables par la file de publication. */
  private async call<T>(path: string, init?: { method?: string; body?: Record<string, string> }, token?: string): Promise<T> {
    const url = new URL(path.startsWith("http") ? path : `${this.base}${path}`);
    let body: URLSearchParams | undefined;
    if (init?.body) body = new URLSearchParams({ ...init.body, ...(token ? { access_token: token } : {}) });
    else if (token) url.searchParams.set("access_token", token);
    let res: Response;
    try {
      res = await this.fetchImpl(url, { method: init?.method ?? (body ? "POST" : "GET"), body, signal: AbortSignal.timeout(30_000) });
    } catch {
      throw new SocialError("TRANSIENT", "Meta injoignable (réseau)");
    }
    const json = (await res.json().catch(() => ({}))) as T & GraphError;
    if (res.ok && !json.error) return json;
    const code = json.error?.code;
    const message = json.error?.message ?? `Erreur Meta ${res.status}`;
    if (code === 190 || code === 102 || res.status === 401) throw new SocialError("AUTH", "Autorisation Meta expirée ou révoquée : reconnectez le compte");
    if (code === 4 || code === 17 || code === 32 || code === 613 || res.status === 429) throw new SocialError("RATE_LIMIT", "Limite de requêtes Meta atteinte");
    if (res.status >= 500 || code === 1 || code === 2) throw new SocialError("TRANSIENT", message);
    throw new SocialError("INVALID", message);
  }

  async exchange(code: string, redirectUri: string): Promise<ConnectedAccount[]> {
    if (!this.isConfigured()) throw new SocialError("NOT_CONFIGURED", "Application Meta non configurée");
    const short = await this.call<{ access_token: string }>(`/oauth/access_token?${new URLSearchParams({ client_id: this.cfg.META_APP_ID!, client_secret: this.cfg.META_APP_SECRET!, redirect_uri: redirectUri, code })}`);
    const long = await this.call<{ access_token: string; expires_in?: number }>(
      `/oauth/access_token?${new URLSearchParams({ grant_type: "fb_exchange_token", client_id: this.cfg.META_APP_ID!, client_secret: this.cfg.META_APP_SECRET!, fb_exchange_token: short.access_token })}`,
    );
    const pages = await this.call<{ data: { id: string; name: string; access_token: string; picture?: { data?: { url?: string } }; instagram_business_account?: { id: string; username?: string; profile_picture_url?: string } }[] }>(
      "/me/accounts?fields=id,name,access_token,picture{url},instagram_business_account{id,username,profile_picture_url}&limit=100",
      undefined,
      long.access_token,
    );
    const accounts: ConnectedAccount[] = [];
    for (const p of pages.data) {
      // Les jetons de Page dérivés d'un jeton utilisateur longue durée n'expirent pas (sauf révocation).
      accounts.push({ provider: "FACEBOOK_PAGE", externalId: p.id, name: p.name, avatarUrl: p.picture?.data?.url ?? null, accessToken: p.access_token, scopes: SCOPES });
      if (p.instagram_business_account) {
        const ig = p.instagram_business_account;
        accounts.push({ provider: "INSTAGRAM_BUSINESS", externalId: ig.id, name: ig.username ? `@${ig.username}` : `${p.name} (Instagram)`, avatarUrl: ig.profile_picture_url ?? null, accessToken: p.access_token, scopes: SCOPES });
      }
    }
    if (!accounts.length) throw new SocialError("INVALID", "Aucune Page Facebook administrée n'a été autorisée");
    return accounts;
  }

  async publish(account: { provider: SocialProvider; externalId: string }, token: string, post: PostPayload): Promise<{ externalId: string; url?: string | null }> {
    if (account.provider === "FACEBOOK_PAGE") {
      const body: Record<string, string> = { message: post.text };
      if (post.link) body.link = post.link;
      const res = await this.call<{ id: string }>(`/${account.externalId}/feed`, { body }, token);
      const [, postId] = res.id.split("_");
      return { externalId: res.id, url: postId ? `https://www.facebook.com/${account.externalId}/posts/${postId}` : null };
    }
    if (account.provider === "INSTAGRAM_BUSINESS") {
      if (!post.imageUrl) throw new SocialError("NEEDS_MEDIA", "Instagram exige un visuel : ajoutez une image au contenu (Creative Studio)");
      const container = await this.call<{ id: string }>(`/${account.externalId}/media`, { body: { image_url: post.imageUrl, caption: post.text } }, token);
      const published = await this.call<{ id: string }>(`/${account.externalId}/media_publish`, { body: { creation_id: container.id } }, token);
      const link = await this.call<{ permalink?: string }>(`/${published.id}?fields=permalink`, undefined, token).catch(() => ({ permalink: undefined }));
      return { externalId: published.id, url: link.permalink ?? null };
    }
    throw new SocialError("INVALID", "Type de compte non pris en charge par Meta");
  }

  async fetchMetrics(account: { provider: SocialProvider; externalId: string }, token: string, postId: string): Promise<MetricsResult> {
    if (account.provider === "INSTAGRAM_BUSINESS") {
      const r = await this.call<{ data: { name: string; values: { value: number }[] }[] }>(`/${postId}/insights?metric=impressions,reach,total_interactions`, undefined, token);
      const v = (n: string) => r.data.find((d) => d.name === n)?.values[0]?.value ?? 0;
      return { impressions: v("impressions"), reach: v("reach"), engagement: v("total_interactions"), clicks: 0, isSimulated: false };
    }
    const r = await this.call<{ data: { name: string; values: { value: number }[] }[] }>(`/${postId}/insights?metric=post_impressions,post_impressions_unique,post_engaged_users,post_clicks`, undefined, token);
    const v = (n: string) => r.data.find((d) => d.name === n)?.values[0]?.value ?? 0;
    return { impressions: v("post_impressions"), reach: v("post_impressions_unique"), engagement: v("post_engaged_users"), clicks: v("post_clicks"), isSimulated: false };
  }

  async fetchRecentPosts(account: { provider: SocialProvider; externalId: string }, token: string, limit: number): Promise<RecentPost[]> {
    if (account.provider === "INSTAGRAM_BUSINESS") {
      const r = await this.call<{ data?: { id: string; caption?: string; timestamp?: string; media_type?: string; media_product_type?: string; permalink?: string; like_count?: number; comments_count?: number }[] }>(
        `/${account.externalId}/media?fields=id,caption,timestamp,media_type,media_product_type,permalink,like_count,comments_count&limit=${limit}`,
        undefined,
        token,
      );
      return (r.data ?? []).map((m) => ({
        externalId: m.id,
        text: m.caption ?? "",
        createdAt: m.timestamp ? new Date(m.timestamp) : null,
        url: m.permalink ?? null,
        format: m.media_product_type === "REELS" ? "reel" : m.media_type === "CAROUSEL_ALBUM" ? "carrousel" : m.media_type === "VIDEO" ? "vidéo" : "photo",
        likes: m.like_count ?? 0,
        comments: m.comments_count ?? 0,
        shares: 0,
        views: null,
      }));
    }
    if (account.provider !== "FACEBOOK_PAGE") throw new SocialError("INVALID", "Type de compte non pris en charge par Meta");
    return this.pagePosts(account.externalId, token, limit);
  }

  /** Identifiant d'une Page à partir de son nom d'utilisateur (ou de son ID) ; null si introuvable avec ce jeton. */
  async resolvePageId(ref: string, token: string): Promise<string | null> {
    try {
      const r = await this.call<{ id?: string }>(`/${encodeURIComponent(ref)}?fields=id`, undefined, token);
      return r.id ?? null;
    } catch (e) {
      if (e instanceof SocialError && e.code === "INVALID") return null;
      throw e;
    }
  }

  /**
   * Compte Instagram professionnel quelconque, lu par son nom d'utilisateur (Business Discovery),
   * via un compte Instagram connecté. Ne fonctionne que pour les comptes professionnels ou créateurs.
   */
  async discoverInstagram(viaIgId: string, token: string, username: string, limit: number): Promise<{ profile: ProfileInfo; posts: RecentPost[] }> {
    const r = await this.call<{
      business_discovery?: { username?: string; name?: string; biography?: string; followers_count?: number; media?: { data?: { id: string; caption?: string; timestamp?: string; media_type?: string; media_product_type?: string; permalink?: string; like_count?: number; comments_count?: number }[] } };
    }>(
      `/${viaIgId}?fields=business_discovery.username(${encodeURIComponent(username)}){username,name,biography,followers_count,media.limit(${limit}){id,caption,timestamp,media_type,media_product_type,permalink,like_count,comments_count}}`,
      undefined,
      token,
    );
    const d = r.business_discovery;
    if (!d) throw new SocialError("INVALID", "Compte Instagram introuvable");
    return {
      profile: { name: d.name || `@${d.username ?? username}`, bio: d.biography ?? null, followers: d.followers_count ?? null },
      posts: (d.media?.data ?? []).map((m) => ({
        externalId: m.id,
        text: m.caption ?? "",
        createdAt: m.timestamp ? new Date(m.timestamp) : null,
        url: m.permalink ?? null,
        format: m.media_product_type === "REELS" ? "reel" : m.media_type === "CAROUSEL_ALBUM" ? "carrousel" : m.media_type === "VIDEO" ? "vidéo" : "photo",
        likes: m.like_count ?? 0,
        comments: m.comments_count ?? 0,
        shares: 0,
        views: null,
      })),
    };
  }

  private async pagePosts(pageId: string, token: string, limit: number): Promise<RecentPost[]> {
    const r = await this.call<{
      data?: { id: string; message?: string; created_time?: string; permalink_url?: string; attachments?: { data?: { media_type?: string }[] }; shares?: { count?: number }; reactions?: { summary?: { total_count?: number } }; comments?: { summary?: { total_count?: number } } }[];
    }>(
      `/${pageId}/posts?fields=id,message,created_time,permalink_url,attachments{media_type},shares,reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0)&limit=${limit}`,
      undefined,
      token,
    );
    const formats: Record<string, string> = { photo: "photo", video: "vidéo", album: "carrousel", link: "lien" };
    return (r.data ?? []).map((p) => ({
      externalId: p.id,
      text: p.message ?? "",
      createdAt: p.created_time ? new Date(p.created_time) : null,
      url: p.permalink_url ?? null,
      format: formats[p.attachments?.data?.[0]?.media_type ?? ""] ?? "texte",
      likes: p.reactions?.summary?.total_count ?? 0,
      comments: p.comments?.summary?.total_count ?? 0,
      shares: p.shares?.count ?? 0,
      views: null,
    }));
  }
}
