---
name: Docker rollup musl vs glibc
description: Rollup native binary arch mismatch in Docker; pnpm-workspace overrides exclude musl and arm64 variants
---

`pnpm-workspace.yaml` has overrides that set rollup platform variants to `"-"` (excluded) to minimize install size for Replit's x64-glibc environment. This causes Docker builds to fail when a different libc or arch is used.

**Affected scenarios:**
- `node:24-alpine` builder → needs `@rollup/rollup-linux-x64-musl` → excluded → build fails
- ARM64 Ubuntu production (Coolify) → needs `@rollup/rollup-linux-arm64-gnu` → was excluded → build fails

**Fix applied:**
1. Changed all builder stages from `node:24-alpine` → `node:24-slim` (Debian/glibc) — uses `linux-x64-gnu` which is already in lockfile
2. Removed the `rollup>@rollup/rollup-linux-arm64-gnu: "-"` exclusion from `pnpm-workspace.yaml`
3. Regenerated lockfile to include the arm64-gnu binary

**Also:** Frontend Dockerfile must copy `tsconfig.base.json` from workspace root because `artifacts/multitrack-hub/tsconfig.json` extends `../../tsconfig.base.json`.

**How to apply:** If adding new Dockerfiles to this monorepo, always use `node:24-slim` for builder stages, never `node:24-alpine`. If targeting a new architecture, check that the corresponding native binary override is NOT excluded in pnpm-workspace.yaml.
