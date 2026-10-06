import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGalleryNavigation } from "@/hooks/useGalleryNavigation";

interface ServiceImageCarouselProps {
  images: string[];
  alt: string;
}

const ServiceImageCarousel = ({ images, alt }: ServiceImageCarouselProps) => {
  const { index: current, busy, move, select } = useGalleryNavigation(images);
  const reduced = useReducedMotion();
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, move]);

  if (!images.length) return null;

  const prev = () => move(-1);
  const next = () => move(1);

  return (
    <>
      {/* Inline carousel */}
      <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-sm bg-muted" aria-busy={busy}>
        <Button
          type="button" variant="ghost" aria-label={`${alt} — atvērt attēlu`}
          className="relative h-full w-full rounded-none p-0 hover:bg-muted"
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence initial={false}>
          <motion.img
            key={images[current]}
            src={images[current]}
            alt={`${alt} ${current + 1}`}
            loading="eager"
            decoding="async"
            fetchPriority={current === 0 ? "high" : "auto"}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            className="absolute inset-0 h-full w-full bg-muted object-cover"
          />
          </AnimatePresence>
        </Button>

        {images.length > 1 && (
          <>
            <Button type="button" variant="ghost" size="icon" aria-label="Iepriekšējais titula attēls"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label="Nākamais titula attēls"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex max-w-[80%] -translate-x-1/2 flex-wrap justify-center gap-1.5">
              {images.map((_, i) => (
                <Button type="button" variant="ghost" aria-label={`Titula attēls ${i + 1}`} aria-current={i === current ? "true" : undefined}
                  key={i}
                  onClick={(e) => { e.stopPropagation(); void select(i); }}
                  className={`h-2 w-2 shrink-0 rounded-full p-0 transition ${
                    i === current ? "bg-accent" : "bg-background/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm"
            onClick={() => setLightbox(false)}
            role="dialog" aria-modal="true" aria-label={alt}
          >
            <Button type="button" variant="secondary" size="icon" aria-label="Aizvērt"
              className="absolute right-4 top-4 rounded-full"
              onClick={() => setLightbox(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {images.length > 1 && (
              <>
                <Button type="button" variant="secondary" size="icon" aria-label="Iepriekšējā"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 rounded-full"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button type="button" variant="secondary" size="icon" aria-label="Nākamā"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-4 rounded-full"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            <img
              src={images[current]}
              alt={`${alt} ${current + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-sm object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ServiceImageCarousel;
