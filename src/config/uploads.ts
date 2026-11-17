/** Regras de upload compartilhadas entre navegador e servidor (sem segredos). */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 10;
export const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
export const PRODUCT_BLOB_PREFIX = "products/";
