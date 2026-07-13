# AlgoLedger — Source of Truth Document

Version: 1.0
Status: Active Architecture Specification

---

# 1. Vision

AlgoLedger is a browser extension that automatically converts accepted submissions from competitive programming platforms into a structured, version-controlled GitHub knowledge repository.

The repository becomes the user's permanent algorithm archive.

The browser extension becomes an ingestion engine.

The website becomes the discovery, installation and documentation layer.

---

# 2. Problem Statement

Current solutions such as LeetHub solve:

```text
Accepted Submission
    ↓
Push Source File
```

This creates a code dump.

AlgoLedger solves:

```text
Accepted Submission
    ↓
Normalize Problem Data
    ↓
Generate Repository Artifacts
    ↓
Maintain Searchable Knowledge Database
```

---

# 3. Design Principles

## Principle 1

GitHub is the database.

No backend storage exists in V1.

---

## Principle 2

The repository is the source of truth.

The extension UI is a visualization layer.

---

## Principle 3

The extension performs ingestion.

The website performs communication.

---

## Principle 4

The platform is abstracted.

The repository format never changes regardless of whether the problem comes from:

* LeetCode
* Codeforces
* CodeChef
* HackerRank
* AtCoder

---

## Principle 5

One accepted submission equals one commit.

---

# 4. Non Goals

AlgoLedger is NOT:

* A LeetCode replacement.
* A NeetCode replacement.
* A Notion replacement.
* An interview preparation platform.
* An AI tutor.
* A contest tracker.
* A failed submission tracker.
* A productivity tracker.

---

# 5. Version 1 Scope

## Supported Platforms

* LeetCode

## Supported Event Types

* Accepted Submissions Only

## Authentication

* GitHub PAT

## Distribution

* GitHub Repository
* Developer Mode Installation

---

# 6. System Architecture

```text
┌──────────────────────┐
│     LeetCode         │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Injected Script      │
│ fetch interception   │
│ xhr interception     │
└─────────┬────────────┘
          │ postMessage
          ▼
┌──────────────────────┐
│ Content Script       │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Background Worker    │
│ Sync Engine          │
│ Retry Engine         │
│ GitHub Client        │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ GitHub Repository    │
└──────────────────────┘
```

---

# 7. Monorepo Structure

```text
algoledger/

apps/
│
├── extension/
│
└── web/

packages/
│
├── adapters/
├── generators/
├── github/
├── schemas/
├── shared/
└── ui/

docs/

turbo.json
pnpm-workspace.yaml
package.json
```

---

# 8. Extension Structure

```text
apps/extension/src/

background/
content/
injected/
popup/
options/
notifications/
types/
utils/
```

---

## background/

Responsibilities:

* Sync engine
* Queue engine
* Retry engine
* GitHub communication
* Statistics updates

---

## content/

Responsibilities:

* Receive messages from injected scripts
* Forward events to background worker

---

## injected/

Responsibilities:

* Patch fetch()
* Patch XMLHttpRequest()
* Capture submission requests
* Capture verdict requests
* Capture GraphQL metadata

---

## popup/

Responsibilities:

* Quick dashboard
* Streak display
* Recent syncs
* Repository status

---

## options/

Responsibilities:

* PAT setup
* Repository configuration
* Platform toggles
* Appearance settings

---

# 9. Network Interception Strategy

## Primary Strategy

Intercept:

```text
window.fetch
```

---

## Secondary Strategy

Intercept:

```text
XMLHttpRequest
```

---

## Fallback Strategy

DOM Scraping.

---

# 10. Submission Flow

```text
User clicks Submit
        ↓
POST /submit/
        ↓
Capture:
- typed_code
- language
- question_id
        ↓
Receive submission_id
        ↓
Poll check endpoint
        ↓
Accepted ?
   No → Stop
   Yes
        ↓
Fetch GraphQL Metadata
        ↓
Generate Files
        ↓
Commit to GitHub
```

---

# 11. GitHub Authentication

## Authentication Type

GitHub Personal Access Token.

---

## Storage

```text
chrome.storage.local
```

---

## Security Rules

