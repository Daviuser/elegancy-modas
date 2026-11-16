# Elegancy Modas — Etapa 1 (fundação)

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
