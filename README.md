# Elegancy Modas — Etapas 1, 2 e 3 (fundação, catálogo/estoque e loja com pedidos)

Loja virtual de roupas com catálogo público, painel administrativo e pedidos pelo WhatsApp.
Esta etapa entrega **somente a base técnica**: estrutura, banco de dados, autenticação administrativa e painel com navegação. Catálogo, carrinho e pedidos chegam nas próximas etapas.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Prisma 6 · PostgreSQL (Neon) · Vercel Blob · jose (sessão) · bcryptjs (senhas) · zod (validação)

## O que já funciona
| Rota | Descrição |
|---|---|
| `/` | Página inicial da loja (identidade visual; sem produtos ainda) |
| `/admin/login` | Login administrativo |
| `/admin` | Dashboard (contagens reais do banco) |
| `/admin/produtos`, `categorias`, `estoque`, `pedidos`, `banners`, `configuracoes` | Rotas protegidas com aviso "nas próximas etapas" |
| `/admin/produtos` · `/novo` · `/[id]` | **Etapa 2:** listagem com busca/filtros, cadastro, edição, exclusão segura |
| `/admin/categorias` | **Etapa 2:** criar, editar, ativar/desativar, excluir (com proteção) |
| `/admin/estoque` · `/historico` | **Etapa 2:** saldo por variação, entradas, saídas, ajustes e histórico |
| `/api/admin/upload` | **Etapa 2:** emite tokens de upload ao Blob (somente admin logado) |
| `/api/health` | Saúde da aplicação e do banco (`200` ok / `503` banco indisponível) |

## Instalação
Requisitos: Node.js 20.11+ e npm.

```bash
npm install
cp .env.example .env     # preencha os valores (veja abaixo)
```

## Configurar o Neon
1. Crie uma conta em https://neon.tech e um projeto (região mais próxima, ex.: São Paulo).
2. No painel do projeto, clique em **Connect** e copie duas strings:
   - **Pooled connection** (host contém `-pooler`) → `DATABASE_URL`
   - **Direct connection** (sem `-pooler`) → `DIRECT_URL`
3. Gere o segredo de sessão: `openssl rand -base64 48` → `AUTH_SECRET`.
4. Defina `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` (mínimo 12 caracteres).

## Migrations e seed
```bash
npm run db:validate                 # valida o schema
npm run db:migrate -- --name init   # cria e aplica a migration inicial (gera prisma/migrations)
npm run db:seed                     # cria a administradora e StoreSettings
npm run dev                         # http://localhost:3000  → /admin/login
```
Faça commit da pasta `prisma/migrations`. Em produção use `npm run db:deploy`.
O seed é idempotente e **não sobrescreve** a senha de uma admin existente.

## Estrutura
```
prisma/            schema.prisma, seed.ts
src/app/(loja)/    área pública
src/app/admin/     login + painel protegido ((painel)/ = rotas autenticadas)
src/app/api/       rotas de API (health)
src/components/    ui/ · brand/ · store/ · admin/
src/config/        env (validação), site, navegação do admin
src/lib/           db, auth (jwt/session/dal), storage (Vercel Blob), validations, utils
src/services/      regras de negócio e acesso a dados (uma por domínio)
src/types/         tipos compartilhados
src/middleware.ts  primeira barreira para /admin/*
```
Convenções para as próximas etapas: páginas finas → `services/` com a regra → `lib/validations/` com os schemas zod. Cada Server Action administrativa deve começar com `await requireAdmin()` e validar a entrada com zod.

## Segurança implementada
- Senhas com bcrypt (custo 12); nunca armazenadas em texto.
- Sessão em JWT assinado (HS256), cookie `httpOnly`, `sameSite=lax`, `secure` em produção, validade de 8 h.
- Defesa em camadas: o middleware exige cookie válido **e** `requireAdmin()` reconfere no banco (admin ativo + `tokenVersion`). Incrementar `Admin.tokenVersion` revoga todas as sessões.
- Bloqueio de 15 min após 5 senhas erradas; mensagem de erro genérica; tempo de resposta equalizado para e-mails inexistentes.
- Validação de entrada no servidor (zod); variáveis validadas em `src/config/env.ts`; segredos só no servidor.
- Cabeçalhos de segurança, `/admin` e `/api` fora do `robots.txt` e com `noindex`.
- Upload de imagens (`lib/storage/blob.ts`) valida tipo e tamanho (5 MB).

Pendências conscientes para etapas futuras: CSP com nonce, limite de tentativas por IP e troca de senha pelo painel.

