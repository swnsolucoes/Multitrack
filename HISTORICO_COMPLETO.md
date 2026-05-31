# MultiTrack Hub — Histórico Completo do Projeto

> Documento gerado em junho/2026.
> Cobre tudo o que foi construído, as ferramentas utilizadas, o histórico de sessões,
> melhorias implementadas, pendências e dicas para os próximos passos.

---

## Índice

1. [O que é o projeto](#1-o-que-é-o-projeto)
2. [Ferramentas e tecnologias utilizadas](#2-ferramentas-e-tecnologias-utilizadas)
3. [Histórico de sessões — o que foi feito](#3-histórico-de-sessões--o-que-foi-feito)
4. [Arquitetura atual](#4-arquitetura-atual)
5. [Banco de dados — estrutura completa](#5-banco-de-dados--estrutura-completa)
6. [API — todos os endpoints](#6-api--todos-os-endpoints)
7. [Frontend — todas as telas](#7-frontend--todas-as-telas)
8. [Painel administrativo](#8-painel-administrativo)
9. [Internacionalização PT/EN](#9-internacionalização-pten)
10. [Dados de seed](#10-dados-de-seed)
11. [Credenciais de teste](#11-credenciais-de-teste)
12. [Configuração de ambiente](#12-configuração-de-ambiente)
13. [Relatório técnico — o que falta para produção](#13-relatório-técnico--o-que-falta-para-produção)
14. [Melhorias recomendadas](#14-melhorias-recomendadas)
15. [Dicas e boas práticas](#15-dicas-e-boas-práticas)
16. [Glossário do projeto](#16-glossário-do-projeto)

---

## 1. O que é o projeto

**MultiTrack Hub** é uma plataforma e-commerce brasileira de multitracks musicais — arquivos de áudio com as faixas separadas por instrumento (stems) de músicas populares, para uso por músicos, bandas, ministérios de louvor e produtores musicais.

### Diferenciais do produto

| Funcionalidade | Descrição |
|---|---|
| **Catálogo** | Multitracks pesquisáveis/filtráveis por BPM, tom, gênero e preço |
| **Preview de áudio** | Player HTML5 de 30 segundos embutido na página do produto |
| **Preview de vídeo** | Embed do YouTube integrado à página do produto |
| **Compra direta** | Checkout com Pix ou cartão, cupons de desconto |
| **Assinatura Premium** | R$ 9,90/mês com créditos mensais para downloads |
| **Rateios coletivos** | Compra em grupo para encomendar novas músicas |
| **Painel admin** | Dashboard com gráficos, CRUD completo, gestão de usuários |
| **Bilíngue** | Interface completa em Português (BR) e Inglês |

---

## 2. Ferramentas e tecnologias utilizadas

### Plataforma de desenvolvimento

| Ferramenta | Uso |
|---|---|
| **Replit** | Ambiente de desenvolvimento, hospedagem, banco de dados PostgreSQL, proxy reverso, workflows |
| **Replit Agent (IA)** | Geração de código, arquitetura, debug, documentação |
| **Git** | Versionamento (gerenciado automaticamente pelo Replit com checkpoints) |
| **pnpm workspaces** | Gerenciamento de monorepo — pacotes compartilhados sem duplicação |

### Frontend (`artifacts/multitrack-hub`)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React** | 19.1.0 | Framework de UI |
| **Vite** | ^7.3 | Build tool e dev server |
| **TypeScript** | ~5.9 | Tipagem estática |
| **Tailwind CSS** | ^4.1 | Estilização utilitária |
| **shadcn/ui** | — | Componentes acessíveis (Radix UI + Tailwind) |
| **Wouter** | ^3.3 | Roteamento leve (alternativa ao React Router) |
| **TanStack Query** | ^5.90 | Cache e sincronização de dados com a API |
| **React Hook Form** | — | Formulários performáticos |
| **Zod** | ^3.25 | Validação de schemas (compartilhado com backend) |
| **Recharts** | — | Gráficos do painel admin |
| **i18next + react-i18next** | — | Internacionalização PT/EN |
| **date-fns** | — | Formatação de datas com locale ptBR/enUS |
| **lucide-react** | ^0.545 | Ícones |
| **framer-motion** | ^12.23 | Animações |

### Backend (`artifacts/api-server`)

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Node.js** | 24 LTS | Runtime JavaScript |
| **Express** | 5 | Framework HTTP |
| **TypeScript** | ~5.9 | Tipagem estática |
| **Drizzle ORM** | ^0.45 | ORM type-safe para PostgreSQL |
| **Drizzle Kit** | — | Migrações de banco de dados |
| **Pino + pino-http** | ^9 / ^10 | Logs estruturados (JSON) |
| **Zod** | ^3.25 | Validação de entradas nas rotas |
| **tsx** | ^4.21 | Execução TypeScript em dev |

### Bibliotecas compartilhadas (`lib/`)

| Pacote | Finalidade |
|---|---|
| `@workspace/db` | Schema Drizzle, cliente PostgreSQL, migrações |
| `@workspace/api-spec` | Especificação OpenAPI 3.0 YAML |
| `@workspace/api-client-react` | Hooks React Query gerados automaticamente via Orval |
| `@workspace/api-zod` | Schemas Zod gerados automaticamente via Orval |

### Infraestrutura e segurança

| Recurso | Descrição |
|---|---|
| **PostgreSQL** | Banco relacional provisionado automaticamente pelo Replit |
| **Proxy reverso** | Replit roteia `/api/*` → api-server, `/*` → frontend automaticamente |
| **Secrets** | `DATABASE_URL` e `SESSION_SECRET` gerenciados pelo Replit (nunca no código) |
| **pnpm minimumReleaseAge** | Pacotes npm só instalados após 1 dia de publicação — defesa contra supply-chain attacks |

---

## 3. Histórico de sessões — o que foi feito

### Sessão 1 — Estrutura inicial do projeto
**Commit:** `5b0eedb` — "Initial commit"

- Criação do monorepo pnpm com workspaces
- Setup do Express 5 + Drizzle ORM + PostgreSQL
- Setup do React 19 + Vite + Tailwind CSS + shadcn/ui
- Schema inicial do banco de dados
- Rotas base da API
- Componentes de layout (Navbar, Footer)
- Página Home, Catálogo, Login, Registro

---

### Sessão 2 — Expansão da API e rotas
**Commit:** `8eb306f` — "Add comprehensive API routes and definitions"

- Implementação completa das rotas REST:
  - Autenticação (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`)
  - Catálogo com filtros avançados
  - Carrinho com cupons
  - Pedidos e checkout
  - Downloads com grant de acesso
  - Assinaturas e créditos
  - Rateios coletivos
  - Lista de desejos
  - Painel admin completo
- Middleware `requireAuth`, `requireAdmin`, `optionalAuth`
- Geração de token SHA-256 (Bearer, 30 dias TTL)
- Seed data: 8 categorias, 12 produtos, 4 rateios, 3 cupons

---

### Sessão 3 — Plano gratuito e rateios
**Commit:** `dc62de5` — "Add a free plan option for users to participate in collective purchases"

- Adição de plano gratuito para participação em rateios
- Melhorias no fluxo de rateios coletivos
- Página de detalhe do rateio com timeline de comentários
- Barra de progresso e botão "Participar"
- Modal para sugerir nova música

---

### Sessão 4 — Internacionalização completa (i18n)
**Commit:** `a1dbc04` — "Add full language support and translate all admin pages"

- Configuração do `i18next` e `react-i18next`
- Arquivos de tradução `pt.json` e `en.json` com todos os namespaces
- Tradução de **todas** as páginas públicas:
  - Home, Catálogo, Detalhe do produto, Planos
  - Carrinho, Checkout, Pedidos, Downloads
  - Assinatura, Rateios, Lista de Desejos
  - Login, Registro
- Tradução de **todas** as páginas do admin:
  - Dashboard, Produtos (index/new/edit)
  - Pedidos, Usuários (index/detail)
  - Cupons, Créditos, Rateios
- Botão PT ↔ EN na Navbar com persistência via `localStorage`
- Suporte a datas localizadas (ptBR / enUS via date-fns)

---

### Sessão 5 — Embed de vídeo YouTube
**Commit:** `3c7c593` — "Add YouTube video embedding to product pages and admin interface"

- Campo `video_url` adicionado à tabela `products`
- Extração automática do ID do YouTube a partir de qualquer formato de URL:
  - `youtube.com/watch?v=...`
  - `youtu.be/...`
  - `youtube.com/shorts/...`
  - `youtube.com/embed/...`
- Embed responsivo de iframe na página pública do produto
- Campo "YouTube Video URL" adicionado ao formulário de criação de produto (admin)
- Campo adicionado ao formulário de edição de produto (admin)
- Chaves de tradução adicionadas em `pt.json` e `en.json`

---

### Sessão 6 — Documentação completa
**Commit:** `c411cd4` — "Add comprehensive documentation"

- Criação do arquivo `DOCUMENTACAO.md` com:
  - Arquitetura do projeto
  - Stack tecnológica completa
  - Todas as tabelas do banco de dados com colunas e tipos
  - Todos os endpoints da API
  - Todas as páginas do frontend
  - Painel administrativo detalhado
  - Sistema de i18n
  - Dados de seed
  - Variáveis de ambiente
  - Estrutura de arquivos
  - Fluxos principais (compra, crédito, rateio, admin)

---

### Sessão 7 — Relatório técnico de conformidade
**Commit:** `d7eda51` — "Add technical report comparing project implementation to requirements"

- Análise honesta de 12 pontos críticos vs. requisitos de produção
- Identificação de 4 bloqueadores P0 (não pode ir a produção sem corrigir):
  1. Senhas com SHA-256 (risco crítico)
  2. Checkout simulado (sem gateway real)
  3. Downloads com URL quebrada (rota 404)
  4. LGPD ausente (risco jurídico)
- Criação do `RELATORIO_TECNICO.md` com plano de correção em 13 etapas

---

### Sessão 8 — Padronização do Node.js
**Commit:** `83b0b07` — "Standardize Node.js version to LTS for project consistency"

- Criação de `.nvmrc` com `24`
- Criação de `.node-version` com `24`
- Campo `"engines": { "node": ">=24 <25", "npm": ">=11" }` adicionado ao `package.json`
- Documentação atualizada para refletir Node.js 24 LTS como versão oficial
- Nota adicionada: Node 18 e Node 20 estão EOL e não devem ser usados

---

## 4. Arquitetura atual

```
workspace/                          ← Monorepo pnpm
├── artifacts/
│   ├── multitrack-hub/             ← Frontend React + Vite  (path /)
│   │   └── src/
│   │       ├── pages/              ← 26 páginas (públicas + admin)
│   │       ├── components/         ← Layout + ProductCard + 50+ shadcn/ui
│   │       ├── lib/                ← AuthContext, i18n, utils
│   │       └── locales/            ← pt.json, en.json
│   └── api-server/                 ← Backend Express 5  (path /api)
│       └── src/
│           ├── routes/             ← 11 arquivos de rotas
│           └── lib/                ← auth.ts, logger.ts
├── lib/
│   ├── db/                         ← Schema Drizzle + cliente pg
│   │   └── schema/                 ← 13 arquivos de schema
│   ├── api-spec/                   ← OpenAPI 3.0 YAML
│   ├── api-client-react/           ← Hooks gerados (orval)
│   └── api-zod/                    ← Schemas Zod gerados (orval)
├── scripts/                        ← Scripts utilitários
├── .nvmrc                          ← Node.js 24
├── .node-version                   ← Node.js 24
├── package.json                    ← engines: node >=24 <25
└── pnpm-workspace.yaml             ← Catálogo de versões + segurança

Proxy reverso Replit:
  /api/* → api-server (porta 8080)
  /*     → multitrack-hub (porta dinâmica)
```

---

## 5. Banco de dados — estrutura completa

**19 tabelas PostgreSQL gerenciadas pelo Drizzle ORM:**

| Tabela | Descrição |
|---|---|
| `users` | Usuários com roles: buyer, member, premium, admin, support |
| `sessions` | Tokens de sessão Bearer (TTL 30 dias) |
| `categories` | Categorias musicais (Gospel, Rock, Sertanejo, etc.) |
| `products` | Multitracks com metadados completos + videoUrl |
| `cart_items` | Itens no carrinho por usuário |
| `cart_coupons` | Cupom aplicado ao carrinho |
| `orders` | Pedidos com status e método de pagamento |
| `order_items` | Produtos dentro de cada pedido |
| `download_grants` | Permissões de download (purchase/credit/rateio) |
| `download_logs` | Histórico de downloads com IP e user-agent |
| `plans` | Planos de assinatura (Free, Premium R$ 9,90/mês) |
| `subscriptions` | Assinaturas ativas por usuário |
| `credit_ledger` | Livro-razão de créditos (earned/used/refunded/adjusted/expired) |
| `rateios` | Compras coletivas com 10 status diferentes |
| `rateio_participants` | Participantes de cada rateio |
| `rateio_comments` | Timeline de comentários |
| `coupons` | Cupons de desconto (% ou R$ fixo) |
| `coupon_usages` | Histórico de uso de cupons |
| `wishlist` | Lista de desejos por usuário |

---

## 6. API — todos os endpoints

**Base:** `/api` (todos os prefixados)

### Autenticação
```
POST   /auth/register       → Criar conta
POST   /auth/login          → Login, retorna Bearer token
POST   /auth/logout         → Invalida sessão
GET    /auth/me             → Dados do usuário logado
```

### Catálogo
```
GET    /categories          → Lista categorias
GET    /products            → Lista com filtros: q, categoryId, genre, minBpm,
                              maxBpm, minPrice, maxPrice, sort, page, limit
GET    /products/featured   → Produtos em destaque
GET    /products/bestsellers → Mais vendidos
GET    /products/:id        → Detalhe completo
GET    /products/:id/related → Produtos relacionados
```

### Carrinho
```
GET    /cart                → Carrinho do usuário
POST   /cart/items          → Adicionar produto { productId }
DELETE /cart/items/:id      → Remover item
POST   /cart/coupon         → Aplicar cupom { code }
POST   /cart/coupon/remove  → Remover cupom
```

### Pedidos
```
GET    /orders              → Histórico de pedidos
POST   /orders              → Criar pedido { paymentMethod }
GET    /orders/:id          → Detalhe com itens
POST   /orders/:id/pay      → Confirmar pagamento (simulado)
```

### Downloads
```
GET    /downloads           → Downloads disponíveis
POST   /downloads/:grantId/link → Gerar link (token 15min)
```

### Assinaturas e créditos
```
GET    /subscriptions/plans → Planos disponíveis
GET    /subscriptions/me    → Assinatura ativa
POST   /subscriptions/me    → Assinar { planId }
DELETE /subscriptions/me    → Cancelar assinatura
GET    /credits             → Saldo e histórico
POST   /credits/use         → Usar crédito { productId }
```

### Rateios
```
GET    /rateios             → Lista com filtros
POST   /rateios             → Sugerir nova música
GET    /rateios/:id         → Detalhe + participantes
POST   /rateios/:id/join    → Participar
GET    /rateios/:id/comments   → Comentários
POST   /rateios/:id/comments   → Adicionar comentário
```

### Wishlist
```
GET    /wishlist            → Lista de desejos
POST   /wishlist/:productId → Adicionar
DELETE /wishlist/:productId → Remover
```

### Admin (role: admin ou support)
```
GET    /admin/dashboard         → Métricas e gráficos
GET    /admin/products          → Lista produtos
POST   /admin/products          → Criar produto
PUT    /admin/products/:id      → Editar produto
DELETE /admin/products/:id      → Desativar produto
GET    /admin/orders            → Todos os pedidos
GET    /admin/users             → Lista usuários
GET    /admin/users/:id         → Detalhe do usuário
PATCH  /admin/users/:id         → Alterar role/bloquear/notas
GET    /admin/rateios           → Todos os rateios
PATCH  /admin/rateios/:id/status → Alterar status
GET    /admin/coupons           → Lista cupons
POST   /admin/coupons           → Criar cupom
POST   /admin/credits           → Ajuste manual de crédito
```

---

## 7. Frontend — todas as telas

**26 páginas no total:**

### Páginas públicas (sem login)

| Rota | Tela | Destaques |
|---|---|---|
| `/` | Home | Hero, destaques, categorias, bestsellers, CTAs |
| `/catalog` | Catálogo | Grid responsivo, filtros, busca, contador |
| `/products/:id` | Detalhe do produto | Player áudio, embed YouTube, stems, licença, relacionados |
| `/plans` | Planos | Free vs Premium, explicação de créditos e rateios |
| `/rateios` | Rateios | Lista com status, progresso, modal para sugerir |
| `/rateios/:id` | Detalhe do rateio | Timeline, progresso, participar, comentários |
| `/login` | Login | Formulário + validação Zod + toast de erro |
| `/register` | Cadastro | Formulário + validação Zod |

### Páginas autenticadas (requerem login)

| Rota | Tela | Destaques |
|---|---|---|
| `/cart` | Carrinho | Itens, cupom, totais, checkout |
| `/checkout` | Checkout | Pix/cartão, resumo, confirmação |
| `/orders` | Meus pedidos | Histórico, status colorido |
| `/orders/:id` | Detalhe do pedido | Itens, download, totais, método |
| `/downloads` | Downloads | Grants, origem, contador, re-download |
| `/subscription` | Minha assinatura | Status, saldo créditos, histórico, cancelar |
| `/wishlist` | Lista de desejos | Grid de favoritos, remoção direta |

### Painel Administrativo (role: admin)

| Rota | Tela |
|---|---|
| `/admin` | Dashboard com métricas e gráficos |
| `/admin/products` | Tabela de produtos com busca |
| `/admin/products/new` | Formulário de criação |
| `/admin/products/edit/:id` | Formulário de edição |
| `/admin/orders` | Todos os pedidos |
| `/admin/users` | Lista de usuários |
| `/admin/users/:id` | Detalhe e edição do usuário |
| `/admin/rateios` | Gestão de rateios |
| `/admin/coupons` | Gestão de cupons |
| `/admin/credits` | Ajuste manual de créditos |

---

## 8. Painel administrativo

### Dashboard
- Cards: Receita total, MRR, Pedidos, Usuários Premium, Downloads
- Gráfico de barras: Receita por canal (Compra Direta, Assinatura, Bundle, Rateio)
- Top 5 produtos por vendas e receita
- Pedidos recentes (últimos 10)

### Gestão de produtos
- Tabela com capa, nome, artista, preço, promo, status, vendas
- Formulário completo com todos os campos incluindo:
  - URL de capa, preview de áudio, **vídeo YouTube**
  - BPM, Tom, Duração, Tamanho do arquivo
  - Stems/faixas incluídas, formatos disponíveis
  - Configurações de assinatura e créditos

### Gestão de usuários
- Alterar role (buyer → member → premium → admin)
- Bloquear/desbloquear conta
- Anotações internas
- Ver pedidos recentes e assinatura ativa

### Gestão de rateios
- Alterar status inline (10 estados de ciclo de vida)

### Gestão de cupons
- Criar cupons de % ou valor fixo
- Limites de uso total e por usuário
- Data de expiração

### Ajuste de créditos
- Adicionar ou subtrair créditos de qualquer usuário
- Registrado no ledger como tipo `adjusted`

---

## 9. Internacionalização PT/EN

| Aspecto | Implementação |
|---|---|
| **Biblioteca** | `i18next` + `react-i18next` |
| **Idioma padrão** | Português (pt-BR) |
| **Persistência** | `localStorage.setItem("lang", "pt"/"en")` |
| **Troca de idioma** | Botão PT ↔ EN na Navbar (ícone globo) |
| **Datas** | `date-fns` com locale `ptBR`/`enUS` automático |
| **Moeda** | `Intl.NumberFormat` com `pt-BR`/`en-US` |

**Namespaces de tradução:** `nav`, `footer`, `home`, `catalog`, `product`, `cart`, `checkout`, `orders`, `order_detail`, `downloads`, `plans`, `subscription`, `rateios`, `wishlist`, `auth`, `admin`, `common`

---

## 10. Dados de seed

Ao rodar o seed, o banco é populado com:

### Categorias (8)
Gospel, Rock, Sertanejo, MPB, Pop, Forró, Pagode, Worship

### Produtos (12)
Multitracks completas com imagens reais, BPM, tons, listas de stems e preços variados.

### Rateios (4)
Em fases diferentes: `open`, `in_quotation`, `suggested`, com participantes e comentários.

### Cupons (3)
| Código | Tipo | Desconto |
|---|---|---|
| `BEMVINDO10` | Porcentagem | 10% |
| `GOSPEL20` | Porcentagem | 20% |
| `FRETE5` | Fixo | R$ 5,00 |

### Plano Premium
- Preço: R$ 9,90/mês
- Créditos: 3 por mês
- Máximo acumulado: 6 créditos

---

## 11. Credenciais de teste

| Usuário | Email | Senha | Role |
|---|---|---|---|
| Administrador | `admin@multitrack.com` | `admin123` | admin |

Para testar o painel admin, acesse `/login` e entre com as credenciais acima.

---

## 12. Configuração de ambiente

### Variáveis de ambiente necessárias

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL (provisionado pelo Replit) |
| `SESSION_SECRET` | Segredo para hash de senhas (gerenciado pelo Replit Secrets) |
| `PORT` | Porta do serviço (injetada automaticamente pelos workflows) |

### Versão do Node.js

| Arquivo | Conteúdo |
|---|---|
| `.nvmrc` | `24` |
| `.node-version` | `24` |
| `package.json` (`engines`) | `"node": ">=24 <25"`, `"npm": ">=11"` |

> Node.js 18 e Node.js 20 estão EOL — não usar em produção.

### Comandos principais

```bash
# Instalar dependências
pnpm install

# Verificar tipos (libs)
pnpm run typecheck:libs

# Verificar tipos (tudo)
pnpm run typecheck

# Gerar hooks e schemas a partir do OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Os serviços rodam via workflows do Replit automaticamente
```

---

## 13. Relatório técnico — o que falta para produção

### Bloqueadores P0 (não pode lançar sem resolver)

#### 🔴 Senhas com SHA-256
**Problema:** `crypto.createHash("sha256")` é um hash de propósito geral, não um KDF (Key Derivation Function). É quebrável em minutos com GPU moderna.
**Solução:** Substituir por `bcrypt` (rounds ≥ 12) ou `argon2id`.
**Arquivo:** `artifacts/api-server/src/lib/auth.ts`

#### 🔴 Checkout simulado
**Problema:** O pedido é criado diretamente com `status: "paid"` sem nenhuma integração com gateway. O código Pix é uma string hardcoded falsa. Qualquer usuário pode "comprar" de graça.
**Solução:** Integrar com Pagar.me, Stripe (com PIX) ou Mercado Pago. Criar rota de webhook para confirmar pagamento.
**Arquivo:** `artifacts/api-server/src/routes/orders.ts`

#### 🔴 Downloads com URL quebrada (404)
**Problema:** A rota `POST /downloads/:grantId/link` gera um token e retorna `/api/downloads/file/:token`, mas essa rota **não existe** no servidor. O token também não é salvo no banco.
**Solução:** Implementar storage (S3/R2), salvar token em tabela `download_tokens`, criar rota `GET /downloads/file/:token` com validação e redirect signed.
**Arquivo:** `artifacts/api-server/src/routes/downloads.ts`

#### 🔴 LGPD ausente
**Problema:** Sem Termos de Uso, Política de Privacidade, aceite registrado no cadastro, canal para exclusão de dados.
**Solução:** Criar páginas `/termos` e `/privacidade`, checkbox no cadastro com versão dos termos, campos `terms_accepted_at` e `terms_version` na tabela `users`.
**Risco jurídico:** ANPD pode autuar. A LGPD é obrigatória para qualquer plataforma que colete dados de brasileiros.

---

### Importantes P1 (resolver antes de escalar)

| Item | Problema | Solução |
|---|---|---|
| **Token em localStorage** | Vulnerável a XSS | Migrar para cookie `httpOnly; Secure; SameSite=Strict` |
| **RBAC granular** | `support` tem mesmo acesso que `admin` | Criar `requireAdminWrite` / `requireAdminRead` |
| **MFA para admin** | Login admin só com email+senha | Implementar TOTP com `otplib` |
| **Audit logs** | Ações admin sem rastreabilidade | Criar tabela `admin_audit_logs` e middleware de auditoria |
| **E-mails transacionais** | Nenhum e-mail é enviado | Integrar Resend ou SendGrid |
| **Testes automatizados** | Zero testes no projeto | Vitest (unitários/integração) + Playwright (E2E) |
| **Observabilidade** | Sem Sentry, sem alertas | Adicionar `@sentry/node`, health check estruturado |

---

## 14. Melhorias recomendadas

### Curto prazo (próximas semanas)

1. **Gateway de pagamento**
   - Recomendado: **Pagar.me** (melhor suporte Pix nativo no Brasil) ou **Stripe** (mais maduro, tem Pix desde 2023)
   - Criar tabela `payment_intents` para rastrear estado da cobrança
   - Criar endpoint `POST /webhooks/pagamento` para receber confirmação assíncrona

2. **Object storage para arquivos**
   - Usar **Cloudflare R2** (sem custo de egress) ou **AWS S3**
   - Gerar URLs assinadas com expiração de 15 minutos
   - Nunca servir o arquivo diretamente pela API — sempre redirect para storage

3. **Hash de senha seguro**
   ```bash
   pnpm --filter @workspace/api-server add bcryptjs
   pnpm --filter @workspace/api-server add -D @types/bcryptjs
   ```
   Estratégia de migração: re-hash na próxima tentativa de login de cada usuário (lazy migration).

4. **E-mails transacionais**
   - **Resend** (recomendado — melhor DX, plano gratuito generoso)
   - E-mails prioritários: confirmação de compra, boas-vindas, link de download

### Médio prazo (próximos meses)

5. **Avaliações e reviews de produtos**
   - Tabela `product_reviews` (rating 1–5, comentário, userId, productId)
   - Exibir média e contagem na página do produto
   - Filtro por avaliação no catálogo

6. **Sistema de recomendação**
   - "Quem comprou isso também comprou..." baseado em `order_items`
   - Melhorar o endpoint `/products/:id/related` com dados reais de co-compra

7. **Cupons avançados**
   - Cupons vinculados a categorias específicas
   - Cupons de primeiro acesso automáticos no cadastro
   - Cupons de fidelidade (X compras = desconto)

8. **Área do artista/produtor**
   - Upload de produtos pelo próprio produtor
   - Dashboard de royalties por produto vendido
   - Relatório de downloads por período

9. **Notificações in-app**
   - Alertar quando rateio atinge meta
   - Alertar quando créditos estão prestes a expirar
   - Alertar sobre novos produtos na categoria favorita

10. **PWA (Progressive Web App)**
    - Manifest + Service Worker
    - Instalável no celular como app
    - Cache offline do catálogo

### Longo prazo (visão de produto)

11. **App mobile nativo** com Expo (React Native)
    - Preview de áudio com controles avançados (loop, velocidade)
    - Notificações push para rateios e novos lançamentos

12. **Player de stems interativo**
    - Silenciar/ativar faixas individuais no preview
    - Diferencial competitivo alto no mercado

13. **Licenciamento estruturado**
    - Tipos: Pessoal, Comercial, Ministério, Broadcast
    - Preços diferentes por tipo de licença
    - Watermarking de áudio por usuário (fingerprinting)

14. **Afiliados**
    - Links com código de afiliado
    - Comissão por venda gerada
    - Dashboard de afiliado com relatório de conversão

---

## 15. Dicas e boas práticas

### Desenvolvimento no Replit

```
💡 Não rodar pnpm dev na raiz — cada serviço tem seu workflow
💡 Usar localhost:80/api/* para testar (não localhost:8080 diretamente)
💡 Depois de mudar pacotes, reiniciar o workflow correspondente
💡 Verificar erros com pnpm run typecheck:libs (mais rápido) antes do typecheck completo
💡 Secrets nunca no código — sempre via Replit Secrets (Settings → Secrets)
```

### Banco de dados

```
💡 Toda mudança de schema precisa de uma migration (pnpm --filter @workspace/db run migrate)
💡 Nunca rodar ALTER TABLE manualmente em produção — usar Drizzle Kit
💡 O campo updatedAt deve ser atualizado em todo UPDATE (já configurado nos schemas)
💡 Usar transações do PostgreSQL para operações que envolvem múltiplas tabelas (ex: criar pedido + itens + grants)
```

### Segurança

```
⚠️  Nunca logar senhas, tokens ou dados sensíveis — usar req.log apenas com dados seguros
⚠️  Validar todas as entradas com Zod antes de tocar no banco
⚠️  Rate limiting nas rotas de auth (evitar brute-force)
⚠️  CORS configurado explicitamente em produção
⚠️  Headers de segurança com Helmet (já disponível para Express)
```

### Performance

```
💡 TanStack Query já faz cache automático — evitar chamadas duplicadas à API
💡 Usar staleTime nas queries menos críticas (ex: categorias, planos)
💡 Paginação já implementada em produtos e admin — manter limite ≤ 20 por página
💡 Imagens de capa: usar URLs de CDN externo (Cloudinary, ImageKit) em vez de hospedar no servidor
💡 Índices no banco: adicionar index em product.status, product.genre, order.userId, order.status
```

### Qualidade de código

```
💡 Rodar pnpm run typecheck antes de todo commit
💡 Usar os hooks gerados em api-client-react — evitar axios/fetch manual no frontend
💡 Schemas Zod em api-zod são a fonte da verdade para validação
💡 Nunca usar console.log no backend — usar req.log (Pino) ou o logger singleton
```

---

## 16. Glossário do projeto

| Termo | Significado no contexto do MultiTrack Hub |
|---|---|
| **Multitrack** | Arquivo com as faixas separadas de uma música (cada instrumento em uma faixa) |
| **Stem** | Uma faixa individual de um multitrack (ex: "Bateria", "Guitarra Base", "Vocais") |
| **Rateio** | Sistema de compra coletiva onde vários usuários pagam juntos para encomendar a produção de um multitrack |
| **Grant** | Permissão de download concedida a um usuário após compra, crédito ou rateio |
| **Ledger** | Livro-razão de créditos — registro de todas as entradas e saídas de créditos de um usuário |
| **Bearer token** | Tipo de token de autenticação enviado no header `Authorization: Bearer <token>` |
| **Orval** | Ferramenta de codegen que lê o OpenAPI YAML e gera automaticamente os hooks React Query e schemas Zod |
| **Drizzle ORM** | ORM TypeScript type-safe — as queries são escritas em TypeScript e verificadas em tempo de compilação |
| **pnpm workspace** | Estrutura de monorepo onde múltiplos pacotes compartilham dependências sem duplicação |
| **Proxy reverso** | Servidor que redireciona requisições para o serviço correto com base no path (feito pelo Replit automaticamente) |
| **TTL** | Time To Live — tempo de vida de um recurso (ex: sessão expira em 30 dias) |
| **EOL** | End of Life — versão sem mais suporte de segurança (Node 18 e 20 estão EOL) |
| **KDF** | Key Derivation Function — algoritmo lento e seguro para hash de senhas (bcrypt, argon2) |
| **LGPD** | Lei Geral de Proteção de Dados (Lei 13.709/2018) — obrigatória para plataformas com usuários brasileiros |
| **ANPD** | Autoridade Nacional de Proteção de Dados — órgão que fiscaliza o cumprimento da LGPD |
| **P0/P1/P2** | Prioridade de correção: P0 = bloqueador para produção, P1 = importante, P2 = melhoria |

---

*Documento gerado em junho/2026 — MultiTrack Hub*
*Histórico de 8 sessões de desenvolvimento coberto*
