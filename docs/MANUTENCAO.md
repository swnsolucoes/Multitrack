# MultiTrack Hub — Guia de Manutenção Operacional

> Referência rápida para operações do dia a dia em produção.
> VPS: `root@prata.zzux.com` | Chave SSH: `~/.ssh/vps_key`
> Site: `https://multitrack.macarsalao.com.br`
> Repositório: `https://github.com/swnsolucoes/Multitrack`

---

## Índice

1. [Acesso ao VPS](#1-acesso-ao-vps)
2. [Status e saúde dos serviços](#2-status-e-saúde-dos-serviços)
3. [Deploy e atualizações](#3-deploy-e-atualizações)
4. [Logs](#4-logs)
5. [Banco de dados — operações comuns](#5-banco-de-dados--operações-comuns)
6. [Gerenciar usuários e conteúdo](#6-gerenciar-usuários-e-conteúdo)
7. [Reiniciar serviços](#7-reiniciar-serviços)
8. [Adicionar produto via API](#8-adicionar-produto-via-api)
9. [Backup do banco](#9-backup-do-banco)
10. [Resolução de problemas comuns](#10-resolução-de-problemas-comuns)

---

## 1. Acesso ao VPS

```bash
# Conexão SSH (chave ed25519)
ssh -i ~/.ssh/vps_key root@prata.zzux.com

# Navegar até o projeto
cd /opt/multitrack
```

---

## 2. Status e saúde dos serviços

```bash
# Ver todos os containers e status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

# Saída esperada em produção normal:
# multitrack_api        Up X hours (healthy)
# multitrack_web        Up X hours (healthy)
# multitrack_webhook    Up X hours
# multitrack_postgres   Up X hours (healthy)

# Testar a API diretamente
curl https://multitrack.macarsalao.com.br/api/healthz
# {"ok":true,"database":"ok","env":"production"}

# Testar o frontend
curl -I https://multitrack.macarsalao.com.br/
# HTTP/2 200
```

---

## 3. Deploy e atualizações

### Auto-deploy (recomendado)

Basta fazer `git push origin main` — o deploy acontece automaticamente em ~60–90 segundos.

```bash
# No Replit ou máquina local:
git add .
git commit -m "feat: descrição da mudança"
git push origin main

# Monitorar o deploy em tempo real:
ssh -i ~/.ssh/vps_key root@prata.zzux.com 'docker logs -f multitrack_webhook'
```

### Deploy manual (emergência)

```bash
ssh -i ~/.ssh/vps_key root@prata.zzux.com

cd /opt/multitrack
git pull origin main

# Rebuild e restart (excluindo webhook para não matar o próprio processo)
docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml \
  build api web

docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml \
  up -d api web postgres

# Verificar saúde
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Reiniciar apenas um serviço (sem rebuild)

```bash
cd /opt/multitrack
docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml \
  restart api
```

---

## 4. Logs

```bash
# Logs da API (backend)
docker logs multitrack_api --tail=100 -f

# Logs do frontend (Nginx)
docker logs multitrack_web --tail=50 -f

# Logs do auto-deploy (webhook)
docker logs multitrack_webhook --tail=50 -f

# Logs do banco
docker logs multitrack_postgres --tail=50

# Todos os logs ao mesmo tempo
cd /opt/multitrack
docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml logs -f
```

---

## 5. Banco de dados — operações comuns

### Acessar o PostgreSQL

```bash
docker exec -it multitrack_postgres \
  psql -U multitrack -d multitrack_db
```

### Consultas úteis

```sql
-- Ver todos os usuários
SELECT id, name, email, role, is_blocked, created_at FROM users ORDER BY id;

-- Ver pedidos recentes
SELECT id, user_id, status, total, payment_method, created_at
FROM orders ORDER BY created_at DESC LIMIT 20;

-- Ver saldo de créditos por usuário
SELECT user_id, SUM(CASE WHEN type IN ('earned','refunded','adjusted') THEN amount
                          ELSE -amount END) as saldo
FROM credit_ledger GROUP BY user_id;

-- Ver rateios ativos
SELECT id, song_name, artist, status, current_participants, goal_participants
FROM rateios WHERE status NOT IN ('completed','cancelled','refunded');

-- Contar produtos ativos
SELECT COUNT(*) FROM products WHERE status IN ('active','featured');

-- Ver downloads por usuário
SELECT u.email, COUNT(dg.id) as grants, SUM(dl.download_count) as total_downloads
FROM users u
LEFT JOIN download_grants dg ON dg.user_id = u.id
LEFT JOIN download_logs dl ON dl.grant_id = dg.id
GROUP BY u.id ORDER BY total_downloads DESC NULLS LAST;
```

### Rodar migrações (após mudança de schema)

```bash
cd /opt/multitrack

# Container migrate roda drizzle-kit push e sai
docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml \
  run --rm migrate
```

---

## 6. Gerenciar usuários e conteúdo

### Criar usuário admin

```bash
# Gerar hash da senha no VPS
SESSION_SECRET=$(grep SESSION_SECRET /opt/multitrack/.env | cut -d= -f2)
HASH=$(python3 -c "
import hashlib
secret = '$SESSION_SECRET'
senha = 'suasenha'
print(hashlib.sha256((senha + secret).encode()).hexdigest())
")

# Inserir no banco
docker exec -it multitrack_postgres \
  psql -U multitrack -d multitrack_db -c "
INSERT INTO users (name, email, password_hash, role)
VALUES ('Nome Admin', 'email@dominio.com', '$HASH', 'admin');
"
```

### Alterar role de usuário

```bash
docker exec -it multitrack_postgres \
  psql -U multitrack -d multitrack_db -c "
UPDATE users SET role = 'admin' WHERE email = 'email@dominio.com';
"
```

### Bloquear/desbloquear usuário

```bash
# Bloquear
UPDATE users SET is_blocked = true WHERE email = 'email@dominio.com';

# Desbloquear
UPDATE users SET is_blocked = false WHERE email = 'email@dominio.com';
```

### Criar cupom diretamente no banco

```bash
docker exec -it multitrack_postgres \
  psql -U multitrack -d multitrack_db -c "
INSERT INTO coupons (code, type, value, max_uses_total, max_uses_per_user, is_active)
VALUES ('PROMO30', 'percentage', 30, 100, 1, true);
"
```

### Adicionar créditos a um usuário

```bash
# Via painel admin: /admin/credits
# Ou direto no banco:
docker exec -it multitrack_postgres \
  psql -U multitrack -d multitrack_db -c "
INSERT INTO credit_ledger (user_id, type, amount, description)
VALUES (ID_DO_USUARIO, 'adjusted', 3, 'Crédito manual por promoção');
"
```

---

## 7. Reiniciar serviços

```bash
cd /opt/multitrack
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml"

# Reiniciar tudo (sem rebuild)
$COMPOSE restart

# Reiniciar só a API
$COMPOSE restart api

# Reiniciar só o frontend
$COMPOSE restart web

# Reiniciar o webhook (auto-deploy)
$COMPOSE restart webhook

# Parar tudo
$COMPOSE stop

# Subir tudo
$COMPOSE up -d

# Parar e REMOVER containers (banco mantido via volume)
$COMPOSE down

# ⚠️ PERIGO: Para tudo e apaga o banco!
# $COMPOSE down -v
```

---

## 8. Adicionar produto via API

### Via painel admin (recomendado)

1. Acesse `https://multitrack.macarsalao.com.br/admin/products`
2. Login: `admin@multitrack.com` / `admin123`
3. Clique em **Criar**
4. Preencha todos os campos
5. Status `draft` para não publicar imediatamente
6. Mude para `active` ou `featured` quando pronto

### Via API REST

```bash
# 1. Fazer login e pegar o token
TOKEN=$(curl -s -X POST https://multitrack.macarsalao.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@multitrack.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Criar produto
curl -X POST https://multitrack.macarsalao.com.br/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome da Música",
    "artist": "Artista",
    "genre": "Gospel",
    "categoryId": 1,
    "bpm": 120,
    "tonality": "G",
    "duration": "4:30",
    "description": "Descrição completa",
    "price": "29.90",
    "coverUrl": "https://url-da-capa.jpg",
    "previewAudioUrl": "https://url-do-preview.mp3",
    "status": "draft",
    "quality": "premium",
    "tracks": ["Voz", "Teclado", "Bateria", "Baixo", "Guitarra"],
    "formats": ["WAV", "MP3"],
    "isFeatured": false,
    "availableForSubscription": true,
    "creditsRequired": 1
  }'
```

---

## 9. Backup do banco

### Criar backup manual

```bash
# Conectar ao VPS
ssh -i ~/.ssh/vps_key root@prata.zzux.com

# Fazer dump do banco
docker exec multitrack_postgres \
  pg_dump -U multitrack multitrack_db \
  > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# Verificar o backup
ls -lh /tmp/backup_*.sql

# Copiar para sua máquina local (rodar no local, não no VPS)
scp -i ~/.ssh/vps_key root@prata.zzux.com:/tmp/backup_*.sql ./backups/
```

### Restaurar um backup

```bash
# ⚠️ Isso substitui os dados atuais!
docker exec -i multitrack_postgres \
  psql -U multitrack -d multitrack_db < backup_arquivo.sql
```

---

## 10. Resolução de problemas comuns

### Container API não sobe / unhealthy

```bash
# Ver o que aconteceu
docker logs multitrack_api --tail=50

# Causas comuns:
# - DATABASE_URL inválida → verificar .env
# - Porta já em uso → docker ps -a | grep 8080
# - Erro na migração → docker logs multitrack_migrate
```

### Site retorna 502 Bad Gateway

```bash
# API não está rodando
docker ps | grep multitrack_api

# Se parado, subir:
cd /opt/multitrack
docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml up -d api
```

### Webhook não dispara deploy

```bash
# 1. Checar se o container está rodando
docker ps | grep multitrack_webhook

# 2. Verificar logs do webhook
docker logs multitrack_webhook --tail=30

# 3. Testar o endpoint manualmente
curl -I https://multitrack.macarsalao.com.br/hooks/deploy
# Deve retornar HTTP 200

# 4. Verificar se o WEBHOOK_SECRET está configurado
grep WEBHOOK_SECRET /opt/multitrack/.env | cut -c1-25
```

### Deploy falhou no meio

```bash
# Ver logs do deploy
docker logs multitrack_webhook --tail=60

# Subir os containers manualmente se necessário
cd /opt/multitrack
docker compose -f docker-compose.yml -f docker-compose.coolify-override.yml up -d

# Verificar status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Banco inacessível

```bash
# Verificar se o postgres está rodando
docker ps | grep multitrack_postgres
docker logs multitrack_postgres --tail=30

# Testar conexão direto
docker exec multitrack_postgres \
  pg_isready -U multitrack -d multitrack_db

# Reiniciar o postgres (⚠️ causa downtime breve)
docker restart multitrack_postgres
```

### API retornando erros de autenticação

```bash
# Verificar SESSION_SECRET no .env
grep SESSION_SECRET /opt/multitrack/.env | head -c 40

# Se o SESSION_SECRET mudou, as senhas antigas não funcionam mais
# Precisa recriar os usuários ou restaurar o SESSION_SECRET original
```

### Espaço em disco acabando

```bash
# Ver uso de disco
df -h /

# Limpar imagens Docker antigas
docker image prune -f

# Limpar volumes não usados
docker volume prune -f

# Limpar logs de containers antigos
docker system prune -f

# Ver o que está ocupando espaço
du -sh /opt/multitrack/
du -sh /var/lib/docker/
```

---

## Referência rápida de comandos

```bash
# Variável de conveniência
COMPOSE="docker compose -f /opt/multitrack/docker-compose.yml -f /opt/multitrack/docker-compose.coolify-override.yml"

# Status geral
$COMPOSE ps

# Logs em tempo real
$COMPOSE logs -f

# Rebuild + restart da API
$COMPOSE build api && $COMPOSE up -d api

# Rebuild + restart do frontend
$COMPOSE build web && $COMPOSE up -d web

# Acessar banco
docker exec -it multitrack_postgres psql -U multitrack -d multitrack_db

# Verificar saúde
curl https://multitrack.macarsalao.com.br/api/healthz
```

---

*Guia de manutenção — MultiTrack Hub v1.1 — junho/2026*
