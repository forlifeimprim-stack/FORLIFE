import { renewDueSubscriptions } from "../billing/ledger.js";

/** Tâches périodiques de la plateforme (toutes idempotentes : plusieurs workers peuvent tourner). */
export function startScheduler(log?: (msg: string, extra?: object) => void) {
  const tick = async () => {
    try {
      const n = await renewDueSubscriptions();
      if (n) log?.("billing.renewed", { count: n });
    } catch (e) {
      log?.("scheduler.error", { error: e instanceof Error ? e.message : String(e) });
    }
  };
  void tick();
  const timer = setInterval(tick, 5 * 60_000);
  return { stop: () => clearInterval(timer) };
}
