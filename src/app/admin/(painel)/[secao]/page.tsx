import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { adminNav } from "@/config/admin-nav";
import { requireAdmin } from "@/lib/auth/dal";

type Props = { params: Promise<{ secao: string }> };

export const dynamicParams = false;

// Rota provisória. Cada seção ganhará sua própria pasta (ex.: /produtos/page.tsx),
// que tem prioridade sobre esta rota dinâmica.
export function generateStaticParams() {
  return adminNav.filter((i) => i.slug).map((i) => ({ secao: i.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { secao } = await params;
  return { title: adminNav.find((i) => i.slug === secao)?.label };
}

export default async function SectionPage({ params }: Props) {
  await requireAdmin();
  const { secao } = await params;
  const item = adminNav.find((i) => i.slug === secao);
  if (!item) notFound();
  return <ComingSoon title={item.label} description={item.description} />;
}
