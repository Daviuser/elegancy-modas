"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { createOrderAction } from "@/app/(loja)/actions";
import { useCart } from "@/components/store/CartProvider";
import { useCartLines } from "@/components/store/useCartLines";
import { buttonClass } from "@/components/ui/Button";
import { cn, formatBRL } from "@/lib/utils";

const KEY_STORE = "elegancy:checkout-key";

/** Chave de idempotência: o mesmo checkout nunca gera dois pedidos. */
function getIdempotencyKey() {
  try {
    const saved = sessionStorage.getItem(KEY_STORE);
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(KEY_STORE, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

const howItWorks = [
  "Você informa o seu nome e registramos o pedido.",
  "O WhatsApp da loja abre com todos os detalhes prontos.",
  "A loja confirma a disponibilidade e combina os próximos passos.",
];

export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const { lines, error, total, hasIssues, loading } = useCartLines();
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);

  if (loading || !cart.ready) {
    return (
      <div className="grid gap-12 lg:grid-cols-[1fr_28rem]" role="status" aria-busy>
        <span className="sr-only">Carregando…</span>
        <div className="h-48 animate-pulse bg-paper-deep" />
        <div className="h-80 animate-pulse bg-paper-deep" />
      </div>
    );
  }
  if (error) return <p className="py-20 text-center text-wine" role="alert">{error}</p>;
  if (!lines || lines.length === 0) {
    return (
      <div className="animate-rise py-20 text-center">
        <p className="font-display text-5xl">Sua sacola está vazia</p>
        <Link href="/catalogo" className={buttonClass("primary", "mt-8 h-14 px-10")}>Explorar o catálogo</Link>
      </div>
    );
  }

  const nameOk = name.trim().length >= 2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setProblem(null);
    setSending(true);
    try {
      const res = await createOrderAction({ customerName: name, items: cart.items, idempotencyKey: getIdempotencyKey() });
      if (!res.ok || !res.data) {
        setProblem(res.ok ? "Não foi possível registrar o pedido." : res.message);
        setErrorKey((k) => k + 1);
        setSending(false);
        return;
      }
      try {
        sessionStorage.removeItem(KEY_STORE);
      } catch {
        /* ignore */
      }
      cart.clear();
      router.push(`/pedido/${res.data.token}?novo=1`);
    } catch {
      setProblem("Falha de conexão. Seu pedido não foi perdido: tente novamente.");
      setErrorKey((k) => k + 1);
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_28rem] lg:gap-20">
      <div className="space-y-12">
        <section>
          <h2 className="font-display text-3xl">Como podemos te chamar?</h2>
          <div className="mt-6 max-w-lg">
            <label htmlFor="customer-name" className="text-sm text-ink-soft">Seu nome</label>
            <input
              id="customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              disabled={sending}
              placeholder="Nome e sobrenome"
              className="h-14 w-full border-b border-line bg-transparent font-display text-2xl placeholder:text-mute/60 focus:border-ink focus:outline-none disabled:opacity-60"
            />
            <p className="mt-3 text-sm text-ink-soft">Sem cadastro, sem senha. Só o nome.</p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl">Como funciona</h2>
          <ol className="mt-6 max-w-lg space-y-5">
            {howItWorks.map((text, i) => (
              <li key={text} className="flex gap-4">
                <span className="font-display text-3xl italic leading-none text-wine">{i + 1}</span>
                <p className="pt-1 text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <Link href="/carrinho" className="link-underline inline-flex w-fit items-center gap-2 pb-0.5 text-sm">
          <ArrowLeft size={15} strokeWidth={1.4} /> Voltar para a sacola
        </Link>
      </div>

      <aside className="h-fit bg-paper-deep p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="font-display text-3xl">Resumo do pedido</h2>
        <ul className="mt-6 divide-y divide-ink/10">
          {lines.map((l) => (
            <li key={l.variantId} className="grid grid-cols-[64px_1fr_auto] gap-4 py-4">
              <div className="relative aspect-[3/4] overflow-hidden bg-paper">
                {l.imageUrl ? <Image src={l.imageUrl} alt="" fill sizes="64px" className="object-cover" /> : null}
              </div>
              <div className="min-w-0 text-sm">
                <p className="font-display text-lg leading-tight">{l.name}</p>
                <p className="mt-0.5 text-ink-soft">{l.colorName} · Tam. {l.size}</p>
                <p className="text-ink-soft">{l.quantity} × {formatBRL(l.unitPrice)}</p>
                {l.issue ? <p className="mt-1 text-wine">{l.issue}</p> : null}
              </div>
              <p className="text-sm">{formatBRL(l.unitPrice * l.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-baseline justify-between border-t border-ink/15 pt-5">
          <span>Total</span>
          <span className="font-display text-4xl">{formatBRL(total)}</span>
        </div>

        {hasIssues ? (
          <p className="mt-4 text-sm text-wine" role="alert">
            Há itens indisponíveis. <Link href="/carrinho" className="underline underline-offset-4">Revise a sacola</Link>.
          </p>
        ) : null}
        {problem ? (
          <p key={errorKey} className="animate-shake mt-4 border border-wine/30 bg-wine-soft px-4 py-3 text-sm text-wine" role="alert">
            {problem}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={sending || hasIssues || !nameOk}
          aria-busy={sending}
          className={cn(
            "mt-6 inline-flex h-14 w-full items-center justify-center gap-3 px-4 text-[13px] tracking-[0.08em] text-paper",
            "transition-[background-color,transform] duration-300 ease-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
            sending ? "bg-wine" : "bg-ink hover:bg-wine",
          )}
        >
          {sending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-r-transparent" aria-hidden />
              REGISTRANDO PEDIDO…
            </>
          ) : (
            <>
              <MessageCircle size={18} strokeWidth={1.5} />
              FINALIZAR PEDIDO PELO WHATSAPP
            </>
          )}
        </button>
        {!nameOk && !sending ? <p className="mt-3 text-center text-xs text-ink-soft">Informe o seu nome para continuar.</p> : null}
      </aside>
    </form>
  );
}
