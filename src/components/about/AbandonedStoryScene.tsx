import { useRef, useState, type PointerEvent, type ReactNode } from "react";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCell, setActiveCell] = useState<number | null>(null);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = sectionRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const columns = window.innerWidth >= 768 ? 18 : 12;
    const rows = window.innerWidth >= 768 ? 12 : 18;
    const column = Math.min(columns - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * columns)));
    const row = Math.min(rows - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * rows)));
    setActiveCell(row * columns + column);
  };

  return (
    <section
      ref={sectionRef}
      className="about-scene-bg relative isolate w-full overflow-hidden text-primary-foreground"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setActiveCell(null)}
    >
      <div className="about-grid absolute inset-0 z-0" aria-hidden="true">
        {Array.from({ length: 216 }, (_, index) => (
          <span className={`about-grid-cell${activeCell === index ? " is-active" : ""}`} key={index} />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
