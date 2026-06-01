# RELATÓRIO P0 — Travas de Produção — MultiTrack Hub

> Data: junho/2026
> Escopo: hardening operacional — bloqueio de fluxos simulados em `NODE_ENV=production`
> Não inclui: gateway de pagamento real, storage real, bcrypt, LGPD.

---

## 1. Arquivos Alterados

| Arquivo | Tipo de alteração |
|---|---|
| `artifacts/api-server/src/lib/payments.ts` | **Criado** — serviço central de confirmação de pagamento |
| `artifacts/api-server/src/routes/orders.ts` | **Alterado** — pedidos nascem como `pending`; `/pay` bloqueado em produção |
| `artifacts/api-server/src/routes/subscriptions.ts` | **Alterado** — criação de assinatura bloqueada em produção |
| `artifacts/api-server/src/routes/downloads.ts` | **Alterado** — geração de link bloqueada em produção |
| `webhook_server.py` | **Alterado** — GET sem detalhes; WEBHOOK_SECRET obrigatório na inicialização |
| `.env.example` | **Alterado** — 3 novas flags + WEBHOOK_SECRET documentados |
| `docs/deploy/coolify.md` | **Alterado** — info sensível removida, status corrigido, aviso docker.sock, tabela de vars atualizada |

---

## 2. Regras Novas de Proteção

### 2.1 POST /orders — pedidos nascem como `pending`

**Antes:** todo pedido era criado com `status: "paid"`, `download_grants` gerados e `totalSales` incrementado imediatamente.

**Depois:**
- Status inicial: `pending`
- Nenhum `download_grant` é criado no momento do pedido
- `totalSales` **não** é incrementado
- `order_items` são criados normalmente
- Carrinho é limpo (decisão documentada: o usuário finalizou o pedido; se cancelar, precisa refazer)

### 2.2 POST /orders/:id/pay — bloqueado em produção

```
NODE_ENV=production AND ALLOW_FAKE_PAYMENTS != "true"
→ HTTP 403 "Pagamento simulado desabilitado em produção"
```

Quando permitido (dev/staging), chama `markOrderAsPaidAndGrantDownloads()`.

### 2.3 POST /subscriptions/me — bloqueado em produção

```
NODE_ENV=production AND ALLOW_FAKE_SUBSCRIPTIONS != "true"
→ HTTP 403 "Criação de assinatura simulada desabilitada em produção"
```

Créditos premium **não** são concedidos sem pagamento confirmado.

### 2.4 POST /downloads/:grantId/link — bloqueado em produção

```
NODE_ENV=production AND ENABLE_FAKE_DOWNLOAD_LINKS != "true"
→ HTTP 403 "Downloads reais ainda não configurados"
```

`downloadCount` **não** é incrementado quando bloqueado (o arquivo real não foi entregue).

### 2.5 markOrderAsPaidAndGrantDownloads() — função de serviço central

Centraliza toda a lógica de confirmação de pagamento:
1. Valida que o pedido existe
2. Valida que o pedido ainda não está pago (idempotência)
3. Atualiza status para `paid`
4. Cria `download_grant` para cada `order_item`
5. Incrementa `totalSales` nos produtos

Preparada para ser chamada no futuro pelo webhook do gateway de pagamento real.

### 2.6 webhook_server.py — GET sem info, WEBHOOK_SECRET obrigatório

- `do_GET`: retorna apenas `b"ok"` (sem revelar nome do sistema)
- `_startup_check()`: se `WEBHOOK_SECRET` não estiver definido, o processo encerra com `sys.exit(1)` — o container não sobe sem o segredo configurado

---

## 3. Flags Adicionadas

| Variável | Padrão | Descrição |
|---|---|---|
| `ALLOW_FAKE_PAYMENTS` | `false` | Habilita `POST /orders/:id/pay` simulado em staging |
| `ALLOW_FAKE_SUBSCRIPTIONS` | `false` | Habilita `POST /subscriptions/me` sem cobrança em staging |
| `ENABLE_FAKE_DOWNLOAD_LINKS` | `false` | Habilita geração de links placeholder em staging |
| `WEBHOOK_SECRET` | obrigatório | Segredo HMAC-SHA256 do webhook; processo não inicia sem ele |

