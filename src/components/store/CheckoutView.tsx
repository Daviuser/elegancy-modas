"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrderAction } from "@/app/(loja)/actions";
import { useCart } from "@/components/store/CartProvider";
import { useCartLines } from "@/components/store/useCartLines";
import { buttonClass } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { formatBRL } from "@/lib/utils";

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

export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const { lines, error, total, hasIssues, loading } = useCartLines();
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  if (loading || !cart.ready) return <p className="py-20 text-center text-ink-soft" role="status">Carregando…</p>;
  if (error) return <p className="py-20 text-center text-red-700" role="alert">{error}</p>;
  if (!lines || lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-3xl">Seu carrinho está vazio</p>
        <Link href="/catalogo" className={buttonClass("primary", "mt-8")}>Ver catálogo</Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setProblem(null);
    setSending(true);
    try {
      const res = await createOrderAction({
        customerName: name,
        items: cart.items,
        idempotencyKey: getIdempotencyKey(),
      });
      if (!res.ok || !res.data) {
        setProblem(res.ok ? "Não foi possível registrar o pedido." : res.message);
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
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div>
        <h2 className="font-display text-2xl">Seus dados</h2>
        <div className="mt-5 max-w-md">
          <Field label="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} autoComplete="name" disabled={sending} />
          <p className="mt-2 text-xs text-ink-soft">Não é preciso criar conta. A conversa continua no WhatsApp da loja.</p>
        </div>
        {hasIssues ? (
          <p className="mt-6 text-sm text-red-700" role="alert">
            Há itens indisponíveis no carrinho. <Link href="/carrinho" className="underline">Revise o carrinho</Link>.
          </p>
        ) : null}
      </div>

      <aside className="h-fit border border-beige-200 bg-white p-6">
        <h2 className="font-display text-2xl">Resumo do pedido</h2>
        <ul className="mt-4 divide-y divide-beige-200">
          {lines.map((l) => (
            <li key={l.variantId} className="py-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="font-display text-lg leading-tight">{l.name}</span>
                <span>{formatBRL(l.unitPrice * l.quantity)}</span>
              </div>
              <p className="text-ink-soft">Tam. {l.size} · {l.colorName}</p>
              <p className="text-ink-soft">{l.quantity} × {formatBRL(l.unitPrice)}</p>
              {l.issue ? <p className="text-red-700">{l.issue}</p> : null}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t border-beige-200 pt-4">
          <span className="text-ink-soft">Total</span>
          <span className="font-display text-3xl">{formatBRL(total)}</span>
        </div>

        {problem ? <p className="mt-4 text-sm text-red-700" role="alert">{problem}</p> : null}

        <button
          type="submit"
          disabled={sending || hasIssues || name.trim().length < 2}
          className="mt-6 h-12 w-full bg-ink px-4 text-sm tracking-wide text-ivory transition-colors duration-300 hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "REGISTRANDO PEDIDO…" : "FINALIZAR PEDIDO PELO WHATSAPP"}
        </button>
        <Link href="/carrinho" className="mt-3 block text-center text-sm text-ink-soft underline underline-offset-4">Voltar ao carrinho</Link>
      </aside>
    </form>
  );
}
