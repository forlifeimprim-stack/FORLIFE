import { afterEach, describe, expect, it } from "vitest";
import { drainQueue, processJob } from "../src/modules/jobs/queue.js";
import { accessTokenFor, collectMetrics, dispatchDuePublications } from "../src/modules/social/service.js";
import { setAdapters } from "../src/modules/social/registry.js";
import { MetaAdapter } from "../src/modules/social/meta.js";
import { LinkedInAdapter } from "../src/modules/social/linkedin.js";
import { TikTokAdapter } from "../src/modules/social/tiktok.js";
import { YouTubeAdapter, youtubeTitle } from "../src/modules/social/youtube.js";
import { SandboxAdapter } from "../src/modules/social/sandbox.js";
import { SocialError, type SocialProviderAdapter } from "../src/modules/social/types.js";
import { resetConfigCache } from "../src/config.js";
import { addMember, auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

afterEach(() => setAdapters(undefined));

/** Lance la connexion, puis fait ce que fait l'interface au retour OAuth : terminer avec la session, puis choisir les pages. */
async function connectSandbox(acc: TestAccount, finisher: TestAccount = acc) {
  const app = await getApp();
  const { url } = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/connect`, headers: auth(acc), payload: { connector: "sandbox" } })).json();
  const cb = new URL(url);
  const callback = { connector: "sandbox", state: cb.searchParams.get("state")!, code: cb.searchParams.get("code")! };
  const complete = await app.inject({ method: "POST", url: "/api/social/oauth/complete", headers: auth(finisher), payload: callback });
  if (complete.statusCode !== 200) return { complete, callback };
  const select = await app.inject({ method: "POST", url: "/api/social/oauth/select", headers: auth(finisher), payload: { state: callback.state, externalIds: complete.json().accounts.map((a: { externalId: string }) => a.externalId) } });
  return { complete, select, callback };
}

/** Crée un contenu approuvé avec une variante Facebook, prêt à programmer. */
async function approvedContent(acc: TestAccount, body = "Nouvelle collection disponible") {
  const item = await prisma.contentItem.create({ data: { workspaceId: acc.workspaceId, title: "Post test", body, status: "APPROVED", approvedVersion: 1 } });
  await prisma.contentVariant.create({ data: { contentId: item.id, channel: "FACEBOOK", body, hashtags: ["Forlife"] } });
  await prisma.contentVariant.create({ data: { contentId: item.id, channel: "WHATSAPP", body } });
  return item;
}

async function scheduleNowish(acc: TestAccount, contentId: string) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}/schedule`, headers: auth(acc), payload: { scheduledAt: new Date(Date.now() + 60_000).toISOString() } });
  expect(res.statusCode).toBe(200);
  await prisma.publication.updateMany({ where: { contentId }, data: { scheduledAt: new Date(Date.now() - 1000) } });
}

describe("Social Hub — connexion", () => {
  it("connecte un compte via OAuth avec un état à usage unique et chiffre le jeton", async () => {
    const acc = await signup();
    const { complete, select, callback } = await connectSandbox(acc);
    expect(complete.statusCode).toBe(200);
    expect(complete.json().accounts[0]).not.toHaveProperty("accessToken");
    expect(select!.json().connected).toBe(1);
    const account = await prisma.socialAccount.findFirstOrThrow({ where: { workspaceId: acc.workspaceId }, include: { credential: true } });
    expect(account.credential?.accessTokenEnc).not.toContain("sandbox-token");
    const app = await getApp();
    expect((await app.inject({ method: "POST", url: "/api/social/oauth/complete", headers: auth(acc), payload: callback })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/social/oauth/select", headers: auth(acc), payload: { state: callback.state, externalIds: ["sandbox-page"] } })).statusCode).toBe(400);
  });

  it("un lien d'autorisation transmis à un tiers ne rattache jamais ses pages au workspace de l'initiateur", async () => {
    const attacker = await signup();
    const victim = await signup();
    const { complete } = await connectSandbox(attacker, victim);
    expect(complete.statusCode).toBe(403);
    expect(await prisma.socialAccount.count({ where: { workspaceId: attacker.workspaceId } })).toBe(0);
  });

  it("réserve la connexion des comptes aux rôles habilités", async () => {
    const owner = await signup();
    const editor = await addMember(owner, "EDITOR");
    const app = await getApp();
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/social/connect`, headers: auth(editor), payload: { connector: "sandbox" } })).statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/social/connect`, headers: auth(owner), payload: { connector: "meta" } })).statusCode).toBe(400);
  });
});

