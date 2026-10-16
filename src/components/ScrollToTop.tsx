import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const ScrollToTop = () => {
  // The target URL changes before its loader finishes; scroll only once it mounts.
  const { pathname, hash } = useRouterState({
    select: (state) => state.resolvedLocation ?? state.location,
  });

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      // Wait for the target section to mount before scrolling
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
