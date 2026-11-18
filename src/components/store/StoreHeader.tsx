"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/store/CartProvider";
import { cn } from "@/lib/utils";

type Props = { storeName: string; categories: { name: string; slug: string }[] };

function Wordmark({ storeName, className }: { storeName: string; className?: string }) {
  const [first, ...rest] = storeName.split(" ");
  return (
    <span className={cn("font-display leading-none tracking-[0.01em]", className)}>
      {first}
      {rest.length > 0 ? <span className="hidden italic text-wine min-[400px]:inline"> {rest.join(" ")}</span> : null}
    </span>
  );
}

export function StoreHeader({ storeName, categories }: Props) {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  useEffect(() => {
    if (search) searchRef.current?.focus();
  }, [search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        setSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
  }

  const icon = "grid h-11 w-11 place-items-center transition-colors duration-300 hover:text-wine active:scale-95";
  const nav = "link-underline pb-0.5 text-[13px] tracking-[0.06em] text-ink";
  const mainLinks = [
    { href: "/", label: "Início" },
    { href: "/catalogo?ordem=novidades", label: "Novidades" },
    { href: "/catalogo", label: "Catálogo" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto grid h-16 max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center px-2 sm:px-6 lg:h-20 lg:px-8">
          <div className="flex items-center">
            <button type="button" className={cn(icon, "xl:hidden")} onClick={() => setMenu(true)} aria-label="Abrir menu" aria-expanded={menu}>
              <Menu size={22} strokeWidth={1.4} />
            </button>
            <nav aria-label="Principal" className="hidden items-center gap-8 xl:flex">
              <Link href="/catalogo?ordem=novidades" className={nav}>Novidades</Link>
              <Link href="/catalogo" className={nav}>Catálogo</Link>
              {categories.slice(0, 4).map((c) => (
                <Link key={c.slug} href={`/catalogo?categoria=${c.slug}`} className={nav}>
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label={`${storeName} — página inicial`} className="px-1">
            <Wordmark storeName={storeName} className="text-[1.45rem] sm:text-[1.9rem] lg:text-[2.1rem]" />
          </Link>

          <div className="flex items-center justify-end">
            <button type="button" className={icon} onClick={() => setSearch((s) => !s)} aria-label="Pesquisar" aria-expanded={search}>
              {search ? <X size={21} strokeWidth={1.4} /> : <Search size={21} strokeWidth={1.4} />}
            </button>
            <Link href="/carrinho" className={cn(icon, "relative")} aria-label={`Sacola${ready && count > 0 ? `, ${count} item(ns)` : ""}`}>
              <ShoppingBag size={21} strokeWidth={1.4} />
              {ready && count > 0 ? (
                <span key={count} className="animate-pop absolute right-1 top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-wine px-1 text-[10px] font-medium leading-none text-paper">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        {/* Busca: painel que desliza sob o cabeçalho */}
        <div
          className={cn(
            "absolute inset-x-0 top-full border-b border-line bg-paper transition-[opacity,transform,visibility] duration-300 ease-soft",
            search ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
          )}
          aria-hidden={!search}
        >
          <form onSubmit={submitSearch} role="search" className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
            <label htmlFor="header-search" className="sr-only">Pesquisar peças</label>
            <input
              id="header-search"
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você procura?"
              maxLength={80}
              autoComplete="off"
              tabIndex={search ? 0 : -1}
              className="h-12 w-full border-b border-ink bg-transparent font-display text-2xl placeholder:italic placeholder:text-mute focus:outline-none"
            />
            <button type="submit" tabIndex={search ? 0 : -1} aria-label="Buscar" className="grid h-12 w-12 shrink-0 place-items-center bg-ink text-paper transition-colors hover:bg-wine active:scale-95">
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </header>

      {/* Fundo escurecido da busca (fora do header: backdrop-filter criaria um bloco de contenção para `fixed`) */}
      <button
        type="button"
        aria-label="Fechar busca"
        tabIndex={-1}
        onClick={() => setSearch(false)}
        className={cn("fixed inset-0 z-30 bg-ink/25 transition-opacity duration-300", search ? "opacity-100" : "pointer-events-none opacity-0")}
      />

      {/* Menu em tela cheia (celular e tablet) */}
      <div
        className={cn(
          "fixed inset-0 z-50 overflow-y-auto bg-paper transition-[opacity,visibility] duration-400 xl:hidden",
          menu ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!menu}
        role="dialog"
        aria-label="Menu"
      >
        <div className="mx-auto flex min-h-full max-w-xl flex-col px-6 pb-10">
          <div className="flex h-16 items-center justify-between">
            <Wordmark storeName={storeName} className="text-[1.45rem]" />
            <button type="button" onClick={() => setMenu(false)} aria-label="Fechar menu" tabIndex={menu ? 0 : -1} className={cn(icon, "-mr-3")}>
              <X size={24} strokeWidth={1.4} />
            </button>
          </div>

          <ul className="mt-8 space-y-1">
            {mainLinks.map((l, i) => (
              <li key={l.label} className={cn("transition-[opacity,transform] duration-500 ease-soft", menu ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")} style={{ transitionDelay: menu ? `${90 + i * 55}ms` : "0ms" }}>
                <Link href={l.href} tabIndex={menu ? 0 : -1} className="block py-2 font-display text-5xl leading-tight active:text-wine">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {categories.length > 0 ? (
            <div className={cn("mt-10 transition-opacity duration-500", menu ? "opacity-100 delay-300" : "opacity-0")}>
              <p className="font-display text-lg italic text-wine">Categorias</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/catalogo?categoria=${c.slug}`} tabIndex={menu ? 0 : -1} className="flex items-center justify-between py-4 text-base">
                      {c.name}
                      <ArrowRight size={16} strokeWidth={1.4} className="text-mute" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
