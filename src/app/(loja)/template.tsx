/** Reexecuta uma transição suave (apenas opacidade) a cada navegação dentro da loja. */
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
