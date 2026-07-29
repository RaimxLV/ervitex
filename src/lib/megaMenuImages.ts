import imgJacket from "@/assets/menu/jacket.jpg";
import imgHoodie from "@/assets/menu/hoodie.jpg";
import imgBackpack from "@/assets/menu/backpack.jpg";
import imgBottle from "@/assets/menu/bottle.jpg";
import imgBag from "@/assets/menu/bag.jpg";
import imgCap from "@/assets/menu/cap.jpg";
import imgPolo from "@/assets/menu/polo.jpg";
import imgSweater from "@/assets/menu/sweater.jpg";
import imgTshirt from "@/assets/menu/tshirt.jpg";
import imgPants from "@/assets/menu/pants.jpg";
import imgShorts from "@/assets/menu/shorts.jpg";
import imgVest from "@/assets/menu/vest.jpg";
import imgShirt from "@/assets/menu/shirt.jpg";
import imgWorkwear from "@/assets/menu/workwear.jpg";
import imgApron from "@/assets/menu/apron.jpg";
import imgGloves from "@/assets/menu/gloves.jpg";
import imgTowel from "@/assets/menu/towel.jpg";
import imgLaptopBag from "@/assets/menu/laptopbag.jpg";
import imgBusinessBag from "@/assets/menu/businessbag.jpg";
import imgTravelAcc from "@/assets/menu/travelacc.jpg";
import imgTote from "@/assets/menu/tote.jpg";
import imgMug from "@/assets/menu/mug.jpg";
import imgNotebook from "@/assets/menu/notebook.jpg";
import imgHeadphones from "@/assets/menu/headphones.jpg";
import imgUmbrella from "@/assets/menu/umbrella.jpg";
import imgKeychain from "@/assets/menu/keychain.jpg";
import imgScarf from "@/assets/menu/scarf.jpg";
import imgSocks from "@/assets/menu/socks.jpg";
import imgWaistbag from "@/assets/menu/waistbag.jpg";

const SHOES_URL =
  "https://images.nwgmedia.com/highres/230335/1906960-999982_V175_Fuseknit_Front.jpg";

// Fallback images keyed by english label (case-insensitive)
export const FALLBACK_IMAGES: Record<string, string> = {
  "t-shirts": imgTshirt,
  polos: imgPolo,
  hoodies: imgHoodie,
  sweatshirts: imgSweater,
  jackets: imgJacket,
  vests: imgVest,
  shirts: imgShirt,
  trousers: imgPants,
  shorts: imgShorts,
  workwear: imgWorkwear,
  shoes: SHOES_URL,
  "caps & hats": imgCap,
  gloves: imgGloves,
  aprons: imgApron,
  towels: imgTowel,
  bags: imgBag,
  backpacks: imgBackpack,
  "laptop bags": imgLaptopBag,
  "business bags": imgBusinessBag,
  "travel accessories": imgTravelAcc,
  "tote bags": imgTote,
  bottles: imgBottle,
  mugs: imgMug,
  notebooks: imgNotebook,
  audio: imgHeadphones,
  umbrellas: imgUmbrella,
  keychains: imgKeychain,
};

export const resolveMenuImage = (
  imageUrl: string | null | undefined,
  labelEn: string,
): string | null => {
  if (imageUrl && imageUrl.trim()) return imageUrl;
  return FALLBACK_IMAGES[labelEn.trim().toLowerCase()] ?? null;
};
