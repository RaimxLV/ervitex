import { type PointerEvent, type ReactNode, useEffect, useRef } from "react";
import abandonedStore from "@/assets/ervitex-abandoned-store.jpg";

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
      const viewportHeight = window.innerHeight;
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      scene.style.setProperty("--scene-scroll-y", `${(clamped - 0.5) * 220}px`);
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
      <img
        src={abandonedStore}
        alt="Pamesta Ervitex apģērbu ekspozīcija naktī"
        className="abandoned-scene-image absolute inset-x-0 -inset-y-28 -z-30 h-[calc(100%+14rem)] w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 -z-20 bg-primary/65" />
      <div className="abandoned-lamp abandoned-lamp-a absolute -z-10" aria-hidden="true" />
      <div className="abandoned-lamp abandoned-lamp-b absolute -z-10" aria-hidden="true" />
      <div className="abandoned-lamp abandoned-lamp-c absolute -z-10" aria-hidden="true" />
      <div className="abandoned-flashlight absolute inset-0 -z-10" aria-hidden="true">
        <img
          src={abandonedStore}
          alt=""
          className="abandoned-scene-image absolute inset-x-0 -inset-y-28 h-[calc(100%+14rem)] w-full object-cover object-center"
          aria-hidden="true"
        />
      </div>
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

      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;