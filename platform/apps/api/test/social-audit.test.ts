import { afterEach, describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { computeAuditStats, type AuditPost } from "../src/modules/social/audit.js";
import { fetchPublicProfile, parsePageLink } from "../src/modules/social/links.js";
import { purgeStalePlatformData } from "../src/modules/social/retention.js";
import { setAdapters } from "../src/modules/social/registry.js";
import { MetaAdapter } from "../src/modules/social/meta.js";
import { TikTokAdapter } from "../src/modules/social/tiktok.js";
import { YouTubeAdapter } from "../src/modules/social/youtube.js";
import { auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

afterEach(() => setAdapters(undefined));

async function connectSandbox(acc: TestAccount) {
  const app = await getApp();
  const { url } = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/connect`, headers: auth(acc), payload: { connector: "sandbox", network: "INSTAGRAM" } })).json();
  const cb = new URL(url);
  const state = cb.searchParams.get("state")!;
  const complete = await app.inject({ method: "POST", url: "/api/social/oauth/complete", headers: auth(acc), payload: { connector: "sandbox", state, code: cb.searchParams.get("code")! } });
  await app.inject({ method: "POST", url: "/api/social/oauth/select", headers: auth(acc), payload: { state, externalIds: complete.json().accounts.map((a: { externalId: string }) => a.externalId) } });
}

/** Réponse JSON simulée choisie selon un fragment du chemin (et de la requête). */
const fake = (routes: Record<string, unknown>, calls: string[] = []): typeof fetch =>
  (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    calls.push(url.pathname + url.search);
    const key = Object.keys(routes).find((k) => (url.pathname + url.search).includes(k));
    return new Response(JSON.stringify(key ? routes[key] : { error: { message: "not found" } }), { status: key ? 200 : 404 });
  }) as typeof fetch;

describe("Analyser mes réseaux", () => {
  it("exige au moins un lien de page valide pour le bon réseau", async () => {
    const acc = await signup();
    const app = await getApp();
    const post = (links: Record<string, string>) => app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/audit`, headers: auth(acc), payload: { links } });
    expect((await post({})).statusCode).toBe(400);
    expect((await post({ FACEBOOK: "  " })).statusCode).toBe(400);
    const wrong = await post({ FACEBOOK: "https://www.tiktok.com/@maboutique" });
    expect(wrong.statusCode).toBe(400);
    expect(wrong.json().error.message).toContain("Facebook");
    const state = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/social/audit`, headers: auth(acc) })).json();
    expect(state).toMatchObject({ latest: null, connectedAccounts: 0 });
  });

  it("lit la page du lien donné, mesure, rédige l'audit et fournit les textes au Brand DNA", async () => {
    const acc = await signup();
    await connectSandbox(acc);
    const app = await getApp();
    const start = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/audit`, headers: auth(acc), payload: { links: { INSTAGRAM: "instagram.com/maboutique" } } });
    expect(start.statusCode).toBe(202);
    await drainQueue();
    const job = await prisma.job.findUniqueOrThrow({ where: { id: start.json().jobId } });
    expect(job.status).toBe("SUCCEEDED");

    const { latest } = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/social/audit`, headers: auth(acc) })).json();
    expect(latest.postsCount).toBe(6);
    expect(latest.links).toEqual({ INSTAGRAM: "instagram.com/maboutique" });
    expect(latest.stats.accounts[0]).toMatchObject({ key: "INSTAGRAM", network: "Instagram", source: "connected", posts: 6 });
    expect(latest.stats.topPosts).toHaveLength(5);
    expect(latest.report.isSimulated).toBe(true);
    expect(latest.report.recommendations.length).toBeGreaterThan(0);

    const { sources } = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/social/audit/${latest.id}/sources`, headers: auth(acc) })).json();
    expect(sources).toContain("Nouvel arrivage");
    const other = await signup();
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${other.workspaceId}/social/audit/${latest.id}/sources`, headers: auth(other) })).statusCode).toBe(404);
  });

  it("calcule jour, créneau et format les plus engageants à partir des chiffres réels", () => {
    const post = (iso: string, format: string, likes: number): AuditPost => ({ externalId: iso, text: "x", createdAt: new Date(iso), url: null, format, likes, comments: 0, shares: 0, views: null, network: "Facebook", accountName: "Page" });
    const stats = computeAuditStats(
      [post("2026-10-12T19:00:00Z", "vidéo", 90), post("2026-10-05T20:00:00Z", "vidéo", 70), post("2026-10-07T08:00:00Z", "photo", 10), post("2026-10-14T09:00:00Z", "photo", 20)],
      [],
    );
    expect(stats).toMatchObject({ totalPosts: 4, avgEngagement: 48, bestWeekday: "lundi", bestSlot: "soirée (18 h – 22 h)" });
    expect(stats.formats[0]).toEqual({ format: "vidéo", posts: 2, avgEngagement: 80 });
    expect(stats.topPosts[0]!.engagement).toBe(90);
  });
});

describe("Conservation des données YouTube (30 jours)", () => {
  it("supprime statistiques et analyses YouTube de plus de 30 jours, garde le reste", async () => {
    const acc = await signup();
    const day = 86_400_000;
    const now = new Date();
    const item = await prisma.contentItem.create({ data: { workspaceId: acc.workspaceId, title: "Vidéo", body: "x", status: "PUBLISHED", approvedVersion: 1 } });
    const variant = await prisma.contentVariant.create({ data: { contentId: item.id, channel: "YOUTUBE", body: "x" } });
    const pubFor = async (provider: "YOUTUBE" | "FACEBOOK_PAGE") => {
      const account = await prisma.socialAccount.create({ data: { workspaceId: acc.workspaceId, provider, externalId: `${provider}-1`, name: provider } });
      return prisma.publication.create({ data: { workspaceId: acc.workspaceId, contentId: item.id, variantId: variant.id, socialAccountId: account.id, scheduledAt: now, status: "PUBLISHED", idempotencyKey: `k-${provider}` } });
    };
    const yt = await pubFor("YOUTUBE");
    const fb = await pubFor("FACEBOOK_PAGE");
    for (const p of [yt, fb]) {
      await prisma.socialMetricSnapshot.createMany({ data: [{ publicationId: p.id, capturedAt: new Date(now.getTime() - 40 * day) }, { publicationId: p.id, capturedAt: new Date(now.getTime() - 2 * day) }] });
    }
    const audit = (key: string, ageDays: number) =>
      prisma.socialAudit.create({ data: { workspaceId: acc.workspaceId, postsCount: 1, stats: { accounts: [{ key, source: "lookup" }] }, report: {}, sourcesText: "", createdAt: new Date(now.getTime() - ageDays * day) } });
    const oldYt = await audit("YOUTUBE", 40);
    const oldFb = await audit("FACEBOOK", 40);
    const recentYt = await audit("YOUTUBE", 5);

    const res = await purgeStalePlatformData(now);
    expect(res.metrics).toBeGreaterThanOrEqual(1);
    expect(await prisma.socialMetricSnapshot.count({ where: { publicationId: yt.id } })).toBe(1);
    expect(await prisma.socialMetricSnapshot.count({ where: { publicationId: fb.id } })).toBe(2);
    const left = (await prisma.socialAudit.findMany({ where: { workspaceId: acc.workspaceId }, select: { id: true } })).map((a) => a.id);
    expect(left).toEqual(expect.arrayContaining([oldFb.id, recentYt.id]));
    expect(left).not.toContain(oldYt.id);
  });
});

describe("Liens de pages", () => {
  it("reconnaît les liens de chaque réseau et refuse ceux d'un autre réseau", () => {
    expect(parsePageLink("FACEBOOK", "https://www.facebook.com/maboutique/?ref=x")).toMatchObject({ handle: "maboutique", id: null });
    expect(parsePageLink("FACEBOOK", "https://m.facebook.com/profile.php?id=1000123456")).toMatchObject({ id: "1000123456" });
    expect(parsePageLink("FACEBOOK", "https://www.facebook.com/people/Ma-Boutique/61550000000000/")).toMatchObject({ id: "61550000000000" });
    expect(parsePageLink("INSTAGRAM", "instagram.com/@maboutique")).toMatchObject({ handle: "maboutique" });
    expect(parsePageLink("TIKTOK", "https://www.tiktok.com/@maboutique?lang=fr")).toMatchObject({ handle: "maboutique" });
    expect(parsePageLink("YOUTUBE", "https://www.youtube.com/@MaBoutique")).toMatchObject({ handle: "@MaBoutique" });
    expect(parsePageLink("YOUTUBE", "https://youtube.com/channel/UCabc")).toMatchObject({ id: "UCabc" });
    expect(parsePageLink("LINKEDIN", "https://www.linkedin.com/company/ma-boutique/")).toMatchObject({ handle: "ma-boutique" });
    expect(parsePageLink("FACEBOOK", "https://evil.com/facebook.com/x")).toBeNull();
    expect(parsePageLink("INSTAGRAM", "https://www.instagram.com/p/abc123")).toBeNull();
    expect(parsePageLink("TIKTOK", "https://www.tiktok.com/")).toBeNull();
  });

  it("lit la présentation publique d'une page sans jamais suivre une redirection hors du réseau", async () => {
    const ref = parsePageLink("LINKEDIN", "https://www.linkedin.com/company/ma-boutique")!;
    const html = `<html><head><meta property="og:title" content="Ma Boutique | LinkedIn"><meta property="og:description" content="Pagnes &amp; tissus à Abidjan"></head></html>`;
    const page = (async () => new Response(html, { status: 200 })) as typeof fetch;
    expect(await fetchPublicProfile(ref, page)).toEqual({ name: "Ma Boutique | LinkedIn", bio: "Pagnes & tissus à Abidjan", followers: null });
    const urls: string[] = [];
    const redirect = (async (u: string | URL | Request) => {
      urls.push(String(u));
      return new Response(null, { status: 302, headers: { location: "http://169.254.169.254/computeMetadata" } });
    }) as typeof fetch;
    expect(await fetchPublicProfile(ref, redirect)).toBeNull();
    expect(urls).toHaveLength(1);
  });
});

describe("Lecture des publications existantes (API simulées)", () => {
  it("Meta : Page Facebook et compte Instagram", async () => {
    const meta = new MetaAdapter(
      fake({
        "/page1/posts": { data: [{ id: "page1_9", message: "Promo", created_time: "2026-10-10T18:00:00+0000", permalink_url: "https://fb/p", attachments: { data: [{ media_type: "video" }] }, shares: { count: 2 }, reactions: { summary: { total_count: 30 } }, comments: { summary: { total_count: 4 } } }] },
        "/ig1/media": { data: [{ id: "m1", caption: "Reel", timestamp: "2026-10-11T10:00:00+0000", media_type: "VIDEO", media_product_type: "REELS", permalink: "https://ig/p", like_count: 50, comments_count: 5 }] },
      }),
    );
    expect(await meta.fetchRecentPosts({ provider: "FACEBOOK_PAGE", externalId: "page1" }, "t", 25)).toEqual([
      { externalId: "page1_9", text: "Promo", createdAt: new Date("2026-10-10T18:00:00Z"), url: "https://fb/p", format: "vidéo", likes: 30, comments: 4, shares: 2, views: null },
    ]);
    expect((await meta.fetchRecentPosts({ provider: "INSTAGRAM_BUSINESS", externalId: "ig1" }, "t", 25))[0]).toMatchObject({ format: "reel", likes: 50, comments: 5 });
  });

  it("Meta : compte Instagram professionnel quelconque par son nom (Business Discovery)", async () => {
    const calls: string[] = [];
    const meta = new MetaAdapter(
      fake({ "business_discovery": { business_discovery: { username: "concurrent", name: "Concurrent", biography: "Mode", followers_count: 1200, media: { data: [{ id: "m9", caption: "Nouveau", media_type: "IMAGE", like_count: 12, comments_count: 1 }] } } } }, calls),
    );
    const d = await meta.discoverInstagram("ig1", "t", "concurrent", 25);
    expect(d.profile).toEqual({ name: "Concurrent", bio: "Mode", followers: 1200 });
    expect(d.posts[0]).toMatchObject({ text: "Nouveau", format: "photo", likes: 12 });
    expect(decodeURIComponent(calls[0]!)).toContain("business_discovery.username(concurrent)");
  });

  it("TikTok : liste des vidéos avec leurs statistiques", async () => {
    const tt = new TikTokAdapter(fake({ "/video/list/": { data: { videos: [{ id: "v1", video_description: "Coulisses", create_time: 1760300000, share_url: "https://tt/v1", view_count: 900, like_count: 80, comment_count: 6, share_count: 3 }] }, error: { code: "ok" } } }));
    expect((await tt.fetchRecentPosts({ provider: "TIKTOK", externalId: "o" }, "t", 25))[0]).toMatchObject({ text: "Coulisses", views: 900, likes: 80, shares: 3, format: "vidéo" });
  });

  it("YouTube : chaîne publique par son @pseudo avec une clé d'API", async () => {
    const calls: string[] = [];
    const yt = new YouTubeAdapter(fake({ "/channels": { items: [{ id: "UCx", snippet: { title: "Ma chaîne", description: "Bio" }, statistics: { subscriberCount: "340" } }] } }, calls));
    const c = await yt.fetchChannel({ handle: "@MaChaine" }, { apiKey: "k" }, 25);
    expect(c).toEqual({ channelId: "UCx", profile: { name: "Ma chaîne", bio: "Bio", followers: 340 }, posts: [] });
    expect(decodeURIComponent(calls[0]!)).toContain("forHandle=@MaChaine");
    expect(calls[0]).toContain("key=k");
  });

  it("YouTube : vidéos de la playlist « uploads » de la chaîne", async () => {
    const calls: string[] = [];
    const yt = new YouTubeAdapter(
      fake(
        {
          "/channels": { items: [{ contentDetails: { relatedPlaylists: { uploads: "UUabc" } } }] },
          "/playlistItems": { items: [{ contentDetails: { videoId: "vid1" } }] },
          "/videos": { items: [{ id: "vid1", snippet: { title: "Titre", description: "Desc", publishedAt: "2026-10-01T12:00:00Z" }, statistics: { viewCount: "120", likeCount: "9", commentCount: "2" } }] },
        },
        calls,
      ),
    );
    const posts = await yt.fetchRecentPosts({ provider: "YOUTUBE", externalId: "UCabc" }, "t", 25);
    expect(posts[0]).toMatchObject({ externalId: "vid1", text: "Titre\nDesc", url: "https://youtu.be/vid1", views: 120, likes: 9, comments: 2 });
    expect(calls[0]).toContain("id=UCabc");
  });
});
