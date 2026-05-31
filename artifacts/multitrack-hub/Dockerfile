# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/multitrack-hub/ ./artifacts/multitrack-hub/

RUN pnpm install --frozen-lockfile

WORKDIR /workspace/artifacts/multitrack-hub

ARG PORT=80
ARG BASE_PATH=/
ARG NODE_ENV=production

ENV PORT=$PORT
ENV BASE_PATH=$BASE_PATH
ENV NODE_ENV=$NODE_ENV

RUN pnpm run build

# ─────────────────────────────────────────────
# Stage 2: Runtime (Nginx)
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /workspace/artifacts/multitrack-hub/dist/public /usr/share/nginx/html

COPY artifacts/multitrack-hub/nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
