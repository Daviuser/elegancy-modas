import "server-only";
import { del, put } from "@vercel/blob";
import { getEnv } from "@/config/env";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export type UploadFolder = "products" | "banners" | "store";

function getToken() {
  const token = getEnv().BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN não configurado.");
  return token;
}

/** Envia uma imagem validada ao Vercel Blob. Chamar apenas de Server Actions autenticadas. */
export async function uploadImage(file: File, folder: UploadFolder) {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Formato não suportado. Use JPG, PNG, WebP ou AVIF.");
  if (file.size > MAX_BYTES) throw new Error("A imagem deve ter no máximo 5 MB.");

  const blob = await put(`${folder}/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
    token: getToken(),
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteImage(urlOrPathname: string) {
  await del(urlOrPathname, { token: getToken() });
}

/** Remove arquivos do Blob sem derrubar a operação principal (limpeza best-effort). */
export async function deleteBlobsQuietly(urls: string[]) {
  if (urls.length === 0) return;
  try {
    await del(urls, { token: getToken() });
  } catch (error) {
    console.error("[blob cleanup]", error);
  }
}
