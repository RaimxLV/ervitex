import { artworkMetadata } from "./artworkPolicy";

export async function uploadArtwork(file: File, requestId: string, key: string, fileId: string) {
  artworkMetadata(file.name, file.type, file.size);
  let response: Response;
  try {
    response = await fetch("/api/public/artwork-upload", { method: "POST", signal: AbortSignal.timeout(90000),
      headers: { "Content-Type": "application/octet-stream", "X-Request-Id": requestId, "X-Submission-Key": key, "X-File-Id": fileId, "X-File-Name": encodeURIComponent(file.name), "X-File-Type": file.type }, body: file });
  } catch { throw new Error("Savienojums pārtrūka faila augšupielādes laikā. Pieprasījums netiks izveidots atkārtoti; mēģini vēlreiz."); }
  let data: { path?: string; status?: string; error?: string };
  try { data = await response.json(); } catch { throw new Error("Failu pakalpojums neatbildēja. Mēģini vēlreiz vēlāk."); }
  if (!response.ok || !data.path) throw new Error(data.error || "Failu nevar pieņemt.");
  return { path: data.path, pending: data.status !== "clean" && data.status !== "validated" };
}