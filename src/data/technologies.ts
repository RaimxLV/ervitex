import screen1 from "@/assets/services/screen-printing-1.jpg";
import screen2 from "@/assets/services/screen-printing-2.jpg";
import screen3 from "@/assets/services/screen-printing-3.jpg";
import screen4 from "@/assets/services/screen-printing-4.jpg";
import dtf1 from "@/assets/services/dtf-1.jpg";
import dtf2 from "@/assets/services/dtf-2.jpg";
import dtf3 from "@/assets/services/dtf-3.jpg";
import dtf4 from "@/assets/services/dtf-4.jpg";
import emb1 from "@/assets/services/embroidery-1.jpg";
import emb2 from "@/assets/services/embroidery-2.jpg";
import emb3 from "@/assets/services/embroidery-3.jpg";
import emb4 from "@/assets/services/embroidery-4.jpg";
import subA1 from "@/assets/services/sub-1.jpg.asset.json";
import subA2 from "@/assets/services/sub-2.jpg.asset.json";
import subA3 from "@/assets/services/sub-3.jpg.asset.json";
import subA4 from "@/assets/services/sub-4.jpg.asset.json";
import subA5 from "@/assets/services/sub-5.jpg.asset.json";
import subA6 from "@/assets/services/sub-6.jpg.asset.json";
import subA7 from "@/assets/services/sub-7.jpg.asset.json";
import subA8 from "@/assets/services/sub-8.jpg.asset.json";
import subA9 from "@/assets/services/sub-9.jpg.asset.json";

export type Tech = {
  id: string;
  name: { lv: string; en: string };
  tagline: { lv: string; en: string };
  short: { lv: string; en: string };
  desc: { lv: string; en: string };
  features: { lv: string; en: string }[];
  specs: { label: { lv: string; en: string }; value: { lv: string; en: string } }[];
  images: string[];
};

