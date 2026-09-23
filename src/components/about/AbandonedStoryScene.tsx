import { useRef, type PointerEvent, type ReactNode } from "react";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = sectionRef.current?.getBoundingClientRect();
    if (!bounds || !glowRef.current) return;

    glowRef.current.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    glowRef.current.style.setProperty("--my", `${event.clientY - bounds.top}px`);
    glowRef.current.style.opacity = "1";
  };

  const handlePointerLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  };

  return (
    <section
      ref={sectionRef}
      className="about-scene-bg relative isolate w-full overflow-hidden text-primary-foreground"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="about-grid absolute inset-0 z-0" aria-hidden="true">
        {Array.from({ length: 3456 }, (_, index) => (
          <span className="about-grid-cell" key={index} />
        ))}
      </div>
      <div ref={glowRef} className="about-grid-glow absolute inset-0 z-0" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
