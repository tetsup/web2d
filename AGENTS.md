# AGENTS.md

## Cursor Cloud specific instructions

This is `@tetsup/web2d`, a lightweight 2D game runtime library for the web. It is a single TypeScript library (not a monorepo) with no backend, database, or external service dependencies.

### Prerequisites

- **Node.js >= 24** (required by `engines` field in `package.json`). Use `nvm use 24`.
- **pnpm 10.33.0** (specified via `packageManager` field). Activate with `corepack enable && corepack prepare pnpm@10.33.0 --activate`.
- **bun** is required at runtime by `tsdx lint` and `tsdx format` commands (they invoke `bunx oxlint` / `bunx oxfmt` internally).

### Key commands

All scripts are in `package.json`. Highlights:

| Task | Command | Notes |
|---|---|---|
| Install deps | `pnpm install` | |
| Lint | `pnpm lint` | Uses `tsdx lint` → `bunx oxlint`. Known issue: latest oxlint (v1.x) fails parsing `vite.config.ts`; use `bunx oxlint@0.16 src` as a workaround. |
| Typecheck | `pnpm typecheck` | Uses `tsdx typecheck` |
| Unit tests | `pnpm test` | Vitest with jsdom; no browser needed |
| E2E tests | `pnpm test:e2e` | Playwright; requires `pnpm build:test` first and Playwright browsers installed (`pnpm exec playwright install --with-deps chromium`) |
| Build library | `pnpm build` | Outputs to `dist/` via bunchee + tsc worker build |
| Dev server | `pnpm dev` | Vite dev server at `http://localhost:5173/` serving `test-game/` |
| Build test app | `pnpm build:test` | Vite build of the test game |

### Gotchas

- The `tsdx lint` command calls `bunx oxlint` internally. If `bun` is not on `PATH`, lint will fail with a confusing `command not found` or exit code 1 with no output.
- `pnpm lint` with the latest `oxlint` (v1.x fetched by `bunx oxlint@latest`) fails because it tries to auto-parse `vite.config.ts` as a config file. The upstream `tsdx` pinned `oxlint@^0.16` in its devDependencies but uses `bunx oxlint` (latest) at runtime. For linting, run `bunx oxlint@0.16 src` directly.
- The Vite dev server sets `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers needed for `SharedArrayBuffer`. The game will not function without these headers.
- E2E tests auto-start a Vite preview server on port 4173 via the Playwright config's `webServer` option. You must run `pnpm build:test` before `pnpm test:e2e`.
- The test game at `http://localhost:5173/` requires clicking the "Start" button in the UI controls to begin the game loop and render sprites.
