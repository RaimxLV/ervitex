import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import horizonImage from "@/assets/about/horizon-carousel-photo.png";

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
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const imageY = useTransform(smooth, [0, 1], reduceMotion ? ["0%", "0%"] : ["-24%", "24%"]);
  const imageScale = useTransform(smooth, [0, 0.5, 1], reduceMotion ? [1, 1, 1] : [1.06, 1.14, 1.06]);

  return (
    <section ref={sectionRef} className="relative isolate w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div className="sticky top-0 h-screen min-h-[100svh] w-full overflow-hidden">
          <motion.div
            style={{ y: imageY, scale: imageScale }}
            className="absolute -top-[25%] left-0 h-[150%] w-full max-w-none will-change-transform"
          >
            <img src={horizonImage} alt="" className="h-full w-full object-cover" />
          </motion.div>
          {/* Readability scrim: keeps the photo vivid at the edges, calms it behind text */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-background/45 to-background/25" />
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
