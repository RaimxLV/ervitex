/** Only accept the imported supplier swatch belonging to this exact colour. */
export function malfiniSwatchUrl(code: string, importedUrl?: string | null): string | null {
  if (!importedUrl || !/^\d{2}$/.test(code)) return null;
  try {
    const url = new URL(importedUrl);
    if (url.origin !== "https://api.malfini.com" || url.search || url.hash) return null;
    if (!new RegExp(`^/image/color/base/${code}\\.(jpg|png)$`).test(url.pathname)) return null;
    return url.href;
  } catch {
    return null;
  }
}