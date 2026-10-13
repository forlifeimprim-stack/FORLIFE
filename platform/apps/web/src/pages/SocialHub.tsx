import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PUBLICATION_STATUS_LABELS, SOCIAL_PROVIDER_LABELS, type Channel, type SocialProvider } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDateTime, fmtNumber } from "../lib/i18n";
import { Alert, Badge, Button, Card, Empty, PageHeader } from "../components/ui";
import { ChannelIcon, ProviderIcon } from "../components/SocialIcon";

interface Account {
  id: string;
  provider: SocialProvider;
  name: string;
  avatarUrl: string | null;
  status: "CONNECTED" | "EXPIRED" | "ERROR";
  lastError: string | null;
  createdAt: string;
}
type PubStatus = keyof typeof PUBLICATION_STATUS_LABELS;
interface Publication {
  id: string;
  status: PubStatus;
  scheduledAt: string;
  publishedAt: string | null;
  externalUrl: string | null;
  lastError: string | null;
  attempts: number;
  content: { id: string; title: string };
  socialAccount: { id: string; name: string; provider: SocialProvider };
  metrics: { impressions: number; reach: number; engagement: number; clicks: number; isSimulated: boolean }[];
}
interface Overview {
  published30d: number;
  real: { publications: number; impressions: number; reach: number; engagement: number; clicks: number };
  simulated: { publications: number; impressions: number; reach: number; engagement: number; clicks: number };
}

const pubTone = (s: PubStatus) => (s === "PUBLISHED" ? "success" : s === "FAILED" ? "danger" : s === "CANCELLED" ? "neutral" : "warning");

