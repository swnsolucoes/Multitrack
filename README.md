# MultiTrack Hub

Plataforma brasileira para venda e distribuição de multitracks, playbacks, stems e materiais musicais digitais.

> **Status:** Staging técnico — `multitrack.macarsalao.com.br`
> **Stack:** React/Vite + Express + PostgreSQL + Drizzle + Docker + Coolify
> **Repositório:** https://github.com/swnsolucoes/Multitrack

---

## Links rápidos

### Produto e estratégia
- [PRD — Product Requirements Document](docs/product/PRD_MultiTrack_Hub.md)
- [Status Atual do Projeto](docs/product/STATUS_ATUAL.md)
- [Roadmap por Fases](docs/product/ROADMAP.md)

### Features
- [Feature: Rateio Coletivo](docs/features/rateio.md)

### Segurança
- [Hardening de Produção](docs/security/production-hardening.md)
- [Relatório P0 de Travas](RELATORIO_P0_TRAVAS_PRODUCAO.md)

### Deploy e operações
- [Guia de Deploy (Coolify)](docs/deploy/coolify.md)
- [Guia de Manutenção Operacional](docs/MANUTENCAO.md)
- [Documentação técnica completa](DOCUMENTACAO.md)

---

## ⚠️ Aviso importante

**Este projeto está em staging técnico. Não está pronto para venda real.**

Antes de aceitar pagamentos de clientes:
1. Integre um gateway de pagamento real (Mercado Pago, Pagar.me, Stripe)
2. Configure storage real (S3, Cloudflare R2 ou MinIO)
3. Migre senhas para bcrypt/argon2id
4. Implemente conformidade LGPD (termos, privacidade, aceite)
5. Valide licenciamento musical com assessoria jurídica

Ver [checklist completo no PRD](docs/product/PRD_MultiTrack_Hub.md#22-critérios-para-venda-real).

---

## Público-alvo

- Músicos profissionais e amadores
- Igrejas e ministérios de louvor
- Produtores musicais
- Bandas e grupos musicais

---

## Arquitetura

```
artifacts/multitrack-hub/   → Frontend React + Vite
artifacts/api-server/       → Backend Express + Node.js
lib/db/                     → Drizzle ORM + schema PostgreSQL
lib/api-spec/               → OpenAPI 3.0
lib/api-client-react/       → Hooks React Query (gerados)
lib/api-zod/                → Schemas Zod (gerados)
```

## Infraestrutura

```
Cloudflare Tunnel → Traefik/Coolify → Nginx (web) → Express (api) → PostgreSQL
```

## Acesso rápido (staging)

- **Site:** https://multitrack.macarsalao.com.br
- **Admin:** `admin@multitrack.com` / `admin123`
- **Healthcheck:** https://multitrack.macarsalao.com.br/api/healthz

---

## Desenvolvimento local

```bash
# Instalar dependências
pnpm install

# Verificar tipos
pnpm run typecheck

# Build
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/multitrack-hub run build

# Docker (produção)
docker compose up -d
```

---

*MultiTrack Hub — Junho/2026*