PAT must NEVER enter:

* page context
* injected scripts
* postMessage payloads
* localStorage
* sessionStorage

PAT may ONLY exist inside:

* background workers
* extension storage

---

## Storage Security Model

`chrome.storage.local` is not encrypted at rest — it is a LevelDB file inside the Chrome profile directory. This protects the PAT from:

* other websites
* other browser extensions
* the network (only ever sent to `api.github.com` over HTTPS)

It does NOT protect the PAT from:

* malware or another process running under the same OS user account
* anyone with local DevTools access to the extension (Inspect popup/options)

Mitigation: use a fine-grained PAT scoped to a single repository with an expiration date (see section 22), so a worst-case leak is bounded to "write access to one repo for N days," not full account access.

---

# 12. GitHub API Strategy

## REST API

Used For:

* Create files
* Update files
* Delete files
* Commit files
* Bootstrap repositories

---

## GraphQL API

Used For:

* Analytics
* Heatmaps
* Statistics
* Repository reads

---

## Authentication

REST and GraphQL share the same PAT and the same request headers (`Authorization: Bearer <token>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version`). No separate credentials, OAuth App, or client secret are required — a PAT is a self-contained bearer credential, which is why V1 uses a PAT instead of a full GitHub OAuth App (an OAuth App would need a client secret and a backend token-exchange server, neither of which can live safely inside a browser extension).

---

# 13. Repository Structure

```text
algoledger/

README.md

leetcode/
│
├── README.md
│
├── 0001-two-sum/
│   ├── README.md
│   ├── metadata.json
│   └── solution.py
│
├── 0015-three-sum/
│   ├── README.md
│   ├── metadata.json
│   └── solution.py
│
└── ...

.internal/
│
├── stats.json
├── topic-index.json
├── language-index.json
├── platform-index.json
└── cache.json
```

---

# 14. Folder Naming Convention

Format:

```text
{frontend_id}-{slug}
```

Examples:

```text
0001-two-sum
0146-lru-cache
0200-number-of-islands
```

---

# 15. README.md Template

Each problem folder contains:

## Header

* Problem Title
* Difficulty Badge
* Topic Badges
* Company Badges
* Language Badge

---

## Metadata Section

Contains:

* Runtime
* Memory Usage
* Submission Date
* Platform

---

## Problem Statement

Raw problem description.

---

## Examples

All available examples.

---

## Constraints

All constraints.

---

## Solution

Embedded source code.

---

# 16. Metadata Schema

```json
{
  "platform": "leetcode",
  "problemId": "1",
  "frontendId": "1",
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "Easy",
  "topics": [],
  "companyTags": [],
  "language": "python3",
  "runtime": "0 ms",
  "memory": "18 MB",
  "submissionId": "123456789",
  "acceptedAt": "",
  "updatedAt": "",
  "url": "",
  "version": 1
}
```

---

# 17. Solution File Rules

Rules:

* Latest accepted solution only.
* Historical solutions are not stored.
* Language changes delete previous solution file.

Example:

```text
solution.py
```

may become:

```text
solution.cpp
```

Old file is deleted.

---

## Header Rules

Solution files contain:

```python
# Runtime: 0 ms
# Memory: 18 MB

class Solution:
    ...
```

---

# 18. Commit Strategy

One accepted submission equals one commit.

Example:

```text
feat(leetcode): solve 0001-two-sum
```

Example:

```text
feat(leetcode): update 0146-lru-cache
```

---

# 19. Retry Engine

## Phase 1

5 Immediate Retries.

---

## Phase 2

10 retries.

30 minute interval.

---

## Phase 3

10 retries.

2 hour interval.

---

## Failure State

Mark Sync Failed.

Generate notification.

---

## Implementation Notes

Each queued submission is a `QueueItem` (`background/queue.ts`) carrying `phase`, `attemptsInPhase`, and `status`, persisted in `chrome.storage.local` so retry state survives the background service worker being terminated between attempts. `background/retry-engine.ts`'s `decideNextRetry(phase, attemptsInPhase)` is a pure function implementing the phase table above; `background/sync-engine.ts` is the orchestrator that calls it after every failed commit attempt.

