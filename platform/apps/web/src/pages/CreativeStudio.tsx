import { Skeleton } from "../components/Delight";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CREATIVE_FORMATS, CREATIVE_LAYOUTS, OBJECTIVE_LABELS, OBJECTIVE_TYPES, TASK_CREDIT_COST, type CreativeFormat, type CreativeLayout, type ObjectiveType } from "@forlife/shared";
import { api, fetchBlobUrl } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDateTime } from "../lib/i18n";
import { Alert, Badge, Button, Card, CreditCost, Empty, Field, JobStatus, PageHeader } from "../components/ui";

interface Critic {
  score: number;
  dimensions: { key: string; label: string; score: number; note: string }[];
  recommendations: string[];
  disclaimer: string;
}
interface Version {
  id: string;
  version: number;
  score: number;
  status: "DRAFT" | "APPROVED";
  critic: Critic;
  spec: { headline: string; subline: string | null; cta: string | null; layout: CreativeLayout; mood: "dark" | "light" | "accent" };
  createdAt: string;
}
interface Concept {
  id: string;
  label: string;
  title: string;
  rationale: string;
  versions: Version[];
}
interface BriefDetail {
  id: string;
  subject: string;
  objective: ObjectiveType;
  format: CreativeFormat;
  offer: string | null;
  contentId: string | null;
  status: string;
  concepts: Concept[];
  renderCreditCost: number;
}

/** Image protégée (chargée avec le jeton puis affichée en blob). */
export function SecureImg({ src, alt = "", className, style }: { src: string; alt?: string; className?: string; style?: React.CSSProperties }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    fetchBlobUrl(src).then((x) => setUrl((u = x))).catch(() => setUrl(null));
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [src]);
  return url ? <img src={url} alt={alt} className={className} style={style} /> : <div className={`img-skeleton ${className ?? ""}`} style={style} />;
}

const scoreTone = (s: number) => (s >= 80 ? "success" : s >= 60 ? "warning" : "danger");

