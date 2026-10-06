import { useCallback, useEffect, useRef, useState } from "react";
import { prepareGalleryImage, warmGalleryImages } from "@/lib/galleryImages";

/** Never replace the current frame until the requested frame is decoded. */
export function useGalleryNavigation(images: string[], count = 1, enabled = true) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const requestedIndex = useRef(0);
  const signature = images.join("\n");
  useEffect(() => {
    request.current++;
    requestedIndex.current = 0;
    setIndex(0);
    setBusy(false);
    return () => { request.current++; };
  }, [signature]);
  useEffect(() => {
    if (!enabled || !images.length) return;
    warmGalleryImages(Array.from({ length: count + 2 }, (_, offset) => images[(index + offset - 1 + images.length) % images.length]));
  }, [signature, index, count, enabled]);
  const select = useCallback(async (next: number) => {
    if (!images.length) return;
    const target = (next % images.length + images.length) % images.length;
    requestedIndex.current = target;
    const ticket = ++request.current;
    setBusy(true);
    try {
      await Promise.all(Array.from({ length: Math.min(count, images.length) }, (_, offset) => prepareGalleryImage(images[(target + offset) % images.length])));
      if (request.current === ticket) setIndex(target);
    } catch {
      // Keep the last usable frame when a download fails.
      if (request.current === ticket) requestedIndex.current = index;
    } finally {
      if (request.current === ticket) setBusy(false);
    }
  }, [signature, count, index]);
  const move = useCallback((step: number) => { void select(requestedIndex.current + step); }, [select]);
  return { index, busy, select, move };
}