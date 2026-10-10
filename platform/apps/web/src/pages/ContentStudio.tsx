import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CHANNEL_LABELS, CHANNELS, CONTENT_STATUS_LABELS, CONTENT_STATUSES, OBJECTIVE_LABELS, TASK_CREDIT_COST, type Channel, type ContentStatus } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDateTime } from "../lib/i18n";
import type { ContentItem, Idea, Objective, SafetyResult } from "../lib/types";
import { AiNotice, Alert, Button, Card, ChannelChip, CreditCost, Empty, Field, JobStatus, PageHeader, StatusBadge } from "../components/ui";

const FORMAT_LABELS: Record<string, string> = { POST: "Post", CAROUSEL: "Carrousel", STORY: "Story", VIDEO_SCRIPT: "Script vidéo", EMAIL: "Email", WHATSAPP_MESSAGE: "Message WhatsApp" };

export function ContentStudio() {
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const navigate = useNavigate();
  const strategy = useResource<{ objectives: Objective[]; profile: { channels: Channel[] } | null }>(`${ws}/strategy`);
  const pillars = useResource<{ id: string; name: string }[]>(`${ws}/pillars`);
  const [status, setStatus] = useState<ContentStatus | "">("");
  const library = useResource<ContentItem[]>(`${ws}/contents${status ? `?status=${status}` : ""}`);

  const [brief, setBrief] = useState({ objectiveId: "", pillarId: "", audience: "", offer: "", count: 5 });
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [ideasMeta, setIdeasMeta] = useState<{ isSimulated: boolean; safety: SafetyResult } | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ideasJob = useJob<{ ideas: Idea[]; isSimulated: boolean; safety: SafetyResult }>(ws);
  const postJob = useJob<{ contentId: string }>(ws);

  const objectives = useMemo(() => (strategy.data?.objectives ?? []).filter((o) => o.status === "ACTIVE"), [strategy.data]);
  const objectiveId = brief.objectiveId || objectives[0]?.id || "";
  const activeChannels = channels ?? (strategy.data?.profile?.channels?.length ? strategy.data.profile.channels : (["FACEBOOK", "INSTAGRAM", "WHATSAPP"] as Channel[]));

  const genIdeas = async () => {
    setErr(null);
    setIdeas(null);
    setChosen(null);
    try {
      const { jobId } = await api.post<{ jobId: string }>(`${ws}/contents/ideas`, {
        objectiveId,
        pillarId: brief.pillarId || undefined,
        audience: brief.audience || undefined,
        offer: brief.offer || undefined,
        count: brief.count,
      });
      const final = await ideasJob.track(jobId);
      if (final.status === "SUCCEEDED" && final.result) {
        setIdeas(final.result.ideas);
        setIdeasMeta({ isSimulated: final.result.isSimulated, safety: final.result.safety });
        setChosen(0);
      } else setErr(final.lastError ?? "La génération a échoué");
      void reloadMe();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const genPost = async () => {
    if (chosen == null || !ideas?.[chosen]) return;
    const idea = ideas[chosen];
    setErr(null);
    try {
      const { jobId, contentId } = await api.post<{ jobId: string; contentId: string }>(
        `${ws}/contents/generate`,
        {
          idea: { angle: idea.angle, hook: idea.hook, message: idea.message, cta: idea.cta },
          channels: activeChannels,
          type: idea.format,
          objectiveId: objectiveId || null,
          pillarId: brief.pillarId || null,
        },
        { "idempotency-key": crypto.randomUUID() },
      );
      const final = await postJob.track(jobId);
      void reloadMe();
      if (final.status === "SUCCEEDED") navigate(`/content/${contentId}`);
      else setErr(final.lastError ?? "La génération a échoué");
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Content Studio" question="Quoi publier pour atteindre nos objectifs ?" />
      <div className="stack">
        {can("ai:generate") && (
          <Card title="1. Brief" actions={<CreditCost credits={TASK_CREDIT_COST["content.ideas"]} />}>
            {objectives.length === 0 && !strategy.loading ? (
              <Alert tone="warning">
                Stratégie avant génération : <Link to="/strategy">définissez d'abord un objectif</Link>.
              </Alert>
            ) : (
              <div className="stack">
                <div className="grid grid-2">
                  <Field label="Objectif">
                    <select value={objectiveId} onChange={(e) => setBrief({ ...brief, objectiveId: e.target.value })}>
                      {objectives.map((o) => (
                        <option key={o.id} value={o.id}>
                          [{OBJECTIVE_LABELS[o.type]}] {o.title}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Pilier de contenu" hint={pillars.data?.length ? undefined : "Validez un plan stratégique pour obtenir des piliers"}>
                    <select value={brief.pillarId} onChange={(e) => setBrief({ ...brief, pillarId: e.target.value })}>
                      <option value="">Aucun</option>
                      {pillars.data?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Audience (optionnel)">
                    <input value={brief.audience} onChange={(e) => setBrief({ ...brief, audience: e.target.value })} placeholder="Ex. mamans actives d'Abidjan" />
                  </Field>
                  <Field label="Offre à mettre en avant (optionnel)">
                    <input value={brief.offer} onChange={(e) => setBrief({ ...brief, offer: e.target.value })} placeholder="Ex. -15 % sur les tenues de fête" />
                  </Field>
                </div>
                <div className="row between">
                  <Field label="Nombre d'angles">
                    <select value={brief.count} onChange={(e) => setBrief({ ...brief, count: Number(e.target.value) })} style={{ width: 90 }}>
                      {[3, 4, 5, 6].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                  <Button busy={ideasJob.running} disabled={!objectiveId} onClick={genIdeas}>
                    ✦ Proposer des angles
                  </Button>
                </div>
              </div>
            )}
            <JobStatus running={ideasJob.running} label="Le Content Strategist cherche des angles…" />
          </Card>
        )}

        {err && <Alert tone="error">{err}</Alert>}

        {ideas && (
          <Card title="2. Choisissez un angle" actions={<CreditCost credits={TASK_CREDIT_COST["content.post"]} />}>
            <div className="stack">
              <AiNotice simulated={ideasMeta?.isSimulated} safety={ideasMeta?.safety} />
              <div className="ideas">
                {ideas.map((i, k) => (
                  <button key={k} className="idea" aria-pressed={chosen === k} onClick={() => setChosen(k)}>
                    <span className="muted small">
                      {i.angle} · {FORMAT_LABELS[i.format] ?? i.format}
                    </span>
                    <span className="hook">« {i.hook} »</span>
                    <span className="small">{i.message}</span>
                    <span className="small" style={{ color: "var(--accent-strong)" }}>
                      → {i.cta}
                    </span>
                  </button>
                ))}
              </div>
              <Field label="Adapter pour">
                <div className="checks">
                  {CHANNELS.map((c) => (
                    <label key={c} className="check">
                      <input
                        type="checkbox"
                        checked={activeChannels.includes(c)}
                        onChange={(e) => setChannels(e.target.checked ? [...activeChannels, c] : activeChannels.filter((x) => x !== c))}
                      />
                      {CHANNEL_LABELS[c]}
                    </label>
                  ))}
                </div>
              </Field>
              <div className="row between">
                <span className="muted small">1 idée → 1 contenu maître → {activeChannels.length} adaptation(s) natives</span>
                <Button busy={postJob.running} disabled={chosen == null || activeChannels.length === 0} onClick={genPost}>
                  ✦ Rédiger le contenu
                </Button>
              </div>
              <JobStatus running={postJob.running} label="Le Copywriter rédige et adapte par réseau…" />
            </div>
          </Card>
        )}

        <Card
          title="Bibliothèque de contenus"
          actions={
            <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus | "")} aria-label="Filtrer par statut" style={{ width: "auto" }}>
              <option value="">Tous (hors archivés)</option>
              {CONTENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CONTENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          }
        >
          {library.data?.length === 0 ? (
            <Empty title="Aucun contenu pour le moment" />
          ) : (
            <ul className="list">
              {library.data?.map((c) => (
                <li key={c.id}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <Link to={`/content/${c.id}`}>
                      <strong>{c.title}</strong>
                    </Link>
                    <div className="row small muted" style={{ marginTop: 4 }}>
                      {c.variants.map((v) => (
                        <ChannelChip key={v.id} channel={v.channel} />
                      ))}
                      {c.pillar && <span>· {c.pillar.name}</span>}
                      <span>· modifié {fmtDateTime(c.updatedAt)}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
