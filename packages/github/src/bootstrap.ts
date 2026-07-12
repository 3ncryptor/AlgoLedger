import type { CommitFile, GitHubClient } from './client'

const DEFAULT_ROOT_README = `# AlgoLedger

Your accepted submissions, automatically archived as a structured, version-controlled knowledge base.

See \`leetcode/\` for solved problems and \`.internal/\` for generated statistics.
`

const DEFAULT_LEETCODE_README = `# LeetCode

Solved problems are indexed here as they are accepted.
`

const INTERNAL_FILES = [
  '.internal/stats.json',
  '.internal/topic-index.json',
  '.internal/language-index.json',
  '.internal/platform-index.json',
  '.internal/cache.json',
] as const

export async function bootstrapRepository(client: GitHubClient): Promise<void> {
  const exists = await client.repositoryExists()
  if (!exists) {
    throw new Error(
      'Repository does not exist or is not accessible. Create it on GitHub first, then try again.',
    )
  }

  const candidates: CommitFile[] = [
    { path: 'README.md', content: DEFAULT_ROOT_README },
    { path: 'leetcode/README.md', content: DEFAULT_LEETCODE_README },
    ...INTERNAL_FILES.map((path) => ({ path, content: '{}\n' })),
  ]

  const checks = await Promise.all(
    candidates.map(async (candidate) => {
      const existing = await client.getFile(candidate.path)
      return existing ? null : candidate
    }),
  )
  const missing = checks.filter((candidate): candidate is CommitFile => candidate !== null)

  if (missing.length === 0) return

  await client.commitFiles(missing, 'chore: bootstrap repository structure')
}
