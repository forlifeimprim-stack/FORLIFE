import { Composition } from "remotion";
import { Ad } from "./Ad";
import { DURATION_FRAMES, FPS } from "./timing";
import { STORY_DURATION_S, STORY_FPS, Story } from "./story/Story";
import { PRES_DURATION_S, PRES_FPS, Presentation } from "./pres/Presentation";

export function Root() {
  return (
    <>
      <Composition id="AdVertical" component={Ad} durationInFrames={DURATION_FRAMES} fps={FPS} width={1080} height={1920} />
      <Composition id="AdLandscape" component={Ad} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="StoryVertical" component={Story} durationInFrames={STORY_DURATION_S * STORY_FPS} fps={STORY_FPS} width={1080} height={1920} />
      <Composition id="StoryLandscape" component={Story} durationInFrames={STORY_DURATION_S * STORY_FPS} fps={STORY_FPS} width={1920} height={1080} />
      <Composition id="Presentation" component={Presentation} durationInFrames={PRES_DURATION_S * PRES_FPS} fps={PRES_FPS} width={1920} height={1080} defaultProps={{ withVoice: true }} />
      <Composition id="PresentationSansVoix" component={Presentation} durationInFrames={PRES_DURATION_S * PRES_FPS} fps={PRES_FPS} width={1920} height={1080} defaultProps={{ withVoice: false }} />
    </>
  );
}
