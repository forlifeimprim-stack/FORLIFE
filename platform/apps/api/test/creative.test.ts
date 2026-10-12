import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { composeSvg, contrast, palettes, renderPng } from "../src/modules/creative/composer.js";
import { critique } from "../src/modules/creative/critic.js";
import { signedMediaUrl } from "../src/modules/creative/service.js";
import { dispatchDuePublications } from "../src/modules/social/service.js";
import { setAdapters } from "../src/modules/social/registry.js";
import { SandboxAdapter } from "../src/modules/social/sandbox.js";
import { encryptSecret } from "../src/lib/crypto.js";
import { auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

afterEach(() => setAdapters(undefined));

/** Une vraie image PNG (rendue par le moteur) servant de « photo produit ». */
function productPng() {
  return renderPng('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#2a6"/><circle cx="200" cy="150" r="90" fill="#fff"/></svg>');
}

async function uploadPhoto(acc: TestAccount) {
  const app = await getApp();
  const boundary = "----forlife";
  const png = productPng();
  const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="type"\r\n\r\nphoto\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="produit.png"\r\nContent-Type: image/png\r\n\r\n`);
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/assets`, headers: { ...auth(acc), "content-type": `multipart/form-data; boundary=${boundary}` }, payload: Buffer.concat([head, png, Buffer.from(`\r\n--${boundary}--\r\n`)]) });
  expect(res.statusCode).toBe(201);
  return res.json().id as string;
}

async function newBrief(acc: TestAccount, extra: Record<string, unknown> = {}) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/creative/briefs`, headers: auth(acc), payload: { subject: "Bâches imprimées en 48 h", objective: "SALES", format: "SQUARE", cta: "Devis sur WhatsApp", ...extra } });
  expect(res.statusCode).toBe(202);
  await drainQueue();
  return (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/creative/briefs/${res.json().briefId}`, headers: auth(acc) })).json();
}

describe("Moteur de design", () => {
  it("compose un PNG aux bonnes dimensions pour chaque format et mise en page", () => {
    const pal = palettes("#EA7822");
    for (const format of ["SQUARE", "PORTRAIT", "STORY", "LANDSCAPE"] as const) {
      for (const layout of ["BOLD", "PRODUCT_HERO", "SPLIT", "OFFER_BADGE", "QUOTE"] as const) {
        const r = composeSvg({ format, layout, palette: pal.dark, headline: "Un titre assez long pour tester le retour à la ligne", subline: "Sous-titre", cta: "Commander", offer: "-15 %", brandName: "Test" });
        const png = renderPng(r.svg);
        expect(png.subarray(0, 4).toString("hex")).toBe("89504e47");
        expect(png.readUInt32BE(16)).toBe(r.width);
        expect(png.readUInt32BE(20)).toBe(r.height);
      }
    }
  });

  it("échappe le texte (aucune injection SVG possible)", () => {
    const r = composeSvg({ format: "SQUARE", layout: "BOLD", palette: palettes().dark, headline: '<script>alert(1)</script> & "x"', brandName: "<b>" });
    expect(r.svg).not.toContain("<script>");
    expect(r.svg).toContain("&lt;script&gt;");
  });

  it("le Critic mesure le contraste et repère les mots interdits", () => {
    expect(contrast("#FFFFFF", "#000000")).toBeCloseTo(21, 0);
    const base = { objective: "SALES" as const, hasPhoto: false, hasLogo: false, brandColor: null, metrics: { headlineLines: 2, headlineSize: 90, textOverPhoto: false } };
    const spec = { format: "SQUARE" as const, layout: "BOLD" as const, palette: { bg: "#EEEEEE", fg: "#DDDDDD", accent: "#EA7822", muted: "#999" }, headline: "Le meilleur du monde, pas cher", brandName: "X" };
    const r = critique({ ...base, spec, forbiddenWords: ["pas cher"] });
    expect(r.dimensions.find((d) => d.key === "legibility")!.score).toBeLessThan(50);
    expect(r.dimensions.find((d) => d.key === "brand")!.score).toBeLessThanOrEqual(20);
    expect(r.recommendations.length).toBeGreaterThan(0);
    expect(r.disclaimer).toMatch(/pas une prédiction/);
  });
});

