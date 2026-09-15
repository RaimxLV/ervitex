import { type ReactNode } from "react";
import DepthMapScene from "@/components/about/DepthMapScene";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  return (
    <section className="about-depth-scene relative isolate min-h-screen w-full overflow-hidden bg-primary">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div className="sticky top-0 h-screen min-h-[100svh] w-full overflow-hidden">
          <DepthMapScene />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-primary/60" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;