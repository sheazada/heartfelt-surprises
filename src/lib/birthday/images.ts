export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/avif"];
export const MAX_FILE_BYTES = 12 * 1024 * 1024; // pre-compression guard

export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return `"${file.name}" is not an image file.`;
  if (file.size > MAX_FILE_BYTES) return `"${file.name}" is larger than 12MB.`;
  return null;
}

/**
 * Downscale + re-encode on the client so uploads stay small on mobile connections.
 * Falls back to the original file if the browser can't decode it.
 */
export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  if (typeof window === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;
    if (blob.size >= file.size && file.type === "image/jpeg") return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
