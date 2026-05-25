# MultiTrack Hub — Relatório Técnico de Conformidade

> Análise honesta do estado atual vs. requisitos de produção.
> **Nenhuma alteração de código foi aplicada.**
> Data: maio/2026

---

## Tabela de Status por Item

| # | Ponto Analisado | Status | Prioridade |
|---|---|---|---|
| 1 | Checkout com gateway real / webhooks | **Simulado** | P0 |
| 2 | Armazenamento seguro de senhas | **Risco Crítico** | P0 |
| 3 | Armazenamento do token de sessão no frontend | **Risco** | P1 |
| 4 | Downloads com URL assinada + expiração em storage/CDN | **Parcial** | P0 |
| 5 | Controle de licenciamento/autorização por produto | **Parcial** | P1 |
| 6 | Termos de Uso, Privacidade, LGPD, consentimento | **Ausente** | P0 |
| 7 | MFA para admin + RBAC granular suporte/admin | **Ausente** | P1 |
| 8 | Audit logs de ações administrativas | **Ausente** | P1 |
| 9 | Testes automatizados | **Ausente** | P1 |
| 10 | E-mails transacionais | **Ausente** | P1 |
| 11 | Backup, observabilidade e logs estruturados | **Parcial** | P1 |
| 12 | Node.js em versão LTS atual | **Problema** | P2 |

---

## Análise Detalhada

---

### 1. Checkout — Gateway Real / Webhooks

**Status: SIMULADO** `P0`

**Evidência:**

Em `artifacts/api-server/src/routes/orders.ts`, o pedido é criado **diretamente com `status: "paid"`**, sem qualquer integração com gateway:

```typescript
// artifacts/api-server/src/routes/orders.ts — linha ~60
const [order] = await db.insert(ordersTable).values({
  userId,
  status: "paid",           // ← pago imediatamente, sem verificação
  paymentMethod,
  ...
```

O código Pix gerado é uma string hardcoded de simulação:

```typescript
const pixCode = paymentMethod === "pix"
  ? `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2)}...`
  : null;
```

O endpoint `POST /orders/:id/pay` simplesmente faz `UPDATE status = "paid"` sem validar nenhum pagamento real:

```typescript
// artifacts/api-server/src/routes/orders.ts
await db.update(ordersTable).set({ status: "paid" }).where(eq(ordersTable.id, order.id));
```

Não existe nenhum endpoint de webhook (`/webhooks/stripe`, `/webhooks/pagar.me`, etc.) no projeto.

**Arquivos envolvidos:**
- `artifacts/api-server/src/routes/orders.ts`
- `artifacts/api-server/src/routes/index.ts`

**Impacto:** Em produção, qualquer usuário pode "pagar" sem efetuar pagamento real. Downloads seriam liberados gratuitamente.

---

### 2. Armazenamento de Senhas — SHA-256

**Status: RISCO CRÍTICO** `P0`

**Evidência:**

```typescript
// artifacts/api-server/src/lib/auth.ts
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + process.env.SESSION_SECRET).digest("hex");
}
```

SHA-256 é um algoritmo de **hash criptográfico de propósito geral**, não um algoritmo de derivação de chave para senhas. Problemas:

- **Velocidade**: SHA-256 executa bilhões de operações por segundo em hardware moderno, tornando ataques de força-bruta triviais.
- **Sem fator de custo**: Não há parâmetro de custo/rounds como bcrypt, Argon2 ou scrypt oferecem.
- **Sem salt por usuário**: O "salt" é o `SESSION_SECRET` global — igual para todos os usuários. Se dois usuários tiverem a mesma senha, terão o mesmo hash.
- **Vazamento catastrófico**: Se o banco vazar, todas as senhas podem ser quebradas rapidamente.

Algoritmos corretos: `bcrypt` (fator 12+), `argon2id`, `scrypt`.

**Arquivos envolvidos:**
- `artifacts/api-server/src/lib/auth.ts`

---

### 3. Token de Sessão no Frontend — localStorage

**Status: RISCO** `P1`

**Evidência:**

```typescript
// artifacts/multitrack-hub/src/lib/AuthContext.tsx
const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

localStorage.setItem("token", newToken);   // ao fazer login
localStorage.removeItem("token");           // ao fazer logout
```

O token Bearer é armazenado em `localStorage`, que é acessível por qualquer JavaScript rodando na página (incluindo scripts de terceiros, extensões, ou conteúdo injetado via XSS).

