import React from "react";

interface IconProps {
  className?: string;
}

const SW = 1.2;

// Shared wrapper for consistent sizing
const Svg: React.FC<React.PropsWithChildren<IconProps>> = ({ className = "h-5 w-5", children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={SW}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

// 1. Visi — 4-square grid
export const IconAll: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Svg>
);

// 2. T-krekli — T-shirt silhouette
export const IconTShirt: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 2 L4 5 L6 7 L6 6 L7 5 L7 21 L17 21 L17 5 L18 6 L18 7 L20 5 L16 2 L14 4 Q12 6 10 4 Z" />
  </Svg>
);

// 3. Polo krekli — Shirt with collar & buttons
export const IconPolo: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Body */}
    <path d="M8 2 L4 5 L6 7 L6 6 L7 5 L7 21 L17 21 L17 5 L18 6 L18 7 L20 5 L16 2 L14 3.5 L13 2 L11 2 L10 3.5 Z" />
    {/* Collar flaps */}
    <line x1="10" y1="3.5" x2="9" y2="5.5" />
    <line x1="14" y1="3.5" x2="15" y2="5.5" />
    {/* Button placket */}
    <line x1="12" y1="5" x2="12" y2="12" />
    <circle cx="12" cy="7" r="0.5" fill="currentColor" />
    <circle cx="12" cy="9.5" r="0.5" fill="currentColor" />
  </Svg>
);

// 4. Krekli — Dress shirt with collar
export const IconShirt: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 2 L4 5 L6 7 L7 5.5 L7 21 L17 21 L17 5.5 L18 7 L20 5 L16 2 L14 4 L13 2.5 L11 2.5 L10 4 Z" />
    {/* Collar */}
    <line x1="10" y1="4" x2="9.5" y2="6" />
    <line x1="14" y1="4" x2="14.5" y2="6" />
    {/* Buttons */}
    <line x1="12" y1="5" x2="12" y2="18" />
    <circle cx="12" cy="7" r="0.4" fill="currentColor" />
    <circle cx="12" cy="10" r="0.4" fill="currentColor" />
    <circle cx="12" cy="13" r="0.4" fill="currentColor" />
    <circle cx="12" cy="16" r="0.4" fill="currentColor" />
  </Svg>
);

// 5. Džemperi & Hūdiji — Hoodie with hood & pocket
export const IconHoodie: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Body */}
    <path d="M8 4 L4 7 L6 9 L7 7 L7 21 L17 21 L17 7 L18 9 L20 7 L16 4 Z" />
    {/* Hood */}
    <path d="M8 4 Q8 1 12 1 Q16 1 16 4" />
    {/* Kangaroo pocket */}
    <rect x="9" y="14" width="6" height="3" rx="1" />
    {/* Hood drawstrings */}
    <line x1="11" y1="4" x2="10.5" y2="7" />
    <line x1="13" y1="4" x2="13.5" y2="7" />
  </Svg>
);

// 6. Jakas — Jacket with zipper
export const IconJacket: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 3 L3 7 L5 9 L6 7 L6 21 L18 21 L18 7 L19 9 L21 7 L17 3 L14 3 Q12 5 10 3 Z" />
    {/* Collar */}
    <path d="M10 3 L9.5 5" />
    <path d="M14 3 L14.5 5" />
    {/* Zipper */}
    <line x1="12" y1="5" x2="12" y2="21" />
    {/* Zipper pull */}
    <rect x="11.2" y="5.5" width="1.6" height="2" rx="0.5" fill="currentColor" />
  </Svg>
);

// 7. Virsjakas — Overcoat / longer jacket
export const IconOvercoat: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 2 L4 6 L6 8 L7 6 L6 22 L18 22 L17 6 L18 8 L20 6 L16 2 L14 3.5 L13 2 L11 2 L10 3.5 Z" />
    {/* Lapels */}
    <line x1="10" y1="3.5" x2="10" y2="8" />
    <line x1="14" y1="3.5" x2="14" y2="8" />
    {/* Buttons */}
    <circle cx="10.5" cy="10" r="0.5" fill="currentColor" />
    <circle cx="10.5" cy="13" r="0.5" fill="currentColor" />
    <circle cx="10.5" cy="16" r="0.5" fill="currentColor" />
  </Svg>
);

