import type { Language } from "@/i18n/translations";

// NOTE: All product/category data is now sourced from the Lovable Cloud
// database. These types remain for shared TS shapes used by UI components.
// The static demo arrays were removed — do NOT re-introduce hardcoded
// product/category content here.

export interface Product {
  id: string;
  name: Record<Language, string>;
  category: string;
  subcategory?: string;
  description: Record<Language, string>;
  longDescription?: Record<Language, string>;
  material?: string;
  colors: string[];
  colorHexCodes?: (string | null)[];
  sizes?: string[];
  minOrder?: number;
  images: string[];
  featured?: boolean;
  new?: boolean;
  retailPrice?: number;
  brand?: string;
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

export const categories: Category[] = [];
export const products: Product[] = [];
export const services: Service[] = [];
