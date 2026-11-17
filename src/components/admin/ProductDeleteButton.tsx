"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProductAction } from "@/app/admin/(painel)/produtos/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export function ProductDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function confirm() {
    start(async () => {
      const res = await deleteProductAction(id);
      if (!res.ok) return toast.push(res.message, "error");
      toast.push(res.message ?? "Concluído.");
      setOpen(false);
      router.push("/admin/produtos");
      router.refresh();
    });
  }

  return (
    <>
      <Button type="button" variant="danger" className="px-4" onClick={() => setOpen(true)}>
        Excluir
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Excluir produto?">
        <p className="text-sm text-ink-soft">
          <strong className="font-medium text-ink">{name}</strong> será removido. Se houver histórico de estoque ou
          pedidos, o produto será <strong className="font-medium text-ink">arquivado</strong> em vez de apagado, para
          preservar o histórico.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={confirm} loading={pending}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </>
  );
}
