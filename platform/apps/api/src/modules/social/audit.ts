import type { Job, SocialAccount, SocialCredential, SocialProvider } from "@prisma/client";
import { sandboxNetwork } from "@forlife/shared";
import { prisma } from "../../lib/prisma.js";
import { audit } from "../../lib/audit.js";
import { badRequest } from "../../lib/errors.js";
import { runAI } from "../ai/gateway.js";
import { loadBrandContext } from "../ai/context.js";
import { socialAuditPrompt, type SocialAuditInput, type SocialAuditOutput } from "../ai/prompts.js";
import { loadConfig } from "../../config.js";
import { adapterByKey } from "./registry.js";
import { accessTokenFor } from "./service.js";
import { fetchPublicProfile, parsePageLink, type LinkNetwork, type PageRef } from "./links.js";
import type { MetaAdapter } from "./meta.js";
import type { TikTokAdapter } from "./tiktok.js";
import type { YouTubeAdapter } from "./youtube.js";
import { SocialError, type ProfileInfo, type RecentPost } from "./types.js";

/** Publications lues par compte : assez pour dégager des tendances, sans épuiser les quotas des réseaux. */
const POSTS_PER_ACCOUNT = 25;

export const NETWORK_LABELS: Record<LinkNetwork, string> = { FACEBOOK: "Facebook", INSTAGRAM: "Instagram", TIKTOK: "TikTok", YOUTUBE: "YouTube", LINKEDIN: "LinkedIn" };
const PROVIDER_OF: Record<LinkNetwork, SocialProvider> = { FACEBOOK: "FACEBOOK_PAGE", INSTAGRAM: "INSTAGRAM_BUSINESS", TIKTOK: "TIKTOK", YOUTUBE: "YOUTUBE", LINKEDIN: "LINKEDIN" };
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
/** Créneaux à l'heure d'Abidjan (UTC+0, sans heure d'été). */
const SLOTS: { label: string; from: number; to: number }[] = [
  { label: "matin (6 h – 11 h)", from: 6, to: 11 },
  { label: "midi (11 h – 14 h)", from: 11, to: 14 },
  { label: "après-midi (14 h – 18 h)", from: 14, to: 18 },
  { label: "soirée (18 h – 22 h)", from: 18, to: 22 },
  { label: "nuit (22 h – 6 h)", from: 22, to: 30 },
];

export interface AuditPost extends RecentPost {
  network: string;
  accountName: string;
}

/** Comment la page a été lue : compte connecté, recherche via un compte connecté (Instagram, YouTube), page publique, ou pas du tout. */
export type ReadSource = "connected" | "lookup" | "public" | "none";

export interface AccountReport {
  /** Clé stable du réseau (FACEBOOK, INSTAGRAM…). */
  key: LinkNetwork;
  link: string;
  name: string;
  network: string;
  source: ReadSource;
  profile: ProfileInfo | null;
  /** Précision affichée à l'utilisateur (compte à connecter, vérification à faire…). */
  note: string | null;
  posts: number;
  avgEngagement: number;
  avgViews: number | null;
  postsPerWeek: number | null;
  lastPostAt: string | null;
}

export interface AuditStats {
  totalPosts: number;
  avgEngagement: number;
  accounts: AccountReport[];
  bestWeekday: string | null;
  bestSlot: string | null;
  formats: { format: string; posts: number; avgEngagement: number }[];
  topPosts: { network: string; accountName: string; format: string; date: string | null; engagement: number; views: number | null; text: string; url: string | null }[];
}

const engagementOf = (p: RecentPost) => p.likes + p.comments + p.shares;
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

/** Groupe qui obtient la meilleure moyenne d'interactions (au moins 2 publications pour éviter un hasard isolé). */
function bestGroup(posts: AuditPost[], key: (p: AuditPost) => string | null): string | null {
  const groups = new Map<string, number[]>();
  for (const p of posts) {
    const k = key(p);
    if (k) groups.set(k, [...(groups.get(k) ?? []), engagementOf(p)]);
  }
  let best: [string, number] | null = null;
  for (const [k, v] of groups) if (v.length >= 2 && (!best || avg(v) > best[1])) best = [k, avg(v)];
  return best?.[0] ?? null;
}

function slotOf(d: Date): string {
  const h = d.getUTCHours() < 6 ? d.getUTCHours() + 24 : d.getUTCHours();
  return SLOTS.find((s) => h >= s.from && h < s.to)!.label;
}

function postsPerWeek(posts: RecentPost[]): number | null {
  const dates = posts.map((p) => p.createdAt?.getTime()).filter((t): t is number => t !== undefined);
  if (dates.length < 2) return null;
  const weeks = Math.max(1, (Math.max(...dates) - Math.min(...dates)) / (7 * 86_400_000));
  return Math.round((dates.length / weeks) * 10) / 10;
}