* Phase 1's 5 attempts run back-to-back within one execution (a short in-memory sleep between attempts, no `chrome.alarms` needed — they're expected to resolve in seconds).
* Phases 2 and 3 use `chrome.alarms` (one alarm per queue item, named `algoledger:retry:{itemId}`) specifically because MV3 service workers can be killed while idle — an alarm is what wakes the worker back up after 30 minutes / 2 hours to retry.
* All sync attempts (new submission, alarm fire, manual retry, startup resume) are serialized through a single promise chain, so at most one commit is ever in flight — concurrent commits to the same branch would race on the same base ref.
* If GitHub isn't configured yet (onboarding incomplete), an item stays `pending` and does not consume retry attempts.
* A "Sync Failed" notification's "Click to Retry" (section 26) resets the item to phase 1 / attempt 0 before retrying, giving a fresh full retry cycle rather than immediately re-failing on exhausted attempts.

---

# 20. Extension Permissions

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "alarms",
    "notifications"
  ],
  "host_permissions": [
    "https://leetcode.com/*",
    "https://api.github.com/*",
    "https://github.com/*"
  ]
}
```

---

# 21. Popup UI

Purpose:

Quick Status Only.

No configuration.

No onboarding.

No complex navigation.

---

## Popup Dashboard

```text
┌──────────────────────────────────────┐
│            AlgoLedger                │
│                                      │
│ Repo                                 │
│ aryanvibhuti/algoledger               │
│ ● Connected                          │
│                                      │
├──────────────────────────────────────┤
│ Total Solved             247         │
│ Current Streak             7 🔥      │
│ Longest Streak            19         │
│                                      │
├──────────────────────────────────────┤
│ Recent Syncs                         │
│                                      │
│ ✓ LRU Cache                          │
│ ✓ Number of Islands                  │
│ ✓ Two Sum                            │
│                                      │
├──────────────────────────────────────┤
│ M T W T F S S                        │
│ ■ ■ □ ■ □ ■ □                        │
│ ■ □ □ □ ■ ■ □                        │
│ □ □ ■ ■ □ □ □                        │
│ ■ ■ ■ □ □ □ □                        │
│                                      │
├──────────────────────────────────────┤
│ [ Dashboard ] [ Settings ]           │
└──────────────────────────────────────┘
```

---

# 22. First-Time Onboarding Flow

Purpose:

Guide a brand-new user from "no GitHub connection" to "repository connected" exactly once.

This is deliberately NOT part of the Popup (section 21 stays Quick Status Only — no configuration, no onboarding, no complex navigation).

## Trigger

* Opened automatically as a new browser tab on first install (`chrome.runtime.onInstalled`, reason `install`).
* If the Popup is opened before onboarding has ever completed, its disconnected state links here instead of jumping straight to Settings.

## Detection

First-time state = no GitHub config saved in `chrome.storage.local`. There is no separate "onboarding complete" flag — once a config is saved, this flow never appears automatically again. Disconnecting in Settings naturally surfaces it again on the next popup open.

## Step 1 — Connect GitHub

```text
┌──────────────────────────────────────┐
│ Welcome to AlgoLedger                │
│                                      │
│ Personal Access Token                │
│ [*********************]              │
│                                      │
│              [ Continue ]            │
└──────────────────────────────────────┘
```

The token is validated with a lightweight authenticated GraphQL call (`viewer { login }`) before advancing.

## Creating a Personal Access Token

AlgoLedger's `GitHubClient` only ever calls repository-content and git-data endpoints (read repo metadata, read/write files, read/write blobs/trees/commits/refs) plus two read-only GraphQL queries (`viewer.login`, `viewer.repositories`). No Issues, Actions, Packages, or admin scopes are ever used.

### Fine-grained token (recommended)

1. GitHub → profile photo → Settings → Developer settings (bottom of sidebar) → Personal access tokens → Fine-grained tokens → Generate new token.
2. Name: `AlgoLedger Extension`. Expiration: 90 days or a custom date (avoid "No expiration").
3. Resource owner: the account or org that owns the target repository.
4. Repository access: "Only select repositories" → the one repository AlgoLedger should commit to.
5. Repository permissions: Contents → Read and write. Metadata → Read-only (auto-selected). Everything else → No access.
6. Generate, copy the token immediately (shown once), paste it into the onboarding flow or Settings → GitHub tab.

### Classic token (simpler, broader scope)

1. Same path → Personal access tokens → Tokens (classic) → Generate new token (classic).
2. Name: `AlgoLedger Extension`. Expiration: 30/60/90 days.
3. Scopes: check only `repo`.
4. Generate, copy, paste into AlgoLedger.

Trade-off: classic tokens cannot be scoped to a single repository — checking `repo` grants read/write to every repository (public and private) the account can access. Fine-grained tokens trade a slightly longer setup for a much smaller blast radius if the token ever leaks.

## Step 2 — Choose Repository

```text
┌──────────────────────────────────────┐
│ Choose a Repository                  │
│                                      │
│ [ Search repositories... ]           │
│                                      │
│ ○ aryanvibhuti/algoledger            │
│ ○ aryanvibhuti/dsa-notes             │
│ ○ aryanvibhuti/interview-prep        │
│                                      │
│              [ Continue ]            │
└──────────────────────────────────────┘
```

Repositories the token can access are listed via the GitHub GraphQL API (`viewer.repositories`, cursor-paginated) — per section 12, repository reads are a GraphQL concern. V1 only lists existing repositories; it does not create new ones, matching the Repository Bootstrap contract (section 12), which throws if the repository does not exist rather than auto-creating it.

## Step 3 — Confirm & Connect

```text
┌──────────────────────────────────────┐
│ Confirm Connection                   │
│                                      │
│ Repository: aryanvibhuti/algoledger  │
│ Branch:     main                     │
│                                      │
│              [ Connect ]             │
└──────────────────────────────────────┘
```

"Connect" saves the PAT/owner/repo/branch to `chrome.storage.local` and runs Repository Bootstrap, then shows a success state before closing the onboarding tab.

## After Onboarding

Settings → GitHub tab (section 24) remains the only place to change the PAT or target repository afterward. Onboarding is not re-offered — Settings covers reconnecting or switching repositories.

---

# 23. Sync Screen

```text
┌──────────────────────────────────────┐
│ Syncing Submission                   │
│                                      │
│ Problem : Two Sum                    │
│ Platform: LeetCode                   │
│ Language: Python                     │
│                                      │
│ ██████████████░░░░░░░ 70%            │
│                                      │
│ Updating Repository...               │
│                                      │
└──────────────────────────────────────┘
```

---

## Implementation Notes

Popup is a separate document that opens and closes independently of the background service worker running the actual sync, so it can't hold sync progress in memory — it's bridged through `chrome.storage.local` (`utils/sync-progress.ts`, key `algoledger:current-sync`).

* `background/sync-engine.ts`'s `commitSubmission` reports three stages as it works: "Fetching repository state..." (25%), "Preparing commit..." (50%), "Updating Repository..." (75%). The state is cleared as soon as the attempt finishes, whether it succeeds or fails.
* `Popup.tsx` reads the current sync state on mount and also subscribes to `chrome.storage.onChanged`, so it switches to the Sync Screen live if a sync starts while the popup happens to already be open, and switches back to the Dashboard the moment it clears.
* Retry-waiting (phase 2/3) and failed states are NOT shown as the Sync Screen — those are surfaced via the Popup Dashboard (nothing actively happening) plus OS notifications (section 26), since the Sync Screen specifically represents "a commit is in flight right now."

---

# 24. Settings Screen

```text
┌─────────────────────────────────────────────┐
│ AlgoLedger Settings                         │
├───────────────┬─────────────────────────────┤
│ GitHub        │ PAT Token                   │
│ Platforms     │ [*********************]     │
│ Analytics     │                             │
│ Appearance    │ Repository Owner            │
│ About         │ [aryanvibhuti__________]    │
│               │                             │
│               │ Repository Name             │
│               │ [algoledger_____________]    │
│               │                             │
│               │ Branch                      │
│               │ [main__________________]    │
│               │                             │
│               │ [ Test Connection ]         │
│               │ [ Save Changes ]            │
└───────────────┴─────────────────────────────┘
```

---

# 25. Analytics Screen

```text
┌─────────────────────────────────────────────┐
│ Analytics                                   │
├─────────────────────────────────────────────┤
│ Total Solved             247                │
│ Easy                      92                │
│ Medium                   131                │
│ Hard                      24                │
│                                             │
│ Graphs                   41                 │
│ Trees                    35                 │
│ Arrays                   33                 │
│ DP                       28                 │
│                                             │
│ Current Streak            7                 │
│ Longest Streak           19                 │
└─────────────────────────────────────────────┘
```

---

# 26. Notification Screens

## Success

```text
✓ Successfully synced:
0001 Two Sum
```

---

## Retry

```text
GitHub unavailable.

