import { loadConfig } from "../../config.js";
import type { SocialProvider } from "@prisma/client";
import { SocialError, type ConnectedAccount, type MetricsResult, type PostPayload, type RefreshedToken, type SocialProviderAdapter } from "./types.js";

/** Login Kit (profil) + Content Posting API en mode brouillon (video.upload) + statistiques (video.list). */
const SCOPES = ["user.info.basic", "video.upload", "video.list"];
const API = "https://open.tiktokapis.com/v2";
/** TikTok accepte un envoi en un seul morceau jusqu'à 64 Mo ; au-delà, morceaux de 10 Mo (le dernier absorbe le reste). */
const SINGLE_CHUNK_MAX = 64 * 1024 * 1024;
const CHUNK = 10 * 1024 * 1024;

interface TikTokEnvelope<T> {
  data?: T;
  error?: { code?: string; message?: string; log_id?: string };
}
interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

/**
 * Adaptateur TikTok. La vidéo validée est envoyée dans les brouillons (boîte de réception) du compte :
 * l'utilisateur la finalise et la publie depuis l'application TikTok. Le jeton d'accès expire en 24 h :
 * il est renouvelé automatiquement avec le jeton de rafraîchissement (valable un an).
 * Identifiant externe d'un compte = open_id ; d'une publication = publish_id.
 */
export class TikTokAdapter implements SocialProviderAdapter {
  readonly key = "tiktok";
  readonly providers = ["TIKTOK"] as const;

  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  private get cfg() {
    return loadConfig();
  }

  isConfigured() {
    return !!(this.cfg.TIKTOK_CLIENT_KEY && this.cfg.TIKTOK_CLIENT_SECRET);
  }

  authorizeUrl(state: string, redirectUri: string) {
    const q = new URLSearchParams({ client_key: this.cfg.TIKTOK_CLIENT_KEY ?? "", response_type: "code", scope: SCOPES.join(","), redirect_uri: redirectUri, state });
    return `https://www.tiktok.com/v2/auth/authorize/?${q}`;
  }

