# Relatório de Validação — Docker + Coolify

> **Projeto:** MultiTrack Hub  
> **Data:** 31 maio 2026  
> **Ambiente-alvo:** VPS ARM64 Ubuntu 22.04 com Coolify  
> **Objetivo:** Validar e corrigir toda a pipeline de build, typecheck e empacotamento Docker para deploy no Coolify

---

## Resumo Executivo

Todas as etapas da pipeline foram validadas e os problemas encontrados foram corrigidos. O projeto está pronto para deploy no Coolify via `docker compose`.

| Etapa | Status | Observação |
|---|---|---|
| `pnpm install --frozen-lockfile` | ✅ OK | Sem conflitos, lockfile íntegro |
| Typecheck backend (`@workspace/api-server`) | ✅ OK | 17 erros pre-existentes corrigidos |
| Typecheck frontend (`@workspace/multitrack-hub`) | ✅ OK | 25 erros corrigidos |
| Build backend (`node ./build.mjs`) | ✅ OK | `dist/index.mjs` gerado, esbuild ok |
| Build frontend (`vite build`) | ✅ OK | `dist/public/` gerado, nginx-ready |
| `docker compose build` — imagem `api` | ✅ OK | node:24-slim, multi-stage, usuário não-root |
| `docker compose build` — imagem `web` | ✅ OK | node:24-slim builder + nginx:1.27-alpine runtime |
| `docker compose config` | ✅ OK | Sintaxe válida, sem warnings |
| CORS configurado por variável de ambiente | ✅ OK | Lê `CORS_ORIGIN`, permissivo só em `development` |
| `/api/healthz` com DB check | ✅ OK | `{"ok":true,"database":"ok","env":"..."}` |
| `/api/health` (alias) | ✅ OK | Mesma resposta, 503 se DB falhar |
| Documentação `docs/deploy/coolify.md` | ✅ Atualizada | Health, troubleshooting e pendências atualizados |

---

## Problemas Encontrados e Correções Aplicadas

### 1. Typecheck Backend — 17 erros em 7 arquivos de rotas

**Causa:** Chamadas `parseInt(req.params.X as string)` onde o TypeScript infere `string` como tipo de `req.params.X` mas o lint reclamava da asserção desnecessária em modo strict.

**Arquivos corrigidos:** `admin.ts`, `cart.ts`, `catalog.ts`, `downloads.ts`, `orders.ts`, `rateios.ts`, `wishlist.ts`

**Correção:** Substituição por `Number(req.params.X)` via sed.

---

### 2. Typecheck Frontend — 25 erros em 11 arquivos

**Causa raiz:** React Query v5 + Orval v8 exige `queryKey` obrigatório quando `UseQueryOptions` é passado inline. Mutações geradas pelo Orval têm assinaturas específicas que divergiam do código escrito manualmente.

**Categorias de erros corrigidos:**

| Categoria | Arquivos Afetados | Correção |
|---|---|---|
| `queryKey` ausente em `useQuery` | Navbar, AuthContext, product-detail, rateio-detail, order-detail, admin/edit, admin/users/detail | Importar e passar `getXxxQueryKey()` |
| Argumento de mutation errado | cart (itemId), downloads (grantId), product-detail (productId), order-detail (id), admin/products (id), admin/rateios (id), admin/users (id) | Ajustar para assinatura gerada pelo Orval |
| Mutation void chamada com `{}` | cart (removeCoupon) | Trocar `{}` por `undefined` |

---

### 3. CORS sem restrição de origem

**Causa:** `cors()` sem opções — aceita qualquer origem.

**Correção em `artifacts/api-server/src/app.ts`:**
```typescript
const corsOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: !isProd || corsOrigins.length === 0 ? true : corsOrigins,
  credentials: true,
}));
```

**Em produção:** definir `CORS_ORIGIN=https://multitrack.macarsalao.com.br` nas variáveis do Coolify.

---

### 4. `/api/healthz` sem verificação de banco

**Causa:** Rota original retornava só `{"status":"ok"}` sem validar conexão.

**Correção em `artifacts/api-server/src/routes/health.ts`:**
- Tenta `pool.connect()` + `SELECT 1`; retorna `database: "error"` e HTTP 503 se falhar
- Resposta: `{ ok: boolean, database: "ok"|"error", env: string }`
- Duas rotas registradas: `/healthz` (usada pelo Dockerfile HEALTHCHECK) e `/health` (alias)
- Schema adicionado ao OpenAPI spec e ao Zod gerado pelo Orval

**Resultado verificado:**
```bash
curl http://localhost:80/api/healthz
# {"ok":true,"database":"ok","env":"development"}

curl http://localhost:80/api/health
# {"ok":true,"database":"ok","env":"development"}
```

---

### 5. Docker build — falha no `pnpm install` por preinstall guard

