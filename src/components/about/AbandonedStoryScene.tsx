import { type ReactNode } from "react";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  return (
    <section className="about-scene-bg relative isolate w-full overflow-hidden text-primary-foreground">
      <div className="about-grid absolute inset-0 z-0" aria-hidden="true">
        {Array.from({ length: 240 }, (_, index) => (
          <span className="about-grid-cell" key={index} />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
