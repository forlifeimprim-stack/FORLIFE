import { z } from "zod";
import { CHANNEL_LIMITS, CHANNELS, CONTENT_TYPES, OBJECTIVE_LABELS, type Channel, type ObjectiveType } from "@forlife/shared";
import { channelRules, renderContext, type BrandContext } from "./context.js";
import type { PromptDefinition } from "./types.js";

/**
 * Prompt/Instruction Registry versionné. Toute modification de fond d'un prompt
 * incrémente `version` (tracée dans chaque AIRun). Les prompts internes ne sont
 * jamais exposés au client.
 */

const BASE_SYSTEM = `Tu es l'intelligence de Forlife Com, un AI Growth & Creative OS conçu pour les PME, entrepreneurs et marques d'Afrique francophone (Côte d'Ivoire en priorité).
Règles permanentes :
- Écris en français clair, naturel et chaleureux, adapté au contexte local (FCFA, WhatsApp, mobile money, réalités des PME).
- Stratégie avant génération : chaque proposition sert un objectif business explicite.
- Respecte strictement le Brand DNA fourni : ton, vocabulaire, mots interdits.
- Reprends à l'identique les noms de produits, prix et faits verrouillés. N'invente jamais de prix, de chiffres, de témoignages ou de résultats.
- Pas de promesses trompeuses ni de garanties de résultat.
- Tes sorties sont des propositions qui seront relues par un humain.`;

// ───────────── Brand DNA ─────────────

export const brandDnaOutput = z.object({
  mission: z.string(),
  positioning: z.string(),
  tone: z.string(),
  values: z.array(z.string()),
  vocabulary: z.array(z.string()),
  forbiddenWords: z.array(z.string()),
  promises: z.array(z.string()),
  proofs: z.array(z.string()),
  objections: z.array(z.string()),
  voiceByChannel: z.array(z.object({ channel: z.enum(CHANNELS), guidance: z.string() })),
});
export type BrandDnaOutput = z.infer<typeof brandDnaOutput>;

export interface BrandDnaInput {
  context: BrandContext;
  sources: string;
}

export const brandDnaPrompt: PromptDefinition<BrandDnaInput, BrandDnaOutput> = {
  key: "brand.dna.extract",
  version: 1,
  task: "brand.dna",
  usageKind: "TEXT",
  system: `${BASE_SYSTEM}\nTu joues le rôle de Brand Guardian : tu extrais un Brand DNA exploitable à partir des sources de l'entreprise.`,
  render: ({ context, sources }) => `Contexte entreprise :
${renderContext(context)}

Sources fournies par l'entreprise (présentation, anciens posts, site, catalogue) :
"""
${sources}
"""

Extrais le Brand DNA : mission, positionnement, ton, valeurs, vocabulaire récurrent, mots à éviter, promesses, preuves, objections clients probables et consignes de voix par canal (Facebook, Instagram, TikTok, LinkedIn, WhatsApp). Ne retiens que ce qui est étayé par les sources ou le contexte.`,
  output: brandDnaOutput,
  textForSafety: (o) => [o.mission, o.positioning, ...o.promises],
  mock: ({ context, sources }) => {
    const words = Array.from(new Set(sources.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿœ]{6,}/g) ?? [])).slice(0, 8);
    const name = context.brandName;
    return {
      mission: `Aider ${context.target ?? "nos clients"} à ${context.offer ? `bénéficier de ${context.offer.toLowerCase()}` : "réussir"} avec un service proche, fiable et accessible.`,
      positioning: `${name}, la référence ${context.sector.toLowerCase()} de proximité${context.city ? ` à ${context.city}` : ""} : qualité professionnelle, accompagnement humain et prix justes.`,
      tone: "Chaleureux, professionnel et direct ; on tutoie rarement, on rassure toujours.",
      values: ["Proximité", "Fiabilité", "Qualité", "Respect des délais"],
      vocabulary: words.length ? words : ["qualité", "accompagnement", "proximité", "confiance"],
      forbiddenWords: ["pas cher", "le meilleur du monde", "garanti à vie"],
      promises: ["Un interlocuteur dédié et joignable sur WhatsApp", "Des délais annoncés et respectés"],
      proofs: ["Réalisations visibles dans le portfolio", "Clients fidèles de la zone"],
      objections: ["« C'est trop cher pour mon budget »", "« Je ne suis pas sûr du délai »", "« Je ne connais pas encore votre travail »"],
      voiceByChannel: [
        { channel: "FACEBOOK", guidance: "Ton communautaire, phrases courtes, appel à commenter ou à écrire sur WhatsApp." },
        { channel: "INSTAGRAM", guidance: "Visuel d'abord, accroche forte en première ligne, hashtags locaux." },
        { channel: "TIKTOK", guidance: "Accroche en 2 secondes, coulisses, avant/après, ton spontané." },
        { channel: "LINKEDIN", guidance: "Ton expert, résultats concrets, valeur pour les entreprises." },
        { channel: "WHATSAPP", guidance: "Message personnel, bref, avec une question ou une action claire." },
      ],
    };
  },
};

