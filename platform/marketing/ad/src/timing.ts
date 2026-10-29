/** Tout est calé sur la musique (112 BPM) et sur la voix (temps mesurés sur les fichiers audio). */
export const FPS = 30;
export const BPM = 112;
export const BEAT = 60 / BPM;
export const DURATION_S = 27.6;
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);
export const f = (seconds: number) => Math.round(seconds * FPS);
export const beat = (n: number) => n * BEAT;

/** Débuts des scènes (en temps musicaux). */
export const SCENES = {
  hook: [0, beat(6)],
  pain: [beat(6), beat(12)],
  reveal: [beat(12), beat(18)],
  create: [beat(18), beat(24)],
  publish: [beat(24), beat(27)],
  sell: [beat(27), beat(33)],
  agents: [beat(33), beat(39)],
  proof: [beat(39), beat(41)],
  cta: [beat(41), DURATION_S],
} as const;

/** Début des phrases de la voix (secondes absolues). */
export const VO = {
  hook1: 0.15,
  hook2: 1.98,
  pain1: 3.445,
  pain2: 4.226,
  pain3: 5.02,
  reveal1: 6.7,
  reveal2: 7.91,
  create1: 9.7,
  create2: 11.06,
  publish: 12.9,
  sell: 14.55,
  agents1: 17.91,
  agents2: 19.63,
  cta1: 22.19,
  cta2: 23.32,
  finalHit: beat(49),
} as const;
