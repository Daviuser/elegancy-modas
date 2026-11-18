"use client";

import { useEffect, useState } from "react";

const DELAY_MS = 1000;

/**
 * Logo após o pedido ser salvo, abre o WhatsApp uma única vez, com uma barra de progresso.
 * O botão manual da página continua disponível caso o WhatsApp não abra.
 */
export function OpenWhatsAppAuto({ url, enabled }: { url: string; enabled: boolean }) {
  const [phase, setPhase] = useState<"idle" | "opening" | "done">(enabled ? "opening" : "idle");

  useEffect(() => {
    if (!enabled) return;
    const path = window.location.pathname;
    const t = setTimeout(() => {
      window.history.replaceState(null, "", path); // recarregar a página não reabre o WhatsApp
      setPhase("done");
      window.location.assign(url);
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [enabled, url]);

  if (phase === "idle") return null;

  return (
    <div role="status" aria-live="polite" className="animate-rise mx-auto mt-8 max-w-sm">
      {phase === "opening" ? (
        <>
          <p className="text-sm text-ink-soft">Abrindo o WhatsApp com o seu pedido…</p>
          <div className="mt-3 h-px bg-line">
            <div className="animate-progress h-full origin-left bg-wine" />
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-soft">Se o WhatsApp não abriu, use o botão abaixo.</p>
      )}
    </div>
  );
}
