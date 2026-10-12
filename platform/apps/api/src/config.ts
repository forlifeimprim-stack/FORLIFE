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
  STORAGE_DRIVER: z.enum(["local"]).default("local"),
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
  /** Emails promus administrateurs de la plateforme à la connexion (séparés par des virgules). */
  PLATFORM_ADMIN_EMAILS: z
    .string()
    .default("")
    .transform((v) => v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)),
  EMAIL_DRIVER: z.enum(["log", "resend"]).default("log"),
  EMAIL_FROM: z.string().default("Forlife Com <no-reply@forlifecom.ci>"),
  RESEND_API_KEY: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

let cached: Config | undefined;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  if (!cached) {
    const parsed = schema.safeParse(env);
    if (!parsed.success) {
      throw new Error(`Configuration invalide :\n${z.prettifyError(parsed.error)}`);
    }
    cached = parsed.data;
  }
  return cached;
}

/** Réservé aux tests. */
export function resetConfigCache(): void {
  cached = undefined;
}
