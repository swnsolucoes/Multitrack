---
name: Docker pnpm preinstall guard
description: Why corepack+pnpm fails the root workspace preinstall check inside Docker and the fix
---

The root `package.json` has a `preinstall` script that checks `npm_config_user_agent` starts with `pnpm/`. When pnpm is installed via `corepack enable && corepack prepare pnpm@latest --activate` inside Docker, the user-agent is not propagated correctly and the guard fails with "Use pnpm instead".

**Fix:** Install pnpm directly instead of via corepack:
```dockerfile
RUN npm install -g pnpm@10.26.1 --no-update-notifier
```

**Why:** When pnpm is invoked directly (not through corepack wrapper), it sets `npm_config_user_agent=pnpm/X.X.X ...` correctly, satisfying the preinstall check.

**How to apply:** Any Dockerfile in this monorepo that runs `pnpm install` must use direct npm installation. Pin to the exact version matching `pnpm --version` (currently 10.26.1).
