import { useEffect, useRef, useState } from "react";

/**
 * Interactive WebGL fluid ("oil paint / wet ink") layer for the hero.
 * Purely decorative: sits behind the hero content, which stays clickable.
 * Disabled on touch-only devices to protect scrolling and frame rate.
 */
const FluidCanvas = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const hoverCapable =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hoverCapable || reduceMotion) return;
    setEnabled(true);

    let cancelled = false;
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start)
      : window.setTimeout(start, 400);

    function start() {
      if (cancelled || !canvasRef.current) return;
      import("webgl-fluid")
        .then(({ default: WebGLFluid }) => {
          if (cancelled || !canvasRef.current) return;
          WebGLFluid(canvasRef.current, {
            IMMEDIATE: false,
            TRIGGER: "hover",
            SIM_RESOLUTION: 192,
            DYE_RESOLUTION: 1440,
            CAPTURE_RESOLUTION: 512,
            // thick oil paint: dye lingers, edges stay sharp (no smoke wisps)
            DENSITY_DISSIPATION: 0.18,
            VELOCITY_DISSIPATION: 0.9,
            PRESSURE: 0.6,
            PRESSURE_ITERATIONS: 20,
            CURL: 2,
            SPLAT_RADIUS: 0.22,
            SPLAT_FORCE: 6800,
            SHADING: true,
            COLORFUL: true,
            COLOR_UPDATE_SPEED: 8,
            PAUSED: false,
            BACK_COLOR: { r: 0, g: 0, b: 0 },
            TRANSPARENT: true,
            BLOOM: false,
            SUNRAYS: false,
          });
        })
        .catch(() => undefined);
    }

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && typeof idle === "number") {
        window.cancelIdleCallback(idle);
      }
      clearTimeout(idle as number);
    };
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full pointer-events-auto ${className}`}
    />
  );
};

export default FluidCanvas;
