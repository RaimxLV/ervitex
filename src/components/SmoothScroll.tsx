import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Wheel smoothing for public pages. Admin, worksheet and login pages
 * and coarse-pointer devices keep
 * native scrolling so they stay responsive.
 */
const NATIVE_ROUTES = ["/offers", "/admin", "/saraksts", "/login"];

const SmoothScroll = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (NATIVE_ROUTES.some((route) => pathname.startsWith(route))) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarsePointer) return;

    // lerp follows the wheel from the first frame (duration-based easing felt delayed).
    const lenis = new Lenis({
      lerp: 0.16,
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
