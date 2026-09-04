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
    if (reduced) return;

    // trail nodes, each lagging behind the previous one
    const nodes = Array.from({ length: BLOBS }, () => ({ x: -400, y: -400 }));
    let mx = -400;
    let my = -400;
    let seeded = false;

    const seed = () => {
      if (seeded) return;
      seeded = true;
      for (const n of nodes) {
        n.x = mx;
        n.y = my;
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      seed();
    };

    const cleanups: Array<() => void> = [];

    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onMove));
    } else {
      // ── Mobile: tilt the phone to move the light blob ──
      const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

      const onTilt = (e: DeviceOrientationEvent) => {
        const rect = wrap.getBoundingClientRect();
        if (!rect.width) return;
        const gamma = e.gamma ?? 0; // left/right tilt, -90..90
        const beta = e.beta ?? 45; // front/back tilt, -180..180
        // map ±35° of gamma across the width, 15°..75° of beta across the height
        const nx = clamp((gamma + 35) / 70, 0, 1);
        const ny = clamp((beta - 15) / 60, 0, 1);
        mx = nx * rect.width;
        my = ny * rect.height;
        seed();
      };

      const attachTilt = () => {
        window.addEventListener("deviceorientation", onTilt, { passive: true });
        cleanups.push(() => window.removeEventListener("deviceorientation", onTilt));
      };

      const Anyone = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      } | undefined;

      if (Anyone?.requestPermission) {
        // iOS 13+: needs a user gesture to grant motion access
        const ask = () => {
          Anyone.requestPermission?.()
            .then((state) => {
              if (state === "granted") attachTilt();
            })
            .catch(() => {});
          window.removeEventListener("touchstart", ask);
        };
        window.addEventListener("touchstart", ask, { passive: true, once: true });
        cleanups.push(() => window.removeEventListener("touchstart", ask));
      } else if (Anyone) {
        attachTilt();
      }

      // touch drag also moves the blob
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        const rect = wrap.getBoundingClientRect();
        mx = t.clientX - rect.left;
        my = t.clientY - rect.top;
        seed();
      };
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchstart", onTouch);
      });

      // start centred so something is visible before the first tilt
      const rect = wrap.getBoundingClientRect();
      mx = rect.width / 2;
      my = rect.height / 2;
      seed();
    }

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!seeded) return;

      let px = mx;
      let py = my;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const k = i === 0 ? 0.11 : 0.22;
        n.x += (px - n.x) * k;
        n.y += (py - n.y) * k;
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
      for (const fn of cleanups) fn();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      <svg className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="hero-goo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 44 -20"
              result="goo"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.009"
              numOctaves={1}
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
                  r={140 - i * 3.6}
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
