import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

/**
 * Wheel smoothing for public pages. Admin, worksheet and login pages
 * and coarse-pointer devices keep
 * native scrolling so they stay responsive.
 */
const NATIVE_ROUTES = ["/admin", "/saraksts", "/login"];

const SmoothScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (NATIVE_ROUTES.some((route) => pathname.startsWith(route))) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarsePointer) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