// 8. Vestes — Vest (no sleeves)
export const IconVest: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 3 L7 5 L7 21 L17 21 L17 5 L15 3 Q12 5 9 3 Z" />
    {/* V-neck */}
    <path d="M9 3 L12 8 L15 3" />
    {/* Zipper */}
    <line x1="12" y1="8" x2="12" y2="21" />
  </Svg>
);

// 9. Softshell — Technical jacket with membrane lines
export const IconSoftshell: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 3 L3 7 L5 9 L6 7 L6 21 L18 21 L18 7 L19 9 L21 7 L17 3 L14 3 Q12 5 10 3 Z" />
    {/* Zipper */}
    <line x1="12" y1="5" x2="12" y2="21" />
    {/* Technical seam lines */}
    <path d="M6 12 L18 12" strokeDasharray="2 2" />
    <path d="M6 16 L18 16" strokeDasharray="2 2" />
  </Svg>
);

// 10. Fleece — Fluffy jacket with texture
export const IconFleece: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 3 L3 7 L5 9 L6 7 L6 21 L18 21 L18 7 L19 9 L21 7 L17 3 L14 3 Q12 5 10 3 Z" />
    {/* Zipper */}
    <line x1="12" y1="5" x2="12" y2="21" />
    {/* Fleece texture — wavy lines */}
    <path d="M7 11 Q8.5 10 10 11 Q11.5 12 13 11 Q14.5 10 16 11" />
    <path d="M7 15 Q8.5 14 10 15 Q11.5 16 13 15 Q14.5 14 16 15" />
  </Svg>
);

// 11. Bikses & Šorti — Pants
export const IconPants: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 3 L7 22 L11 22 L12 10 L13 22 L17 22 L17 3 Z" />
    {/* Waistband */}
    <line x1="7" y1="5" x2="17" y2="5" />
    {/* Fly */}
    <line x1="12" y1="5" x2="12" y2="10" />
  </Svg>
);

// 12. Kleitas & Svārki — Dress silhouette
export const IconDress: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M10 2 L9 6 L7 6 L5 22 L19 22 L17 6 L15 6 L14 2 Z" />
    {/* Waist */}
    <path d="M8 11 Q12 9 16 11" />
    {/* Neckline */}
    <path d="M10 2 Q12 4 14 2" />
  </Svg>
);

// 13. Lietus apģērbs — Raincoat with water drops
export const IconRaincoat: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 3 L3 7 L5 9 L6 7 L6 21 L18 21 L18 7 L19 9 L21 7 L17 3 L14 3 Q12 5 10 3 Z" />
    {/* Hood */}
    <path d="M10 3 Q10 0.5 12 0.5 Q14 0.5 14 3" />
    {/* Water drops */}
    <path d="M8 14 Q8 12.5 8.5 13.5 Q8 14.5 8 14" fill="currentColor" />
    <path d="M15 11 Q15 9.5 15.5 10.5 Q15 11.5 15 11" fill="currentColor" />
    <path d="M11 17 Q11 15.5 11.5 16.5 Q11 17.5 11 17" fill="currentColor" />
  </Svg>
);

// 14. Darba apģērbi — Workwear (helmet + overalls hint)
export const IconWorkwear: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Hard hat */}
    <path d="M6 10 L6 8 Q6 3 12 3 Q18 3 18 8 L18 10 Z" />
    <line x1="5" y1="10" x2="19" y2="10" />
    {/* Brim */}
    <line x1="4" y1="10.5" x2="20" y2="10.5" />
    {/* Overalls body hint */}
    <path d="M8 13 L8 22 L16 22 L16 13" />
    <path d="M8 13 L10 11 L14 11 L16 13" />
    {/* Strap */}
    <line x1="10" y1="11" x2="10" y2="15" />
    <line x1="14" y1="11" x2="14" y2="15" />
  </Svg>
);

