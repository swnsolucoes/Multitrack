# Roadmap — MultiTrack Hub

> **Última atualização:** Junho/2026
> **Status geral:** Fase 0 concluída — próxima: Fase 1 (Hardening de segurança)

---

## Visão geral das fases

| Fase | Nome | Status | Prioridade |
|---|---|---|---|
| 0 | Staging técnico | ✅ Concluído | — |
| 1 | Hardening de segurança | 🟡 Em progresso | 🔴 Alta |
| 2 | LGPD e jurídico | ❌ Não iniciado | 🔴 Alta |
| 3 | Storage e download real | ❌ Não iniciado | 🔴 Alta |
| 4 | Pagamento real | ❌ Não iniciado | 🔴 Alta |
| 5 | MVP comercial | ❌ Não iniciado | 🟡 Média |
| 6 | Recursos avançados | ❌ Futuro | 🔵 Baixa |

---

## Fase 0 — Staging técnico ✅

**Status:** Concluído
**Objetivo:** Colocar o projeto em staging técnico funcional para validação de UX e fluxos.

### Entregáveis

- [x] Docker + Docker Compose configurado
- [x] Coolify como plataforma de deploy
- [x] PostgreSQL containerizado
- [x] Nginx como proxy `/api`
- [x] Healthcheck `/api/healthz`
- [x] CORS por variável de ambiente
- [x] Node.js 24 LTS
- [x] Auto-deploy via webhook GitHub
- [x] Flags de bloqueio de fluxos fake em produção
  - `ALLOW_FAKE_PAYMENTS=false`
  - `ALLOW_FAKE_SUBSCRIPTIONS=false`
  - `ENABLE_FAKE_DOWNLOAD_LINKS=false`
- [x] Documentação de staging e manutenção
- [x] Relatório P0 de hardening

### Critérios de aceite
- [x] API responde em `https://multitrack.macarsalao.com.br/api/healthz`
- [x] Frontend carrega com catálogo e produtos
- [x] Login admin funciona
- [x] Nenhum pagamento, download ou assinatura fake liberado em produção

---

## Fase 1 — Hardening de segurança 🟡

**Status:** Em progresso (parcial)
**Objetivo:** Eliminar vulnerabilidades críticas antes de receber dados de clientes reais.
**Dependências:** Nenhuma (pode iniciar agora)

### Entregáveis

- [ ] **Migrar senhas para bcrypt ou argon2id (rounds ≥ 12)**
  - Alterar `lib/db/src/schema/users.ts` e lógica de hash
  - Script de migração para hashes existentes
  - Aceitar critério: login funciona com novas e antigas senhas durante transição
- [ ] **Migrar token de sessão para cookie httpOnly**
  - Remover armazenamento em localStorage
  - Cookie: `httpOnly`, `Secure`, `SameSite=Strict`, `Path=/api`
  - Atualizar cliente React para não usar localStorage
- [ ] **RBAC granular (admin vs support)**
  - Role `support` deve ter acesso somente leitura
  - Separar middlewares por role
- [ ] **Audit logs de ações admin**
  - Tabela `admin_audit_logs`
  - Registrar: criar/editar/deletar produto, ajustar crédito, bloquear usuário
- [ ] **Headers de segurança**
  - CSP (Content Security Policy)
  - HSTS (já via Traefik/Cloudflare, verificar)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
- [ ] **Rate limiting em `/auth`**
  - Máximo 5 tentativas de login por IP em 15 minutos
- [ ] **Testes mínimos (auth + pedido + download)**
  - Cobertura básica dos fluxos críticos

### Critérios de aceite
- Senhas novas criadas com bcrypt/argon2id
- Token não aparece mais no localStorage
- Role `support` não consegue criar/editar/deletar
- Ações admin aparecem no audit log
- Brute force em `/auth/login` retorna 429 após limite

---

## Fase 2 — LGPD e jurídico ❌

**Status:** Não iniciado
**Objetivo:** Conformidade legal mínima para operar comercialmente no Brasil.
**Dependências:** Assessoria jurídica externa para validação

### Entregáveis

- [ ] **Página de Termos de Uso**
  - Direitos e obrigações do usuário
  - Política de uso dos arquivos (pessoal, comercial, sincronização)
  - Política de reembolso
- [ ] **Página de Política de Privacidade**
  - Quais dados são coletados e como são usados
  - Compartilhamento com terceiros (gateway, storage)
  - Prazo de retenção
  - Contato do DPO
- [ ] **Aceite no cadastro**
  - Checkbox obrigatório: "Li e aceito os Termos de Uso e a Política de Privacidade"
  - Campo `terms_accepted_at` + `terms_version` na tabela `users`
- [ ] **Consentimento de marketing**
  - Checkbox opcional: "Aceito receber novidades e promoções"
- [ ] **Solicitação de exclusão de conta**
  - Rota `DELETE /me` para solicitar exclusão de dados
  - Processo documentado e com prazo de resposta
- [ ] **Licenciamento dos produtos validado**
  - Confirmar com assessoria jurídica que os multitracks podem ser vendidos
  - Definir tipo de licença para o comprador

### Critérios de aceite
- Termos e Privacidade publicados e acessíveis
- Nenhum cadastro sem aceite explícito
- Processo de exclusão de dados documentado e funcionando
- Licenciamento validado juridicamente

---

## Fase 3 — Storage e download real ❌

