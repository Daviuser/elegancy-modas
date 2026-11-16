import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Emblem } from "@/components/brand/Emblem";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="animate-rise w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Emblem size={120} priority className="h-auto w-24" />
          <h1 className="mt-4 font-display text-3xl font-light tracking-wide">Painel Elegancy</h1>
          <p className="mt-1 text-sm text-ink-soft">Acesso restrito à administração.</p>
        </div>
        <div className="mt-8 rounded-sm border border-beige-200 bg-white p-6 sm:p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
