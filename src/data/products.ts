import type { Language } from "@/i18n/translations";

export interface Product {
  id: string;
  name: Record<Language, string>;
  category: string;
  subcategory?: string;
  description: Record<Language, string>;
  longDescription?: Record<Language, string>;
  material?: string;
  colors: string[];
  sizes?: string[];
  minOrder?: number;
  images: string[];
  featured?: boolean;
  new?: boolean;
}

export interface Category {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  image: string;
  productCount: number;
}

export interface Service {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
}

export const categories: Category[] = [
  { id: "tshirts", name: { lv: "T-krekli", en: "T-Shirts" }, description: { lv: "Premium kokvilnas un jauktu šķiedru T-krekli", en: "Premium cotton and blended t-shirts" }, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", productCount: 42 },
  { id: "polo", name: { lv: "Polo krekli", en: "Polo Shirts" }, description: { lv: "Klasiskii polo krekli ar izšūšanas iespējām", en: "Classic polo shirts with embroidery options" }, image: "https://images.unsplash.com/photo-1625910513413-5fc42e2e9ac0?w=600&q=80", productCount: 28 },
  { id: "jackets", name: { lv: "Virsjakas", en: "Jackets & Outerwear" }, description: { lv: "Flīša, softshell un darba jakas visiem apstākļiem", en: "Fleece, softshell, and workwear jackets" }, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", productCount: 35 },
  { id: "workwear", name: { lv: "Darba apģērbi", en: "Workwear" }, description: { lv: "Izturīgs profesionāls apģērbs prasīgiem apstākļiem", en: "Durable professional clothing for demanding environments" }, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80", productCount: 50 },
  { id: "sweaters", name: { lv: "Džemperi", en: "Sweatshirts & Hoodies" }, description: { lv: "Džemperi un hūdiji ar un bez rāvējslēdzēja", en: "Sweatshirts and hoodies with and without zipper" }, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", productCount: 30 },
  { id: "bags", name: { lv: "Somas un maisiņi", en: "Bags & Totes" }, description: { lv: "Audumu maisiņi, mugursomas un reklāmas aksesuāri", en: "Tote bags, backpacks, and promotional accessories" }, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", productCount: 30 },
  { id: "caps", name: { lv: "Cepures", en: "Caps & Headwear" }, description: { lv: "Beisbola cepures, kepītes un pielāgoti galvassegas risinājumi", en: "Baseball caps, beanies, and custom headwear" }, image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&q=80", productCount: 22 },
  { id: "accessories", name: { lv: "Aksesuāri", en: "Accessories" }, description: { lv: "Lietussargi, šalles, krūzes un citi reklāmas materiāli", en: "Umbrellas, scarves, mugs, and other promotional items" }, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", productCount: 40 },
  { id: "sportswear", name: { lv: "Sportam", en: "Sportswear" }, description: { lv: "Sporta apģērbs ar sublimācijas un DTF apdruku", en: "Sportswear with sublimation and DTF printing" }, image: "https://images.unsplash.com/photo-1580087433295-ab2600c1030e?w=600&q=80", productCount: 25 },
];

export const products: Product[] = [
  {
    id: "p1",
    name: { lv: "Premium kokvilnas T-krekls", en: "Premium Cotton T-Shirt" },
    category: "tshirts",
    description: { lv: "Ringspun kokvilna, 180 g/m². Ideāls sietspiedes un sublimācijas apdrukam.", en: "Ringspun combed cotton, 180 g/m². Perfect for screen printing and sublimation." },
    longDescription: {
      lv: "Mūsu premium kokvilnas T-krekls ir izgatavots no 100% ringspun ķemmētās kokvilnas ar blīvumu 180 g/m², nodrošinot izcilu maigumu un izturību. Audums ir iepriekš sarauts un optimizēts visām dekorēšanas metodēm, ieskaitot sietspiedi, izšūšanu un sublimāciju.",
      en: "Our premium cotton t-shirt is crafted from 100% ringspun combed cotton at 180 g/m², providing exceptional softness and durability. Pre-shrunk and optimized for all decoration methods.",
    },
    material: "100% Ringspun Cotton",
    colors: ["White", "Black", "Navy", "Grey", "Red", "Royal Blue"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
    featured: true,
  },
  {
    id: "p2",
    name: { lv: "Performance polo krekls", en: "Performance Polo" },
    category: "polo",
    description: { lv: "Mitrumu aizvadoša polo krekls, ideāls korporatīvai zīmolēšanai.", en: "Moisture-wicking polo shirt, ideal for corporate branding." },
    material: "65% Polyester, 35% Cotton",
    colors: ["White", "Black", "Navy", "Burgundy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1625910513413-5fc42e2e9ac0?w=800&q=80"],
    featured: true,
  },
  {
    id: "p3",
    name: { lv: "Softshell jaka", en: "Softshell Jacket" },
    category: "jackets",
    description: { lv: "3 slāņu softshell ar elpojošu membrānu. Vēja un ūdens izturīga.", en: "3-layer softshell with breathable membrane. Wind and water resistant." },
    material: "96% Polyester, 4% Elastane",
    colors: ["Black", "Navy", "Grey"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    minOrder: 10,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    featured: true,
  },
  {
    id: "p4",
    name: { lv: "Paaugstinātas redzamības veste", en: "Hi-Vis Safety Vest" },
    category: "workwear",
    description: { lv: "EN ISO 20471 sertificēta paaugstinātas redzamības veste.", en: "EN ISO 20471 certified high-visibility vest." },
    material: "100% Polyester",
    colors: ["Yellow", "Orange"],
    sizes: ["S/M", "L/XL", "2XL/3XL"],
    minOrder: 50,
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"],
  },
  {
    id: "p5",
    name: { lv: "Kokvilnas auduma maisiņš", en: "Cotton Tote Bag" },
    category: "bags",
    description: { lv: "Ekoloģisks 140 g/m² kokvilnas maisiņš. Liela apdrukas virsma.", en: "Eco-friendly 140 g/m² cotton tote bag. Large print area." },
    material: "100% Natural Cotton",
    colors: ["Natural", "Black", "Navy"],
    minOrder: 50,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"],
    featured: true,
  },
  {
    id: "p6",
    name: { lv: "Beisbola cepure", en: "5-Panel Snapback Cap" },
    category: "caps",
    description: { lv: "Strukturēta 5 paneļu cepure. Gatava izšūšanai.", en: "Structured 5-panel cap. Embroidery-ready." },
    material: "100% Polyester",
    colors: ["Black", "Navy", "White", "Red"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=800&q=80"],
  },
  {
    id: "p7",
    name: { lv: "Flīša jaka", en: "Fleece Zip Jacket" },
    category: "jackets",
    description: { lv: "Pilnas garuma rāvējslēdzēja anti-pill flīša jaka, 280 g/m².", en: "Full-zip anti-pill fleece jacket, 280 g/m²." },
    material: "100% Polyester Fleece",
    colors: ["Black", "Navy", "Grey", "Red"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    minOrder: 15,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"],
  },
  {
    id: "p8",
    name: { lv: "Smagais hūdijs", en: "Heavyweight Hoodie" },
    category: "sweaters",
    description: { lv: "350 g/m² flīša hūdijs ar ķengura kabatu. Dubultšuve.", en: "350 g/m² brushed fleece hoodie with kangaroo pocket." },
    material: "80% Cotton, 20% Polyester",
    colors: ["Black", "Navy", "Grey Heather", "Burgundy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    minOrder: 15,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    featured: true,
  },
  {
    id: "p9",
    name: { lv: "Darba bikses ar kabatām", en: "Cargo Work Trousers" },
    category: "workwear",
    description: { lv: "Daudzfunkcionālas darba bikses ar ceļgalu ieliktņiem.", en: "Multi-pocket cargo trousers with knee pad inserts." },
    material: "65% Polyester, 35% Cotton",
    colors: ["Black", "Navy", "Khaki"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    minOrder: 20,
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"],
  },
  {
    id: "p10",
    name: { lv: "Sublimācijas sporta krekls", en: "Sublimation Sport Jersey" },
    category: "sportswear",
    description: { lv: "Viegla poliestera krekls pilnas sublimācijas apdrukam.", en: "Lightweight polyester jersey for full sublimation printing." },
    material: "100% Polyester Interlock",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1580087433295-ab2600c1030e?w=800&q=80"],
    new: true,
  },
];

export const services: Service[] = [
  { id: "s1", title: { lv: "DTF un Termodruka", en: "DTF & Heat Transfer" }, description: { lv: "No viena eksemplāra līdz personalizētai tirāžai — uz jebkura auduma.", en: "From a single piece to personalized runs — on any fabric." }, icon: "Layers" },
  { id: "s2", title: { lv: "Sietspiede", en: "Screen Printing" }, description: { lv: "Industriāla kvalitāte lieliem apjomiem ar Pantone® precizitāti.", en: "Industrial quality for large volumes with Pantone® precision." }, icon: "Grid3x3" },
  { id: "s3", title: { lv: "Izšūšana", en: "Embroidery" }, description: { lv: "Ekskluzīvs un ilgmūžīgs risinājums premium apģērbam.", en: "Exclusive and long-lasting solution for premium garments." }, icon: "Scissors" },
  { id: "s4", title: { lv: "Sublimācija", en: "Sublimation" }, description: { lv: "Neierobežots dizains sportam un reklāmai uz poliestera.", en: "Unlimited designs for sport and promotion on polyester." }, icon: "Palette" },
];
