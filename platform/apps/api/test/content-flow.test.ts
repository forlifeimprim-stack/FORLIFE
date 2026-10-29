import { describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { addMember, auth, getApp, prisma, signup } from "./helpers.js";

const idea = { angle: "Coulisses", hook: "Voici comment on imprime vos bâches", message: "Montrer le savoir-faire", cta: "Demandez un devis sur WhatsApp" };

async function generatePost(acc: Awaited<ReturnType<typeof signup>>, channels = ["FACEBOOK", "INSTAGRAM", "WHATSAPP"]) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/generate`, headers: auth(acc), payload: { idea, channels } });
  expect(res.statusCode).toBe(202);
  await drainQueue();
  return res.json() as { jobId: string; contentId: string };
}

describe("Content Factory & workflow d'approbation", () => {
  it("génère des idées à partir d'un objectif (stratégie avant génération)", async () => {
    const acc = await signup();
    const app = await getApp();
    const noObjective = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/ideas`, headers: auth(acc), payload: {} });
    expect(noObjective.statusCode).toBe(400);
    const objective = await prisma.objective.findFirstOrThrow({ where: { workspaceId: acc.workspaceId } });
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/ideas`, headers: auth(acc), payload: { objectiveId: objective.id, count: 4 } });
    await drainQueue();
    const job = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/jobs/${res.json().jobId}`, headers: auth(acc) })).json();
    expect(job.status).toBe("SUCCEEDED");
    expect(job.result.ideas).toHaveLength(4);
    expect(job.result.isSimulated).toBe(true);
  });

  it("génère un post adapté à chaque réseau puis suit draft → review → approved → scheduled", async () => {
    const acc = await signup();
    const app = await getApp();
    const { contentId } = await generatePost(acc, ["FACEBOOK", "INSTAGRAM", "X", "WHATSAPP"]);
    const content = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}`, headers: auth(acc) })).json();
    expect(content.status).toBe("DRAFT");
    expect(content.variants.map((v: { channel: string }) => v.channel).sort()).toEqual(["FACEBOOK", "INSTAGRAM", "WHATSAPP", "X"]);
    const x = content.variants.find((v: { channel: string }) => v.channel === "X");
    expect(x.body.length).toBeLessThanOrEqual(280);

    // Impossible de programmer sans approbation.
    const early = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}/schedule`, headers: auth(acc), payload: { scheduledAt: new Date(Date.now() + 864e5).toISOString() } });
    expect(early.statusCode).toBe(400);

    expect((await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}/submit`, headers: auth(acc) })).json().status).toBe("REVIEW");
    const [approval] = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/approvals`, headers: auth(acc) })).json();
    const decide = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/approvals/${approval.id}/decide`, headers: auth(acc), payload: { decision: "APPROVED" } });
    expect(decide.statusCode).toBe(200);
    const again = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/approvals/${approval.id}/decide`, headers: auth(acc), payload: { decision: "APPROVED" } });
    expect(again.statusCode).toBe(400);

    const scheduled = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}/schedule`, headers: auth(acc), payload: { scheduledAt: new Date(Date.now() + 864e5).toISOString() } });
    expect(scheduled.json().status).toBe("SCHEDULED");
    const actions = (await prisma.auditLog.findMany({ where: { entityId: contentId }, select: { action: true } })).map((a) => a.action);
    expect(actions).toEqual(expect.arrayContaining(["content.generated", "content.submitted", "approval.approved", "content.scheduled"]));
  });

  it("un éditeur peut soumettre mais pas approuver", async () => {
    const owner = await signup();
    const editor = await addMember(owner, "EDITOR");
    const app = await getApp();
    const { contentId } = await generatePost(owner);
    await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/contents/${contentId}/submit`, headers: auth(editor) });
    const [approval] = (await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/approvals`, headers: auth(editor) })).json();
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/approvals/${approval.id}/decide`, headers: auth(editor), payload: { decision: "APPROVED" } });
    expect(res.statusCode).toBe(403);
  });

  it("refuse une modification concurrente (verrou optimiste) et renvoie en brouillon un contenu modifié", async () => {
    const acc = await signup();
    const app = await getApp();
    const { contentId } = await generatePost(acc);
    const c = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}`, headers: auth(acc) })).json();
    const ok = await app.inject({ method: "PATCH", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}`, headers: auth(acc), payload: { revision: c.revision, title: "Nouveau titre" } });
    expect(ok.statusCode).toBe(200);
    const stale = await app.inject({ method: "PATCH", url: `/api/workspaces/${acc.workspaceId}/contents/${contentId}`, headers: auth(acc), payload: { revision: c.revision, title: "Écrasement" } });
    expect(stale.statusCode).toBe(409);
  });

  it("une approbation ne vaut que pour la version relue : modifier, échouer ou changer de visuel exige une nouvelle validation", async () => {
    const owner = await signup();
    await prisma.subscription.update({ where: { organizationId: owner.organizationId }, data: { planCode: "PRO" } });
    const creator = await addMember(owner, "CREATOR");
    const app = await getApp();
    const { contentId } = await generatePost(owner);
    const url = `/api/workspaces/${owner.workspaceId}/contents/${contentId}`;
    const get = async () => (await app.inject({ method: "GET", url, headers: auth(owner) })).json();
    // v1 soumise, puis modifiée par le créateur avant la décision : la demande périmée est annulée.
    await app.inject({ method: "POST", url: `${url}/submit`, headers: auth(creator) });
    const stale = await prisma.approval.findFirstOrThrow({ where: { entityId: contentId, status: "PENDING" } });
    const c1 = await get();
    expect((await app.inject({ method: "PATCH", url, headers: auth(creator), payload: { revision: c1.revision, body: "Texte jamais relu" } })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/approvals/${stale.id}/decide`, headers: auth(owner), payload: { decision: "APPROVED" } })).statusCode).toBe(400);
    expect((await get()).status).toBe("DRAFT");
    // v2 soumise et approuvée : programmable.
    await app.inject({ method: "POST", url: `${url}/submit`, headers: auth(creator) });
    const fresh = await prisma.approval.findFirstOrThrow({ where: { entityId: contentId, status: "PENDING" } });
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/approvals/${fresh.id}/decide`, headers: auth(owner), payload: { decision: "APPROVED" } })).statusCode).toBe(200);
    // Contenu en échec modifié par le créateur : retour en brouillon, reprogrammation refusée.
    await prisma.contentItem.update({ where: { id: contentId }, data: { status: "FAILED" } });
    const c2 = await get();
    expect((await app.inject({ method: "PATCH", url, headers: auth(creator), payload: { revision: c2.revision, body: "Autre texte non validé" } })).statusCode).toBe(200);
    expect((await get()).status).toBe("DRAFT");
    expect((await app.inject({ method: "POST", url: `${url}/schedule`, headers: auth(creator), payload: { scheduledAt: new Date(Date.now() + 3600_000).toISOString() } })).statusCode).toBe(400);
    // Le créateur ne peut pas « valider » lui-même un visuel ou une vidéo.
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/creative/versions/inexistant/approve`, headers: auth(creator) })).statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/video/renders/inexistant/approve`, headers: auth(creator) })).statusCode).toBe(403);
  });

  it("la génération est idempotente avec un en-tête Idempotency-Key", async () => {
    const acc = await signup();
    const app = await getApp();
    const send = () => app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/contents/generate`, headers: { ...auth(acc), "idempotency-key": "abc-123" }, payload: { idea, channels: ["FACEBOOK"] } });
    const a = (await send()).json();
    const b = (await send()).json();
    expect(a.contentId).toBe(b.contentId);
    expect(await prisma.contentItem.count({ where: { workspaceId: acc.workspaceId } })).toBe(1);
  });
});

describe("Strategy & Brand DNA", () => {
  it("génère un plan traçable, crée des recommandations estimées, et alimente les piliers à l'approbation", async () => {
    const acc = await signup();
    const app = await getApp();
    await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/strategy/plans/generate`, headers: auth(acc), payload: { period: "MONTHLY" } });
    await drainQueue();
    const strategy = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/strategy`, headers: auth(acc) })).json();
    const plan = strategy.plans[0];
    expect(plan.businessProfileVersion).toBe(1);
    expect(plan.objectiveIds).toHaveLength(1);
    expect(plan.aiRunId).toBeTruthy();
    expect(strategy.recommendations.length).toBeGreaterThan(0);
    expect(strategy.recommendations.every((r: { isEstimate: boolean }) => r.isEstimate)).toBe(true);
    await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/strategy/plans/${plan.id}/approve`, headers: auth(acc) });
    expect(await prisma.contentPillar.count({ where: { workspaceId: acc.workspaceId } })).toBeGreaterThan(0);
  });

  it("produit un Brand DNA brouillon versionné qui doit être approuvé par un humain", async () => {
    const acc = await signup();
    const app = await getApp();
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/brand/analyze`, headers: auth(acc), payload: { sources: "Imprimerie de proximité à Bingerville spécialisée en bâches, flyers et impression DTF pour les PME et écoles." } });
    expect(res.statusCode).toBe(202);
    await drainQueue();
    const brand = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/brand`, headers: auth(acc) })).json();
    const g = brand.brand.guidelines[0];
    expect(g.status).toBe("DRAFT");
    expect(g.source).toBe("ai");
    await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/brand/guidelines/${g.id}/approve`, headers: auth(acc) });
    const v2 = (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/brand/guidelines`, headers: auth(acc), payload: { tone: "Plus direct" } })).json();
    expect(v2.version).toBe(2);
    await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/brand/guidelines/${v2.id}/approve`, headers: auth(acc) });
    const statuses = await prisma.brandGuideline.findMany({ where: { brand: { workspaceId: acc.workspaceId } }, orderBy: { version: "asc" }, select: { status: true } });
    expect(statuses.map((s) => s.status)).toEqual(["SUPERSEDED", "APPROVED"]);
  });

  it("refuse les fichiers dont le contenu ne correspond pas au type annoncé", async () => {
    const acc = await signup();
    const app = await getApp();
    const boundary = "----forlife";
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="logo.png"\r\nContent-Type: image/png\r\n\r\n<html>pas une image</html>\r\n--${boundary}--\r\n`;
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/assets`, headers: { ...auth(acc), "content-type": `multipart/form-data; boundary=${boundary}` }, payload: body });
    expect(res.statusCode).toBe(400);
  });
});
