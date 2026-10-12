import { afterEach, describe, expect, it } from "vitest";
import { drainQueue, processJob } from "../src/modules/jobs/queue.js";
import { collectMetrics, dispatchDuePublications } from "../src/modules/social/service.js";
import { setAdapters } from "../src/modules/social/registry.js";
import { MetaAdapter } from "../src/modules/social/meta.js";
import { SandboxAdapter } from "../src/modules/social/sandbox.js";
import { SocialError, type SocialProviderAdapter } from "../src/modules/social/types.js";
import { resetConfigCache } from "../src/config.js";
import { addMember, auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

afterEach(() => setAdapters(undefined));

async function connectSandbox(acc: TestAccount) {
  const app = await getApp();
  const { url } = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/connect`, headers: auth(acc), payload: { connector: "sandbox" } })).json();
  const cb = new URL(url);
  const res = await app.inject({ method: "GET", url: `${cb.pathname}${cb.search}` });
  return { res, callbackPath: `${cb.pathname}${cb.search}` };
}

/** Crée un contenu approuvé avec une variante Facebook, prêt à programmer. */
async function approvedContent(acc: TestAccount, body = "Nouvelle collection disponible") {
  const item = await prisma.contentItem.create({ data: { workspaceId: acc.workspaceId, title: "Post test", body, status: "APPROVED" } });
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
    const { res, callbackPath } = await connectSandbox(acc);
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain("/social?connected=1");
    const account = await prisma.socialAccount.findFirstOrThrow({ where: { workspaceId: acc.workspaceId }, include: { credential: true } });
    expect(account.credential?.accessTokenEnc).not.toContain("sandbox-token");
    const app = await getApp();
    const replay = await app.inject({ method: "GET", url: callbackPath });
    expect(replay.headers.location).toContain("error=");
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
