export async function prepareTeamPhoto(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
    throw new Error("Izvēlies JPG, PNG, WebP vai AVIF foto");
  }
  if (file.size > 20 * 1024 * 1024) throw new Error("Foto pārsniedz 20 MB");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Neizdevās sagatavot foto");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Neizdevās sagatavot foto")),
      "image/webp", 0.85,
    ));
  } finally { bitmap.close(); }
}