A alternativa segura é usar cookies `httpOnly; Secure; SameSite=Strict`, que são inacessíveis ao JavaScript.

**Arquivos envolvidos:**
- `artifacts/multitrack-hub/src/lib/AuthContext.tsx`

---

### 4. Downloads — URL Assinada com Expiração

**Status: PARCIAL** `P0`

**Evidência:**

O endpoint gera um token com expiração de 15 minutos:

```typescript
// artifacts/api-server/src/routes/downloads.ts
const token = crypto.randomBytes(16).toString("hex");
const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

res.json({
  url: `/api/downloads/file/${token}`,
  expiresAt,
});
```

**Porém:**

1. O token **não é armazenado em lugar nenhum** (sem tabela, sem Redis/cache).
2. Não existe nenhuma rota `GET /api/downloads/file/:token` — a URL retornada resultaria em **404**.
3. Não há integração com nenhum storage (S3, GCS, Cloudflare R2) para arquivos reais.
4. Os produtos têm `previewAudioUrl` e `coverUrl` como URLs estáticas sem controle de acesso.

Em resumo: a lógica de geração do token existe, mas a entrega do arquivo não foi implementada.

**Arquivos envolvidos:**
- `artifacts/api-server/src/routes/downloads.ts`
- `artifacts/api-server/src/routes/index.ts` (rota de servir arquivo ausente)
- `lib/db/src/schema/downloads.ts` (sem tabela de tokens temporários)

---

### 5. Controle de Licenciamento

**Status: PARCIAL** `P1`

**O que existe:**
- Campo `licenceSummary` (text livre) na tabela `products` — exibido na UI.
- `download_grants` controla quem tem permissão para baixar cada produto.
- `download_logs` registra IP e user-agent de cada download.
- Verificação de ownership antes de gerar link (`eq(downloadGrantsTable.userId, userId)`).

**O que está ausente:**
- Nenhum limite de downloads por grant (o campo `downloadCount` existe mas não há limite máximo configurável).
- Nenhum watermarking ou fingerprinting de áudio por usuário.
- Nenhuma DRM ou proteção técnica contra redistribuição.
- Nenhuma validação de licença por tipo de uso (comercial, ministério, etc.).
- O campo `licenceSummary` é texto não-estruturado, sem enforce por código.

**Arquivos envolvidos:**
- `lib/db/src/schema/downloads.ts`
- `lib/db/src/schema/products.ts`
- `artifacts/api-server/src/routes/downloads.ts`

---

### 6. Termos de Uso, Política de Privacidade e LGPD

**Status: AUSENTE** `P0`

**Evidência:**

Busca por `terms`, `privacy`, `lgpd`, `consent`, `aceite`, `politica`, `termos` em todos os arquivos do frontend retornou **zero resultados** (exceto o arquivo Footer.tsx que foi identificado — mas o grep no conteúdo não retornou nenhuma ocorrência).

**O que está ausente:**
- Página de Termos de Uso (`/termos`)
- Página de Política de Privacidade (`/privacidade`)
- Checkbox de aceite na tela de cadastro com versão versionada dos termos
- Consentimento de marketing (e-mail, SMS)
- Canal para solicitações LGPD (acesso, exclusão, portabilidade de dados)
- Registro de qual versão dos termos cada usuário aceitou
- Aviso de cookies / banner LGPD

**Arquivos envolvidos:**
- `artifacts/multitrack-hub/src/pages/register.tsx` (sem checkbox de aceite)
- `artifacts/multitrack-hub/src/components/layout/Footer.tsx` (sem links legais)
- `lib/db/src/schema/users.ts` (sem campo `terms_accepted_at` ou `terms_version`)

**Risco jurídico:** A LGPD (Lei nº 13.709/2018) exige base legal para tratamento de dados pessoais. Sem aceite registrado, a plataforma pode ser autuada pela ANPD.

---

### 7. MFA para Admin e RBAC Granular

**Status: AUSENTE** `P1`

**MFA — Evidência:**

Nenhuma referência a `mfa`, `totp`, `2fa`, `otp`, `authenticator` encontrada em nenhum arquivo do backend ou frontend. O login admin usa apenas email + senha (SHA-256 — já criticado no ponto 2).

**RBAC Granular — Evidência:**

