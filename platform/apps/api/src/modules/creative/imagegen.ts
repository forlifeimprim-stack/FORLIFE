import type { CreativeFormat } from "@forlife/shared";
import { loadConfig } from "../../config.js";
import type { Image } from "./composer.js";

/** Rapport largeur/hauteur demandé au générateur, au plus près de chaque format de visuel. */
const ASPECT: Record<CreativeFormat, string> = { SQUARE: "1:1", PORTRAIT: "3:4", STORY: "9:16", LANDSCAPE: "16:9" };

/** Consignes ajoutées à chaque demande : une photo crédible, sans texte (le texte est composé par le moteur). */
const STYLE = "Photorealistic, natural light, authentic West African setting, no text, no letters, no logo, no watermark, plenty of calm space for a headline.";

export interface ImageGenerator {
  readonly provider: string;
  readonly model: string;
  generate(prompt: string, format: CreativeFormat): Promise<Image>;
}

/**
 * Imagen sur Vertex AI, authentifié par le compte de service de Cloud Run (aucune clé).
 * Prérequis : API Vertex AI activée et rôle « Utilisateur Vertex AI » donné au compte de service.
 */
class VertexImagen implements ImageGenerator {
  readonly provider = "vertex-imagen";
  private token: { value: string; until: number } | null = null;
  private project: string | null = null;

  get model() {
    return loadConfig().IMAGE_MODEL;
  }

  private async metadata(path: string): Promise<Response> {
    const res = await fetch(`http://metadata.google.internal/computeMetadata/v1/${path}`, { headers: { "Metadata-Flavor": "Google" }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Serveur de métadonnées Google indisponible (${res.status})`);
    return res;
  }

  private async auth(): Promise<{ token: string; project: string }> {
    if (!this.token || this.token.until <= Date.now()) {
      const t = (await (await this.metadata("instance/service-accounts/default/token")).json()) as { access_token: string; expires_in: number };
      this.token = { value: t.access_token, until: Date.now() + (t.expires_in - 60) * 1000 };
    }
    this.project ??= loadConfig().GOOGLE_CLOUD_PROJECT ?? (await (await this.metadata("project/project-id")).text());
    return { token: this.token.value, project: this.project };
  }

  async generate(prompt: string, format: CreativeFormat): Promise<Image> {
    const { token, project } = await this.auth();
    const loc = loadConfig().VERTEX_LOCATION;
    const res = await fetch(`https://${loc}-aiplatform.googleapis.com/v1/projects/${project}/locations/${loc}/publishers/google/models/${this.model}:predict`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: `${prompt.slice(0, 600)}. ${STYLE}` }],
        parameters: { sampleCount: 1, aspectRatio: ASPECT[format], personGeneration: "allow_adult", safetySetting: "block_medium_and_above", outputOptions: { mimeType: "image/jpeg", compressionQuality: 88 } },
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) {
      const detail = res.status === 403 ? "autorisation refusée : activez Vertex AI et donnez le rôle « Utilisateur Vertex AI » au compte de service" : `erreur ${res.status}`;
      throw new Error(`Génération d'image impossible (${detail})`);
    }
    const body = (await res.json()) as { predictions?: { bytesBase64Encoded?: string; mimeType?: string }[] };
    const p = body.predictions?.[0];
    // Aucune image : demande filtrée par la sécurité du générateur.
    if (!p?.bytesBase64Encoded) throw new Error("Image refusée par le filtre de sécurité du générateur : reformulez le brief");
    return { mime: p.mimeType ?? "image/jpeg", data: Buffer.from(p.bytesBase64Encoded, "base64") };
  }
}

let override: ImageGenerator | null | undefined;
let cached: VertexImagen | undefined;

/** Réservé aux tests : générateur simulé. */
export function setImageGenerator(g: ImageGenerator | null | undefined) {
  override = g;
}

export function getImageGenerator(): ImageGenerator | null {
  if (override !== undefined) return override;
  return loadConfig().IMAGE_PROVIDER === "vertex" ? (cached ??= new VertexImagen()) : null;
}
