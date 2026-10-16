import { expect, it } from "vitest";
import { russellImagesForColor } from "./russellImages";
const black = "https://cdn.fruitoftheloom.eu/resources/images/product/0R265M/36/large/66135.jpg";
it("Black excludes campaigns and related models", () => {
 expect(russellImagesForColor("0R265M0", "Black", [black,"https://cdn.fruitoftheloom.eu/resources/images/product/0R265M/large/69537.jpg","https://cdn.fruitoftheloom.eu/resources/images/product/0R267M/36/large/69529.jpg"].map(url => ({url})))).toEqual([black]);
});
it("never substitutes Black for Burgundy", () => {
 expect(russellImagesForColor("0R265M0", "Burgundy", [{url:black}])).toEqual([]);
});
it("keeps explicitly labelled colour photos", () => {
 expect(russellImagesForColor("0R265M0", "Burgundy", [{url:"burgundy.jpg",color_name:"Burgundy"}])).toEqual(["burgundy.jpg"]);
});