```typescript
// artifacts/api-server/src/lib/auth.ts
export async function requireAdmin(req, res, next) {
  ...
  if (user?.role !== "admin" && user?.role !== "support") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
```

O role `support` tem exatamente o mesmo acesso que `admin` em todos os endpoints administrativos — incluindo criação/exclusão de produtos, ajuste de créditos e alteração de roles de usuários. Não há nenhuma distinção entre leitura e escrita.

**Arquivos envolvidos:**
- `artifacts/api-server/src/lib/auth.ts`
- `artifacts/api-server/src/routes/admin.ts`

---

### 8. Audit Logs para Ações Administrativas

**Status: AUSENTE** `P1`

**Evidência:**

Busca por `audit`, `audit_log`, `admin_log`, `action_log` em `lib/db/src` e `artifacts/api-server/src` retornou **zero resultados**.

Não existe:
- Tabela de audit log no schema
- Registro de qual admin realizou qual ação (criação/edição/exclusão de produto, mudança de role de usuário, ajuste de créditos, mudança de status de rateio)
- Middleware de auditoria automática

Qualquer ação administrativa é irreversível sem evidência de quem a realizou ou quando.

**Arquivos envolvidos:**
- `lib/db/src/schema/` (ausência de tabela `admin_audit_logs`)
- `artifacts/api-server/src/routes/admin.ts`

---

### 9. Testes Automatizados

**Status: AUSENTE** `P1`

**Evidência:**

Busca por arquivos `*.test.*`, `*.spec.*` em todo o projeto (excluindo `node_modules` e `dist`) retornou **zero arquivos**.

Não existe nenhum tipo de teste:
- Testes unitários (lógica de negócio: créditos, rateios, cupons)
- Testes de integração (fluxo de compra, download, assinatura)
- Testes E2E (Playwright/Cypress)
- Testes de autorização (verificar que usuário não-admin não acessa `/admin`)

**Arquivos envolvidos:**
- Projeto inteiro — ausência total

---

### 10. E-mails Transacionais

**Status: AUSENTE** `P1`

**Evidência:**

Nenhuma biblioteca de envio de e-mail encontrada:
- `nodemailer` — ausente
- `@sendgrid/mail` — ausente
- `resend` — ausente
- `postmark` — ausente
- Qualquer referência a SMTP — ausente

Nenhum dos seguintes e-mails está implementado:
- Confirmação de cadastro
- Confirmação de pedido com itens comprados
- Link de download após pagamento
- Notificação de novo status em rateio
- Aviso de créditos disponíveis (mensalmente)
- Recuperação de senha
- Aviso de cancelamento de assinatura

**Arquivos envolvidos:**
- `artifacts/api-server/src/routes/auth.ts` (sem e-mail de boas-vindas)
- `artifacts/api-server/src/routes/orders.ts` (sem e-mail de confirmação)
- `artifacts/api-server/src/routes/subscriptions.ts` (sem e-mail de assinatura)

---

### 11. Backup, Observabilidade e Logs Estruturados

**Status: PARCIAL** `P1`

**O que está implementado:**

✅ **Logs estruturados** — Pino + pino-http estão instalados e configurados no `api-server`. Todas as requisições são logadas com `req.log` (método, URL, status, tempo de resposta).

**O que está ausente:**

❌ **Backup do banco** — Nenhuma estratégia de backup automatizado configurada. O PostgreSQL do Replit não tem backup automático visível. Sem `pg_dump` agendado, sem snapshot de storage.

❌ **APM / Error Tracking** — Nenhum Sentry, Datadog, New Relic ou equivalente. Erros não capturados (`unhandledRejection`, `uncaughtException`) não são reportados.

❌ **Métricas de aplicação** — Sem Prometheus, sem health check estruturado além do `/api/health` básico.

❌ **Rastreamento distribuído** — Sem OpenTelemetry ou similar.

❌ **Alertas** — Sem integração com PagerDuty, Slack ou qualquer canal de alerta para falhas em produção.

**Arquivos envolvidos:**
- `artifacts/api-server/package.json` (pino presente, sem sentry/datadog)
- `artifacts/api-server/src/routes/health.ts`

---

### 12. Versão do Node.js

**Status: PROBLEMA** `P2`

**Evidência:**

```
$ node --version
v24.13.0
```

Node.js 24 é a linha **"Current"** (experimental/cutting-edge), **não é LTS**. As versões LTS ativas são:

