# Hardening de Produção — MultiTrack Hub

> **Última atualização:** Junho/2026
> **Referência:** RELATORIO_P0_TRAVAS_PRODUCAO.md

---

## Resumo executivo

O projeto MultiTrack Hub está em staging técnico. Uma série de medidas de segurança operacional foi aplicada (hardening P0) para impedir que fluxos simulados funcionem em produção. Porém, existem pendências de segurança críticas que impedem o uso com clientes reais.

---

## Riscos identificados e status

### 🔴 P0 — Crítico (bloqueia produção real)

#### 1. Senha com SHA-256 sem salt individual

**Risco:** Hash SHA-256 puro (mesmo com SESSION_SECRET global) é vulnerável a:
- Ataques de rainbow table
- Ataques de força bruta com GPU
- Se o SESSION_SECRET vazar, todas as senhas são comprometidas de uma vez

**Implementação atual:**
```typescript
// lib/db/src/schema/users.ts
// Hash: SHA-256(password + SESSION_SECRET)
// Sem salt individual por usuário — INSEGURO para produção real
```

**Correção necessária:**
```typescript
// Substituir por:
import bcrypt from "bcrypt";
const hash = await bcrypt.hash(password, 12);
// Ou: import { hash } from "argon2"; const h = await hash(password);
```

**Prioridade:** P0 — antes de qualquer venda real

---

#### 2. Token de sessão em localStorage

**Risco:** O token de autenticação armazenado em `localStorage` é vulnerável a:
- Ataques XSS (Cross-Site Scripting) — qualquer script malicioso pode ler o token
- Roubo de sessão sem interação do usuário

**Implementação atual:**
```typescript
// Frontend: localStorage.setItem("token", token)
// Header: Authorization: Bearer <token>
```

**Correção necessária:**
```typescript
// Backend: res.cookie("session", token, {
//   httpOnly: true,
//   secure: true,
//   sameSite: "strict",
//   maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
// })
// Frontend: sem localStorage — cookie enviado automaticamente
```

**Prioridade:** P0 — antes de qualquer venda real

---

#### 3. Checkout simulado em produção (RESOLVIDO ✅)

**Status:** Bloqueado via flag `ALLOW_FAKE_PAYMENTS=false`

**O que foi feito:**
- `POST /orders` cria pedidos com status `pending` (não mais `paid`)
- `POST /orders/:id/pay` retorna HTTP 403 em produção
- `markOrderAsPaidAndGrantDownloads()` centralizado para futuro webhook real

**Em staging (development):** funciona com `ALLOW_FAKE_PAYMENTS=true`

---

#### 4. Downloads simulados em produção (RESOLVIDO ✅)

**Status:** Bloqueado via flag `ENABLE_FAKE_DOWNLOAD_LINKS=false`

**O que foi feito:**
- `POST /downloads/:grantId/link` retorna HTTP 403 em produção
- `downloadCount` não incrementado quando bloqueado
- Response inclui `_note: "PLACEHOLDER"` em desenvolvimento

**Correção pendente:** Implementar storage S3-compatible e URL assinada real

---

#### 5. Assinatura simulada em produção (RESOLVIDO ✅)

**Status:** Bloqueado via flag `ALLOW_FAKE_SUBSCRIPTIONS=false`

**O que foi feito:**
- `POST /subscriptions/me` retorna HTTP 403 em produção
- Créditos não concedidos sem pagamento confirmado

---

#### 6. Falta de conformidade LGPD

**Risco:** Operar comercialmente sem LGPD é ilegal no Brasil. Pode resultar em:
- Multas de até 2% do faturamento (máx. R$ 50 milhões por infração)
- Proibição de tratamento de dados
- Danos à reputação

**Pendências:**
- Sem página de Termos de Uso
- Sem Política de Privacidade
- Sem aceite explícito no cadastro
- Sem campo `terms_accepted_at` na tabela `users`
- Sem processo de exclusão de dados

**Prioridade:** P0 — antes de qualquer venda real

---

### 🟡 P1 — Importante (antes de escalar)

#### 7. Falta de audit logs

**Risco:** Sem rastreabilidade de ações administrativas. Se um dado for alterado incorretamente, não há como saber quem fez, quando e o que foi alterado.

