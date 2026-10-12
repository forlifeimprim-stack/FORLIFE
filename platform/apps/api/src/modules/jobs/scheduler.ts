import { renewDueSubscriptions } from "../billing/ledger.js";
import { sweepPendingPayments } from "../payments/service.js";
import { purgeExpiredBuckets } from "../../lib/throttle.js";
import { collectMetrics, dispatchDuePublications } from "../social/service.js";

/** Tâches périodiques de la plateforme (toutes idempotentes : plusieurs workers peuvent tourner). */
export function startScheduler(log?: (msg: string, extra?: object) => void) {
  const tick = async () => {
    try {
      const n = await renewDueSubscriptions();
      if (n) log?.("billing.renewed", { count: n });
      const p = await sweepPendingPayments();
      if (p) log?.("payments.swept", { count: p });
      await purgeExpiredBuckets();
    } catch (e) {
      log?.("scheduler.error", { error: e instanceof Error ? e.message : String(e) });
    }
  };
  // Publications dues : vérifiées toutes les 30 secondes.
  const publish = async () => {
    try {
      const n = await dispatchDuePublications();
      if (n) log?.("social.dispatched", { count: n });
    } catch (e) {
      log?.("scheduler.error", { error: e instanceof Error ? e.message : String(e) });
    }
  };
  const metrics = async () => {
    try {
      await collectMetrics();
    } catch (e) {
      log?.("scheduler.error", { error: e instanceof Error ? e.message : String(e) });
    }
  };
  void tick();
  void publish();
  const timers = [setInterval(tick, 5 * 60_000), setInterval(publish, 30_000), setInterval(metrics, 60 * 60_000)];
  return { stop: () => timers.forEach(clearInterval) };
}