/** Statistiques déterministes : ce sont elles, et non l'IA, qui fournissent les chiffres de l'audit. */
export function computeAuditStats(posts: AuditPost[], accounts: AccountReport[]): AuditStats {
  const byFormat = new Map<string, number[]>();
  for (const p of posts) byFormat.set(p.format, [...(byFormat.get(p.format) ?? []), engagementOf(p)]);
  return {
    totalPosts: posts.length,
    avgEngagement: avg(posts.map(engagementOf)),
    accounts,
    bestWeekday: bestGroup(posts, (p) => (p.createdAt ? WEEKDAYS[p.createdAt.getUTCDay()]! : null)),
    bestSlot: bestGroup(posts, (p) => (p.createdAt ? slotOf(p.createdAt) : null)),
    formats: [...byFormat].map(([format, v]) => ({ format, posts: v.length, avgEngagement: avg(v) })).sort((a, b) => b.avgEngagement - a.avgEngagement),
    topPosts: [...posts]
      .sort((a, b) => engagementOf(b) - engagementOf(a))
      .slice(0, 5)
      .map((p) => ({ network: p.network, accountName: p.accountName, format: p.format, date: p.createdAt?.toISOString() ?? null, engagement: engagementOf(p), views: p.views, text: p.text.slice(0, 280), url: p.url })),
  };
}

function factsText(s: AuditStats): string {
  const lines = [`- ${s.totalPosts} publications analysées, ${s.avgEngagement} interactions en moyenne (réactions + commentaires + partages)`];
  for (const a of s.accounts) {
    if (a.profile?.bio || a.profile?.followers) lines.push(`- Profil ${a.network} « ${a.name} »${a.profile.followers !== null ? ` : ${a.profile.followers} abonnés` : ""}${a.profile.bio ? ` · présentation : « ${a.profile.bio.slice(0, 300)} »` : ""}`);
  }
  for (const a of s.accounts.filter((x) => x.posts > 0)) {
    lines.push(`- ${a.name} (${a.network}) : ${a.posts} publications, ${a.avgEngagement} interactions en moyenne${a.avgViews !== null ? `, ${a.avgViews} vues en moyenne` : ""}${a.postsPerWeek !== null ? `, ${a.postsPerWeek} publications par semaine` : ""}`);
  }
  if (s.bestWeekday) lines.push(`- Jour le plus engageant : ${s.bestWeekday}`);
  if (s.bestSlot) lines.push(`- Créneau le plus engageant : ${s.bestSlot}`);
  if (s.formats.length) lines.push(`- Formats : ${s.formats.map((f) => `${f.format} (${f.posts} posts, ${f.avgEngagement} interactions en moyenne)`).join(" ; ")}`);
  return lines.join("\n");
}

type Row = SocialAccount & { credential: SocialCredential };
type Found = { name: string; source: ReadSource; posts: RecentPost[]; profile: ProfileInfo | null; note: string | null };

const meta = () => adapterByKey("meta") as Partial<MetaAdapter> | undefined;
const tiktok = () => adapterByKey("tiktok") as Partial<TikTokAdapter> | undefined;
const youtube = () => adapterByKey("youtube") as Partial<YouTubeAdapter> | undefined;

async function ownPosts(row: Row): Promise<RecentPost[]> {
  const adapter = row.provider === "SANDBOX" ? adapterByKey("sandbox") : getAdapterFor(row.provider);
  if (!adapter?.fetchRecentPosts) return [];
  return adapter.fetchRecentPosts(row, await accessTokenFor(row), POSTS_PER_ACCOUNT);
}
function getAdapterFor(provider: SocialProvider) {
  return provider === "FACEBOOK_PAGE" || provider === "INSTAGRAM_BUSINESS" ? adapterByKey("meta") : adapterByKey(provider.toLowerCase());
}

const notConnected = (what: string) => `${what} Connectez-le dans le Social Hub pour lire ses publications.`;

