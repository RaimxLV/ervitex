import { expect, it } from "vitest";
import { russellImageColor, russellImagesForColor } from "./russellImages";
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

it("restores Bottle Green photos without Black", () => {
 const green = "https://cdn.fruitoftheloom.eu/resources/images/product/0R265M/38/large/66143.jpg";
 expect(russellImagesForColor("0R265M0", "Bottle Green", [{url:black,color_name:"Black"},{url:green,color_name:"Bottle Green"}])).toEqual([green]);
});

it("R265B six supplier colours each retain only their own same-model photo", () => {
 const data = [["Black","36","65874"],["Bottle Green","38","65960"],["Bright Royal","BH","65931"],["Burgundy","41","65970"],["Classic Red","CR","65863"],["French Navy","FN","65873"]];
 const rows = data.map(([color_name,code,id]) => ({ color_name, url: `https://cdn.fruitoftheloom.eu/resources/images/product/0R265B/${code}/large/${id}.jpg` }));
 expect(new Set(rows.map(row=>row.color_name)).size).toBe(6);
 for (const row of rows) expect(russellImagesForColor("0R265B0", row.color_name, rows)).toEqual([row.url]);
});
it("cards classify non-black photos and exclude related models", () => {
 expect(russellImageColor("0R265M0", {url:"https://cdn.fruitoftheloom.eu/resources/images/product/0R265M/41/large/66175.jpg",color_name:"Burgundy"})).toBe("Burgundy");
 expect(russellImageColor("0R265M0", {url:"https://cdn.fruitoftheloom.eu/resources/images/product/0R267M/41/large/69529.jpg",color_name:"Burgundy"})).toBeNull();
});
