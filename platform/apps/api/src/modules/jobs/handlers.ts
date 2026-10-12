import { registerJobHandler } from "./queue.js";
import { brandDnaJob } from "../brand/jobs.js";
import { strategyPlanJob } from "../strategy/jobs.js";
import { contentIdeasJob, contentPostJob } from "../content/jobs.js";
import { crmFollowupJob } from "../crm/jobs.js";
import { campaignPackJob } from "../campaigns/jobs.js";
import { publishJob } from "../social/service.js";
import { creativeConceptsJob } from "../creative/service.js";
import { renderJob, storyboardJob } from "../video/service.js";

export function registerAllJobHandlers(): void {
  registerJobHandler("ai.brand_dna", brandDnaJob);
  registerJobHandler("ai.strategy_plan", strategyPlanJob);
  registerJobHandler("ai.content_ideas", contentIdeasJob);
  registerJobHandler("ai.content_post", contentPostJob);
  registerJobHandler("ai.crm_followup", crmFollowupJob);
  registerJobHandler("ai.campaign_pack", campaignPackJob);
  registerJobHandler("social.publish", publishJob);
  registerJobHandler("ai.creative_concepts", creativeConceptsJob);
  registerJobHandler("ai.video_storyboard", storyboardJob);
  registerJobHandler("video.render", renderJob);
}
