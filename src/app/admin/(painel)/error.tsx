"use client";

import { Button } from "@/components/ui/Button";

export default function PanelError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-sm border border-beige-200 bg-white p-8 text-center">
      <h2 className="font-display text-2xl">Não foi possível carregar esta página</h2>
      <p className="mt-2 text-sm text-ink-soft">Verifique a conexão com o banco de dados e tente novamente.</p>
      <Button onClick={reset} variant="outline" className="mt-6">
        Tentar novamente
      </Button>
    </div>
  );
}
