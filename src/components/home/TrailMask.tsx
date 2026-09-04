import { useEffect, useRef } from "react";

const BLOBS = 26; // reused pool of circles forming the trail

/**
 * LAYER 3 — interactive "ink blot" trail (noth.in style).
 *
 * A pool of SVG circles follows the cursor. An SVG "goo" filter
 * (blur -> alpha threshold -> turbulence displacement) merges them into a
 * single hard-edged, organic ink shape with no soft glow. The shape is used
 * as an SVG mask over the subject image, so the image is revealed only inside
 * the blot. Everything is GPU-composited: no per-frame canvas blur.
 */
const TrailMask = ({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const circles = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    // trail nodes, each lagging behind the previous one
    const nodes = Array.from({ length: BLOBS }, () => ({ x: -400, y: -400 }));
    let mx = -400;
    let my = -400;
    let seeded = false;

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      if (!seeded) {
        seeded = true;
        for (const n of nodes) {
          n.x = mx;
          n.y = my;
        }
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!seeded) return;

      let px = mx;
      let py = my;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += (px - n.x) * 0.34;
        n.y += (py - n.y) * 0.34;
        px = n.x;
        py = n.y;

        const c = circles.current[i];
        if (c) {
          c.setAttribute("cx", n.x.toFixed(1));
          c.setAttribute("cy", n.y.toFixed(1));
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      <svg className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <filter id="hero-goo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
              result="goo"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves={2}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              in="goo"
              in2="noise"
              scale="34"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <mask id="hero-trail-mask" maskUnits="userSpaceOnUse">
            <g filter="url(#hero-goo)">
              {Array.from({ length: BLOBS }).map((_, i) => (
                <circle
                  key={i}
                  ref={(el) => {
                    circles.current[i] = el;
                  }}
                  cx={-400}
                  cy={-400}
                  r={78 - i * 2.2}
                  fill="#fff"
                />
              ))}
            </g>
          </mask>
        </defs>

        <image
          href={src}
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          mask="url(#hero-trail-mask)"
        />
      </svg>
    </div>
  );
};

export default TrailMask;
