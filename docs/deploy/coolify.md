# Guia de Deploy — MultiTrack Hub no Coolify

> Ambiente-alvo: VPS Ubuntu com Docker + Coolify instalados (ARM64)
> Painel Coolify: `painel.macarsalao.com.br`
> App: `multitrack.macarsalao.com.br`
> Objetivo: staging / produção técnica — **não venda real ainda**

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Estrutura dos arquivos de deploy](#2-estrutura-dos-arquivos-de-deploy)
3. [Criar o projeto no Coolify](#3-criar-o-projeto-no-coolify)
4. [Configurar variáveis de ambiente](#4-configurar-variáveis-de-ambiente)
5. [Subir o PostgreSQL](#5-subir-o-postgresql)
6. [Rodar as migrações](#6-rodar-as-migrações)
7. [Testar o deploy](#7-testar-o-deploy)
8. [Pendências críticas antes de venda real](#8-pendências-críticas-antes-de-venda-real)

---

## 1. Pré-requisitos

Na sua VPS:

```bash
# Verificar Docker
docker --version
docker compose version

# Verificar Coolify
# Acessar: https://painel.macarsalao.com.br
```

No seu repositório, certifique-se de que estes arquivos existem:

```
docker-compose.yml
artifacts/api-server/Dockerfile
artifacts/multitrack-hub/Dockerfile
artifacts/multitrack-hub/nginx.conf
.env.example
```

---

## 2. Estrutura dos arquivos de deploy

| Arquivo | Função |
|---|---|
| `docker-compose.yml` | Orquestra 4 serviços: `web`, `api`, `postgres`, `migrate` |
| `Dockerfile.migrate` | Container one-shot com todas as deps (dev incluído) para rodar `drizzle-kit push` |
| `artifacts/api-server/Dockerfile` | Build esbuild + runtime Node 24 LTS, usuário não-root, porta 8080 |
| `artifacts/multitrack-hub/Dockerfile` | Build Vite + Nginx com proxy `/api/` e SPA fallback |
| `artifacts/multitrack-hub/nginx.conf` | Configuração Nginx: proxy, cache, headers de segurança |
| `.env.example` | Template de variáveis (sem secrets reais) |

**Arquitetura dos containers:**

```
Internet
    │
    ▼
[Proxy Coolify / Traefik]  (HTTPS → HTTP)
    │
    ▼
[web — Nginx :80]
    │ /api/*
    ▼
[api — Express :8080]
    │
    ▼
[postgres — PostgreSQL :5432]  (somente rede interna)
```

---

## 3. Criar o projeto no Coolify

### Opção A — Docker Compose (recomendado)

1. Acesse `https://painel.macarsalao.com.br`
2. Clique em **New Resource** → **Docker Compose**
3. Em **Source**, selecione seu repositório Git ou aponte para o diretório com o `docker-compose.yml`
4. Em **Docker Compose Location**, deixe `docker-compose.yml`
5. Em **Domains**, adicione: `multitrack.macarsalao.com.br`
6. Em **Port**, configure: `80` (serviço `web`)
7. Clique em **Save** e aguarde o primeiro build

### Opção B — Deploy manual via SSH

```bash
# Na VPS, clonar o repositório
git clone https://github.com/seu-usuario/multitrack-hub.git
cd multitrack-hub

# Copiar o .env.example e preencher os valores
cp .env.example .env
nano .env   # editar com os valores reais

# Subir os serviços
docker compose up -d --build

# Verificar logs
docker compose logs -f
```

---

## 4. Configurar variáveis de ambiente

No painel do Coolify, vá em **Environment Variables** do projeto e adicione:

| Variável | Valor exemplo | Obrigatória |
|---|---|---|
| `NODE_ENV` | `production` | Sim |
| `APP_URL` | `https://multitrack.macarsalao.com.br` | Sim |
| `CORS_ORIGIN` | `https://multitrack.macarsalao.com.br` | Sim |
| `POSTGRES_USER` | `multitrack` | Sim |
| `POSTGRES_PASSWORD` | *(valor aleatório seguro)* | Sim |
| `POSTGRES_DB` | `multitrack_db` | Sim |
| `DATABASE_URL` | `postgresql://multitrack:SENHA@postgres:5432/multitrack_db` | Sim |
| `SESSION_SECRET` | *(valor aleatório seguro)* | Sim |

### Gerar valores seguros para secrets

```bash
# Para POSTGRES_PASSWORD:
openssl rand -hex 24

# Para SESSION_SECRET:
openssl rand -hex 32
```

> **⚠️ Nunca commite o `.env` com valores reais. Configure sempre pelo painel do Coolify.**

---

## 5. Subir o PostgreSQL

O PostgreSQL já está incluído no `docker-compose.yml` como serviço `postgres`. Ele sobe
automaticamente junto com os outros serviços.

Verificar se está saudável:

```bash
docker compose ps
# Deve mostrar: multitrack_postgres   Up   (healthy)

docker compose exec postgres pg_isready -U multitrack -d multitrack_db
# Deve retornar: /var/run/postgresql:5432 - accepting connections
```

---

## 6. Rodar as migrações

Após o primeiro deploy, o banco estará vazio. O serviço `migrate` é dedicado para isso — ele
inclui todas as dependências de dev (incluindo `drizzle-kit`) e roda `drizzle-kit push` uma
única vez contra o banco.

> **Por que não usar `docker compose exec api ...`?** O container `api` de runtime usa apenas
> o bundle compilado (`dist/index.mjs`) e dependências de produção. O `drizzle-kit` é uma
> devDependency que **não existe** na imagem de runtime. O serviço `migrate` tem um Dockerfile
> próprio (`Dockerfile.migrate`) que instala tudo, incluindo devDependencies.

```bash
# Garantir que o postgres está rodando e saudável primeiro
docker compose up -d postgres
docker compose ps postgres
# Aguardar até aparecer: healthy

# Rodar as migrações (container separado com todas as deps)
docker compose --profile migrate run --rm migrate
# Esperado: drizzle-kit push aplicado com sucesso, tabelas criadas

# Verificar as tabelas criadas
docker compose exec postgres psql -U multitrack -d multitrack_db -c "\dt"
# Deve listar: users, sessions, products, orders, ... (19 tabelas)
```

> **Nota sobre migrações:** O projeto usa `drizzle-kit push` que aplica o schema diretamente
> sem gerar arquivos de migration rastreáveis. Para staging é aceitável. Para produção com
> dados reais, migrar para `drizzle-kit generate` + `drizzle-kit migrate`.

---

## 7. Testar o deploy

Execute cada verificação em sequência. Substitua `multitrack.macarsalao.com.br` pelo seu domínio.

### 7.1 Health da API

```bash
curl https://multitrack.macarsalao.com.br/api/healthz
# Esperado: {"status":"ok"}
```

### 7.2 Frontend carregando

Acesse no browser: `https://multitrack.macarsalao.com.br`

✅ A home page deve aparecer em português com o catálogo e categorias.

### 7.3 Login

1. Acesse `/login`
2. Entre com: `admin@multitrack.com` / `admin123`
3. ✅ Deve redirecionar para a home autenticado
4. ✅ O navbar deve mostrar o nome do usuário

### 7.4 Catálogo

1. Acesse `/catalog`
2. ✅ Produtos devem aparecer com capas e preços
3. ✅ Filtros de BPM, gênero e preço devem funcionar

### 7.5 Carrinho

1. Clique em um produto → "Adicionar ao Carrinho"
2. Acesse `/cart`
3. ✅ O produto deve aparecer no carrinho
4. Teste aplicar o cupom `BEMVINDO10`
5. ✅ O desconto de 10% deve aparecer

### 7.6 Pedido (checkout simulado)

1. Finalize a compra pelo carrinho
2. Selecione "Pix" como método
3. ✅ Um pedido deve ser criado
4. ✅ Em `/orders` o pedido deve aparecer como "Pago"
5. ✅ Em `/downloads` o arquivo deve aparecer disponível

> ⚠️ O checkout é **simulado** — nenhum pagamento real é processado.

### 7.7 Painel Admin

1. Acesse `/admin` (logado como admin)
2. ✅ Dashboard com métricas deve carregar
3. ✅ Produtos, pedidos e usuários devem aparecer nas respectivas seções

### 7.8 Verificar containers

```bash
docker compose ps
# Todos devem estar: Up (healthy)

docker compose logs api --tail=50
# Deve mostrar logs estruturados (JSON) das requisições

docker compose logs web --tail=20
# Deve mostrar logs do Nginx
```

---

## 8. Pendências críticas antes de venda real

> **Este deploy é para staging técnico.** Os itens abaixo **impedem** o uso em produção real
> com clientes pagantes.

### 🔴 P0 — Bloqueadores absolutos

| Item | Problema | O que fazer |
|---|---|---|
| **Checkout simulado** | Pedidos criados como "pagos" sem gateway | Integrar Pagar.me, Stripe ou Mercado Pago |
| **Downloads quebrados** | URL `/api/downloads/file/:token` retorna 404 | Implementar storage (S3/R2) + rota de download |
| **Senhas SHA-256** | Hash sem salt individual — quebrável com GPU | Substituir por bcrypt (rounds ≥ 12) ou argon2id |
| **LGPD ausente** | Sem Termos de Uso, Privacidade, aceite no cadastro | Criar páginas legais + campo `terms_accepted_at` na tabela `users` |

### 🟡 P1 — Importantes antes de escalar

| Item | Problema |
|---|---|
| **CORS aberto** | `cors()` sem restrição de origem — ajustar para ler `CORS_ORIGIN` |
| **Token em localStorage** | Vulnerável a XSS — migrar para cookie httpOnly |
| **Sem MFA para admin** | Login admin só com email+senha |
| **Sem audit logs** | Ações admin sem rastreabilidade |
| **Sem e-mails transacionais** | Nenhuma confirmação de compra ou cadastro |
| **Sem testes** | Zero cobertura automatizada |
| **drizzle-kit push em produção** | Sem histórico de migrations — risco de dados |

---

## Referências rápidas

```bash
# Ver todos os logs em tempo real
docker compose logs -f

# Reiniciar só a API
docker compose restart api

# Rebuild após mudança de código
docker compose up -d --build api

# Parar tudo
docker compose down

# Parar e remover volumes (APAGA O BANCO — cuidado!)
docker compose down -v

# Acessar o PostgreSQL diretamente
docker compose exec postgres psql -U multitrack -d multitrack_db
```

---

*Documentação gerada em junho/2026 — MultiTrack Hub v1.0*
