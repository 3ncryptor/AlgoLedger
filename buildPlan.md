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

# 22. Sync Screen

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

# 23. Settings Screen

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

# 24. Analytics Screen

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

# 25. Notification Screens

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

# 26. Website Scope

Website Exists Only For:

* Landing Page
* Installation Guide
* Roadmap

---

# 27. Landing Page Sections

* Hero Section
* Features
* Repository Preview
* Workflow Diagram
* Installation CTA
* Roadmap
* FAQ

---

# 28. Roadmap

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

# 29. Coding Standards

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

# 30. Build Order

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

# 31. Future Adapter Interface

```ts
interface PlatformAdapter {
    canHandle(url: string): boolean;

    captureSubmission(): Submission;

    fetchMetadata(): Problem;

    isAccepted(result: unknown): boolean;
}
```

---

# 32. Final Rule

If a feature request conflicts with this document:

This document wins until the architecture is intentionally updated.

```
```
