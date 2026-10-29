import { loadConfig } from "../../config.js";

export const VOICES = ["NONE", "FEMALE", "MALE"] as const;
export type Voice = (typeof VOICES)[number];

/** Voix françaises naturelles (Google Cloud Text-to-Speech, gamme Neural2). */
const GOOGLE_VOICES: Record<Exclude<Voice, "NONE">, string> = { FEMALE: "fr-FR-Neural2-A", MALE: "fr-FR-Neural2-B" };

/** Débit moyen d'une voix française à vitesse normale (caractères par seconde), pour caler la voix sur la scène. */
const CHARS_PER_SECOND = 14;

export interface Synthesizer {
  /** Audio MP3 de la phrase, ou null si la voix off n'est pas disponible. */
  synthesize(text: string, voice: Exclude<Voice, "NONE">, maxSeconds: number): Promise<Buffer | null>;
}

/** Vitesse de lecture pour que la phrase tienne dans la scène (bornée pour rester naturelle). */
export function speakingRate(text: string, maxSeconds: number): number {
  const natural = text.length / CHARS_PER_SECOND;
  return Math.round(Math.min(1.45, Math.max(1, natural / Math.max(0.8, maxSeconds - 0.25))) * 100) / 100;
}

/**
 * Google Cloud Text-to-Speech, authentifié par le compte de service de Cloud Run (serveur de métadonnées) :
 * aucune clé à gérer. L'API « Cloud Text-to-Speech » doit être activée dans le projet.
 */
class GoogleTts implements Synthesizer {
  private token: { value: string; until: number } | null = null;

  private async accessToken(): Promise<string> {
    if (this.token && this.token.until > Date.now()) return this.token.value;
    const res = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", { headers: { "Metadata-Flavor": "Google" }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Jeton Google indisponible (${res.status})`);
    const t = (await res.json()) as { access_token: string; expires_in: number };
    this.token = { value: t.access_token, until: Date.now() + (t.expires_in - 60) * 1000 };
    return t.access_token;
  }

  async synthesize(text: string, voice: Exclude<Voice, "NONE">, maxSeconds: number): Promise<Buffer | null> {
    const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: { authorization: `Bearer ${await this.accessToken()}`, "content-type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: "fr-FR", name: GOOGLE_VOICES[voice] },
        audioConfig: { audioEncoding: "MP3", speakingRate: speakingRate(text, maxSeconds), sampleRateHertz: 44100 },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`Synthèse vocale refusée (${res.status}) : vérifiez que l'API Cloud Text-to-Speech est activée`);
    const { audioContent } = (await res.json()) as { audioContent?: string };
    return audioContent ? Buffer.from(audioContent, "base64") : null;
  }
}

let override: Synthesizer | null | undefined;

/** Réservé aux tests : synthétiseur simulé. */
export function setSynthesizer(s: Synthesizer | null | undefined) {
  override = s;
}

export function getSynthesizer(): Synthesizer | null {
  if (override !== undefined) return override;
  return loadConfig().TTS_PROVIDER === "google" ? (cached ??= new GoogleTts()) : null;
}
let cached: GoogleTts | undefined;
