import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth/dal";
import { getStoreSettings } from "@/services/settings.service";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();
  return (
    <>
      <PageHeader title="Configurações" description="Dados da loja e WhatsApp que recebe os pedidos." />
      <SettingsForm settings={settings} />
    </>
  );
}
