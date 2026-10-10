import { useEffect, useState } from "react";
import { CHANNEL_LABELS } from "@forlife/shared";
import { api, fetchBlobUrl } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDate, fmtXof } from "../lib/i18n";
import type { Guideline, SafetyResult } from "../lib/types";
import { AiNotice, Alert, Badge, Button, Card, CreditCost, Empty, Field, JobStatus, ListInput, Modal, PageHeader, TagList } from "../components/ui";

interface BrandData {
  brand: { id: string; name: string; mission: string | null; positioning: string | null; values: string[]; lockedFacts: string[]; guidelines: Guideline[] };
  assets: { id: string; type: string; fileName: string; mime: string; sizeBytes: number; createdAt: string }[];
  products: { id: string; name: string; description: string | null; priceAmount: number | null; locked: boolean }[];
  dnaCreditCost: number;
}

type Tab = "dna" | "identity" | "assets" | "products";

export function BrandPage() {
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const { data, error, reload } = useResource<BrandData>(`${ws}/brand`);
  const [tab, setTab] = useState<Tab>("dna");
  const [analyzeOpen, setAnalyzeOpen] = useState(false);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <p className="muted">Chargement…</p>;

  const approved = data.brand.guidelines.find((g) => g.status === "APPROVED") ?? null;
  const draft = data.brand.guidelines.find((g) => g.status === "DRAFT") ?? null;

  return (
    <>
      <PageHeader
        title="Brand DNA"
        question="Qui sommes-nous, comment parlons-nous, que ne faut-il jamais dire ?"
        actions={
          can("ai:generate") &&
          can("brand:update") && (
            <Button onClick={() => setAnalyzeOpen(true)}>
              ✦ Construire avec l'IA <CreditCost credits={data.dnaCreditCost} />
            </Button>
          )
        }
      />
      <div className="tabs" role="tablist">
        {(
          [
            ["dna", "Voix & règles"],
            ["identity", "Identité"],
            ["assets", `Assets (${data.assets.length})`],
            ["products", `Produits (${data.products.length})`],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "dna" && <DnaTab ws={ws} approved={approved} draft={draft} versions={data.brand.guidelines} onChange={reload} />}
      {tab === "identity" && <IdentityTab ws={ws} brand={data.brand} onSaved={reload} />}
      {tab === "assets" && <AssetsTab ws={ws} assets={data.assets} onChange={reload} />}
      {tab === "products" && <ProductsTab ws={ws} products={data.products} onChange={reload} />}

      <AnalyzeModal
        open={analyzeOpen}
        ws={ws}
        cost={data.dnaCreditCost}
        onClose={() => setAnalyzeOpen(false)}
        onDone={() => {
          setAnalyzeOpen(false);
          setTab("dna");
          void reload();
          void reloadMe();
        }}
      />
    </>
  );
}

function DnaTab({ ws, approved, draft, versions, onChange }: { ws: string; approved: Guideline | null; draft: Guideline | null; versions: Guideline[]; onChange: () => void }) {
  const { can } = useAuth();
  const [edit, setEdit] = useState<Guideline | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const shown = draft ?? approved;

  useEffect(() => setEdit(draft), [draft]);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
      onChange();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!shown) {
    return (
      <Card>
        <Empty title="Pas encore de Brand DNA">
          <p>Lancez l'analyse IA à partir de vos textes, ou créez une première version manuellement.</p>
          {can("brand:update") && (
            <Button variant="secondary" busy={busy} onClick={() => act(() => api.post(`${ws}/brand/guidelines`, {}))}>
              Créer manuellement
            </Button>
          )}
        </Empty>
      </Card>
    );
  }

  return (
    <div className="stack">
      {err && <Alert tone="error">{err}</Alert>}
      {draft && (
        <Alert tone="warning">
          Version {draft.version} en brouillon{draft.source === "ai" ? " (proposée par l'IA)" : ""} : relisez-la puis validez-la pour qu'elle guide toutes les générations.
        </Alert>
      )}
      {draft && edit && can("brand:update") ? (
        <Card
          title={`Version ${draft.version} — brouillon`}
          actions={
            <>
              <Button variant="secondary" busy={busy} onClick={() => act(() => api.patch(`${ws}/brand/guidelines/${draft.id}`, pick(edit)))}>
                Enregistrer
              </Button>
              {can("brand:approve") && (
                <Button busy={busy} onClick={() => act(async () => {
                  await api.patch(`${ws}/brand/guidelines/${draft.id}`, pick(edit));
                  await api.post(`${ws}/brand/guidelines/${draft.id}/approve`);
                })}>
                  Valider cette version
                </Button>
              )}
            </>
          }
        >
          <div className="grid grid-2">
            <Field label="Ton de marque">
              <textarea rows={3} value={edit.tone ?? ""} onChange={(e) => setEdit({ ...edit, tone: e.target.value })} />
            </Field>
            <Field label="Vocabulaire à privilégier">
              <ListInput value={edit.vocabulary} onChange={(v) => setEdit({ ...edit, vocabulary: v })} />
            </Field>
            <Field label="Mots interdits" hint="L'IA les évite et le contrôle sécurité les signale">
              <ListInput value={edit.forbiddenWords} onChange={(v) => setEdit({ ...edit, forbiddenWords: v })} />
            </Field>
            <Field label="Promesses">
              <ListInput value={edit.promises} onChange={(v) => setEdit({ ...edit, promises: v })} />
            </Field>
            <Field label="Preuves">
              <ListInput value={edit.proofs} onChange={(v) => setEdit({ ...edit, proofs: v })} />
            </Field>
            <Field label="Objections clients">
              <ListInput value={edit.objections} onChange={(v) => setEdit({ ...edit, objections: v })} />
            </Field>
            <Field label="Règles visuelles">
              <ListInput value={edit.visualRules} onChange={(v) => setEdit({ ...edit, visualRules: v })} />
            </Field>
            <Field label="Typographies">
              <ListInput value={edit.fonts} onChange={(v) => setEdit({ ...edit, fonts: v })} />
            </Field>
          </div>
          {edit.voiceByChannel.length > 0 && (
            <div className="stack" style={{ marginTop: 16 }}>
              <h3>Voix par canal</h3>
              {edit.voiceByChannel.map((v, i) => (
                <Field key={v.channel} label={CHANNEL_LABELS[v.channel]}>
                  <input
                    value={v.guidance}
                    onChange={(e) => {
                      const next = [...edit.voiceByChannel];
                      next[i] = { ...v, guidance: e.target.value };
                      setEdit({ ...edit, voiceByChannel: next });
                    }}
                  />
                </Field>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <GuidelineView g={shown} />
      )}
      {approved && draft && (
        <details>
          <summary className="muted">Voir la version validée actuelle (v{approved.version})</summary>
          <GuidelineView g={approved} />
        </details>
      )}
      {!draft && approved && can("brand:update") && (
        <div>
          <Button variant="secondary" busy={busy} onClick={() => act(() => api.post(`${ws}/brand/guidelines`, {}))}>
            Créer une nouvelle version
          </Button>
        </div>
      )}
      <Card title="Historique des versions">
        <ul className="list">
          {versions.map((v) => (
            <li key={v.id}>
              <span>
                v{v.version} · {v.source === "ai" ? "IA" : "manuel"} · {fmtDate(v.createdAt)}
              </span>
              <Badge tone={v.status === "APPROVED" ? "success" : v.status === "DRAFT" ? "warning" : "neutral"}>
                {v.status === "APPROVED" ? "Validée" : v.status === "DRAFT" ? "Brouillon" : "Archivée"}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function pick(g: Guideline) {
  const { tone, vocabulary, forbiddenWords, promises, proofs, objections, visualRules, fonts, voiceByChannel } = g;
  return { tone, vocabulary, forbiddenWords, promises, proofs, objections, visualRules, fonts, voiceByChannel };
}

function GuidelineView({ g }: { g: Guideline }) {
  return (
    <Card title={`Version ${g.version}${g.status === "APPROVED" ? " — validée" : ""}`}>
      <div className="grid grid-2">
        <div className="stack">
          <div>
            <h3>Ton</h3>
            <p>{g.tone ?? "—"}</p>
          </div>
          <div>
            <h3>Vocabulaire</h3>
            <TagList items={g.vocabulary} />
          </div>
          <div>
            <h3>Mots interdits</h3>
            <TagList items={g.forbiddenWords} />
          </div>
          {g.colors.length > 0 && (
            <div className="row">
              {g.colors.map((c) => (
                <span key={c.hex} className="swatch">
                  <i style={{ background: c.hex }} /> {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="stack">
          <div>
            <h3>Promesses</h3>
            <TagList items={g.promises} />
          </div>
          <div>
            <h3>Preuves</h3>
            <TagList items={g.proofs} />
          </div>
          <div>
            <h3>Objections</h3>
            <TagList items={g.objections} />
          </div>
          {g.voiceByChannel.length > 0 && (
            <div>
              <h3>Voix par canal</h3>
              <ul className="small">
                {g.voiceByChannel.map((v) => (
                  <li key={v.channel}>
                    <b>{CHANNEL_LABELS[v.channel]}</b> : {v.guidance}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function IdentityTab({ ws, brand, onSaved }: { ws: string; brand: BrandData["brand"]; onSaved: () => void }) {
  const { can } = useAuth();
  const [f, setF] = useState({ name: brand.name, mission: brand.mission ?? "", positioning: brand.positioning ?? "", values: brand.values, lockedFacts: brand.lockedFacts });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const ro = !can("brand:update");
  const save = async () => {
    setBusy(true);
    try {
      await api.patch(`${ws}/brand`, { ...f, mission: f.mission || null, positioning: f.positioning || null });
      setMsg({ tone: "success", text: "Identité enregistrée" });
      onSaved();
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Identité de marque" actions={!ro && <Button busy={busy} onClick={save}>Enregistrer</Button>}>
      <div className="stack">
        {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
        <Field label="Nom de la marque">
          <input disabled={ro} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Mission">
          <textarea disabled={ro} rows={2} value={f.mission} onChange={(e) => setF({ ...f, mission: e.target.value })} />
        </Field>
        <Field label="Positionnement">
          <textarea disabled={ro} rows={2} value={f.positioning} onChange={(e) => setF({ ...f, positioning: e.target.value })} />
        </Field>
        <div className="grid grid-2">
          <Field label="Valeurs">
            <ListInput value={f.values} onChange={(v) => setF({ ...f, values: v })} />
          </Field>
          <Field label="Faits verrouillés" hint="Mentions légales, nom exact, garanties… repris tels quels par l'IA">
            <ListInput value={f.lockedFacts} onChange={(v) => setF({ ...f, lockedFacts: v })} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function AssetThumb({ ws, id, mime }: { ws: string; id: string; mime: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!mime.startsWith("image/")) return;
    let u: string | null = null;
    fetchBlobUrl(`${ws}/assets/${id}/file`).then((x) => setUrl((u = x))).catch(() => undefined);
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [ws, id, mime]);
  if (url) return <img src={url} alt="" loading="lazy" />;
  return <span className="muted">{mime === "application/pdf" ? "PDF" : mime === "text/plain" ? "TXT" : "Fichier"}</span>;
}

function AssetsTab({ ws, assets, onChange }: { ws: string; assets: BrandData["assets"]; onChange: () => void }) {
  const { can } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [type, setType] = useState("logo");

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    try {
      await api.upload(`${ws}/assets`, form);
      onChange();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Bibliothèque d'assets"
      actions={
        can("assets:create") && (
          <div className="row">
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type d'asset" style={{ width: "auto" }}>
              <option value="logo">Logo</option>
              <option value="photo">Photo</option>
              <option value="catalog">Catalogue</option>
              <option value="document">Document</option>
              <option value="other">Autre</option>
            </select>
            <label className="btn btn-primary">
              {busy ? <span className="spinner" /> : "Importer"}
              <input type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf,text/plain" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
        )
      }
    >
      {err && <Alert tone="error">{err}</Alert>}
      <p className="muted small">Formats : PNG, JPEG, WebP, SVG, PDF, TXT (15 Mo max). Les documents texte enrichissent l'analyse Brand DNA.</p>
      {assets.length === 0 ? (
        <Empty title="Aucun asset importé" />
      ) : (
        <div className="asset-grid">
          {assets.map((a) => (
            <div className="asset" key={a.id}>
              <div className="thumb">
                <AssetThumb ws={ws} id={a.id} mime={a.mime} />
              </div>
              <div className="meta">
                <span title={a.fileName}>{a.fileName}</span>
                {can("assets:delete") && (
                  <button className="icon-btn" aria-label={`Supprimer ${a.fileName}`} onClick={() => api.del(`${ws}/assets/${a.id}`).then(onChange)}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ProductsTab({ ws, products, onChange }: { ws: string; products: BrandData["products"]; onChange: () => void }) {
  const { can } = useAuth();
  const [f, setF] = useState({ name: "", priceAmount: "" });
  const [err, setErr] = useState<string | null>(null);
  const add = async () => {
    try {
      await api.post(`${ws}/products`, { name: f.name, priceAmount: f.priceAmount ? Number(f.priceAmount) : undefined });
      setF({ name: "", priceAmount: "" });
      onChange();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  return (
    <Card title="Produits et prix verrouillés">
      <p className="muted small">L'IA reprend toujours ces noms et prix à l'identique : elle n'invente jamais de prix.</p>
      {err && <Alert tone="error">{err}</Alert>}
      {can("brand:update") && (
        <div className="row" style={{ marginBottom: 12 }}>
          <input placeholder="Nom du produit ou service" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ flex: 2, minWidth: 180 }} />
          <input type="number" min={0} placeholder="Prix (FCFA)" value={f.priceAmount} onChange={(e) => setF({ ...f, priceAmount: e.target.value })} style={{ flex: 1, minWidth: 120 }} />
          <Button disabled={!f.name.trim()} onClick={add}>
            Ajouter
          </Button>
        </div>
      )}
      {products.length === 0 ? (
        <Empty title="Aucun produit" />
      ) : (
        <ul className="list">
          {products.map((p) => (
            <li key={p.id}>
              <span>
                <strong>{p.name}</strong> {p.locked && <Badge>🔒 verrouillé</Badge>}
              </span>
              <span className="row">
                {p.priceAmount != null ? fmtXof(p.priceAmount) : <span className="muted">Prix non communiqué</span>}
                {can("brand:update") && (
                  <button className="icon-btn" aria-label={`Supprimer ${p.name}`} onClick={() => api.del(`${ws}/products/${p.id}`).then(onChange)}>
                    ×
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function AnalyzeModal({ open, ws, cost, onClose, onDone }: { open: boolean; ws: string; cost: number; onClose: () => void; onDone: () => void }) {
  const [sources, setSources] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { job, running, track, reset } = useJob<{ isSimulated: boolean; safety: SafetyResult }>(ws);

  const start = async () => {
    setErr(null);
    reset();
    try {
      const { jobId } = await api.post<{ jobId: string }>(`${ws}/brand/analyze`, { sources });
      const final = await track(jobId);
      if (final.status === "SUCCEEDED") onDone();
      else setErr(final.lastError ?? "La génération a échoué");
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <Modal
      open={open}
      title="Construire le Brand DNA avec l'IA"
      onClose={onClose}
      footer={
        <>
          <CreditCost credits={cost} />
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button busy={running} onClick={start}>
            Analyser
          </Button>
        </>
      }
    >
      <p className="muted small">
        Collez la présentation de l'entreprise, des anciens posts, le texte de votre site ou de votre catalogue. Les documents texte importés dans les assets sont ajoutés automatiquement.
      </p>
      <textarea rows={10} value={sources} onChange={(e) => setSources(e.target.value)} placeholder="Nous sommes…" />
      <JobStatus running={running} label="Le Brand Guardian analyse vos sources…" error={err} />
      {job?.status === "SUCCEEDED" && <AiNotice simulated={job.result?.isSimulated} safety={job.result?.safety} />}
    </Modal>
  );
}
