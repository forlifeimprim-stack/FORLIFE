import { createHash, createHmac, pbkdf2Sync, randomBytes } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

/**
 * Compte PostgreSQL de l'application en production (Cloud SQL).
 *
 * Les comptes créés par gcloud ou la console reçoivent le rôle « cloudsqlsuperuser », propriétaire des bases
 * (donc du schéma public) : un tel compte pourrait supprimer des tables, journal d'audit compris, quels que soient
 * ses GRANT. Le compte applicatif est donc créé ici, en SQL, par le propriétaire des tables, sans aucun attribut
 * ni appartenance à un rôle ; prisma/grants.sql lui donne ensuite la lecture/écriture des données, rien d'autre.
 */
export const APP_ROLE = "forlife_app";

const ROLE_NAME = /^[a-z_][a-z0-9_]{0,62}$/;
// ASCII imprimable : SASLprep est alors l'identité, le vérificateur calculé ici est celui de PostgreSQL.
const PASSWORD = /^[\x21-\x7e]{16,}$/;

/**
 * Vérificateur SCRAM-SHA-256 au format PostgreSQL : le mot de passe en clair n'apparaît dans aucune requête
 * (ni dans un éventuel journal des requêtes du serveur).
 */
export function scramVerifier(password: string, salt: Buffer = randomBytes(16), iterations = 4096): string {
  const salted = pbkdf2Sync(Buffer.from(password, "utf8"), salt, iterations, 32, "sha256");
  const clientKey = createHmac("sha256", salted).update("Client Key").digest();
  const storedKey = createHash("sha256").update(clientKey).digest();
  const serverKey = createHmac("sha256", salted).update("Server Key").digest();
  return `SCRAM-SHA-256$${iterations}:${salt.toString("base64")}$${storedKey.toString("base64")}:${serverKey.toString("base64")}`;
}

interface RoleState {
  rolsuper: boolean;
  rolcreaterole: boolean;
  rolcreatedb: boolean;
  rolreplication: boolean;
  rolbypassrls: boolean;
  member_of: string[];
  owned: number;
}

function excessRights(r: RoleState): string[] {
  const out: string[] = [];
  if (r.rolsuper) out.push("SUPERUSER");
  if (r.rolcreaterole) out.push("CREATEROLE");
  if (r.rolcreatedb) out.push("CREATEDB");
  if (r.rolreplication) out.push("REPLICATION");
  if (r.rolbypassrls) out.push("BYPASSRLS");
  out.push(...r.member_of.map((g) => `membre de ${g}`));
  if (r.owned > 0) out.push("propriétaire d'objets de la base");
  return out;
}

const ident = (name: string) => `"${name.replace(/"/g, '""')}"`;

async function roleState(prisma: PrismaClient, role: string): Promise<RoleState | undefined> {
  const rows = await prisma.$queryRaw<RoleState[]>`
    SELECT r.rolsuper, r.rolcreaterole, r.rolcreatedb, r.rolreplication, r.rolbypassrls,
      ARRAY(SELECT g.rolname::text FROM pg_auth_members m JOIN pg_roles g ON g.oid = m.roleid WHERE m.member = r.oid ORDER BY 1) AS member_of,
      ((SELECT count(*) FROM pg_class c WHERE c.relowner = r.oid)
        + (SELECT count(*) FROM pg_namespace n WHERE n.nspowner = r.oid)
        + (SELECT count(*) FROM pg_database d WHERE d.datdba = r.oid AND d.datname = current_database()))::int AS owned
    FROM pg_roles r WHERE r.rolname = ${role}`;
  return rows[0];
}

export interface ProvisionResult {
  role: string;
  status: "created" | "updated";
}

/**
 * Crée (ou met en conformité) le compte applicatif décrit par appUrl, puis applique grantsSql.
 * Doit être exécuté avec le compte propriétaire des tables (job de migration). Idempotent.
 */
export async function provisionAppRole(
  prisma: PrismaClient,
  appUrl: string,
  grantsSql: string,
  expectedRole: string = APP_ROLE,
): Promise<ProvisionResult> {
  let url: URL;
  try {
    url = new URL(appUrl);
  } catch {
    throw new Error("APP_DATABASE_URL n'est pas une URL de connexion valide.");
  }
  const role = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  if (role !== expectedRole || !ROLE_NAME.test(role)) {
    throw new Error(`APP_DATABASE_URL doit utiliser le compte « ${expectedRole} » (reçu « ${role} »).`);
  }
  if (!PASSWORD.test(password)) throw new Error("APP_DATABASE_URL : mot de passe absent ou trop faible (16 caractères ASCII minimum).");

  const [me] = await prisma.$queryRaw<{ name: string }[]>`SELECT current_user::text AS name`;
  if (me?.name === role) throw new Error("Ce provisionnement doit être exécuté avec le compte propriétaire, pas avec le compte applicatif.");

  const verifier = scramVerifier(password);
  let status: ProvisionResult["status"];
  let state = await roleState(prisma, role);
  if (!state) {
    await prisma.$executeRawUnsafe(
      `CREATE ROLE ${ident(role)} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '${verifier}'`,
    );
    status = "created";
  } else {
    if (excessRights(state).length > 0) {
      // Tentative de mise en conformité (possible seulement si le propriétaire administre ce compte).
      for (const group of state.member_of) await prisma.$executeRawUnsafe(`REVOKE ${ident(group)} FROM ${ident(role)}`).catch(() => undefined);
      // Un attribut à la fois : PostgreSQL refuse de toucher SUPERUSER/REPLICATION/BYPASSRLS sans les posséder.
      const removals = [
        state.rolsuper && "NOSUPERUSER",
        state.rolcreaterole && "NOCREATEROLE",
        state.rolcreatedb && "NOCREATEDB",
        state.rolreplication && "NOREPLICATION",
        state.rolbypassrls && "NOBYPASSRLS",
      ].filter((a): a is string => Boolean(a));
      for (const attr of removals) await prisma.$executeRawUnsafe(`ALTER ROLE ${ident(role)} WITH ${attr}`).catch(() => undefined);
      state = await roleState(prisma, role);
      const excess = state ? excessRights(state) : [];
      if (excess.length > 0) {
        throw new Error(
          `Le compte « ${role} » a des droits trop larges (${excess.join(", ")}) : il a sans doute été créé par gcloud ou la console. ` +
            `Supprimez-le (gcloud sql users delete ${role} --instance=<instance>) ou relancez le script gcp-setup.sh, ` +
            `puis relancez le déploiement : il sera recréé ici avec des droits minimaux.`,
        );
      }
    }
    await prisma.$executeRawUnsafe(`ALTER ROLE ${ident(role)} WITH LOGIN PASSWORD '${verifier}'`);
    status = "updated";
  }
  await prisma.$executeRawUnsafe(grantsSql);
  return { role, status };
}
