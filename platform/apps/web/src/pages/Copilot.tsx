import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { CopilotActionType, CopilotAgentKey, CopilotMode } from "@forlife/shared";
import { api } from "../lib/api";
import { useWorkspace } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDateTime } from "../lib/i18n";
import { Alert, Badge, Button, Card, CreditCost, Empty, Field, Modal, PageHeader } from "../components/ui";

interface Agent {
  key: CopilotAgentKey;
  name: string;
  role: string;
  mission: string;
  starters: string[];
  actionsForYou: CopilotActionType[];
}
interface Home {
  settings: { mode: CopilotMode; autoActions: CopilotActionType[]; dailyAutoLimit: number };
  modes: { key: CopilotMode; label: string; description: string }[];
  actionTypes: { key: CopilotActionType; label: string; allowedForYou: boolean }[];
  agents: Agent[];
  conversations: { id: string; agent: CopilotAgentKey; title: string; updatedAt: string }[];
  creditCost: number;
  canChat: boolean;
  canManage: boolean;
}
interface Action {
  id: string;
  type: CopilotActionType;
  title: string;
  params: Record<string, unknown>;
  rationale: string | null;
  status: "PROPOSED" | "EXECUTED" | "REJECTED" | "FAILED";
  auto: boolean;
  resultType: string | null;
  resultId: string | null;
  error: string | null;
}
interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  status: "PENDING" | "DONE" | "FAILED";
  isSimulated: boolean;
  createdAt: string;
  actions: Action[];
}
interface Thread {
  conversation: { id: string; agent: CopilotAgentKey; title: string };
  messages: Message[];
}

const RESULT_LINKS: Record<string, (id: string) => string> = {
  content: (id) => `/content/${id}`,
  campaign: (id) => `/campaigns/${id}`,
  crm_task: () => "/crm",
  recommendation: () => "/strategy",
};

