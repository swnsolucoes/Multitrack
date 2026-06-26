# Status Atual — MultiTrack Hub

> **Data:** Junho/2026
> **Ambiente:** Staging técnico — `multitrack.macarsalao.com.br`
> **Repositório:** https://github.com/swnsolucoes/Multitrack

---

## ⚠️ AVISO IMPORTANTE

> **NÃO USAR COM CLIENTES PAGANTES.**
> O sistema está em staging técnico. Não há gateway de pagamento real, storage real, senhas seguras ou conformidade LGPD.
> Nenhuma cobrança deve ser feita até que todos os bloqueadores P0 sejam resolvidos.

---

## Status Geral

**Fase atual:** Staging técnico (Fase 0 concluída)
**Próxima fase:** Hardening de segurança (Fase 1)

---

## O que já está implementado

### Infraestrutura
- ✅ Docker + Docker Compose funcionando
- ✅ Coolify como plataforma de deploy
- ✅ PostgreSQL containerizado com volume persistente
- ✅ Nginx servindo frontend e fazendo proxy `/api`
- ✅ Healthcheck `/api/healthz` (retorna status do banco)
- ✅ CORS configurável por variável de ambiente
- ✅ Node.js 24 LTS padronizado
- ✅ Auto-deploy via webhook GitHub (push no main → deploy automático em ~60-90s)

### Backend
- ✅ API Express com rotas RESTful
- ✅ Autenticação com token Bearer (sessões no banco, TTL 30 dias)
- ✅ Roles: `buyer`, `member`, `premium`, `admin`, `support`
- ✅ Logs estruturados JSON (Pino)
- ✅ Drizzle ORM com 19 tabelas criadas
- ✅ Seeds: 8 categorias, 12 produtos, 3 usuários, 4 rateios, 3 cupons

### Frontend
- ✅ React + Vite, dark mode permanente
- ✅ Catálogo com filtros (BPM, tonalidade, gênero, preço)
- ✅ Página de produto com preview de áudio
- ✅ Carrinho com cupons
- ✅ Área do cliente (pedidos, downloads, wishlist, créditos, assinatura)
- ✅ Painel admin (dashboard, produtos, pedidos, usuários, cupons, rateios, créditos)
- ✅ Página de rateios

### Segurança (hardening P0 aplicado)
- ✅ Pedidos nascem como `pending` (não mais `paid` direto)
- ✅ `POST /orders/:id/pay` → HTTP 403 em produção (`ALLOW_FAKE_PAYMENTS=false`)
- ✅ `POST /subscriptions/me` → HTTP 403 em produção (`ALLOW_FAKE_SUBSCRIPTIONS=false`)
- ✅ `POST /downloads/:id/link` → HTTP 403 em produção (`ENABLE_FAKE_DOWNLOAD_LINKS=false`)
- ✅ `markOrderAsPaidAndGrantDownloads()` centralizado — pronto para webhook de gateway
- ✅ Webhook de auto-deploy exige `WEBHOOK_SECRET` (falha na inicialização sem ele)
- ✅ GET do webhook retorna apenas "ok" sem detalhes do sistema

---

## O que está parcialmente implementado

| Item | O que existe | O que falta |
|---|---|---|
| Pedidos | Criação, listagem, itens | Pagamento real, webhook |
| Downloads | Grant, contagem, histórico | Storage real, URL assinada |
| Admin | CRUD completo | RBAC granular, audit logs, MFA |
| Rateio | Interesse, participantes, comentários | Cobrança real, split de pagamento |
| Assinatura | Estrutura de planos e créditos | Gateway recorrente real |

---

## O que está bloqueado (pendente)

### 🔴 P0 — Crítico (bloqueia venda real)

| Item | Impacto |
|---|---|
| Gateway de pagamento real | Sem isso, nenhum pedido pode ser pago |
| Storage real (S3/R2/MinIO) | Sem isso, nenhum download pode ser entregue |
| Senha com bcrypt/argon2id | SHA-256 atual é inseguro para produção real |
| Token em cookie httpOnly | localStorage vulnerável a XSS |
| LGPD (termos, privacidade, aceite) | Ilegal operar sem conformidade |
| Licenciamento musical dos produtos | Risco jurídico de violação de direitos autorais |

### 🟡 P1 — Importante antes de escalar

| Item | Impacto |
|---|---|
| E-mails transacionais | Sem confirmação de compra, sem recuperação de senha |
| Backup automatizado | Risco de perda de dados |
| Audit logs admin | Sem rastreabilidade de ações |
| MFA para admin | Acesso admin sem segunda camada |
| Migrações versionadas | drizzle-kit push sem histórico |
| Testes automatizados | Zero cobertura |

---

## Riscos críticos

| Risco | Severidade | Mitigação atual |
|---|---|---|
| Senha SHA-256 sem salt | 🔴 Alto | Documentado; migrar para bcrypt antes do lançamento |
| Token em localStorage (XSS) | 🔴 Alto | Documentado; migrar para cookie httpOnly |
| Sem LGPD | 🔴 Legal | Documentado; bloqueia operação comercial |
| docker.sock montado no webhook | 🟡 Médio | WEBHOOK_SECRET obrigatório; rotacionar periodicamente |
| Sem backup | 🟡 Médio | Fazer dump manual periodicamente até automatizar |
| Sem monitoramento | 🟡 Médio | Logs estruturados existem; sem alertas ainda |

---

## Próximos passos recomendados

### Imediato (antes de qualquer venda)
1. Implementar bcrypt/argon2id na autenticação
2. Migrar token para cookie httpOnly
3. Criar página de Termos de Uso e Política de Privacidade
4. Validar licenciamento dos produtos com assessoria jurídica

### Curto prazo (para lançamento)
5. Integrar gateway de pagamento (Mercado Pago ou Pagar.me)
6. Configurar storage (MinIO ou Cloudflare R2)
7. Implementar e-mails transacionais (confirmação, recuperação)
8. Configurar backup automatizado do banco

### Médio prazo (após lançamento)
9. Audit logs do admin
10. MFA para admin
11. Monitoramento e alertas
12. Testes automatizados básicos

---

*Status Atual — MultiTrack Hub — Junho/2026*
