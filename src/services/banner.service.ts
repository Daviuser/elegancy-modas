import "server-only";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { BannerInput } from "@/lib/validations/banner";

export async function listBanners() {
  return db.banner.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, subtitle: true, linkUrl: true, imageUrl: true, active: true },
  });
}

export async function createBanner(input: BannerInput) {
  const last = await db.banner.aggregate({ _max: { position: true } });
  await db.banner.create({
    data: {
      title: input.title,
      subtitle: input.subtitle,
      linkUrl: input.linkUrl,
      imageUrl: input.imageUrl,
      imagePathname: input.imagePathname,
      position: (last._max.position ?? -1) + 1,
    },
  });
}

export async function setBannerActive(id: string, active: boolean) {
  const res = await db.banner.updateMany({ where: { id }, data: { active } });
  if (res.count === 0) throw new AppError("Banner não encontrado.");
}

/** Remove o registro e devolve a URL da imagem para limpeza no Blob. */
export async function deleteBanner(id: string) {
  const banner = await db.banner.findUnique({ where: { id }, select: { imageUrl: true, mobileImageUrl: true } });
  if (!banner) throw new AppError("Banner não encontrado.");
  await db.banner.delete({ where: { id } });
  return [banner.imageUrl, ...(banner.mobileImageUrl ? [banner.mobileImageUrl] : [])];
}

export async function getActiveBanner() {
  const now = new Date();
  return db.banner.findFirst({
    where: {
      active: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, subtitle: true, linkUrl: true, imageUrl: true },
  });
}
