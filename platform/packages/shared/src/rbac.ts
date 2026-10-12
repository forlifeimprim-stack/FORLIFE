/**
 * RBAC Forlife Com — matrice rôles × permissions (module:action).
 * Source unique partagée par l'API (contrôle serveur) et le web (affichage).
 * Le web n'est jamais une barrière de sécurité : seul le serveur fait foi.
 */

export const ROLES = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "EDITOR",
  "CREATOR",
  "ANALYST",
  "VIEWER",
  "AGENCY",
] as const;
export type Role = (typeof ROLES)[number];

export const MODULES = [
  "org",
  "members",
  "workspace",
  "brand",
  "assets",
  "strategy",
  "content",
  "campaigns",
  "crm",
  "social",
  "approvals",
  "ai",
  "billing",
  "audit",
] as const;
export type Module = (typeof MODULES)[number];

export const ACTIONS = ["read", "create", "update", "delete", "approve", "generate", "manage"] as const;
export type Action = (typeof ACTIONS)[number];

export type Permission = `${Module}:${Action}`;

const all = (m: Module): Permission[] => ACTIONS.map((a) => `${m}:${a}` as Permission);
const read = (...ms: Module[]): Permission[] => ms.map((m) => `${m}:read` as Permission);
const write = (m: Module): Permission[] => [`${m}:read`, `${m}:create`, `${m}:update`, `${m}:delete`];

const CREATIVE_WORK: Permission[] = [
  ...write("brand"),
  ...write("assets"),
  ...write("strategy"),
  ...write("content"),
  ...write("campaigns"),
  "ai:read",
  "ai:generate",
];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  OWNER: new Set(MODULES.flatMap(all)),
  ADMIN: new Set(MODULES.flatMap(all).filter((p) => p !== "org:delete")),
  MANAGER: new Set<Permission>([
    ...CREATIVE_WORK,
    "brand:approve",
    "strategy:approve",
    "content:approve",
    "campaigns:approve",
    ...write("approvals"),
    "approvals:approve",
    ...write("crm"),
    ...write("social"),
    "social:manage",
    "workspace:read",
    "workspace:update",
    "workspace:create",
    "members:read",
    "billing:read",
    "audit:read",
    "org:read",
  ]),
  EDITOR: new Set<Permission>([
    ...CREATIVE_WORK,
    "crm:read",
    "crm:create",
    "crm:update",
    "social:read",
    "approvals:read",
    "approvals:create",
    "workspace:read",
    "org:read",
  ]),
  CREATOR: new Set<Permission>([
    ...read("brand", "strategy", "campaigns", "approvals", "workspace", "org"),
    ...write("content"),
    ...write("assets"),
    "approvals:create",
    "ai:read",
    "ai:generate",
  ]),
  ANALYST: new Set<Permission>([
    ...read("brand", "assets", "strategy", "content", "campaigns", "crm", "social", "approvals", "workspace", "org", "ai", "billing", "audit"),
  ]),
  VIEWER: new Set<Permission>([...read("brand", "assets", "strategy", "content", "campaigns", "workspace", "org")]),
  // Agence : travaille comme un manager, mais uniquement sur les workspaces clients qui lui sont assignés.
  AGENCY: new Set<Permission>([
    ...CREATIVE_WORK,
    ...write("crm"),
    ...write("social"),
    "social:manage",
    "content:approve",
    ...write("approvals"),
    "approvals:approve",
    "workspace:read",
    "org:read",
  ]),
};

/** Rôles qui voient tous les workspaces de l'organisation par défaut. */
export const ORG_WIDE_ROLES: ReadonlySet<Role> = new Set<Role>(["OWNER", "ADMIN", "MANAGER", "ANALYST"]);

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Un acteur ne peut attribuer qu'un rôle de rang inférieur ou égal au sien (Owner seul crée un Owner). */
const RANK: Record<Role, number> = {
  OWNER: 100,
  ADMIN: 80,
  MANAGER: 60,
  AGENCY: 50,
  EDITOR: 40,
  CREATOR: 30,
  ANALYST: 20,
  VIEWER: 10,
};

export function canAssignRole(actor: Role, target: Role): boolean {
  if (!can(actor, "members:manage")) return false;
  if (target === "OWNER") return actor === "OWNER";
  return RANK[actor] >= RANK[target];
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  EDITOR: "Éditeur",
  CREATOR: "Créateur",
  ANALYST: "Analyste",
  VIEWER: "Lecteur",
  AGENCY: "Agence",
};
