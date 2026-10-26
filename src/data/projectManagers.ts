import lauraPhoto from "@/assets/team/team-laura.webp.asset.json";
import ilonaPhoto from "@/assets/team/team-ilona.webp.asset.json";
import santaPhoto from "@/assets/team/team-santa.webp.asset.json";
import justinePhoto from "@/assets/team/team-justine.webp.asset.json";

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
    photo: `https://www.ervitex.lv${lauraPhoto.url}`,
  },
  {
    slug: "ilona",
    name: "Ilona Romanovska",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "ilona@ervitex.lv",
    phone: "+371 29494626",
    photo: `https://www.ervitex.lv${ilonaPhoto.url}`,
  },
  {
    slug: "santa",
    name: "Santa Zvaigzne",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "santa.k@ervitex.lv",
    phone: "+371 67436899",
    photo: `https://www.ervitex.lv${santaPhoto.url}`,
  },
  {
    slug: "justine",
    name: "Justīne Strunka",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "justine@ervitex.lv",
    phone: "+371 29725412",
    photo: `https://www.ervitex.lv${justinePhoto.url}`,
  },
];

export const OFFICE_EMAIL = "birojs@ervitex.lv";
