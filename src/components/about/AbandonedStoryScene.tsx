import { type ReactNode } from "react";
import ScreenPrintingCarousel from "@/components/about/ScreenPrintingCarousel";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div className="sticky top-0 h-screen min-h-[100svh] w-full overflow-hidden">
          <ScreenPrintingCarousel />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background/60" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;