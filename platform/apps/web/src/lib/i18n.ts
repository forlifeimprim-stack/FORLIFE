/**
 * Internationalisation : français en priorité, architecture multilingue prête
 * pour l'anglais et les langues africaines (§16). Les libellés métier partagés
 * (statuts, objectifs, canaux) viennent de @forlife/shared.
 */
const fr = {
  "app.tagline": "De la stratégie à la vente, une seule intelligence pour piloter la croissance.",
  "nav.home": "Accueil",
  "nav.brand": "Brand DNA",
  "nav.strategy": "Stratégie",
  "nav.content": "Content Studio",
  "nav.calendar": "Calendrier",
  "nav.approvals": "Approbations",
  "nav.settings": "Paramètres",
  "nav.soon": "Bientôt",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.delete": "Supprimer",
  "common.loading": "Chargement…",
  "common.credits": "crédits",
  "ai.simulated": "Démo — fournisseur IA simulé",
  "ai.proposal": "Proposition IA : à relire et valider avant publication.",
} as const;

type Key = keyof typeof fr;
const dictionaries: Record<string, Partial<Record<Key, string>>> = { fr };
let locale = "fr";

export function setLocale(l: string) {
  locale = dictionaries[l] ? l : "fr";
}

export function t(key: Key): string {
  return dictionaries[locale]?.[key] ?? fr[key];
}

const tz = "Africa/Abidjan";
export const fmtDate = (iso: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) =>
  new Intl.DateTimeFormat("fr-CI", { timeZone: tz, ...opts }).format(new Date(iso));
export const fmtDateTime = (iso: string | Date) => fmtDate(iso, { dateStyle: "medium", timeStyle: "short" });
export const fmtXof = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
export const fmtNumber = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

/** Convertit une saisie datetime-local ("2026-10-20T09:00") exprimée dans le fuseau du workspace en Date UTC. */
export function zonedToUtc(local: string, timeZone = tz): Date {
  const asUtc = new Date(`${local}:00Z`);
  const inZone = new Date(asUtc.toLocaleString("en-US", { timeZone }));
  const inUtc = new Date(asUtc.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(asUtc.getTime() - (inZone.getTime() - inUtc.getTime()));
}

/** Inverse : Date → valeur datetime-local dans le fuseau du workspace. */
export function utcToZonedInput(date: Date, timeZone = tz): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