Retry 3/5.

Next attempt in 30 seconds.
```

---

## Failure

```text
Sync Failed:
0146 LRU Cache

Click to Retry.
```

---

## Implementation Notes

Built in `notifications/index.ts` via `chrome.notifications.create`. Two deliberate deviations from the illustrative templates above:

* **No notification per phase-1 immediate retry.** The 5 immediate attempts are expected to resolve within seconds; notifying on every one would spam the user for what's usually a transient blip. A Retry notification only fires when escalating into phase 2 or phase 3 — i.e. when there's an actual multi-minute-or-longer wait worth surfacing.
* **Delay units are minutes/hours, not literal seconds** — "Next attempt in 30 minutes." / "Next attempt in 2 hours." — since the real intervals (section 19) are 30 minutes and 2 hours, not the illustrative 30 seconds shown above.

All three notification types share one notification id per queue item (`algoledger:sync:{itemId}`), so a later notification replaces an earlier one in place instead of stacking duplicates. Clicking a Retry or Failure notification calls `retryQueueItemNow(itemId)` (wired via `chrome.notifications.onClicked` in `background/index.ts`).

---

# 27. Website Scope

Website Exists Only For:

* Landing Page
* Installation Guide
* Roadmap

---

# 28. Landing Page Sections

* Hero Section
* Features
* Repository Preview
* Workflow Diagram
* Installation CTA
* Roadmap
* FAQ

---

# 29. Roadmap

## V1

* LeetCode Support
* GitHub Sync
* Analytics Dashboard
* Heatmap
* Landing Website

---

## V2

* Codeforces Support
* CodeChef Support
* HackerRank Support

---

## V3

* OAuth
* Public Distribution
* Chrome Store Release

---

## V4

* Backend Services
* Cloud Synchronization
* Team Features

---

# 30. Coding Standards

## Language

TypeScript Everywhere.

---

## Package Manager

pnpm.

---

## Monorepo

Turborepo.

---

## Formatting

Prettier.

---

## Linting

ESLint.

---

## Testing

Vitest.

---

## Naming Convention

camelCase for variables.

PascalCase for components.

kebab-case for folders.

---

# 31. Build Order

## Milestone 1

* Monorepo Setup
* Turborepo Setup
* NextJS Setup
* Extension Scaffold

---

## Milestone 2

* Network Interception
* Message Passing
* Event Pipeline

---

## Milestone 3

* GitHub Client
* PAT Storage
* Repository Bootstrap

---

## Milestone 4

* Markdown Generator
* Metadata Generator
* Statistics Engine

---

## Milestone 5

* Popup UI
* Settings UI
* Analytics UI
* First-Time Onboarding Flow

---

## Milestone 6

* Landing Website
* Installation Guide
* Roadmap

---

## Milestone 7

* Testing
* Internal Release
* University Release

---

# 32. Future Adapter Interface

```ts
interface PlatformAdapter {
    canHandle(url: string): boolean;

    captureSubmission(): Submission;

    fetchMetadata(): Problem;

    isAccepted(result: unknown): boolean;
}
```

---

# 33. Final Rule

If a feature request conflicts with this document:

This document wins until the architecture is intentionally updated.

```
```