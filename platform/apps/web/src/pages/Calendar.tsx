import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, useWorkspace } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDate, utcToZonedInput, zonedToUtc } from "../lib/i18n";
import type { ContentItem } from "../lib/types";
import { Alert, Button, Card, Empty, PageHeader } from "../components/ui";

const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const dayKey = (d: Date, tz: string) => utcToZonedInput(d, tz).slice(0, 10);

/** Calendrier éditorial (§24) : glisser-déposer pour programmer ou re-programmer. */
export function CalendarPage() {
  const { ws, workspace } = useWorkspace();
  const { can } = useAuth();
  const tz = workspace.timezone;
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  });
  const [err, setErr] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const days = useMemo(() => {
    const first = new Date(cursor);
    const offset = (first.getUTCDay() + 6) % 7; // lundi = 0
    const start = new Date(first.getTime() - offset * 864e5);
    return Array.from({ length: 42 }, (_, i) => new Date(start.getTime() + i * 864e5));
  }, [cursor]);
  const from = days[0]!.toISOString();
  const to = new Date(days[41]!.getTime() + 864e5).toISOString();

  const scheduled = useResource<ContentItem[]>(`${ws}/contents?from=${from}&to=${to}`);
  const approved = useResource<ContentItem[]>(`${ws}/contents?status=APPROVED`);
  const byDay = useMemo(() => {
    const m = new Map<string, ContentItem[]>();
    for (const c of scheduled.data ?? []) {
      if (!c.scheduledAt) continue;
      const k = dayKey(new Date(c.scheduledAt), tz);
      m.set(k, [...(m.get(k) ?? []), c]);
    }
    return m;
  }, [scheduled.data, tz]);

  const today = dayKey(new Date(), tz);
  const canEdit = can("content:update");

  const drop = async (day: string, contentId: string) => {
    setOver(null);
    setErr(null);
    const item = [...(scheduled.data ?? []), ...(approved.data ?? [])].find((c) => c.id === contentId);
    if (!item) return;
    const time = item.scheduledAt ? utcToZonedInput(new Date(item.scheduledAt), tz).slice(11) : "09:00";
    const when = zonedToUtc(`${day}T${time}`, tz);
    if (when.getTime() < Date.now()) return setErr("Impossible de programmer dans le passé");
    try {
      await api.post(`${ws}/contents/${contentId}/schedule`, { scheduledAt: when.toISOString() });
      await Promise.all([scheduled.reload(), approved.reload()]);
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  const shift = (n: number) => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + n, 1)));

  return (
    <>
      <PageHeader
        title="Calendrier éditorial"
        question="Quand publier, et sur quels canaux ?"
        actions={
          <div className="row">
            <Button variant="secondary" onClick={() => shift(-1)} aria-label="Mois précédent">
              ‹
            </Button>
            <strong style={{ minWidth: 150, textAlign: "center" }}>{fmtDate(cursor, { month: "long", year: "numeric", timeZone: "UTC" })}</strong>
            <Button variant="secondary" onClick={() => shift(1)} aria-label="Mois suivant">
              ›
            </Button>
          </div>
        }
      />
      {err && <Alert tone="error">{err}</Alert>}
      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
        <div className="cal" role="group" aria-label="Calendrier du mois">
          {DOW.map((d) => (
            <div key={d} className="cal-dow">
              {d}
            </div>
          ))}
          {days.map((d) => {
            const k = d.toISOString().slice(0, 10);
            const items = byDay.get(k) ?? [];
            const inMonth = d.getUTCMonth() === cursor.getUTCMonth();
            return (
              <div
                key={k}
                className={`cal-day ${inMonth ? "" : "other"} ${k === today ? "today" : ""} ${over === k ? "drop" : ""}`}
                onDragOver={(e) => {
                  if (!canEdit || k < today) return;
                  e.preventDefault();
                  setOver(k);
                }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  void drop(k, e.dataTransfer.getData("text/plain"));
                }}
              >
                <span className="cal-num">{d.getUTCDate()}</span>
                {items.map((c) => (
                  <Link
                    key={c.id}
                    to={`/content/${c.id}`}
                    className={`cal-item ${c.status === "PUBLISHED" ? "published" : ""}`}
                    draggable={canEdit && c.status === "SCHEDULED"}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                    title={`${c.title} — ${c.scheduledAt ? utcToZonedInput(new Date(c.scheduledAt), tz).slice(11) : ""}`}
                  >
                    {c.scheduledAt ? utcToZonedInput(new Date(c.scheduledAt), tz).slice(11) : ""} {c.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
        <Card title="Approuvés, à programmer">
          {approved.data?.length ? (
            <>
              <p className="muted small">Glissez un contenu sur un jour du calendrier (publication à 09:00 par défaut).</p>
              <div className="backlog">
                {approved.data.map((c) => (
                  <div key={c.id} className="cal-item" draggable={canEdit} onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}>
                    {c.title} · <Link to={`/content/${c.id}`}>ouvrir</Link>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty title="Aucun contenu approuvé en attente" />
          )}
        </Card>
      </div>
    </>
  );
}
