import { useEffect, useRef, type ReactNode } from "react";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const CELL = 24;
const SPARK_COUNT = 10;

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const sparks = Array.from(layer.children) as HTMLElement[];
    let index = 0;
    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const place = (x: number, y: number) => {
      const spark = sparks[index % sparks.length];
      index += 1;
      const col = Math.floor(x / CELL) + Math.floor(Math.random() * 5) - 2;
      const row = Math.floor(y / CELL) + Math.floor(Math.random() * 5) - 2;
      spark.style.animation = "none";
      spark.style.left = `${col * CELL}px`;
      spark.style.top = `${row * CELL}px`;
      void spark.offsetWidth;
      spark.style.animation = `about-cell-twinkle ${(0.5 + Math.random() * 0.6).toFixed(2)}s ease-in-out 1`;
    };

    const onMove = (event: PointerEvent) => {
      const rect = layer.getBoundingClientRect();
      pending = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (pending) place(pending.x, pending.y);
      });
    };

    layer.parentElement?.addEventListener("pointermove", onMove);
    return () => {
      layer.parentElement?.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="about-scene-bg relative isolate w-full overflow-hidden text-primary-foreground">
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
