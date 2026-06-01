# Deploy MultiTrack Hub → Coolify

> Domínio final: `https://multitrack.macarsalao.com.br`  
> Infraestrutura: Cloudflare Tunnel + Coolify + Traefik (já configurado)

---

## O que você vai fazer (visão geral)

```
Replit → GitHub (push do código) → Coolify (lê o repo, faz build, sobe os containers)
```

---

## Etapa 1 — Criar o repositório no GitHub

1. Acesse https://github.com/new
2. Crie um repositório **privado** com o nome `multitrack-hub`
3. **Não** inicialize com README (deixe vazio)
4. Copie a URL do repositório, ex: `https://github.com/seu-usuario/multitrack-hub.git`

---

## Etapa 2 — Subir o código do Replit para o GitHub

Abra o **Shell** do Replit e execute:

```bash
# Trocar pelo seu usuário e repo
git remote add github https://github.com/SEU_USUARIO/multitrack-hub.git

# Enviar o código
git push github main
```

Se pedir autenticação, use um **Personal Access Token** do GitHub:
- Acesse: https://github.com/settings/tokens/new
- Scopes necessários: `repo`
- Use o token como senha quando o git pedir

---

## Etapa 3 — Conectar o GitHub ao Coolify

No painel do Coolify (`painel.macarsalao.com.br`):

1. Vá em **Sources** → **Add** → **GitHub**
2. Siga o fluxo de autorização OAuth
3. Selecione o repositório `multitrack-hub`

---

## Etapa 4 — Configurar o recurso no Coolify

### 4.1 — Alterar o recurso "multitrack-temp"

1. Clique no recurso **multitrack-temp**
2. Clique em **Settings** ou **Edit**
3. Em **Build Pack**, selecione: **Docker Compose**
4. Em **Git Repository**, selecione o repo conectado na Etapa 3
5. Em **Branch**: `main`
6. Em **Docker Compose Location**: `docker-compose.yml`
7. Em **Main Service** (ou "Service to expose"): `web`
8. Em **Port**: `80`
9. Em **Domain**: `multitrack.macarsalao.com.br`
10. Clique em **Save**

---

## Etapa 5 — Configurar as variáveis de ambiente

No Coolify, dentro do recurso, vá em **Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://multitrack.macarsalao.com.br` |
| `POSTGRES_USER` | `multitrack` |
| `POSTGRES_PASSWORD` | *(gerar abaixo)* |
| `POSTGRES_DB` | `multitrack_db` |
| `DATABASE_URL` | `postgresql://multitrack:SUA_SENHA@postgres:5432/multitrack_db` |
| `SESSION_SECRET` | *(gerar abaixo)* |

### Gerar secrets seguros (rode no Shell do Replit ou na VPS)

```bash
# Para POSTGRES_PASSWORD:
openssl rand -hex 24

# Para SESSION_SECRET:
openssl rand -hex 32
```

> ⚠️ Substitua `SUA_SENHA` em `DATABASE_URL` pelo mesmo valor gerado para `POSTGRES_PASSWORD`.

---

## Etapa 6 — Primeiro deploy

1. Clique em **Deploy** (ou **Redeploy**) no Coolify
2. Acompanhe os logs — o processo demora ~3–5 minutos no primeiro build
3. Coolify vai fazer na ordem: build das imagens → postgres → api → web

---

## Etapa 7 — Rodar as migrações (só no primeiro deploy)

O banco estará vazio após o primeiro deploy. Você precisa criar as tabelas.

**Opção A — Via SSH na VPS:**

```bash
ssh usuario@ip-da-vps

# Entrar no diretório onde o Coolify fez o checkout do repo
# (geralmente em /data/coolify/services/... ou similar)
cd /caminho/do/projeto

docker compose --profile migrate run --rm migrate
```

**Opção B — Adicionar temporariamente o serviço migrate como "Command Override" no Coolify:**
- Em **Settings** do recurso → **Custom Start Command**
- Cole: `docker compose --profile migrate run --rm migrate && docker compose up -d web api postgres`
- Faça o deploy, depois remova o override

**Opção C (mais simples) — Rodar direto no container postgres:**
```bash
# No SSH da VPS, após os containers subirem:
docker exec -it multitrack_postgres psql -U multitrack -d multitrack_db

# Verificar se há tabelas (deve estar vazio):
\dt

# Sair:
\q
```
Depois acesse `https://multitrack.macarsalao.com.br/api/healthz` — se retornar `{"ok":true,"database":"ok"}`, as migrações precisam ser rodadas.

---

## Etapa 8 — Verificar o deploy

```bash
# Health da API
curl https://multitrack.macarsalao.com.br/api/healthz
# Esperado: {"ok":true,"database":"ok","env":"production"}
```

Acesse no browser: `https://multitrack.macarsalao.com.br`
- ✅ Home page em português com catálogo
- ✅ Login com `admin@multitrack.com` / `admin123`
- ✅ Painel admin em `/admin`

---

## Arquitetura dos containers

```
Internet (HTTPS)
       │
       ▼
 Cloudflare Tunnel
       │
       ▼
  Traefik (Coolify)  ← gerencia SSL e roteamento
       │
       ▼  porta 80
  [web — Nginx]  ← serve o React estático
       │
       ▼  /api/* → porta 8080
  [api — Express]  ← API REST
       │
       ▼  porta 5432 (só rede interna)
  [postgres]
```

---

## Referência rápida — portas e serviços

| Serviço | Porta interna | Exposta externamente |
|---|---|---|
| `web` (Nginx) | 80 | Sim — via Traefik |
| `api` (Express) | 8080 | Não — só via Nginx proxy |
| `postgres` | 5432 | Não — só rede interna |

---

## Troubleshooting

### "Cannot GET /api/..."
O nginx faz proxy de `/api/*` para o container `api`. Se a API não subiu, o nginx retorna 502.
```bash
docker compose logs api --tail=50
```

### Banco de dados sem tabelas (erro de login)
Execute as migrações conforme Etapa 7.

### Build falha no Coolify
Verifique se o GitHub está conectado e o branch está correto. Os logs de build aparecem em tempo real no Coolify.

### Health retorna `"database":"error"` com HTTP 503
A `DATABASE_URL` está errada ou o container postgres não subiu.
- Confira se `POSTGRES_PASSWORD` em `DATABASE_URL` bate com a variável `POSTGRES_PASSWORD`
- Confira se o host em `DATABASE_URL` é `postgres` (nome do serviço no compose)

---

*Guia gerado em 31/05/2026 — MultiTrack Hub v1.0*