/** Social Hub : comptes connectés, file de publication, historique et performances. */
export function SocialHubPage() {
  const { ws } = useWorkspace();
  const { can } = useAuth();
  const routerLocation = useLocation();
  const accounts = useResource<{ accounts: Account[]; connectors: Record<string, boolean> }>(`${ws}/social/accounts`);
  const pubs = useResource<Publication[]>(`${ws}/social/publications`);
  const overview = useResource<Overview>(`${ws}/social/overview`);
  // Message transmis par la page de retour OAuth (jamais lu depuis l'URL).
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>((routerLocation.state as { msg?: { tone: "success" | "error"; text: string } } | null)?.msg ?? null);

  const connect = async (connector: "meta" | "sandbox") => {
    setMsg(null);
    try {
      const { url } = await api.post<{ url: string }>(`${ws}/social/connect`, { connector });
      location.href = url;
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  };
  const disconnect = async (a: Account) => {
    if (!confirm(`Déconnecter ${a.name} ? Les publications en attente sur ce compte seront annulées.`)) return;
    await api.del(`${ws}/social/accounts/${a.id}`);
    void accounts.reload();
    void pubs.reload();
  };
  const retry = async (p: Publication) => {
    try {
      await api.post(`${ws}/social/publications/${p.id}/retry`);
      void pubs.reload();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  };

  const c = accounts.data?.connectors ?? {};
  const o = overview.data;
  const upcoming = pubs.data?.filter((p) => p.status === "QUEUED" || p.status === "PUBLISHING") ?? [];
  const history = pubs.data?.filter((p) => !(p.status === "QUEUED" || p.status === "PUBLISHING")) ?? [];

  return (
    <>
      <PageHeader title="Social Hub" question="Où publions-nous, qu'est-ce qui part bientôt, et qu'est-ce qui a marché ?" />
      <div className="stack">
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        {o && (
          <div className="grid grid-4">
            <Card>
              <div className="kpi">
                <span className="label">Publications (30 j)</span>
                <span className="value">{o.published30d}</span>
              </div>
            </Card>
            <Card>
              <div className="kpi">
                <span className="label">Impressions réelles</span>
                <span className="value">{fmtNumber(o.real.impressions)}</span>
                <span className="small muted">{o.real.publications} publication(s) mesurée(s)</span>
              </div>
            </Card>
            <Card>
              <div className="kpi">
                <span className="label">Engagements réels</span>
                <span className="value">{fmtNumber(o.real.engagement)}</span>
                <span className="small muted">{fmtNumber(o.real.clicks)} clics</span>
              </div>
            </Card>
            <Card>
              <div className="kpi">
                <span className="label">Démo (simulé)</span>
                <span className="value">{fmtNumber(o.simulated.impressions)}</span>
                <span className="small muted">jamais additionné aux chiffres réels</span>
              </div>
            </Card>
          </div>
        )}

        <Card title="Comptes connectés">
          {accounts.data?.accounts.length === 0 ? (
            <Empty title="Aucun compte connecté">
              <p>Connectez vos pages pour que les contenus programmés partent automatiquement à l'heure prévue.</p>
            </Empty>
          ) : (
            <ul className="list">
              {accounts.data?.accounts.map((a) => (
                <li key={a.id}>
                  <div className="row">
                    {a.avatarUrl ? <img src={a.avatarUrl} alt="" width={36} height={36} style={{ borderRadius: "50%" }} /> : <span className="avatar" />}
                    <div>
                      <strong>{a.name}</strong>
                      <div className="small muted row" style={{ gap: 4 }}>
                        <ProviderIcon provider={a.provider} size={14} />
                        {SOCIAL_PROVIDER_LABELS[a.provider]}
                      </div>
                      {a.status !== "CONNECTED" && <div className="small" style={{ color: "var(--danger)" }}>{a.lastError ?? "Reconnexion nécessaire"}</div>}
                    </div>
                  </div>
                  <div className="row">
                    <Badge tone={a.status === "CONNECTED" ? "success" : "danger"}>{a.status === "CONNECTED" ? "Connecté" : "À reconnecter"}</Badge>
                    {can("social:manage") && (
                      <Button variant="ghost" onClick={() => disconnect(a)}>
                        Déconnecter
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {can("social:manage") && (
            <div className="connectors">
              <ConnectorTile icons={["FACEBOOK", "INSTAGRAM"]} name="Facebook & Instagram" detail="Pages Facebook et comptes Instagram professionnels (Meta)" available={!!c.meta} onConnect={() => connect("meta")} pending="Activation en cours" />
              <ConnectorTile name="Compte de démonstration" detail="Publication simulée pour découvrir le Social Hub sans risque" available={!!c.sandbox} onConnect={() => connect("sandbox")} />
              <ConnectorTile icons={["LINKEDIN"]} name="LinkedIn" detail="Pages entreprise" available={false} />
              <ConnectorTile icons={["TIKTOK"]} name="TikTok" detail="Publication de vidéos" available={false} />
              <ConnectorTile icons={["YOUTUBE"]} name="YouTube" detail="Shorts et vidéos" available={false} />
            </div>
          )}
          <p className="muted small">
            Les jetons d'accès sont chiffrés et ne quittent jamais nos serveurs. WhatsApp et l'email restent en diffusion manuelle depuis la fiche du contenu.
          </p>
        </Card>

        <Card title={`File de publication (${upcoming.length})`}>
          {upcoming.length === 0 ? (
            <Empty title="Rien en attente">
              <Link to="/calendar" className="small">
                Programmer depuis le calendrier
              </Link>
            </Empty>
          ) : (
            <PubTable items={upcoming} />
          )}
        </Card>

        <Card title="Historique">
          {history.length === 0 ? <Empty title="Aucune publication pour l'instant" /> : <PubTable items={history} onRetry={can("social:update") ? retry : undefined} />}
        </Card>
      </div>
    </>
  );
}

function ConnectorTile({ name, detail, available, onConnect, pending, icons = [] }: { name: string; detail: string; available: boolean; onConnect?: () => void; pending?: string; icons?: Channel[] }) {
  return (
    <div className="connector">
      <div>
        <strong className="row" style={{ gap: 6, flexWrap: "nowrap", alignItems: "center" }}>
          {icons.length > 0 && (
            <span className="row" style={{ gap: 3, flexWrap: "nowrap" }}>
              {icons.map((ch) => (
                <ChannelIcon key={ch} channel={ch} size={20} />
              ))}
            </span>
          )}
          <span>{name}</span>
        </strong>
        <div className="small muted">{detail}</div>
      </div>
      {available ? (
        <Button variant="secondary" onClick={onConnect}>
          Connecter
        </Button>
      ) : (
        <Badge>{pending ?? "Bientôt"}</Badge>
      )}
    </div>
  );
}

function PubTable({ items, onRetry }: { items: Publication[]; onRetry?: (p: Publication) => void }) {
  return (
    <div className="table-wrap" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th>Contenu</th>
            <th>Compte</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Résultats</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const m = p.metrics[0];
            return (
              <tr key={p.id}>
                <td>
                  <Link to={`/content/${p.content.id}`}>{p.content.title}</Link>
                </td>
                <td>
                  {p.socialAccount.name}
                  <div className="small muted row" style={{ gap: 4 }}>
                    <ProviderIcon provider={p.socialAccount.provider} size={14} />
                    {SOCIAL_PROVIDER_LABELS[p.socialAccount.provider]}
                  </div>
                </td>
                <td>{fmtDateTime(p.publishedAt ?? p.scheduledAt)}</td>
                <td>
                  <Badge tone={pubTone(p.status)}>{PUBLICATION_STATUS_LABELS[p.status]}</Badge>
                  {p.lastError && <div className="small" style={{ color: "var(--danger)", maxWidth: 260 }}>{p.lastError}</div>}
                  {p.attempts > 1 && <div className="small muted">{p.attempts} tentatives</div>}
                </td>
                <td>
                  {m ? (
                    <span className="small">
                      {fmtNumber(m.impressions)} impressions · {fmtNumber(m.engagement)} engagements
                      {m.isSimulated && <Badge tone="warning">simulé</Badge>}
                    </span>
                  ) : (
                    <span className="muted small">—</span>
                  )}
                </td>
                <td>
                  {p.externalUrl && (
                    <a href={p.externalUrl} target="_blank" rel="noreferrer" className="small">
                      Voir
                    </a>
                  )}
                  {p.status === "FAILED" && onRetry && (
                    <Button variant="ghost" onClick={() => onRetry(p)}>
                      Relancer
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface PendingAccount {
  provider: SocialProvider;
  externalId: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Retour OAuth : la liaison est terminée par l'utilisateur connecté (sa session), puis il choisit
 * explicitement les pages à connecter à ce workspace.
 */
export function SocialCallbackPage() {
  const { connector = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<PendingAccount[] | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const state = params.get("state") ?? "";

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api
      .post<{ accounts: PendingAccount[] }>("/social/oauth/complete", { connector, state, code: params.get("code") ?? undefined, error: params.get("error") ? "denied" : undefined })
      .then((r) => {
        setAccounts(r.accounts);
        setChosen(r.accounts.length === 1 ? [r.accounts[0]!.externalId] : []);
      })
      .catch((e) => setErr(errorMessage(e)));
  }, [connector, state, params]);

  const save = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ connected: number }>("/social/oauth/select", { state, externalIds: chosen });
      navigate("/social", { replace: true, state: { msg: { tone: "success", text: `${r.connected} compte(s) connecté(s) avec succès.` } } });
    } catch (e) {
      setErr(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Connexion des comptes" question="Quelles pages voulez-vous publier depuis cet espace ?" />
      <Card>
        {err && (
          <div className="stack">
            <Alert tone="error">{err}</Alert>
            <Link to="/social">Retour au Social Hub</Link>
          </div>
        )}
        {!err && !accounts && <p className="muted">Finalisation de la connexion…</p>}
        {accounts && (
          <div className="stack">
            <ul className="list">
              {accounts.map((a) => (
                <li key={a.externalId}>
                  <label className="row" style={{ cursor: "pointer" }}>
                    <input type="checkbox" checked={chosen.includes(a.externalId)} onChange={(e) => setChosen((c) => (e.target.checked ? [...c, a.externalId] : c.filter((x) => x !== a.externalId)))} />
                    {a.avatarUrl ? <img src={a.avatarUrl} alt="" width={32} height={32} style={{ borderRadius: "50%" }} /> : <span className="avatar" />}
                    <span>
                      <strong>{a.name}</strong>
                      <div className="small muted row" style={{ gap: 4 }}>
                        <ProviderIcon provider={a.provider} size={14} />
                        {SOCIAL_PROVIDER_LABELS[a.provider]}
                      </div>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="row">
              <Button busy={busy} disabled={!chosen.length} onClick={save}>
                Connecter {chosen.length || ""} compte(s)
              </Button>
              <Link to="/social" className="small">
                Annuler
              </Link>
            </div>
            <p className="small muted">Seuls les comptes cochés sont connectés. Leurs jetons d'accès sont chiffrés et ne quittent jamais nos serveurs.</p>
          </div>
        )}
      </Card>
    </>
  );
}
