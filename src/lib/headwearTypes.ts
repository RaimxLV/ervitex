/** Headwear is a conditional facet, never a filter on unrelated clothing. */
export const isHeadwearCategory = (category?: string | null) =>
  /^(caps?(&hats?)?|hats?|headwear|beanies?|cepures)$/i.test((category || "").replace(/\s/g, ""));

export const HEADWEAR_TYPES = [
  { key: "cap", lv: "Naģenes", en: "Baseball caps" },
  { key: "trucker", lv: "Tīkla naģenes (Trucker)", en: "Trucker caps" },
  { key: "flat", lv: "Naģenes ar taisnu nagu", en: "Flat-peak caps" },
  { key: "bucket", lv: "Panamas", en: "Bucket hats" },
  { key: "brimmed", lv: "Platmales", en: "Brimmed hats" },
  { key: "beanie", lv: "Adītas cepures", en: "Knitted beanies" },
  { key: "winter", lv: "Flīsa un auduma ziemas cepures", en: "Fleece & fabric winter hats" },
  { key: "visor", lv: "Saules nadziņi", en: "Sun visors" },
  { key: "headband", lv: "Galvas lentes", en: "Headbands" },
  { key: "balaclava", lv: "Balaklavas", en: "Balaclavas" },
  { key: "bandana", lv: "Bandanas un lakati", en: "Bandanas & headscarves" },
  { key: "other", lv: "Citas galvassegas", en: "Other headwear" },
] as const;
export type HeadwearType = typeof HEADWEAR_TYPES[number]["key"];

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/<[^>]*>/g, " ");

/** Specific name wins; descriptions resolve generic supplier names, not incidental mentions of a visor. */
export function headwearType(name?: string | null, description?: string | null): HeadwearType {
  const n = normalize(name || "");
  const d = normalize(description || "");
  const text = `${n} ${d}`;
  if (/balaclava|balaklav/.test(text)) return "balaclava";
  if (/headband|hairband|galvas lent/.test(n)) return "headband";
  if (/bucket|panama|fisherman.*hat/.test(n)) return "bucket";
  if (/bandana|hijab|headscarf|lakats|neck.?tube|snood|multi.?function/.test(n) && !/cap|snapback/.test(n)) return "bandana";
  if (/triangle cut|tubular cut|multipurpose use/.test(d)) return "bandana";
  if (/flat.?peak|flat.?visor|flat.?brim|straight.?peak|taisn[asu]* nag/.test(text)) return "flat";
  if (/\bvisor\b|sun.?visor|saules nadz/.test(n) && !/\bcap\b|snapback|nagen/.test(n)) return "visor";
  if (/trucker|omnimesh|mesh cap/.test(n) || /trucker|mesh (back|rear)|back.*mesh|rear.*mesh/.test(d)) return "trucker";
  if (/jersey beanie|fleece beanie/.test(n)) return "winter";
  if (/beanie|knit|rib|adit|tambor/.test(n)) return "beanie";
  if (/\bcap\b|\bcaps\b|snapback|baseball|nagen|[56][ -]?panel/.test(n)) return "cap";
  if (/bucket/.test(d)) return "bucket";
  if (/straw|fedora|sun hat|sunhat|wide.?brim|safari|bush hat|outback|platmal/.test(text)) return "brimmed";
  if (/knit|rib.?knit|beanie|adit/.test(d)) return "beanie";
  if (/fleece|thermal|jersey|winter|merino|wind|ski|flis|ziemas/.test(text)) return "winter";
  if (/headband|hairband/.test(d)) return "headband";
  if (/baseball|\bcap\b|[56][ -]?panel|five.panel|six.panel|curved peak|sweatband/.test(d)) return "cap";
  return "other";
}

export function matchesHeadwearType(category: string | null, type: HeadwearType, selected: Set<string>, active: boolean) {
  return !active || selected.size === 0 || (isHeadwearCategory(category) && selected.has(type));
}