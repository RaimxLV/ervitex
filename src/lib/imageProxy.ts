/**
 * Several partner CDNs serve print-resolution originals (NWG "highres" files are
 * 4–7 MB each). Route those through an image resizing CDN so the UI receives
 * small WebP files. Hosts that already serve reasonable sizes (Cloudinary for
 * Stanley/Stella) are left untouched.
 */
export const HEAVY_IMAGE_HOSTS = [
  "images.nwgmedia.com",
  "d2csxpduxe849s.cloudfront.net",
  "mediahub.beechfieldbrands.com",
  "cdn.fruitoftheloom.eu",
];

/** Resized WebP variant of a partner image (no-op for light hosts). */
export const thumbUrl = (u: string | null, width = 500): string | null => {
  if (!u) return null;
  if (!HEAVY_IMAGE_HOSTS.some((h) => u.includes(h))) return u;
  return `https://wsrv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ""))}&w=${width}&output=webp&q=82&we`;
};

/** Tiny blurred preview used as an instant placeholder behind the main image. */
export const blurUrl = (u: string | null): string | null => {
  if (!u) return null;
  return `https://wsrv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ""))}&w=32&output=webp&q=40&blur=5&we`;
};