export function CreativeStudioPage() {
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const briefs = useResource<{ id: string; subject: string; objective: ObjectiveType; format: CreativeFormat; status: string; createdAt: string; best: { id: string; score: number; status: string } | null }[]>(`${ws}/creative/briefs`);
  const assets = useResource<{ assets: { id: string; type: string; fileName: string; mime: string }[] }>(`${ws}/brand`);
  const contents = useResource<{ id: string; title: string }[]>(`${ws}/contents`);
  const [f, setF] = useState({ subject: "", objective: "SALES" as ObjectiveType, format: "SQUARE" as CreativeFormat, offer: "", cta: "", artDirection: "", productAssetId: "", contentId: params.get("contentId") ?? "" });
  const [err, setErr] = useState<string | null>(null);
  const job = useJob(ws);
  const photos = assets.data?.assets.filter((a) => ["image/png", "image/jpeg", "image/webp"].includes(a.mime)) ?? [];

  const submit = async () => {
    setErr(null);
    try {
      const res = await api.post<{ briefId: string; jobId: string }>(`${ws}/creative/briefs`, {
        subject: f.subject,
        objective: f.objective,
        format: f.format,
        offer: f.offer || null,
        cta: f.cta || null,
        artDirection: f.artDirection || null,
        productAssetId: f.productAssetId || null,
        contentId: f.contentId || null,
      });
      const final = await job.track(res.jobId);
      void reloadMe();
      if (final.status === "SUCCEEDED") navigate(`/creative/${res.briefId}`);
      else setErr(final.lastError ?? "La génération a échoué");
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Creative Studio" question="Quel visuel fera vraiment agir nos clients ?" />
      <div className="stack">
        {can("ai:generate") && (
          <Card title="Nouveau brief visuel" actions={<CreditCost credits={TASK_CREDIT_COST["creative.concepts"]} />}>
            {err && <Alert tone="error">{err}</Alert>}
            <div className="grid grid-2">
              <Field label="Sujet du visuel">
                <input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Ex. Nouvelle collection de tenues en pagne" />
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
              <Field label="Format">
                <select value={f.format} onChange={(e) => setF({ ...f, format: e.target.value as CreativeFormat })}>
                  {(Object.keys(CREATIVE_FORMATS) as CreativeFormat[]).map((k) => (
                    <option key={k} value={k}>
                      {CREATIVE_FORMATS[k].label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Photo réelle du produit" hint={photos.length ? "Elle est conservée telle quelle, jamais retouchée par l'IA" : "Importez des photos dans Brand DNA → Assets"}>
                <select value={f.productAssetId} onChange={(e) => setF({ ...f, productAssetId: e.target.value })}>
                  <option value="">Aucune (visuel graphique)</option>
                  {photos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fileName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Offre (optionnelle)">
                <input value={f.offer} onChange={(e) => setF({ ...f, offer: e.target.value })} placeholder="Ex. -15 %" />
              </Field>
              <Field label="Appel à l'action (optionnel)">
                <input value={f.cta} onChange={(e) => setF({ ...f, cta: e.target.value })} placeholder="Ex. Commandez sur WhatsApp" />
              </Field>
              <Field label="Lier à un contenu (optionnel)">
                <select value={f.contentId} onChange={(e) => setF({ ...f, contentId: e.target.value })}>
                  <option value="">Aucun</option>
                  {contents.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Direction artistique (optionnelle)">
                <input value={f.artDirection} onChange={(e) => setF({ ...f, artDirection: e.target.value })} placeholder="Ex. premium, sobre, beaucoup d'espace" />
              </Field>
            </div>
            <div className="row between" style={{ marginTop: 12 }}>
              <span className="muted small">3 concepts différents, notés par le Creative Critic. Le texte est composé par notre moteur : orthographe et prix exacts.</span>
              <Button busy={job.running} disabled={f.subject.trim().length < 3} onClick={submit}>
                ✦ Créer 3 concepts
              </Button>
            </div>
            <JobStatus running={job.running} label="Le Creative Director imagine vos concepts…" />
          </Card>
        )}
        <Card title="Vos créations">
          {briefs.data?.length === 0 ? (
            <Empty title="Aucune création pour le moment" />
          ) : (
            <div className="creative-grid">
              {briefs.data?.map((b) => (
                <Link key={b.id} to={`/creative/${b.id}`} className="creative-tile">
                  {b.best ? <SecureImg src={`${ws}/creative/versions/${b.best.id}/image`} className="thumb" /> : <div className="img-skeleton thumb" />}
                  <div className="meta">
                    <strong className="small">{b.subject}</strong>
                    <div className="row between">
                      <span className="small muted">{CREATIVE_FORMATS[b.format].label.split(" (")[0]}</span>
                      {b.best && <Badge tone={b.best.status === "APPROVED" ? "success" : scoreTone(b.best.score)}>{b.best.status === "APPROVED" ? "Validé" : `${b.best.score}/100`}</Badge>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

export function CreativeBriefPage() {
  const { id = "" } = useParams();
  const { ws } = useWorkspace();
  const { data, error, reload } = useResource<BriefDetail>(`${ws}/creative/briefs/${id}`);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <Skeleton />;
  return (
    <>
      <PageHeader
        title={data.subject}
        question={`${OBJECTIVE_LABELS[data.objective]} · ${CREATIVE_FORMATS[data.format].label}${data.offer ? ` · offre ${data.offer}` : ""}`}
        actions={
          data.contentId && (
            <Link className="btn btn-secondary" to={`/content/${data.contentId}`}>
              Voir le contenu lié
            </Link>
          )
        }
      />
      <div className="concepts">
        {data.concepts.map((c) => (
          <ConceptCard key={c.id} ws={ws} concept={c} format={data.format} hasOffer={!!data.offer} cost={data.renderCreditCost} onChange={reload} />
        ))}
      </div>
    </>
  );
}

function ConceptCard({ ws, concept, format, hasOffer, cost, onChange }: { ws: string; concept: Concept; format: CreativeFormat; hasOffer: boolean; cost: number; onChange: () => void }) {
  const { can, reload: reloadMe } = useAuth();
  const [selected, setSelected] = useState(0);
  const v = concept.versions[selected] ?? concept.versions[0];
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ headline: v?.spec.headline ?? "", subline: v?.spec.subline ?? "", cta: v?.spec.cta ?? "", layout: v?.spec.layout ?? "BOLD", mood: v?.spec.mood ?? "dark" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (v) setF({ headline: v.spec.headline, subline: v.spec.subline ?? "", cta: v.spec.cta ?? "", layout: v.spec.layout, mood: v.spec.mood });
  }, [v?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!v) return null;

  const regenerate = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api.post(`${ws}/creative/concepts/${concept.id}/versions`, { requestId: crypto.randomUUID(), headline: f.headline, subline: f.subline || null, cta: f.cta || null, layout: f.layout, mood: f.mood });
      setSelected(0);
      setEdit(false);
      onChange();
      void reloadMe();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const approve = async () => {
    setBusy(true);
    try {
      await api.post(`${ws}/creative/versions/${v.id}/approve`);
      onChange();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const download = async () => {
    const url = await fetchBlobUrl(`${ws}/creative/versions/${v.id}/image`);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forlife-${concept.label}-v${v.version}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      title={
        <span>
          Concept {concept.label} — {concept.title}
        </span>
      }
      actions={<Badge tone={v.status === "APPROVED" ? "success" : scoreTone(v.score)}>{v.status === "APPROVED" ? "Validé" : `Score ${v.score}/100`}</Badge>}
    >
      <div className="concept-body">
        <SecureImg src={`${ws}/creative/versions/${v.id}/image`} className="concept-img" style={{ aspectRatio: `${CREATIVE_FORMATS[format].width} / ${CREATIVE_FORMATS[format].height}` }} />
        <div className="stack">
          {err && <Alert tone="error">{err}</Alert>}
          <p className="small" style={{ margin: 0 }}>
            {concept.rationale}
          </p>
          <div>
            {v.critic.dimensions.map((d) => (
              <div key={d.key} className="critic-row" title={d.note}>
                <span className="small">{d.label}</span>
                <div className="progress">
                  <span style={{ width: `${d.score}%`, background: d.score >= 80 ? "var(--success)" : d.score >= 60 ? "var(--warning)" : "var(--danger)" }} />
                </div>
                <span className="small muted">{d.score}</span>
              </div>
            ))}
          </div>
          {v.critic.recommendations.length > 0 && (
            <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
              {v.critic.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <p className="muted small" style={{ margin: 0 }}>
            {v.critic.disclaimer}
          </p>
          <div className="row">
            {can("content:update") && v.status !== "APPROVED" && (
              <Button busy={busy} onClick={approve}>
                Valider ce visuel
              </Button>
            )}
            <Button variant="secondary" onClick={download}>
              Télécharger
            </Button>
            {can("ai:generate") && (
              <Button variant="ghost" onClick={() => setEdit(!edit)}>
                Modifier
              </Button>
            )}
          </div>
          {edit && (
            <div className="stack edit-panel">
              <Field label="Titre">
                <input value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} maxLength={90} />
              </Field>
              <Field label="Sous-titre">
                <input value={f.subline} onChange={(e) => setF({ ...f, subline: e.target.value })} maxLength={140} />
              </Field>
              <Field label="Appel à l'action">
                <input value={f.cta} onChange={(e) => setF({ ...f, cta: e.target.value })} maxLength={40} />
              </Field>
              <div className="grid grid-2">
                <Field label="Mise en page">
                  <select value={f.layout} onChange={(e) => setF({ ...f, layout: e.target.value as CreativeLayout })}>
                    {(Object.keys(CREATIVE_LAYOUTS) as CreativeLayout[])
                      .filter((l) => l !== "OFFER_BADGE" || hasOffer)
                      .map((l) => (
                        <option key={l} value={l}>
                          {CREATIVE_LAYOUTS[l]}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Ambiance">
                  <select value={f.mood} onChange={(e) => setF({ ...f, mood: e.target.value as "dark" | "light" | "accent" })}>
                    <option value="dark">Sombre</option>
                    <option value="light">Claire</option>
                    <option value="accent">Couleur de marque</option>
                  </select>
                </Field>
              </div>
              <Button busy={busy} disabled={f.headline.trim().length < 2} onClick={regenerate}>
                Générer la nouvelle version <CreditCost credits={cost} />
              </Button>
            </div>
          )}
          {concept.versions.length > 1 && (
            <div>
              <div className="small muted">Historique des versions</div>
              <div className="row">
                {concept.versions.map((x, i) => (
                  <button key={x.id} className={`version-chip ${i === selected ? "on" : ""}`} onClick={() => setSelected(i)} title={fmtDateTime(x.createdAt)}>
                    v{x.version} · {x.score}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
