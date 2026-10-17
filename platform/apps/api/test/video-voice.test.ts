import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { drainQueue } from "../src/modules/jobs/queue.js";
import { loadConfig } from "../src/config.js";
import { getStorage } from "../src/modules/storage/storage.js";
import { setSynthesizer, speakingRate } from "../src/modules/video/tts.js";
import { auth, getApp, prisma, signup, type TestAccount } from "./helpers.js";

afterEach(() => setSynthesizer(undefined));

/** Bip MP3 d'une seconde, comme une phrase synthétisée. */
function beep(): Buffer {
  const dir = mkdtempSync(join(tmpdir(), "voix-"));
  const out = join(dir, "b.mp3");
  execFileSync(loadConfig().FFMPEG_PATH, ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=660:duration=1", "-ar", "44100", out]);
  return readFileSync(out);
}

/** Niveau sonore moyen (dB) d'un MP4 : sert à vérifier que la voix s'ajoute à la musique. */
function meanVolume(mp4: Buffer): number {
  const file = join(mkdtempSync(join(tmpdir(), "mesure-")), "v.mp4");
  writeFileSync(file, mp4);
  const res = spawnSync(loadConfig().FFMPEG_PATH, ["-hide_banner", "-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  return Number(/mean_volume: (-?[\d.]+) dB/.exec(res.stderr)?.[1] ?? "-99");
}

async function renderWith(acc: TestAccount, voice: string) {
  const app = await getApp();
  const res = await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/video/projects`, headers: auth(acc), payload: { title: "Pagnes", objective: "SALES", brief: "Présenter la nouvelle collection de pagnes", durationTarget: 10, voice } });
  expect(res.statusCode).toBe(202);
  await drainQueue();
  const id = res.json().projectId;
  await app.inject({ method: "POST", url: `/api/workspaces/${acc.workspaceId}/video/projects/${id}/render`, headers: auth(acc), payload: { requestId: randomUUID() } });
  await drainQueue();
  const render = await prisma.videoRender.findFirstOrThrow({ where: { projectId: id }, orderBy: { version: "desc" } });
  expect(render.status).toBe("SUCCEEDED");
  return { render, mp4: await getStorage().get(render.storageKey!) };
}

describe("Video Studio : voix off", () => {
  it("cale la vitesse de lecture sur la durée de la scène, sans excès", () => {
    expect(speakingRate("Court.", 3)).toBe(1);
    expect(speakingRate("x".repeat(56), 3)).toBeGreaterThan(1);
    expect(speakingRate("x".repeat(300), 2)).toBe(1.45);
  });

  it("mixe la voix de chaque scène sous la musique", async () => {
    const calls: { text: string; voice: string }[] = [];
    const audio = beep();
    setSynthesizer({ synthesize: async (text, voice) => (calls.push({ text, voice }), audio) });
    const acc = await signup();
    const silent = await renderWith(acc, "NONE");
    expect(calls).toHaveLength(0);
    const voiced = await renderWith(acc, "FEMALE");
    expect(calls.length).toBeGreaterThan(1);
    expect(calls.every((c) => c.voice === "FEMALE" && c.text.length > 0)).toBe(true);
    expect((voiced.render.qc as { voice?: string }).voice).toBeUndefined();
    expect(meanVolume(voiced.mp4)).toBeGreaterThan(meanVolume(silent.mp4) + 1);
  }, 120_000);

  it("rend la vidéo sans voix, avec une explication, si le service vocal échoue", async () => {
    setSynthesizer({ synthesize: async () => Promise.reject(new Error("API désactivée")) });
    const acc = await signup();
    const { render } = await renderWith(acc, "MALE");
    expect((render.qc as { voice?: string }).voice).toContain("API désactivée");
  }, 120_000);
});
