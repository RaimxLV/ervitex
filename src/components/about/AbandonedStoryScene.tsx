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
  const imageY = useTransform(smooth, [0, 1], reduceMotion ? ["0%", "0%"] : ["-10%", "10%"]);

  return (
    <section ref={sectionRef} className="relative isolate w-full overflow-hidden bg-primary text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <motion.div
          style={{ y: imageY }}
          className="absolute -top-[15%] left-0 h-[130%] w-full max-w-none will-change-transform"
        >
          <img src={horizonImage} alt="" className="h-full w-full object-cover" />
        </motion.div>
        {/* 40% black overlay over the parallax image */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
