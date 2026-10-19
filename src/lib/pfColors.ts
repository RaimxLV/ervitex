/** PF feed `colors.color` → viena varianta krāsas identitāte (divkrāsu precēm visas krāsas, nevis tikai pirmā). */
export interface PfFeedColor {
  colorCode?: string | null;
  colorDesc?: string | null;
  baseColor?: string | null;
  hexColor?: string | null;
}

export const pfVariantColor = (colors: PfFeedColor | PfFeedColor[] | null | undefined) => {
  const list = (Array.isArray(colors) ? colors : colors ? [colors] : []).filter((c) => (c?.colorCode || "").trim());
  if (!list.length) return null;
  return {
    color_code: list.map((c) => c.colorCode!.trim()).join("+"),
    color_desc: list.map((c) => (c.colorDesc || c.colorCode || "").trim()).join(" / "),
    base_color: list[0].baseColor ?? null,
    hex_color: list[0].hexColor ?? null,
  };
};
