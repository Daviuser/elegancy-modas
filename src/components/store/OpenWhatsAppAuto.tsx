"use client";

import { useEffect } from "react";

/** Abre o WhatsApp uma única vez logo após o pedido ser salvo; o botão manual continua disponível. */
export function OpenWhatsAppAuto({ url, enabled }: { url: string; enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const path = window.location.pathname;
    const t = setTimeout(() => {
      window.history.replaceState(null, "", path); // recarregar a página não reabre o WhatsApp
      window.location.assign(url);
    }, 900);
    return () => clearTimeout(t);
  }, [enabled, url]);
  return null;
}
