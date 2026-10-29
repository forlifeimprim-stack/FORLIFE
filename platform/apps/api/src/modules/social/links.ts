import type { SandboxNetwork } from "@forlife/shared";
import type { ProfileInfo } from "./types.js";

/** Réseaux analysables à partir d'un lien (mêmes clés que les comptes de test). */
export type LinkNetwork = SandboxNetwork;

const HOSTS: Record<LinkNetwork, string[]> = {
  FACEBOOK: ["facebook.com", "fb.com"],
  INSTAGRAM: ["instagram.com"],
  TIKTOK: ["tiktok.com"],
  YOUTUBE: ["youtube.com", "youtu.be"],
  LINKEDIN: ["linkedin.com"],
};

export interface PageRef {
  network: LinkNetwork;
  url: string;
  /** Identifiant lisible dans le lien : nom de Page, @pseudo, ID de chaîne… */
  handle: string | null;
  /** Identifiant numérique ou technique quand le lien le contient (Page Facebook, chaîne YouTube). */
  id: string | null;
  /** YouTube : ancien lien /user/… */
  legacyUser?: string | null;
}

const onHost = (host: string, network: LinkNetwork) => HOSTS[network].some((h) => host === h || host.endsWith(`.${h}`));

/** Analyse un lien de page ; null s'il n'appartient pas au réseau indiqué. */
export function parsePageLink(network: LinkNetwork, raw: string): PageRef | null {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!onHost(host, network)) return null;
  const parts = url.pathname.split("/").filter(Boolean).map((p) => decodeURIComponent(p));
  const ref: PageRef = { network, url: `https://${host}${url.pathname}${url.search}`, handle: null, id: null };
  switch (network) {
    case "FACEBOOK": {
      const id = url.searchParams.get("id");
      if (parts[0] === "profile.php" && id) ref.id = id;
      else if (parts[0] === "people" || parts[0] === "pages") ref.id = parts.find((p) => /^\d{5,}$/.test(p)) ?? null;
      else ref.handle = parts[0] ?? null;
      break;
    }
    case "INSTAGRAM":
      ref.handle = parts[0] && !["p", "reel", "stories", "explore"].includes(parts[0]) ? parts[0].replace(/^@/, "") : null;
      break;
    case "TIKTOK":
      ref.handle = parts.find((p) => p.startsWith("@"))?.slice(1) ?? null;
      break;
    case "YOUTUBE":
      if (parts[0]?.startsWith("@")) ref.handle = parts[0];
      else if (parts[0] === "channel") ref.id = parts[1] ?? null;
      else if (parts[0] === "user") ref.legacyUser = parts[1] ?? null;
      else if (parts[0] === "c") ref.handle = parts[1] ? `@${parts[1]}` : null;
      break;
    case "LINKEDIN":
      ref.handle = (parts[0] === "company" || parts[0] === "in" || parts[0] === "showcase") && parts[1] ? parts[1] : null;
      break;
  }
  if (!ref.handle && !ref.id && !ref.legacyUser) return null;
  return ref;
}

const MAX_BYTES = 600_000;

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function meta(html: string, name: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  const content = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return content ? decodeEntities(content).trim() || null : null;
}

/**
 * Informations publiques d'une page (titre et description affichés lors d'un partage du lien).
 * Ne suit que des redirections vers le même réseau, en HTTPS : aucune requête vers une autre adresse.
 * Beaucoup de réseaux masquent leurs pages aux visiteurs non connectés : le résultat peut être vide.
 */
export async function fetchPublicProfile(ref: PageRef, fetchImpl: typeof fetch = fetch): Promise<ProfileInfo | null> {
  let url = ref.url;
  for (let hop = 0; hop < 4; hop++) {
    const u = new URL(url);
    if (u.protocol !== "https:" || !onHost(u.hostname.toLowerCase(), ref.network)) return null;
    let res: Response;
    try {
      res = await fetchImpl(url, {
        redirect: "manual",
        headers: { "user-agent": "Mozilla/5.0 (compatible; ForlifeCom/1.0; +https://ai-growth-et-creative-os.web.app)", "accept-language": "fr-FR,fr;q=0.9" },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      return null;
    }
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) return null;
      url = new URL(next, url).toString();
      continue;
    }
    if (!res.ok || !res.body) return null;
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    await reader.cancel().catch(() => undefined);
    const html = Buffer.concat(chunks).toString("utf8");
    const name = meta(html, "og:title") ?? decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
    const bio = meta(html, "og:description") ?? meta(html, "description");
    // Page de connexion générique : rien d'exploitable.
    if (!name || /^(log ?in|connexion|se connecter|facebook|instagram|tiktok|linkedin)\b/i.test(name)) return bio ? { name: ref.handle ?? ref.url, bio, followers: null } : null;
    return { name, bio, followers: null };
  }
  return null;
}
