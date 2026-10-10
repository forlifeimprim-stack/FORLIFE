import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CHANNEL_LABELS, CHANNEL_LIMITS } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDateTime, utcToZonedInput, zonedToUtc } from "../lib/i18n";
import type { ContentItem, Variant } from "../lib/types";
import { AiNotice, Alert, Badge, Button, Card, Field, LogoMark, PageHeader, StatusBadge } from "../components/ui";

export function ContentDetail() {
  const { id = "" } = useParams();
  const { ws, workspace } = useWorkspace();
  const { can } = useAuth();
  const navigate = useNavigate();
  const { data: c, error, reload, setData } = useResource<ContentItem>(`${ws}/contents/${id}`);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [when, setWhen] = useState(() => utcToZonedInput(new Date(Date.now() + 864e5), workspace.timezone).slice(0, 11) + "09:00");
  const [master, setMaster] = useState({ title: "", hook: "", body: "", cta: "" });

  useEffect(() => {
    if (c) setMaster({ title: c.title, hook: c.hook ?? "", body: c.body, cta: c.cta ?? "" });
  }, [c]);

  // Rafraîchissement automatique pendant la génération.
  useEffect(() => {
    if (c?.status !== "GENERATING") return;
    const timer = setInterval(() => void reload(), 2000);
    return () => clearInterval(timer);
  }, [c?.status, reload]);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!c) return <p className="muted">Chargement…</p>;

  const editable = can("content:update") && ["DRAFT", "REVIEW", "APPROVED", "FAILED"].includes(c.status);
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const dirty = master.title !== c.title || master.hook !== (c.hook ?? "") || master.body !== c.body || master.cta !== (c.cta ?? "");

  return (
    <>
      <PageHeader
        title={c.title}
        question={c.objective ? `Objectif : ${c.objective.title}` : undefined}
        actions={
          <>
            <StatusBadge status={c.status} />
            {c.status === "DRAFT" && can("approvals:create") && (
              <Button busy={busy} onClick={() => run(() => api.post(`${ws}/contents/${c.id}/submit`))}>
                Soumettre pour validation
              </Button>
            )}
            {c.status === "SCHEDULED" && can("content:update") && (
              <Button variant="secondary" busy={busy} onClick={() => run(() => api.post(`${ws}/contents/${c.id}/unschedule`))}>
                Déprogrammer
              </Button>
            )}
            {["DRAFT", "FAILED"].includes(c.status) && can("content:delete") && (
              <Button
                variant="danger"
                busy={busy}
                onClick={() => {
                  if (confirm("Supprimer définitivement ce brouillon ?")) void run(async () => {
                    await api.del(`${ws}/contents/${c.id}`);
                    navigate("/content");
                  });
                }}
              >
                Supprimer
              </Button>
            )}
            {["REVIEW", "APPROVED", "PUBLISHED", "FAILED"].includes(c.status) && can("content:update") && (
              <Button variant="ghost" busy={busy} onClick={() => run(() => api.post(`${ws}/contents/${c.id}/archive`))}>
                Archiver
              </Button>
            )}
          </>
        }
      />
      <div className="stack">
        {err && <Alert tone="error">{err}</Alert>}
        {c.status === "GENERATING" && (
          <Alert tone="info">
            <span className="spinner" /> Génération en cours… cette page se met à jour automatiquement.
          </Alert>
        )}
        {c.status === "FAILED" && <Alert tone="error">La génération a échoué. Vos crédits ont été remboursés ; vous pouvez rédiger le contenu manuellement.</Alert>}
        {c.status === "REVIEW" && <Alert tone="warning">En attente de validation par un responsable. Toute modification renverra le contenu en brouillon.</Alert>}
        {c.status === "APPROVED" && can("content:update") && (
          <Card title="Programmer la publication">
            <div className="row">
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} style={{ width: "auto" }} aria-label="Date et heure de publication" />
              <span className="muted small">Fuseau : {workspace.timezone}</span>
              <Button busy={busy} onClick={() => run(() => api.post(`${ws}/contents/${c.id}/schedule`, { scheduledAt: zonedToUtc(when, workspace.timezone).toISOString() }))}>
                Programmer
              </Button>
            </div>
            <p className="muted small">La publication automatique sur les réseaux arrive avec le Social Hub (Phase 3). En attendant, le calendrier sert de planning éditorial.</p>
          </Card>
        )}
        {c.status === "SCHEDULED" && c.scheduledAt && <Alert tone="info">Programmé pour le {fmtDateTime(c.scheduledAt)}.</Alert>}
        {c.aiRunId && <AiNotice />}

        <div className="grid grid-2">
          <Card
            title="Contenu maître"
            actions={
              editable &&
              dirty && (
                <Button
                  busy={busy}
                  onClick={() =>
                    run(async () => {
                      const updated = await api.patch<ContentItem>(`${ws}/contents/${c.id}`, { revision: c.revision, title: master.title, hook: master.hook || null, body: master.body, cta: master.cta || null });
                      setData(updated);
                    })
                  }
                >
                  Enregistrer
                </Button>
              )
            }
          >
            <div className="stack">
              <Field label="Titre interne">
                <input disabled={!editable} value={master.title} onChange={(e) => setMaster({ ...master, title: e.target.value })} />
              </Field>
              <Field label="Accroche">
                <input disabled={!editable} value={master.hook} onChange={(e) => setMaster({ ...master, hook: e.target.value })} />
              </Field>
              <Field label="Texte">
                <textarea disabled={!editable} rows={9} value={master.body} onChange={(e) => setMaster({ ...master, body: e.target.value })} />
              </Field>
              <Field label="Appel à l'action">
                <input disabled={!editable} value={master.cta} onChange={(e) => setMaster({ ...master, cta: e.target.value })} />
              </Field>
            </div>
          </Card>
          <Card title="Historique de validation">
            {c.approvals?.length ? (
              <ul className="list">
                {c.approvals.map((a) => (
                  <li key={a.id}>
                    <span>
                      <Badge tone={a.status === "APPROVED" ? "success" : a.status === "REJECTED" ? "danger" : "warning"}>
                        {a.status === "APPROVED" ? "Approuvé" : a.status === "REJECTED" ? "Refusé" : "En attente"}
                      </Badge>{" "}
                      {a.comment && <span className="small">« {a.comment} »</span>}
                    </span>
                    <span className="muted small">{fmtDateTime(a.decidedAt ?? a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Pas encore soumis.</p>
            )}
            <p className="muted small" style={{ marginTop: 12 }}>
              <Link to="/content">← Retour au Content Studio</Link>
            </p>
          </Card>
        </div>

        <h2>Prévisualisation par réseau</h2>
        <div className="previews">
          {c.variants.map((v) => (
            <VariantPreview key={v.id} ws={ws} contentId={c.id} brandName={workspace.name} variant={v} editable={editable} onSaved={reload} />
          ))}
        </div>
      </div>
    </>
  );
}

function VariantPreview({ ws, contentId, brandName, variant, editable, onSaved }: { ws: string; contentId: string; brandName: string; variant: Variant; editable: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(variant.body);
  const [tags, setTags] = useState(variant.hashtags.join(" "));
  const [err, setErr] = useState<string | null>(null);
  const limit = CHANNEL_LIMITS[variant.channel];
  const hashtags = tags.split(/[\s,#]+/).filter(Boolean);
  const total = body.length + hashtags.reduce((n, h) => n + h.length + 2, 0);
  const over = total > limit.maxChars || hashtags.length > limit.maxHashtags;
  const isWhatsApp = variant.channel === "WHATSAPP";

  useEffect(() => {
    setBody(variant.body);
    setTags(variant.hashtags.join(" "));
  }, [variant]);

  const save = async () => {
    try {
      await api.patch(`${ws}/contents/${contentId}/variants/${variant.id}`, { body, hashtags });
      setEditing(false);
      onSaved();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <article className={`preview ${isWhatsApp ? "whatsapp" : ""}`} aria-label={`Aperçu ${CHANNEL_LABELS[variant.channel]}`}>
      <div className="preview-head">
        <span className="avatar">
          <LogoMark size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <strong className="small">{brandName}</strong>
          <div className="muted small">{CHANNEL_LABELS[variant.channel]}</div>
        </div>
        {editable && !editing && (
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            Modifier
          </button>
        )}
      </div>
      {["INSTAGRAM", "TIKTOK", "FACEBOOK"].includes(variant.channel) && !editing && <div className="preview-media">Visuel — Creative Studio (Phase 2)</div>}
      {editing ? (
        <div className="stack" style={{ padding: 12 }}>
          {err && <Alert tone="error">{err}</Alert>}
          <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Texte de la variante" />
          {limit.maxHashtags > 0 && <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="hashtags séparés par des espaces" aria-label="Hashtags" />}
          <div className="row">
            <Button onClick={save} disabled={over}>
              Enregistrer
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="preview-body">
          {variant.body}
          {variant.hashtags.length > 0 && (
            <>
              {"\n\n"}
              <span className="hashtags">{variant.hashtags.map((h) => `#${h}`).join(" ")}</span>
            </>
          )}
        </div>
      )}
      <div className="preview-foot">
        <span className={over ? "over" : ""}>
          {total} / {limit.maxChars} car.
        </span>
        {limit.maxHashtags > 0 && (
          <span className={hashtags.length > limit.maxHashtags ? "over" : ""}>
            {hashtags.length} / {limit.maxHashtags} hashtags
          </span>
        )}
      </div>
    </article>
  );
}
