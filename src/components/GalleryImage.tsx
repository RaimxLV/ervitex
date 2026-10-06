import { useEffect, useState } from "react";
import { prepareGalleryImage } from "@/lib/galleryImages";

type Props = { src: string; alt: string; className?: string; fallback?: string };

export function GalleryImage({ src, alt, className, fallback }: Props) {
  const [display, setDisplay] = useState({ src, alt });
  useEffect(() => {
    let cancelled = false;
    void prepareGalleryImage(src).catch(async () => {
      if (!fallback || fallback === src) throw new Error("Image unavailable");
      await prepareGalleryImage(fallback);
      return fallback;
    }).then((replacement) => {
      if (!cancelled) setDisplay({ src: replacement || src, alt });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [src, alt, fallback]);
  return <img src={display.src} alt={display.alt} className={className} loading="eager" decoding="async" />;
}