/** Lecture d'une page à partir de son lien, réseau par réseau, selon ce que chaque API autorise. */
async function readFromLink(ref: PageRef, rows: Row[]): Promise<Found | null> {
  const label = ref.handle ?? ref.id ?? ref.legacyUser ?? ref.url;
  switch (ref.network) {
    case "FACEBOOK": {
      const pages = rows.filter((r) => r.provider === "FACEBOOK_PAGE");
      let page = pages.find((p) => p.externalId === ref.id);
      const m = meta();
      if (!page && pages[0] && m?.resolvePageId) {
        const id = await m.resolvePageId(ref.handle ?? ref.id ?? "", await accessTokenFor(pages[0]));
        page = pages.find((p) => p.externalId === id);
      }
      if (page) return { name: page.name, source: "connected", posts: await ownPosts(page), profile: null, note: null };
      return { name: label, source: "none", posts: [], profile: null, note: notConnected("Facebook ne laisse lire les publications que des Pages que vous administrez.") };
    }
    case "INSTAGRAM": {
      const igs = rows.filter((r) => r.provider === "INSTAGRAM_BUSINESS");
      const own = igs.find((r) => r.name.toLowerCase() === `@${(ref.handle ?? "").toLowerCase()}`);
      if (own) return { name: own.name, source: "connected", posts: await ownPosts(own), profile: null, note: null };
      const m = meta();
      if (igs[0] && m?.discoverInstagram && ref.handle) {
        try {
          const d = await m.discoverInstagram(igs[0].externalId, await accessTokenFor(igs[0]), ref.handle, POSTS_PER_ACCOUNT);
          return { name: d.profile.name, source: "lookup", posts: d.posts, profile: d.profile, note: null };
        } catch (e) {
          if (!(e instanceof SocialError) || e.code !== "INVALID") throw e;
          return { name: `@${ref.handle}`, source: "none", posts: [], profile: null, note: "Compte introuvable, privé ou personnel : seuls les comptes Instagram professionnels ou créateurs sont lisibles." };
        }
      }
      return { name: `@${label}`, source: "none", posts: [], profile: null, note: notConnected("Instagram exige un compte professionnel connecté pour lire un compte.") };
    }
    case "TIKTOK": {
      const accounts = rows.filter((r) => r.provider === "TIKTOK");
      const t = tiktok();
      for (const a of accounts) {
        const username = t?.fetchUsername ? await t.fetchUsername(await accessTokenFor(a)) : null;
        if (username && username.toLowerCase() === (ref.handle ?? "").toLowerCase()) return { name: a.name, source: "connected", posts: await ownPosts(a), profile: null, note: null };
      }
      // Sans le droit « user.info.profile », le pseudo du compte connecté est inconnu : un seul compte connecté est réputé être celui du lien.
      if (accounts.length === 1) {
        return { name: accounts[0]!.name, source: "connected", posts: await ownPosts(accounts[0]!), profile: null, note: `Lu via le compte TikTok connecté « ${accounts[0]!.name} » : vérifiez qu'il correspond bien à @${ref.handle}.` };
      }
      return { name: `@${label}`, source: "none", posts: [], profile: null, note: notConnected("TikTok ne laisse lire que les comptes connectés.") };
    }
    case "YOUTUBE": {
      const channels = rows.filter((r) => r.provider === "YOUTUBE");
      const apiKey = loadConfig().YOUTUBE_API_KEY;
      const y = youtube();
      if (y?.fetchChannel && (channels[0] || apiKey)) {
        const auth = channels[0] ? { token: await accessTokenFor(channels[0]) } : { apiKey };
        const c = await y.fetchChannel({ handle: ref.handle ?? undefined, id: ref.id ?? undefined, username: ref.legacyUser ?? undefined }, auth, POSTS_PER_ACCOUNT);
        if (!c) return { name: label, source: "none", posts: [], profile: null, note: "Chaîne YouTube introuvable : utilisez le lien de la chaîne (youtube.com/@pseudo)." };
        return { name: c.profile.name, source: channels.some((r) => r.externalId === c.channelId) ? "connected" : "lookup", posts: c.posts, profile: c.profile, note: null };
      }
      return { name: label, source: "none", posts: [], profile: null, note: notConnected("Aucune chaîne YouTube n'est connectée pour interroger YouTube.") };
    }
    case "LINKEDIN":
      return { name: label, source: "none", posts: [], profile: null, note: "LinkedIn ne permet pas de lire les publications d'une page sans validation spéciale : seules les informations publiques de la page sont utilisées." };
  }
}

/** Compte de test du bac à sable correspondant au réseau (démonstration et tests). */
function sandboxFor(network: LinkNetwork, rows: Row[]): Row | undefined {
  return rows.find((r) => r.provider === "SANDBOX" && sandboxNetwork(r.externalId) === network);
}

