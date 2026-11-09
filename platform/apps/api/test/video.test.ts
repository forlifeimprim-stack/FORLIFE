import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { loadConfig } from "../src/config.js";
import { renderPng } from "../src/modules/creative/composer.js";
import { qualityCheck } from "../src/modules/video/service.js";
import { auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

const balance = async (orgId: string) => (await prisma.creditWallet.findUniqueOrThrow({ where: { organizationId: orgId } })).balance;

async function uploadPhoto(acc: TestAccount) {
  const app = await getApp();
  const boundary = "----forlife";
  const png = renderPng('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#36a"/></svg>');
  const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="type"\r\n\r\nphoto\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="p.png"\r\nContent-Type: image/png\r\n\r\n`);
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/assets`, headers: { ...auth(acc), "content-type": `multipart/form-data; boundary=${boundary}` }, payload: Buffer.concat([head, png, Buffer.from(`\r\n--${boundary}--\r\n`)]) });
  expect(res.statusCode).toBe(201);
  return res.json().id as string;
}

async function newProject(acc: TestAccount, extra: Record<string, unknown> = {}) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/video/projects`, headers: auth(acc), payload: { title: "Bâches en 48 h", objective: "SALES", brief: "Montrer la rapidité de livraison de nos bâches imprimées", cta: "Écrivez-nous", durationTarget: 10, ...extra } });
  expect(res.statusCode).toBe(202);
  await drainQueue();
  return (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/video/projects/${res.json().projectId}`, headers: auth(acc) })).json();
}

describe("Video Studio", () => {
  it("le contrôle qualité applique des règles explicites", () => {
    const good = qualityCheck({ durationTarget: 10, objective: "SALES", cta: "Go" }, [
      { duration: 1.8, overlay: "Livré en 48 h", caption: "a", assetId: "x" },
      { duration: 2.9, overlay: "Qualité pro", caption: "b", assetId: null },
      { duration: 2.8, overlay: "Prix doux", caption: "c", assetId: null },
    ]);
    expect(good.score).toBe(100);
    const bad = qualityCheck({ durationTarget: 15, objective: "SALES", cta: null }, [{ duration: 4, overlay: "un deux trois quatre cinq six sept", caption: "", assetId: null }]);
    expect(bad.score).toBeLessThan(30);
    expect(bad.checks.filter((c) => !c.ok).length).toBeGreaterThanOrEqual(6);
  });

  it("produit un storyboard calé sur la durée cible avec la vraie photo", async () => {
    const acc = await signup();
    const photo = await uploadPhoto(acc);
    const p = await newProject(acc, { productAssetIds: [photo] });
    expect(p.status).toBe("STORYBOARD");
    expect(p.scenes.length).toBeGreaterThanOrEqual(3);
    expect(p.scenes.length).toBeLessThanOrEqual(5);
    const total = p.scenes.reduce((n: number, s: { duration: number }) => n + s.duration, 0);
    expect(Math.abs(total + 2.5 - 10)).toBeLessThan(0.6);
    expect(p.scenes.some((s: { assetId: string | null }) => s.assetId === photo)).toBe(true);
    expect(await balance(acc.organizationId)).toBe(200 - 8);
  });

  it("refuse une photo d'un autre espace", async () => {
    const [a, b] = [await signup(), await signup()];
    const photo = await uploadPhoto(b);
    const app = await getApp();
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${a.workspaceId}/video/projects`, headers: auth(a), payload: { title: "Test", objective: "SALES", brief: "Un brief suffisamment long", productAssetIds: [photo] } });
    expect(res.statusCode).toBe(400);
  });

  it("rend un MP4 9:16 avec sous-titres, facture une seule fois (double clic)", async () => {
    const acc = await signup();
    const app = await getApp();
    const p = await newProject(acc);
    // Édition ciblée d'une scène
    const scene = p.scenes[0];
    const patch = await app.inject({ method: "PATCH", url: `/api/workspaces/${acc.workspaceId}/video/scenes/${scene.id}`, headers: auth(acc), payload: { overlay: "Livré en 48 h", motion: "POP" } });
    expect(patch.statusCode).toBe(200);
    const requestId = randomUUID();
    const r1 = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/video/projects/${p.id}/render`, headers: auth(acc), payload: { requestId } });
    expect(r1.statusCode).toBe(202);
    const r2 = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/video/projects/${p.id}/render`, headers: auth(acc), payload: { requestId } });
    expect(r2.json().id).toBe(r1.json().id);
    expect(await balance(acc.organizationId)).toBe(200 - 8 - 15);
    await drainQueue();
    const after = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/video/projects/${p.id}`, headers: auth(acc) })).json();
    expect(after.status).toBe("RENDERED");
    const render = after.renders[0];
    expect(render.status).toBe("SUCCEEDED");
    expect(render.score).toBeGreaterThan(0);
    const file = await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/video/renders/${render.id}/file`, headers: auth(acc) });
    expect(file.statusCode).toBe(200);
    expect(file.headers["content-type"]).toBe("video/mp4");
    expect(file.rawPayload.subarray(4, 8).toString()).toBe("ftyp");
    const srt = await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/video/renders/${render.id}/file?format=srt`, headers: auth(acc) });
    expect(srt.body).toContain("-->");
    // Isolation : un autre client ne peut pas télécharger la vidéo
    const other = await signup();
    const leak = await app.inject({ method: "GET", url: `/api/workspaces/${other.workspaceId}/video/renders/${render.id}/file`, headers: auth(other) });
    expect(leak.statusCode).toBe(404);
    const ok = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/video/renders/${render.id}/approve`, headers: auth(acc) });
    expect(ok.statusCode).toBe(200);
  }, 180_000);

  it("rembourse les crédits si le rendu échoue", async () => {
    const acc = await signup();
    const app = await getApp();
    const p = await newProject(acc);
    const cfg = loadConfig();
    const original = cfg.FFMPEG_PATH;
    cfg.FFMPEG_PATH = "/nonexistent/ffmpeg";
    try {
      await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/video/projects/${p.id}/render`, headers: auth(acc), payload: { requestId: randomUUID() } });
      await drainQueue();
    } finally {
      cfg.FFMPEG_PATH = original;
    }
    const after = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/video/projects/${p.id}`, headers: auth(acc) })).json();
    expect(after.status).toBe("FAILED");
    expect(after.renders[0].status).toBe("FAILED");
    expect(after.renders[0].error).toMatch(/FFmpeg/);
    expect(await balance(acc.organizationId)).toBe(200 - 8);
  });
});
