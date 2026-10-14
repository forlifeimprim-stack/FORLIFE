import { Composition } from "remotion";
import { Ad } from "./Ad";
import { DURATION_FRAMES, FPS } from "./timing";

export function Root() {
  return (
    <>
      <Composition id="AdVertical" component={Ad} durationInFrames={DURATION_FRAMES} fps={FPS} width={1080} height={1920} />
      <Composition id="AdLandscape" component={Ad} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    </>
  );
}
