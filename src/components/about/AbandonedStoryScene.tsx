import type { ReactNode } from "react";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  return (
    <section className="about-scene-bg relative isolate w-full overflow-hidden text-foreground">
      <div className="about-fabric absolute inset-0 z-0" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
