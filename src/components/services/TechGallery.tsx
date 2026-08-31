import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TechGalleryProps {
  images: string[];
  alt: string;
  /** How many thumbnails are visible per page on desktop. */
  perPage?: number;
}

const TechGallery = ({ images, alt, perPage = 4 }: TechGalleryProps) => {
  const [page, setPage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images.length) return null;

  const pages = Math.ceil(images.length / perPage);
  const start = page * perPage;
  const visible = images.slice(start, start + perPage);

  const prevPage = () => setPage((p) => (p === 0 ? pages - 1 : p - 1));
  const nextPage = () => setPage((p) => (p === pages - 1 ? 0 : p + 1));

  const prevImg = () => setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  const nextImg = () => setLightbox((i) => (i === null ? i : (i + 1) % images.length));

  return (
    <div className="relative">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightbox(start + i)}
            className="group block overflow-hidden rounded-sm bg-muted"
            aria-label={`${alt} ${start + i + 1}`}
          >
            <img
              src={src}
              alt={`${alt} ${start + i + 1}`}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          </button>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={prevPage}
            className="rounded-full border border-border p-2 text-foreground transition-colors hover:border-foreground"
            aria-label="Iepriekšējās bildes"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Lapa ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === page ? "w-6 bg-accent" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextPage}
            className="rounded-full border border-border p-2 text-foreground transition-colors hover:border-foreground"
            aria-label="Nākamās bildes"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={() => setLightbox(null)}
              aria-label="Aizvērt"
            >
              <X className="h-6 w-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImg(); }}
                  className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-6"
                  aria-label="Iepriekšējā"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImg(); }}
                  className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-6"
                  aria-label="Nākamā"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}

            <img
              src={images[lightbox]}
              alt={`${alt} ${lightbox + 1}`}
              className="max-h-[85vh] max-w-[92vw] rounded-sm object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechGallery;
