import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

/**
 * Inertial scrolling for the story-driven marketing pages only. Pages with long
 * data lists (catalog, admin, worksheet) keep native scrolling so they stay
 * responsive, and touch devices always use native gestures.
 */
const SMOOTH_ROUTES = ["/", "/about", "/tehnologijas"];

const SmoothScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const enabled = SMOOTH_ROUTES.some((r) => (r === "/" ? pathname === "/" : pathname.startsWith(r)));
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
};

export default SmoothScroll;
