import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="animate-rise">
        <p className="font-display text-8xl italic text-wine">404</p>
        <h1 className="mt-4 font-display text-3xl">Página não encontrada</h1>
        <p className="mt-2 text-ink-soft">O endereço pode ter mudado ou não existe.</p>
        <Link href="/" className={buttonClass("primary", "mt-8 px-8")}>
          Voltar para a loja
        </Link>
      </div>
    </main>
  );
}
