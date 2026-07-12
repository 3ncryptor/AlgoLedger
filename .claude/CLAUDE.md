# AlgoLedger — Project Instructions

`buildPlan.md` at the repo root is the source of truth for architecture. If a request conflicts with it, `buildPlan.md` wins until intentionally updated (see its section 32).

## Monorepo

pnpm workspaces + Turborepo. Packages: `apps/extension` (Manifest V3, Vite + CRXJS), `apps/web` (Next.js), `packages/{adapters,generators,github,schemas,shared,ui}`.

- Run everything from the repo root with `pnpm <script>` (turbo fans out to workspaces).
- New shared logic belongs in `packages/`, never duplicated across `apps/extension` and `apps/web`.
- `packages/schemas` is the single source of truth for the `Metadata` shape (buildPlan section 16) and other cross-cutting types — import from there, don't redefine.

## Skills

- `.claude/skills/{animation-vocabulary,apple-design,emil-design-eng,improve-animations,review-animations}` — Emil Kowalski's design-engineering skills (symlinked from `.agents/skills/`, installed via `npx skills@latest add emilkowalski/skills`). Use these for any frontend work in `apps/web` or the extension's `popup`/`options` UI.
- `.claude/skills/personal/` — reserved for the user's own skills. See its README for the authoring convention.

## Extension (`apps/extension`)

Folder layout is fixed by buildPlan section 8: `background/`, `content/`, `injected/`, `popup/`, `options/`, `notifications/`, `types/`, `utils/`. The GitHub PAT must never leave `background/` or `chrome.storage.local` — never pass it through `postMessage`, into `content/`/`injected/`, or into web/page storage.