**Correção necessária:**
```sql
CREATE TABLE admin_audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL, -- 'create_product', 'delete_user', 'adjust_credits', etc.
  entity_type TEXT NOT NULL, -- 'product', 'user', 'order', etc.
  entity_id INT,
  data_before JSONB,
  data_after JSONB,
  ip_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Prioridade:** P1 — antes de escalar com clientes

---

#### 8. Falta de MFA para admin

**Risco:** Se a senha do admin vazar (SHA-256 inseguro + reutilização), o painel inteiro fica comprometido.

**Correção necessária:**
- Implementar TOTP (Google Authenticator, Authy)
- Exigir código de 6 dígitos no login de roles `admin` e `support`
- Biblioteca: `speakeasy` + `qrcode`

**Prioridade:** P1 — especialmente crítico enquanto a senha ainda é SHA-256

---

#### 9. Webhook com docker.sock montado

**Risco:** O container `multitrack_webhook` monta `/var/run/docker.sock`, concedendo controle total sobre o Docker do host ao processo Python. Se o container for comprometido (ex.: via exploração do WEBHOOK_SECRET), o atacante tem controle total da VPS.

**Medidas aplicadas:**
- `WEBHOOK_SECRET` obrigatório na inicialização
- GET retorna apenas "ok" sem informações do sistema
- Resposta ao push: "Accepted" (sem detalhes)

**Mitigação adicional recomendada:**
- Restringir acesso de rede ao endpoint do webhook (apenas GitHub IPs)
- Considerar substituir pelo deploy nativo do Coolify ou GitHub Actions
- Rotacionar `WEBHOOK_SECRET` a cada 90 dias
- Documentar processo de rotação no runbook interno

**Prioridade:** P1 — monitorar e planejar migração

---

#### 10. Falta de rate limiting em rotas de autenticação

**Risco:** Sem rate limiting, ataques de força bruta em `/auth/login` podem tentar milhares de senhas por segundo.

**Correção necessária:**
```typescript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." }
});

router.post("/auth/login", authLimiter, ...);
router.post("/auth/register", authLimiter, ...);
```

**Prioridade:** P1

---

### 🔵 P2 — Melhorias (após MVP comercial)

#### 11. CORS sem validação estrita

**Estado atual:** CORS configurado via `CORS_ORIGIN` — correto. Verificar se está sendo aplicado em todas as rotas.

#### 12. Headers de segurança incompletos

**Necessário adicionar:**
```typescript
import helmet from "helmet";
app.use(helmet()); // CSP, HSTS, X-Frame-Options, etc.
```

#### 13. Sem monitoramento e alertas

**Recomendado:**
- Uptime monitoring (Better Uptime, UptimeRobot — gratuitos)
- Alertas de erro crítico (Telegram bot ou e-mail)
- Centralização de logs (Grafana Loki ou similar)

---

## Plano de correção por prioridade

### Sprint P0 — antes de qualquer venda

| Tarefa | Estimativa |
|---|---|
| Migrar senhas para bcrypt | 0,5 dia |
| Migrar token para cookie httpOnly | 1 dia |
| Criar Termos de Uso e Política de Privacidade | 1-2 dias (depende de jurídico) |
| Aceite no cadastro (`terms_accepted_at`) | 0,5 dia |
| Validação jurídica de licenciamento | externo |

### Sprint P1 — antes de escalar

| Tarefa | Estimativa |
|---|---|
| Rate limiting em `/auth` | 0,5 dia |
| Audit logs (tabela + middleware) | 1 dia |
| MFA para admin (TOTP) | 1,5 dias |
| Headers de segurança (Helmet) | 0,5 dia |
| Plano de rotação do WEBHOOK_SECRET | 0,5 dia |

### Sprint P2 — melhorias contínuas

| Tarefa | Estimativa |
|---|---|
| Monitoramento e alertas | 1 dia |
| Testes automatizados básicos | 2-3 dias |
| Substituir webhook por GitHub Actions | 1 dia |

---

## Variáveis de ambiente de segurança

```bash
# .env.example (produção)
NODE_ENV=production

# Flags de controle — manter FALSE em produção
ALLOW_FAKE_PAYMENTS=false
ALLOW_FAKE_SUBSCRIPTIONS=false
ENABLE_FAKE_DOWNLOAD_LINKS=false

# Obrigatório — nunca vazio
SESSION_SECRET=<openssl rand -hex 32>
WEBHOOK_SECRET=<openssl rand -hex 32>
```

---

## Referências

- `RELATORIO_P0_TRAVAS_PRODUCAO.md` — relatório detalhado do hardening aplicado
- `docs/product/STATUS_ATUAL.md` — status geral e pendências
- `docs/product/ROADMAP.md` — roadmap com fases de segurança
- `artifacts/api-server/src/lib/payments.ts` — função centralizada de confirmação de pagamento

---

*Hardening de Produção — MultiTrack Hub — Junho/2026*
