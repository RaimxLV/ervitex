import { type PointerEvent, type ReactNode, useRef } from "react";
import abandonedStore from "@/assets/ervitex-store-abandoned.jpg";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const DRIPS = [9, 18, 31, 47, 61, 76, 88];

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const sceneRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number>();

  const updateLight = (event: PointerEvent<HTMLElement>) => {
    const scene = sceneRef.current;
    if (!scene || event.pointerType === "touch") return;

    const { left, top } = scene.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
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
      className="abandoned-story-scene relative isolate overflow-hidden"
      onPointerMove={updateLight}
      onPointerEnter={updateLight}
      onPointerLeave={dimLight}
    >
      <img
        src={abandonedStore}
        alt="Pamesta Ervitex apģērbu ekspozīcija naktī"
        className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 -z-20 bg-primary/80" />
      <div className="abandoned-flicker absolute inset-0 -z-10" aria-hidden="true" />
      <div className="abandoned-flashlight absolute inset-0 -z-10" aria-hidden="true">
        <img
          src={abandonedStore}
          alt=""
          className="h-full w-full object-cover object-center"
          aria-hidden="true"
        />
      </div>

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