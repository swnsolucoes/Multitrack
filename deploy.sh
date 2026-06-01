#!/bin/bash
set -e

PROJECT_DIR="/opt/multitrack"
COMPOSE_FILES="-f ${PROJECT_DIR}/docker-compose.yml -f ${PROJECT_DIR}/docker-compose.coolify-override.yml"

echo "========================================="
echo "  MultiTrack Deploy - $(date)"
echo "========================================="

cd "$PROJECT_DIR"

# Fix git safe.directory dentro do container
git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true

echo ""
echo "[1/4] Atualizando codigo do GitHub..."
git pull origin main

echo ""
echo "[2/4] Build das imagens Docker (excluindo webhook)..."
docker compose $COMPOSE_FILES build api web

echo ""
echo "[3/4] Subindo servicos (excluindo webhook para evitar auto-reinicializacao)..."
docker compose $COMPOSE_FILES up -d --remove-orphans api web postgres

echo ""
echo "[4/4] Aguardando API ficar saudavel..."
for i in $(seq 1 24); do
  STATUS=$(docker inspect --format="{{.State.Health.Status}}" multitrack_api 2>/dev/null || echo "none")
  if [ "$STATUS" = "healthy" ]; then
    echo "API saudavel apos $((i*5))s"
    break
  fi
  [ "$i" = "24" ] && echo "Timeout esperando API" && break
  echo "  aguardando... ($STATUS) ${i}/24"
  sleep 5
done

echo ""
echo "Limpando imagens antigas..."
docker image prune -f > /dev/null 2>&1

echo ""
echo "=== Containers ativos ==="
docker compose $COMPOSE_FILES ps

echo ""
echo "Deploy concluido em $(date)"
