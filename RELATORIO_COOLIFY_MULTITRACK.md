# Relatório de Auditoria — Coolify Deploy (MultiTrack Hub)

> Auditoria realizada antes da criação dos arquivos de deploy.
> Nenhuma alteração de código de negócio foi feita.
> Data: junho/2026

---

## 1. Estrutura Real do Projeto

```
workspace/                          ← Monorepo pnpm
├── artifacts/
│   ├── api-server/                 ← Backend Express 5
│   │   ├── src/
│   │   │   ├── app.ts              ← Express + CORS + pino-http
│   │   │   ├── index.ts            ← Entrypoint (porta via PORT)
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts         ← Middlewares + hash SHA-256
│   │   │   │   └── logger.ts       ← Singleton pino
│   │   │   └── routes/             ← 11 arquivos de rota
│   │   ├── build.mjs               ← Build esbuild (bundle → dist/index.mjs)
│   │   ├── dist/                   ← Output do build (gerado)
│   │   └── package.json
│   └── multitrack-hub/             ← Frontend React + Vite
│       ├── src/
│       │   ├── pages/              ← 26 páginas
│       │   ├── components/         ← Layout + shadcn/ui
│       │   ├── lib/                ← AuthContext, i18n, utils
│       │   └── locales/            ← pt.json, en.json
│       ├── vite.config.ts          ← ⚠️ Exige PORT e BASE_PATH obrigatórios
│       ├── dist/public/            ← Output do build Vite (gerado)
│       └── package.json
├── lib/
│   ├── db/                         ← Schema Drizzle + cliente pg
│   │   ├── src/schema/             ← 13 arquivos de schema
│   │   ├── drizzle.config.ts       ← Exige DATABASE_URL
│   │   └── package.json            ← scripts: push, push-force
│   ├── api-client-react/           ← Hooks React Query (gerados por orval)
│   ├── api-zod/                    ← Schemas Zod (gerados por orval)
│   └── api-spec/                   ← OpenAPI 3.0 YAML
├── scripts/
├── .nvmrc                          ← "24"
├── .node-version                   ← "24"
├── package.json                    ← engines: node >=24 <25
└── pnpm-workspace.yaml
```

### Banco de dados
- **ORM:** Drizzle ORM
- **Driver:** `pg` (node-postgres)
- **19 tabelas:** users, sessions, categories, products, cart_items, cart_coupons, orders,
  order_items, download_grants, download_logs, plans, subscriptions, credit_ledger, rateios,
  rateio_participants, rateio_comments, coupons, coupon_usages, wishlist
- **Migrações:** via `drizzle-kit push` (sem pasta de migrations gerada — push direto no schema)

### Variáveis de ambiente identificadas no código

| Variável | Onde é usada | Obrigatória |
|---|---|---|
| `DATABASE_URL` | `lib/db/drizzle.config.ts`, cliente pg | Sim |
| `SESSION_SECRET` | `artifacts/api-server/src/lib/auth.ts` | Sim |
| `PORT` | `artifacts/api-server/src/index.ts`, `vite.config.ts` | Sim |
| `BASE_PATH` | `artifacts/multitrack-hub/vite.config.ts` | Sim (build-time) |
| `NODE_ENV` | `vite.config.ts` (condicional plugins Replit) | Recomendada |
| `REPL_ID` | `vite.config.ts` (condicional plugins Replit) | Não (Replit only) |

---

## 2. Scripts Disponíveis

### Raiz (`workspace`)
| Script | Comando |
|---|---|
| `build` | `pnpm run typecheck && pnpm -r --if-present run build` |
| `typecheck:libs` | `tsc --build` |
| `typecheck` | `typecheck:libs` + typecheck de todos os artifacts |

### Backend (`@workspace/api-server`)
| Script | Comando |
|---|---|
| `dev` | `NODE_ENV=development pnpm run build && pnpm run start` |
| `build` | `node ./build.mjs` (esbuild → `dist/index.mjs`) |
| `start` | `node --enable-source-maps ./dist/index.mjs` |
| `typecheck` | `tsc -p tsconfig.json --noEmit` |