/** Lit chaque page à partir du lien donné ; une page illisible n'empêche pas l'analyse des autres. */
export async function collectFromLinks(workspaceId: string, links: Partial<Record<LinkNetwork, string>>): Promise<{ posts: AuditPost[]; accounts: AccountReport[] }> {
  const rows = (await prisma.socialAccount.findMany({ where: { workspaceId, status: "CONNECTED", credential: { isNot: null } }, include: { credential: true }, orderBy: { createdAt: "asc" } })) as Row[];
  const posts: AuditPost[] = [];
  const accounts: AccountReport[] = [];
  for (const key of Object.keys(NETWORK_LABELS) as LinkNetwork[]) {
    const link = links[key];
    if (!link?.trim()) continue;
    const network = NETWORK_LABELS[key];
    const base = { key, link: link.trim(), network, posts: 0, avgEngagement: 0, avgViews: null, postsPerWeek: null, lastPostAt: null };
    const ref = parsePageLink(key, link);
    if (!ref) {
      accounts.push({ ...base, name: link.trim(), source: "none", profile: null, note: `Ce lien n'est pas un lien de page ${network} valide.` });
      continue;
    }
    let found: Found | null;
    try {
      const test = sandboxFor(key, rows);
      found = test ? { name: test.name, source: "connected", posts: await ownPosts(test), profile: null, note: "Compte de test : publications simulées." } : await readFromLink(ref, rows);
    } catch (e) {
      found = { name: ref.handle ?? ref.url, source: "none", posts: [], profile: null, note: e instanceof SocialError ? e.message : "Lecture impossible pour le moment, réessayez plus tard." };
    }
    if (!found) continue;
    // Faute de publications lisibles, on retient au moins la présentation publique de la page.
    if (!found.posts.length && !found.profile) {
      const pub = await fetchPublicProfile(ref);
      if (pub) found = { ...found, name: pub.name, profile: pub, source: found.source === "none" ? "public" : found.source };
    }
    const list = found.posts;
    const views = list.map((p) => p.views).filter((v): v is number => v !== null);
    posts.push(...list.map((p) => ({ ...p, network, accountName: found!.name })));
    accounts.push({
      ...base,
      name: found.name,
      source: found.source,
      profile: found.profile,
      note: found.note ?? (found.source !== "none" && !list.length ? "Aucune publication trouvée sur cette page." : null),
      posts: list.length,
      avgEngagement: avg(list.map(engagementOf)),
      avgViews: views.length ? avg(views) : null,
      postsPerWeek: postsPerWeek(list),
      lastPostAt: list[0]?.createdAt?.toISOString() ?? null,
    });
  }
  return { posts, accounts };
}

interface Payload {
  workspaceId: string;
  actorId: string;
  links: Partial<Record<LinkNetwork, string>>;
}

/** Analyste réseaux : lit les publications en ligne, mesure, puis fait rédiger l'audit par l'IA. */
export async function socialAuditJob(job: Job) {
  const p = job.payload as unknown as Payload;
  const { posts, accounts } = await collectFromLinks(p.workspaceId, p.links);
  if (!posts.length && !accounts.some((a) => a.profile)) {
    const reasons = accounts.map((a) => `${a.network} : ${a.note ?? "rien de lisible"}`).join(" · ");
    throw badRequest(`Aucune information n'a pu être lue à partir de vos liens${reasons ? ` (${reasons})` : ""}`);
  }
  const stats = computeAuditStats(posts, accounts);
  const context = await loadBrandContext(p.workspaceId);
  const samples = [...posts]
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    .slice(0, 30)
    .map((x) => ({ network: x.network, format: x.format, date: x.createdAt?.toISOString().slice(0, 10) ?? null, engagement: engagementOf(x), views: x.views, text: x.text.replace(/\s+/g, " ").slice(0, 400) }));
  const ai = await runAI<SocialAuditInput, SocialAuditOutput>({
    organizationId: job.organizationId,
    workspaceId: p.workspaceId,
    actorId: p.actorId,
    prompt: socialAuditPrompt,
    input: { context, facts: factsText(stats), samples },
    traceId: job.correlationId,
    idempotencyKey: `${job.id}:${job.attempts}`,
  });
  const profiles = accounts.filter((a) => a.profile?.bio).map((a) => `[Présentation ${a.network} · ${a.name}]\n${a.profile!.bio}`);
  const postTexts = posts.filter((x) => x.text.trim()).map((x) => `[${x.network} · ${x.format}${x.createdAt ? ` · ${x.createdAt.toISOString().slice(0, 10)}` : ""}]\n${x.text.trim()}`);
  const sourcesText = [...profiles, ...postTexts].join("\n\n").slice(0, 30_000);
  const report = { ...ai.output, score: Math.max(0, Math.min(100, ai.output.score)), isSimulated: ai.isSimulated, safety: ai.safety };
  const saved = await prisma.socialAudit.create({
    data: { workspaceId: p.workspaceId, links: p.links as never, postsCount: posts.length, stats: stats as never, report: report as never, sourcesText, aiRunId: ai.runId, createdById: p.actorId },
  });
  await audit({ organizationId: job.organizationId, workspaceId: p.workspaceId, actorId: p.actorId, action: "social.audit.generated", entityType: "social_audit", entityId: saved.id, correlationId: job.correlationId, metadata: { aiRunId: ai.runId, posts: posts.length } });
  return { auditId: saved.id, posts: posts.length, isSimulated: ai.isSimulated, safety: ai.safety as never };
}
