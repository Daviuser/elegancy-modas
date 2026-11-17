"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeOrderStatusAction } from "@/app/admin/(painel)/pedidos/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { orderStatusLabels, orderTransitions, type OrderStatusValue } from "@/config/orders";

export function OrderStatusActions({ orderId, status }: { orderId: string; status: OrderStatusValue }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState<OrderStatusValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = orderTransitions[status];
  if (next.length === 0) return <p className="text-sm text-ink-soft">Este pedido está encerrado e não pode mais ser alterado.</p>;

  function run(target: OrderStatusValue) {
    setError(null);
    start(async () => {
      const res = await changeOrderStatusAction(orderId, target);
      setConfirming(null);
      if (!res.ok) {
        setError(res.message);
        return toast.push("Não foi possível atualizar o pedido.", "error");
      }
      toast.push(res.message ?? "Atualizado.");
      router.refresh();
    });
  }

  const label = (t: OrderStatusValue) =>
    t === "CONFIRMED" ? "Confirmar pedido e dar baixa no estoque" : t === "CANCELLED" ? "Cancelar pedido" : `Marcar como “${orderStatusLabels[t]}”`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {next.map((t) => (
          <Button
            key={t}
            type="button"
            variant={t === "CANCELLED" ? "danger" : "primary"}
            loading={pending}
            onClick={() => (t === "CANCELLED" || t === "CONFIRMED" ? setConfirming(t) : run(t))}
          >
            {label(t)}
          </Button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="rounded-sm border border-red-800/30 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <Modal open={confirming !== null} onClose={() => setConfirming(null)} title={confirming === "CANCELLED" ? "Cancelar pedido?" : "Confirmar pedido?"}>
        <p className="text-sm text-ink-soft">
          {confirming === "CANCELLED"
            ? status === "PENDING"
              ? "O pedido será cancelado. Como ainda não foi confirmado, o estoque não será alterado."
              : "O pedido será cancelado e o estoque descontado na confirmação será devolvido (uma única vez)."
            : "O sistema verificará produtos, variações e estoque de todos os itens. Se tudo estiver disponível, o estoque será descontado agora. Se algum item faltar, nada será alterado."}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setConfirming(null)} disabled={pending}>
            Voltar
          </Button>
          <Button type="button" variant={confirming === "CANCELLED" ? "danger" : "primary"} loading={pending} onClick={() => confirming && run(confirming)}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
