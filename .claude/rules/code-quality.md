# Code Quality

Electron + React 19 + TypeScript (strict) + Tailwind v4. Hard conventions for this repo.

## Anti-defaults

- No premature abstractions. Three similar lines beats a helper used once.
- Don't add features or improvements beyond what was asked.
- Don't refactor adjacent code while fixing a bug.
- No dead code or commented-out blocks.
- No comments. Only three kinds are allowed: a one-line file purpose when the name doesn't say it, a contract doc on names exported across a module boundary, and a one-line why on a declaration. Never inside a function body. If code needs more, fix the naming or structure.
- No TODO/FIXME/HACK markers; open work belongs in a ticket.
- Don't modify generated files (`*.gen.*`, `*.generated.*`).
- Don't use map indexes as keys. Use real unique identifiers.
- No IIFEs. Assign the value to a named variable or call a named function.

## Naming

- **Files**: kebab-case (`tab-list.tsx`, `use-tabs.ts`).
- **Components**: PascalCase. **Hooks**: `use-*.ts` files, camelCase exports.
- **Booleans**: `is` / `has` / `should` / `can` prefix.
- **Functions**: verb-first (`getTab`, `createWindow`).
- **Constants**: `SCREAMING_SNAKE`.

## TypeScript

- Never use `any`. Use proper types, `unknown`, or generics.
- Avoid `as` casts; fix the root types.
- `import type` for type-only imports. Prefer `type` over `interface`.
- Remove unused imports and vars entirely.
- Use `@/` imports in the renderer, never `../`.

## Process boundaries

- `src/main` owns Node, the database, and every `ipcMain` handler. `src/preload` exposes a minimal typed API through `contextBridge` and nothing else. `src/renderer` is a plain web app with no Node access.
- Windows keep `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`.
- The sandboxed preload can only `require` `electron` and a few core modules. It cannot import Node builtins such as `node:path`.
- Never expose `ipcRenderer` or raw channel names to the renderer; expose named functions.
- Validate every IPC payload at the main-process boundary with zod.
- Renderer and main share types, never runtime code.

## React discipline

- **Presentation only.** Components render; non-trivial logic lives in `utils/` or hooks.
- **No state-sync in effects.** Derive during render. Enforced by `eslint-plugin-react-you-might-not-need-an-effect`.
- **No reflexive memoization.** Add `useMemo`/`useCallback`/`React.memo` only with a measured reason.
- **Accessible by default.** Every interactive control has an accessible name; icon-only buttons get an `aria-label` that names the target.
- **`asChild`** when a primitive should render as another element. Pass exactly one child that forwards `ref` and spreads props.

## Constants

- Collections (arrays, objects, tables) go in a `constants/` file, never inline in a component.
- Scalars may stay inline.

## Forms & validation

- A form's zod schema and inferred type live in the form's file. Promote to a shared module only when multiple forms share it.

## Shared formatters

- Helpers that turn a value into a display string live in the renderer's common `utils/`, not a feature dir. Feature-specific logic stays with the feature.

## Reuse before build

Search before creating anything new.

- **UI primitives**: check `components/ui/`, then `components/shared/`, then `components/layout/`. Compose with what exists; confirm before creating a primitive.
- **Hooks**: grep `hooks/<feature>/` for `use-{concept}` first.
- **Utilities**: grep `utils/` and feature `utils/` dirs before adding a helper.
- **Never modify shared UI** (`components/ui/`, `components/shared/`) behavior or API without an explicit ask.
- `components/ui/` is vendored from the shadcn CLI. Pass props and variants instead of restyling; no arbitrary Tailwind values (enforced by `shadcn/no-arbitrary-values`).
- `src/renderer/src/components/ui/**` is vendored shadcn output the CLI re-fetches, so it is exempt from the no-comments rule, `react-hooks/purity`, and its other ui-scoped lint overrides in `eslint.config.mjs`. App code is not exempt.

## Tests

- Tests ship in the same commit as the logic they verify.
- Keep tests reasonable and minimal. Never write vacuous tests.
- Cover behavior that could actually break (a query returning wrong rows, a state transition, a validation boundary), not code restated or "it renders".
- A few tests per behavior beats exhaustive cases.
- No snapshot or render-only tests.
- No `as`, `any`, or `!` in tests.
- Don't test vendored `components/ui/`.
- Co-locate tests in a `__tests__/` dir beside the file under test, named `<name>.test.ts(x)`.

## File size

- Keep files small. Extract subcomponents, utils, or constants before a file grows unwieldy.
- Don't duplicate logic across files.
