import { useMemo, type ReactNode } from "react";

type AbandonedStorySceneProps = {
  children: ReactNode;
};

const CELL = 24;
const SPARK_COUNT = 22;

const AbandonedStoryScene = ({ children }: AbandonedStorySceneProps) => {
  const sparks = useMemo(
    () =>
      Array.from({ length: SPARK_COUNT }, (_, index) => ({
        key: index,
        left: `${Math.round(Math.random() * 96)}%`,
        top: `${Math.round(Math.random() * 96)}%`,
        delay: `${(Math.random() * 9).toFixed(2)}s`,
        duration: `${(4 + Math.random() * 6).toFixed(2)}s`,
      })),
    [],
  );

  return (
    <section className="about-scene-bg relative isolate w-full overflow-hidden text-primary-foreground">
      <div className="about-grid absolute inset-0 z-0" aria-hidden="true">
        {sparks.map((spark) => (
          <span
            className="about-spark"
            key={spark.key}
            style={{
              left: spark.left,
              top: spark.top,
              width: CELL,
              height: CELL,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default AbandonedStoryScene;
