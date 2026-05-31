# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

RUN pnpm install --frozen-lockfile

WORKDIR /workspace/artifacts/api-server

RUN node ./build.mjs

# ─────────────────────────────────────────────
# Stage 2: Runtime
# ─────────────────────────────────────────────
FROM node:24-alpine AS runtime

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/api-server/package.json ./artifacts/api-server/package.json

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /workspace/artifacts/api-server/dist ./artifacts/api-server/dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
