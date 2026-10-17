import { loadConfig } from "../../config.js";
import type { SocialProvider } from "@prisma/client";
import { SocialError, type ConnectedAccount, type MetricsResult, type PostPayload, type ProfileInfo, type RecentPost, type RefreshedToken, type SocialProviderAdapter } from "./types.js";

/** Envoi de vidéos + lecture de la chaîne et des statistiques. */
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"];
const API = "https://www.googleapis.com/youtube/v3";

interface GoogleError {
  error?: { code?: number; message?: string; errors?: { reason?: string }[] } | string;
  error_description?: string;
}

/** Titre YouTube : première ligne du texte, 100 caractères maximum, sans chevrons (refusés par l'API). */
export function youtubeTitle(text: string): string {
  const clean = (s: string) => s.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  const first = clean(text.split("\n").find((l) => l.trim()) ?? "") || "Nouvelle vidéo";
  return first.length > 100 ? `${first.slice(0, 99).trimEnd()}…` : first;
}

/**
 * Adaptateur YouTube (Data API v3). Envoie la vidéo du Video Studio sur la chaîne de l'utilisateur
 * (format vertical court → Short). Visibilité réglée par YOUTUBE_PRIVACY : « private » tant que le projet
 * Google n'a pas passé l'audit YouTube (l'API force de toute façon le privé avant l'audit).
 * Identifiant externe d'un compte = ID de chaîne ; d'une publication = ID de vidéo.
 */
export class YouTubeAdapter implements SocialProviderAdapter {
  readonly key = "youtube";
  readonly providers = ["YOUTUBE"] as const;

  constructor(private readonly fetchImpl: typeof fetch = fetch) {}

  private get cfg() {
    return loadConfig();
  }

  isConfigured() {
    return !!(this.cfg.GOOGLE_CLIENT_ID && this.cfg.GOOGLE_CLIENT_SECRET);
  }

