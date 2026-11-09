import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { provisionAppRole, scramVerifier } from "../src/ops/app-role.js";

// Compte applicatif de production : créé en SQL par le propriétaire, sans attribut ni rôle (cf. Cloud SQL).
const grantsFile = readFileSync(new URL("../prisma/grants.sql", import.meta.url), "utf8");
const suffix = randomBytes(4).toString("hex");
const role = `forlife_app_t${suffix}`;
const probe = `provision_probe_${suffix}`;
const password = randomBytes(24).toString("base64url");
const grants = grantsFile.replaceAll("forlife_app", role);
const baseUrl = new URL(process.env.DATABASE_URL!);

function urlFor(user: string, pw: string): string {
  const u = new URL(baseUrl);
  u.username = user;
  u.password = pw;
  return u.toString();
}

const extraRoles: string[] = [];
const clients: PrismaClient[] = [];
function connectAs(user: string, pw: string): PrismaClient {
  const c = new PrismaClient({ datasourceUrl: urlFor(user, pw) });
  clients.push(c);
  return c;
}

async function dropRole(name: string) {
  await prisma.$executeRawUnsafe(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${name}') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ${name}';
    EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM ${name}';
    EXECUTE 'REVOKE ALL ON SCHEMA public FROM ${name}';
    EXECUTE 'DROP ROLE ${name}';
  END IF; END $$`);
}

afterAll(async () => {
  await Promise.all(clients.map((c) => c.$disconnect()));
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS ${probe}`);
  for (const r of [role, ...extraRoles]) await dropRole(r);
});

async function attributes(name: string) {
  const [r] = await prisma.$queryRaw<{ rolsuper: boolean; rolcreaterole: boolean; rolcreatedb: boolean; member_of: string[] }[]>`
    SELECT rolsuper, rolcreaterole, rolcreatedb,
      ARRAY(SELECT g.rolname::text FROM pg_auth_members m JOIN pg_roles g ON g.oid = m.roleid WHERE m.member = r.oid) AS member_of
    FROM pg_roles r WHERE rolname = ${name}`;
  return r;
}

describe("Compte applicatif de production", () => {
  it("vérificateur SCRAM au format PostgreSQL", () => {
    const v = scramVerifier("motdepasse-solide-1234", Buffer.alloc(16, 1));
    expect(v).toMatch(/^SCRAM-SHA-256\$4096:[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
    expect(v).not.toContain("motdepasse");
    expect(scramVerifier("x".repeat(16))).not.toBe(scramVerifier("x".repeat(16)));
  });

  it("refuse une URL incohérente", async () => {
    await expect(provisionAppRole(prisma, "pas une url", grants, role)).rejects.toThrow(/URL/);
    await expect(provisionAppRole(prisma, urlFor("autre_compte", password), grants, role)).rejects.toThrow(/doit utiliser le compte/);
    await expect(provisionAppRole(prisma, urlFor(role, "court"), grants, role)).rejects.toThrow(/mot de passe/);
    const [me] = await prisma.$queryRaw<{ name: string }[]>`SELECT current_user::text AS name`;
    await expect(provisionAppRole(prisma, urlFor(me!.name, password), grants, me!.name)).rejects.toThrow(/compte propriétaire/);
  });

  it("crée le compte sans aucun droit d'administration, données en lecture/écriture seulement", async () => {
    await prisma.$executeRawUnsafe(`CREATE TABLE ${probe} (id int)`);
    expect(await provisionAppRole(prisma, urlFor(role, password), grants, role)).toEqual({ role, status: "created" });
    expect(await attributes(role)).toEqual({ rolsuper: false, rolcreaterole: false, rolcreatedb: false, member_of: [] });

    const app = connectAs(role, password);
    expect(await app.$queryRawUnsafe(`SELECT count(*)::int AS n FROM ${probe}`)).toEqual([{ n: 0 }]);
    await app.$executeRawUnsafe(`INSERT INTO ${probe} VALUES (1)`);
    await expect(app.$executeRawUnsafe(`DROP TABLE ${probe}`)).rejects.toThrow();
    await expect(app.$executeRawUnsafe(`CREATE TABLE ${probe}_x (id int)`)).rejects.toThrow();
    await expect(app.$executeRawUnsafe(`ALTER TABLE ${probe} ADD COLUMN y int`)).rejects.toThrow();
    await expect(app.$executeRawUnsafe(`DELETE FROM "AuditLog"`)).rejects.toThrow();
    await expect(app.$executeRawUnsafe(`TRUNCATE "CreditTransaction"`)).rejects.toThrow();
    await expect(app.$queryRawUnsafe(`SELECT * FROM "_prisma_migrations"`)).rejects.toThrow();

    // Relance (déploiement suivant) : mot de passe resynchronisé, connexion toujours possible.
    expect(await provisionAppRole(prisma, urlFor(role, password), grants, role)).toEqual({ role, status: "updated" });
    expect(await connectAs(role, password).$queryRaw`SELECT 1 AS ok`).toEqual([{ ok: 1 }]);
  });

  it("met en conformité un compte trop puissant quand le propriétaire l'administre", async () => {
    const wide = `forlife_wide_t${suffix}`;
    const group = `forlife_grp_t${suffix}`;
    extraRoles.push(wide, group);
    await prisma.$executeRawUnsafe(`CREATE ROLE ${group} NOLOGIN`);
    await prisma.$executeRawUnsafe(`CREATE ROLE ${wide} LOGIN CREATEDB IN ROLE ${group}`);
    expect(await provisionAppRole(prisma, urlFor(wide, password), grants.replaceAll(role, wide), wide)).toEqual({ role: wide, status: "updated" });
    expect(await attributes(wide)).toEqual({ rolsuper: false, rolcreaterole: false, rolcreatedb: false, member_of: [] });
  });

  it("refuse un compte trop puissant qu'il ne peut pas corriger (compte créé par gcloud)", async () => {
    const owner = `forlife_owner_t${suffix}`;
    const wide = `forlife_gcloud_t${suffix}`;
    const group = `forlife_csu_t${suffix}`;
    extraRoles.push(wide, group, owner);
    const ownerPw = randomBytes(24).toString("base64url");
    await prisma.$executeRawUnsafe(`CREATE ROLE ${group} NOLOGIN`);
    await prisma.$executeRawUnsafe(`CREATE ROLE ${wide} LOGIN IN ROLE ${group}`);
    await prisma.$executeRawUnsafe(`CREATE ROLE ${owner} LOGIN CREATEROLE PASSWORD '${ownerPw}'`);
    const asOwner = connectAs(owner, ownerPw);
    await expect(provisionAppRole(asOwner, urlFor(wide, password), grants.replaceAll(role, wide), wide)).rejects.toThrow(
      /droits trop larges \(membre de forlife_csu_t[0-9a-f]+\).*gcloud sql users delete/,
    );
    expect((await attributes(wide))?.member_of).toEqual([group]);
  });
});