// 15. Sportam — Running figure / athletic shirt
export const IconSport: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Athletic jersey with raglan sleeves */}
    <path d="M8 3 L3 6 L5 8 L7 6 L7 21 L17 21 L17 6 L19 8 L21 6 L16 3 Z" />
    {/* V-neck */}
    <path d="M8 3 L12 6 L16 3" />
    {/* Number */}
    <text x="12" y="15" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none" fontWeight="bold">7</text>
  </Svg>
);

// 16. Bērni — Small T-shirt (child size)
export const IconKids: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Smaller T-shirt */}
    <path d="M9 5 L6 7.5 L7.5 9 L8 8 L8 19 L16 19 L16 8 L16.5 9 L18 7.5 L15 5 L13.5 6.5 Q12 7.5 10.5 6.5 Z" />
    {/* Star decoration */}
    <path d="M12 11 L12.7 13 L14.5 13 L13 14.2 L13.5 16 L12 14.8 L10.5 16 L11 14.2 L9.5 13 L11.3 13 Z" fill="currentColor" stroke="none" />
  </Svg>
);

// 17. Cepures — Baseball cap (side view)
export const IconCap: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Cap dome */}
    <path d="M5 14 Q5 6 12 5 Q19 6 19 14" />
    {/* Brim */}
    <path d="M3 14 Q2 15 3 15.5 L13 17 Q14 16.5 13 14.5 L5 14" />
    {/* Crown line */}
    <line x1="5" y1="14" x2="19" y2="14" />
    {/* Button on top */}
    <circle cx="12" cy="5" r="0.7" fill="currentColor" />
  </Svg>
);

// 18. Šalles & Lakati — Scarf draped
export const IconScarf: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 4 Q8 3 10 5 Q12 7 12 10 L12 18 Q12 21 10 22 L9 22 Q7 21 8 18 L8 10 Q8 8 6 6 Z" />
    <path d="M18 4 Q16 3 14 5 Q12 7 12 10" />
    {/* Fringe */}
    <line x1="9" y1="22" x2="8.5" y2="23.5" />
    <line x1="10" y1="22" x2="10" y2="23.5" />
    <line x1="11" y1="22" x2="11.5" y2="23.5" />
  </Svg>
);

// 19. Somas — Backpack
export const IconBackpack: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Main body */}
    <rect x="6" y="6" width="12" height="15" rx="2" />
    {/* Top flap */}
    <path d="M8 6 Q8 3 12 3 Q16 3 16 6" />
    {/* Front pocket */}
    <rect x="8" y="13" width="8" height="5" rx="1" />
    {/* Straps */}
    <path d="M6 8 L4 8 L4 18 L6 18" />
    <path d="M18 8 L20 8 L20 18 L18 18" />
  </Svg>
);

// 20. Aksesuāri — Sunglasses
export const IconAccessories: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Left lens */}
    <rect x="3" y="9" width="7" height="5" rx="2" />
    {/* Right lens */}
    <rect x="14" y="9" width="7" height="5" rx="2" />
    {/* Bridge */}
    <path d="M10 11 Q12 9 14 11" />
    {/* Temples */}
    <line x1="3" y1="10" x2="1" y2="8" />
    <line x1="21" y1="10" x2="23" y2="8" />
  </Svg>
);

// 21. Audumu maisiņi — Tote bag with long handles
export const IconToteBag: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Bag body */}
    <rect x="5" y="9" width="14" height="13" rx="1" />
    {/* Left handle */}
    <path d="M8 9 Q8 3 10 3" />
    {/* Right handle */}
    <path d="M16 9 Q16 3 14 3" />
  </Svg>
);

// 22. Dvieļi — Towel folded
export const IconTowel: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Folded towel stack */}
    <rect x="4" y="14" width="16" height="6" rx="1" />
    <rect x="5" y="9" width="14" height="5" rx="1" />
    <rect x="6" y="5" width="12" height="4" rx="1" />
    {/* Stripe detail */}
    <line x1="4" y1="17" x2="20" y2="17" />
  </Svg>
);

