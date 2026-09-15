import { type PointerEvent, type ReactNode, useEffect, useRef } from "react";
import DepthMapScene from "@/components/about/DepthMapScene";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const DRIPS = [9, 18, 31, 47, 61, 76, 88];

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const sceneRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateParallax = () => {
      scrollFrameRef.current = null;
      const scene = sceneRef.current;
      if (!scene) return;

      const rect = scene.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      scene.style.setProperty("--scene-scroll-y", `${(progress - 0.5) * 24}px`);
    };

    const requestParallax = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);

    return () => {
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", requestParallax);
      if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const updateLight = (event: PointerEvent<HTMLElement>) => {
    const scene = sceneRef.current;
    if (!scene || event.pointerType === "touch") return;

    const { left, top } = scene.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      scene.style.setProperty("--flashlight-x", `${x}px`);
      scene.style.setProperty("--flashlight-y", `${y}px`);
      scene.dataset.lightActive = "true";
    });
  };

  const dimLight = () => {
    if (sceneRef.current) sceneRef.current.dataset.lightActive = "false";
  };

  return (
    <section
      ref={sceneRef}
      className="abandoned-story-scene relative isolate min-h-screen w-full overflow-hidden"
      onPointerMove={updateLight}
      onPointerEnter={updateLight}
      onPointerLeave={dimLight}
    >
      <div className="pointer-events-none sticky top-0 -z-30 h-screen w-full overflow-hidden" aria-hidden="true">
        <DepthMapScene />
      </div>
      <div className="depth-scene-shade pointer-events-none fixed inset-0 -z-20" aria-hidden="true" />
      <div className="abandoned-lamp abandoned-lamp-a absolute -z-10" aria-hidden="true" />
      <div className="abandoned-lamp abandoned-lamp-b absolute -z-10" aria-hidden="true" />
      <div className="abandoned-lamp abandoned-lamp-c absolute -z-10" aria-hidden="true" />
      <div className="abandoned-flashlight-beam pointer-events-none absolute inset-0 -z-[9]" aria-hidden="true" />

      <div className="abandoned-spark abandoned-spark-a pointer-events-none absolute -z-[4]" aria-hidden="true" />
      <div className="abandoned-spark abandoned-spark-b pointer-events-none absolute -z-[4]" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden" aria-hidden="true">
        {DRIPS.map((left, index) => (
          <span
            key={left}
            className="abandoned-drip absolute top-0 w-px bg-primary-foreground/45"
            style={{ left: `${left}%`, animationDelay: `${index * 0.73}s`, animationDuration: `${2.4 + (index % 3) * 0.55}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 -mt-[100vh]">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;