import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["-10%", "10%"]);

  return (
    <section ref={sectionRef} className="relative isolate min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true">
        <div className="sticky top-0 h-screen min-h-[100svh] w-full overflow-hidden">
          <motion.div
            style={{ y: imageY }}
            className="absolute -top-[10%] left-0 h-[120%] w-full max-w-none"
          >
            <img
              src={horizonImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;