# MultiTrack Hub — Documentação Completa

> Plataforma e-commerce brasileira de multitracks para músicos, bandas, ministérios de louvor e produtores.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura do Projeto](#2-arquitetura-do-projeto)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Banco de Dados](#4-banco-de-dados)
5. [Autenticação e Permissões](#5-autenticação-e-permissões)
6. [API REST](#6-api-rest)
7. [Frontend — Páginas e Funcionalidades](#7-frontend--páginas-e-funcionalidades)
8. [Painel Administrativo](#8-painel-administrativo)
9. [Internacionalização (i18n)](#9-internacionalização-i18n)
10. [Dados Iniciais (Seed)](#10-dados-iniciais-seed)
11. [Variáveis de Ambiente](#11-variáveis-de-ambiente)
12. [Estrutura de Arquivos](#12-estrutura-de-arquivos)
13. [Como Rodar Localmente](#13-como-rodar-localmente)
14. [Fluxos Principais](#14-fluxos-principais)

---

## 1. Visão Geral

O **MultiTrack Hub** é uma plataforma completa de venda de multitracks musicais voltada ao mercado brasileiro. Permite que músicos, produtores e ministérios de louvor comprem, baixem e gerenciem multitracks separadas por instrumento (stems), além de participar de **rateios coletivos** — compras em grupo para encomendar a produção de músicas inéditas.

### Principais diferenciais

| Funcionalidade | Descrição |
|---|---|
| Catálogo completo | Multitracks filtráveis por BPM, tom, gênero, preço |
| Assinatura Premium | R$ 9,90/mês com créditos mensais para downloads |
| Rateios Coletivos | Sistema de compra coletiva com metas e participantes |
| Preview de áudio | Player HTML5 embutido na página do produto |
| Preview de vídeo | Embed do YouTube integrado à página do produto |
| Painel Admin | Dashboard com gráficos, CRUD completo, gestão de usuários |
| Bilíngue PT/EN | Interface completa em Português e Inglês |

---

## 2. Arquitetura do Projeto

O projeto é um **monorepo pnpm** com separação clara entre frontend, backend e bibliotecas compartilhadas.

```
workspace/
├── artifacts/
│   ├── multitrack-hub/        # Frontend React + Vite  (porta dinâmica, path /)
│   └── api-server/            # Backend Express 5      (porta 8080, path /api)
├── lib/
│   ├── db/                    # Schema Drizzle ORM + cliente PostgreSQL
│   ├── api-spec/              # Especificação OpenAPI 3.0 + config orval
│   ├── api-client-react/      # Hooks React Query gerados automaticamente
│   └── api-zod/               # Schemas Zod gerados automaticamente
├── scripts/                   # Scripts utilitários
├── pnpm-workspace.yaml
└── tsconfig.json
```

### Proxy e Roteamento

Um proxy reverso global roteia o tráfego por caminho:

- `/api/*` → `api-server` (porta 8080)
- `/*` → `multitrack-hub` (porta dinâmica)

---

## 3. Stack Tecnológica

### Frontend (`artifacts/multitrack-hub`)

| Categoria | Tecnologia |
|---|---|
| Framework | React 18 + Vite |
| Linguagem | TypeScript |
| Roteamento | Wouter |
| Estado do servidor | TanStack Query (React Query) |
| Estilização | Tailwind CSS |
| Componentes UI | shadcn/ui (Radix UI + Tailwind) |
| Formulários | React Hook Form + Zod |
| Gráficos (admin) | Recharts |
| Internacionalização | i18next + react-i18next |
| Datas | date-fns (com locale ptBR/enUS) |
| Ícones | lucide-react |

### Backend (`artifacts/api-server`)

| Categoria | Tecnologia |
|---|---|
| Framework | Express 5 |
| Linguagem | TypeScript |
| ORM | Drizzle ORM |
| Banco de dados | PostgreSQL |
| Validação | Zod |
| Logging | Pino (`req.log` nos handlers) |
| Autenticação | Bearer token (sessões em banco) |

### Bibliotecas Compartilhadas

| Pacote | Descrição |
|---|---|
| `@workspace/db` | Schema Drizzle, migrações, cliente pg |
| `@workspace/api-spec` | OpenAPI 3.0 YAML + config orval |
| `@workspace/api-client-react` | Hooks React Query gerados via orval |
| `@workspace/api-zod` | Schemas Zod gerados via orval |

---

## 4. Banco de Dados

### Tabelas

#### `users`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | serial PK | ID único |
| `name` | text | Nome completo |
| `email` | text unique | E-mail (login) |
| `password_hash` | text | SHA-256 + SESSION_SECRET |
| `role` | enum | `buyer` \| `member` \| `premium` \| `admin` \| `support` |
| `avatar_url` | text | URL do avatar |
| `is_blocked` | boolean | Bloqueia acesso à plataforma |
| `notes` | text | Anotações internas (admin) |
| `created_at` / `updated_at` | timestamp | Datas de criação/atualização |

#### `sessions`
Armazena tokens de sessão com TTL de 30 dias.

#### `categories`
Categorias musicais (Gospel, Rock, Sertanejo, MPB, Pop, Forró, Pagode, Worship).

#### `products`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | serial PK | ID único |
| `name` | text | Nome da música |
| `artist` | text | Artista |
| `genre` | text | Gênero musical |
| `category_id` | FK | Categoria |
| `tonality` | text | Tom (ex: C#m, G) |
| `bpm` | integer | Batidas por minuto |
| `duration` | text | Duração (ex: "4:32") |
| `description` | text | Descrição detalhada |
| `tracks` | text[] | Lista de faixas/stems incluídos |
| `formats` | text[] | Formatos disponíveis (WAV, etc.) |
| `file_size_mb` | numeric | Tamanho do arquivo |
| `cover_url` | text | URL da capa |
| `preview_audio_url` | text | URL do áudio de preview (30s) |
| `video_url` | text | URL do vídeo YouTube |
| `tags` | text[] | Tags de busca |
| `price` | numeric | Preço normal (R$) |
| `promo_price` | numeric | Preço promocional |
| `quality` | enum | `premium` \| `standard` \| `backing_track` \| `demo` |
| `status` | enum | `active` \| `inactive` \| `draft` \| `featured` |
| `is_featured` | boolean | Exibir em destaques |
| `available_for_subscription` | boolean | Pode ser baixado com créditos |
| `credits_required` | integer | Créditos necessários (padrão: 1) |
| `total_sales` | integer | Contador de vendas |

#### `cart_items` / `cart_coupons`
Itens do carrinho e cupom aplicado, por usuário.

#### `orders` / `order_items`
| Campo | Descrição |
|---|---|
| `status` | `pending` \| `paid` \| `cancelled` \| `refunded` \| `chargeback` |
| `payment_method` | `pix` \| `credit_card` |
| `subtotal`, `discount`, `total` | Valores em R$ |
| `coupon_code` | Cupom utilizado |
| `pix_code` / `pix_qr_code` | Dados de pagamento Pix |

#### `download_grants` / `download_logs`
Permissões de download concedidas ao usuário após compra, uso de crédito ou participação em rateio. Registra histórico de downloads (IP, user-agent).

| Fonte (`source`) | Descrição |
|---|---|
| `purchase` | Compra direta |
| `credit` | Uso de crédito de assinatura |
| `rateio` | Participação em rateio concluído |

#### `plans`
Planos de assinatura disponíveis. Atualmente: **Premium** (R$ 9,90/mês).

#### `subscriptions`
| Campo | Descrição |
|---|---|
| `status` | `active` \| `cancelled` \| `past_due` \| `paused` |
| `current_period_start/end` | Período de vigência |
| `cancel_at_period_end` | Cancela ao fim do período |

#### `credit_ledger`
Livro-razão de créditos por usuário.

| Tipo | Descrição |
|---|---|
| `earned` | Crédito recebido (mensal) |
| `used` | Crédito utilizado em download |
| `refunded` | Crédito devolvido |
| `adjusted` | Ajuste manual pelo admin |
| `expired` | Crédito expirado |

#### `rateios` / `rateio_participants` / `rateio_comments`
Sistema de compra coletiva.

| Status do Rateio | Descrição |
|---|---|
| `suggested` | Sugerido por usuário |
| `in_quotation` | Em cotação com produtores |
| `open` | Aberto para participação |
| `goal_reached` | Meta de participantes atingida |
| `awaiting_payment` | Aguardando pagamento dos participantes |
| `payment_confirmed` | Pagamento confirmado |
| `in_progress` | Em produção |
| `completed` | Concluído — download liberado |
| `cancelled` | Cancelado |
| `refunded` | Reembolsado |

#### `coupons` / `coupon_usages`
| Campo | Descrição |
|---|---|
| `type` | `percentage` (%) ou `fixed` (R$) |
| `max_uses_total` | Limite global de usos |
| `max_uses_per_user` | Limite por usuário |
| `expires_at` | Data de expiração |

#### `wishlist`
Lista de desejos por usuário, referenciando produtos.

---

## 5. Autenticação e Permissões

### Mecanismo

- Senha armazenada como **SHA-256(senha + SESSION_SECRET)**
- Login retorna um **Bearer token** UUID
- Token armazenado no `sessions` do banco com TTL de **30 dias**
- Cliente armazena o token no **localStorage** (`token`)
- Todas as requisições autenticadas enviam `Authorization: Bearer <token>`

### Roles

| Role | Acesso |
|---|---|
| `buyer` | Catálogo, carrinho, compras, downloads, rateios |
| `member` | Idem + funcionalidades de membro |
| `premium` | Idem + uso de créditos mensais |
| `admin` | Acesso total + painel administrativo |
| `support` | Visualização do painel admin |

### Credenciais de teste

| Usuário | Email | Senha | Role |
|---|---|---|---|
| Admin | `admin@multitrack.com` | `admin123` | admin |

---

## 6. API REST

Todos os endpoints têm o prefixo `/api`.

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/register` | Criar conta | Não |
| POST | `/auth/login` | Login, retorna token | Não |
| POST | `/auth/logout` | Invalidar token | Sim |
| GET | `/auth/me` | Dados do usuário logado | Sim |

### Catálogo

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/categories` | Lista categorias com contagem | Não |
| GET | `/products` | Lista produtos com filtros e paginação | Opcional |
| GET | `/products/featured` | Produtos em destaque | Não |
| GET | `/products/bestsellers` | Produtos mais vendidos | Não |
| GET | `/products/:id` | Detalhe completo do produto | Opcional |
| GET | `/products/:id/related` | Produtos relacionados (mesmo gênero) | Não |

**Filtros disponíveis em `/products`:**
`q`, `categoryId`, `genre`, `minBpm`, `maxBpm`, `minPrice`, `maxPrice`, `sort` (`recent`, `popular`, `price_asc`, `price_desc`, `name_asc`), `page`, `limit`

### Carrinho

| Método | Rota | Descrição |
|---|---|---|
| GET | `/cart` | Carrinho do usuário com totais |
| POST | `/cart/items` | Adicionar item `{ productId }` |
| DELETE | `/cart/items/:id` | Remover item |
| POST | `/cart/coupon` | Aplicar cupom `{ code }` |
| POST | `/cart/coupon/remove` | Remover cupom |

### Pedidos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/orders` | Histórico de pedidos do usuário |
| POST | `/orders` | Criar pedido a partir do carrinho |
| GET | `/orders/:id` | Detalhe do pedido com itens |
| POST | `/orders/:id/pay` | Simular pagamento do pedido |

### Downloads

| Método | Rota | Descrição |
|---|---|---|
| GET | `/downloads` | Downloads disponíveis do usuário |
| POST | `/downloads/:grantId/link` | Gerar link de download |

### Assinaturas e Créditos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/subscriptions/plans` | Planos disponíveis |
| GET | `/subscriptions/me` | Assinatura ativa do usuário |
| POST | `/subscriptions/me` | Assinar plano `{ planId }` |
| DELETE | `/subscriptions/me` | Cancelar assinatura |
| GET | `/credits` | Saldo e histórico de créditos |
| POST | `/credits/use` | Usar crédito para download `{ productId }` |

### Rateios

| Método | Rota | Descrição |
|---|---|---|
| GET | `/rateios` | Lista rateios com filtros |
| POST | `/rateios` | Sugerir novo rateio |
| GET | `/rateios/:id` | Detalhe + participantes |
| POST | `/rateios/:id/join` | Participar de rateio |
| GET | `/rateios/:id/comments` | Comentários do rateio |
| POST | `/rateios/:id/comments` | Adicionar comentário |

### Lista de Desejos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/wishlist` | Wishlist do usuário |
| POST | `/wishlist/:productId` | Adicionar produto |
| DELETE | `/wishlist/:productId` | Remover produto |

### Admin (requer role `admin`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/dashboard` | Métricas: receita, MRR, pedidos, usuários, top produtos |
| GET | `/admin/products` | Lista produtos (com filtro e paginação) |
| POST | `/admin/products` | Criar produto |
| PUT | `/admin/products/:id` | Atualizar produto |
| DELETE | `/admin/products/:id` | Desativar produto |
| GET | `/admin/orders` | Lista todos os pedidos |
| GET | `/admin/users` | Lista usuários |
| GET | `/admin/users/:id` | Detalhe do usuário |
| PATCH | `/admin/users/:id` | Atualizar role, bloquear, notas |
| GET | `/admin/rateios` | Lista todos os rateios |
| PATCH | `/admin/rateios/:id/status` | Atualizar status do rateio |
| GET | `/admin/coupons` | Lista cupons |
| POST | `/admin/coupons` | Criar cupom |
| POST | `/admin/credits` | Ajustar créditos de usuário |

---

## 7. Frontend — Páginas e Funcionalidades

### Páginas Públicas

#### `/` — Home
- Hero com busca rápida
- Seção de lançamentos em destaque (produtos `isFeatured`)
- Grade de categorias musicais
- Seção de mais vendidos
- Bloco de features da plataforma (qualidade, assinatura, rateios)
- CTA para cadastro/planos

#### `/catalog` — Catálogo
- Grade responsiva de produtos (cards com capa, artista, BPM, preço)
- Barra de filtros: busca por texto, categoria, ordenação
- Contador de resultados
- Estado vazio com opção de limpar filtros

#### `/products/:id` — Detalhe do Produto
- Capa com player de preview de áudio (hover)
- Player de áudio HTML5 separado (30 segundos)
- Título, artista, gênero, categoria, badge Premium/Destaque
- Metadados: BPM, Tom, Duração, Tamanho do arquivo
- Botão "Adicionar ao Carrinho" + botão "Favoritar"
- Preço com desconto promocional e opção de crédito
- **Embed de vídeo YouTube** (quando `videoUrl` cadastrado)
- Descrição da multitrack
- Lista de faixas/stems incluídos
- Painel lateral: Garantias, Compartilhar link
- Produtos relacionados (mesmo gênero)

#### `/plans` — Planos
- Comparativo Free vs Premium
- Detalhes dos créditos mensais e acúmulo
- Caixa explicativa sobre rateios
- Caixa explicativa sobre créditos
- Botão para assinar / criar conta

#### `/rateios` — Rateios Coletivos
- Lista de rateios com status, progresso, valor por pessoa
- Badge de status colorida por fase
- Prazo de participação
- Modal para sugerir nova música (campo: nome, artista, gênero, referência, justificativa)
- Estado vazio incentivando sugestão

#### `/rateios/:id` — Detalhe do Rateio
- Header com capa, nome, artista, status
- Barra de progresso (participantes atuais / meta)
- Valor por pessoa
- Botão "Participar" (apenas logados e status `open`)
- Timeline de comentários com badge Admin
- Campo para adicionar comentário (logados)

### Páginas Autenticadas

#### `/login` e `/register`
- Formulários com validação Zod
- Feedback de erro em toast
- Layout com imagem de fundo e descrição da plataforma
- Link entre login/cadastro

#### `/cart` — Carrinho
- Lista de itens com capa, nome, artista, preço
- Botão remover por item
- Campo de cupom com aplicação e remoção
- Resumo: subtotal, desconto, total
- Botão para finalizar compra (redireciona para `/checkout`)
- Estado vazio com link para catálogo

#### `/checkout` — Checkout
- Seleção de método de pagamento (Pix / Cartão)
- Resumo do pedido com itens
- Totais com desconto
- Simulação de pagamento (fluxo de desenvolvimento)
- Feedback de sucesso com redirecionamento para downloads

#### `/orders` — Meus Pedidos
- Lista de pedidos com status colorido, data, valor, quantidade de itens
- Badge de status: Pendente, Pago, Cancelado, Reembolsado
- Link para detalhe de cada pedido

#### `/orders/:id` — Detalhe do Pedido
- Itens com nome, artista, preço
- Botão de download por item (quando `paid`)
- Resumo financeiro: subtotal, desconto, total
- Método de pagamento e cupom utilizado

#### `/downloads` — Meus Downloads
- Todos os grants de download do usuário
- Origem: Compra / Crédito / Rateio
- Contador de downloads realizados
- Botão para gerar link e baixar novamente

#### `/subscription` — Minha Assinatura
- Status da assinatura ativa com período vigente
- Saldo de créditos (barra visual)
- Histórico do ledger de créditos com tipo e data
- Botão para cancelar assinatura (cancela ao fim do período)
- Link para planos quando sem assinatura

#### `/wishlist` — Lista de Desejos
- Grid de produtos favoritados com data de adição
- Remoção direta de cada item
- Estado vazio com link para catálogo

---

## 8. Painel Administrativo

Acessível em `/admin/*`, requer role `admin`.

### Dashboard (`/admin`)
- Cards de métricas: Receita Total, MRR, Pedidos, Usuários Premium, Downloads
- Gráfico de barras: Receita por Canal (Compra Direta, Assinatura, Bundle, Rateio)
- Top 5 produtos por receita e vendas

### Produtos (`/admin/products`)
- Tabela com capa, nome, artista, preço (com promo), status, vendas
- Filtro de busca por nome
- Dropdown por produto: Editar / Desativar
- Botão "Criar" → formulário completo

#### Formulário de Criação/Edição
Campos disponíveis:
- Nome da música, Artista, Gênero
- BPM, Tom (tonality)
- Descrição
- Preço normal, Preço promocional
- Qualidade (`premium`, `standard`, `backing_track`, `demo`)
- Status (`draft`, `active`, `inactive`, `featured`)
- URL da capa, URL do áudio de preview
- **URL do vídeo YouTube** (suporta youtube.com/watch?v=, youtu.be/, youtube.com/shorts/)
- Switch: Destaque na home
- Switch: Disponível via assinatura + créditos necessários

### Pedidos (`/admin/orders`)
- Tabela com ID, data, cliente, itens, total, status
- Filtro de busca
- Status colorido: Pago (verde), Pendente (âmbar), Cancelado (vermelho)

### Usuários (`/admin/users`)
- Tabela com nome, email, role badge, pedidos, total gasto, data de cadastro
- Filtro de busca
- Link para detalhe de cada usuário

#### Detalhe do Usuário (`/admin/users/:id`)
- Alterar role (`buyer`, `member`, `premium`, `admin`)
- Toggle bloquear/desbloquear usuário
- Campo de anotações internas
- Resumo: cadastro, total gasto, pedidos, créditos atuais
- Pedidos recentes (últimos 5)
- Card de assinatura ativa (se houver)

### Rateios (`/admin/rateios`)
- Tabela: música, artista, meta, participantes, % concluído, status atual
- Select inline para alterar status de cada rateio

### Cupons (`/admin/coupons`)
- Tabela: código, desconto, usos, validade, status ativo/inativo
- Dialog para criar novo cupom: código, tipo (% ou R$), valor, limite de usos, validade

### Créditos (`/admin/credits`)
- Formulário para ajuste manual: ID do usuário, quantidade (positivo = adicionar, negativo = remover), motivo
- Registrado no ledger como tipo `adjusted`

---

## 9. Internacionalização (i18n)

A interface suporta **Português (pt-BR)** e **Inglês (en-US)**.

### Implementação
- Biblioteca: `i18next` + `react-i18next`
- Configuração: `src/lib/i18n.ts`
- Arquivos de tradução: `src/locales/pt.json` e `src/locales/en.json`
- Idioma padrão: `pt` (detectado do localStorage)
- Persistência: `localStorage.setItem("lang", "pt"|"en")`

### Troca de idioma
O botão **PT ↔ EN** com ícone de globo está na Navbar (visível em telas `sm+`). A troca é instantânea e persistida entre sessões.

### Namespaces de Tradução

| Namespace | Uso |
|---|---|
| `nav` | Navbar e links de navegação |
| `footer` | Rodapé |
| `home` | Página inicial |
| `catalog` | Catálogo e filtros |
| `product` | Detalhe do produto |
| `cart` | Carrinho |
| `checkout` | Checkout |
| `orders` | Pedidos |
| `order_detail` | Detalhe do pedido |
| `downloads` | Downloads |
| `plans` | Planos e assinatura |
| `subscription` | Assinatura e créditos |
| `rateios` | Rateios coletivos |
| `wishlist` | Lista de desejos |
| `auth` | Login e cadastro |
| `admin` | Painel administrativo |
| `common` | Textos genéricos (salvar, cancelar, erro…) |

---

## 10. Dados Iniciais (Seed)

Ao executar o seed, o banco é populado com:

### Categorias (8)
Gospel, Rock, Sertanejo, MPB, Pop, Forró, Pagode, Worship

### Produtos (12)
Multitracks com imagens reais, BPM, tons, listas de faixas (stems), preços variados.

### Rateios (4)
Em diferentes fases: `open`, `in_quotation`, `suggested`, com participantes e comentários.

### Cupons (3)
| Código | Tipo | Desconto |
|---|---|---|
| `BEMVINDO10` | Porcentagem | 10% |
| `GOSPEL20` | Porcentagem | 20% |
| `FRETE5` | Fixo | R$ 5,00 |

### Plano Premium (1)
- Nome: Premium
- Preço: R$ 9,90/mês
- Créditos: 3/mês
- Máximo acumulado: 6 créditos

### Usuários de teste (3)
Inclui o usuário admin.

---

## 11. Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL | Sim |
| `SESSION_SECRET` | Segredo para hash de senhas | Sim |
| `PORT` | Porta de cada serviço (injetada automaticamente) | Automático |

## 11.1. Versão do Node.js

O projeto padroniza **Node.js 24 LTS** como runtime de produção e desenvolvimento.

| Arquivo | Conteúdo | Finalidade |
|---|---|---|
| `.nvmrc` | `24` | nvm / fnm — troca automática de versão ao entrar no diretório |
| `.node-version` | `24` | Ferramentas alternativas (nodenv, Volta, etc.) |
| `package.json` (`engines`) | `"node": ">=24 <25"` | Aviso em `npm install` se versão incompatível |

> **Atenção:** Node.js 18 e Node.js 20 estão EOL ou encerrando suporte ativo e **não devem ser usados** neste projeto em produção.

---

## 12. Estrutura de Arquivos

```
artifacts/multitrack-hub/src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Navegação + alternador de idioma
│   │   ├── Footer.tsx          # Rodapé
│   │   └── AdminLayout.tsx     # Layout do painel admin (sidebar)
│   ├── ProductCard.tsx         # Card de produto reutilizável
│   └── ui/                     # Componentes shadcn/ui
├── lib/
│   ├── i18n.ts                 # Configuração do i18next
│   └── utils.ts                # formatCurrency, formatDate, cn()
├── locales/
│   ├── pt.json                 # Traduções Português
│   └── en.json                 # Traduções Inglês
├── pages/
│   ├── home.tsx
│   ├── catalog.tsx
│   ├── product-detail.tsx
│   ├── plans.tsx
│   ├── rateios.tsx
│   ├── rateio-detail.tsx
│   ├── cart.tsx
│   ├── checkout.tsx
│   ├── orders.tsx
│   ├── order-detail.tsx
│   ├── downloads.tsx
│   ├── subscription.tsx
│   ├── wishlist.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── not-found.tsx
│   └── admin/
│       ├── dashboard.tsx
│       ├── orders.tsx
│       ├── coupons.tsx
│       ├── credits.tsx
│       ├── rateios.tsx
│       ├── products/
│       │   ├── index.tsx       # Lista de produtos
│       │   ├── new.tsx         # Criar produto
│       │   └── edit.tsx        # Editar produto
│       └── users/
│           ├── index.tsx       # Lista de usuários
│           └── detail.tsx      # Detalhe/edição do usuário
└── main.tsx                    # Entrypoint + React Query + Router

artifacts/api-server/src/
├── routes/
│   ├── auth.ts
│   ├── catalog.ts
│   ├── cart.ts
│   ├── orders.ts
│   ├── downloads.ts
│   ├── subscriptions.ts
│   ├── credits.ts
│   ├── rateios.ts
│   ├── wishlist.ts
│   ├── admin.ts
│   └── health.ts
├── lib/
│   ├── auth.ts                 # Middlewares requireAuth, requireAdmin, optionalAuth
│   └── logger.ts               # Logger Pino
├── app.ts                      # Setup Express + middlewares
└── index.ts                    # Entrypoint

lib/db/src/
├── schema/
│   ├── users.ts
│   ├── sessions.ts
│   ├── categories.ts
│   ├── products.ts
│   ├── cart.ts
│   ├── orders.ts
│   ├── downloads.ts
│   ├── subscriptions.ts
│   ├── credits.ts (credit_ledger)
│   ├── rateios.ts
│   ├── coupons.ts
│   └── wishlist.ts
└── index.ts                    # Exporta db client + todas as tabelas
```

---

## 13. Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- pnpm 8+
- PostgreSQL (ou usar o banco provisionado automaticamente no Replit)

### Passos

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
# DATABASE_URL e SESSION_SECRET devem estar disponíveis

# 3. Rodar migrações do banco
pnpm --filter @workspace/db run migrate

# 4. Popular com dados iniciais
pnpm --filter @workspace/db run seed

# 5. Gerar tipos a partir do OpenAPI (opcional, já commitados)
pnpm --filter @workspace/api-spec run codegen

# 6. Iniciar os serviços (via workflows do Replit ou manualmente)
pnpm --filter @workspace/api-server run dev    # API na porta 8080
pnpm --filter @workspace/multitrack-hub run dev  # Frontend na porta dinâmica
```

> No Replit, os workflows `API Server` e `web` iniciam automaticamente.

### Verificar saúde da API
```bash
curl localhost:80/api/health
```

---

## 14. Fluxos Principais

### Fluxo de Compra Direta
```
1. Usuário navega no catálogo ou home
2. Clica em produto → página de detalhe
3. Ouve preview de 30s
4. Clica "Adicionar ao Carrinho"
5. Acessa /cart
6. (Opcional) aplica cupom
7. Clica "Finalizar Compra" → /checkout
8. Seleciona método (Pix ou Cartão)
9. Confirma pedido → status: pending
10. Clica "Pagar" → status: paid
11. Download Grant criado automaticamente
12. Redireciona para /downloads
13. Usuário baixa o arquivo
```

### Fluxo de Assinatura + Crédito
```
1. Usuário acessa /plans
2. Clica "Assinar Premium"
3. Assinatura criada → role atualizada para "premium"
4. Mensalmente: créditos adicionados ao ledger (tipo: earned)
5. Usuário acessa produto → vê opção "Usar Crédito"
6. POST /credits/use → crédito debitado + download grant criado
7. Usuário baixa imediatamente
```

### Fluxo de Rateio
```
1. Usuário sugere música em /rateios (modal)
2. Admin avalia e atualiza status para "in_quotation" ou "open"
3. Com status "open": usuários podem participar (POST /rateios/:id/join)
4. Barra de progresso reflete participantes / meta
5. Admin atualiza para "goal_reached" quando meta é atingida
6. Admin confirma pagamento → "payment_confirmed"
7. Produção → "in_progress"
8. Multitrack entregue → "completed"
9. Download grants criados para todos os participantes (source: rateio)
10. Produto é cadastrado no catálogo (campo productId no rateio)
```

### Fluxo Admin — Cadastro de Produto
```
1. Admin acessa /admin/products
2. Clica "Criar"
3. Preenche: nome, artista, gênero, BPM, tom, descrição
4. Define preços (normal + promo)
5. Define qualidade e status (draft para não publicar ainda)
6. Insere URLs: capa, preview de áudio, vídeo YouTube (opcional)
7. Configura: destaque, disponível por assinatura, créditos necessários
8. Salva → produto criado como draft
9. Quando pronto: editar e mudar status para "active" ou "featured"
```

---

## Resumo do Status

| Módulo | Status |
|---|---|
| Catálogo com filtros e busca | ✅ Completo |
| Página de produto com áudio | ✅ Completo |
| Embed de vídeo YouTube | ✅ Completo |
| Carrinho e cupons | ✅ Completo |
| Checkout (Pix/Cartão) | ✅ Completo |
| Histórico de pedidos | ✅ Completo |
| Sistema de downloads | ✅ Completo |
| Assinatura Premium | ✅ Completo |
| Sistema de créditos | ✅ Completo |
| Rateios coletivos | ✅ Completo |
| Lista de desejos | ✅ Completo |
| Autenticação e perfis | ✅ Completo |
| Painel admin — Dashboard | ✅ Completo |
| Painel admin — Produtos CRUD | ✅ Completo |
| Painel admin — Pedidos | ✅ Completo |
| Painel admin — Usuários | ✅ Completo |
| Painel admin — Rateios | ✅ Completo |
| Painel admin — Cupons | ✅ Completo |
| Painel admin — Créditos | ✅ Completo |
| Internacionalização PT/EN | ✅ Completo |
| Design dark studio + cyan | ✅ Completo |
| API OpenAPI + codegen | ✅ Completo |

---

## 15. Infraestrutura de Produção

### Visão geral

```
Usuário
  │ HTTPS
  ▼
Cloudflare (DNS + Proxy)
  │ Tunnel (TCP)
  ▼
VPS prata.zzux.com  (x86_64 Ubuntu)
  │
  ▼
Coolify  ──► coolify-proxy (Traefik)  ←── detecta labels Docker automaticamente
                │
                ├── /           → multitrack_web  (Nginx :80)
                │                     │ /api/*
                │                     ▼
                │               multitrack_api  (Express :8080)
                │                     │
                │                     ▼
                │               multitrack_postgres  (PostgreSQL :5432)
                │
                └── /hooks      → multitrack_webhook  (Python :9001)
```

### Dados do VPS

| Item | Valor |
|---|---|
| Host | `prata.zzux.com` |
| Usuário | `root` |
| Chave SSH | `~/.ssh/vps_key` (ed25519) |
| Arquitetura | **x86_64** (Intel/AMD 64-bit) |
| Diretório do projeto | `/opt/multitrack/` |
| Painel Coolify | `https://painel.macarsalao.com.br` |

### Como acessar o VPS

```bash
ssh -i ~/.ssh/vps_key root@prata.zzux.com
```

### Containers Docker em produção

| Container | Imagem | Função |
|---|---|---|
| `multitrack_web` | `multitrack-web` (Nginx) | Serve o frontend React |
| `multitrack_api` | `multitrack-api` (Node.js 24) | API Express backend |
| `multitrack_postgres` | `postgres:16-alpine` | Banco de dados |
| `multitrack_webhook` | `multitrack-webhook` (Python) | Recebe webhooks do GitHub |

### Arquivos de configuração Docker no VPS

```
/opt/multitrack/
├── docker-compose.yml                    # Serviços base (web, api, postgres, migrate)
├── docker-compose.coolify-override.yml   # Labels Traefik + serviço webhook
├── Dockerfile.migrate                    # Container para rodar migrações
├── Dockerfile.webhook                    # Container do servidor webhook
├── webhook_server.py                     # Servidor Python para o webhook
├── deploy.sh                             # Script de deploy automático
└── .env                                  # Variáveis de ambiente (NÃO commitado)
```

### Variáveis de ambiente em produção

Ficam no arquivo `/opt/multitrack/.env` no VPS. As principais:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | `postgresql://multitrack:SENHA@postgres:5432/multitrack_db` |
| `SESSION_SECRET` | Segredo para hash de senhas (SHA-256) |
| `CORS_ORIGIN` | `https://multitrack.macarsalao.com.br` |
| `WEBHOOK_SECRET` | Segredo HMAC para validar webhooks do GitHub |
| `POSTGRES_USER` / `_PASSWORD` / `_DB` | Credenciais do PostgreSQL |

> **Nunca commite o `.env` com valores reais.** Use `.env.example` para documentar a estrutura.

### Repositório GitHub

| Item | Valor |
|---|---|
| Repositório | `https://github.com/swnsolucoes/Multitrack` |
| Branch principal | `main` |
| Webhook configurado | `https://multitrack.macarsalao.com.br/hooks/deploy` |

---

## 16. Auto-deploy (GitHub → VPS)

### Como funciona

Qualquer `git push` para a branch `main` dispara automaticamente o deploy em produção:

```
git push origin main
  │
  ▼
GitHub detecta push na branch main
  │
  ▼
GitHub envia POST HTTPS para /hooks/deploy
  │   (com assinatura HMAC-SHA256)
  ▼
multitrack_webhook (Python :9001)
  │  valida assinatura → dispara deploy em thread background
  ▼
deploy.sh
  ├── git pull origin main         (atualiza o código no VPS)
  ├── docker compose build api web (reconstrói as imagens)
  ├── docker compose up -d api web postgres (sobe os novos containers)
  └── aguarda API ficar healthy    (até 2 minutos)
```

### Tempo médio de deploy

~45–90 segundos (a maior parte é o build Docker com cache).

### Monitorar um deploy em andamento

```bash
ssh -i ~/.ssh/vps_key root@prata.zzux.com
docker logs -f multitrack_webhook
```

### Testar manualmente (sem precisar fazer push)

```bash
# Usar a URL de teste do GitHub (simula um push no main)
curl -X POST \
  -H "Authorization: token SEU_GITHUB_TOKEN" \
  https://api.github.com/repos/swnsolucoes/Multitrack/hooks/634806682/test
```

### Detalhes do componente webhook

| Arquivo | Função |
|---|---|
| `Dockerfile.webhook` | python:3.12-slim + git + docker CLI x86_64 + compose plugin v2.29.7 |
| `webhook_server.py` | Servidor HTTP Python — valida HMAC, roda deploy em thread |
| `deploy.sh` | git pull + build api/web + up (webhook excluído para evitar recursão) |
| `docker-compose.coolify-override.yml` | Define o serviço webhook + labels Traefik HTTPS |

> **Por que o webhook não reconstrói a si mesmo?** Se o `deploy.sh` incluísse o serviço `webhook` no `docker compose up -d`, ele mataria o próprio container que está rodando o script. Por isso `deploy.sh` faz `build api web` e `up -d api web postgres` explicitamente.

---

## 17. Guia para Modificações Futuras

### Fazer uma alteração no código

```bash
# 1. Faça suas edições no Replit (ou localmente)

# 2. Commite e faça push para o main
git add .
git commit -m "feat: descrição da mudança"
git push origin main

# 3. O deploy acontece automaticamente em ~1 minuto
# Monitore com:
ssh -i ~/.ssh/vps_key root@prata.zzux.com 'docker logs -f multitrack_webhook'
```

### Adicionar uma nova tabela ao banco

1. Crie o schema em `lib/db/src/schema/nova-tabela.ts`
2. Exporte-o em `lib/db/src/index.ts`
3. Em desenvolvimento, rode `pnpm --filter @workspace/db run push`
4. Em produção, o container `migrate` do `docker-compose.yml` roda automaticamente no deploy

### Adicionar um novo endpoint à API

1. Crie ou edite o arquivo em `artifacts/api-server/src/routes/`
2. Registre a rota em `artifacts/api-server/src/routes/index.ts`
3. Atualize o OpenAPI spec em `lib/api-spec/openapi.yaml`
4. Rode codegen: `pnpm --filter @workspace/api-spec run codegen`
5. Faça push → deploy automático

### Adicionar uma nova página no frontend

1. Crie o componente em `artifacts/multitrack-hub/src/pages/`
2. Registre a rota em `artifacts/multitrack-hub/src/main.tsx`
3. Adicione as traduções em `src/locales/pt.json` e `src/locales/en.json`
4. Faça push → deploy automático

### Alterar dados de seed (banco de desenvolvimento)

```bash
# Editar o script de seed
# artifacts/api-server/src/seed.ts (ou script equivalente)

# Rodar no Replit
pnpm --filter @workspace/db run seed
```

### Inserir dados no banco de produção diretamente

```bash
ssh -i ~/.ssh/vps_key root@prata.zzux.com

# Acessar o PostgreSQL
docker exec -it multitrack_postgres \
  psql -U multitrack -d multitrack_db

# Exemplo — criar usuário admin extra:
INSERT INTO users (name, email, password_hash, role)
VALUES ('Nome', 'email@dominio.com',
  encode(sha256(('senha' || current_setting('app.session_secret'))::bytea), 'hex'),
  'admin');

# Ou gerar o hash externamente:
python3 -c "
import hashlib, os
secret = 'SEU_SESSION_SECRET'
print(hashlib.sha256(('suasenha' + secret).encode()).hexdigest())
"
```

---

*Documentação atualizada em junho de 2026 — MultiTrack Hub v1.1*
