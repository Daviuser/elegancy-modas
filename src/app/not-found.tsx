import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-display text-5xl text-gold-500">404</p>
        <h1 className="mt-3 font-display text-2xl">Página não encontrada</h1>
        <p className="mt-2 text-sm text-ink-soft">O endereço pode ter mudado ou não existe.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-gold-600 underline underline-offset-4">
          Voltar para a loja
        </Link>
      </div>
    </main>
  );
}
