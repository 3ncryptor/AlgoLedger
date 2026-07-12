import type { Metadata, Problem, Submission } from '@algoledger/schemas'
import type { Difficulty } from '@algoledger/shared'
import { badge } from './badges'
import { getLanguageInfo } from './language-info'

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: 'brightgreen',
  Medium: 'yellow',
  Hard: 'red',
}

export function generateReadme(
  problem: Problem,
  metadata: Metadata,
  submission: Submission,
): string {
  const difficultyBadge = badge(
    'Difficulty',
    metadata.difficulty,
    DIFFICULTY_COLOR[metadata.difficulty],
  )
  const topicBadges = problem.topics.map((topic) => badge('Topic', topic, 'blue')).join(' ')
  const companyBadges = problem.companyTags
    .map((tag) => badge('Company', tag, 'lightgrey'))
    .join(' ')
  const languageBadge = badge('Language', metadata.language, 'orange')
  const badgeLine = [difficultyBadge, topicBadges, companyBadges, languageBadge]
    .filter((segment) => segment.length > 0)
    .join(' ')

  const examplesSection = problem.examples.length
    ? problem.examples
        .map((example, index) => `**Example ${index + 1}:**\n\n\`\`\`\n${example}\n\`\`\``)
        .join('\n\n')
    : '_No examples provided._'

  const constraintsSection = problem.constraints.length
    ? problem.constraints.map((constraint) => `- ${constraint}`).join('\n')
    : '_No constraints provided._'

  const { extension } = getLanguageInfo(submission.language)

  return `# ${metadata.frontendId}. ${problem.title}

${badgeLine}

## Metadata

| Field | Value |
| --- | --- |
| Runtime | ${metadata.runtime} |
| Memory | ${metadata.memory} |
| Submission Date | ${metadata.acceptedAt} |
| Platform | ${metadata.platform} |

## Problem Statement

${problem.statement}

## Examples

${examplesSection}

## Constraints

${constraintsSection}

## Solution

\`\`\`${extension}
${submission.typedCode}
\`\`\`

[View on LeetCode](${problem.url})
`
}
