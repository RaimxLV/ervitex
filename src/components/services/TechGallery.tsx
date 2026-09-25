import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TechGalleryProps {
  images: string[];
  alt: string;
  /** Kept for compatibility; the bento layout always presents up to four images. */
  perPage?: number;
}

const slotClasses = [
  "col-span-2 row-span-2 min-h-[22rem] md:min-h-0",
  "col-span-2 min-h-52 md:min-h-0",
  "min-h-44 md:min-h-0",
  "min-h-44 md:min-h-0",
];

const TechGallery = ({ images, alt }: TechGalleryProps) => {
  const [start, setStart] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const move = useCallback((step: number) => {
    if (images.length < 2) return;
    setDirection(step);
    setStart((current) => (current + step + images.length) % images.length);
  }, [images.length]);

  const moveLightbox = useCallback((step: number) => {
    setLightbox((current) => {
      if (current === null || images.length < 2) return current;
      return (current + step + images.length) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") moveLightbox(-1);
      if (event.key === "ArrowRight") moveLightbox(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, moveLightbox]);

  if (!images.length) return null;

  const visibleCount = Math.min(4, images.length);
  const visible = Array.from({ length: visibleCount }, (_, slot) => {
    const index = (start + slot) % images.length;
    return { src: images[index], index, slot };
  });
  const activeLightboxImage = lightbox === null ? undefined : images[lightbox];

  return (
    <div>
      <div className="grid min-h-[42rem] grid-cols-2 grid-rows-[2fr_1fr_1fr] gap-3 md:h-[36rem] md:min-h-0 md:grid-cols-4 md:grid-rows-2 md:gap-4">
        {visible.map(({ src, index, slot }) => (
          <Button
            key={`slot-${slot}`}
            type="button"
            variant="ghost"
            onClick={() => setLightbox(index)}
            className={`group relative h-full w-full overflow-hidden rounded-none border border-border bg-muted p-0 hover:bg-muted ${slotClasses[slot] ?? ""}`}
            aria-label={`${alt} ${index + 1}`}
          >
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.img
                key={`${slot}-${index}-${src}`}
                src={src}
                alt={`${alt} ${index + 1}`}
                loading={slot < 2 ? "eager" : "lazy"}
                decoding="async"
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 24 : -24, scale: 1.025 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction > 0 ? -24 : 24, scale: 0.985 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
            </AnimatePresence>
            <span className="absolute left-3 top-3 border border-border/70 bg-background/90 px-2.5 py-1 font-heading text-xs font-bold tabular-nums text-foreground backdrop-blur-sm">
              {String(index + 1).padStart(2, "0")}
            </span>
          </Button>
        ))}
      </div>

      {images.length > visibleCount && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-1 transition-all duration-500 ${index === start ? "w-10 bg-foreground" : "w-5 bg-border"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" className="rounded-none" onClick={() => move(-1)} aria-label="Iepriekšējais attēls">
              <ChevronLeft />
            </Button>
            <Button type="button" variant="outline" size="icon" className="rounded-none" onClick={() => move(1)} aria-label="Nākamais attēls">
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeLightboxImage && lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} ${lightbox + 1}`}
          >
            <Button type="button" variant="secondary" size="icon" className="absolute right-4 top-4 rounded-full" onClick={() => setLightbox(null)} aria-label="Aizvērt">
              <X />
            </Button>
            {images.length > 1 && (
              <>
                <Button type="button" variant="secondary" size="icon" className="absolute left-3 rounded-full md:left-6" onClick={(event) => { event.stopPropagation(); moveLightbox(-1); }} aria-label="Iepriekšējā">
                  <ChevronLeft />
                </Button>
                <Button type="button" variant="secondary" size="icon" className="absolute right-3 rounded-full md:right-6" onClick={(event) => { event.stopPropagation(); moveLightbox(1); }} aria-label="Nākamā">
                  <ChevronRight />
                </Button>
              </>
            )}
            <motion.img
              key={activeLightboxImage}
              src={activeLightboxImage}
              alt={`${alt} ${lightbox + 1}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-h-[86vh] max-w-[90vw] object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechGallery;