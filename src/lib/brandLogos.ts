export interface BrandLogoEntry { name: string; src: string; sourcePage: string }
export const normalizeBrandName = (name: string) => name.replace(/[®™©]/g, "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const pointers = import.meta.glob<{ default: { url: string } }>("../assets/brands/*.asset.json", { eager: true });
const sources = import.meta.glob<{ default: { name: string; sourcePage: string } }>("../assets/brands/*.source.json", { eager: true });
export const brandLogos: BrandLogoEntry[] = Object.entries(sources).flatMap(([path, source]) => {
  const pointer = pointers[path.replace(".source.json", ".asset.json")]?.default;
  if (!pointer || normalizeBrandName(source.default.name) === "etxlatvia") return [];
  return [{ ...source.default, src: pointer.url.startsWith("/") ? `https://www.ervitex.lv${pointer.url}` : pointer.url }];
}).sort((a, b) => a.name === "Stanley/Stella" ? -1 : b.name === "Stanley/Stella" ? 1 : a.name.localeCompare(b.name));
export const findBrandLogo = (brand: string) => brandLogos.find((entry) => normalizeBrandName(entry.name) === normalizeBrandName(brand));
