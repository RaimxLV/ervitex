import { grossFromNet } from "./vat";

/** Fixed sublimation print surcharge per mug (EUR, excl. VAT), added once via print rows — never baked into goods price. */
export const MUG_SUBLIMATION_PRINT_NET = 3;

const MUG_RE = /\bkr[uū]z(?:e|es|ēm|ei)\b|\bmugs?\b/i;
export const isSublimationMug = (source: string | null | undefined, name: string | null | undefined): boolean =>
  source === "etx" && MUG_RE.test(name || "");

export interface MugPricePair { plainNet: number; plainGross: number; printedNet: number; printedGross: number }
/** Goods price is the unprinted price; printed = goods + one surcharge. */
export const mugPricePair = (plainNet: number): MugPricePair => {
  const printedNet = Math.round((plainNet + MUG_SUBLIMATION_PRINT_NET) * 100) / 100;
  return { plainNet, plainGross: grossFromNet(plainNet), printedNet, printedGross: grossFromNet(printedNet) };
};

const A = "/__l5e/assets-v1/";
export interface MugColorSeed { id: string; name: string; hex: string; image: string }
export interface MugSeed {
  id: string; name_lv: string; name_en: string; retail_price: number; area: string;
  description_lv: string; description_en: string; gallery: string[]; colors: MugColorSeed[];
}

