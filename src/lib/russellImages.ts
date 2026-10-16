type RussellImage = { color_name?: string | null; url?: string | null };
export function russellImagesForColor(styleCode: string, color: string, images: RussellImage[]): string[] {
  const model = styleCode.replace(/0$/, "").toLowerCase();
  const name = color.trim().toLowerCase();
  return [...new Set(images.flatMap(row => {
    if (!row.url) return [];
    const path = row.url.match(/\/images\/product\/([^/]+)\/([^/]+)\/large\//i);
    if (path && path[1].toLowerCase() !== model) return [];
    if (row.color_name?.trim()) return row.color_name.trim().toLowerCase() === name ? [row.url] : [];
    // Uncoded campaign photographs can depict other colours or related models.
    return path && path[1].toLowerCase() === model && path[2] === "36" && name === "black" ? [row.url] : [];
  }))];
}
