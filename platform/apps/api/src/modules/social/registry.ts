import type { SocialProvider } from "@prisma/client";
import { MetaAdapter } from "./meta.js";
import { LinkedInAdapter } from "./linkedin.js";
import { TikTokAdapter } from "./tiktok.js";
import { YouTubeAdapter } from "./youtube.js";
import { SandboxAdapter } from "./sandbox.js";
import type { SocialProviderAdapter } from "./types.js";

let adapters: SocialProviderAdapter[] | undefined;

export function getAdapters(): SocialProviderAdapter[] {
  adapters ??= [new MetaAdapter(), new LinkedInAdapter(), new TikTokAdapter(), new YouTubeAdapter(), new SandboxAdapter()];
  return adapters;
}
/** Réservé aux tests (injection d'un adaptateur Meta avec fetch simulé). */
export function setAdapters(list: SocialProviderAdapter[] | undefined) {
  adapters = list;
}
export function adapterByKey(key: string) {
  return getAdapters().find((a) => a.key === key);
}
export function adapterFor(provider: SocialProvider) {
  const a = getAdapters().find((x) => (x.providers as readonly string[]).includes(provider));
  if (!a) throw new Error(`Aucun connecteur pour ${provider}`);
  return a;
}
