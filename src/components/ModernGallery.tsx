import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface GallerySlide {
  src: string;
  caption?: string;
}

interface ModernGalleryProps {
  slides: GallerySlide[];
  autoPlayInterval?: number;
  aspectRatio?: string;
  className?: string;
}

const ModernGallery = ({
  slides,
  autoPlayInterval = 4500,
  aspectRatio = "16/9",
  className = "",
}: ModernGalleryProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);

  const total = slides.length;

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + total) % total);
    },
    [total],
  );

  // Auto-play
  useEffect(() => {
    timerRef.current = setInterval(() => go(1), autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [go, autoPlayInterval]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(1), autoPlayInterval);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) {
      go(1);
      resetTimer();
    } else if (info.offset.x > 60) {
      go(-1);
      resetTimer();
    }
  };

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({
      x: d > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{ aspectRatio }}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={current}
          src={slides[current].src}
          alt={slides[current].caption || ""}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: dragOpacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          dragMomentum={false}
          onDrag={(_, info) => dragX.set(info.offset.x)}
        />
      </AnimatePresence>

      {/* Caption overlay */}
      {slides[current].caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-5 pt-12">
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-white md:text-base">
            {slides[current].caption}
          </p>
        </div>
      )}

      {/* Arrows — visible on hover */}
      <button
        onClick={() => { go(-1); resetTimer(); }}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
      </button>
      <button
        onClick={() => { go(1); resetTimer(); }}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); resetTimer(); }}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ModernGallery;
