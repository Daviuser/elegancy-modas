"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerMovementAction } from "@/app/admin/(painel)/estoque/actions";
import { Button } from "@/components/ui/Button";
import { Field, TextareaField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { manualMovementTypes } from "@/config/stock";
import { cn } from "@/lib/utils";

type Props = { variantId: string; label: string; stock: number };
type MoveType = (typeof manualMovementTypes)[number]["value"];

export function StockMovementButton({ variantId, label, stock }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<MoveType>("ENTRY");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  const qty = quantity === "" ? NaN : Number(quantity);
  const preview = Number.isFinite(qty)
    ? type === "ENTRY"
      ? stock + qty
      : type === "EXIT"
        ? stock - qty
        : qty
    : null;

  function openDialog() {
    setType("ENTRY");
    setQuantity("");
    setNote("");
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await registerMovementAction({ variantId, type, quantity: qty, note });
      if (!res.ok) return toast.push(res.message, "error");
      toast.push(res.message ?? "Movimentação registrada.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button type="button" variant="outline" className="h-10 px-4" onClick={openDialog}>
        Movimentar
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Movimentar estoque">
        <p className="text-sm text-ink-soft">
          {label} · saldo atual <strong className="font-medium text-ink">{stock} un.</strong>
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <fieldset>
            <legend className="mb-1.5 text-sm text-ink-soft">Tipo</legend>
            <div className="grid grid-cols-3 gap-2">
              {manualMovementTypes.map((t) => (
                <label
                  key={t.value}
                  className={cn(
                    "cursor-pointer rounded-sm border px-3 py-2 text-center text-sm transition-colors",
                    type === t.value ? "border-ink bg-ink text-ivory" : "border-beige-300 hover:border-gold-500",
                  )}
                >
                  <input type="radio" name="type" value={t.value} checked={type === t.value} onChange={() => setType(t.value)} className="sr-only" />
                  {t.label}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">{manualMovementTypes.find((t) => t.value === type)?.hint}</p>
          </fieldset>

          <Field
            label={type === "ADJUSTMENT" ? "Novo saldo" : "Quantidade"}
            type="number"
            min={type === "ADJUSTMENT" ? 0 : 1}
            step={1}
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <TextareaField
            label={type === "ADJUSTMENT" ? "Observação (obrigatória)" : "Observação"}
            rows={3}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required={type === "ADJUSTMENT"}
            placeholder={type === "ENTRY" ? "Ex.: compra do fornecedor, NF 1234" : undefined}
          />

          {preview !== null ? (
            <p className={cn("text-sm", preview < 0 ? "text-red-700" : "text-ink-soft")}>
              Saldo após a movimentação: <strong className="font-medium">{preview} un.</strong>
              {preview < 0 ? " — não permitido" : ""}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending} disabled={preview !== null && preview < 0}>
              Registrar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
