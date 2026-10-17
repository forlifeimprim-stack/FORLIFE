import type { SocialProvider } from "@prisma/client";

export interface ConnectedAccount {
  provider: SocialProvider;
  externalId: string;
  name: string;
  avatarUrl?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scopes: string[];
}

export interface PostPayload {
  text: string;
  link?: string | null;
  /** URL publique d'un visuel (obligatoire pour Instagram). */
  imageUrl?: string | null;
  /** Vidéo terminée associée au contenu (chargée seulement par les réseaux vidéo, comme TikTok). */
  loadVideo?: () => Promise<Buffer | null>;
}

export interface RefreshedToken {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
}

export interface MetricsResult {
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  isSimulated: boolean;
}

/** Publication déjà présente sur un compte connecté (lue pour l'analyse des réseaux). */
export interface RecentPost {
  externalId: string;
  text: string;
  createdAt: Date | null;
  url: string | null;
  /** Format lisible : texte, photo, vidéo, reel, carrousel, short… */
  format: string;
  likes: number;
  comments: number;
  shares: number;
  /** Vues (vidéos) ; null quand le réseau ne les fournit pas sans droits supplémentaires. */
  views: number | null;
}

/** Profil public lu à partir du lien d'une page. */
export interface ProfileInfo {
  name: string;
  bio: string | null;
  followers: number | null;
}

export type SocialErrorCode = "AUTH" | "RATE_LIMIT" | "TRANSIENT" | "INVALID" | "NEEDS_MEDIA" | "NOT_CONFIGURED";

export class SocialError extends Error {
  constructor(
    public readonly code: SocialErrorCode,
    message: string,
  ) {
    super(message);
  }
  /** Seules les erreurs transitoires sont réessayées (§5.4). */
  get retryable(): boolean {
    return this.code === "TRANSIENT" || this.code === "RATE_LIMIT";
  }
}

/** Contrat connecteur (spécification §5.1) : le domaine ne dépend jamais d'une API externe. */
export interface SocialProviderAdapter {
  readonly key: string;
  readonly providers: readonly SocialProvider[];
  isConfigured(): boolean;
  authorizeUrl(state: string, redirectUri: string, options?: { network?: string }): string;
  exchange(code: string, redirectUri: string): Promise<ConnectedAccount[]>;
  publish(account: { provider: SocialProvider; externalId: string }, accessToken: string, post: PostPayload, idempotencyKey: string): Promise<{ externalId: string; url?: string | null }>;
  /** Renouvelle un jeton d'accès de courte durée (réseaux dont le jeton expire vite, comme TikTok). */
  refresh?(refreshToken: string): Promise<RefreshedToken>;
  fetchMetrics(account: { provider: SocialProvider; externalId: string }, accessToken: string, externalPostId: string): Promise<MetricsResult>;
  /** Dernières publications du compte, plus récentes d'abord (absent : réseau non lisible avec les droits actuels). */
  fetchRecentPosts?(account: { provider: SocialProvider; externalId: string }, accessToken: string, limit: number): Promise<RecentPost[]>;
}
