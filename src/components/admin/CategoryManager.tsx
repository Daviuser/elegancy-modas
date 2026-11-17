"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteCategoryAction,
  saveCategoryAction,
  setCategoryActiveAction,
} from "@/app/admin/(painel)/categorias/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, TextareaField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { CategoryItem } from "@/services/category.service";

type Editing = { mode: "new" } | { mode: "edit"; category: CategoryItem } | { mode: "delete"; category: CategoryItem } | null;

export function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<Editing>(null);
  const [pending, start] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);

  function openForm(next: Editing) {
    if (next?.mode === "edit") {
      setName(next.category.name);
      setDescription(next.category.description ?? "");
      setSortOrder(String(next.category.sortOrder));
      setActive(next.category.active);
    } else if (next?.mode === "new") {
      setName("");
      setDescription("");
      setSortOrder("0");
      setActive(true);
    }
    setState(next);
  }

  function run(action: () => Promise<{ ok: boolean; message?: string }>, closeOnSuccess = true) {
    start(async () => {
      const res = await action();
      if (!res.ok) return toast.push(res.message ?? "Erro.", "error");
      toast.push(res.message ?? "Concluído.");
      if (closeOnSuccess) setState(null);
      router.refresh();
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(() =>
      saveCategoryAction({
        id: state?.mode === "edit" ? state.category.id : undefined,
        name,
        description,
        sortOrder: Number(sortOrder === "" ? 0 : sortOrder),
        active,
      }),
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button type="button" onClick={() => openForm({ mode: "new" })}>
          <Plus size={16} /> Nova categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-sm border border-dashed border-beige-300 p-10 text-center">
          <p className="font-display text-xl">Nenhuma categoria ainda</p>
          <p className="mt-1 text-sm text-ink-soft">Crie a primeira para começar a cadastrar produtos.</p>
        </div>
      ) : (
        <ul className="divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-xl">{c.name}</span>
                  {c.active ? <Badge tone="gold">Ativa</Badge> : <Badge tone="muted">Inativa</Badge>}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-soft">
                  {c.productCount} produto(s){c.description ? ` · ${c.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 px-3"
                  disabled={pending}
                  onClick={() => run(() => setCategoryActiveAction(c.id, !c.active), false)}
                >
                  {c.active ? "Desativar" : "Ativar"}
                </Button>
                <Button type="button" variant="ghost" className="h-10 px-3" aria-label={`Editar ${c.name}`} onClick={() => openForm({ mode: "edit", category: c })}>
                  <Pencil size={16} />
                </Button>
                <Button type="button" variant="ghost" className="h-10 px-3" aria-label={`Excluir ${c.name}`} onClick={() => setState({ mode: "delete", category: c })}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={state?.mode === "new" || state?.mode === "edit"}
        onClose={() => setState(null)}
        title={state?.mode === "edit" ? "Editar categoria" : "Nova categoria"}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
          <TextareaField label="Descrição" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
          <Field label="Ordem de exibição" type="number" min={0} max={9999} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold-500)]" />
            Categoria ativa
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setState(null)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={state?.mode === "delete"} onClose={() => setState(null)} title="Excluir categoria?">
        <p className="text-sm text-ink-soft">
          {state?.mode === "delete" ? (
            <>
              <strong className="font-medium text-ink">{state.category.name}</strong> será excluída. Categorias com
              produtos não podem ser excluídas — desative-as.
            </>
          ) : null}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setState(null)} disabled={pending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={pending}
            onClick={() => state?.mode === "delete" && run(() => deleteCategoryAction(state.category.id))}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </>
  );
}
