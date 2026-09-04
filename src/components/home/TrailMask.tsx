import { useEffect, useRef } from "react";

type Point = { x: number; y: number; r: number; life: number };

/**
 * LAYER 3 — interactive trailing "blob" mask.
 *
 * Draws the given image into a canvas, then keeps only the parts covered by a
 * soft, organic blob trail that follows the cursor. The result reveals the
 * subject image (LAYER 2) through the solid background (LAYER 1).
 *
 * Pointer events are never captured, so all content stays clickable.
 */
const TrailMask = ({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d");
    if (!mctx) return;

    const img = new Image();
    img.decoding = "async";
    img.src = src;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [canvas, mask]) {
        c.width = Math.max(1, Math.round(w * dpr));
        c.height = Math.max(1, Math.round(h * dpr));
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const points: Point[] = [];
    let target: { x: number; y: number } | null = null;
    const cursor = { x: -9999, y: -9999 };
    let seeded = false;
    let t = 0;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!seeded) {
        cursor.x = target.x;
        cursor.y = target.y;
        seeded = true;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // object-cover geometry
    const cover = () => {
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = w / h;
      let dw = w;
      let dh = h;
      if (ir > cr) dw = h * ir;
      else dh = w / ir;
      return { x: (w - dw) / 2, y: (h - dh) / 2, w: dw, h: dh };
    };

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.016;

      if (target && seeded) {
        cursor.x += (target.x - cursor.x) * 0.14;
        cursor.y += (target.y - cursor.y) * 0.14;
        const base = Math.min(w, h) * 0.16;
        points.push({
          x: cursor.x,
          y: cursor.y,
          r: base * (0.85 + Math.sin(t * 2.4) * 0.15),
          life: 1,
        });
      }

      for (let i = points.length - 1; i >= 0; i--) {
        points[i].life -= 0.006;
        if (points[i].life <= 0) points.splice(i, 1);
      }
      if (points.length > 200) points.splice(0, points.length - 200);

      ctx.clearRect(0, 0, w, h);
      mctx.clearRect(0, 0, w, h);

      if (points.length && img.complete && img.naturalWidth) {
        // Metaball-style oil-blot mask: blur + hard contrast merges the
        // trail into one gooey, organic paint shape with liquid edges.
        mctx.save();
        mctx.filter = "blur(22px) contrast(26)";
        mctx.fillStyle = "#fff";
        for (const p of points) {
          const e = Math.pow(p.life, 0.55);
          const rr = p.r * e;
          if (rr < 1) continue;
          // a few offset lobes per point => irregular, paint-like outline
          for (let k = 0; k < 3; k++) {
            const a = t * 0.9 + k * 2.1 + p.life * 3;
            mctx.beginPath();
            mctx.arc(
              p.x + Math.cos(a) * rr * 0.28,
              p.y + Math.sin(a * 1.3) * rr * 0.28,
              rr * (0.8 - k * 0.12),
              0,
              Math.PI * 2,
            );
            mctx.fill();
          }
        }
        mctx.restore();

        const c = cover();
        ctx.drawImage(img, c.x, c.y, c.w, c.h);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(mask, 0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
    />
  );
};

export default TrailMask;
