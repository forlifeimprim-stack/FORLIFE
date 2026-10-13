import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OBJECTIVE_LABELS, OBJECTIVE_TYPES, TASK_CREDIT_COST, VIDEO_DURATIONS, VIDEO_MOTIONS, VIDEO_STATUS_LABELS, type ObjectiveType, type VideoMotion } from "@forlife/shared";
import { api, fetchBlobUrl } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDateTime } from "../lib/i18n";
import { Alert, Badge, Button, Card, CreditCost, Empty, Field, JobStatus, PageHeader } from "../components/ui";
import { SecureImg } from "./CreativeStudio";

interface Scene {
  id: string;
  order: number;
  duration: number;
  overlay: string;
  caption: string;
  assetId: string | null;
  motion: VideoMotion;
}
interface Render {
  id: string;
  version: number;
  status: "QUEUED" | "RENDERING" | "SUCCEEDED" | "FAILED";
  progress: number;
  durationSec: number | null;
  sizeBytes: number | null;
  score: number | null;
  error: string | null;
  createdAt: string;
}
interface Qc {
  score: number;
  checks: { key: string; label: string; ok: boolean }[];
  disclaimer: string;
}
interface Project {
  id: string;
  title: string;
  objective: ObjectiveType;
  brief: string;
  offer: string | null;
  cta: string | null;
  durationTarget: number;
  hook: string | null;
  status: string;
  scenes: Scene[];
  renders: Render[];
  qc: Qc;
  renderCreditCost: number;
}
interface Asset {
  id: string;
  type: string;
  fileName: string;
  mime: string;
}

const PHOTO = ["image/png", "image/jpeg", "image/webp"];
const statusTone = (s: string) => (s === "APPROVED" || s === "RENDERED" ? "success" : s === "FAILED" ? "danger" : s === "RENDERING" ? "warning" : "neutral");
const scoreTone = (s: number) => (s >= 80 ? "success" : s >= 60 ? "warning" : "danger");

