const pending = new Map<string, Promise<void>>();

/** Share in-flight decoding; failed requests can be retried. */
export function prepareGalleryImage(src: string): Promise<void> {
  const existing = pending.get(src);
  if (existing) return existing;
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  const promise = image.decode().catch((error: unknown) => {
    pending.delete(src);
    throw error;
  });
  pending.set(src, promise);
  // Keep only a bounded window of decoded references, not every gallery ever visited.
  if (pending.size > 64) {
    const oldest = pending.keys().next().value;
    if (oldest) pending.delete(oldest);
  }
  return promise;
}

export function warmGalleryImages(sources: string[]) {
  [...new Set(sources)].filter(Boolean).forEach((src) => {
    void prepareGalleryImage(src).catch(() => undefined);
  });
}