import {
  Boxes,
  Image as ImageIcon,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Shirt,
  ShoppingBag,
  Tags,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Slug usado pela rota provisória "em breve". Vazio no dashboard. */
  slug: string;
  description: string;
};

export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, slug: "", description: "Visão geral da loja." },
  { label: "Produtos", href: "/admin/produtos", icon: Shirt, slug: "produtos", description: "Cadastro de roupas, preços e galeria de imagens." },
  { label: "Categorias", href: "/admin/categorias", icon: Tags, slug: "categorias", description: "Organização do catálogo por categorias." },
  { label: "Estoque", href: "/admin/estoque", icon: Boxes, slug: "estoque", description: "Controle de estoque por tamanho e cor." },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag, slug: "pedidos", description: "Acompanhamento dos pedidos recebidos pelo WhatsApp." },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon, slug: "banners", description: "Banners da página inicial da loja." },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings, slug: "configuracoes", description: "Dados da loja e número do WhatsApp." },
];
