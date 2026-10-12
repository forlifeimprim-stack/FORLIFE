import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PAYMENT_STATUS_LABELS, type PlanDefinition } from "@forlife/shared";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { errorMessage, useResource } from "../lib/hooks";
import { fmtDateTime, fmtNumber, fmtXof } from "../lib/i18n";
import { Alert, Badge, Button, Card, Empty, LogoMark } from "../components/ui";

interface Offers {
  plans: (PlanDefinition & { prices: { months: 1 | 3 | 12; label: string; amount: number }[] })[];
  packs: { code: string; credits: number; priceXof: number; label: string }[];
  providers: { key: "cinetpay" | "sandbox"; label: string }[];
}
interface PaymentRow {
  id: string;
  label: string;
  amount: number;
  status: keyof typeof PAYMENT_STATUS_LABELS;
  provider: string;
  reference: string;
  method: string | null;
  failureReason: string | null;
  createdAt: string;
  paidAt: string | null;
  checkoutUrl: string | null;
}

const payTone = (s: string) => (s === "SUCCEEDED" ? "success" : s === "FAILED" ? "danger" : s === "CANCELLED" ? "neutral" : "warning");

/** Abonnement et achat de crédits : Orange Money, MTN MoMo, Moov, Wave ou carte. */
export function BillingOffers({ currentPlan, paidUntil }: { currentPlan: string; paidUntil: string | null }) {
  const { org, can } = useAuth();
  const offers = useResource<Offers>(`/orgs/${org!.id}/billing/offers`);
  const payments = useResource<PaymentRow[]>(`/orgs/${org!.id}/payments`);
  const [months, setMonths] = useState<1 | 3 | 12>(1);
  const [provider, setProvider] = useState<"cinetpay" | "sandbox" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const providers = offers.data?.providers ?? [];
  const chosen = provider ?? providers[0]?.key ?? null;
  const manage = can("billing:manage");

  const pay = async (key: string, purchase: Record<string, unknown>) => {
    if (!chosen) return;
    setBusy(key);
    setErr(null);
    try {
      const p = await api.post<PaymentRow>(`/orgs/${org!.id}/payments`, { requestId: crypto.randomUUID(), provider: chosen, purchase });
      if (p.checkoutUrl) location.href = p.checkoutUrl;
    } catch (e) {
      setErr(errorMessage(e));
      setBusy(null);
    }
  };

  return (
    <div className="stack">
      {err && <Alert tone="error">{err}</Alert>}
      {paidUntil && currentPlan !== "FREE" && (
        <Alert tone="info">
          Plan payé jusqu'au <strong>{fmtDateTime(paidUntil)}</strong>. Sans renouvellement, votre espace repasse automatiquement au plan Free (vos données restent intactes).
        </Alert>
      )}
      {manage && providers.length === 0 && <Alert tone="warning">Le paiement en ligne est en cours d'activation. Écrivez-nous sur WhatsApp pour vous abonner.</Alert>}
      {manage && providers.length > 0 && (
        <Card title="Moyen de paiement">
          <div className="pay-methods">
            {providers.map((p) => (
              <label key={p.key} className={`pay-method ${chosen === p.key ? "on" : ""}`}>
                <input type="radio" name="provider" checked={chosen === p.key} onChange={() => setProvider(p.key)} />
                <span>
                  <strong>{p.key === "sandbox" ? "Démonstration" : "Mobile money & carte"}</strong>
                  <span className="small muted">{p.key === "sandbox" ? "Parcours de test, aucun argent réel" : "Orange Money, MTN MoMo, Moov Money, Wave, Visa, Mastercard"}</span>
                </span>
              </label>
            ))}
          </div>
        </Card>
      )}
      <Card
        title="Abonnements"
        actions={
          <div className="segmented" role="radiogroup" aria-label="Durée">
            {([1, 3, 12] as const).map((m) => (
              <button key={m} role="radio" aria-checked={months === m} className={months === m ? "on" : ""} onClick={() => setMonths(m)}>
                {m === 1 ? "1 mois" : m === 3 ? "3 mois −5 %" : "12 mois −15 %"}
              </button>
            ))}
          </div>
        }
      >
        <div className="plans">
          {offers.data?.plans.map((p) => {
            const price = p.prices.find((x) => x.months === months)!;
            const current = p.code === currentPlan;
            return (
              <div key={p.code} className={`plan ${current ? "current" : ""} ${p.code === "BUSINESS" ? "featured" : ""}`}>
                {p.code === "BUSINESS" && <span className="plan-ribbon">Le plus choisi</span>}
                <strong className="plan-name">{p.name}</strong>
                <span className="small muted">{p.target}</span>
                <span className="plan-price">{fmtXof(p.monthlyPriceXof)}</span>
                <span className="small muted">par mois{months > 1 ? ` · ${fmtXof(price.amount)} pour ${months} mois` : ""}</span>
                <ul className="small">
                  <li>{fmtNumber(p.monthlyCredits)} crédits IA / mois</li>
                  <li>{p.maxWorkspaces} espace(s) · {p.maxMembers} membres</li>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {manage && (
                  <Button variant={current ? "secondary" : "primary"} busy={busy === p.code} disabled={!chosen || !!busy} onClick={() => pay(p.code, { kind: "SUBSCRIPTION", planCode: p.code, months })}>
                    {current ? "Prolonger" : "Choisir"} · {fmtXof(price.amount)}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Recharger des crédits (sans abonnement)">
        <div className="packs">
          {offers.data?.packs.map((p) => (
            <div key={p.code} className="pack">
              <div>
                <strong>{p.label}</strong>
                <div className="small muted">{fmtNumber(p.credits)} crédits · valables sans limite de durée</div>
              </div>
              {manage && (
                <Button variant="secondary" busy={busy === p.code} disabled={!chosen || !!busy} onClick={() => pay(p.code, { kind: "CREDITS", packCode: p.code })}>
                  {fmtXof(p.priceXof)}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
      <Card title="Historique des paiements">
        {payments.data?.length === 0 ? (
          <Empty title="Aucun paiement" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Achat</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Référence</th>
                </tr>
              </thead>
              <tbody>
                {payments.data?.map((p) => (
                  <tr key={p.id}>
                    <td>{fmtDateTime(p.paidAt ?? p.createdAt)}</td>
                    <td>
                      {p.label}
                      {p.method && <div className="small muted">{p.method}</div>}
                    </td>
                    <td>{fmtXof(p.amount)}</td>
                    <td>
                      <Badge tone={payTone(p.status)}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>
                      {p.failureReason && <div className="small muted">{p.failureReason}</div>}
                      {p.checkoutUrl && (
                        <a className="small" href={p.checkoutUrl}>
                          Finaliser
                        </a>
                      )}
                    </td>
                    <td className="small muted">{p.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/** Retour du client après le paiement : on attend la confirmation du prestataire. */
export function BillingReturnPage() {
  const { org, reload } = useAuth();
  const [params] = useSearchParams();
  const id = params.get("payment");
  const [p, setP] = useState<PaymentRow | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let stop = false;
    let tries = 0;
    const poll = async () => {
      try {
        const r = await api.get<PaymentRow>(`/orgs/${org!.id}/payments/${id}`);
        if (stop) return;
        setP(r);
        if (r.status === "PENDING" && tries++ < 20) setTimeout(poll, 3000);
        else void reload();
      } catch (e) {
        setErr(errorMessage(e));
      }
    };
    void poll();
    return () => {
      stop = true;
    };
  }, [id, org, reload]);

  return (
    <div className="narrow stack" style={{ maxWidth: 560, margin: "40px auto" }}>
      {err && <Alert tone="error">{err}</Alert>}
      {!p && !err && (
        <Card>
          <span className="spinner" /> Vérification du paiement…
        </Card>
      )}
      {p && (
        <Card title={p.status === "SUCCEEDED" ? "Paiement confirmé 🎉" : p.status === "PENDING" ? "Paiement en cours de confirmation" : "Paiement non abouti"}>
          <p>
            {p.label} — <strong>{fmtXof(p.amount)}</strong>
          </p>
          {p.status === "SUCCEEDED" && <Alert tone="success">Merci ! Votre compte est à jour. Un reçu vous a été envoyé par email.</Alert>}
          {p.status === "PENDING" && <Alert tone="info">Validez le paiement sur votre téléphone si ce n'est pas déjà fait. Cette page se met à jour automatiquement.</Alert>}
          {(p.status === "FAILED" || p.status === "CANCELLED") && <Alert tone="error">{p.failureReason ?? "Le paiement a été refusé ou annulé. Aucun montant n'a été débité."}</Alert>}
          <p className="small muted">Référence : {p.reference}</p>
          <Link className="btn btn-primary" to="/settings?tab=billing">
            Retour à la facturation
          </Link>
        </Card>
      )}
    </div>
  );
}

const METHODS = [
  { key: "ORANGE_MONEY", label: "Orange Money", color: "#ff7900" },
  { key: "MTN_MOMO", label: "MTN MoMo", color: "#ffcc00" },
  { key: "MOOV_MONEY", label: "Moov Money", color: "#0066b3" },
  { key: "WAVE", label: "Wave", color: "#1dc8f2" },
  { key: "CARD", label: "Carte bancaire", color: "#444" },
] as const;

/** Guichet de paiement de démonstration (aucun argent réel), même parcours qu'en production. */
export function DemoCheckoutPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const t = params.get("t") ?? "";
  const [info, setInfo] = useState<{ label: string; amount: number; status: string; reference: string; organization: string } | null>(null);
  const [method, setMethod] = useState<(typeof METHODS)[number]["key"]>("ORANGE_MONEY");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    api.get<typeof info>(`/public/payments/demo/${id}?t=${encodeURIComponent(t)}`).then(setInfo).catch((e) => setErr(errorMessage(e)));
  }, [id, t]);
  const submit = async (outcome: "success" | "failure") => {
    setBusy(true);
    try {
      await api.post(`/public/payments/demo/${id}?t=${encodeURIComponent(t)}`, { outcome, method });
      location.href = `/billing/return?payment=${id}`;
    } catch (e) {
      setErr(errorMessage(e));
      setBusy(false);
    }
  };
  return (
    <div className="checkout">
      <div className="checkout-card">
        <div className="row">
          <LogoMark />
          <strong>Forlife Com · Paiement</strong>
          <Badge tone="warning">Démonstration</Badge>
        </div>
        {err && <Alert tone="error">{err}</Alert>}
        {info && (
          <>
            <div className="checkout-amount">
              <span className="small muted">{info.organization}</span>
              <strong>{fmtXof(info.amount)}</strong>
              <span className="small">{info.label}</span>
            </div>
            {info.status !== "PENDING" ? (
              <Alert tone="info">Ce paiement est déjà traité ({PAYMENT_STATUS_LABELS[info.status]}).</Alert>
            ) : (
              <>
                <div className="checkout-methods" role="radiogroup" aria-label="Moyen de paiement">
                  {METHODS.map((m) => (
                    <button key={m.key} role="radio" aria-checked={method === m.key} className={method === m.key ? "on" : ""} onClick={() => setMethod(m.key)}>
                      <span className="dot" style={{ background: m.color }} />
                      {m.label}
                    </button>
                  ))}
                </div>
                {method !== "CARD" && (
                  <label className="field">
                    <span>Numéro {METHODS.find((m) => m.key === method)!.label}</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07 00 00 00 00" inputMode="tel" />
                  </label>
                )}
                <Button busy={busy} onClick={() => submit("success")}>
                  Payer {fmtXof(info.amount)}
                </Button>
                <Button variant="ghost" disabled={busy} onClick={() => submit("failure")}>
                  Simuler un refus
                </Button>
                <p className="small muted">Mode démonstration : aucun montant n'est débité. En production, ce guichet est remplacé par celui de CinetPay.</p>
              </>
            )}
            <p className="small muted">Référence {info.reference}</p>
          </>
        )}
      </div>
    </div>
  );
}
