import { describe, expect, it } from "vitest";
import { can, canAssignRole } from "./rbac.js";
import { canTransition } from "./domain.js";

describe("RBAC", () => {
  it("donne tous les droits au propriétaire", () => {
    expect(can("OWNER", "org:delete")).toBe(true);
    expect(can("OWNER", "billing:manage")).toBe(true);
  });
  it("interdit l'approbation aux éditeurs et créateurs", () => {
    expect(can("EDITOR", "content:approve")).toBe(false);
    expect(can("CREATOR", "content:approve")).toBe(false);
    expect(can("MANAGER", "content:approve")).toBe(true);
  });
  it("garde le lecteur en lecture seule", () => {
    expect(can("VIEWER", "content:read")).toBe(true);
    expect(can("VIEWER", "content:create")).toBe(false);
    expect(can("VIEWER", "ai:generate")).toBe(false);
  });
  it("empêche l'escalade de privilèges lors de l'attribution des rôles", () => {
    expect(canAssignRole("ADMIN", "OWNER")).toBe(false);
    expect(canAssignRole("ADMIN", "MANAGER")).toBe(true);
    expect(canAssignRole("OWNER", "OWNER")).toBe(true);
    expect(canAssignRole("EDITOR", "VIEWER")).toBe(false);
  });
});

describe("cycle de vie du contenu", () => {
  it("impose la revue avant approbation", () => {
    expect(canTransition("DRAFT", "APPROVED")).toBe(false);
    expect(canTransition("DRAFT", "REVIEW")).toBe(true);
    expect(canTransition("REVIEW", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "SCHEDULED")).toBe(true);
  });
});

import { normalizePhone, scoreLead } from "./domain.js";
describe("CRM", () => {
  it("normalise les numéros ivoiriens", () => {
    expect(normalizePhone("07 49 56 70 82")).toBe("+2250749567082");
    expect(normalizePhone("+225 05 85 80 18 56")).toBe("+2250585801856");
    expect(normalizePhone("00225 0585801856")).toBe("+2250585801856");
    expect(normalizePhone("abc")).toBeNull();
  });
  it("explique chaque point du score", () => {
    const r = scoreLead({ hasPhone: true, hasEmail: false, consent: true, source: "WHATSAPP", fromCampaign: false, activities: 1, valueAmount: null, stage: "NEW" });
    expect(r.score).toBe(55);
    expect(r.reasons.map((x) => x.label)).toContain("Accepte d'être contacté sur WhatsApp");
  });
  it("donne l'accès CRM aux bons rôles", async () => {
    const { can } = await import("./rbac.js");
    expect(can("EDITOR", "crm:update")).toBe(true);
    expect(can("CREATOR", "crm:read")).toBe(false);
    expect(can("VIEWER", "crm:read")).toBe(false);
  });
});
