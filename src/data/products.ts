export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  longDescription?: string;
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
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "tshirts", name: "T-Shirts", description: "Premium cotton and blended t-shirts for every occasion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", productCount: 42 },
  { id: "polo", name: "Polo Shirts", description: "Classic polo shirts with customizable embroidery options", image: "https://images.unsplash.com/photo-1625910513413-5fc42e2e9ac0?w=600&q=80", productCount: 28 },
  { id: "jackets", name: "Jackets & Outerwear", description: "Fleece, softshell, and workwear jackets for all conditions", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", productCount: 35 },
  { id: "workwear", name: "Workwear", description: "Durable professional clothing built for demanding environments", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80", productCount: 50 },
  { id: "bags", name: "Bags & Accessories", description: "Tote bags, backpacks, and promotional accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", productCount: 30 },
  { id: "caps", name: "Caps & Headwear", description: "Baseball caps, beanies, and custom headwear solutions", image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&q=80", productCount: 22 },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Cotton T-Shirt",
    category: "tshirts",
    description: "Ringspun combed cotton, 180 g/m². Perfect for screen printing and sublimation.",
    longDescription: "Our premium cotton t-shirt is crafted from 100% ringspun combed cotton at 180 g/m², providing exceptional softness and durability. The fabric is pre-shrunk and optimized for all decoration methods including screen printing, embroidery, and sublimation. Side-seamed construction ensures a modern, flattering fit.",
    material: "100% Ringspun Cotton",
    colors: ["White", "Black", "Navy", "Grey", "Red", "Royal Blue"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"],
    featured: true,
  },
  {
    id: "p2",
    name: "Performance Polo",
    category: "polo",
    description: "Moisture-wicking polo shirt, ideal for corporate branding and events.",
    longDescription: "Engineered with advanced moisture-wicking technology, this polo shirt keeps the wearer comfortable in any environment. The piqué knit fabric offers a refined texture while the reinforced collar maintains its shape wash after wash. Perfect for embroidered corporate logos.",
    material: "65% Polyester, 35% Cotton",
    colors: ["White", "Black", "Navy", "Burgundy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1625910513413-5fc42e2e9ac0?w=800&q=80"],
    featured: true,
  },
  {
    id: "p3",
    name: "Softshell Jacket",
    category: "jackets",
    description: "3-layer softshell with breathable membrane. Wind and water resistant.",
    longDescription: "This professional-grade softshell jacket features a 3-layer construction with a breathable TPU membrane. It offers wind resistance and water repellency while maintaining excellent breathability. Ideal for embroidered branding on the chest or back.",
    material: "96% Polyester, 4% Elastane",
    colors: ["Black", "Navy", "Grey"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    minOrder: 10,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    featured: true,
  },
  {
    id: "p4",
    name: "Hi-Vis Safety Vest",
    category: "workwear",
    description: "EN ISO 20471 certified high-visibility vest for professional safety.",
    material: "100% Polyester",
    colors: ["Yellow", "Orange"],
    sizes: ["S/M", "L/XL", "2XL/3XL"],
    minOrder: 50,
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"],
  },
  {
    id: "p5",
    name: "Cotton Tote Bag",
    category: "bags",
    description: "Eco-friendly 140 g/m² cotton tote bag. Large print area for branding.",
    material: "100% Natural Cotton",
    colors: ["Natural", "Black", "Navy"],
    minOrder: 50,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"],
    featured: true,
  },
  {
    id: "p6",
    name: "5-Panel Snapback Cap",
    category: "caps",
    description: "Structured 5-panel cap with flat peak. Embroidery-ready.",
    material: "100% Polyester",
    colors: ["Black", "Navy", "White", "Red"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=800&q=80"],
  },
  {
    id: "p7",
    name: "Fleece Zip Jacket",
    category: "jackets",
    description: "Full-zip anti-pill fleece jacket with side pockets. 280 g/m².",
    material: "100% Polyester Fleece",
    colors: ["Black", "Navy", "Grey", "Red"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    minOrder: 15,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"],
  },
  {
    id: "p8",
    name: "Heavyweight Hoodie",
    category: "tshirts",
    subcategory: "Sweatshirts",
    description: "350 g/m² brushed fleece hoodie with kangaroo pocket. Double-stitched.",
    material: "80% Cotton, 20% Polyester",
    colors: ["Black", "Navy", "Grey Heather", "Burgundy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    minOrder: 15,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    featured: true,
  },
  {
    id: "p9",
    name: "Cargo Work Trousers",
    category: "workwear",
    description: "Multi-pocket cargo trousers with knee pad inserts. Reinforced seams.",
    material: "65% Polyester, 35% Cotton",
    colors: ["Black", "Navy", "Khaki"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    minOrder: 20,
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"],
  },
  {
    id: "p10",
    name: "Sublimation Sport Jersey",
    category: "tshirts",
    subcategory: "Sportswear",
    description: "Lightweight polyester jersey designed for full-coverage sublimation printing.",
    material: "100% Polyester Interlock",
    colors: ["White"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    minOrder: 25,
    images: ["https://images.unsplash.com/photo-1580087433295-ab2600c1030e?w=800&q=80"],
    new: true,
  },
];

export const services: Service[] = [
  { id: "s1", title: "Screen Printing", description: "High-quality screen printing for bulk orders from 25 pieces. Durable, vibrant colors with long-lasting results.", icon: "Printer" },
  { id: "s2", title: "Embroidery", description: "Professional logo embroidery on caps, polos, jackets, and more. Premium thread with up to 15 color options.", icon: "Scissors" },
  { id: "s3", title: "Sublimation", description: "Full-color sublimation printing for all-over designs on polyester garments. Unlimited colors, no minimum.", icon: "Palette" },
  { id: "s4", title: "Custom Design", description: "Our in-house design team helps bring your brand vision to life with professional mockups and artwork.", icon: "PenTool" },
];
