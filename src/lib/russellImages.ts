type RussellImage = { color_name?: string | null; url?: string | null };
export function russellImageColor(styleCode: string, row: RussellImage): string | null {
  if (!row.url) return null;
  const model = styleCode.replace(/0$/, "").toLowerCase();
  const path = row.url.match(/\/images\/product\/([^/]+)\/([^/]+)\/large\//i);
  if (path && path[1].toLowerCase() !== model) return null;
  if (row.color_name?.trim()) return row.color_name.trim();
  return path && path[1].toLowerCase() === model && path[2] === "36" ? "Black" : null;
}
export function russellImagesForColor(styleCode: string, color: string, images: RussellImage[]): string[] {
  const name = color.trim().toLowerCase();
  return [...new Set(images.flatMap(row => row.url && russellImageColor(styleCode, row)?.toLowerCase() === name ? [row.url] : []))];
}
