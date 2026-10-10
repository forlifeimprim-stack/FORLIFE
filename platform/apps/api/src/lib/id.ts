import { randomBytes } from "node:crypto";

/** Identifiant aléatoire URL-safe pour les clés de stockage. */
export function createId(): string {
  return randomBytes(12).toString("base64url");
}