**Status:** Não iniciado
**Objetivo:** Entregar arquivos reais de forma segura após pagamento confirmado.
**Dependências:** Fase 4 (pagamento) pode ser desenvolvida em paralelo

### Entregáveis

- [ ] **Escolher e configurar storage**
  - Avaliar: MinIO (self-hosted), Cloudflare R2, Backblaze B2 ou AWS S3
  - Variáveis: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
- [ ] **Upload de arquivos pelo painel admin**
  - Formulário de upload no CRUD de produtos
  - Armazenar path/key no campo `fileKey` da tabela `products`
- [ ] **Gerar URL assinada com expiração**
  - `POST /downloads/:grantId/link` retorna URL assinada (15 minutos)
  - Remover `_note: "PLACEHOLDER"` do response
- [ ] **Logs de download**
  - IP, user agent, timestamp — já existe tabela `download_logs`
  - Incrementar `downloadCount` somente após entrega real
- [ ] **Histórico de downloads na área do cliente**
  - Mostrar quais arquivos já foram baixados e quantas vezes

### Critérios de aceite
- Arquivo armazenado no storage
- URL assinada expira após 15 minutos
- Arquivo inacessível sem download_grant válido
- downloadCount incrementado somente após link real entregue

---

## Fase 4 — Pagamento real ❌

**Status:** Não iniciado
**Objetivo:** Receber pagamentos reais (Pix e cartão) e confirmar pedidos automaticamente.
**Dependências:** Nenhuma (pode ser desenvolvida em paralelo com Fase 3)

### Entregáveis

- [ ] **Escolher gateway de pagamento**
  - Avaliar: Mercado Pago, Pagar.me, Asaas, Stripe
  - Critérios: suporte a Pix, webhook confiável, taxas
- [ ] **Criar preferência de checkout**
  - `POST /orders/:id/checkout` → retorna link de pagamento ou QR Code Pix
- [ ] **Receber webhook de confirmação**
  - `POST /webhooks/gateway` valida assinatura HMAC
  - Chama `markOrderAsPaidAndGrantDownloads(orderId)` ao confirmar
- [ ] **Logs de pagamento**
  - Tabela `payment_events` (tentativa, sucesso, falha, estorno)
- [ ] **Tratamento de falha**
  - Pedido permanece `pending` se pagamento falhar
  - Mensagem clara para o usuário
- [ ] **Reembolso/estorno**
  - Endpoint para iniciar estorno
  - Revogar download_grants ao estornar
- [ ] **Testar com sandbox**
  - Testes completos no ambiente sandbox do gateway antes de produção

### Critérios de aceite
- Pix funciona: QR code gerado, webhook recebido, pedido passa para paid
- Cartão funciona: checkout, aprovação, webhook, paid
- Pagamento rejeitado não libera download
- Estorno revoga download_grant

---

## Fase 5 — MVP comercial ❌

**Status:** Não iniciado
**Dependências:** Fases 1, 2, 3 e 4 concluídas

**Objetivo:** Lançar oficialmente o produto para venda real.

### Entregáveis

- [ ] Todas as Fases 1 a 4 concluídas e validadas
- [ ] E-mails transacionais configurados
  - Confirmação de cadastro
  - Confirmação de pedido/pagamento
  - Link de download após pagamento
  - Recuperação de senha
- [ ] Backup automatizado do banco (diário, retenção 30 dias)
- [ ] Monitoramento e alertas (uptime, erros críticos)
- [ ] Admin com RBAC seguro + MFA
- [ ] Testes automatizados básicos passando
- [ ] Checklist de pré-lançamento validado (ver PRD seção 22)

### Critérios de aceite
- Pedido real pago via Pix e cartão
- Download real entregue por URL assinada
- E-mail de confirmação recebido
- Backup verificado funcionando
- Checklist do PRD seção 22 100% marcado

---

## Fase 6 — Recursos avançados ❌

**Status:** Futuro (após MVP comercial estável)
**Objetivo:** Expandir a plataforma com funcionalidades premium.

### Entregáveis (sem prazo definido)

- [ ] Assinatura recorrente real (cobrança automática mensal)
- [ ] Créditos automáticos por assinatura paga
- [ ] Rateio financeiro completo (split de pagamento, reembolso)
- [ ] Bundles avançados (agrupamento dinâmico de produtos)
- [ ] Recomendações por IA (baseadas em histórico de compras)
- [ ] E-mails de marketing segmentados
- [ ] PayloadCMS como painel admin alternativo (avaliação)
- [ ] App mobile (React Native/Expo)
- [ ] Marketplace aberto para terceiros

---

## Dependências entre fases

```
Fase 0 (concluída)
    │
    ├── Fase 1 (segurança)     ← pode iniciar agora
    ├── Fase 2 (LGPD)          ← pode iniciar agora (depende de jurídico externo)
    ├── Fase 3 (storage)       ← pode iniciar agora
    └── Fase 4 (pagamento)     ← pode iniciar agora

Fases 1 + 2 + 3 + 4
    │
    └── Fase 5 (MVP comercial) ← só após tudo acima

Fase 5
    │
    └── Fase 6 (avançados)     ← futuro
```

Fases 1, 2, 3 e 4 podem ser desenvolvidas **em paralelo**, pois não dependem umas das outras.

---

*Roadmap — MultiTrack Hub — Junho/2026*
