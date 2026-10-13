import { describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { addMember, auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

async function startConversation(acc: TestAccount, agent: string) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/conversations`, headers: auth(acc), payload: { agent } });
  expect(res.statusCode).toBe(201);
  return res.json().id as string;
}

async function ask(acc: TestAccount, conversationId: string, content: string) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/conversations/${conversationId}/messages`, headers: auth(acc), payload: { content } });
  expect(res.statusCode).toBe(202);
  await drainQueue();
  const conv = await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/copilot/conversations/${conversationId}`, headers: auth(acc) });
  expect(conv.statusCode).toBe(200);
  return conv.json() as { conversation: { title: string }; messages: { role: string; status: string; content: string; isSimulated: boolean; actions: { id: string; type: string; status: string; resultType: string | null; resultId: string | null; auto: boolean }[] }[] };
}

describe("AI Copilot & Agents", () => {
  it("répond avec la mémoire de l'entreprise, propose une action et ne l'exécute qu'après accord", async () => {
    const acc = await signup();
    const app = await getApp();
    const home = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/copilot`, headers: auth(acc) })).json();
    expect(home.agents).toHaveLength(12);
    expect(home.settings.mode).toBe("COPILOT");

    const id = await startConversation(acc, "content_writer");
    const conv = await ask(acc, id, "Écris un post pour notre offre de bâches");
    expect(conv.conversation.title).toBe("Écris un post pour notre offre de bâches");
    const answer = conv.messages.at(-1)!;
    expect(answer).toMatchObject({ role: "ASSISTANT", status: "DONE", isSimulated: true });
    expect(answer.content).toContain("Content Writer");
    expect(answer.actions).toHaveLength(1);
    expect(answer.actions[0]).toMatchObject({ type: "content.draft", status: "PROPOSED" });

    // Rien n'est créé tant que l'utilisateur n'a pas approuvé.
    const contentsBefore = await prisma.contentItem.count({ where: { workspaceId: acc.workspaceId } });
    const ok = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/actions/${answer.actions[0]!.id}/approve`, headers: auth(acc) });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toMatchObject({ status: "EXECUTED", resultType: "content" });
    const draft = await prisma.contentItem.findUniqueOrThrow({ where: { id: ok.json().resultId } });
    expect(draft.status).toBe("DRAFT");
    expect(await prisma.contentItem.count({ where: { workspaceId: acc.workspaceId } })).toBe(contentsBefore + 1);
    // Une seule exécution possible, et une trace d'audit.
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/actions/${answer.actions[0]!.id}/approve`, headers: auth(acc) })).statusCode).toBe(409);
    expect(await prisma.auditLog.count({ where: { action: "copilot.action.approved", entityId: answer.actions[0]!.id } })).toBe(1);
  });

  it("mode assisté : aucune action ; autopilot borné : exécution automatique limitée aux types autorisés", async () => {
    const acc = await signup();
    const app = await getApp();
    const put = (payload: object) => app.inject({ method: "PUT", url: `/api/workspaces/${acc.workspaceId}/copilot/settings`, headers: auth(acc), payload });

    expect((await put({ mode: "ASSISTED" })).statusCode).toBe(200);
    const id = await startConversation(acc, "sales_coach");
    const assisted = await ask(acc, id, "Quels leads relancer ?");
    expect(assisted.messages.at(-1)!.actions).toHaveLength(0);

    expect((await put({ mode: "AUTOPILOT", autoActions: ["crm.task"], dailyAutoLimit: 1 })).statusCode).toBe(200);
    const first = await ask(acc, id, "Quels leads relancer aujourd'hui ?");
    expect(first.messages.at(-1)!.actions[0]).toMatchObject({ type: "crm.task", status: "EXECUTED", auto: true, resultType: "crm_task" });
    expect(await prisma.auditLog.count({ where: { action: "copilot.action.auto_executed", workspaceId: acc.workspaceId } })).toBe(1);
    // Limite quotidienne atteinte : la suivante reste une proposition.
    const second = await ask(acc, id, "Et demain ?");
    expect(second.messages.at(-1)!.actions[0]).toMatchObject({ type: "crm.task", status: "PROPOSED", auto: false });
    // Contexte : l'historique de la conversation est conservé.
    expect(second.messages.filter((m) => m.role === "USER")).toHaveLength(3);
  });

  it("respecte les rôles : droits des actions, réglages, conversations privées", async () => {
    const owner = await signup();
    const app = await getApp();
    await prisma.subscription.update({ where: { organizationId: owner.organizationId }, data: { planCode: "PRO" } });
    const creator = await addMember(owner, "CREATOR");
    const viewer = await addMember(owner, "VIEWER");

    // Le lecteur n'a pas accès au Copilot ; le créateur ne peut pas changer les réglages.
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/copilot`, headers: auth(viewer) })).statusCode).toBe(403);
    expect((await app.inject({ method: "PUT", url: `/api/workspaces/${owner.workspaceId}/copilot/settings`, headers: auth(creator), payload: { mode: "AUTOPILOT" } })).statusCode).toBe(403);

    // Le créateur n'a pas accès au CRM : le Sales Coach ne lui propose aucune action CRM.
    const id = await startConversation(creator, "sales_coach");
    const conv = await ask(creator, id, "Quels leads relancer ?");
    expect(conv.messages.at(-1)!.actions).toHaveLength(0);
    // …et sa mémoire ne contient pas les données de vente.
    const run = await prisma.aIRun.findFirstOrThrow({ where: { workspaceId: owner.workspaceId, actorId: creator.userId, taskType: "copilot.chat" } });
    expect((run.input as { memory: string }).memory).not.toContain("Ventes (CRM)");
    expect((run.input as { memory: string }).memory).toContain("Entreprise");

    // Les conversations sont privées : le propriétaire ne voit pas celle du créateur.
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/copilot/conversations/${id}`, headers: auth(owner) })).statusCode).toBe(404);
    const list = (await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/copilot`, headers: auth(owner) })).json();
    expect(list.conversations.map((c: { id: string }) => c.id)).not.toContain(id);

    // Un autre tenant ne peut ni lire ni approuver.
    const stranger = await signup();
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/copilot/conversations/${id}`, headers: auth(stranger) })).statusCode).toBe(404);
  });

  it("débite les crédits, rejette une action et refuse un message pendant une réponse en cours", async () => {
    const acc = await signup();
    const app = await getApp();
    const id = await startConversation(acc, "strategist");
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/conversations/${id}/messages`, headers: auth(acc), payload: { content: "Nos priorités ?" } });
    expect(res.statusCode).toBe(202);
    expect(res.json().estimatedCredits).toBe(2);
    const busy = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/conversations/${id}/messages`, headers: auth(acc), payload: { content: "Encore ?" } });
    expect(busy.statusCode).toBe(409);
    await drainQueue();
    const conv = (await app.inject({ method: "GET", url: `/api/workspaces/${acc.workspaceId}/copilot/conversations/${id}`, headers: auth(acc) })).json();
    const action = conv.messages.at(-1).actions[0];
    expect(action.type).toBe("strategy.recommendation");
    const rej = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/actions/${action.id}/reject`, headers: auth(acc) });
    expect(rej.json().status).toBe("REJECTED");
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/copilot/actions/${action.id}/approve`, headers: auth(acc) })).statusCode).toBe(409);
    const run = await prisma.aIRun.findFirstOrThrow({ where: { workspaceId: acc.workspaceId, taskType: "copilot.chat" } });
    expect(run.status).toBe("SUCCEEDED");
  });
});
