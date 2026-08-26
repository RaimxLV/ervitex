export type HeroAnchor = "top" | "bottom";

export type HeroPos = {
  /** distance from right edge, % of hero width */
  right: number;
  /** distance from top or bottom edge, % of hero height */
  y: number;
  anchor: HeroAnchor;
  /** width in vw */
  width: number;
  rotate: number;
  /** stacking order */
  z: number;
};

export type HeroLayout = Record<string, HeroPos>;

/** Desktop (>= 768px) layout. Mobile keeps its own tuned classes. */
export const DEFAULT_HERO_LAYOUT: HeroLayout = {
  jacket: { right: 1, y: 6, anchor: "top", width: 30, rotate: -3, z: 20 },
  pants: { right: 4, y: -4, anchor: "bottom", width: 30, rotate: 4, z: 25 },
  hoodie: { right: 30, y: 8, anchor: "top", width: 27, rotate: -6, z: 40 },
  tee: { right: 23, y: 2, anchor: "bottom", width: 30, rotate: 3, z: 35 },
  sneaker: { right: 46, y: 14, anchor: "bottom", width: 15, rotate: 8, z: 50 },
};

const KEY = "ervitex.heroLayout.v1";

export const loadHeroLayout = (): HeroLayout => {
  if (typeof window === "undefined") return DEFAULT_HERO_LAYOUT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_HERO_LAYOUT;
    const parsed = JSON.parse(raw) as HeroLayout;
    const merged: HeroLayout = { ...DEFAULT_HERO_LAYOUT };
    for (const id of Object.keys(DEFAULT_HERO_LAYOUT)) {
      if (parsed?.[id]) merged[id] = { ...DEFAULT_HERO_LAYOUT[id], ...parsed[id] };
    }
    return merged;
  } catch {
    return DEFAULT_HERO_LAYOUT;
  }
};

export const saveHeroLayout = (layout: HeroLayout) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(layout));
  } catch {
    /* ignore */
  }
};

export const resetHeroLayout = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

export const heroPosStyle = (p: HeroPos): React.CSSProperties => ({
  position: "absolute",
  right: `${p.right}%`,
  [p.anchor]: `${p.y}%`,
  width: `${p.width}vw`,
  zIndex: p.z,
});