export function VideoStudioPage() {
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const navigate = useNavigate();
  const projects = useResource<{ id: string; title: string; objective: ObjectiveType; durationTarget: number; status: string; scenes: number; createdAt: string; lastRender: { score: number | null } | null }[]>(`${ws}/video/projects`);
  const assets = useResource<{ assets: Asset[] }>(`${ws}/brand`);
  const photos = assets.data?.assets.filter((a) => PHOTO.includes(a.mime) && a.type !== "logo") ?? [];
  const [f, setF] = useState({ title: "", objective: "SALES" as ObjectiveType, brief: "", offer: "", cta: "", durationTarget: 15 as (typeof VIDEO_DURATIONS)[number], productAssetIds: [] as string[] });
  const [err, setErr] = useState<string | null>(null);
  const job = useJob(ws);

  const togglePhoto = (id: string) =>
    setF((x) => ({ ...x, productAssetIds: x.productAssetIds.includes(id) ? x.productAssetIds.filter((p) => p !== id) : [...x.productAssetIds, id].slice(0, 5) }));

  const submit = async () => {
    setErr(null);
    try {
      const res = await api.post<{ projectId: string; jobId: string }>(`${ws}/video/projects`, { ...f, offer: f.offer || null, cta: f.cta || null });
      const final = await job.track(res.jobId);
      void reloadMe();
      if (final.status === "SUCCEEDED") navigate(`/video/${res.projectId}`);
      else setErr(final.lastError ?? "La création du storyboard a échoué");
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Video Studio" question="Quelle vidéo courte arrêtera le défilement et fera écrire nos clients ?" />
      <div className="stack">
        {can("ai:generate") && (
          <Card title="Nouvelle vidéo courte (9:16)" actions={<CreditCost credits={TASK_CREDIT_COST["video.storyboard"]} />}>
            {err && <Alert tone="error">{err}</Alert>}
            <div className="grid grid-2">
              <Field label="Titre du projet">
                <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ex. Promo bâches de rentrée" />
              </Field>
              <Field label="Objectif">
                <select value={f.objective} onChange={(e) => setF({ ...f, objective: e.target.value as ObjectiveType })}>
                  {OBJECTIVE_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {OBJECTIVE_LABELS[o]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Que doit raconter la vidéo ?">
              <textarea rows={3} value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} placeholder="Ex. Montrer qu'on livre des bâches grand format en 48 h, avec une qualité qui tient au soleil" />
            </Field>
            <div className="grid grid-3">
              <Field label="Durée">
                <select value={f.durationTarget} onChange={(e) => setF({ ...f, durationTarget: Number(e.target.value) as (typeof VIDEO_DURATIONS)[number] })}>
                  {VIDEO_DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} secondes
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Offre (optionnelle)">
                <input value={f.offer} onChange={(e) => setF({ ...f, offer: e.target.value })} placeholder="Ex. -20 %" maxLength={60} />
              </Field>
              <Field label="Appel à l'action">
                <input value={f.cta} onChange={(e) => setF({ ...f, cta: e.target.value })} placeholder="Ex. Écrivez-nous sur WhatsApp" maxLength={40} />
              </Field>
            </div>
            <Field label="Vraies photos à mettre en scène (5 max.)" hint={photos.length ? "Photos conservées telles quelles : l'IA ne les modifie jamais" : "Importez des photos dans Brand DNA → Assets"}>
              <div className="photo-picker">
                {photos.map((p) => (
                  <button key={p.id} type="button" className={`photo-pick ${f.productAssetIds.includes(p.id) ? "on" : ""}`} onClick={() => togglePhoto(p.id)} title={p.fileName}>
                    <SecureImg src={`${ws}/assets/${p.id}/file`} alt={p.fileName} />
                  </button>
                ))}
              </div>
            </Field>
            <div className="row between" style={{ marginTop: 12 }}>
              <span className="muted small">Accroche, storyboard en scènes, sous-titres et carte finale. Vous validez le storyboard avant le rendu.</span>
              <Button busy={job.running} disabled={f.title.trim().length < 3 || f.brief.trim().length < 10} onClick={submit}>
                ✦ Créer le storyboard
              </Button>
            </div>
            <JobStatus running={job.running} label="Le Video Director écrit votre storyboard…" />
          </Card>
        )}
        <Card title="Vos vidéos">
          {projects.data?.length === 0 ? (
            <Empty title="Aucune vidéo pour le moment" />
          ) : (
            <ul className="list">
              {projects.data?.map((p) => (
                <li key={p.id}>
                  <div>
                    <Link to={`/video/${p.id}`}>
                      <strong>{p.title}</strong>
                    </Link>
                    <div className="small muted">
                      {OBJECTIVE_LABELS[p.objective]} · {p.durationTarget} s · {p.scenes} scènes · {fmtDateTime(p.createdAt)}
                    </div>
                  </div>
                  <div className="row">
                    {p.lastRender?.score != null && <Badge tone={scoreTone(p.lastRender.score)}>{p.lastRender.score}/100</Badge>}
                    <Badge tone={statusTone(p.status)}>{VIDEO_STATUS_LABELS[p.status] ?? p.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

export function VideoProjectPage() {
  const { id = "" } = useParams();
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const { data, error, reload } = useResource<Project>(`${ws}/video/projects/${id}`);
  const assets = useResource<{ assets: Asset[] }>(`${ws}/brand`);
  const photos = assets.data?.assets.filter((a) => PHOTO.includes(a.mime) && a.type !== "logo") ?? [];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cta, setCta] = useState<string | null>(null);
  const rendering = data?.status === "RENDERING";

  // Suivi du rendu en arrière-plan
  useEffect(() => {
    if (!rendering) return;
    const t = setInterval(() => void reload(), 3000);
    return () => clearInterval(t);
  }, [rendering, reload]);
  useEffect(() => {
    if (data && !rendering) void reloadMe();
  }, [rendering]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <p className="muted">Chargement…</p>;
  const total = data.scenes.reduce((n, s) => n + s.duration, 0) + 2.5;
  const latest = data.renders[0];
  const done = data.renders.find((r) => r.status === "SUCCEEDED");
  const editable = can("content:update") && !rendering;

  const render = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.post(`${ws}/video/projects/${data.id}/render`, { requestId: crypto.randomUUID() });
      await reload();
      void reloadMe();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const saveCta = async () => {
    if (cta === null) return;
    try {
      await api.patch(`${ws}/video/projects/${data.id}`, { cta: cta || null });
      setCta(null);
      void reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  const approve = async (r: Render) => {
    await api.post(`${ws}/video/renders/${r.id}/approve`);
    void reload();
  };

  return (
    <>
      <PageHeader
        title={data.title}
        question={`${OBJECTIVE_LABELS[data.objective]} · ${data.durationTarget} s · format vertical 9:16${data.offer ? ` · offre ${data.offer}` : ""}`}
        actions={<Badge tone={statusTone(data.status)}>{VIDEO_STATUS_LABELS[data.status] ?? data.status}</Badge>}
      />
      <div className="stack">
        {err && <Alert tone="error">{err}</Alert>}
        {data.hook && (
          <Alert tone="info">
            <strong>Accroche :</strong> {data.hook}
          </Alert>
        )}
        <div className="video-layout">
          <Card title={`Storyboard — ${total.toFixed(1)} s`}>
            <div className="stack">
              {data.scenes.map((s, i) => (
                <SceneEditor key={s.id} ws={ws} scene={s} index={i} photos={photos} editable={editable} onSaved={reload} />
              ))}
              <div className="scene end-card">
                <div className="scene-head">
                  <strong className="small">Carte finale · 2,5 s</strong>
                </div>
                <div className="row">
                  <input value={cta ?? data.cta ?? ""} onChange={(e) => setCta(e.target.value)} disabled={!editable} maxLength={40} placeholder="Appel à l'action" aria-label="Appel à l'action final" />
                  {cta !== null && (
                    <Button variant="secondary" onClick={saveCta}>
                      Enregistrer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
          <div className="stack">
            <Card title="Contrôle qualité" actions={<Badge tone={scoreTone(data.qc.score)}>{data.qc.score}/100</Badge>}>
              <ul className="checklist">
                {data.qc.checks.map((c) => (
                  <li key={c.key} className={c.ok ? "ok" : "ko"}>
                    <span aria-hidden>{c.ok ? "✓" : "!"}</span> {c.label}
                  </li>
                ))}
              </ul>
              <p className="muted small">{data.qc.disclaimer}</p>
            </Card>
            <Card title="Rendu MP4" actions={<CreditCost credits={data.renderCreditCost} />}>
              {rendering && latest ? (
                <div className="stack">
                  <span className="small">Rendu en cours… {latest.progress} %</span>
                  <div className="progress">
                    <span style={{ width: `${Math.max(4, latest.progress)}%`, background: "var(--accent)" }} />
                  </div>
                  <span className="muted small">Environ une minute. Vous pouvez quitter la page, le rendu continue.</span>
                </div>
              ) : (
                <div className="stack">
                  {latest?.status === "FAILED" && <Alert tone="error">Le dernier rendu a échoué ({latest.error}). Vos crédits ont été remboursés.</Alert>}
                  {can("ai:generate") && (
                    <Button busy={busy} disabled={!data.scenes.length} onClick={render}>
                      {done ? "Rendre une nouvelle version" : "Générer la vidéo"}
                    </Button>
                  )}
                </div>
              )}
              {done && <VideoPlayer ws={ws} render={done} canApprove={can("content:update") && data.status !== "APPROVED"} onApprove={() => approve(done)} />}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function SceneEditor({ ws, scene, index, photos, editable, onSaved }: { ws: string; scene: Scene; index: number; photos: Asset[]; editable: boolean; onSaved: () => void }) {
  const [f, setF] = useState(scene);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    setF(scene);
  }, [scene]);
  const dirty = f.overlay !== scene.overlay || f.caption !== scene.caption || f.duration !== scene.duration || f.assetId !== scene.assetId || f.motion !== scene.motion;
  const words = f.overlay.trim().split(/\s+/).filter(Boolean).length;

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await api.patch(`${ws}/video/scenes/${scene.id}`, { overlay: f.overlay, caption: f.caption, duration: f.duration, assetId: f.assetId, motion: f.motion });
      onSaved();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="scene">
      <div className="scene-thumb">{f.assetId ? <SecureImg src={`${ws}/assets/${f.assetId}/file`} /> : <div className="scene-graphic">Aa</div>}</div>
      <div className="stack" style={{ gap: 8 }}>
        <div className="scene-head">
          <strong className="small">
            Scène {index + 1}
            {index === 0 && " · accroche"}
          </strong>
          <span className="small muted">{f.duration.toFixed(1)} s</span>
        </div>
        {err && <Alert tone="error">{err}</Alert>}
        <Field label={`Texte à l'écran (${words}/6 mots)`}>
          <input value={f.overlay} onChange={(e) => setF({ ...f, overlay: e.target.value })} maxLength={80} disabled={!editable} />
        </Field>
        <Field label="Sous-titre">
          <input value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} maxLength={160} disabled={!editable} />
        </Field>
        <div className="grid grid-3">
          <Field label="Durée (s)">
            <input type="number" step={0.1} min={0.8} max={5} value={f.duration} onChange={(e) => setF({ ...f, duration: Number(e.target.value) })} disabled={!editable} />
          </Field>
          <Field label="Mouvement">
            <select value={f.motion} onChange={(e) => setF({ ...f, motion: e.target.value as VideoMotion })} disabled={!editable}>
              {(Object.keys(VIDEO_MOTIONS) as VideoMotion[]).map((m) => (
                <option key={m} value={m}>
                  {VIDEO_MOTIONS[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visuel">
            <select value={f.assetId ?? ""} onChange={(e) => setF({ ...f, assetId: e.target.value || null })} disabled={!editable}>
              <option value="">Fond graphique</option>
              {photos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fileName}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {dirty && editable && (
          <div className="row">
            <Button variant="secondary" busy={saving} disabled={!f.overlay.trim() || f.duration < 0.8 || f.duration > 5} onClick={save}>
              Enregistrer la scène
            </Button>
            <Button variant="ghost" onClick={() => setF(scene)}>
              Annuler
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoPlayer({ ws, render, canApprove, onApprove }: { ws: string; render: Render; canApprove: boolean; onApprove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    fetchBlobUrl(`${ws}/video/renders/${render.id}/file`).then((x) => setUrl((u = x))).catch(() => setUrl(null));
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [ws, render.id]);
  const download = async (format: "mp4" | "srt") => {
    const href = format === "mp4" && url ? url : await fetchBlobUrl(`${ws}/video/renders/${render.id}/file?format=${format}`);
    const a = document.createElement("a");
    a.href = href;
    a.download = `forlife-video-v${render.version}.${format}`;
    a.click();
    if (href !== url) URL.revokeObjectURL(href);
  };
  return (
    <div className="stack" style={{ marginTop: 12 }}>
      {url ? <video className="video-player" src={url} controls playsInline /> : <div className="img-skeleton video-player" />}
      <div className="small muted">
        Version {render.version} · {render.durationSec?.toFixed(1)} s · {render.sizeBytes ? `${(render.sizeBytes / 1e6).toFixed(1)} Mo` : ""} · {fmtDateTime(render.createdAt)}
      </div>
      <div className="row">
        {canApprove && <Button onClick={onApprove}>Valider la vidéo</Button>}
        <Button variant="secondary" onClick={() => download("mp4")}>
          Télécharger MP4
        </Button>
        <Button variant="ghost" onClick={() => download("srt")}>
          Sous-titres (.srt)
        </Button>
      </div>
    </div>
  );
}
