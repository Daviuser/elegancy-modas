"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Emblem } from "@/components/brand/Emblem";
import { useCart } from "@/components/store/CartProvider";
import { cn } from "@/lib/utils";

type Props = { storeName: string; categories: { name: string; slug: string }[] };

function SearchForm({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  return (
    <form action="/catalogo" method="get" role="search" className={cn("relative", className)}>
      <label htmlFor={autoFocus ? "search-mobile" : "search-desktop"} className="sr-only">
        Pesquisar produtos
      </label>
      <input
        id={autoFocus ? "search-mobile" : "search-desktop"}
        name="q"
        type="search"
        placeholder="Pesquisar"
        autoFocus={autoFocus}
        maxLength={80}
        className="h-10 w-full border-b border-beige-300 bg-transparent pr-9 text-sm placeholder:text-ink-soft/70 focus:border-gold-500 focus:outline-none"
      />
      <button type="submit" aria-label="Buscar" className="absolute right-0 top-0 grid h-10 w-9 place-items-center text-ink-soft hover:text-gold-600">
        <Search size={17} strokeWidth={1.5} />
      </button>
    </form>
  );
}

export function StoreHeader({ storeName, categories }: Props) {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  const iconBtn = "grid h-10 w-10 place-items-center rounded-sm text-ink transition-colors hover:text-gold-600";
  const navLink = "text-sm tracking-wide text-ink-soft transition-colors hover:text-gold-600";

  return (
    <header className="sticky top-0 z-40 border-b border-beige-200/70 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex flex-1 items-center">
          <button type="button" className={cn(iconBtn, "lg:hidden")} onClick={() => setMenu(true)} aria-label="Abrir menu">
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <SearchForm className="hidden w-64 lg:block" />
        </div>

        <Link href="/" className="flex items-center gap-2.5" aria-label={`${storeName} — página inicial`}>
          <Emblem size={64} className="h-auto w-9" />
          <span className="font-display text-xl tracking-[0.14em] sm:text-2xl">{storeName.toUpperCase()}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end">
          <button type="button" className={cn(iconBtn, "lg:hidden")} onClick={() => setSearch((s) => !s)} aria-label="Pesquisar" aria-expanded={search}>
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href="/carrinho" className={cn(iconBtn, "relative")} aria-label={`Carrinho${ready && count > 0 ? `, ${count} item(ns)` : ""}`}>
            <ShoppingBag size={21} strokeWidth={1.5} />
            {ready && count > 0 ? (
              <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-500 px-1 text-[11px] leading-none text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <nav aria-label="Principal" className="mx-auto hidden max-w-7xl justify-center gap-9 px-6 pb-3 lg:flex">
        <Link href="/catalogo?ordem=novidades" className={navLink}>Novidades</Link>
        <Link href="/catalogo" className={navLink}>Catálogo</Link>
        {categories.slice(0, 6).map((c) => (
          <Link key={c.slug} href={`/catalogo?categoria=${c.slug}`} className={navLink}>
            {c.name}
          </Link>
        ))}
      </nav>

      {search ? (
        <div className="border-t border-beige-200/70 px-4 pb-3 pt-2 lg:hidden">
          <SearchForm autoFocus />
        </div>
      ) : null}

      <div className={cn("fixed inset-0 z-50 lg:hidden", menu ? "visible" : "invisible pointer-events-none delay-300")} aria-hidden={!menu}>
        <button type="button" aria-label="Fechar menu" onClick={() => setMenu(false)} className={cn("absolute inset-0 bg-ink/30 transition-opacity duration-300", menu ? "opacity-100" : "opacity-0")} />
        <aside className={cn("absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-ivory p-6 shadow-xl transition-transform duration-300 ease-out", menu ? "translate-x-0" : "-translate-x-full")}>
          <button type="button" onClick={() => setMenu(false)} aria-label="Fechar menu" className={cn(iconBtn, "absolute right-3 top-3")}>
            <X size={22} strokeWidth={1.5} />
          </button>
          <p className="font-display text-2xl tracking-wide">Menu</p>
          <ul className="mt-6 space-y-1 text-lg">
            {[{ href: "/", label: "Início" }, { href: "/catalogo?ordem=novidades", label: "Novidades" }, { href: "/catalogo", label: "Catálogo" }].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="block py-2.5 font-display text-2xl">{l.label}</Link>
              </li>
            ))}
          </ul>
          {categories.length > 0 ? (
            <>
              <p className="mt-8 text-sm text-ink-soft">Categorias</p>
              <ul className="mt-2 divide-y divide-beige-200">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/catalogo?categoria=${c.slug}`} className="block py-3">{c.name}</Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </aside>
      </div>
    </header>
  );
}
