import { useEffect, useRef, useState } from "react";

export function useGalleryVisibility() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const preload = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: "800px" });
    const viewport = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    preload.observe(node);
    viewport.observe(node);
    const onVisibility = () => setForeground(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      preload.disconnect(); viewport.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return { ref, near, active: visible && foreground };
}