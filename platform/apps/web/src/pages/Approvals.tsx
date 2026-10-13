import { celebrate } from "../components/Delight";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDateTime } from "../lib/i18n";
import type { ContentItem } from "../lib/types";
import { Alert, Button, Card, ChannelChip, Empty, PageHeader } from "../components/ui";

interface ApprovalRow {
  id: string;
  status: string;
  entityType: string;
  createdAt: string;
  requestedByName: string | null;
  content: ContentItem | null;
}

/** Centre d'approbation : human-in-the-loop avant toute programmation (§3, §21). */
export function ApprovalsPage() {
  const { ws } = useWorkspace();
  const { can } = useAuth();
  const [tab, setTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const { data, error, reload } = useResource<ApprovalRow[]>(`${ws}/approvals?status=${tab}`);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);

  const decide = async (id: string, decision: "APPROVED" | "REJECTED") => {
    setErr(null);
    try {
      await api.post(`${ws}/approvals/${id}/decide`, { decision, comment: comments[id] || undefined });
      if (decision === "APPROVED") celebrate("Contenu approuvé : il est prêt à être programmé !");
      await reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Approbations" question="Qu'est-ce qui est prêt à partir ?" />
      <div className="tabs" role="tablist">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button key={s} role="tab" aria-selected={tab === s} onClick={() => setTab(s)}>
            {s === "PENDING" ? "À valider" : s === "APPROVED" ? "Approuvés" : "Refusés"}
          </button>
        ))}
      </div>
      {(error || err) && <Alert tone="error">{error ?? err}</Alert>}
      {data?.length === 0 && (
        <Card>
          <Empty title={tab === "PENDING" ? "Rien à valider. Bravo !" : "Aucun élément"} />
        </Card>
      )}
      <div className="stack">
        {data?.map((a) =>
          a.content ? (
            <Card
              key={a.id}
              title={<Link to={`/content/${a.content.id}`}>{a.content.title}</Link>}
              actions={<span className="muted small">Demandé par {a.requestedByName ?? "?"} · {fmtDateTime(a.createdAt)}</span>}
            >
              <div className="stack">
                <div className="row">
                  {a.content.variants.map((v) => (
                    <ChannelChip key={v.id} channel={v.channel} />
                  ))}
                </div>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{a.content.body}</p>
                {tab === "PENDING" && can("content:approve") && (
                  <div className="row">
                    <input
                      placeholder="Commentaire (obligatoire en cas de refus)"
                      value={comments[a.id] ?? ""}
                      onChange={(e) => setComments({ ...comments, [a.id]: e.target.value })}
                      style={{ flex: 1, minWidth: 200 }}
                      aria-label="Commentaire"
                    />
                    <Button variant="secondary" onClick={() => decide(a.id, "REJECTED")}>
                      Demander des modifications
                    </Button>
                    <Button onClick={() => decide(a.id, "APPROVED")}>Approuver</Button>
                  </div>
                )}
                {tab === "PENDING" && !can("content:approve") && <p className="muted small">Un manager ou un administrateur doit valider ce contenu.</p>}
              </div>
            </Card>
          ) : null,
        )}
      </div>
    </>
  );
}
