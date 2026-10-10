import type { SafetyResult } from "./types.js";

/** Termes bloquants génériques (promesses trompeuses, contenus interdits en publicité). */
const BASELINE_BLOCKLIST = ["100% garanti", "guérit", "remède miracle", "gagnez de l'argent sans effort", "sans aucun risque"];

/**
 * Couche de sécurité/modération appliquée avant toute validation humaine (§21).
 * Les signalements ne bloquent pas la génération mais sont affichés au relecteur :
 * un contenu IA reste une proposition tant qu'il n'est pas approuvé.
 */
export function checkSafety(texts: string[], forbiddenWords: string[] = []): SafetyResult {
  const flags: SafetyResult["flags"] = [];
  const haystack = texts.join("\n").toLowerCase();
  for (const term of BASELINE_BLOCKLIST) {
    if (haystack.includes(term.toLowerCase())) flags.push({ code: "MISLEADING_CLAIM", detail: term });
  }
  for (const word of forbiddenWords) {
    const w = word.trim().toLowerCase();
    if (w && haystack.includes(w)) flags.push({ code: "BRAND_FORBIDDEN_WORD", detail: word });
  }
  return { passed: flags.length === 0, flags };
}