| Versão | Codinome | Status | Fim do Suporte |
|---|---|---|---|
| Node 22 | Jod | **LTS Ativo** | abril/2027 |
| Node 20 | Iron | **LTS Ativo** | abril/2026 |
| Node 18 | Hydrogen | Maintenance | abril/2025 |
| **Node 24** | — | **Current** | Não LTS |

Usar versão não-LTS em produção significa:
- Sem garantia de patches de segurança de longo prazo.
- Possível incompatibilidade com pacotes npm otimizados para LTS.
- Não recomendado pela própria Node.js Foundation para ambientes de produção.

**Arquivos envolvidos:**
- `.nvmrc` / `.node-version` — ausentes (sem pinagem de versão)
- `package.json` — sem campo `engines`

---

## Plano de Correção por Prioridade

### P0 — Bloqueadores para produção (corrigir antes de lançar)

#### Etapa 1 — Segurança de senha (P0 crítico)
1. Instalar `bcrypt` ou `@node-rs/argon2` no `api-server`.
2. Substituir `hashPassword` e `verifyPassword` em `auth.ts` para usar bcrypt (rounds ≥ 12) ou argon2id.
3. Criar script de migração: no próximo login de cada usuário, re-hash a senha com o novo algoritmo (estratégia lazy migration).
4. Adicionar campo `passwordAlgo` na tabela `users` para diferenciar senhas já migradas.

#### Etapa 2 — Gateway de pagamento real (P0)
1. Escolher gateway (recomendados para BR: Pagar.me, Stripe com PIX, Mercado Pago).
2. Criar tabela `payment_intents` no schema com `gateway_id`, `status`, `amount`, `expires_at`.
3. Alterar `POST /orders` para criar o pedido como `status: "pending"` e chamar a API do gateway.
4. Implementar endpoint `POST /webhooks/<gateway>` para receber confirmação de pagamento e só então mudar para `status: "paid"` e criar `download_grants`.
5. Remover o código Pix hardcoded falso.

#### Etapa 3 — Entrega real de arquivos (P0)
1. Provisionar bucket de object storage (S3, GCS ou Cloudflare R2).
2. Criar tabela `download_tokens` (`token`, `grant_id`, `expires_at`, `used_at`).
3. Alterar `POST /downloads/:grantId/link` para salvar o token no banco e retornar URL real.
4. Implementar `GET /api/downloads/file/:token` que valida token, verifica expiração, marca como usado e faz redirect signed para o storage.
5. Fazer upload dos arquivos reais de multitrack para o bucket.

#### Etapa 4 — LGPD e termos (P0)
1. Adicionar campos `terms_accepted_at`, `terms_version`, `marketing_consent` na tabela `users`.
2. Criar página `/termos` com Termos de Uso versionados.
3. Criar página `/privacidade` com Política de Privacidade.
4. Adicionar checkbox de aceite obrigatório na tela de cadastro.
5. Adicionar checkbox opcional de consentimento de marketing.
6. Adicionar links no Footer para ambas as páginas.
7. Criar endpoint `POST /auth/lgpd/delete-request` para solicitações de exclusão.

---

### P1 — Importantes para operação segura (corrigir antes de escalar)

#### Etapa 5 — Token em httpOnly cookie (P1)
1. Alterar `POST /auth/login` e `POST /auth/register` para setar cookie `httpOnly; Secure; SameSite=Strict` em vez de retornar o token no body.
2. Alterar `POST /auth/logout` para limpar o cookie.
3. Alterar o middleware `requireAuth` para ler o token do cookie (como fallback manter header Authorization para compatibilidade com API externa).
4. Remover uso de `localStorage.getItem("token")` no frontend; o cookie é enviado automaticamente pelo browser.

#### Etapa 6 — Audit logs (P1)
1. Criar tabela `admin_audit_logs` (`id`, `admin_user_id`, `action`, `entity`, `entity_id`, `before`, `after`, `ip`, `created_at`).
2. Criar middleware `auditLog(action, entity)` que registra antes e depois da operação.
3. Aplicar o middleware em todos os endpoints de escrita do `admin.ts`.

