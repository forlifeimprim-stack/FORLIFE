import { afterEach, describe, expect, it } from "vitest";
import { resetConfigCache } from "../src/config.js";
import { auth, getApp, signup } from "./helpers.js";

const saved = { WEB_ORIGIN: process.env.WEB_ORIGIN, APP_URL: process.env.APP_URL };
afterEach(() => {
  for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  resetConfigCache();
});

describe("Domaine officiel et ancienne adresse", () => {
  it("le retour OAuth revient sur l'adresse utilisée, jamais sur une origine inconnue", async () => {
    process.env.APP_URL = "https://forlifecomai.ci";
    process.env.WEB_ORIGIN = "https://forlifecomai.ci,https://ai-growth-et-creative-os.web.app";
    resetConfigCache();
    const acc = await signup();
    const app = await getApp();
    const connect = async (origin?: string) =>
      (await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/social/connect`, headers: { ...auth(acc), ...(origin ? { origin } : {}) }, payload: { connector: "sandbox" } })).json().url as string;
    expect(await connect("https://ai-growth-et-creative-os.web.app")).toMatch(/^https:\/\/ai-growth-et-creative-os\.web\.app\/social\/callback\/sandbox\?/);
    expect(await connect("https://forlifecomai.ci")).toMatch(/^https:\/\/forlifecomai\.ci\/social\/callback\/sandbox\?/);
    expect(await connect("https://pirate.example")).toMatch(/^https:\/\/forlifecomai\.ci\//);
    expect(await connect()).toMatch(/^https:\/\/forlifecomai\.ci\//);
  });
});
