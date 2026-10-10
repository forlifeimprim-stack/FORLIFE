import { registerJobHandler } from "./queue.js";
import { brandDnaJob } from "../brand/jobs.js";
import { strategyPlanJob } from "../strategy/jobs.js";
import { contentIdeasJob, contentPostJob } from "../content/jobs.js";

export function registerAllJobHandlers(): void {
  registerJobHandler("ai.brand_dna", brandDnaJob);
  registerJobHandler("ai.strategy_plan", strategyPlanJob);
  registerJobHandler("ai.content_ideas", contentIdeasJob);
  registerJobHandler("ai.content_post", contentPostJob);
}
