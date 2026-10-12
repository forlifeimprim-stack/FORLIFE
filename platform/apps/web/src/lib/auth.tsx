import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Permission } from "@forlife/shared";
import { api, refreshSession, setAccessToken, setSessionExpiredHandler } from "./api";
import type { Me, OrgSummary, WorkspaceSummary } from "./types";

interface AuthState {
  me: Me | null;
  loading: boolean;
  org: OrgSummary | null;
  workspace: WorkspaceSummary | null;
  can: (p: Permission) => boolean;
  selectWorkspace: (orgId: string, workspaceId: string) => void;
  reload: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  completeSignup: (token: string, workspaceId: string) => Promise<void>;
  adoptSession: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);
const STORAGE_KEY = "forlife.currentWorkspace";

function readSelection(): { orgId: string; workspaceId: string } | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState(readSelection);

  const reload = useCallback(async () => {
    setMe(await api.get<Me>("/me"));
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setAccessToken(null);
      setMe(null);
    });
    // Restauration de session via le cookie de refresh.
    refreshSession()
      .then(async (ok) => {
        if (ok) await reload();
      })
      .finally(() => setLoading(false));
  }, [reload]);

  const selectWorkspace = useCallback((orgId: string, workspaceId: string) => {
    const s = { orgId, workspaceId };
    setSelection(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* stockage indisponible : sélection non mémorisée */
    }
  }, []);

  const { org, workspace } = useMemo(() => {
    if (!me || me.organizations.length === 0) return { org: null, workspace: null };
    const org = me.organizations.find((o) => o.id === selection?.orgId) ?? me.organizations[0]!;
    const workspace = org.workspaces.find((w) => w.id === selection?.workspaceId) ?? org.workspaces[0] ?? null;
    return { org, workspace };
  }, [me, selection]);

  const value: AuthState = {
    me,
    loading,
    org,
    workspace,
    can: (p) => !!org?.permissions.includes(p),
    selectWorkspace,
    reload,
    login: async (email, password) => {
      const res = await api.post<{ accessToken: string }>("/auth/login", { email, password });
      setAccessToken(res.accessToken);
      await reload();
    },
    completeSignup: async (token, workspaceId) => {
      setAccessToken(token);
      const fresh = await api.get<Me>("/me");
      const o = fresh.organizations[0];
      if (o) selectWorkspace(o.id, workspaceId);
      setMe(fresh);
    },
    adoptSession: async (token) => {
      setAccessToken(token);
      await reload();
    },
    logout: async () => {
      await api.post("/auth/logout", {}, { "x-forlife-csrf": "1" }).catch(() => undefined);
      setAccessToken(null);
      setMe(null);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth hors AuthProvider");
  return v;
}

/** Workspace courant (garanti non nul dans les pages protégées). */
export function useWorkspace() {
  const { org, workspace } = useAuth();
  if (!org || !workspace) throw new Error("Aucun workspace sélectionné");
  return { org, workspace, ws: `/workspaces/${workspace.id}` };
}
