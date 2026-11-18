import { MessageCircle, ShoppingBag, UserRound } from "lucide-react";

const items = [
  { icon: UserRound, title: "Compra sem cadastro", text: "Basta informar o seu nome." },
  { icon: ShoppingBag, title: "Monte sua sacola", text: "Escolha tamanho e cor com disponibilidade real." },
  { icon: MessageCircle, title: "Finalize pelo WhatsApp", text: "Atendimento direto com a loja." },
];

export function InfoStrip() {
  return (
    <section aria-label="Como comprar" className="border-y border-line">
      <ul className="mx-auto grid max-w-[90rem] divide-y divide-line px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-4 py-5 sm:justify-center sm:px-6">
            <Icon size={22} strokeWidth={1.3} className="shrink-0 text-wine" />
            <p className="text-sm leading-snug">
              <span className="block font-medium">{title}</span>
              <span className="text-ink-soft">{text}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
