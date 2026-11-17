import type { MetadataRoute } from "next";
import { listSitemapProducts } from "@/services/store.service";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "daily", priority: 0.8 },
  ];
  try {
    const products = await listSitemapProducts();
    for (const p of products) {
      entries.push({ url: `${base}/produto/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.6 });
    }
  } catch {
    /* sem banco: devolve só as páginas estáticas */
  }
  return entries;
}
