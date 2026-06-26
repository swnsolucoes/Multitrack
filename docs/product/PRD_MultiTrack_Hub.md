# PRD — MultiTrack Hub

> **Versão:** 1.0 — Junho/2026
> **Status:** Staging técnico — não pronto para venda real
> **Stack:** React/Vite + Express + PostgreSQL + Drizzle + Docker + Coolify

---

## Índice

1. [Visão geral do produto](#1-visão-geral-do-produto)
2. [Problema que o produto resolve](#2-problema-que-o-produto-resolve)
3. [Proposta de valor](#3-proposta-de-valor)
4. [Modelo de negócio](#4-modelo-de-negócio)
5. [Escopo do MVP comercial](#5-escopo-do-mvp-comercial)
6. [Fora do MVP inicial](#6-fora-do-mvp-inicial)
7. [Estado atual do projeto — Junho/2026](#7-estado-atual-do-projeto--junho2026)
8. [Status por módulo](#8-status-por-módulo)
9. [Fluxo ideal do usuário](#9-fluxo-ideal-do-usuário)
10. [Fluxo atual do projeto](#10-fluxo-atual-do-projeto)
11. [Requisitos funcionais](#11-requisitos-funcionais)
12. [Requisitos não funcionais](#12-requisitos-não-funcionais)
13. [Segurança](#13-segurança)
14. [Pagamento](#14-pagamento)
15. [Downloads](#15-downloads)
16. [Rateio](#16-rateio)
17. [LGPD e jurídico](#17-lgpd-e-jurídico)
18. [Admin](#18-admin)
19. [Infraestrutura](#19-infraestrutura)
20. [Decisões técnicas registradas](#20-decisões-técnicas-registradas)
21. [Roadmap](#21-roadmap)
22. [Critérios para venda real](#22-critérios-para-venda-real)

---

## 1. Visão geral do produto

**MultiTrack Hub** é uma plataforma para venda e distribuição de multitracks, playbacks, stems e materiais musicais digitais.

**Público-alvo:**
- Músicos profissionais e amadores
- Igrejas e ministérios de louvor
- Produtores musicais
- Bandas e grupos musicais
- Qualquer pessoa que precise de bases musicais organizadas para ensaio, apresentação ou produção

**Objetivo principal:** Permitir que o usuário busque, ouça prévia, compre, baixe e gerencie materiais musicais digitais de forma organizada, segura e profissional.

**Funcionalidades centrais:**
- Catálogo com busca e filtros técnicos (BPM, tonalidade, gênero, artista)
- Prévia de áudio antes da compra
- Compra avulsa e bundles
- Assinatura com créditos (futuro)
- Rateio coletivo (futuro)
- Downloads seguros e rastreados
- Área do cliente com histórico
- Painel administrativo completo

---

## 2. Problema que o produto resolve

| Problema | Impacto |
|---|---|
| Dificuldade de encontrar multitracks organizados na internet | Perda de tempo, qualidade inconsistente |
| Falta de catálogo com filtros técnicos (BPM, tonalidade, gênero, qualidade) | Músicos precisam ouvir muitos arquivos antes de encontrar o certo |
| Falta de experiência profissional de compra e download | Processo frustante, sem confiança |
| Sem área do cliente, sem histórico, sem rastreamento de licença | Risco de perda de arquivos, sem controle |
| Falta de preview de qualidade antes da compra | Compras erradas e insatisfação |
| Produtos dispersos em grupos de WhatsApp, Google Drive e links avulsos | Sem profissionalismo, sem segurança |

---

## 3. Proposta de valor

- **Catálogo organizado** com filtros técnicos e busca inteligente
- **Preview de áudio** embutido antes da compra
- **Compra avulsa** simples e rápida
- **Bundles e pacotes** com desconto
- **Cupons** para promoções e parceiros
- **Assinatura com créditos** para uso frequente (futuro)
- **Rateio coletivo** para músicas de alto custo (futuro)
- **Downloads protegidos** por URL assinada com expiração
- **Área do cliente** com histórico completo de compras e downloads
- **Painel administrativo** para gestão de produtos, pedidos, usuários e promoções
- **Foco em músicos e ministérios de louvor** — experiência adaptada para o setor gospel e musical brasileiro

---

## 4. Modelo de negócio

| Modalidade | Status | Observação |
|---|---|---|
| Compra avulsa | Implementado (staging) | Bloqueado por falta de gateway real |
| Bundles/pacotes | Implementado (staging) | Idem |
| Cupons de desconto | Implementado | Funcional em staging |
| Assinatura com créditos | Implementado (staging) | Bloqueado em produção por flag |
| Rateio financeiro | Parcial — modo sugestão | Não deve aceitar pagamento agora |
| Afiliados | Futuro | Não implementado |

> **Atenção:** Assinatura, créditos e rateio financeiro **não devem ser liberados comercialmente** antes de:
> pagamento real, download real, política de reembolso e validação jurídica/licenciamento.

---

## 5. Escopo do MVP comercial

Para lançar como produto comercial real, o MVP mínimo deve incluir:

### Obrigatório para venda real

- [x] Home page
- [x] Catálogo com filtros
- [x] Página de produto com preview
- [x] Cadastro e login
- [x] Carrinho
- [x] Pedido com status `pending`
- [ ] **Checkout real via gateway de pagamento**
- [x] Área do cliente
- [x] Histórico de pedidos
- [ ] **Downloads seguros (URL assinada)**
- [x] Painel admin básico
- [x] Cadastro de produtos
- [x] Controle de usuários
- [ ] **Termos de uso, política de privacidade e LGPD**
- [ ] **E-mails transacionais** (confirmação de compra, cadastro, recuperação)
- [ ] **Storage real** (S3, R2 ou MinIO)
- [ ] **Gateway de pagamento real** (Pix + cartão)

---

## 6. Fora do MVP inicial

Estes itens ficam para versões futuras após o MVP comercial:

- Rateio financeiro completo
- Assinatura recorrente real
- Créditos automáticos pagos
- Programa de afiliados
- Recomendações inteligentes por IA
- PayloadCMS como painel admin alternativo
- App mobile (React Native/Expo)
- Marketplace aberto para terceiros venderem

---

## 7. Estado atual do projeto — Junho/2026

> ⚠️ **O projeto está em staging técnico. Não está pronto para venda real com clientes pagantes.**

### Implementado

| Item | Status |
|---|---|
| Docker + Coolify | ✅ Funcionando em staging |
| PostgreSQL containerizado | ✅ |
| Nginx como proxy `/api` | ✅ |
| Healthcheck `/api/healthz` | ✅ |
| CORS por variável de ambiente | ✅ |
| Node.js 24 LTS | ✅ |
| Pedidos nascem como `pending` | ✅ (hardening P0 aplicado) |
| Pagamento fake bloqueado em produção | ✅ (`ALLOW_FAKE_PAYMENTS=false`) |
| Assinatura fake bloqueada em produção | ✅ (`ALLOW_FAKE_SUBSCRIPTIONS=false`) |
| Download fake bloqueado em produção | ✅ (`ENABLE_FAKE_DOWNLOAD_LINKS=false`) |
| Auto-deploy via webhook GitHub | ✅ |

### Pendente (bloqueadores para venda real)

| Item | Status |
|---|---|
| Gateway de pagamento real | ❌ Pendente |
| Storage real (S3/R2/MinIO) | ❌ Pendente |
| Download real com URL assinada | ❌ Pendente |
| Senha segura (bcrypt/argon2id) | ❌ Pendente |
| Token em cookie HttpOnly | ❌ Pendente |
| LGPD (termos, privacidade, aceite) | ❌ Pendente |
| E-mails transacionais | ❌ Pendente |
| Audit logs | ❌ Pendente |
| MFA para admin | ❌ Pendente |
| Migrações versionadas (drizzle migrate) | ❌ Pendente |
| Testes automatizados | ❌ Pendente |

---

## 8. Status por módulo

| Módulo | Status | Observação | Prioridade |
|---|---|---|---|
| Catálogo | ✅ Implementado | Filtros BPM, gênero, tonalidade, preço | — |
| Carrinho | ✅ Implementado | Cupons funcionando | — |
| Pedidos | 🟡 Parcial | Nasce como `pending`; sem confirmação real | P0 |
| Checkout | 🔴 Bloqueado | Sem gateway; fake bloqueado em produção | P0 |
| Downloads | 🔴 Bloqueado | Link placeholder; bloqueado em produção | P0 |
| Storage | 🔴 Bloqueado | Sem S3/R2/MinIO | P0 |
| Assinatura | 🔴 Bloqueado | Fake bloqueado em produção | P1 |
| Créditos | 🔴 Bloqueado | Depende de assinatura real | P1 |
| Rateio | 🟡 Parcial | Modo sugestão; sem financeiro real | P2 |
| Wishlist | ✅ Implementado | — | — |
| Admin | 🟡 Parcial | CRUD funcional; sem RBAC, audit log, MFA | P1 |
| Usuários | 🟡 Parcial | Auth funcionando; senha SHA-256 (insegura) | P0 |
| Docker/Coolify | ✅ Implementado | Staging operacional | — |
| Segurança | 🔴 Crítico | SHA-256, localStorage, sem MFA | P0 |
| LGPD | 🔴 Bloqueado | Sem termos, privacidade, aceite | P0 |
| E-mails | 🔴 Bloqueado | Sem envio de nenhum e-mail | P1 |
| Observabilidade | 🟡 Parcial | Logs estruturados; sem métricas, alertas | P2 |
| Backup | 🔴 Bloqueado | Sem backup automatizado do banco | P1 |

---

## 9. Fluxo ideal do usuário

```
1. Acessa o site (multitrack.macarsalao.com.br)
2. Pesquisa no catálogo por gênero, BPM, tonalidade ou artista
3. Ouve a prévia de áudio do produto
4. Visualiza detalhes: faixa, tonalidade, qualidade, preço
5. Adiciona ao carrinho (com ou sem login)
6. Faz login ou cadastra uma conta nova
7. Aplica cupom de desconto (opcional)
8. Finaliza o pedido → pedido criado como pending
9. Paga via gateway real (Pix ou cartão)
10. Webhook do gateway confirma o pagamento
11. Sistema executa markOrderAsPaidAndGrantDownloads()
12. Pedido passa para paid, download_grant criado
13. Usuário recebe e-mail de confirmação
14. Acessa /downloads e baixa o arquivo por URL assinada (expiração 15min)
15. Histórico fica disponível permanentemente na área do cliente
```

---

## 10. Fluxo atual do projeto

```
1. Pedido é criado com status pending ✅
2. POST /orders/:id/pay → HTTP 403 em produção ✅ (ALLOW_FAKE_PAYMENTS=false)
3. POST /subscriptions/me → HTTP 403 em produção ✅ (ALLOW_FAKE_SUBSCRIPTIONS=false)
4. POST /downloads/:id/link → HTTP 403 em produção ✅ (ENABLE_FAKE_DOWNLOAD_LINKS=false)
5. Sistema pode ser usado como staging técnico para validação de UX/fluxo
6. Não está apto para receber dinheiro de clientes reais
```

---

## 11. Requisitos funcionais

### Catálogo
- RF01: Listar produtos com paginação e filtros (BPM, tonalidade, gênero, artista, preço, qualidade)
- RF02: Busca por texto (nome, artista, descrição)
- RF03: Preview de áudio embutido
- RF04: Página de produto com tracks, formatos disponíveis e produtos relacionados
- RF05: Produtos em destaque na home (featured, bestsellers)

### Produto
- RF06: CRUD de produto no admin (nome, artista, gênero, BPM, tonalidade, duração, faixas, preço, capa, preview)
- RF07: Status do produto: draft, active, featured, inactive
- RF08: Produto pode ser avulso ou parte de bundle

### Carrinho
- RF09: Adicionar/remover produtos do carrinho
- RF10: Aplicar e remover cupom de desconto
- RF11: Calcular subtotal, desconto e total
- RF12: Persistência do carrinho por usuário autenticado

### Pedido
- RF13: Criar pedido a partir do carrinho com status `pending`
- RF14: Pedido deve listar os itens comprados
- RF15: Pedido só passa para `paid` após confirmação real do gateway
- RF16: Histórico de pedidos na área do cliente

### Pagamento
- RF17: Integração com gateway real (Mercado Pago, Pagar.me, Stripe ou Asaas)
- RF18: Suporte a Pix e cartão de crédito
- RF19: Webhook para confirmação de pagamento
- RF20: Logs de pagamento (tentativa, sucesso, falha)
- RF21: Tratamento de estorno e reembolso

### Download
- RF22: Download grant criado somente após pagamento confirmado
- RF23: URL assinada com expiração (máx. 15 minutos) para cada download
- RF24: Contador de downloads por arquivo
- RF25: Histórico de downloads na área do cliente
- RF26: Re-download disponível para arquivos já adquiridos

### Usuário
- RF27: Cadastro com e-mail e senha
- RF28: Login e logout
- RF29: Recuperação de senha por e-mail
- RF30: Perfil editável (nome, e-mail)
- RF31: Aceite obrigatório de Termos e Política de Privacidade no cadastro

### Admin
- RF32: Dashboard com métricas (vendas, pedidos, usuários, downloads)
- RF33: CRUD de produtos
- RF34: Listagem e gerenciamento de pedidos
- RF35: Listagem e gerenciamento de usuários (bloquear, alterar role)
- RF36: Gestão de cupons (criar, ativar, desativar)
- RF37: Ajuste manual de créditos
- RF38: Audit logs de ações sensíveis

### Assinatura
- RF39: Plano Premium com preço mensal
- RF40: Créditos mensais concedidos após cobrança real
- RF41: Acumulo de créditos até máximo definido
- RF42: Cancelamento no final do período

### Créditos
- RF43: Usar crédito para baixar produto compatível
- RF44: Ledger completo de créditos (ganho, uso, expiração, ajuste)

### Rateio
- RF45: Registrar interesse em rateio (modo sugestão)
- RF46: Visualizar progresso de interesse
- RF47: Comentários no rateio
- RF48: Sem cobrança ou download real até bloqueadores serem resolvidos

### Cupons
- RF49: Cupom por percentual ou valor fixo
- RF50: Limite de uso total e por usuário
- RF51: Data de expiração
- RF52: Cupom aplicado no carrinho ou no checkout

### Bundles
- RF53: Agrupar produtos em bundle com preço especial
- RF54: Bundle aparece no catálogo como produto único

### E-mails transacionais
- RF55: Confirmação de cadastro
- RF56: Confirmação de pedido/pagamento
- RF57: Link de download após pagamento
- RF58: Recuperação de senha
- RF59: Confirmação de cancelamento de assinatura

### LGPD
- RF60: Página de Termos de Uso
- RF61: Página de Política de Privacidade
- RF62: Aceite explícito e versionado no cadastro
- RF63: Solicitação de exclusão de dados
- RF64: Política de retenção de dados
- RF65: Consentimento de marketing

### Observabilidade
- RF66: Logs estruturados de requisições (já implementado)
- RF67: Healthcheck `/api/healthz` (já implementado)
- RF68: Métricas de performance (tempo de resposta, erros)
- RF69: Alertas de falha (pagamento, download, saúde dos serviços)

---

## 12. Requisitos não funcionais

### Segurança
- RNF01: Senhas com bcrypt ou argon2id (rounds ≥ 12)
- RNF02: Token de sessão em cookie `httpOnly`, `Secure`, `SameSite=Strict`
- RNF03: HTTPS obrigatório em produção (já via Cloudflare/Traefik)
- RNF04: CORS restrito por variável de ambiente
- RNF05: Headers de segurança (CSP, HSTS, X-Frame-Options, X-Content-Type)
- RNF06: Rate limiting nas rotas de auth
- RNF07: Secrets apenas por variáveis de ambiente, nunca no código

### Performance
- RNF08: Resposta da API ≤ 300ms para 95% das requisições
- RNF09: Build do frontend gzipado ≤ 400KB
- RNF10: Lazy loading de componentes pesados
- RNF11: Cache de assets estáticos via Nginx (já configurado)
- RNF12: Conexão com banco via pool (já no Drizzle)

### SEO
- RNF13: Meta tags dinâmicas por produto
- RNF14: Open Graph para compartilhamento em redes sociais
- RNF15: URLs amigáveis para produtos e categorias
- RNF16: Sitemap XML

### Acessibilidade
- RNF17: Contraste mínimo WCAG AA
- RNF18: Navegação por teclado
- RNF19: Alt text em imagens
- RNF20: Labels em formulários

### Backup
- RNF21: Backup diário automatizado do PostgreSQL
- RNF22: Retenção mínima de 30 dias
- RNF23: Teste de restore periodicamente

### Logs e monitoramento
- RNF24: Logs estruturados JSON em produção (já implementado via Pino)
- RNF25: Centralização de logs (Loki, Grafana ou similar)
- RNF26: Alertas de erro crítico por e-mail ou Telegram

### Escalabilidade
- RNF27: Arquitetura stateless na API (pronta para múltiplas réplicas)
- RNF28: Banco separado do app (já containerizado separado)

### Infraestrutura
- RNF29: Compatível com Coolify e Docker Compose
- RNF30: PostgreSQL como banco principal
- RNF31: Storage S3-compatible (MinIO, R2, Backblaze B2, AWS S3)
- RNF32: Preferir ferramentas open source e baixo custo

---

## 13. Segurança

### Pendências críticas

| Item | Risco | Prioridade |
|---|---|---|
| Senha com SHA-256 sem salt individual | Alto — quebrável com GPU/rainbow table | P0 |
| Token em localStorage | Alto — vulnerável a XSS | P0 |
| Checkout fake ativo em dev sem controle | Médio — flags implementadas | P0 ✅ |
| Falta de LGPD | Legal — impede operação comercial | P0 |
| Sem audit logs admin | Médio — sem rastreabilidade | P1 |
| Sem MFA para admin | Médio — acesso só com email+senha | P1 |
| Headers de segurança incompletos | Médio | P1 |
| Webhook com docker.sock montado | Alto — controle total do host | P1 |
| CORS sem validação estrita | Médio | P1 |
| Sem rate limiting em /auth | Médio — risco de brute force | P1 |

### Plano de correção (resumo)

1. **P0:** Migrar para bcrypt/argon2id + cookie httpOnly + validar LGPD
2. **P1:** Audit logs + MFA admin + headers + rate limiting + rotacionar WEBHOOK_SECRET
3. **P2:** Revisão completa de permissões RBAC, separar `support` (readonly)

---

## 14. Pagamento

### Estado atual
- Pagamento real **não implementado**
- Simulação de pagamento **bloqueada em produção** via `ALLOW_FAKE_PAYMENTS=false` (HTTP 403)
- Função `markOrderAsPaidAndGrantDownloads()` criada e pronta para receber chamada de webhook real

### Roadmap de pagamento

1. Escolher gateway: **Mercado Pago**, Asaas, Pagar.me ou Stripe
2. Criar variáveis: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`
3. Criar preferência de checkout (Pix + cartão) em `POST /orders/:id/checkout`
4. Criar `POST /webhooks/gateway` para receber confirmação
5. Validar assinatura HMAC do gateway
6. Chamar `markOrderAsPaidAndGrantDownloads(orderId)` ao confirmar
7. Enviar e-mail de confirmação
8. Criar logs de pagamento (tentativa, sucesso, falha, estorno)
9. Implementar política de reembolso e endpoint de estorno
10. Testar com sandbox antes de produção

---

## 15. Downloads

### Estado atual
- `download_grants` existem no banco e são criados após pagamento confirmado
- Link placeholder `/api/downloads/file/:token` existe mas não aponta para arquivo real
- Link fake **bloqueado em produção** via `ENABLE_FAKE_DOWNLOAD_LINKS=false` (HTTP 403)
- `downloadCount` não é incrementado quando bloqueado

### Roadmap de downloads

1. Escolher storage: **MinIO** (self-hosted), Cloudflare R2, Backblaze B2 ou AWS S3
2. Configurar variáveis: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
3. Upload de arquivos pelo painel admin
4. Gerar URL assinada com expiração de 15 minutos em `POST /downloads/:grantId/link`
5. Remover `_note: "PLACEHOLDER"` do response
6. Registrar logs de download (IP, user agent, timestamp)
7. Incrementar `downloadCount` apenas após entrega real
8. Implementar histórico de acesso na área do cliente

---

## 16. Rateio

### Estado atual
- Rateio existe como **modo sugestão/interesse** — usuários podem registrar interesse
- Tabelas `rateios`, `rateio_participants`, `rateio_comments` existem no banco
- Sem cobrança, sem liberação de download, sem split de pagamento
- Status possíveis: `open`, `in_quotation`, `suggested`, `completed`, `cancelled`

### Por que não liberar financeiro agora

O rateio financeiro real exige:

- [ ] Gateway de pagamento real com split
- [ ] Webhook de confirmação
- [ ] Política de reembolso documentada
- [ ] Validação jurídica (licenciamento musical)
- [ ] Audit logs de participação e pagamento
- [ ] Fluxo de cancelamento com reembolso
- [ ] Vinculação com produto final real no storage
- [ ] Download seguro após conclusão

### Como usar agora
O rateio deve ser apresentado ao usuário como:
> "Sugira uma música para um futuro rateio coletivo. Registre seu interesse e acompanhe quantas pessoas também querem."

---

## 17. LGPD e jurídico

### Pendências

| Item | Status |
|---|---|
| Termos de Uso | ❌ Pendente |
| Política de Privacidade | ❌ Pendente |
| Aceite obrigatório no cadastro | ❌ Pendente |
| Registro de versão do aceite | ❌ Pendente |
| Consentimento de marketing | ❌ Pendente |
| Solicitação de exclusão de dados | ❌ Pendente |
| Política de retenção | ❌ Pendente |
| Política de reembolso | ❌ Pendente |
| Licenciamento musical dos produtos | ❌ Pendente |
| Direitos autorais e uso comercial | ❌ Pendente |

> **Alerta jurídico:** Antes de operar comercialmente, é obrigatório validar com assessoria jurídica:
> - Se os multitracks possuem autorização dos detentores de direitos autorais
> - Como licenciar o uso para usuários finais (pessoal, comercial, sincronização)
> - Quais dados de usuários são coletados e como são tratados sob a LGPD

---

## 18. Admin

### Estado atual
- CRUD de produtos, pedidos, usuários, cupons, rateios e créditos funcionando
- Dashboard com métricas básicas (Recharts)
- Sem RBAC granular (role `support` tem mesmos acessos que `admin`)
- Sem audit logs
- Sem MFA
- Sem separação leitura/escrita

### Roadmap admin

1. Separar role `support` como somente leitura
2. Criar tabela `admin_audit_logs` com ação, usuário, IP, timestamp, dados antes/depois
3. Registrar ações sensíveis: criar/editar/deletar produto, ajustar crédito, bloquear usuário
4. Implementar MFA (TOTP) para role `admin`
5. Adicionar tela de audit log no painel

---

## 19. Infraestrutura

### Atual

```
Internet
    │
    ▼
[Cloudflare Tunnel]
    │
    ▼
[Traefik / Coolify]  (HTTPS → HTTP)
    │
    ▼
[multitrack_web — Nginx :80]
    │ /api/*
    ▼
[multitrack_api — Express :8080]
    │
    ▼
[multitrack_postgres — PostgreSQL :5432]  (rede interna)

[multitrack_webhook — Python :9001]  (auto-deploy)
```

- **VPS:** Ubuntu x86_64 com Coolify
- **Domínio:** multitrack.macarsalao.com.br
- **Status:** staging técnico operacional

### Antes de produção comercial

- Adicionar storage (MinIO ou R2)
- Configurar backup automatizado do banco
- Configurar monitoramento e alertas
- Revisar risco do docker.sock no webhook container
- Migrar `drizzle-kit push` para `drizzle-kit migrate` com histórico versionado

---

## 20. Decisões técnicas registradas

| Decisão | Motivo | Data |
|---|---|---|
| Manter React/Vite + Express + PostgreSQL + Drizzle + Coolify | Stack validada, estável, sem necessidade de migração | Jun/2026 |
| Não migrar para PayloadCMS agora | Risco alto de retrabalho sem benefício imediato; pode ser avaliado na v2 | Jun/2026 |
| Usar SHA-256 por enquanto com alerta | Débito técnico documentado; será migrado para bcrypt/argon2id | Jun/2026 |
| Bloquear fluxos fake em produção via flags | Impede dano sem quebrar staging | Jun/2026 |
| Usar staging antes de venda real | Previne problemas com clientes reais antes de estar pronto | Jun/2026 |
| Priorizar open source e baixo custo | Sustentabilidade financeira do projeto | Jun/2026 |
| Evitar novas funcionalidades até resolver bloqueadores | Foco em qualidade e segurança antes de escalar | Jun/2026 |

---

## 21. Roadmap

Ver arquivo completo em: [`ROADMAP.md`](./ROADMAP.md)

### Resumo das fases

| Fase | Nome | Status |
|---|---|---|
| 0 | Staging técnico | ✅ Concluído |
| 1 | Hardening de segurança | 🟡 Em progresso |
| 2 | LGPD e jurídico | ❌ Não iniciado |
| 3 | Storage e download real | ❌ Não iniciado |
| 4 | Pagamento real | ❌ Não iniciado |
| 5 | MVP comercial | ❌ Não iniciado |
| 6 | Recursos avançados | ❌ Futuro |

---

## 22. Critérios para venda real

O sistema só está pronto para receber dinheiro de clientes reais quando **todos** os itens abaixo estiverem marcados:

### Bloqueadores P0 — obrigatórios

- [ ] Gateway de pagamento real integrado e testado (Pix + cartão)
- [ ] Webhook de confirmação de pagamento validado
- [ ] Pedido só passa para `paid` após confirmação real do webhook
- [ ] Download real com URL assinada e expiração
- [ ] Storage real configurado (arquivos hospedados com segurança)
- [ ] Senha com bcrypt ou argon2id (rounds ≥ 12)
- [ ] Token em cookie `httpOnly`, `Secure`, `SameSite`
- [ ] LGPD mínima implementada (termos, privacidade, aceite no cadastro)
- [ ] Termos de Uso e Política de Privacidade publicados
- [ ] Política de reembolso documentada e implementada
- [ ] Licenciamento dos produtos validado juridicamente

### Bloqueadores P1 — fortemente recomendados antes do lançamento

- [ ] E-mails transacionais (confirmação de compra, cadastro, recuperação)
- [ ] Backup automatizado do banco com retenção de 30 dias
- [ ] Logs e monitoramento básico
- [ ] Admin com RBAC seguro (support somente leitura)
- [ ] Audit logs de ações admin
- [ ] Testes mínimos passando (auth, pedido, download)

---

*PRD — MultiTrack Hub v1.0 — Junho/2026*