> ⚠️ Não há `test`, `lint` ou `migrate`. Sem scripts de seed separados.

### Frontend (`@workspace/multitrack-hub`)
| Script | Comando |
|---|---|
| `dev` | `vite --config vite.config.ts --host 0.0.0.0` |
| `build` | `vite build --config vite.config.ts` |
| `serve` | `vite preview --config vite.config.ts --host 0.0.0.0` |
| `typecheck` | `tsc -p tsconfig.json --noEmit` |

> ⚠️ Não há `test` ou `lint`.

### Banco (`@workspace/db`)
| Script | Comando |
|---|---|
| `push` | `drizzle-kit push --config ./drizzle.config.ts` |
| `push-force` | `drizzle-kit push --force --config ./drizzle.config.ts` |

> ⚠️ Sem script `migrate` — o projeto usa `drizzle-kit push` (sincronização direta com o schema).
> Em produção, isso aplica mudanças sem arquivo de migration rastreável — risco de dados.

---

## 3. Dependências do Replit a Adaptar

### 3.1 Proxy reverso automático
**No Replit:** Um proxy nginx gerenciado pelo Replit roteia `/api/*` para a API e `/*` para o
frontend automaticamente. Não existe nenhuma configuração customizada de proxy.

**Fora do Replit:** Necessário um nginx próprio no container do frontend que faça o proxy
`/api/` → serviço `api` internamente. O `docker-compose.yml` e o `Dockerfile` do frontend
incluem essa configuração.

### 3.2 PORT dinâmico
**No Replit:** A variável `PORT` é injetada automaticamente por cada workflow. O `vite.config.ts`
lança exceção se `PORT` não estiver definido.

**Fora do Replit:** Definir `PORT=8080` fixo para a API e passar `PORT=80` como arg de build para
o Vite. O Nginx no container do frontend escuta na porta 80 e faz proxy para a API.

### 3.3 BASE_PATH
**No Replit:** Injetada automaticamente para cada artifact (ex: `/multitrack-hub`). O `vite.config.ts`
lança exceção se `BASE_PATH` não estiver definido.

**Fora do Replit:** Passar `BASE_PATH=/` como build arg. O app rodará na raiz do domínio.

### 3.4 Plugins Replit no Vite
O `vite.config.ts` carrega plugins condicionalmente:
```typescript
// Estes só carregam quando REPL_ID está definido — não impactam build fora do Replit
@replit/vite-plugin-cartographer
@replit/vite-plugin-dev-banner

// Este é sempre carregado — apenas afeta ambiente de dev, ignorado em build de produção
@replit/vite-plugin-runtime-error-modal
```
**Fora do Replit:** Os plugins Replit não serão carregados (REPL_ID ausente). O `runtimeErrorOverlay`
é um overlay de dev sem efeito em produção (`NODE_ENV=production`).

### 3.5 Banco de dados provisionado
**No Replit:** PostgreSQL criado automaticamente, `DATABASE_URL` injetada pelo ambiente.

**Fora do Replit:** Container `postgres` no `docker-compose.yml`. Variáveis `POSTGRES_USER`,
`POSTGRES_PASSWORD`, `POSTGRES_DB` e `DATABASE_URL` devem ser definidas manualmente no Coolify.

### 3.6 Secrets gerenciados
**No Replit:** `SESSION_SECRET` gerenciado pelo painel de Secrets do Replit.

**Fora do Replit:** Configurar como variável de ambiente no painel do Coolify. Nunca colocar no
`docker-compose.yml` ou `.env` comitados.

### 3.7 Workflows
**No Replit:** Workflows gerenciam o ciclo de vida dos processos (start, stop, restart).

**Fora do Replit:** Docker Compose gerencia os serviços com `restart: unless-stopped`.