export const techs: Tech[] = [
  {
    id: "sietspiede",
    name: { lv: "Sietspiede", en: "Screen printing" },
    tagline: { lv: "Lielām tirāžām", en: "For large runs" },
    short: {
      lv: "Ekonomiskākā izvēle lielām tirāžām — spilgta, mīksta un ļoti izturīga apdruka.",
      en: "The most economical choice for large runs — vivid, soft and highly durable prints.",
    },
    desc: {
      lv: "Klasiskā un ekonomiskākā tehnoloģija lielām tirāžām. Katrai krāsai tiek sagatavots atsevišķs siets, tāpēc rezultāts ir spilgts, mīksts uz taustes un ļoti izturīgs pret mazgāšanu. Ideāla izvēle T-krekliem, hūdijiem un pasākumu apģērbam.",
      en: "The classic and most cost-effective technology for large runs. A separate screen is prepared for every colour, so the result is vivid, soft to the touch and extremely wash-resistant. Ideal for tees, hoodies and event apparel.",
    },
    features: [
      { lv: "Izdevīgi no 30 gab.", en: "Cost-effective from 30 pcs" },
      { lv: "Līdz 6 krāsām vienā apdrukā", en: "Up to 6 colours per print" },
      { lv: "Mīksta, elastīga apdruka", en: "Soft, flexible print" },
      { lv: "Pantone krāsu saskaņošana", en: "Pantone colour matching" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "30 gab.", en: "30 pcs" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "5–8 darba dienas", en: "5–8 business days" } },
      { label: { lv: "Faili", en: "Files" }, value: { lv: "AI, EPS, PDF (vektors)", en: "AI, EPS, PDF (vector)" } },
    ],
    images: [screen1, screen2, screen3, screen4],
  },
  {
    id: "dtf",
    name: { lv: "DTF druka", en: "DTF printing" },
    tagline: { lv: "Fotogrāfiskai detaļai", en: "For photographic detail" },
    short: {
      lv: "Digitāla druka bez krāsu ierobežojuma — arī no viena gabala un uz tumša auduma.",
      en: "Digital printing with no colour limit — even one-offs and on dark fabric.",
    },
    desc: {
      lv: "Digitālā druka uz plēves, kas tiek pārnesta ar presi. Bez krāsu skaita ierobežojuma — gradienti, fotogrāfijas un smalkas detaļas izskatās perfekti pat uz tumša auduma. Piemērota mazām tirāžām un personalizācijai pa vienam gabalam.",
      en: "Digital film printing transferred with a heat press. No colour limit — gradients, photos and fine detail look perfect even on dark fabric. Perfect for small runs and one-off personalisation.",
    },
    features: [
      { lv: "No 1 gabala", en: "From a single piece" },
      { lv: "Neierobežots krāsu skaits", en: "Unlimited colours" },
      { lv: "Der arī sintētikai un jakām", en: "Works on synthetics and jackets" },
      { lv: "Vārdi un numuri komandām", en: "Names and numbers for teams" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "1 gab.", en: "1 pc" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "2–5 darba dienas", en: "2–5 business days" } },
      { label: { lv: "Faili", en: "Files" }, value: { lv: "PNG 300 dpi, PDF, AI", en: "PNG 300 dpi, PDF, AI" } },
    ],
    images: [dtf1, dtf2, dtf3, dtf4],
  },
  {
    id: "izsusana",
    name: { lv: "Izšūšana", en: "Embroidery" },
    tagline: { lv: "Premium izskatam", en: "For a premium look" },
    short: {
      lv: "Reljefs diegu dizains, kas korporatīvajam apģērbam piešķir premium izskatu.",
      en: "Textured thread design that gives corporate apparel a premium look.",
    },
    desc: {
      lv: "Vissolīdākais risinājums korporatīvajam apģērbam. Dizains tiek digitalizēts un izšūts ar diegu — reljefs, taustāms un praktiski nenodilstošs. Lieliski strādā uz cepurēm, polo krekliem, jakām un darba apģērba.",
      en: "The most solid solution for corporate apparel. The design is digitised and stitched with thread — textured, tangible and virtually indestructible. Works great on caps, polos, jackets and workwear.",
    },
    features: [
      { lv: "No 10 gab.", en: "From 10 pcs" },
      { lv: "Līdz 12 diegu krāsām", en: "Up to 12 thread colours" },
      { lv: "3D / puff izšūšana un uzšuves", en: "3D / puff embroidery and patches" },
      { lv: "Bezmaksas digitalizācijas pārbaude", en: "Free digitising check" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "10 gab.", en: "10 pcs" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "5–10 darba dienas", en: "5–10 business days" } },
      { label: { lv: "Ieteicamais izmērs", en: "Recommended size" }, value: { lv: "līdz 25 × 25 cm", en: "up to 25 × 25 cm" } },
    ],
    images: [emb1, emb2, emb3, emb4],
  },
  {
    id: "sublimacija",
    name: { lv: "Sublimācija", en: "Sublimation" },
    tagline: { lv: "Sporta un pilnkrāsu risinājums", en: "Sport & all-over solution" },
    short: {
      lv: "Krāsa iekļūst šķiedrā — pilnkrāsu risinājums sporta formām un suvenīriem.",
      en: "Ink bonds inside the fibre — full-colour solution for sports kits and gifts.",
    },
    desc: {
      lv: "Krāsa iekļūst pašā šķiedrā, tāpēc apdruka nav ne saredzama, ne sajūtama — tā nekad neplaisā un neatlīmējas. Piemērota gaišam poliestera audumam: sporta formām, pilnkrāsu dizainiem, krūzēm un suvenīriem.",
      en: "The ink bonds inside the fibre, so the print cannot be seen or felt — it never cracks or peels. Suited to light polyester fabrics: sports kits, all-over designs, mugs and gifts.",
    },
    features: [
      { lv: "Apdruka pa visu virsmu", en: "All-over printing" },
      { lv: "Neizbalo un neplaisā", en: "Never fades or cracks" },
      { lv: "Elpojošs — nemaina auduma īpašības", en: "Breathable — fabric stays as it is" },
      { lv: "Arī krūzes un suvenīri", en: "Also mugs and gifts" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "1 gab.", en: "1 pc" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "3–7 darba dienas", en: "3–7 business days" } },
      { label: { lv: "Materiāls", en: "Material" }, value: { lv: "Poliesters, gaišas krāsas", en: "Polyester, light colours" } },
    ],
    images: [sub1, sub2, sub3, sub4],
  },
];

export const getTech = (id?: string) => techs.find((t) => t.id === id);