Todas documentadas em `.env.example` com comentários explicativos.

---

## 4. Comportamento em Development / Staging

Com `NODE_ENV=development` **ou** com as flags explicitamente `true`:

| Endpoint | Comportamento |
|---|---|
| `POST /orders` | Cria pedido com status `pending`, limpa carrinho |
| `POST /orders/:id/pay` | Marca como `paid`, cria download grants, incrementa totalSales |
| `POST /subscriptions/me` | Cria assinatura, promove role para `premium`, concede créditos |
| `POST /downloads/:grantId/link` | Gera token placeholder, incrementa downloadCount |

> O frontend existente continua funcionando em staging sem nenhuma alteração — basta definir
> `NODE_ENV=development` ou as flags `=true` nas variáveis de ambiente do container.

---

## 5. Comportamento em Production (padrão — flags `false`)

| Endpoint | Resposta |
|---|---|
| `POST /orders` | ✅ Funciona — pedido criado como `pending` |
| `POST /orders/:id/pay` | 🚫 HTTP 403 — "Pagamento simulado desabilitado em produção" |
| `POST /subscriptions/me` | 🚫 HTTP 403 — "Criação de assinatura simulada desabilitada em produção" |
| `POST /downloads/:grantId/link` | 🚫 HTTP 403 — "Downloads reais ainda não configurados" |
| Demais endpoints | ✅ Funcionam normalmente (catálogo, auth, rateios, wishlist, admin) |

---

## 6. Comandos Executados

```bash
# Instalação de dependências
pnpm install --frozen-lockfile
# Resultado: Done in 3.7s — Already up to date

# Verificação de tipos
pnpm run typecheck
# Resultado: 4 packages — all Done ✅
# (1 erro corrigido durante execução: DownloadSource enum type em payments.ts)

# Build da API
PORT=8080 BASE_PATH=/api pnpm --filter @workspace/api-server run build
# Resultado: dist/index.mjs 2.2mb — Done in 1707ms ✅

# Build do frontend
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/multitrack-hub run build
# Resultado: 3348 modules transformed — built in 21.20s ✅

# Validação do docker compose
docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml config --quiet
# Resultado: CONFIG OK (2 warnings de variáveis não-definidas no ambiente local — esperado) ✅
```

---

## 7. Resultado do Typecheck

```
pnpm run typecheck

> workspace@0.0.0 typecheck:libs
> tsc --build  ← libs compiladas sem erros

artifacts/api-server typecheck$ tsc -p tsconfig.json --noEmit   → Done in 7.3s
artifacts/mockup-sandbox typecheck$ tsc -p tsconfig.json --noEmit → Done in 10.5s
scripts typecheck$ tsc -p tsconfig.json --noEmit                 → Done in 2.5s
artifacts/multitrack-hub typecheck$ tsc -p tsconfig.json --noEmit → Done in 11.6s
```

**Status: PASSOU ✅ — zero erros de tipo**

> Nota: um erro foi encontrado e corrigido durante a execução:
> `payments.ts` usava `source: string` mas o schema exige `"purchase" | "credit" | "rateio"`.
> Corrigido com `type DownloadSource = "purchase" | "credit" | "rateio"`.

---

## 8. Resultado do Build

```
API Server (esbuild):
  dist/index.mjs  2.2mb ✅
  Done in 1707ms

Frontend (Vite):
  dist/public/assets/index-CUff6umv.js  1,121.54 kB (gzip: 317.88 kB)
  ✓ 3348 modules transformed — built in 21.20s ✅
  (aviso de chunk size existente antes deste PR — não introduzido por esta alteração)

docker compose config:
  CONFIG OK ✅
  (2 warnings: POSTGRES_PASSWORD e WEBHOOK_SECRET não definidos no ambiente local do Replit — esperado)
```

**Status: PASSOU ✅ — todos os builds bem-sucedidos**

---

## 9. Pendências Críticas Restantes

> Estes itens continuam **pendentes** — o sistema NÃO está pronto para clientes pagantes.

