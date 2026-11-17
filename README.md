# Elegancy Modas — Etapas 1 e 2 (fundação + painel de catálogo e estoque)

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
