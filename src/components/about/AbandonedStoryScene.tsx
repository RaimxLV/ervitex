import { useEffect, useRef, type ReactNode } from "react";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const CELL = 24;
const SPARK_COUNT = 8;

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const sceneRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const layer = layerRef.current;
    if (!scene || !layer) return;
    const sparks = Array.from(layer.children) as HTMLElement[];
    let index = 0;
    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const place = (x: number, y: number) => {
      const spark = sparks[index % sparks.length];
      index += 1;
      const col = Math.floor(x / CELL);
      const row = Math.floor(y / CELL);
      spark.style.animation = "none";
      spark.style.left = `${col * CELL}px`;
      spark.style.top = `${row * CELL}px`;
      void spark.offsetWidth;
      spark.style.animation = "about-cell-twinkle 0.8s ease-out 1";
    };

    const onMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      pending = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (pending) place(pending.x, pending.y);
      });
    };

    scene.addEventListener("pointermove", onMove);
    return () => {
      scene.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={sceneRef} className="about-scene-bg relative isolate w-full overflow-hidden text-foreground">
      <div className="about-grid absolute inset-0 z-0" aria-hidden="true">
        <div ref={layerRef} className="absolute inset-0">
          {Array.from({ length: SPARK_COUNT }, (_, i) => (
            <span className="about-spark" key={i} style={{ width: CELL, height: CELL }} />
          ))}
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
