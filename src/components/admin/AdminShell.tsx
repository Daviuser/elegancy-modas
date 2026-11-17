"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { Emblem } from "@/components/brand/Emblem";
import { adminNav } from "@/config/admin-nav";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type Props = { admin: { name: string; email: string }; children: React.ReactNode };

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Navegação do painel" className="flex-1 space-y-1 px-3">
      {adminNav.map(({ label, href, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 items-center gap-3 rounded-sm px-3 text-sm transition-colors duration-200",
              active ? "bg-beige-100 text-ink" : "text-ink-soft hover:bg-beige-100/60 hover:text-ink",
            )}
          >
            <Icon size={18} strokeWidth={1.5} className={active ? "text-gold-600" : undefined} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ admin, pathname }: { admin: Props["admin"]; pathname: string }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <Emblem size={64} className="h-auto w-10" />
        <span className="font-display text-xl tracking-wide">Elegancy</span>
      </div>
      <NavList pathname={pathname} />
      <div className="border-t border-beige-200 p-4">
        <p className="truncate text-sm">{admin.name}</p>
        <p className="truncate text-xs text-ink-soft">{admin.email}</p>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="flex h-10 w-full items-center gap-2 rounded-sm px-2 text-sm text-ink-soft transition-colors hover:bg-beige-100 hover:text-ink"
          >
            <LogOut size={16} strokeWidth={1.5} /> Sair
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ admin, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <ToastProvider>
    <div className="min-h-dvh">
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-beige-200 lg:block">
        <SidebarContent admin={admin} pathname={pathname} />
      </aside>

      {/* Mobile: barra superior + gaveta */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-beige-200 bg-white px-4 lg:hidden">
        <span className="font-display text-lg tracking-wide">Painel Elegancy</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="grid h-10 w-10 place-items-center rounded-sm hover:bg-beige-100"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          open ? "visible" : "invisible pointer-events-none delay-300",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-ink/30 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-sm hover:bg-beige-100"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
          <SidebarContent admin={admin} pathname={pathname} />
        </aside>
      </div>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
    </ToastProvider>
  );
}