---

## 4. Riscos para Rodar Fora do Replit

### 4.1 Build — MÉDIO
- `vite.config.ts` exige `PORT` e `BASE_PATH` em tempo de build. Resolvido passando como
  build args no Dockerfile.
- O build do backend (`build.mjs`) usa esbuild com externals específicos. Compatível com Docker.
- Output do frontend em `dist/public/` (não `dist/`) — o Dockerfile copia o caminho correto.

### 4.2 Banco de dados — ALTO
- Nenhuma pasta de migrations gerada. O `drizzle-kit push` altera o schema diretamente.
- Em produção real, uma falha durante o push pode corromper dados.
- **Recomendação:** Para staging, aceitar `push`. Para produção real futura, migrar para
  `drizzle-kit generate` + `drizzle-kit migrate`.

### 4.3 Sessão / Autenticação — MÉDIO
- `SESSION_SECRET` deve estar definido. Se ausente, `hashPassword` resulta em hash diferente
  e todos os logins falham.
- Tokens armazenados em `localStorage` (não httpOnly cookie) — risco XSS pré-existente,
  não introduzido pelo Docker.

### 4.4 CORS — ALTO
- `app.use(cors())` sem configuração → permite qualquer origem. Em produção, deve ser
  restrito a `APP_URL`. O `docker-compose.yml` e a documentação indicam como configurar.
- Necessário ajustar o código para ler `CORS_ORIGIN` da env — pendência futura.

### 4.5 Cookies — BAIXO (não usa cookies críticos)
- A autenticação usa `localStorage` + Bearer token. Não há cookies de sessão que precisem
  de `domain` ou `SameSite` configurados.

### 4.6 Downloads — ALTO
- A rota `POST /downloads/:grantId/link` gera uma URL `/api/downloads/file/:token` que
  não existe no servidor (rota não implementada). O token não é salvo no banco.
- Este é um bug pré-existente não relacionado ao Docker.

### 4.7 Checkout simulado — ALTO
- Pedidos são criados diretamente com `status: "paid"` sem gateway real.
- Não há risco novo com Docker, mas não deve ser exposto como produção de venda.

### 4.8 Storage / Uploads — ALTO
- Não há storage de arquivos implementado. Imagens e áudios são URLs externas.
- Não há volume Docker necessário para uploads (não existe upload de arquivo no projeto).

### 4.9 Arquivos estáticos — BAIXO
- O build Vite gera `dist/public/` que é servido pelo Nginx. Sem dependência de storage.

### 4.10 Variáveis ausentes em tempo de execução
- Se `DATABASE_URL` ou `SESSION_SECRET` não estiverem definidos, a API falha na inicialização.
- O `docker-compose.yml` documenta as variáveis obrigatórias. O Coolify deve configurá-las.

---

## 5. Verificação do Node.js

| Item | Status |
|---|---|
| `.nvmrc` | ✅ `24` |
| `.node-version` | ✅ `24` |
| `package.json` `engines` | ✅ `"node": ">=24 <25"`, `"npm": ">=11"` |
| Dockerfiles | ✅ `node:24-alpine` |
| pnpm | ✅ via `corepack enable && corepack prepare pnpm@latest --activate` |

> Node.js 18 e Node.js 20 estão EOL — não usar neste projeto.

---

## 6. Checklist de Arquivos Criados nesta Preparação

| Arquivo | Descrição |
|---|---|
| `artifacts/api-server/Dockerfile` | Build esbuild + runtime Node 24 LTS |
| `artifacts/multitrack-hub/Dockerfile` | Build Vite + Nginx com proxy /api e SPA fallback |
| `docker-compose.yml` | Orquestração: web + api + postgres |
| `.env.example` | Variáveis documentadas (sem secrets reais) |
| `docs/deploy/coolify.md` | Guia completo de deploy no Coolify |

---

*Relatório gerado em junho/2026 — sem alterações de regra de negócio aplicadas.*