## Notas do modelo de dados
- Estoque por variação: `ProductVariant` única por (produto, tamanho, cor). Peças sem variação usam `"Único"`.
- Toda mudança de saldo deve criar um `StockMovement` (delta + saldo resultante) na mesma transação.
- `OrderItem` guarda cópia de nome, SKU, preço, tamanho, cor e imagem; sobrevive à exclusão do produto.
- Variação com histórico não pode ser apagada (`Restrict`): desative-a.
- Opcional: após a migration, adicione `CHECK ("stock" >= 0)` em `ProductVariant` via migration SQL para reforçar a integridade no banco.

## Publicação na Vercel
1. Envie o repositório ao GitHub e importe o projeto na Vercel (preset Next.js).
2. Em **Settings → Environment Variables**, cadastre: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` (URL final), `BLOB_READ_WRITE_TOKEN`.
3. Em **Storage**, crie um **Blob store** e conecte ao projeto (o token é preenchido automaticamente).
4. Aplique as migrations no banco de produção a partir da sua máquina, com as URLs de produção no ambiente: `npm run db:deploy` e `npm run db:seed`.
5. Faça o deploy. Confira `/api/health` e o login.

## Scripts
`dev` · `build` · `start` · `lint` · `typecheck` · `db:validate` · `db:migrate` · `db:deploy` · `db:seed` · `db:studio`

## Etapa 2 — o que foi adicionado

### Atualizando um projeto já em uso (sem perder dados)
```bash
npm install
npm run db:deploy        # aplica 20261201000000_etapa2_estoque_e_preco_promocional
# (em desenvolvimento, `npm run db:migrate` também funciona)
```
A migration é **não destrutiva**: adiciona o tipo `EXIT` ao enum de movimentações, **renomeia** a coluna `Product.compareAtPrice` para `promoPrice` (dados preservados) e cria um `CHECK (stock >= 0)` em `ProductVariant`. O seed não precisa ser repetido. Se o Neon já tiver a pasta `prisma/migrations` da Etapa 1, copie esta nova pasta para dentro dela.

### Regras de negócio
- **Status:** Ativo, Inativo (rascunho) e Arquivado.
- **Exclusão de produto:** sem pedidos e sem histórico de estoque → apagado (e imagens removidas do Blob). Com histórico → **arquivado**, preservando tudo. Produtos com estoque inicial sempre têm histórico, logo são arquivados.
- **Variações:** única por (produto, tamanho, cor) — validado no formulário, no servidor (sem diferenciar maiúsculas) e no banco. Variações não são apagadas; desative-as.
- **Estoque:** o saldo de variações existentes só muda por movimentação (Entrada, Saída ou Ajuste com observação obrigatória). Cada movimentação roda em transação (saldo + histórico + administrador responsável), com atualização condicional contra concorrência e `CHECK` no banco contra saldo negativo. Variações novas geram um movimento `INITIAL`.
- **Categorias:** só podem ser excluídas se não tiverem produtos; caso contrário, desative-as.
- **Slugs** são gerados na criação e não mudam ao editar o nome (URLs estáveis para a vitrine da Etapa 3).

### Imagens (Vercel Blob)
O navegador envia as fotos **direto ao Blob** com um token de curta duração emitido por `/api/admin/upload` (exige sessão de admin; só JPG/PNG/WebP/AVIF até 5 MB; caminho `products/*`). Isso contorna o limite de 4,5 MB do corpo de funções da Vercel. O `BLOB_READ_WRITE_TOKEN` nunca vai ao navegador. Ao salvar, o servidor só aceita URLs do nosso Blob. Fotos escolhidas e não salvas ficam apenas na tela (pré-visualização local); se o salvamento falhar depois do envio, arquivos já enviados podem ficar órfãos no Blob (limpeza periódica é recomendada). Requer `BLOB_READ_WRITE_TOKEN` configurado, localmente e na Vercel.

### Fora desta etapa (Etapa 3)
Vitrine pública, carrinho, checkout, pedidos pelo WhatsApp e gerenciamento de pedidos.

## Etapa 3 — loja virtual, carrinho e pedidos

### Atualizando (sem perder dados)
```bash
npm install
npm run db:deploy      # aplica 20261202000000_etapa3_pedidos_e_whatsapp
```
A migration é não destrutiva: recria o enum `OrderStatus` mapeando valores antigos (`CANCELED→CANCELLED`, `PAID→CONFIRMED`, `SHIPPED→READY_FOR_PICKUP`, `DELIVERED→COMPLETED`), torna `Order.customerPhone` opcional, adiciona `publicToken`, `idempotencyKey`, `confirmedAt`, `cancelledAt`, `stockDeductedAt`, `stockRestoredAt` e cria índices únicos (inclusive `StockMovement(orderId, variantId, type)`, barreira contra movimentação duplicada). Nenhum produto, categoria, imagem ou movimentação é alterado.

### Configuração necessária ANTES de abrir a loja
1. **Admin → Configurações:** informe o **WhatsApp comercial** (DDD + número). É a única fonte do número; sem ele o checkout recusa pedidos. Preencha também e-mail, Instagram, endereço e “Sobre” (aparecem no rodapé).
2. **Admin → Banners:** envie o banner principal (opcional; sem banner ativo, a home mostra a abertura com o emblema).
3. **Admin → Produtos:** marque “Destacar na página inicial” nos produtos desejados.
4. `NEXT_PUBLIC_SITE_URL` com a URL final (usada no sitemap e SEO) e `BLOB_READ_WRITE_TOKEN` na Vercel.

### Rotas
| Pública | |
|---|---|
| `/` | banner, categorias, novidades, destaques |
| `/catalogo` | busca, categoria, faixa de preço, ordenação, paginação |
| `/produto/[slug]` | galeria, cor/tamanho reais, estoque por variação |
| `/carrinho` · `/checkout` | carrinho persistente (localStorage) e finalização só com o nome |
| `/pedido/[token]` | confirmação com botão para reabrir o WhatsApp |
| `/sitemap.xml` · `/robots.txt` | SEO |

Admin: `/admin/pedidos` (filtros por nº, cliente, período e situação), `/admin/pedidos/[id]`, `/admin/configuracoes`, `/admin/banners`.

### Fluxo do pedido e regras de estoque
- O navegador guarda só `variantId` + quantidade. **Preço, nome, estoque e situação vêm sempre do banco**, no carrinho e de novo na criação do pedido.
- Criar pedido **não mexe no estoque**. O pedido guarda nome, SKU, tamanho, cor, preço unitário e imagem do momento da compra.
- Envio repetido não duplica: o checkout usa uma chave de idempotência (`Order.idempotencyKey`, única).
- Abrir o WhatsApp usa o link oficial `https://wa.me/<número>?text=…`. **Não é possível anexar imagens** por esse link e isso não é simulado. Se o WhatsApp não abrir, o pedido já está salvo e a página `/pedido/[token]` tem o botão para tentar de novo.
- Situações: Aguardando confirmação → Confirmado → Em preparação → Pronto para retirada → Concluído; Cancelado a partir de qualquer situação aberta.
- **Confirmar** (uma transação): revalida produto ativo, variação existente/ativa e estoque de TODOS os itens; se qualquer item falhar, nada é descontado e o erro é mostrado; se passar, desconta, registra movimentações `SALE` e marca `stockDeductedAt`.
- **Cancelar antes de confirmar:** sem movimentação. **Cancelar pedido confirmado:** devolve o estoque com movimentações `CANCELLATION`, uma única vez (`stockRestoredAt`).
- Anti-duplicidade: troca de status por atualização condicional (duas confirmações simultâneas → só uma vence), marcadores no pedido e índice único `(pedido, variação, tipo)`.

### Limitações conhecidas
- Preço mostrado na ordenação por preço usa o preço efetivo (promoção incluída), calculado em memória até 1000 produtos; para catálogos muito grandes, migrar para consulta SQL.
- O freio contra pedidos em massa é simples (limite global por minuto). Para exposição pública intensa, adicione CAPTCHA/limite por IP.
- Fotos enviadas e não salvas podem ficar órfãs no Blob.

### Roteiro de testes manuais (execute após o deploy)
1. Abrir `/`, `/catalogo`, `/produto/<slug>` com produtos reais; conferir só ativos e “Esgotado” sem compra.
2. Pesquisar, filtrar por categoria e preço, ordenar; paginar.
3. Escolher cor e tamanho; combinação sem estoque deve estar desabilitada.
4. Adicionar itens diferentes e a mesma peça em tamanhos diferentes (linhas separadas); alterar quantidades; remover; recarregar a página (carrinho persiste).
5. Com o carrinho aberto, zerar o estoque de uma variação no admin e atualizar: o item deve aparecer bloqueado.
6. Checkout: nome → “FINALIZAR PEDIDO PELO WHATSAPP”; conferir pedido no banco/admin, `EM-xxxxx`, mensagem no WhatsApp e que o estoque **não** mudou.
7. Clicar duas vezes / recarregar durante o envio: apenas um pedido.
8. Admin: confirmar o pedido → estoque baixou e há movimentações `SALE`; tentar confirmar de novo (bloqueado).
9. Pedido com estoque insuficiente: confirmação recusada sem baixa parcial.
10. Cancelar pedido pendente (sem movimentação) e pedido confirmado (estoque devolvido, `CANCELLATION`, sem duplicar).
11. Repetir em Android e iPhone (menu, galeria, carrinho, abertura do WhatsApp).
