import type { Metadata } from "next";
import { BannerManager } from "@/components/admin/BannerManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/dal";
import { listBanners } from "@/services/banner.service";

export const metadata: Metadata = { title: "Banners" };

export default async function BannersPage() {
  await requireAdmin();
  const banners = await listBanners();
  return (
    <>
      <PageHeader title="Banners" description="O banner ativo mais bem posicionado aparece no topo da loja." />
      <BannerManager banners={banners} />
    </>
  );
}
