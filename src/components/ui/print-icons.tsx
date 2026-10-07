import { createLucideIcon } from "lucide-react";

/** Print-specific symbols share Lucide's 24-unit viewbox and stroke conventions. */
export const GarmentBatch = createLucideIcon("GarmentBatch", [
  ["path", { d: "M8 3h3l1 2 1-2h3l4 3-2 4-2-1v12H8V9l-2 1-2-4 4-3Z", key: "shirt" }],
  ["path", { d: "M2 12v8M22 12v8M10 15h4M10 18h4", key: "batch" }],
]);
export const PersonalisedShirt = createLucideIcon("PersonalisedShirt", [
  ["path", { d: "m8 3-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3c0 4-8 4-8 0Z", key: "shirt" }],
  ["path", { d: "M10 11h4M11 14h2v4M10 18h4", key: "print" }],
]);
export const ThreadSpools = createLucideIcon("ThreadSpools", [
  ["path", { d: "M3 4h6M3 20h6M4 4v16M8 4v16M4 8h4M4 12h4M4 16h4M15 4h6M15 20h6M16 4v16M20 4v16M16 8h4M16 12h4M16 16h4", key: "spools" }],
  ["path", { d: "M9 20c4 0 2-6 6-6", key: "thread" }],
]);
export const EmbroideredPatch = createLucideIcon("EmbroideredPatch", [
  ["rect", { x: "3", y: "4", width: "18", height: "16", rx: "4", key: "patch" }],
  ["rect", { x: "6", y: "7", width: "12", height: "10", rx: "2", strokeDasharray: "1 2", key: "stitches" }],
  ["path", { d: "m9 13 2 2 4-5", key: "mark" }],
]);
export const RaisedStitches = createLucideIcon("RaisedStitches", [
  ["path", { d: "m3 17 9 4 9-4M3 13l9 4 9-4M5 9l7-5 7 5-7 4-7-4Z", key: "relief" }],
  ["path", { d: "m8 7 4 3M11 5l4 3M5 9v4M19 9v4", key: "stitches" }],
]);
export const FabricWeave = createLucideIcon("FabricWeave", [
  ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", key: "fabric" }],
  ["path", { d: "M7 3v18M12 3v18M17 3v18M3 7h18M3 12h18M3 17h18", key: "weave" }],
]);
export const TransferFilm = createLucideIcon("TransferFilm", [
  ["path", { d: "M5 3h12a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3V3ZM8 18V6h12M5 21h12a3 3 0 0 0 3-3", key: "roll" }],
  ["path", { d: "m11 14 2-5 2 5M12 12h2", key: "print" }],
]);
export const FlockTexture = createLucideIcon("FlockTexture", [
  ["path", { d: "m3 17 9 4 9-4M3 13l9 4 9-4M5 12V8M9 14V7M13 14V6M17 12V5M21 10V6", key: "pile" }],
]);
export const ReflectiveFilm = createLucideIcon("ReflectiveFilm", [
  ["path", { d: "m3 17 9 4 9-4M3 13l9 4 9-4M4 3l5 7H6M9 10V7M15 10l5-7h-3M20 3v3", key: "reflection" }],
]);