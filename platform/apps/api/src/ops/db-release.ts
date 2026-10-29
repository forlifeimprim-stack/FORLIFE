/**
 * Étape de mise en production exécutée par le job Cloud Run « forlife-migrate », après « prisma migrate deploy »,
 * avec le compte propriétaire (DATABASE_URL) : crée ou met en conformité le compte applicatif décrit par
 * APP_DATABASE_URL, puis lui applique les droits restreints de prisma/grants.sql.
 * N'affiche jamais d'URL ni de mot de passe.
 */
import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { provisionAppRole } from "./app-role.js";

const appUrl = process.env.APP_DATABASE_URL;
if (!appUrl) {
  console.error("APP_DATABASE_URL manquant : impossible de préparer le compte applicatif.");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const grants = await readFile(new URL("../../prisma/grants.sql", import.meta.url), "utf8");
  const { role, status } = await provisionAppRole(prisma, appUrl, grants);
  console.log(`Compte applicatif « ${role} » ${status === "created" ? "créé" : "vérifié"} : droits restreints appliqués.`);
} catch (err) {
  console.error(err instanceof Error ? err.message : "Échec du provisionnement du compte applicatif.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