export function CopilotPage() {
  const { ws } = useWorkspace();
  const home = useResource<Home>(`${ws}/copilot`);
  const [agentKey, setAgentKey] = useState<CopilotAgentKey>("copilot");
  const [thread, setThread] = useState<Thread | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const pending = thread?.messages.some((m) => m.status === "PENDING") ?? false;

  async function openConversation(id: string) {
    setError(null);
    try {
      const t = await api.get<Thread>(`${ws}/copilot/conversations/${id}`);
      setThread(t);
      setAgentKey(t.conversation.agent);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  // Suivi de la réponse en préparation.
  useEffect(() => {
    if (!pending || !thread) return;
    const timer = setTimeout(() => void openConversation(thread.conversation.id).then(() => home.reload()), 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, thread]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [thread?.messages.length, pending]);

  if (home.error) return <Alert tone="error">{home.error}</Alert>;
  if (!home.data) return <p className="muted">Chargement…</p>;
  const data = home.data;
  const agent = data.agents.find((a) => a.key === agentKey) ?? data.agents[0]!;
  const mode = data.modes.find((m) => m.key === data.settings.mode)!;

  async function send(text: string) {
    const content = text.trim();
    if (!content) return;
    setBusy(true);
    setError(null);
    try {
      let id = thread?.conversation.agent === agentKey ? thread.conversation.id : null;
      if (!id) id = (await api.post<{ id: string }>(`${ws}/copilot/conversations`, { agent: agentKey })).id;
      await api.post(`${ws}/copilot/conversations/${id}/messages`, { content });
      setDraft("");
      await openConversation(id);
      void home.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function decide(action: Action, decision: "approve" | "reject") {
    setError(null);
    try {
      await api.post(`${ws}/copilot/actions/${action.id}/${decision}`);
      if (thread) await openConversation(thread.conversation.id);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette conversation ?")) return;
    await api.del(`${ws}/copilot/conversations/${id}`).catch((e) => setError(errorMessage(e)));
    if (thread?.conversation.id === id) setThread(null);
    void home.reload();
  }

  function pickAgent(key: CopilotAgentKey) {
    setAgentKey(key);
    if (thread?.conversation.agent !== key) setThread(null);
  }

  return (
    <>
      <PageHeader
        title="AI Copilot & Agents"
        question="Posez vos questions à l'équipe d'agents : ils connaissent votre entreprise et proposent des actions que vous validez."
        actions={
          <div className="row">
            <Badge tone={data.settings.mode === "AUTOPILOT" ? "warning" : "accent"}>Mode : {mode.label}</Badge>
            {data.canManage && (
              <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
                Réglages
              </Button>
            )}
          </div>
        }
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="copilot-layout">
        <div className="stack">
          <Card title="Agents">
            <div className="agent-grid">
              {data.agents.map((a) => (
                <button key={a.key} className={`agent-card ${a.key === agentKey ? "active" : ""}`} onClick={() => pickAgent(a.key)} aria-pressed={a.key === agentKey}>
                  <strong>{a.name}</strong>
                  <small>{a.role}</small>
                </button>
              ))}
            </div>
          </Card>
          <Card title="Mes conversations">
            {data.conversations.length === 0 ? (
              <p className="muted">Aucune conversation pour l'instant.</p>
            ) : (
              <ul className="conv-list">
                {data.conversations.map((c) => (
                  <li key={c.id} className={thread?.conversation.id === c.id ? "active" : ""}>
                    <button className="link-button" onClick={() => void openConversation(c.id)}>
                      <span>{c.title}</span>
                      <small className="muted">
                        {data.agents.find((a) => a.key === c.agent)?.name} · {fmtDateTime(c.updatedAt)}
                      </small>
                    </button>
                    <button className="link-button" aria-label="Supprimer la conversation" onClick={() => void remove(c.id)}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card
          title={`${agent.name} — ${agent.role}`}
          actions={
            thread && (
              <Button variant="ghost" onClick={() => setThread(null)}>
                Nouvelle conversation
              </Button>
            )
          }
          className="chat-card"
        >
          <p className="muted">{agent.mission}</p>
          <div className="chat" aria-live="polite">
            {!thread || thread.messages.length === 0 ? (
              <Empty title="Que puis-je faire pour vous ?">
                <div className="row wrap">
                  {agent.starters.map((s) => (
                    <Button key={s} variant="secondary" disabled={!data.canChat || busy} onClick={() => void send(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </Empty>
            ) : (
              thread.messages.map((m) => (
                <div key={m.id} className={`bubble ${m.role === "USER" ? "bubble-user" : "bubble-agent"} ${m.status === "FAILED" ? "bubble-failed" : ""}`}>
                  {m.status === "PENDING" ? (
                    <p className="muted">{agent.name} réfléchit…</p>
                  ) : (
                    <p style={{ whiteSpace: "pre-wrap" }}>{m.content}</p>
                  )}
                  {m.isSimulated && <small className="muted">Démo — fournisseur IA simulé</small>}
                  {m.actions.map((a) => (
                    <ActionCard key={a.id} action={a} label={data.actionTypes.find((t) => t.key === a.type)?.label ?? a.type} onDecide={decide} />
                  ))}
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>
          {data.canChat ? (
            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
            >
              <textarea
                value={draft}
                maxLength={4000}
                rows={2}
                placeholder={`Écrire à ${agent.name}…`}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(draft);
                  }
                }}
              />
              <div className="row">
                <CreditCost credits={data.creditCost} />
                <Button type="submit" busy={busy} disabled={pending || !draft.trim()}>
                  Envoyer
                </Button>
              </div>
            </form>
          ) : (
            <Alert>Votre rôle permet de consulter le Copilot, pas de lui écrire.</Alert>
          )}
          <small className="muted">
            Le Copilot ne publie, n'envoie et ne paie jamais rien : il propose, vous décidez. Toute action est tracée dans le journal d'audit.
          </small>
        </Card>
      </div>

      {data.canManage && <SettingsModal open={settingsOpen} home={data} onClose={() => setSettingsOpen(false)} onSaved={() => void home.reload()} />}
    </>
  );
}

function ActionCard({ action, label, onDecide }: { action: Action; label: string; onDecide: (a: Action, d: "approve" | "reject") => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const link = action.resultType && action.resultId ? RESULT_LINKS[action.resultType]?.(action.resultId) : null;
  const body = typeof action.params.body === "string" ? action.params.body : typeof action.params.brief === "string" ? action.params.brief : null;
  const run = async (d: "approve" | "reject") => {
    setBusy(true);
    await onDecide(action, d);
    setBusy(false);
  };
  return (
    <div className="action-card">
      <div className="row between">
        <Badge tone="accent">{label}</Badge>
        {action.status === "EXECUTED" && <Badge tone="success">{action.auto ? "Exécutée (autopilot)" : "Exécutée"}</Badge>}
        {action.status === "REJECTED" && <Badge>Refusée</Badge>}
        {action.status === "FAILED" && <Badge tone="danger">Échec</Badge>}
      </div>
      <strong>{action.title}</strong>
      {body && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{body}</p>}
      {action.rationale && <small className="muted">Pourquoi : {action.rationale}</small>}
      {action.status === "PROPOSED" && (
        <div className="row">
          <Button busy={busy} onClick={() => void run("approve")}>
            Approuver
          </Button>
          <Button variant="ghost" disabled={busy} onClick={() => void run("reject")}>
            Refuser
          </Button>
        </div>
      )}
      {link && <Link to={link}>Ouvrir le résultat →</Link>}
    </div>
  );
}

function SettingsModal({ open, home, onClose, onSaved }: { open: boolean; home: Home; onClose: () => void; onSaved: () => void }) {
  const { ws } = useWorkspace();
  const [mode, setMode] = useState(home.settings.mode);
  const [auto, setAuto] = useState<CopilotActionType[]>(home.settings.autoActions);
  const [limit, setLimit] = useState(home.settings.dailyAutoLimit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`${ws}/copilot/settings`, { mode, autoActions: auto, dailyAutoLimit: limit });
      onSaved();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Réglages du Copilot"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button busy={busy} onClick={() => void save()}>
            Enregistrer
          </Button>
        </>
      }
    >
      {error && <Alert tone="error">{error}</Alert>}
      <fieldset className="stack">
        <legend>Mode de fonctionnement</legend>
        {home.modes.map((m) => (
          <label key={m.key} className="radio-row">
            <input type="radio" name="copilot-mode" checked={mode === m.key} onChange={() => setMode(m.key)} />
            <span>
              <strong>{m.label}</strong>
              <br />
              <small className="muted">{m.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {mode === "AUTOPILOT" && (
        <>
          <fieldset className="stack">
            <legend>Actions exécutées sans validation</legend>
            {home.actionTypes.map((t) => (
              <label key={t.key} className="radio-row">
                <input
                  type="checkbox"
                  disabled={!t.allowedForYou}
                  checked={auto.includes(t.key)}
                  onChange={(e) => setAuto(e.target.checked ? [...auto, t.key] : auto.filter((x) => x !== t.key))}
                />
                <span>
                  {t.label}
                  {!t.allowedForYou && <small className="muted"> (hors de vos droits)</small>}
                </span>
              </label>
            ))}
          </fieldset>
          <Field label="Limite d'actions automatiques par 24 h" hint="Entre 1 et 50.">
            <input type="number" min={1} max={50} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
          </Field>
          <Alert tone="warning">
            L'autopilot ne crée que des brouillons internes (contenus, tâches, recommandations, campagnes). Rien n'est publié ni envoyé sans votre validation habituelle.
          </Alert>
        </>
      )}
    </Modal>
  );
}