**Causa:** O `package.json` raiz tem um `preinstall` que verifica `npm_config_user_agent` para garantir uso do pnpm. Com `corepack enable && corepack prepare pnpm@latest`, o user agent não era propagado corretamente dentro do Docker, causando falha.

**Correção:** Substituir corepack por instalação direta nos 3 Dockerfiles:
```dockerfile
RUN npm install -g pnpm@10.26.1 --no-update-notifier
```

---

### 6. Docker build frontend — `@rollup/rollup-linux-x64-musl` não encontrado

**Causa:** `node:24-alpine` usa musl libc, mas `pnpm-workspace.yaml` excluía explicitamente `@rollup/rollup-linux-x64-musl` do lockfile (override `"-"`).

**Correção:** Mudar o builder de `node:24-alpine` para `node:24-slim` (Debian/glibc). A variante `@rollup/rollup-linux-x64-gnu` já estava no lockfile.

**Bonus — ARM64 produção:** Removida a exclusão de `@rollup/rollup-linux-arm64-gnu` do `pnpm-workspace.yaml` para que o build funcione também no VPS ARM64 onde o Coolify constrói as imagens. Lockfile regenerado para incluir essa variante.

---

### 7. Docker build frontend — `tsconfig.base.json` não encontrado

**Causa:** O `tsconfig.json` do `multitrack-hub` extends `../../tsconfig.base.json` (raiz do monorepo), mas o Dockerfile não copiava esse arquivo para o contexto de build.

**Correção:** Adicionar ao COPY do builder:
```dockerfile
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
```

---

## Estado Final dos Dockerfiles

### `artifacts/api-server/Dockerfile`
- Builder: `node:24-slim` (Debian/glibc) — instala todas as deps, roda `node ./build.mjs`
- Runtime: `node:24-slim` — instala apenas prod deps, copia `dist/`, usuário não-root
- HEALTHCHECK: `wget -qO- http://localhost:8080/api/healthz`

### `artifacts/multitrack-hub/Dockerfile`
- Builder: `node:24-slim` — instala deps, roda `vite build`
- Runtime: `nginx:1.27-alpine` — serve apenas os arquivos estáticos gerados
- HEALTHCHECK: `wget -qO- http://localhost:80/`

### `Dockerfile.migrate`
- `node:24-slim` — instala todas as deps (incluindo devDeps), roda `pnpm --filter @workspace/db run push`
- Uso: `docker compose --profile migrate run --rm migrate`

---

## Como fazer o deploy no Coolify

### Pré-requisitos no VPS

```bash
docker --version   # >= 24
docker compose version   # >= 2.x
```

### Variáveis de ambiente obrigatórias

| Variável | Exemplo |
|---|---|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://multitrack.macarsalao.com.br` |
| `POSTGRES_USER` | `multitrack` |
| `POSTGRES_PASSWORD` | *(openssl rand -hex 24)* |
| `POSTGRES_DB` | `multitrack_db` |
| `DATABASE_URL` | `postgresql://multitrack:SENHA@postgres:5432/multitrack_db` |
| `SESSION_SECRET` | *(openssl rand -hex 32)* |

### Sequência de deploy

```bash
# 1. Clonar o repositório
git clone <repo-url> && cd multitrack-hub

# 2. Configurar variáveis (via painel do Coolify ou .env)

# 3. Subir postgres primeiro
docker compose up -d postgres

# 4. Aguardar postgres healthy (≈10s)
docker compose ps postgres

# 5. Rodar migrações (só no primeiro deploy ou após mudança de schema)
docker compose --profile migrate run --rm migrate

# 6. Subir todos os serviços
docker compose up -d

# 7. Verificar saúde
curl https://multitrack.macarsalao.com.br/api/healthz
# {"ok":true,"database":"ok","env":"production"}
```

---

## Pendências Antes de Produção Real

### 🔴 Bloqueadores absolutos

| Item | Detalhe |
|---|---|
| **Checkout simulado** | Pedidos criados como "pagos" sem gateway de pagamento — integrar Pagar.me / Stripe |
| **Downloads sem storage** | Rota `/api/downloads` não entrega arquivos reais — implementar S3/R2 |
| **Senha SHA-256 sem salt** | Hash quebrável com GPU — migrar para bcrypt (rounds ≥ 12) ou argon2id |
| **LGPD ausente** | Sem Termos de Uso, Política de Privacidade, aceite no cadastro |

### 🟡 Importantes antes de escalar

| Item | Detalhe |
|---|---|
| **Token em localStorage** | Vulnerável a XSS — migrar para cookie httpOnly |
| **Sem MFA para admin** | Qualquer vazamento de credenciais compromete tudo |
| **drizzle-kit push** | Sem histórico de migrations — risco de perda de dados em produção |
| **Sem testes automatizados** | Zero cobertura |
| **Sem e-mails transacionais** | Confirmações de compra, cadastro e reset de senha |

---

*Relatório gerado em 31/05/2026 — MultiTrack Hub v1.0*