  private async send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await this.fetchImpl(url, { ...init, signal: AbortSignal.timeout(60_000) });
    } catch {
      throw new SocialError("TRANSIENT", "TikTok injoignable (réseau)");
    }
  }

  /** Traduit une erreur TikTok (statut HTTP + code applicatif) en erreur de la file de publication. */
  private fail(status: number, code: string | undefined, message: string): never {
    if (status === 401 || code === "access_token_invalid" || code === "invalid_grant" || code === "scope_not_authorized") {
      throw new SocialError("AUTH", "Autorisation TikTok expirée ou révoquée : reconnectez le compte");
    }
    if (status === 429 || code === "rate_limit_exceeded" || code === "spam_risk_too_many_pending_share") {
      throw new SocialError("RATE_LIMIT", code === "spam_risk_too_many_pending_share" ? "Trop de vidéos en attente dans les brouillons TikTok : publiez-en depuis l'application" : "Limite de requêtes TikTok atteinte");
    }
    if (status >= 500 || code === "internal_error") throw new SocialError("TRANSIENT", message);
    throw new SocialError("INVALID", message);
  }

  /** Appel à l'API v2 (enveloppe { data, error }). */
  private async call<T>(path: string, token: string, json?: unknown): Promise<T> {
    const res = await this.send(`${API}${path}`, {
      method: json === undefined ? "GET" : "POST",
      headers: { authorization: `Bearer ${token}`, ...(json === undefined ? {} : { "content-type": "application/json; charset=UTF-8" }) },
      body: json === undefined ? undefined : JSON.stringify(json),
    });
    const body = (await res.json().catch(() => ({}))) as TikTokEnvelope<T>;
    const code = body.error?.code;
    if (res.ok && (!code || code === "ok")) return (body.data ?? {}) as T;
    this.fail(res.status, code, body.error?.message || `Erreur TikTok ${res.status}`);
  }

  /** Point d'accès OAuth (échange du code ou rafraîchissement). */
  private async token(form: Record<string, string>): Promise<Required<Pick<TokenResponse, "access_token">> & TokenResponse> {
    if (!this.isConfigured()) throw new SocialError("NOT_CONFIGURED", "Application TikTok non configurée");
    const res = await this.send(`${API}/oauth/token/`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_key: this.cfg.TIKTOK_CLIENT_KEY!, client_secret: this.cfg.TIKTOK_CLIENT_SECRET!, ...form }),
    });
    const body = (await res.json().catch(() => ({}))) as TokenResponse;
    if (res.ok && body.access_token) return body as Required<Pick<TokenResponse, "access_token">> & TokenResponse;
    this.fail(res.status === 200 ? 400 : res.status, body.error, body.error_description || "TikTok a refusé l'autorisation");
  }

  async exchange(code: string, redirectUri: string): Promise<ConnectedAccount[]> {
    const t = await this.token({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
    const { user } = await this.call<{ user?: { open_id?: string; display_name?: string; avatar_url?: string } }>("/user/info/?fields=open_id,display_name,avatar_url", t.access_token);
    const openId = user?.open_id ?? t.open_id;
    if (!openId) throw new SocialError("INVALID", "TikTok n'a pas renvoyé l'identifiant du compte");
    return [
      {
        provider: "TIKTOK",
        externalId: openId,
        name: user?.display_name ? `${user.display_name} (TikTok)` : "Compte TikTok",
        avatarUrl: user?.avatar_url ?? null,
        accessToken: t.access_token,
        refreshToken: t.refresh_token ?? null,
        expiresAt: t.expires_in ? new Date(Date.now() + t.expires_in * 1000) : null,
        scopes: (t.scope ?? SCOPES.join(",")).split(/[ ,]+/).filter(Boolean),
      },
    ];
  }

  async refresh(refreshToken: string): Promise<RefreshedToken> {
    const t = await this.token({ grant_type: "refresh_token", refresh_token: refreshToken });
    return { accessToken: t.access_token, refreshToken: t.refresh_token ?? refreshToken, expiresAt: t.expires_in ? new Date(Date.now() + t.expires_in * 1000) : null };
  }

  async publish(account: { provider: SocialProvider; externalId: string }, token: string, post: PostPayload): Promise<{ externalId: string; url?: string | null }> {
    if (account.provider !== "TIKTOK") throw new SocialError("INVALID", "Type de compte non pris en charge par TikTok");
    const video = post.loadVideo ? await post.loadVideo() : null;
    if (!video?.length) throw new SocialError("NEEDS_MEDIA", "TikTok n'accepte que des vidéos : associez une vidéo terminée du Video Studio à ce contenu");
    const size = video.length;
    const chunkSize = size <= SINGLE_CHUNK_MAX ? size : CHUNK;
    const total = size <= SINGLE_CHUNK_MAX ? 1 : Math.floor(size / CHUNK);
    const init = await this.call<{ publish_id?: string; upload_url?: string }>("/post/publish/inbox/video/init/", token, {
      source_info: { source: "FILE_UPLOAD", video_size: size, chunk_size: chunkSize, total_chunk_count: total },
    });
    if (!init.publish_id || !init.upload_url) throw new SocialError("TRANSIENT", "TikTok n'a pas ouvert l'envoi de la vidéo");
    for (let i = 0; i < total; i++) {
      const start = i * chunkSize;
      const end = i === total - 1 ? size : start + chunkSize;
      const res = await this.send(init.upload_url, {
        method: "PUT",
        headers: { "content-type": "video/mp4", "content-length": String(end - start), "content-range": `bytes ${start}-${end - 1}/${size}` },
        body: new Uint8Array(video.subarray(start, end)),
      });
      if (!res.ok) this.fail(res.status, undefined, `Envoi de la vidéo refusé par TikTok (${res.status})`);
    }
    // Pas d'URL publique : la vidéo attend dans les brouillons TikTok du compte.
    return { externalId: init.publish_id, url: null };
  }

  async fetchMetrics(_account: { provider: SocialProvider; externalId: string }, token: string, publishId: string): Promise<MetricsResult> {
    const empty = { impressions: 0, reach: 0, engagement: 0, clicks: 0, isSimulated: false };
    const status = await this.call<{ status?: string; publicaly_available_post_id?: (string | number)[] }>("/post/publish/status/fetch/", token, { publish_id: publishId });
    const videoId = status.publicaly_available_post_id?.[0];
    // Tant que l'utilisateur n'a pas publié le brouillon, il n'y a rien à mesurer.
    if (videoId === undefined) return empty;
    const { videos } = await this.call<{ videos?: { view_count?: number; like_count?: number; comment_count?: number; share_count?: number }[] }>(
      "/video/query/?fields=id,view_count,like_count,comment_count,share_count",
      token,
      { filters: { video_ids: [String(videoId)] } },
    );
    const v = videos?.[0];
    if (!v) return empty;
    const views = v.view_count ?? 0;
    return { impressions: views, reach: views, engagement: (v.like_count ?? 0) + (v.comment_count ?? 0) + (v.share_count ?? 0), clicks: 0, isSimulated: false };
  }
}