describe("Social Hub — publication", () => {
  it("publie une seule fois à l'échéance et marque le contenu publié", async () => {
    const acc = await signup();
    await connectSandbox(acc);
    const item = await approvedContent(acc);
    await scheduleNowish(acc, item.id);
    const pubs = await prisma.publication.findMany({ where: { contentId: item.id } });
    expect(pubs).toHaveLength(1); // Facebook seulement : WhatsApp reste manuel
    expect(await dispatchDuePublications()).toBe(1);
    expect(await dispatchDuePublications()).toBe(0);
    await drainQueue();
    const pub = await prisma.publication.findUniqueOrThrow({ where: { id: pubs[0]!.id } });
    expect(pub.status).toBe("PUBLISHED");
    expect(pub.externalId).toMatch(/^sandbox_/);
    expect((await prisma.contentItem.findUniqueOrThrow({ where: { id: item.id } })).status).toBe("PUBLISHED");
    // Rejouer le job ne republie pas
    const job = await prisma.job.findFirstOrThrow({ where: { type: "social.publish", payload: { path: ["publicationId"], equals: pub.id } } });
    await processJob({ ...job, attempts: job.attempts + 1 });
    expect((await prisma.publicationAttempt.count({ where: { publicationId: pub.id } }))).toBe(1);
  });

  it("mode test par réseau : chaque compte de test ne publie que sur son réseau", async () => {
    const acc = await signup();
    const app = await getApp();
    for (const network of ["LINKEDIN", "TIKTOK"]) {
      const { url } = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/connect`, headers: auth(acc), payload: { connector: "sandbox", network } })).json();
      const cb = new URL(url);
      const state = cb.searchParams.get("state")!;
      const complete = await app.inject({ method: "POST", url: "/api/social/oauth/complete", headers: auth(acc), payload: { connector: "sandbox", state, code: cb.searchParams.get("code")! } });
      expect(complete.json().accounts).toEqual([expect.objectContaining({ externalId: `test-${network.toLowerCase()}`, provider: "SANDBOX" })]);
      await app.inject({ method: "POST", url: "/api/social/oauth/select", headers: auth(acc), payload: { state, externalIds: [`test-${network.toLowerCase()}`] } });
    }
    const list = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/social/accounts`, headers: auth(acc) })).json();
    expect(list.accounts.map((a: { network: string }) => a.network).sort()).toEqual(["LINKEDIN", "TIKTOK"]);
    const item = await approvedContent(acc);
    await prisma.contentVariant.create({ data: { contentId: item.id, channel: "LINKEDIN", body: "Version LinkedIn" } });
    await scheduleNowish(acc, item.id);
    const pubs = await prisma.publication.findMany({ where: { contentId: item.id }, include: { socialAccount: true } });
    const variants = await prisma.contentVariant.findMany({ where: { contentId: item.id } });
    const channelOf = (id: string) => variants.find((v) => v.id === id)?.channel;
    // Facebook n'a pas de compte de test connecté ; TikTok n'a pas de variante : seule la variante LinkedIn part.
    expect(pubs.map((p) => [channelOf(p.variantId), p.socialAccount.externalId])).toEqual([["LINKEDIN", "test-linkedin"]]);
  });

  it("n'insiste pas sur une erreur définitive et permet la relance manuelle", async () => {
    const acc = await signup();
    await connectSandbox(acc);
    const item = await approvedContent(acc, "Contenu refusé #echec-test");
    await scheduleNowish(acc, item.id);
    await dispatchDuePublications();
    await drainQueue();
    const pub = await prisma.publication.findFirstOrThrow({ where: { contentId: item.id } });
    expect(pub.status).toBe("FAILED");
    expect(pub.attempts).toBe(1);
    expect((await prisma.contentItem.findUniqueOrThrow({ where: { id: item.id } })).status).toBe("FAILED");
    const app = await getApp();
    const retry = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/publications/${pub.id}/retry`, headers: auth(acc) });
    expect(retry.statusCode).toBe(200);
    expect((await prisma.publication.findUniqueOrThrow({ where: { id: pub.id } })).status).toBe("QUEUED");
  });

  it("réessaie une erreur transitoire avec backoff", async () => {
    let calls = 0;
    const flaky: SocialProviderAdapter = Object.assign(Object.create(SandboxAdapter.prototype), new SandboxAdapter(), {
      async publish() {
        calls++;
        if (calls === 1) throw new SocialError("TRANSIENT", "Réseau indisponible");
        return { externalId: "ok_123", url: "https://example.test/p/123" };
      },
    });
    setAdapters([new MetaAdapter(), flaky]);
    const acc = await signup();
    await connectSandbox(acc);
    const item = await approvedContent(acc);
    await scheduleNowish(acc, item.id);
    await dispatchDuePublications();
    await drainQueue();
    let pub = await prisma.publication.findFirstOrThrow({ where: { contentId: item.id } });
    expect(pub.status).toBe("PUBLISHING");
    await prisma.job.updateMany({ where: { type: "social.publish", status: "QUEUED" }, data: { runAt: new Date() } });
    await drainQueue();
    pub = await prisma.publication.findFirstOrThrow({ where: { contentId: item.id } });
    expect(pub.status).toBe("PUBLISHED");
    expect(pub.externalUrl).toBe("https://example.test/p/123");
    expect(await prisma.publicationAttempt.count({ where: { publicationId: pub.id } })).toBe(2);
  });

  it("annule les publications en file à la déprogrammation", async () => {
    const acc = await signup();
    await connectSandbox(acc);
    const item = await approvedContent(acc);
    await scheduleNowish(acc, item.id);
    const app = await getApp();
    await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/${item.id}/unschedule`, headers: auth(acc) });
    expect((await prisma.publication.findFirstOrThrow({ where: { contentId: item.id } })).status).toBe("CANCELLED");
  });

  it("relève des statistiques marquées simulées et ne les mélange pas aux réelles", async () => {
    const acc = await signup();
    await connectSandbox(acc);
    const item = await approvedContent(acc);
    await scheduleNowish(acc, item.id);
    await dispatchDuePublications();
    await drainQueue();
    await collectMetrics();
    await collectMetrics(); // même heure : pas de doublon
    const pub = await prisma.publication.findFirstOrThrow({ where: { contentId: item.id } });
    expect(await prisma.socialMetricSnapshot.count({ where: { publicationId: pub.id } })).toBe(1);
    const app = await getApp();
    const overview = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/social/overview`, headers: auth(acc) })).json();
    expect(overview.simulated.publications).toBe(1);
    expect(overview.real.publications).toBe(0);
  });
});

describe("Adaptateur Meta (Graph API simulée)", () => {
  const graph = (routes: Record<string, unknown>, status = 200): typeof fetch =>
    (async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const key = Object.keys(routes).find((k) => url.pathname.endsWith(k));
      return new Response(JSON.stringify(key ? routes[key] : { error: { message: "not found", code: 100 } }), { status: key ? status : 400 });
    }) as typeof fetch;

  it("récupère Pages et comptes Instagram, publie et traduit les erreurs", async () => {
    process.env.META_APP_ID = "app";
    process.env.META_APP_SECRET = "secret";
    resetConfigCache();
    try {
      const meta = new MetaAdapter(
        graph({
          "/oauth/access_token": { access_token: "tok", expires_in: 5000000 },
          "/me/accounts": { data: [{ id: "123", name: "Boutique Awa", access_token: "page-tok", instagram_business_account: { id: "ig9", username: "boutique.awa" } }] },
          "/123/feed": { id: "123_456" },
        }),
      );
      const accounts = await meta.exchange("code", "https://api.test/cb");
      expect(accounts.map((a) => a.provider)).toEqual(["FACEBOOK_PAGE", "INSTAGRAM_BUSINESS"]);
      expect(accounts[1]!.name).toBe("@boutique.awa");
      const res = await meta.publish({ provider: "FACEBOOK_PAGE", externalId: "123" }, "page-tok", { text: "Bonjour" });
      expect(res.url).toBe("https://www.facebook.com/123/posts/456");
      await expect(meta.publish({ provider: "INSTAGRAM_BUSINESS", externalId: "ig9" }, "t", { text: "x" })).rejects.toMatchObject({ code: "NEEDS_MEDIA" });
      const expired = new MetaAdapter(graph({ "/123/feed": { error: { message: "expired", code: 190 } } }, 400));
      await expect(expired.publish({ provider: "FACEBOOK_PAGE", externalId: "123" }, "t", { text: "x" })).rejects.toMatchObject({ code: "AUTH" });
      const down = new MetaAdapter(graph({ "/123/feed": { error: { message: "oops", code: 2 } } }, 500));
      await expect(down.publish({ provider: "FACEBOOK_PAGE", externalId: "123" }, "t", { text: "x" })).rejects.toMatchObject({ code: "TRANSIENT" });
    } finally {
      delete process.env.META_APP_ID;
      delete process.env.META_APP_SECRET;
      resetConfigCache();
    }
  });
});

describe("Adaptateur LinkedIn (API simulée)", () => {
  type Call = { url: string; init?: RequestInit };
  const linkedin = (routes: Record<string, { status?: number; body?: unknown; headers?: Record<string, string> }>, calls: Call[] = []): typeof fetch =>
    (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      const url = new URL(String(input));
      const key = Object.keys(routes).find((k) => url.pathname.endsWith(k));
      const r = key ? routes[key]! : { status: 404, body: { message: "not found" } };
      return new Response(JSON.stringify(r.body ?? {}), { status: r.status ?? 200, headers: r.headers });
    }) as typeof fetch;

  it("connecte le profil (et les pages administrées), publie via la Posts API et traduit les erreurs", async () => {
    process.env.LINKEDIN_CLIENT_ID = "client";
    process.env.LINKEDIN_CLIENT_SECRET = "secret";
    resetConfigCache();
    try {
      const calls: Call[] = [];
      const li = new LinkedInAdapter(
        linkedin(
          {
            "/oauth/v2/accessToken": { body: { access_token: "tok", expires_in: 5184000, scope: "openid,profile,w_member_social,rw_organization_admin" } },
            "/v2/userinfo": { body: { sub: "abc", name: "Awa Koné" } },
            "/rest/organizationAcls": { body: { elements: [{ organization: "urn:li:organization:42" }] } },
            "/rest/organizations/42": { body: { localizedName: "Boutique Awa" } },
            "/rest/posts": { status: 201, headers: { "x-restli-id": "urn:li:share:777" } },
          },
          calls,
        ),
      );
      expect(li.isConfigured()).toBe(true);
      expect(li.authorizeUrl("st", "https://app.test/cb")).toContain("scope=openid+profile+w_member_social");
      const accounts = await li.exchange("code", "https://app.test/cb");
      expect(accounts.map((a) => [a.provider, a.externalId, a.name])).toEqual([
        ["LINKEDIN", "urn:li:person:abc", "Awa Koné (profil)"],
        ["LINKEDIN", "urn:li:organization:42", "Boutique Awa"],
      ]);
      const res = await li.publish({ provider: "LINKEDIN", externalId: "urn:li:organization:42" }, "tok", { text: "Bonjour", link: "https://forlife.test" });
      expect(res).toEqual({ externalId: "urn:li:share:777", url: "https://www.linkedin.com/feed/update/urn:li:share:777/" });
      const post = calls.find((c) => c.url.endsWith("/rest/posts"))!;
      expect(JSON.parse(String(post.init!.body))).toMatchObject({ author: "urn:li:organization:42", commentary: "Bonjour\n\nhttps://forlife.test", lifecycleState: "PUBLISHED" });
      expect((post.init!.headers as Record<string, string>)["LinkedIn-Version"]).toMatch(/^\d{6}$/);

      const expired = new LinkedInAdapter(linkedin({ "/rest/posts": { status: 401, body: { message: "expired" } } }));
      await expect(expired.publish({ provider: "LINKEDIN", externalId: "urn:li:person:abc" }, "t", { text: "x" })).rejects.toMatchObject({ code: "AUTH" });
      const busy = new LinkedInAdapter(linkedin({ "/rest/posts": { status: 429 } }));
      await expect(busy.publish({ provider: "LINKEDIN", externalId: "urn:li:person:abc" }, "t", { text: "x" })).rejects.toMatchObject({ code: "RATE_LIMIT" });
      const down = new LinkedInAdapter(linkedin({ "/rest/posts": { status: 503 } }));
      await expect(down.publish({ provider: "LINKEDIN", externalId: "urn:li:person:abc" }, "t", { text: "x" })).rejects.toMatchObject({ code: "TRANSIENT" });
    } finally {
      delete process.env.LINKEDIN_CLIENT_ID;
      delete process.env.LINKEDIN_CLIENT_SECRET;
      resetConfigCache();
    }
  });
});

describe("Adaptateur TikTok (API simulée)", () => {
  type Call = { url: string; init?: RequestInit };
  const tiktok = (routes: Record<string, { status?: number; body?: unknown }>, calls: Call[] = []): typeof fetch =>
    (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      const url = new URL(String(input));
      const key = Object.keys(routes).find((k) => url.pathname.endsWith(k));
      const r = key ? routes[key]! : { status: 404, body: { error: { code: "not_found", message: "not found" } } };
      return new Response(JSON.stringify(r.body ?? {}), { status: r.status ?? 200 });
    }) as typeof fetch;
  const withKeys = async (fn: () => Promise<void>) => {
    process.env.TIKTOK_CLIENT_KEY = "ck";
    process.env.TIKTOK_CLIENT_SECRET = "cs";
    resetConfigCache();
    try {
      await fn();
    } finally {
      delete process.env.TIKTOK_CLIENT_KEY;
      delete process.env.TIKTOK_CLIENT_SECRET;
      resetConfigCache();
    }
  };
  const ok = { error: { code: "ok", message: "" } };

  it("connecte le compte, envoie la vidéo dans les brouillons et lit les statistiques", () =>
    withKeys(async () => {
      const calls: Call[] = [];
      const tt = new TikTokAdapter(
        tiktok(
          {
            "/oauth/token/": { body: { access_token: "act", refresh_token: "rft", expires_in: 86400, open_id: "oid", scope: "user.info.basic,video.upload,video.list" } },
            "/user/info/": { body: { data: { user: { open_id: "oid", display_name: "Boutique Awa" } }, ...ok } },
            "/inbox/video/init/": { body: { data: { publish_id: "v_inbox_1", upload_url: "https://upload.tiktok.test/up/1" }, ...ok } },
            "/up/1": { status: 201 },
            "/status/fetch/": { body: { data: { status: "PUBLISH_COMPLETE", publicaly_available_post_id: [7_123] }, ...ok } },
            "/video/query/": { body: { data: { videos: [{ id: "7123", view_count: 900, like_count: 40, comment_count: 5, share_count: 3 }] }, ...ok } },
          },
          calls,
        ),
      );
      expect(tt.isConfigured()).toBe(true);
      const auth = new URL(tt.authorizeUrl("st", "https://app.test/social/callback/tiktok"));
      expect(auth.searchParams.get("client_key")).toBe("ck");
      expect(auth.searchParams.get("scope")).toBe("user.info.basic,video.upload,video.list");
      const [acc] = await tt.exchange("code", "https://app.test/social/callback/tiktok");
      expect(acc).toMatchObject({ provider: "TIKTOK", externalId: "oid", name: "Boutique Awa (TikTok)", accessToken: "act", refreshToken: "rft" });
      expect(acc!.expiresAt!.getTime()).toBeGreaterThan(Date.now());

      const video = Buffer.alloc(2048, 1);
      const res = await tt.publish({ provider: "TIKTOK", externalId: "oid" }, "act", { text: "Promo", loadVideo: async () => video });
      expect(res).toEqual({ externalId: "v_inbox_1", url: null });
      const init = calls.find((c) => c.url.includes("/inbox/video/init/"))!;
      expect(JSON.parse(String(init.init!.body))).toEqual({ source_info: { source: "FILE_UPLOAD", video_size: 2048, chunk_size: 2048, total_chunk_count: 1 } });
      const put = calls.find((c) => c.url.endsWith("/up/1"))!;
      expect((put.init!.headers as Record<string, string>)["content-range"]).toBe("bytes 0-2047/2048");

      expect(await tt.fetchMetrics({ provider: "TIKTOK", externalId: "oid" }, "act", "v_inbox_1")).toEqual({ impressions: 900, reach: 900, engagement: 48, clicks: 0, isSimulated: false });
    }));

  it("exige une vidéo et traduit les erreurs TikTok", () =>
    withKeys(async () => {
      const tt = new TikTokAdapter(tiktok({}));
      await expect(tt.publish({ provider: "TIKTOK", externalId: "oid" }, "t", { text: "x", loadVideo: async () => null })).rejects.toMatchObject({ code: "NEEDS_MEDIA" });
      const v = { text: "x", loadVideo: async () => Buffer.alloc(10) };
      const expired = new TikTokAdapter(tiktok({ "/inbox/video/init/": { status: 401, body: { error: { code: "access_token_invalid", message: "invalid" } } } }));
      await expect(expired.publish({ provider: "TIKTOK", externalId: "oid" }, "t", v)).rejects.toMatchObject({ code: "AUTH" });
      const spam = new TikTokAdapter(tiktok({ "/inbox/video/init/": { status: 403, body: { error: { code: "spam_risk_too_many_pending_share", message: "pending" } } } }));
      await expect(spam.publish({ provider: "TIKTOK", externalId: "oid" }, "t", v)).rejects.toMatchObject({ code: "RATE_LIMIT" });
      const pending = new TikTokAdapter(tiktok({ "/status/fetch/": { body: { data: { status: "SEND_TO_USER_INBOX" }, ...ok } } }));
      expect((await pending.fetchMetrics({ provider: "TIKTOK", externalId: "oid" }, "t", "p")).impressions).toBe(0);
    }));

  it("renouvelle un jeton qui expire et le ré-enregistre chiffré", () =>
    withKeys(async () => {
      setAdapters([new TikTokAdapter(tiktok({ "/oauth/token/": { body: { access_token: "neuf", refresh_token: "rft2", expires_in: 86400 } } }))]);
      const acc = await signup();
      const { encryptSecret, decryptSecret } = await import("../src/lib/crypto.js");
      const { loadConfig } = await import("../src/config.js");
      const key = loadConfig().ENCRYPTION_KEY;
      const account = await prisma.socialAccount.create({
        data: { workspaceId: acc.workspaceId, provider: "TIKTOK", externalId: "oid", name: "TikTok", scopes: [], credential: { create: { accessTokenEnc: encryptSecret("vieux", key), refreshTokenEnc: encryptSecret("rft", key), expiresAt: new Date(Date.now() + 60_000) } } },
        include: { credential: true },
      });
      expect(await accessTokenFor({ ...account, credential: account.credential! })).toBe("neuf");
      const cred = await prisma.socialCredential.findUniqueOrThrow({ where: { socialAccountId: account.id } });
      expect(decryptSecret(cred.accessTokenEnc, key)).toBe("neuf");
      expect(decryptSecret(cred.refreshTokenEnc!, key)).toBe("rft2");
      expect(cred.expiresAt!.getTime()).toBeGreaterThan(Date.now() + 3600_000);
    }));
});

describe("Adaptateur YouTube (API simulée)", () => {
  type Call = { url: string; init?: RequestInit };
  type Route = { status?: number; body?: unknown; headers?: Record<string, string> };
  const google = (routes: Record<string, Route>, calls: Call[] = []): typeof fetch =>
    (async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      const url = new URL(String(input));
      const key = Object.keys(routes).find((k) => (url.pathname + url.search).includes(k));
      const r = key ? routes[key]! : { status: 404, body: { error: { code: 404, message: "not found" } } };
      return new Response(JSON.stringify(r.body ?? {}), { status: r.status ?? 200, headers: r.headers });
    }) as typeof fetch;
  const withKeys = async (fn: () => Promise<void>) => {
    process.env.GOOGLE_CLIENT_ID = "gid.apps.googleusercontent.com";
    process.env.GOOGLE_CLIENT_SECRET = "gs";
    resetConfigCache();
    try {
      await fn();
    } finally {
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      resetConfigCache();
    }
  };

  it("connecte la chaîne, envoie la vidéo en privé et lit les statistiques", () =>
    withKeys(async () => {
      const calls: Call[] = [];
      const yt = new YouTubeAdapter(
        google(
          {
            "/token": { body: { access_token: "ya29", refresh_token: "1//rt", expires_in: 3599, scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly" } },
            "/channels?": { body: { items: [{ id: "UC123", snippet: { title: "Boutique Awa", thumbnails: { default: { url: "https://yt.test/a.jpg" } } } }] } },
            "uploadType=resumable": { headers: { location: "https://www.googleapis.com/upload/session/42" } },
            "/upload/session/42": { body: { id: "vid42" } },
            "/videos?part=statistics": { body: { items: [{ statistics: { viewCount: "1200", likeCount: "80", commentCount: "6" } }] } },
          },
          calls,
        ),
      );
      const auth = new URL(yt.authorizeUrl("st", "https://app.test/social/callback/youtube"));
      expect(auth.searchParams.get("access_type")).toBe("offline");
      expect(auth.searchParams.get("scope")).toContain("youtube.upload");
      const [acc] = await yt.exchange("code", "https://app.test/social/callback/youtube");
      expect(acc).toMatchObject({ provider: "YOUTUBE", externalId: "UC123", name: "Boutique Awa (YouTube)", refreshToken: "1//rt" });

      const res = await yt.publish({ provider: "YOUTUBE", externalId: "UC123" }, "ya29", { text: "Promo <rentrée>\nTout à -20 %", loadVideo: async () => Buffer.alloc(4096, 2) });
      expect(res).toEqual({ externalId: "vid42", url: "https://youtu.be/vid42" });
      const start = calls.find((c) => c.url.includes("uploadType=resumable"))!;
      expect(JSON.parse(String(start.init!.body))).toMatchObject({ snippet: { title: "Promo rentrée" }, status: { privacyStatus: "private", selfDeclaredMadeForKids: false } });
      expect((start.init!.headers as Record<string, string>)["x-upload-content-length"]).toBe("4096");

      expect(await yt.fetchMetrics({ provider: "YOUTUBE", externalId: "UC123" }, "ya29", "vid42")).toEqual({ impressions: 1200, reach: 1200, engagement: 86, clicks: 0, isSimulated: false });
      expect((await yt.refresh("1//rt")).refreshToken).toBe("1//rt");
    }));

  it("exige une vidéo, traduit les erreurs et borne le titre", () =>
    withKeys(async () => {
      const v = { text: "x", loadVideo: async () => Buffer.alloc(10) };
      await expect(new YouTubeAdapter(google({})).publish({ provider: "YOUTUBE", externalId: "UC" }, "t", { text: "x", loadVideo: async () => null })).rejects.toMatchObject({ code: "NEEDS_MEDIA" });
      const quota = new YouTubeAdapter(google({ "uploadType=resumable": { status: 403, body: { error: { code: 403, message: "quota", errors: [{ reason: "quotaExceeded" }] } } } }));
      await expect(quota.publish({ provider: "YOUTUBE", externalId: "UC" }, "t", v)).rejects.toMatchObject({ code: "RATE_LIMIT" });
      const expired = new YouTubeAdapter(google({ "uploadType=resumable": { status: 401, body: { error: { code: 401, message: "Invalid Credentials" } } } }));
      await expect(expired.publish({ provider: "YOUTUBE", externalId: "UC" }, "t", v)).rejects.toMatchObject({ code: "AUTH" });
      const revoked = new YouTubeAdapter(google({ "/token": { status: 400, body: { error: "invalid_grant", error_description: "Token has been expired or revoked." } } }));
      await expect(revoked.refresh("rt")).rejects.toMatchObject({ code: "AUTH" });
      expect(youtubeTitle("a".repeat(150))).toHaveLength(100);
      expect(youtubeTitle("\n\n")).toBe("Nouvelle vidéo");
    }));
});
