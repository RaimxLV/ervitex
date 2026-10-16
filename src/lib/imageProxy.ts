/**
 * Several partner CDNs serve print-resolution originals (NWG "highres" files are
 * 4–7 MB each). Route those through an image resizing CDN so the UI receives
 * small WebP files. Cloudinary images use native transformations instead of
 * another proxy; its named supplier preset can otherwise return 1500px files.
 */
export const HEAVY_IMAGE_HOSTS = [
  "images.nwgmedia.com",
  "d2csxpduxe849s.cloudfront.net",
  "mediahub.beechfieldbrands.com",
  "cdn.fruitoftheloom.eu",
  // Our mirrored UTT / Falk&Ross originals are 850–1300 px.
  "ifwshbcwsehekbadsooh.supabase.co/storage/v1/object/public/utt-images",
  "ifwshbcwsehekbadsooh.supabase.co/storage/v1/object/public/falkross-images",
];

/** Resized WebP variant of a partner image (no-op for light hosts). */
export const thumbUrl = (u: string | null, width = 500): string | null => {
  if (!u) return null;
  if (u.startsWith("https://res.cloudinary.com/")) {
    const transform = `f_auto,q_auto,c_limit,w_${width}`;
    // Preserve named supplier presets and the complete model/colour filename.
    if (/\/t_[^/]+\//.test(u)) {
      return u.replace(/(\/t_[^/]+\/)(?:f_auto,q_auto,c_limit,w_\d+\/)?/, `$1${transform}/`);
    }
    return u.replace(/(\/image\/upload\/)(?:f_auto,q_auto,c_limit,w_\d+\/)?/, `$1${transform}/`);
  }
  if (!HEAVY_IMAGE_HOSTS.some((h) => u.includes(h))) return u;
  return `https://wsrv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ""))}&w=${width}&output=webp&q=82&we`;
};

/** Tiny blurred preview used as an instant placeholder behind the main image. */
export const blurUrl = (u: string | null): string | null => {
  if (!u) return null;
  return `https://wsrv.nl/?url=${encodeURIComponent(u.replace(/^https?:\/\//, ""))}&w=32&output=webp&q=40&blur=5&we`;
};

/** Original URL behind a wsrv.nl proxy link (no-op for direct URLs). */
export const unproxyUrl = (u: string | null): string | null => {
  if (!u) return null;
  if (!u.startsWith("https://wsrv.nl/?url=")) return u;
  try {
    const raw = decodeURIComponent(new URL(u).searchParams.get("url") || "");
    return raw ? (raw.startsWith("http") ? raw : `https://${raw}`) : null;
  } catch {
    return null;
  }
};
