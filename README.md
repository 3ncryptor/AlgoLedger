# AlgoLedger

AlgoLedger automatically converts your accepted competitive programming submissions into a structured, version-controlled GitHub knowledge repository. GitHub is the database — no backend, no lock-in, just your own permanent algorithm archive.

See [`buildPlan.md`](./buildPlan.md) for the full architecture specification — it is the source of truth for this project.

## Monorepo Layout

```text
apps/
├── extension/    Manifest V3 browser extension (ingestion engine)
└── web/          Next.js landing site (discovery + docs)

packages/
├── adapters/     Platform adapter interface + implementations (LeetCode, ...)
├── generators/   README / metadata / statistics generators
├── github/       GitHub REST + GraphQL client
├── schemas/      Shared Zod schemas and types (Metadata, Problem, Submission)
├── shared/       Cross-cutting types, enums, utilities
└── ui/           Shared React component library
```

## Requirements

- Node.js >= 20 (see `.nvmrc`)
- pnpm 10.x (`corepack enable` recommended)

## Getting Started

```bash
pnpm install
pnpm dev
```

## Common Commands

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `pnpm dev`        | Run all apps in dev mode          |
| `pnpm build`      | Build all apps and packages       |
| `pnpm lint`       | Lint the entire workspace         |
| `pnpm type-check` | Type-check the entire workspace   |
| `pnpm test`       | Run tests across the workspace    |
| `pnpm format`     | Format the codebase with Prettier |

## Coding Standards

TypeScript everywhere, pnpm workspaces, Turborepo, ESLint + Prettier, Vitest. See `buildPlan.md` section 30 for the full standard.

## Claude Code Skills

This repo ships with Claude Code skills under `.claude/skills/`:

- `emil-*` skills — Emil Kowalski's design-engineering and animation skills ([emilkowalski/skills](https://github.com/emilkowalski/skills)), installed via `npx skills@latest add emilkowalski/skills`.
- `personal/` — space reserved for your own personal skills. See `.claude/skills/personal/README.md`.