describe("Creative Studio", () => {
  it("produit 3 concepts rendus, met la vraie photo produit en vedette et facture une fois", async () => {
    const acc = await signup();
    const photoId = await uploadPhoto(acc);
    const brief = await newBrief(acc, { productAssetId: photoId });
    expect(brief.concepts).toHaveLength(3);
    expect(brief.concepts.every((c: { versions: unknown[] }) => c.versions.length === 1)).toBe(true);
    expect(brief.concepts.some((c: { layout: string }) => c.layout === "PRODUCT_HERO")).toBe(true);
    expect(brief.concepts.some((c: { layout: string }) => c.layout === "OFFER_BADGE")).toBe(false); // pas d'offre dans le brief
    const v = brief.concepts[0].versions[0];
    expect(v.critic.dimensions.length).toBe(6);
    const app = await getApp();
    const img = await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/creative/versions/${v.id}/image`, headers: auth(acc) });
    expect(img.headers["content-type"]).toBe("image/png");
    expect((await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: acc.organizationId } })).balance).toBe(194);
  });

  it("régénère une version ciblée de façon idempotente et conserve l'historique", async () => {
    const acc = await signup();
    const brief = await newBrief(acc, { offer: "-20 %" });
    const app = await getApp();
    const conceptId = brief.concepts[0].id;
    const requestId = randomUUID();
    const send = () => app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/creative/concepts/${conceptId}/versions`, headers: auth(acc), payload: { requestId, headline: "Nouveau titre plus court", mood: "light", layout: "OFFER_BADGE" } });
    const a = await send();
    const b = await send();
    expect(a.statusCode).toBe(201);
    expect(b.json().id).toBe(a.json().id);
    expect(a.json().version).toBe(2);
    expect(a.json().spec.headline).toBe("Nouveau titre plus court");
    expect((await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: acc.organizationId } })).balance).toBe(200 - 6 - 2);
    expect(await prisma.aIUsageEvent.count({ where: { organizationId: acc.organizationId, kind: "IMAGE" } })).toBe(1);
  });

  it("le visuel approuvé devient le média du contenu et part sur Instagram via une URL signée", async () => {
    const acc = await signup();
    const item = await prisma.contentItem.create({ data: { workspaceId: acc.workspaceId, title: "Post IG", body: "Hello", status: "APPROVED" } });
    await prisma.contentVariant.create({ data: { contentId: item.id, channel: "INSTAGRAM", body: "Légende Instagram" } });
    const brief = await newBrief(acc, { contentId: item.id });
    const app = await getApp();
    const versionId = brief.concepts[1].versions[0].id;
    await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/creative/versions/${versionId}/approve`, headers: auth(acc) });
    expect((await prisma.contentItem.findUniqueOrThrow({ where: { id: item.id } })).mediaVersionId).toBe(versionId);

    // URL signée : valide, puis altérée
    const url = new URL(signedMediaUrl(versionId));
    expect((await app.inject({ method: "GET", url: `${url.pathname}${url.search}` })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: `${url.pathname}${url.search.replace(/s=./, "s=X")}` })).statusCode).toBe(404);

    // Compte Instagram connecté (adaptateur espion) : le visuel est transmis
    let seen: string | null | undefined;
    const spy = Object.assign(Object.create(SandboxAdapter.prototype), new SandboxAdapter(), {
      providers: ["SANDBOX", "INSTAGRAM_BUSINESS"],
      async publish(_a: unknown, _t: string, post: { imageUrl?: string | null }) {
        seen = post.imageUrl;
        return { externalId: "ig_1", url: null };
      },
    });
    setAdapters([spy]);
    const account = await prisma.socialAccount.create({ data: { workspaceId: acc.workspaceId, provider: "INSTAGRAM_BUSINESS", externalId: "ig9", name: "@test" } });
    await prisma.socialCredential.create({ data: { socialAccountId: account.id, accessTokenEnc: encryptSecret("tok", process.env.ENCRYPTION_KEY!) } });
    await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/${item.id}/schedule`, headers: auth(acc), payload: { scheduledAt: new Date(Date.now() + 60_000).toISOString() } });
    await prisma.publication.updateMany({ where: { contentId: item.id }, data: { scheduledAt: new Date(Date.now() - 1000) } });
    await dispatchDuePublications();
    await drainQueue();
    expect(seen).toContain(`/api/public/media/${versionId}?e=`);
  });
});