#### Etapa 7 — RBAC granular para suporte (P1)
1. Definir permissões explícitas: `support` = somente leitura; `admin` = leitura + escrita.
2. Criar middlewares `requireAdminWrite` e `requireAdminRead`.
3. Aplicar `requireAdminWrite` em POST, PUT, DELETE, PATCH do `admin.ts`.
4. Aplicar `requireAdminRead` em GET do `admin.ts`.

#### Etapa 8 — MFA para admin (P1)
1. Instalar `otplib` (TOTP — compatível com Google Authenticator).
2. Adicionar campos `mfa_secret`, `mfa_enabled` na tabela `users`.
3. Criar endpoints `POST /auth/mfa/setup` (gera QR code), `POST /auth/mfa/verify` (valida código), `POST /auth/mfa/disable`.
4. Alterar `POST /auth/login`: se usuário tem `mfa_enabled = true`, retornar challenge em vez de token; exigir segundo fator em `POST /auth/mfa/challenge`.
5. Tornar MFA obrigatório para roles `admin` e `support`.

#### Etapa 9 — E-mails transacionais (P1)
1. Instalar `resend` ou `nodemailer` com provider confiável (Resend, SendGrid, SES).
2. Criar serviço `src/lib/mailer.ts` com templates para cada e-mail.
3. Implementar disparos em:
   - `register` → e-mail de boas-vindas + confirmação
   - `POST /orders` → confirmação de pedido com itens
   - `POST /orders/:id/pay` (webhook) → e-mail de pagamento confirmado + link de download
   - mudança de status de rateio → notificação para participantes
   - assinatura nova/cancelada → confirmação
4. Criar fila simples (ou usar `pg-boss`) para envio assíncrono.

#### Etapa 10 — Testes automatizados (P1)
1. Configurar Vitest para testes unitários e de integração no `api-server`.
2. Escrever testes unitários para: `hashPassword/verifyPassword`, lógica de cupons, lógica de créditos.
3. Escrever testes de integração (com banco em memória ou test container) para: fluxo de compra, uso de crédito, participação em rateio.
4. Configurar Playwright para testes E2E cobrindo: login, compra, checkout, download, admin CRUD.
5. Adicionar verificações de autorização: garantir que rotas `/admin/*` retornam 403 para usuários sem role admin.

#### Etapa 11 — Observabilidade (P1)
1. Instalar `@sentry/node` no `api-server` e configurar DSN.
2. Capturar `unhandledRejection` e `uncaughtException`.
3. Adicionar `Sentry.init()` antes dos middlewares Express.
4. Criar script de backup agendado: `pg_dump $DATABASE_URL | gzip > backup-$(date).sql.gz` com upload para storage.
5. Adicionar health check estruturado em `/api/health` com status do banco.

---

### P2 — Melhorias técnicas (planejar para próximo ciclo)

#### Etapa 12 — Versão LTS do Node.js (P2)
1. Criar `.nvmrc` com `22` (Node 22 LTS "Jod").
2. Adicionar campo `"engines": { "node": ">=22.0.0" }` no `package.json` raiz.
3. Testar compatibilidade de todos os pacotes com Node 22.
4. Atualizar o ambiente de execução do Replit para usar Node 22.

#### Etapa 13 — Licenciamento por produto (P2)
1. Criar tabela `license_types` com tipos estruturados (pessoal, comercial, ministério).
2. Relacionar `products` com `license_types`.
3. Exibir licença específica na página do produto.
4. Implementar limite configurável de downloads por grant.
5. (Futuro) Avaliar watermarking de áudio por usuário via serviço de processamento.

---

## Resumo Executivo

O MultiTrack Hub tem uma base sólida de produto — UI completa, modelo de dados bem estruturado, API organizada e funcionalidades diferenciadas (rateios, créditos, assinaturas). Porém, **não está pronto para produção real** por quatro razões críticas:

1. **Pagamentos não funcionam** — nenhum centavo seria efetivamente cobrado.
2. **Downloads não funcionam** — a URL gerada resulta em 404.
3. **Senhas são inseguras** — SHA-256 sem salt individual é quebrável em minutos com hardware moderno.
4. **Sem LGPD** — risco jurídico imediato ao coletar dados de usuários brasileiros.

Os itens P0 devem ser resolvidos antes de qualquer lançamento. Os itens P1 devem ser resolvidos antes de escalar usuários. Os itens P2 são melhorias de qualidade que podem ser planejadas iterativamente.

---

*Relatório gerado em maio/2026 — nenhuma alteração de código aplicada.*