  authorizeUrl(state: string, redirectUri: string) {
    const q = new URLSearchParams({
      client_id: this.cfg.GOOGLE_CLIENT_ID ?? "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPES.join(" "),
      // Jeton de rafraîchissement : nécessaire car le jeton d'accès Google expire en 1 h.
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  }

  private async send(url: string, init: RequestInit, timeoutMs = 60_000): Promise<Response> {
    try {
      return await this.fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      throw new SocialError("TRANSIENT", "YouTube injoignable (réseau)");
    }
  }

  /** Traduit une réponse d'erreur Google en erreur de la file de publication. */
  private async fail(res: Response): Promise<never> {
    const body = (await res.json().catch(() => ({}))) as GoogleError;
    const err = typeof body.error === "object" ? body.error : undefined;
    const reason = err?.errors?.[0]?.reason ?? (typeof body.error === "string" ? body.error : undefined);
    const message = err?.message ?? body.error_description ?? `Erreur YouTube ${res.status}`;
    if (res.status === 401 || reason === "invalid_grant" || reason === "authError") {
      throw new SocialError("AUTH", "Autorisation YouTube expirée ou révoquée : reconnectez la chaîne");
    }
    if (res.status === 429 || reason === "quotaExceeded" || reason === "rateLimitExceeded" || reason === "uploadLimitExceeded" || reason === "userRateLimitExceeded") {
      throw new SocialError("RATE_LIMIT", "Limite d'envoi YouTube atteinte (quota du jour)");
    }
    if (res.status >= 500) throw new SocialError("TRANSIENT", message);
    throw new SocialError("INVALID", message);
  }

  private async get<T>(path: string, token: string): Promise<T> {
    const res = await this.send(`${API}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
    if (!res.ok) await this.fail(res);
    return (await res.json()) as T;
  }

  private async token(form: Record<string, string>) {
    if (!this.isConfigured()) throw new SocialError("NOT_CONFIGURED", "Application Google non configurée");
    const res = await this.send("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: this.cfg.GOOGLE_CLIENT_ID!, client_secret: this.cfg.GOOGLE_CLIENT_SECRET!, ...form }),
    });
    if (!res.ok) await this.fail(res);
    return (await res.json()) as { access_token: string; expires_in?: number; refresh_token?: string; scope?: string };
  }

  async exchange(code: string, redirectUri: string): Promise<ConnectedAccount[]> {
    const t = await this.token({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
    const { items } = await this.get<{ items?: { id: string; snippet?: { title?: string; thumbnails?: { default?: { url?: string } } } }[] }>("/channels?part=snippet&mine=true", t.access_token);
    const base = {
      provider: "YOUTUBE" as const,
      accessToken: t.access_token,
      refreshToken: t.refresh_token ?? null,
      expiresAt: t.expires_in ? new Date(Date.now() + t.expires_in * 1000) : null,
      scopes: (t.scope ?? SCOPES.join(" ")).split(" ").filter(Boolean),
    };
    // Un compte Google sans chaîne renvoie une liste vide : l'interface affiche alors « aucun compte trouvé ».
    return (items ?? []).map((c) => ({ ...base, externalId: c.id, name: `${c.snippet?.title ?? "Chaîne YouTube"} (YouTube)`, avatarUrl: c.snippet?.thumbnails?.default?.url ?? null }));
  }

  async refresh(refreshToken: string): Promise<RefreshedToken> {
    const t = await this.token({ grant_type: "refresh_token", refresh_token: refreshToken });
    return { accessToken: t.access_token, refreshToken: t.refresh_token ?? refreshToken, expiresAt: t.expires_in ? new Date(Date.now() + t.expires_in * 1000) : null };
  }

  async publish(account: { provider: SocialProvider; externalId: string }, token: string, post: PostPayload): Promise<{ externalId: string; url?: string | null }> {
    if (account.provider !== "YOUTUBE") throw new SocialError("INVALID", "Type de compte non pris en charge par YouTube");
    const video = post.loadVideo ? await post.loadVideo() : null;
    if (!video?.length) throw new SocialError("NEEDS_MEDIA", "YouTube n'accepte que des vidéos : associez une vidéo terminée du Video Studio à ce contenu");
    const description = (post.link && !post.text.includes(post.link) ? `${post.text}\n\n${post.link}` : post.text).replace(/[<>]/g, "").slice(0, 5000);
    // Envoi en deux temps (« resumable ») : ouverture de la session avec les métadonnées, puis envoi du fichier.
    const start = await this.send(`https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=UTF-8", "x-upload-content-length": String(video.length), "x-upload-content-type": "video/mp4" },
      body: JSON.stringify({
        snippet: { title: youtubeTitle(post.text), description, categoryId: "22" },
        status: { privacyStatus: this.cfg.YOUTUBE_PRIVACY, selfDeclaredMadeForKids: false },
      }),
    });
    if (!start.ok) await this.fail(start);
    const session = start.headers.get("location");
    if (!session) throw new SocialError("TRANSIENT", "YouTube n'a pas ouvert l'envoi de la vidéo");
    const up = await this.send(session, { method: "PUT", headers: { "content-type": "video/mp4", "content-length": String(video.length) }, body: new Uint8Array(video) }, 300_000);
    if (!up.ok) await this.fail(up);
    const { id } = (await up.json()) as { id?: string };
    if (!id) throw new SocialError("TRANSIENT", "YouTube n'a pas renvoyé l'identifiant de la vidéo");
    return { externalId: id, url: `https://youtu.be/${id}` };
  }

  async fetchMetrics(_account: { provider: SocialProvider; externalId: string }, token: string, videoId: string): Promise<MetricsResult> {
    const { items } = await this.get<{ items?: { statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }[] }>(`/videos?part=statistics&id=${encodeURIComponent(videoId)}`, token);
    const s = items?.[0]?.statistics ?? {};
    const views = Number(s.viewCount ?? 0);
    return { impressions: views, reach: views, engagement: Number(s.likeCount ?? 0) + Number(s.commentCount ?? 0), clicks: 0, isSimulated: false };
  }

  async fetchRecentPosts(account: { provider: SocialProvider; externalId: string }, token: string, limit: number): Promise<RecentPost[]> {
    return (await this.fetchChannel({ id: account.externalId }, { token }, limit))?.posts ?? [];
  }

  /**
   * Chaîne publique quelconque (par @pseudo, ID ou ancien nom d'utilisateur) et ses dernières vidéos.
   * Fonctionne avec le jeton d'une chaîne connectée ou avec une clé d'API YouTube.
   */
  async fetchChannel(ref: { handle?: string; id?: string; username?: string }, auth: { token?: string; apiKey?: string }, limit: number): Promise<{ channelId: string; profile: ProfileInfo; posts: RecentPost[] } | null> {
    const q = (path: string) => (auth.token ? path : `${path}&key=${encodeURIComponent(auth.apiKey ?? "")}`);
    const get = <T>(path: string) => this.get<T>(q(path), auth.token ?? "");
    const by = ref.id ? `id=${encodeURIComponent(ref.id)}` : ref.handle ? `forHandle=${encodeURIComponent(ref.handle.startsWith("@") ? ref.handle : `@${ref.handle}`)}` : `forUsername=${encodeURIComponent(ref.username ?? "")}`;
    const { items: channels } = await get<{ items?: { id: string; snippet?: { title?: string; description?: string }; statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean }; contentDetails?: { relatedPlaylists?: { uploads?: string } } }[] }>(
      `/channels?part=snippet,statistics,contentDetails&${by}`,
    );
    const c = channels?.[0];
    if (!c) return null;
    const profile = { name: c.snippet?.title ?? "Chaîne YouTube", bio: c.snippet?.description || null, followers: c.statistics?.hiddenSubscriberCount ? null : c.statistics?.subscriberCount ? Number(c.statistics.subscriberCount) : null };
    const uploads = c.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return { channelId: c.id, profile, posts: [] };
    // Les vidéos d'une chaîne sont rangées dans sa playlist « uploads ».
    const { items: entries } = await get<{ items?: { contentDetails?: { videoId?: string } }[] }>(`/playlistItems?part=contentDetails&maxResults=${Math.min(50, limit)}&playlistId=${encodeURIComponent(uploads)}`);
    const ids = (entries ?? []).map((e) => e.contentDetails?.videoId).filter((x): x is string => !!x);
    if (!ids.length) return { channelId: c.id, profile, posts: [] };
    const { items: videos } = await get<{ items?: { id: string; snippet?: { title?: string; description?: string; publishedAt?: string }; statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }[] }>(
      `/videos?part=snippet,statistics&id=${ids.map(encodeURIComponent).join(",")}`,
    );
    return {
      channelId: c.id,
      profile,
      posts: (videos ?? []).map((v) => ({
        externalId: v.id,
        text: [v.snippet?.title, v.snippet?.description].filter(Boolean).join("\n"),
        createdAt: v.snippet?.publishedAt ? new Date(v.snippet.publishedAt) : null,
        url: `https://youtu.be/${v.id}`,
        format: "vidéo",
        likes: Number(v.statistics?.likeCount ?? 0),
        comments: Number(v.statistics?.commentCount ?? 0),
        shares: 0,
        views: Number(v.statistics?.viewCount ?? 0),
      })),
    };
  }

  async revoke(token: string): Promise<void> {
    await this.send("https://oauth2.googleapis.com/revoke", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token }) });
  }
}
