import type { Difficulty } from '@algoledger/shared'
import type { ProblemIndexEntry } from './stats/problem-index'

const RECENTLY_SOLVED_LIMIT = 15
const DIFFICULTY_ORDER: Difficulty[] = ['Easy', 'Medium', 'Hard']
const LEETCODE_PREFIX = 'leetcode/'

function folderPath(entry: ProblemIndexEntry): string {
  return entry.folderId.startsWith(LEETCODE_PREFIX)
    ? entry.folderId.slice(LEETCODE_PREFIX.length)
    : entry.folderId
}

function displayNumber(entry: ProblemIndexEntry): string {
  return entry.frontendId.padStart(4, '0')
}

function titleLink(entry: ProblemIndexEntry): string {
  return `[${entry.title}](${folderPath(entry)}/README.md)`
}

function byFrontendIdAscending(a: ProblemIndexEntry, b: ProblemIndexEntry): number {
  return Number(a.frontendId) - Number(b.frontendId)
}

function groupBy(entries: ProblemIndexEntry[], key: (entry: ProblemIndexEntry) => string[]) {
  const groups = new Map<string, ProblemIndexEntry[]>()
  for (const entry of entries) {
    for (const groupKey of key(entry)) {
      const existing = groups.get(groupKey) ?? []
      existing.push(entry)
      groups.set(groupKey, existing)
    }
  }
  return groups
}

function numberTitleDifficultyTable(entries: ProblemIndexEntry[]): string {
  const rows = entries
    .map((entry) => `| ${displayNumber(entry)} | ${titleLink(entry)} | ${entry.difficulty} |`)
    .join('\n')

  return `| # | Title | Difficulty |\n| --- | --- | --- |\n${rows}`
}

function byProblemNumberSection(entries: ProblemIndexEntry[]): string {
  const sorted = [...entries].sort(byFrontendIdAscending)
  const rows = sorted
    .map(
      (entry) =>
        `| ${displayNumber(entry)} | ${titleLink(entry)} | ${entry.difficulty} | ${entry.topics.join(', ')} |`,
    )
    .join('\n')

  return `## By Problem Number\n\n| # | Title | Difficulty | Topics |\n| --- | --- | --- | --- |\n${rows}`
}

function byDifficultySection(entries: ProblemIndexEntry[]): string {
  const subsections = DIFFICULTY_ORDER.map((difficulty) => {
    const matching = entries
      .filter((entry) => entry.difficulty === difficulty)
      .sort(byFrontendIdAscending)

    if (matching.length === 0) return `### ${difficulty} (0)\n\n_No problems solved yet._`

    const rows = matching
      .map(
        (entry) => `| ${displayNumber(entry)} | ${titleLink(entry)} | ${entry.topics.join(', ')} |`,
      )
      .join('\n')

    return `### ${difficulty} (${matching.length})\n\n| # | Title | Topics |\n| --- | --- | --- |\n${rows}`
  }).join('\n\n')

  return `## By Difficulty\n\n${subsections}`
}

function collapsibleGroupSections(
  heading: string,
  groups: Map<string, ProblemIndexEntry[]>,
): string {
  const sortedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b))

  const details = sortedKeys
    .map((key) => {
      const sorted = [...groups.get(key)!].sort(byFrontendIdAscending)
      return `<details>\n<summary>${key} (${sorted.length})</summary>\n\n${numberTitleDifficultyTable(sorted)}\n\n</details>`
    })
    .join('\n\n')

  return `## ${heading}\n\n${details}`
}

function recentlySolvedSection(entries: ProblemIndexEntry[]): string {
  const sorted = [...entries]
    .sort((a, b) => b.acceptedAt.localeCompare(a.acceptedAt))
    .slice(0, RECENTLY_SOLVED_LIMIT)

  const rows = sorted
    .map(
      (entry) =>
        `| ${displayNumber(entry)} | ${titleLink(entry)} | ${entry.difficulty} | ${entry.acceptedAt.slice(0, 10)} |`,
    )
    .join('\n')

  return `## Recently Solved\n\n| # | Title | Difficulty | Solved On |\n| --- | --- | --- | --- |\n${rows}`
}

export function generateLeetcodeIndexReadme(entries: ProblemIndexEntry[]): string {
  if (entries.length === 0) {
    return '# LeetCode Solutions\n\n_No problems solved yet._\n'
  }

  const totalSolved = entries.length
  const byDifficultyCount = DIFFICULTY_ORDER.map(
    (difficulty) =>
      `${entries.filter((entry) => entry.difficulty === difficulty).length} ${difficulty}`,
  ).join(' · ')

  const topicGroups = groupBy(entries, (entry) => entry.topics)
  const languageGroups = groupBy(entries, (entry) => [entry.language])

  return `# LeetCode Solutions

**${totalSolved}** problems solved — ${byDifficultyCount}

## Contents

- [By Problem Number](#by-problem-number)
- [By Difficulty](#by-difficulty)
- [By Topic](#by-topic)
- [By Language](#by-language)
- [Recently Solved](#recently-solved)

${byProblemNumberSection(entries)}

${byDifficultySection(entries)}

${collapsibleGroupSections('By Topic', topicGroups)}

${collapsibleGroupSections('By Language', languageGroups)}

${recentlySolvedSection(entries)}
`
}