### 🔴 P0 — Bloqueadores Absolutos

| # | Problema | Impacto | O que fazer |
|---|---|---|---|
| P0-1 | **Gateway de pagamento ausente** | Nenhum pedido pode ser pago em produção | Integrar Mercado Pago, Pagar.me ou Stripe; implementar webhook de confirmação que chama `markOrderAsPaidAndGrantDownloads()` |
| P0-2 | **Storage de arquivos ausente** | Downloads bloqueados em produção | Configurar S3, Cloudflare R2 ou MinIO; gerar URLs assinadas com expiração em `/downloads/:grantId/link` |
| P0-3 | **Senhas SHA-256 sem salt individual** | Vulnerável a rainbow table e GPU cracking | Substituir por bcrypt (rounds ≥ 12) ou argon2id; migrar hashes existentes no deploy |
| P0-4 | **LGPD não implementada** | Ilegal operar com dados de clientes sem compliance | Criar Termos de Uso, Política de Privacidade, aceite no cadastro (`terms_accepted_at` na tabela `users`) |

### 🟡 P1 — Importantes antes de escalar

| # | Problema |
|---|---|
| P1-1 | Token de sessão em `localStorage` — vulnerável a XSS; migrar para cookie `httpOnly` |
| P1-2 | Sem MFA para admin — acesso só com email+senha |
| P1-3 | Sem audit logs de ações administrativas |
| P1-4 | Sem e-mails transacionais (confirmação de compra, cadastro, recuperação de senha) |
| P1-5 | Zero cobertura de testes automatizados |
| P1-6 | `drizzle-kit push` em produção sem histórico de migrations rastreável |
| P1-7 | Container webhook monta `/var/run/docker.sock` — risco se comprometido |

### 🔵 Itens desta sprint — concluídos

- ✅ Pedidos nascem como `pending` (sem grant antecipado)
- ✅ Pagamento simulado bloqueado por flag em produção
- ✅ Assinatura simulada bloqueada por flag em produção
- ✅ Downloads simulados bloqueados por flag em produção
- ✅ `markOrderAsPaidAndGrantDownloads()` centralizado e pronto para webhook real
- ✅ `WEBHOOK_SECRET` obrigatório na inicialização do webhook server
- ✅ GET do webhook sem informações de sistema
- ✅ `docs/deploy/coolify.md` sem info sensível (root, hostname, path de chave SSH)
- ✅ Status corrigido para "staging técnico — não pronto para venda real"
- ✅ Aviso de risco docker.sock documentado
- ✅ `.env.example` com flags e WEBHOOK_SECRET documentados

---

## 10. Próximo Prompt Recomendado

```
Implementar gateway de pagamento com Mercado Pago (checkout pro / PIX) no MultiTrack Hub.

Contexto:
- `markOrderAsPaidAndGrantDownloads(orderId, "purchase")` já existe em
  `artifacts/api-server/src/lib/payments.ts` e está pronta para ser chamada
  pelo webhook de confirmação do gateway.
- Pedidos já nascem como `pending` — só precisam ser confirmados pelo webhook.
- `ALLOW_FAKE_PAYMENTS=false` em produção — o fluxo fake está bloqueado.

Tarefas:
1. Adicionar variáveis de ambiente: MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET
2. Criar rota POST /webhooks/mercadopago para receber notificações
3. Validar assinatura HMAC do Mercado Pago
4. Chamar markOrderAsPaidAndGrantDownloads() ao receber payment.updated com status=approved
5. Criar preferência de checkout (PIX e cartão) em POST /orders/:id/checkout
6. Retornar init_point ou qr_code para o frontend
7. Atualizar .env.example com MP_ACCESS_TOKEN e MP_WEBHOOK_SECRET
8. Testar com sandbox do Mercado Pago
9. Documentar rotação de tokens e configuração do webhook no painel MP

Restrições:
- Não alterar markOrderAsPaidAndGrantDownloads()
- Não remover ALLOW_FAKE_PAYMENTS (manter para staging)
- Não implementar storage agora
```

---

*Relatório gerado em junho/2026 — MultiTrack Hub P0 Security Hardening*
