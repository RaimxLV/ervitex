import lauraPhotoAsset from "@/assets/team/laura-daukste.png.asset.json";
import ilonaPhotoAsset from "@/assets/team/ilona-romanovska.png.asset.json";
import santaPhotoAsset from "@/assets/team/santa-zvaigzne.png.asset.json";
import justinePhotoAsset from "@/assets/team/justine-strunka.png.asset.json";

export interface ProjectManager {
  slug: string;
  name: string;
  title: { lv: string; en: string };
  email: string;
  phone: string;
  photo: string;
}

export const PROJECT_MANAGERS: ProjectManager[] = [
  {
    slug: "laura",
    name: "Laura Daukšte",
    title: { lv: "Iepirkumu un pārdošanas daļas vadītāja", en: "Head of Purchasing and Sales" },
    email: "laura@ervitex.lv",
    phone: "+371 26164635",
    photo: lauraPhotoAsset.url,
  },
  {
    slug: "ilona",
    name: "Ilona Romanovska",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "ilona@ervitex.lv",
    phone: "+371 29494626",
    photo: ilonaPhotoAsset.url,
  },
  {
    slug: "santa",
    name: "Santa Zvaigzne",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "santa.k@ervitex.lv",
    phone: "+371 67436899",
    photo: santaPhotoAsset.url,
  },
  {
    slug: "justine",
    name: "Justīne Strunka",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "justine@ervitex.lv",
    phone: "+371 29725412",
    photo: justinePhotoAsset.url,
  },
];

export const OFFICE_EMAIL = "birojs@ervitex.lv";
