import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SANDBOX_NETWORKS, TASK_CREDIT_COST, type SandboxNetwork } from "@forlife/shared";
import { Skeleton } from "../components/Delight";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useJob, useResource } from "../lib/hooks";
import { fmtDate, fmtDateTime } from "../lib/i18n";
import type { SafetyResult } from "../lib/types";
import { AiNotice, Alert, Badge, Button, Card, CreditCost, JobStatus, PageHeader, TagList } from "../components/ui";
import { ChannelIcon } from "../components/SocialIcon";

type Links = Partial<Record<SandboxNetwork, string>>;

const NETWORKS: { key: SandboxNetwork; label: string; placeholder: string; hint: string }[] = [
  { key: "FACEBOOK", label: "Page Facebook", placeholder: "https://www.facebook.com/votrepage", hint: "Publications lues si la Page est connectée dans le Social Hub." },
  { key: "INSTAGRAM", label: "Compte Instagram", placeholder: "https://www.instagram.com/votrecompte", hint: "Compte professionnel ou créateur, lu via un Instagram connecté." },
  { key: "TIKTOK", label: "Compte TikTok", placeholder: "https://www.tiktok.com/@votrecompte", hint: "Vidéos lues si le compte est connecté dans le Social Hub." },
  { key: "YOUTUBE", label: "Chaîne YouTube", placeholder: "https://www.youtube.com/@votrechaine", hint: "Toute chaîne publique, lue via une chaîne connectée." },
  { key: "LINKEDIN", label: "Page LinkedIn", placeholder: "https://www.linkedin.com/company/votrepage", hint: "Présentation publique de la page uniquement." },
];

const SOURCE_LABELS: Record<AccountReport["source"], { label: string; tone: "success" | "accent" | "warning" | "neutral" }> = {
  connected: { label: "Compte connecté", tone: "success" },
  lookup: { label: "Lu via l'API du réseau", tone: "accent" },
  public: { label: "Présentation publique", tone: "warning" },
  none: { label: "Non lu", tone: "neutral" },
};

interface AccountReport {
  key: SandboxNetwork;
  link: string;
  name: string;
  network: string;
  source: "connected" | "lookup" | "public" | "none";
  profile: { name: string; bio: string | null; followers: number | null } | null;
  note: string | null;
  posts: number;
  avgEngagement: number;
  avgViews: number | null;
  postsPerWeek: number | null;
  lastPostAt: string | null;
}

interface Audit {
  id: string;
  links: Links;
  postsCount: number;
  createdAt: string;
  stats: {
    totalPosts: number;
    avgEngagement: number;
    accounts: AccountReport[];
    bestWeekday: string | null;
    bestSlot: string | null;
    formats: { format: string; posts: number; avgEngagement: number }[];
    topPosts: { network: string; accountName: string; format: string; date: string | null; engagement: number; views: number | null; text: string; url: string | null }[];
  };
  report: {
    summary: string;
    score: number;
    observedTone: string;
    contentThemes: string[];
    strengths: string[];
    weaknesses: string[];
    recommendations: { title: string; rationale: string }[];
    isSimulated: boolean;
    safety: SafetyResult | null;
  };
}

interface AuditState {
  latest: Audit | null;
  connectedAccounts: number;
  creditCost: number;
}

