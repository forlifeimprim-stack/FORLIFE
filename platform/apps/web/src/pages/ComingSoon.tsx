import { useParams } from "react-router-dom";
import { Card, PageHeader } from "../components/ui";

const MODULES: Record<string, { title: string; phase: string; items: string[] }> = {
  creative: { title: "AI Creative Director", phase: "Phase 2", items: ["Brief → concepts A/B/C → direction artistique", "Génération multi-fournisseurs avec conservation du produit réel", "Critic séparé, Brand Check, Safety Check, Human Feel Score", "Texte composé par le moteur de design (pas dans l'image)", "Historique des versions et régénération ciblée"] },
  social: { title: "Social Hub", phase: "Phase 3", items: ["Connexion OAuth Meta, TikTok, LinkedIn, YouTube", "Tokens chiffrés, rotation et révocation", "Publication idempotente avec retry et historique", "Statistiques par publication"] },
  campaigns: { title: "Campaign Manager", phase: "Phase 5", items: ["Brief central unique pour tous les assets", "Budget en FCFA, audiences, période, canaux", "Variantes A/B et approbations", "Automatisations bornées (copilot / autopilot)"] },
  crm: { title: "CRM & Leads", phase: "Phase 5", items: ["Capture de leads (formulaires, WhatsApp, campagnes)", "Pipeline, scoring IA, tâches et relances", "Attribution lead → vente existante Forlife"] },
  analytics: { title: "Analytics & ROI", phase: "Phase 2–6", items: ["Engagement, leads, conversions par contenu et campagne", "Distinction stricte données réelles / estimations", "Creative Score et comparaison des variantes", "Rapports clients pour agences"] },
  copilot: { title: "AI Copilot & Agents", phase: "Phase 6", items: ["Chat contextualisé avec la mémoire de l'entreprise", "12 agents spécialisés (Strategist, Critic, Optimizer…)", "Modes assisté, copilot et autopilot borné", "Aucune action externe sans permission explicite et traçable"] },
};

export function ComingSoon() {
  const { module = "" } = useParams();
  const m = MODULES[module];
  if (!m) return <PageHeader title="Module inconnu" />;
  return (
    <>
      <PageHeader title={m.title} question={`Prévu en ${m.phase} de la roadmap. Les fondations (données, IA, jobs, sécurité) sont déjà en place.`} />
      <Card title="Au programme">
        <ul>
          {m.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </Card>
    </>
  );
}
