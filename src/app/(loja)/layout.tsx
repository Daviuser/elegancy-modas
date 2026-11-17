import { CartProvider } from "@/components/store/CartProvider";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { getStoreSettings } from "@/services/settings.service";
import { listNavCategories } from "@/services/store.service";

// A loja lê produtos reais do banco a cada requisição (sempre atualizada).
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getStoreSettings(), listNavCategories()]);
  return (
    <CartProvider>
      <a href="#conteudo" className="sr-only z-[70] bg-ink px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
        Pular para o conteúdo
      </a>
      <div className="flex min-h-dvh flex-col">
        <StoreHeader storeName={settings.storeName} categories={categories} />
        <main id="conteudo" className="flex-1">{children}</main>
        <StoreFooter settings={settings} categories={categories} />
      </div>
    </CartProvider>
  );
}