/** Analyser mes réseaux : point de départ du Business Brain, avant le Brand DNA. */
export function SocialAuditPage() {
  const { ws } = useWorkspace();
  const { can, reload: reloadMe } = useAuth();
  const { data, error, reload } = useResource<AuditState>(`${ws}/social/audit`);
  const { running, track, reset } = useJob(ws);
  const [err, setErr] = useState<string | null>(null);
  const [links, setLinks] = useState<Links>({});

  // Les liens de la dernière analyse sont repris pour relancer l'analyse en un clic.
  useEffect(() => {
    if (data?.latest?.links) setLinks(data.latest.links);
  }, [data?.latest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!data) return <Skeleton />;

  const filled = SANDBOX_NETWORKS.filter((n) => links[n]?.trim()).length;
  const start = async () => {
    setErr(null);
    reset();
    try {
      const payload = Object.fromEntries(SANDBOX_NETWORKS.map((n) => [n, links[n]?.trim() ?? ""]));
      const { jobId } = await api.post<{ jobId: string }>(`${ws}/social/audit`, { links: payload });
      const final = await track(jobId);
      if (final.status !== "SUCCEEDED") setErr(final.lastError ?? "L'analyse a échoué");
      void reload();
      void reloadMe();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div className="stack">
      <PageHeader title="Analyser mes réseaux" question="Que disent vos publications actuelles, et qu'est-ce qui marche vraiment ?" />
      <Card title="Liens de vos pages">
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
        >
          <p className="muted small">
            Collez l'adresse de chacune de vos pages (laissez vide un réseau que vous n'utilisez pas). L'analyse lit jusqu'à 25 publications par page, calcule vos meilleurs jours, créneaux et formats, puis rédige un audit. Les
            textes lus servent ensuite à construire votre Brand DNA.
          </p>
          <div className="grid grid-2">
            {NETWORKS.map((n) => (
              <label key={n.key} className="field">
                <span className="field-label row">
                  <ChannelIcon channel={n.key} /> {n.label}
                </span>
                <input type="url" inputMode="url" value={links[n.key] ?? ""} placeholder={n.placeholder} onChange={(e) => setLinks({ ...links, [n.key]: e.target.value })} />
                <span className="field-hint">{n.hint}</span>
              </label>
            ))}
          </div>
          {data.connectedAccounts === 0 && (
            <Alert tone="info">
              Aucun réseau n'est encore connecté : seules les présentations publiques des pages pourront être lues. Pour analyser vos publications et leurs chiffres,{" "}
              {can("social:read") ? <Link to="/social">connectez vos comptes dans le Social Hub</Link> : "demandez à un administrateur de connecter vos comptes"}.
            </Alert>
          )}
          <JobStatus running={running} label="Lecture de vos pages et analyse en cours…" error={err} />
          {can("ai:generate") && (
            <div>
              <Button type="submit" busy={running} disabled={!filled}>
                ✦ {data.latest ? "Relancer l'analyse" : "Analyser mes réseaux"} <CreditCost credits={data.creditCost} />
              </Button>
            </div>
          )}
        </form>
      </Card>
      {data.latest && <AuditView ws={ws} audit={data.latest} />}
    </div>
  );
}

function AuditView({ ws, audit }: { ws: string; audit: Audit }) {
  const { can, reload: reloadMe } = useAuth();
  const navigate = useNavigate();
  const { stats, report } = audit;
  const { running, track } = useJob(ws);
  const [err, setErr] = useState<string | null>(null);

  /** Les textes des publications deviennent les sources du Brand DNA (brouillon à valider). */
  const buildDna = async () => {
    setErr(null);
    try {
      const { sources } = await api.get<{ sources: string }>(`${ws}/social/audit/${audit.id}/sources`);
      const { jobId } = await api.post<{ jobId: string }>(`${ws}/brand/analyze`, { sources });
      const final = await track(jobId);
      void reloadMe();
      if (final.status === "SUCCEEDED") navigate("/brand");
      else setErr(final.lastError ?? "La génération du Brand DNA a échoué");
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div className="stack">
      <Card
        title="Audit de vos réseaux"
        actions={
          can("ai:generate") &&
          can("brand:update") && (
            <Button busy={running} onClick={buildDna}>
              ✦ Construire mon Brand DNA à partir de ces publications <CreditCost credits={TASK_CREDIT_COST["brand.dna"]} />
            </Button>
          )
        }
      >
        <div className="stack">
          <JobStatus running={running} label="Le Brand Guardian lit vos publications…" error={err} />
          <AiNotice simulated={report.isSimulated} safety={report.safety} />
          <p>{report.summary}</p>
          <p className="muted small">
            Analyse du {fmtDateTime(audit.createdAt)} · {audit.postsCount} publications lues. Les chiffres sont mesurés sur vos pages ; le texte est une proposition de l'IA.
          </p>
          <div className="grid grid-4">
            <div className="kpi">
              <span className="label">Score global (estimation)</span>
              <span className="value">{report.score}/100</span>
            </div>
            <div className="kpi">
              <span className="label">Interactions moyennes par post</span>
              <span className="value">{stats.avgEngagement}</span>
            </div>
            <div className="kpi">
              <span className="label">Meilleur jour</span>
              <span className="value">{stats.bestWeekday ?? "—"}</span>
            </div>
            <div className="kpi">
              <span className="label">Meilleur créneau</span>
              <span className="value small-value">{stats.bestSlot ?? "—"}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card title="Ce que l'IA observe">
          <div className="stack">
            <div>
              <h3>Ton employé</h3>
              <p>{report.observedTone}</p>
            </div>
            <div>
              <h3>Thèmes récurrents</h3>
              <TagList items={report.contentThemes} />
            </div>
            <div>
              <h3>Forces</h3>
              <TagList items={report.strengths} />
            </div>
            <div>
              <h3>À améliorer</h3>
              <TagList items={report.weaknesses} />
            </div>
          </div>
        </Card>
        <Card title="Recommandations">
          <ol className="stack">
            {report.recommendations.map((r) => (
              <li key={r.title}>
                <b>{r.title}</b>
                <br />
                <span className="muted small">{r.rationale}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card title="Par réseau">
        <div className="table-wrap" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Page</th>
                <th>Lecture</th>
                <th>Posts lus</th>
                <th>Interactions moy.</th>
                <th>Vues moy.</th>
                <th>Rythme</th>
                <th>Dernier post</th>
              </tr>
            </thead>
            <tbody>
              {stats.accounts.map((a) => (
                <tr key={a.key}>
                  <td>
                    <div className="row">
                      <ChannelIcon channel={a.key} />
                      <a href={/^https?:/i.test(a.link) ? a.link : `https://${a.link}`} target="_blank" rel="noopener noreferrer">
                        <b>{a.name}</b>
                      </a>
                    </div>
                    {a.profile?.followers !== null && a.profile?.followers !== undefined && <div className="muted small">{a.profile.followers} abonnés</div>}
                    {a.profile?.bio && <div className="muted small">{a.profile.bio}</div>}
                    {a.note && <div className="muted small">ⓘ {a.note}</div>}
                  </td>
                  <td>
                    <Badge tone={SOURCE_LABELS[a.source].tone}>{SOURCE_LABELS[a.source].label}</Badge>
                  </td>
                  <td>{a.posts}</td>
                  <td>{a.posts ? a.avgEngagement : "—"}</td>
                  <td>{a.avgViews ?? "—"}</td>
                  <td>{a.postsPerWeek !== null ? `${a.postsPerWeek} / sem.` : "—"}</td>
                  <td>{a.lastPostAt ? fmtDate(a.lastPostAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {stats.totalPosts > 0 && (
        <div className="grid grid-2">
          <Card title="Formats">
            <div className="table-wrap" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Posts</th>
                    <th>Interactions moy.</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.formats.map((f) => (
                    <tr key={f.format}>
                      <td>{f.format}</td>
                      <td>{f.posts}</td>
                      <td>{f.avgEngagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Vos publications les plus engageantes">
            <ol className="stack">
              {stats.topPosts.map((p, i) => (
                <li key={i}>
                  <span className="muted small">
                    {p.network} · {p.format}
                    {p.date ? ` · ${fmtDate(p.date)}` : ""} · <b>{p.engagement} interactions</b>
                    {p.views !== null ? ` · ${p.views} vues` : ""}
                  </span>
                  <br />
                  {p.text || <i className="muted">(sans texte)</i>}{" "}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      Voir
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}
