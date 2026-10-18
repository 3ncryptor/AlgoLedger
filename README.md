# AlgoLedger

> Automatically convert your accepted competitive programming submissions into a structured, version-controlled GitHub knowledge repository — with zero backend, no vendor lock-in, and full data ownership.

---

## Overview

### What is AlgoLedger?

AlgoLedger is a privacy-first browser extension (Manifest V3) that monitors your competitive programming submissions on platforms like LeetCode. When you get an **Accepted** verdict, AlgoLedger captures your code, problem metadata, difficulty, runtime, memory, and tags, then commits them directly to your personal GitHub repository via GitHub's API.

### Why Use AlgoLedger?

- **Permanent & Searchable Archive**: Never lose track of your solutions, past approaches, or historical milestones.
- **Zero Intermediary Backend**: Your code and GitHub token go directly from your browser to GitHub. No third-party servers, databases, or analytics tracking your data.
- **Automated Documentation**: Generates rich directory structures, problem READMEs, and catalog statistics automatically.
- **Portfolio Ready**: Turns your daily DSA practice into a clean, verifiable GitHub repository showcasing your progress and coding consistency.

---

## Setup Guide

Follow these steps to set up and start using AlgoLedger in your browser.

### 1. Prerequisites

- **Node.js**: `>= 20.0.0` (check with `node -v`)
- **pnpm**: `10.x` recommended (`corepack enable` or `npm install -g pnpm`)
- **Browser**: Google Chrome, Brave, Arc, or any Chromium-based browser

### 2. Clone Repository

Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/3ncryptor/AlgoLedger.git
cd AlgoLedger
```

### 3. Install Dependencies & Build Extension

Install workspace dependencies and build the extension package:

```bash
pnpm install
pnpm --filter @algoledger/extension build
```

The compiled extension files will be generated in `apps/extension/dist/`.

### 4. Load Extension in Chrome

1. Open your browser and navigate to `chrome://extensions`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left menu.
4. Select the build output folder:
   ```text
   <path-to-repo>/apps/extension/dist
   ```
5. Confirm that **AlgoLedger** appears in your installed extensions list.

### 5. Create a GitHub Personal Access Token

AlgoLedger requires a GitHub Personal Access Token (PAT) with write access to push commits to your chosen archive repository.

#### Recommended: Fine-Grained Token (Safer, Scoped)

1. Navigate to [GitHub Developer Settings → Fine-grained tokens](https://github.com/settings/personal-access-tokens/new).
2. Set **Token name**: `AlgoLedger Extension`.
3. Set **Expiration**: e.g., 90 days or custom date.
4. Under **Repository access**, select **Only select repositories** and pick your target problem-set repository (e.g. `your-username/DSA-ProblemSet`).
5. Under **Repository permissions**:
   - Find **Contents** and set it to **Read and write** (Metadata permissions are auto-selected).
6. Click **Generate token** and copy the generated token string.

#### Alternative: Classic Token (Simpler)

1. Navigate to [GitHub Developer Settings → Tokens (classic)](https://github.com/settings/tokens/new).
2. Set **Note**: `AlgoLedger Extension`.
3. Select scope: **`repo`** (Full control of private repositories).
4. Click **Generate token** and copy the string (`ghp_...`).

> **Security Note:** Treat your token like a password. Never share it publicly or commit it to a repository.

### 6. Configure AlgoLedger

1. Click the **AlgoLedger** icon in your browser toolbar or visit the onboarding tab.
2. Paste your GitHub Personal Access Token and click **Continue**.
3. Select your target repository and default branch (e.g. `main`).
4. Click **Connect** to confirm configuration.

### 7. Test the Setup

1. Open [LeetCode](https://leetcode.com/) and navigate to any problem.
2. Solve and submit a solution until you receive an **Accepted** verdict.
3. Check your target GitHub repository — AlgoLedger will commit the solution file, test runtime stats, and problem description.

---

## Troubleshooting

| Issue                               | Cause                           | Resolution                                                                                                                        |
| ----------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `vite: command not found`           | Dependencies not installed      | Run `pnpm install` in the project root before building.                                                                           |
| Extension fails to load             | Wrong folder chosen             | Select `apps/extension/dist`, **not** project root or `apps/extension`.                                                           |
| `HTTP 403: Resource not accessible` | Token lacks write permissions   | Ensure fine-grained token has **Contents: Read and write** on the selected repository, or classic token has `repo` scope checked. |
| Submissions not captured            | Platform URL / session mismatch | Reload the LeetCode tab and ensure the extension is active and pinned in toolbar.                                                 |

---

## Developer Guide

### Monorepo Architecture

AlgoLedger is built with Turborepo and pnpm workspaces:

```text
apps/
├── extension/    Manifest V3 browser extension (ingestion engine + UI)
└── web/          Next.js web application (landing site & docs)

packages/
├── adapters/     Platform adapter implementations (LeetCode, etc.)
├── generators/   Markdown, README, and catalog statistic generators
├── github/       GitHub REST & GraphQL API client
├── schemas/      Zod schemas and TypeScript data models
├── shared/       Shared constants, utilities, and helper types
└── ui/           Shared React component library
```

For detailed specifications, see [`buildPlan.md`](./buildPlan.md).

### Development Workflow

Start local live-reload development for the extension:

```bash
# Start extension dev server with live reload
pnpm --filter @algoledger/extension dev

# Or run dev across all workspaces
pnpm dev
```

Load the unpacked extension from `apps/extension/dist` as described in step 4. Changes will hot-reload.

### Common Commands

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Run all applications in development mode       |
| `pnpm build`      | Build all packages and applications            |
| `pnpm lint`       | Lint entire repository with ESLint             |
| `pnpm type-check` | Run TypeScript type checks across all packages |
| `pnpm test`       | Execute test suites with Vitest                |
| `pnpm format`     | Check and format files with Prettier           |

### Contributing Guidelines

1. **Fork & Branch**: Fork the repo, clone your fork, and create a feature branch (`git checkout -b feat/your-feature`).
2. **Follow Coding Standards**:
   - TypeScript strict mode throughout.
   - Run `pnpm lint` and `pnpm type-check` before submitting commits.
   - Keep functions focused and write unit tests for parser/adapter logic under `packages/`.
3. **Commit Messages**: Use Conventional Commits format (`feat: ...`, `fix: ...`, `docs: ...`).
4. **Pull Requests**: Open a PR against `main` on the upstream repository with a clear description of changes.