/** Source: old Ervitex site /index.php/kruzes (owner images, mirrored to own CDN). Prices are owner-provided net selling prices. */
export const SUBLIMATION_MUGS: MugSeed[] = [
  {
    id: "7e1a0c00-0000-4000-8000-000000000001", name_lv: "Balta krūze", name_en: "White mug", retail_price: 1.9, area: "210 × 85 mm",
    description_lv: "Keramikas cilindra veida krūze sublimācijas apdrukai. Tilpums 300 ml. Neierobežots krāsu skaits, apdrukas laukums 210 × 85 mm.",
    description_en: "Ceramic cylindrical mug for sublimation printing. Capacity 300 ml. Unlimited colours, print area 210 × 85 mm.",
    gallery: [A + "3976eee6-77d3-485a-9a71-80f9acdb7a4f/kruze-mug-blanc-800x800.jpg"],
    colors: [{ id: "7e1a0c00-0000-4000-8001-000000000001", name: "Balta", hex: "#ffffff", image: A + "3976eee6-77d3-485a-9a71-80f9acdb7a4f/kruze-mug-blanc-800x800.jpg" }],
  },
  {
    id: "7e1a0c00-0000-4000-8000-000000000002", name_lv: "DUO divkrāsu krūze", name_en: "DUO two-tone mug", retail_price: 2.4, area: "210 × 85 mm",
    description_lv: "Keramikas cilindra veida krūze ar krāsainu iekšpusi vai iekšpusi un osu. Tilpums 300 ml. Neierobežots krāsu skaits, apdrukas laukums 210 × 85 mm.",
    description_en: "Ceramic cylindrical mug with a coloured inside or inside and handle. Capacity 300 ml. Unlimited colours, print area 210 × 85 mm.",
    gallery: [A + "46f458fa-1065-4a8b-969e-1866c3313e72/kruze-kruzes.jpg"],
    colors: ([
      [1, "#0195db", "0e7244fb-d111-4027-9818-dd85bde7875c"], [2, "#55090b", "3aa00899-b146-4bb7-b699-f75d036e2b7b"],
      [3, "#015857", "89e9c31a-5475-4139-b962-7035085de94c"], [4, "#03080c", "39502a84-8c25-4f6a-bdf8-bbeda41a7c0e"],
      [5, "#b90b06", "907fbd6e-c768-4e9d-aecb-7f3c9ab80675"], [6, "#021b5a", "3799546c-efeb-4903-8fe1-884d06f3d391"],
      [7, "#8dc55d", "46abef58-160d-4bad-ab7a-251e0994244e"], [8, "#0c61c4", "c4a2e20c-2167-4a94-a71c-96fd6bc538a9"],
      [9, "#ed3f0d", "fa8d83ba-9e02-4051-a654-2d3d6926a9af"], [10, "#bc7789", "23c54249-9c8c-46f4-9a2a-6bf397c000ae"],
      [11, "#f7ca52", "66a6cb23-3fa5-4225-a5c4-f01dc1a4f189"], [12, "#e4cd66", "d26e23d2-b353-4396-9c55-61a7c9b65a53"],
      [18, "#b98e00", "fa698e3d-9c7f-47f9-9c3d-aeb73c133e25"], [25, "#5a131c", "e602fa6c-3c22-4e98-a58d-4ff74b7b5e1e"],
      [33, "#012e2e", "59cf2409-3bca-44e6-8f04-d704e79a8018"], [44, "#1da0ca", "c2252308-1904-462f-8694-83e4e679cfe7"],
      [52, "#7aaa46", "654d99a7-e96b-4067-8f2f-67c7392dbfb3"], [62, "#11122d", "d5f7f732-bfb9-4b02-a2a5-0d05a7059082"],
      [72, "#121119", "8d04590a-8907-4662-9f19-8d8e371ac3d1"], [86, "#ae0d0d", "03fc04aa-3842-4c13-af3c-41109a627260"],
      [96, "#c84720", "e8bede09-a3d6-4563-91ef-db8203c6aac1"], [105, "#c57da0", "70f3e108-af76-44ab-87c8-d31f3a6814c9"],
    ] as const).map(([n, hex, asset], i) => ({
      id: `7e1a0c00-0000-4000-8002-${String(i + 1).padStart(12, "0")}`,
      // Old site had no colour names; the label states only what the photo shows.
      name: `${n < 13 ? "Krāsaina iekšpuse" : "Krāsaina iekšpuse un osa"} Nr. ${n}`,
      hex, image: `${A}${asset}/kruze-${n}.jpg`,
    })),
  },
  {
    id: "7e1a0c00-0000-4000-8000-000000000003", name_lv: "Krūze ar zelta vai sudraba osu", name_en: "Mug with gold or silver handle", retail_price: 4.2, area: "210 × 80 mm",
    description_lv: "Keramikas cilindra veida krūze ar zelta vai sudraba krāsas osu. Tilpums 300 ml. Neierobežots krāsu skaits, apdrukas laukums 210 × 80 mm.",
    description_en: "Ceramic cylindrical mug with a gold or silver coloured handle. Capacity 300 ml. Unlimited colours, print area 210 × 80 mm.",
    gallery: [A + "9f232f15-2de9-4c9f-a88b-44287aaada97/kruze-kruze_zelta-sudraba-osa.jpg"],
    colors: [
      { id: "7e1a0c00-0000-4000-8003-000000000001", name: "Zelta osa", hex: "#d4a64a", image: A + "2c130216-72ec-4d54-bf02-3870bc4da503/kruze-kruze_zelta-osa.jpg" },
      { id: "7e1a0c00-0000-4000-8003-000000000002", name: "Sudraba osa", hex: "#c0c0c0", image: A + "3e2db590-0132-4b27-bb5a-cb79194c9a35/kruze-kruze_sudraba-osa6.jpg" },
    ],
  },
  {
    id: "7e1a0c00-0000-4000-8000-000000000004", name_lv: "Krāsu mainošā krūze", name_en: "Colour-changing mug", retail_price: 3, area: "210 × 85 mm",
    description_lv: "Keramikas cilindra veida krūze, kas karstumā maina krāsu — krūze kļūst balta un redzama apdruka. Tilpums 300 ml. Apdrukas laukums 210 × 85 mm.",
    description_en: "Ceramic cylindrical mug that changes colour when hot — it turns white and the print appears. Capacity 300 ml. Print area 210 × 85 mm.",
    gallery: [A + "b3262318-95d9-4aa8-b700-e0ec30143047/kruze-magic_mug_2.jpg"],
    colors: [{ id: "7e1a0c00-0000-4000-8004-000000000001", name: "Melna", hex: "#111111", image: A + "b3262318-95d9-4aa8-b700-e0ec30143047/kruze-magic_mug_2.jpg" }],
  },
];
