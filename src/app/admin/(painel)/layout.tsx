import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell admin={{ name: admin.name, email: admin.email }}>{children}</AdminShell>;
}
