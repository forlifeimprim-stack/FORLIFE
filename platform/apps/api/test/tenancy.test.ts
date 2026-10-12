import { describe, expect, it } from "vitest";
import { addMember, auth, getApp, prisma, signup } from "./helpers.js";

describe("Isolation des tenants et RBAC", () => {
  it("un utilisateur ne voit jamais les données d'une autre organisation (404)", async () => {
    const a = await signup();
    const b = await signup();
    const app = await getApp();
    for (const url of [
      `/api/workspaces/${a.workspaceId}/brand`,
      `/api/workspaces/${a.workspaceId}/strategy`,
      `/api/workspaces/${a.workspaceId}/contents`,
      `/api/workspaces/${a.workspaceId}/dashboard`,
      `/api/orgs/${a.organizationId}/members`,
      `/api/orgs/${a.organizationId}/billing`,
    ]) {
      const res = await app.inject({ method: "GET", url, headers: auth(b) });
      expect(res.statusCode, url).toBe(404);
    }
    const write = await app.inject({ method: "POST", url: `/api/workspaces/${a.workspaceId}/contents`, headers: auth(b), payload: { title: "Intrusion" } });
    expect(write.statusCode).toBe(404);
  });

  it("refuse les références croisées entre workspaces", async () => {
    const a = await signup();
    const b = await signup();
    const app = await getApp();
    const objB = await prisma.objective.findFirstOrThrow({ where: { workspaceId: b.workspaceId } });
    const res = await app.inject({ method: "POST", url: `/api/workspaces/${a.workspaceId}/contents`, headers: auth(a), payload: { title: "Test", objectiveId: objB.id } });
    expect(res.statusCode).toBe(400);
  });

  it("un lecteur peut lire mais pas écrire ni générer", async () => {
    const owner = await signup();
    const viewer = await addMember(owner, "VIEWER");
    const app = await getApp();
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/contents`, headers: auth(viewer) })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/contents`, headers: auth(viewer), payload: { title: "x" } })).statusCode).toBe(403);
    expect(
      (await app.inject({ method: "POST", url: `/api/workspaces/${owner.workspaceId}/contents/ideas`, headers: auth(viewer), payload: { objective: { type: "SALES", title: "Vendre" } } })).statusCode,
    ).toBe(403);
    expect((await app.inject({ method: "GET", url: `/api/orgs/${owner.organizationId}/audit`, headers: auth(viewer) })).statusCode).toBe(403);
  });

  it("une agence n'accède qu'aux workspaces clients qui lui sont assignés", async () => {
    const owner = await signup();
    await prisma.subscription.update({ where: { organizationId: owner.organizationId }, data: { planCode: "AGENCY" } });
    const app = await getApp();
    const ws2 = (await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/workspaces`, headers: auth(owner), payload: { name: "Client B" } })).json();
    const agency = await addMember(owner, "AGENCY", { allWorkspaces: false, workspaceIds: [ws2.id] });
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${ws2.id}/contents`, headers: auth(agency) })).statusCode).toBe(200);
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/contents`, headers: auth(agency) })).statusCode).toBe(404);
    const me = (await app.inject({ method: "GET", url: "/api/me", headers: auth(agency) })).json();
    const org = me.organizations.find((o: { id: string }) => o.id === owner.organizationId);
    expect(org.workspaces.map((w: { id: string }) => w.id)).toEqual([ws2.id]);
  });

  it("empêche l'escalade de privilèges et la suppression du dernier propriétaire", async () => {
    const owner = await signup();
    await prisma.subscription.update({ where: { organizationId: owner.organizationId }, data: { planCode: "PRO" } });
    const admin = await addMember(owner, "ADMIN");
    const app = await getApp();
    const target = await signup();
    const escalate = await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/invitations`, headers: auth(admin), payload: { email: target.email, role: "OWNER" } });
    expect(escalate.statusCode).toBe(403);
    // L'ajout direct (sans invitation acceptée) n'existe plus.
    expect((await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/members`, headers: auth(owner), payload: { email: target.email, role: "VIEWER" } })).statusCode).toBe(404);
    const ownerMembership = await prisma.membership.findFirstOrThrow({ where: { organizationId: owner.organizationId, role: "OWNER" } });
    const removeOwner = await app.inject({ method: "DELETE", url: `/api/orgs/${owner.organizationId}/members/${ownerMembership.id}`, headers: auth(owner) });
    expect(removeOwner.statusCode).toBe(400);
  });

  it("passer un membre en agence restreint toujours son accès aux workspaces assignés", async () => {
    const owner = await signup();
    await prisma.subscription.update({ where: { organizationId: owner.organizationId }, data: { planCode: "AGENCY" } });
    const app = await getApp();
    const ws2 = (await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/workspaces`, headers: auth(owner), payload: { name: "Client B" } })).json();
    const editor = await addMember(owner, "EDITOR");
    const m = await prisma.membership.findFirstOrThrow({ where: { organizationId: owner.organizationId, userId: editor.userId } });
    expect(m.allWorkspaces).toBe(true);
    // Sans workspace assigné : refusé ; avec : accès limité, même si le client demande « tous les workspaces ».
    expect((await app.inject({ method: "PATCH", url: `/api/orgs/${owner.organizationId}/members/${m.id}`, headers: auth(owner), payload: { role: "AGENCY" } })).statusCode).toBe(400);
    const r = await app.inject({ method: "PATCH", url: `/api/orgs/${owner.organizationId}/members/${m.id}`, headers: auth(owner), payload: { role: "AGENCY", allWorkspaces: true, workspaceIds: [ws2.id] } });
    expect(r.statusCode).toBe(200);
    expect(r.json().allWorkspaces).toBe(false);
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${owner.workspaceId}/contents`, headers: auth(editor) })).statusCode).toBe(404);
    expect((await app.inject({ method: "GET", url: `/api/workspaces/${ws2.id}/contents`, headers: auth(editor) })).statusCode).toBe(200);
  });

  it("le plafond de workspaces résiste aux requêtes simultanées", async () => {
    const owner = await signup();
    await prisma.subscription.update({ where: { organizationId: owner.organizationId }, data: { planCode: "BUSINESS" } }); // 3 workspaces
    const app = await getApp();
    const res = await Promise.all(Array.from({ length: 6 }, (_, i) => app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/workspaces`, headers: auth(owner), payload: { name: `Client ${i}` } })));
    expect(res.filter((r) => r.statusCode === 201)).toHaveLength(2);
    expect(await prisma.workspace.count({ where: { organizationId: owner.organizationId } })).toBe(3);
  });

  it("applique les quotas du plan", async () => {
    const owner = await signup();
    const app = await getApp();
    const res = await app.inject({ method: "POST", url: `/api/orgs/${owner.organizationId}/workspaces`, headers: auth(owner), payload: { name: "Second" } });
    expect(res.statusCode).toBe(400); // FREE = 1 workspace
  });
});
