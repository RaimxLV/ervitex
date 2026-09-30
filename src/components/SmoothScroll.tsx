import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

/**
 * Light wheel smoothing for the story-driven marketing pages only. Pages with
 * long data lists (catalog, admin, worksheet) and coarse-pointer devices keep
 * native scrolling so they stay responsive.
 */
const SMOOTH_ROUTES = ["/", "/about", "/tehnologijas"];

const SmoothScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const enabled = SMOOTH_ROUTES.some((route) =>
      route === "/" ? pathname === route : pathname.startsWith(route),
    );
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarsePointer) return;

    const lenis = new Lenis({
      duration: 0.72,
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
