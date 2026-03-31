/** Kamera / dosya seçiminden base64 çıkarır; büyük görsellerde basit yeniden boyutlandırma. */

export async function fileToCompressedBase64(
  file: File,
  maxEdge = 1280,
): Promise<{ base64: string; mimeType: string }> {
  const mimeType = file.type || "image/jpeg";
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas kullanılamıyor.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const outType = mimeType.includes("png") ? "image/png" : "image/jpeg";
  const dataUrl = canvas.toDataURL(outType, 0.85);
  const base64 = dataUrl.split(",")[1] ?? "";
  return { base64, mimeType: outType };
}
