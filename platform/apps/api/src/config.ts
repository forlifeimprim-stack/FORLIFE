import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET doit contenir au moins 32 caractères"),
  ENCRYPTION_KEY: z.string().refine((v) => Buffer.from(v, "base64").length === 32, "ENCRYPTION_KEY doit faire 32 octets (base64)"),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  RUN_WORKER_INLINE: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  STORAGE_DRIVER: z.enum(["local", "gcs"]).default("local"),
  GCS_BUCKET: z.string().optional(),
  STORAGE_LOCAL_DIR: z.string().default("./storage"),
  AI_PROVIDERS: z
    .string()
    .default("mock")
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-opus-5-5"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(15 * 60),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  MAX_UPLOAD_BYTES: z.coerce.number().default(15 * 1024 * 1024),
  /** URL publique de l'interface (liens dans les emails). */
  APP_URL: z.string().default("http://localhost:5173"),
  /**
   * Emails autorisés à administrer la plateforme (séparés par des virgules). L'email seul ne suffit pas :
   * l'activation du back-office exige aussi ADMIN_BOOTSTRAP_TOKEN (code connu du seul propriétaire).
   * Retirer un email de la liste coupe immédiatement son accès.
   */
  PLATFORM_ADMIN_EMAILS: z
    .string()
    .default("")
    .transform((v) => v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)),
  ADMIN_BOOTSTRAP_TOKEN: z.string().min(16).optional(),
  EMAIL_DRIVER: z.enum(["log", "resend"]).default("log"),
  EMAIL_FROM: z.string().default("Forlife Com <no-reply@forlifecom.ci>"),
  RESEND_API_KEY: z.string().optional(),
  /** URL publique de l'API (callbacks OAuth). */
  API_PUBLIC_URL: z.string().default("http://localhost:4000"),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_GRAPH_VERSION: z.string().default("v21.0"),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  /** Version mensuelle de l'API LinkedIn (AAAAMM) ; LinkedIn retire les versions après environ un an. */
  LINKEDIN_API_VERSION: z.string().regex(/^\d{6}$/).default("202608"),
  /** Pages entreprise : à activer seulement après validation de la Community Management API. */
  LINKEDIN_ORG_SCOPES: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  /** TikTok for Developers : Client key (publique) et Client secret (Secret Manager). */
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  /** Google Cloud (YouTube Data API) : ID client OAuth (public) et code secret (Secret Manager). */
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  /** Visibilité des vidéos envoyées : « private » tant que l'audit YouTube n'est pas obtenu, puis « public ». */
  /** Clé d'API YouTube (facultative) : lecture des chaînes publiques sans compte YouTube connecté. */
  YOUTUBE_API_KEY: z.string().optional(),
  /** Voix off du Video Studio : « google » = Cloud Text-to-Speech (compte de service), « none » = désactivée. */
  TTS_PROVIDER: z.enum(["none", "google"]).default("none"),
  YOUTUBE_PRIVACY: z.enum(["private", "unlisted", "public"]).default("private"),
  /** Binaire FFmpeg utilisé par le Video Studio. */
  FFMPEG_PATH: z.string().default("ffmpeg"),
  /** Compte de démonstration (publication simulée). Désactiver en production si non souhaité. */
  SOCIAL_SANDBOX_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
  /** Paiements : CinetPay (Orange Money, MTN MoMo, Moov, Wave, carte). Sans clés, seul le mode démo est proposé. */
  CINETPAY_API_KEY: z.string().optional(),
  CINETPAY_SITE_ID: z.string().optional(),
  CINETPAY_API_URL: z.string().url().default("https://api-checkout.cinetpay.com/v2"),
  /** Paiement de démonstration (aucun argent réel). À désactiver en production. */
  PAYMENT_SANDBOX_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v === "true"),
});

export type Config = z.infer<typeof schema>;

let cached: Config | undefined;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  if (!cached) {
    const parsed = schema.safeParse(env);
    if (!parsed.success) {
      throw new Error(`Configuration invalide :\n${z.prettifyError(parsed.error)}`);
    }
    if (parsed.data.NODE_ENV === "production") assertProductionSecrets(parsed.data);
    cached = parsed.data;
    // Sécurité : en production, le paiement de démonstration (qui active des plans sans argent réel) est coupé sauf activation explicite.
    if (cached.NODE_ENV === "production" && env.PAYMENT_SANDBOX_ENABLED === undefined) cached.PAYMENT_SANDBOX_ENABLED = false;
  }
  return cached;
}

/** Réservé aux tests. */
export function resetConfigCache(): void {
  cached = undefined;
}

const EXAMPLE_JWT_SECRET = "change-me-dev-only-secret-at-least-32-chars";
const EXAMPLE_ENCRYPTION_KEY = "ZGV2LW9ubHktZW5jcnlwdGlvbi1rZXktMzItYnl0ZXM=";

/** Refuse de démarrer en production avec des secrets d'exemple ou trop faibles. */
function assertProductionSecrets(c: Config) {
  const problems: string[] = [];
  if (c.JWT_SECRET === EXAMPLE_JWT_SECRET || /change-me|dev-only|test-secret/i.test(c.JWT_SECRET) || c.JWT_SECRET.length < 43) {
    problems.push("JWT_SECRET est une valeur d'exemple ou trop courte (générer : openssl rand -base64 48)");
  }
  if (c.ENCRYPTION_KEY === EXAMPLE_ENCRYPTION_KEY) problems.push("ENCRYPTION_KEY est la valeur d'exemple (générer : openssl rand -base64 32)");
  if (c.ADMIN_BOOTSTRAP_TOKEN && c.ADMIN_BOOTSTRAP_TOKEN.length < 24) problems.push("ADMIN_BOOTSTRAP_TOKEN doit faire au moins 24 caractères");
  if (problems.length) throw new Error(`Configuration de production refusée :\n- ${problems.join("\n- ")}`);
}
