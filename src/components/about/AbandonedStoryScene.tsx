import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import horizonAsset from "@/assets/about/anatol-horizon-lineart.png.asset.json";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <section ref={sectionRef} className="relative isolate min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div className="sticky top-0 flex h-screen min-h-[100svh] w-full items-center justify-center overflow-hidden">
          <motion.img
            src={horizonAsset.url}
            alt=""
            style={{ y: imageY }}
            className="h-auto w-[190%] max-w-none opacity-[0.15] sm:w-[145%] lg:w-[112%]"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background/35" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;