// ───────────── Strategy ─────────────

export const strategyOutput = z.object({
  title: z.string(),
  summary: z.string(),
  auditScore: z.number().int(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  smartObjectives: z.array(z.object({ title: z.string(), metric: z.string(), target: z.string(), deadline: z.string() })),
  pillars: z.array(z.object({ name: z.string(), description: z.string() })),
  weeklyPlan: z.array(z.object({ week: z.number().int(), focus: z.string(), actions: z.array(z.string()) })),
  recommendations: z.array(
    z.object({ title: z.string(), rationale: z.string(), impact: z.number().int(), effort: z.number().int() }),
  ),
});
export type StrategyOutput = z.infer<typeof strategyOutput>;

export interface StrategyInput {
  context: BrandContext;
  period: "MONTHLY" | "QUARTERLY";
  objectives: { type: ObjectiveType; title: string; metric: string; target: number; periodEnd: string }[];
  audiences: { name: string; persona: string | null; pains: string[]; goals: string[] }[];
  competitors: { name: string; notes: string | null }[];
}

export const strategyPrompt: PromptDefinition<StrategyInput, StrategyOutput> = {
  key: "strategy.plan",
  version: 1,
  task: "strategy.plan",
  usageKind: "TEXT",
  system: `${BASE_SYSTEM}\nTu joues le rôle de Business Strategist et de directeur marketing senior.`,
  render: (i) => `Contexte entreprise :
${renderContext(i.context)}

Objectifs déclarés :
${i.objectives.map((o) => `- [${OBJECTIVE_LABELS[o.type]}] ${o.title} — ${o.metric} cible ${o.target} avant le ${o.periodEnd.slice(0, 10)}`).join("\n") || "- Aucun objectif déclaré : propose-en."}

Audiences :
${i.audiences.map((a) => `- ${a.name}${a.persona ? ` : ${a.persona}` : ""}${a.pains.length ? ` | douleurs : ${a.pains.join(", ")}` : ""}`).join("\n") || "- Non précisées"}

Concurrents :
${i.competitors.map((c) => `- ${c.name}${c.notes ? ` : ${c.notes}` : ""}`).join("\n") || "- Non précisés"}

Produis un plan stratégique ${i.period === "MONTHLY" ? "mensuel (4 semaines)" : "trimestriel (12 semaines, regroupées par blocs)"} :
audit (score global sur 100, forces, faiblesses, opportunités), objectifs SMART, 3 à 5 piliers de contenu, plan d'action par semaine,
et 3 à 6 recommandations priorisées avec impact et effort notés de 1 (faible) à 5 (fort). Le score d'audit est une estimation qualitative, pas une mesure.`,
  output: strategyOutput,
  textForSafety: (o) => [o.summary, ...o.recommendations.map((r) => r.rationale)],
  mock: (i) => {
    const c = i.context;
    const mainObj = i.objectives[0];
    const goal = mainObj ? OBJECTIVE_LABELS[mainObj.type].toLowerCase() : "visibilité et ventes";
    const weeks = i.period === "MONTHLY" ? 4 : 12;
    const focuses = ["Fondations et preuve sociale", "Éducation et expertise", "Offre et conversion", "Fidélisation et bouche-à-oreille"];
    return {
      title: `Plan ${i.period === "MONTHLY" ? "mensuel" : "trimestriel"} — ${c.brandName}`,
      summary: `Priorité : ${goal}. ${c.brandName} doit transformer sa crédibilité locale${c.city ? ` à ${c.city}` : ""} en demandes concrètes, en faisant de WhatsApp le point de conversion de tous les contenus.`,
      auditScore: 40 + Math.min(40, (c.vocabulary.length + c.products.length + c.channels.length) * 4),
      strengths: ["Ancrage local et relation de proximité", c.offer ? `Offre claire : ${c.offer}` : "Savoir-faire reconnu par les clients existants"],
      weaknesses: ["Publication irrégulière sur les réseaux", "Peu de preuves sociales mises en avant", "Pas de suivi structuré des prospects"],
      opportunities: ["Usage massif de WhatsApp et Facebook par la cible", "Contenus vidéo courts (TikTok/Reels) encore peu exploités par les concurrents locaux"],
      smartObjectives: (i.objectives.length ? i.objectives : [{ title: "Générer des demandes de devis", metric: "demandes WhatsApp", target: 30, periodEnd: new Date(Date.now() + 30 * 864e5).toISOString(), type: "LEADS" as const }]).map((o) => ({
        title: o.title,
        metric: o.metric,
        target: String(o.target),
        deadline: o.periodEnd.slice(0, 10),
      })),
      pillars: [
        { name: "Preuves & réalisations", description: "Avant/après, témoignages réels, coulisses des projets livrés." },
        { name: "Conseils experts", description: `Astuces pratiques liées à ${c.sector.toLowerCase()} pour éduquer et rassurer.` },
        { name: "Offres & actions", description: "Offres du moment, packs, appels à l'action vers WhatsApp." },
        { name: "Communauté locale", description: "Valoriser clients, partenaires et événements du quartier." },
      ],
      weeklyPlan: Array.from({ length: weeks }, (_, k) => ({
        week: k + 1,
        focus: focuses[k % focuses.length]!,
        actions: ["3 publications (Facebook, Instagram)", "1 vidéo courte 10–15 s", "Relance WhatsApp des prospects de la semaine"],
      })),
      recommendations: [
        { title: "Centraliser les demandes sur WhatsApp Business", rationale: "Chaque contenu doit renvoyer vers un seul canal de conversation, mesurable.", impact: 5, effort: 2 },
        { title: "Publier 2 preuves sociales par semaine", rationale: "La confiance est le premier frein à l'achat chez les PME locales.", impact: 4, effort: 2 },
        { title: "Lancer un format vidéo récurrent de 15 s", rationale: "Le format court génère la portée organique la plus forte actuellement.", impact: 4, effort: 3 },
      ],
    };
  },
};

// ───────────── Content : idées ─────────────

export const ideasOutput = z.object({
  ideas: z.array(
    z.object({
      angle: z.string(),
      hook: z.string(),
      message: z.string(),
      cta: z.string(),
      format: z.enum(CONTENT_TYPES),
    }),
  ),
});
export type IdeasOutput = z.infer<typeof ideasOutput>;

export interface IdeasInput {
  context: BrandContext;
  objective: { type: ObjectiveType; title: string };
  audience: string | null;
  offer: string | null;
  pillar: string | null;
  count: number;
}

export const ideasPrompt: PromptDefinition<IdeasInput, IdeasOutput> = {
  key: "content.ideas",
  version: 1,
  task: "content.ideas",
  usageKind: "TEXT",
  system: `${BASE_SYSTEM}\nTu joues le rôle de Content Strategist : tu proposes des angles distincts orientés objectif.`,
  render: (i) => `Contexte entreprise :
${renderContext(i.context)}

Objectif : [${OBJECTIVE_LABELS[i.objective.type]}] ${i.objective.title}
${i.audience ? `Audience : ${i.audience}` : ""}
${i.offer ? `Offre à mettre en avant : ${i.offer}` : ""}
${i.pillar ? `Pilier de contenu : ${i.pillar}` : ""}

Propose ${i.count} angles de contenu réellement différents (émotion, preuve, éducation, urgence, coulisses…).
Pour chacun : l'angle, une accroche (hook) de moins de 12 mots, le message clé, un CTA adapté à l'objectif et le format le plus pertinent.`,
  output: ideasOutput,
  textForSafety: (o) => o.ideas.flatMap((i) => [i.hook, i.message]),
  mock: (i) => {
    const b = i.context.brandName;
    const offer = i.offer ?? i.context.offer ?? "notre offre";
    const ctaByObjective: Record<ObjectiveType, string> = {
      AWARENESS: "Abonnez-vous pour ne rien manquer",
      ENGAGEMENT: "Dites-nous en commentaire ce que vous en pensez",
      LEADS: "Écrivez-nous sur WhatsApp pour un devis gratuit",
      SALES: "Commandez dès aujourd'hui sur WhatsApp",
      LAUNCH: "Soyez parmi les premiers : réservez sur WhatsApp",
      SOCIAL_PROOF: "Rejoignez nos clients satisfaits",
      RETENTION: "Profitez de votre avantage fidélité",
    };
    const cta = ctaByObjective[i.objective.type];
    const pool = [
      { angle: "Avant / après", hook: `Ce que ${b} change en une seule commande`, message: `Montrer concrètement la transformation apportée par ${offer}.`, format: "CAROUSEL" as const },
      { angle: "Coulisses", hook: "Voici comment on prépare votre commande", message: "Rassurer sur la qualité en montrant le savoir-faire et les équipements.", format: "VIDEO_SCRIPT" as const },
      { angle: "Problème / solution", hook: "Votre communication ne vous ramène pas de clients ?", message: `Nommer le problème de la cible et présenter ${offer} comme solution simple.`, format: "POST" as const },
      { angle: "Preuve sociale", hook: "Ils nous ont fait confiance ce mois-ci", message: "Mettre en avant des réalisations réelles et des retours clients.", format: "POST" as const },
      { angle: "Conseil expert", hook: "3 erreurs qui coûtent cher aux PME", message: "Apporter de la valeur gratuite pour installer l'expertise de la marque.", format: "CAROUSEL" as const },
      { angle: "Offre limitée", hook: "Cette semaine seulement, profitez-en", message: `Créer une raison d'agir maintenant autour de ${offer}, sans promesse exagérée.`, format: "STORY" as const },
    ];
    return { ideas: pool.slice(0, Math.max(1, Math.min(i.count, pool.length))).map((p) => ({ ...p, cta })) };
  },
};

// ───────────── Content : post multi-réseaux ─────────────

export const postOutput = z.object({
  title: z.string(),
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  variants: z.array(z.object({ channel: z.enum(CHANNELS), body: z.string(), cta: z.string(), hashtags: z.array(z.string()) })),
});
export type PostOutput = z.infer<typeof postOutput>;

export interface PostInput {
  context: BrandContext;
  objective: { type: ObjectiveType; title: string } | null;
  idea: { angle: string; hook: string; message: string; cta: string };
  channels: Channel[];
}

export const postPrompt: PromptDefinition<PostInput, PostOutput> = {
  key: "content.post",
  version: 1,
  task: "content.post",
  usageKind: "TEXT",
  system: `${BASE_SYSTEM}\nTu joues le rôle de Copywriter et de Social Manager : un message maître, puis une adaptation native par réseau.`,
  render: (i) => `Contexte entreprise :
${renderContext(i.context)}

${i.objective ? `Objectif : [${OBJECTIVE_LABELS[i.objective.type]}] ${i.objective.title}` : ""}
Angle : ${i.idea.angle}
Accroche : ${i.idea.hook}
Message clé : ${i.idea.message}
CTA : ${i.idea.cta}

Rédige un contenu maître (titre interne, accroche, corps, CTA), puis une variante native pour chacun de ces canaux, en respectant les limites :
${channelRules(i.channels)}
Exactement une variante par canal listé. Hashtags sans le caractère # (il sera ajouté à l'affichage).`,
  output: postOutput,
  textForSafety: (o) => [o.body, ...o.variants.map((v) => v.body)],
  mock: (i) => {
    const c = i.context;
    const loc = c.city ? ` à ${c.city}` : "";
    const body = `${i.idea.hook}\n\n${i.idea.message}\n\nChez ${c.brandName}${loc}, on vous accompagne de A à Z avec un service professionnel et proche de vous.\n\n👉 ${i.idea.cta}`;
    const tags = [c.brandName.replace(/[^A-Za-z0-9]/g, ""), c.sector.split(/\s+/)[0]?.replace(/[^A-Za-zÀ-ÿ]/g, "") ?? "PME", c.city?.replace(/\s+/g, "") ?? "CotedIvoire", "Abidjan", "PME"].filter(Boolean);
    const variantBody = (ch: Channel): string => {
      switch (ch) {
        case "X":
          return `${i.idea.hook} — ${c.brandName}${loc}. ${i.idea.cta}`.slice(0, CHANNEL_LIMITS.X.maxChars);
        case "WHATSAPP":
          return `Bonjour 👋 ${i.idea.hook}\n${i.idea.message}\nRépondez simplement à ce message pour en savoir plus.`;
        case "LINKEDIN":
          return `${i.idea.hook}\n\nPour les entreprises${loc}, ${i.idea.message.charAt(0).toLowerCase()}${i.idea.message.slice(1)}\n\n${c.brandName} accompagne les PME avec méthode et réactivité.\n\n${i.idea.cta}`;
        case "TIKTOK":
          return `${i.idea.hook} 👀 ${i.idea.message} ${i.idea.cta}`;
        case "EMAIL":
          return `Objet : ${i.idea.hook}\n\nBonjour,\n\n${i.idea.message}\n\nBien à vous,\nL'équipe ${c.brandName}`;
        default:
          return body;
      }
    };
    return {
      title: `${i.idea.angle} — ${c.brandName}`,
      hook: i.idea.hook,
      body,
      cta: i.idea.cta,
      variants: i.channels.map((ch) => ({
        channel: ch,
        body: variantBody(ch),
        cta: i.idea.cta,
        hashtags: tags.slice(0, CHANNEL_LIMITS[ch].maxHashtags),
      })),
    };
  },
};

export const PROMPTS = {
  [brandDnaPrompt.key]: brandDnaPrompt,
  [strategyPrompt.key]: strategyPrompt,
  [ideasPrompt.key]: ideasPrompt,
  [postPrompt.key]: postPrompt,
};

