import lauraPhoto from "@/assets/team/laura-daukste.jpg";
import ilonaPhoto from "@/assets/team/ilona-romanovska.jpg";
import santaPhoto from "@/assets/team/santa-zvaigzne.jpg";
import justinePhoto from "@/assets/team/justine-strunka.jpg";

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
    photo: lauraPhoto,
  },
  {
    slug: "ilona",
    name: "Ilona Romanovska",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "ilona@ervitex.lv",
    phone: "+371 29494626",
    photo: ilonaPhoto,
  },
  {
    slug: "santa",
    name: "Santa Zvaigzne",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "santa.k@ervitex.lv",
    phone: "+371 67436899",
    photo: santaPhoto,
  },
  {
    slug: "justine",
    name: "Justīne Strunka",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "justine@ervitex.lv",
    phone: "+371 29725412",
    photo: justinePhoto,
  },
];

export const OFFICE_EMAIL = "birojs@ervitex.lv";