// 23. Priekšauti — Apron
export const IconApron: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    {/* Neck loop */}
    <path d="M9 3 Q12 1 15 3" />
    {/* Bib */}
    <path d="M9 3 L9 9 L15 9 L15 3" />
    {/* Skirt */}
    <path d="M6 9 L9 9 L9 22 L15 22 L15 9 L18 9 L17 22 L7 22 Z" />
    {/* Waist tie */}
    <path d="M6 9 L4 10" />
    <path d="M18 9 L20 10" />
    {/* Pocket */}
    <rect x="10" y="14" width="4" height="3" rx="0.5" />
  </Svg>
);

// Pletkrekli — Knit sweater
export const IconKnitSweater: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 3 L4 6 L6 8 L7 6 L7 21 L17 21 L17 6 L18 8 L20 6 L16 3 Q12 5 8 3 Z" />
    <path d="M7 10 Q9 9 11 10 Q13 11 15 10 Q17 9 17 10" />
    <path d="M7 14 Q9 13 11 14 Q13 15 15 14 Q17 13 17 14" />
  </Svg>
);

// Adījumi — Knitted texture
export const IconKnit: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 3 L4 6 L6 8 L7 6 L7 21 L17 21 L17 6 L18 8 L20 6 L16 3 Q12 5 8 3 Z" />
    <path d="M9 9 L12 7 L15 9 L12 11 Z" />
    <path d="M9 13 L12 11 L15 13 L12 15 Z" />
    <path d="M9 17 L12 15 L15 17 L12 19 Z" />
  </Svg>
);

// Termoveļa — Thermal underwear (layered body)
export const IconThermal: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 3 L7 5 L7 12 L17 12 L17 5 L15 3 Q12 5 9 3 Z" />
    <path d="M8 13 L8 22 L11.5 22 L12 16 L12.5 22 L16 22 L16 13 Z" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </Svg>
);

// Darba apavi — Work boot
export const IconWorkBoot: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 8 L6 16 L4 16 L4 19 L20 19 L20 16 L18 14 L18 8 Q18 5 12 5 Q6 5 6 8 Z" />
    <line x1="4" y1="16" x2="20" y2="16" />
    <path d="M9 8 L9 14" />
    <path d="M12 8 L12 14" />
    <path d="M15 8 L15 14" />
  </Svg>
);

// Krūzes — Mug
export const IconMug: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="5" y="6" width="11" height="14" rx="2" />
    <path d="M16 9 Q20 9 20 13 Q20 17 16 17" />
    <line x1="5" y1="20" x2="16" y2="20" />
  </Svg>
);

// Sejas maskas — Face mask
export const IconFaceMask: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 9 Q4 7 8 6 L12 5 L16 6 Q20 7 20 9 L20 13 Q20 17 12 19 Q4 17 4 13 Z" />
    <line x1="4" y1="9" x2="2" y2="8" />
    <line x1="20" y1="9" x2="22" y2="8" />
    <line x1="6" y1="11" x2="18" y2="11" />
    <line x1="6" y1="14" x2="18" y2="14" />
  </Svg>
);

// Lietussargi — Umbrella
export const IconUmbrella: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 2 Q3 2 3 10 L12 10 L21 10 Q21 2 12 2 Z" />
    <line x1="12" y1="10" x2="12" y2="20" />
    <path d="M12 20 Q12 22 14 22" />
  </Svg>
);

// Master map: slug → icon component (matched to actual DB slugs)
export const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  "t-krekli": <IconTShirt />,
  "polo-krekli": <IconPolo />,
  "dzemperi": <IconHoodie />,
  "flisa-jakas": <IconFleece />,
  "virsjakas": <IconOvercoat />,
  "vestes": <IconVest />,
  "pletkrekli": <IconKnitSweater />,
  "adijumi": <IconKnit />,
  "bikses": <IconPants />,
  "cepures": <IconCap />,
  "somas": <IconBackpack />,
  "aksesuari": <IconAccessories />,
  "audumu-maisini": <IconToteBag />,
  "lietussargi": <IconUmbrella />,
  "darba-apgerbi": <IconWorkwear />,
  "termovela": <IconThermal />,
  "darba-apavi": <IconWorkBoot />,
  "sportam": <IconSport />,
  "berniem": <IconKids />,
  "kruzes": <IconMug />,
  "sejas-maskas": <IconFaceMask />,
};
