# Project Guide

Void is a minimalist Arc-style desktop browser. Electron + electron-vite, React 19, Tailwind v4, shadcn (`radix-maia` style), TanStack Query, Drizzle over SQLite in the main process, Vitest. TypeScript strict; ESLint and Prettier enforced.

- `pnpm dev` runs the app with HMR; `pnpm build` bundles to `out/`; `pnpm start` previews the build.
- `pnpm fix` auto-fixes lint and format; `pnpm check` verifies format, lint, and typecheck (node and web projects).
- `pnpm test:run` runs Vitest once.

Code conventions (naming, anti-defaults, process boundaries, React discipline, reuse, tests): @.claude/rules/code-quality.md

## Communication

Speak plainly and concisely. No filler, no preamble, no restating the question. Surface what matters (the plan before a multi-step change, the root cause of a bug, tradeoffs in a decision) and stop.

## Workflow

- Commit directly in small atomic commits; tests go in the same commit as the behavior they verify. No PRs until the MVP.
- Never commit a state where `pnpm check`, `pnpm test:run`, or `pnpm build` fails.

## Architecture

### Directory Structure

- `src/main/` — Electron main process: windows, `WebContentsView` management, IPC handlers, database
- `src/preload/` — sandboxed preload; the typed `contextBridge` API and nothing else
- `src/shared/` — IPC contract types and pure, dependency-free modules shared by main, preload and renderer (no Node, Electron, React or zod imports); imported through the `@shared` alias
- `src/renderer/src/` — React app, aliased as `@/`
  - `components/ui/` — vendored shadcn primitives
  - `components/layout/` — app shell: providers, sidebar, address bar
  - `components/shared/` — generic reusable components not tied to a feature
  - `components/<feature>/` — feature-specific component groups
  - `hooks/` — all hooks, in per-model subdirs (e.g. `hooks/tabs/`). Never co-locate hooks with components.
  - `utils/` — global renderer utilities

Create top-level dirs only when the code is needed globally; otherwise co-locate under the feature that owns it. Hooks always live under `hooks/`.

Feature component dirs co-locate their own `utils/` and `constants/` when needed.

### Overlay

- Anything that must render above the page (toasts, the command palette, menus, popovers, floating nav) lives in the overlay layer (`src/main/overlay` + the overlay renderer entry). Never add a per-feature native view or a webview for it.
- Peek mode: while the sidebar is collapsed, hovering the shell's left-edge gutter (or the panel), or flicking the pointer out of the window across its left edge (detected in main from fast leftward `before-mouse-event` moves that end near the edge and go quiet, since the page view reports no usable leave), asks main to slide a floating copy of the sidebar in from the overlay. Main owns the hover delays (`peek-hover.ts`) and hides the view only after the renderer confirms the slide-out. A modal ends the peek; a toast and the peek share the union of their bounds. The page view's bounds never change for it.

### IPC

- The renderer reaches main only through the preload API. Channels are named by domain (`tabs:list`, `history:record`).
- Main validates every payload with zod and owns all state; the renderer holds a cache of it.

### Data

- SQLite via Drizzle runs in the main process only. The renderer never touches the database.
- Queries: `queryOptions()` factories in the model's hooks dir (e.g. `hooks/tabs/tabs.queries.ts`), called as `useQuery(tabQueries.all())`. Promote to a custom hook only for real shared logic.
- Mutations: the shared `useAppMutation` wrapper, with `invalidates: [...]` passed as factory query keys, never hand-written arrays.
