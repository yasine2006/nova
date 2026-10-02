import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./auth";

// ============================================================
//  Envoi d'images — Vercel Blob si le token est présent,
//  sinon l'admin colle une URL (l'image est alors chez lui :
//  Unsplash, Cloudinary, son propre CDN…).
// ============================================================

// L'image transite en base64 dans le corps de la requête : +33 % de poids.
// Vercel refuse tout corps > 4,5 Mo, donc 3 Mo binaire (~4 Mo encodé) est
// la vraie limite — pas 4 Mo, qui jamais n'atteindrait cette fonction.
const MAX_BYTES = 3 * 1024 * 1024; // 3 Mo
export const MAX_UPLOAD_BYTES = MAX_BYTES;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

function safeName(original: string): string {
  const rawExt = (original.split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const allowedExt = ["jpg", "jpeg", "png", "webp", "avif", "gif"].includes(
    rawExt,
  )
    ? rawExt
    : "jpg";
  const unique = crypto.randomUUID().slice(0, 12);
  return `portfolio/${unique}.${allowedExt}`;
}

export const uploadImageFn = createServerFn({ method: "POST" })
  .validator(
    (data: { filename: string; contentType: string; base64: string }) => data,
  )
  .handler(async ({ data }): Promise<{ url: string }> => {
    await requireAdmin();

    if (!ALLOWED.has(data.contentType)) {
      throw new Error("Format non supporté (JPEG, PNG, WebP, AVIF ou GIF).");
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) {
      throw new Error(
        "Upload indisponible : BLOB_READ_WRITE_TOKEN absent. Collez une URL d'image à la place.",
      );
    }

    const base64 = data.base64.replace(/^data:[^;]+;base64,/, "");
    const bytes = Buffer.from(base64, "base64");

    if (bytes.byteLength > MAX_BYTES) {
      throw new Error("Image trop lourde (3 Mo maximum).");
    }

    const { put } = await import("@vercel/blob");
    const blob = await put(safeName(data.filename), bytes, {
      access: "public",
      token,
      contentType: data.contentType,
      addRandomSuffix: true,
    });

    return { url: blob.url };
  });
