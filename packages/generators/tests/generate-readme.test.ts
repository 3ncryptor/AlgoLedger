import { describe, expect, test } from 'vitest'
import { generateMetadata } from '../src/generate-metadata'
import { generateReadme } from '../src/generate-readme'
import { acceptedSubmission, twoSumProblem } from './fixtures'

describe('generateReadme', () => {
  const metadata = generateMetadata(
    'leetcode',
    twoSumProblem,
    acceptedSubmission,
    null,
    '2026-07-13T10:00:00.000Z',
  )
  const readme = generateReadme(twoSumProblem, metadata, acceptedSubmission)

  test('includes the frontend id and title as the H1', () => {
    expect(readme).toContain('# 1. Two Sum')
  })

  test('includes a difficulty badge colored for Easy', () => {
    expect(readme).toContain('Difficulty-Easy-brightgreen')
  })

  test('includes a badge per topic', () => {
    expect(readme).toContain('Topic-Array-blue')
    expect(readme).toContain('Topic-Hash_Table-blue')
  })

  test('includes a language badge', () => {
    expect(readme).toContain('Language-python3-orange')
  })

  test('includes the metadata table with runtime, memory, date, and platform', () => {
    expect(readme).toContain('| Runtime | 0 ms |')
    expect(readme).toContain('| Memory | 18 MB |')
    expect(readme).toContain('| Platform | leetcode |')
  })

  test('includes the problem statement, examples, and constraints', () => {
    expect(readme).toContain(twoSumProblem.statement)
    expect(readme).toContain('**Example 1:**')
    expect(readme).toContain(twoSumProblem.examples[0])
    expect(readme).toContain(`- ${twoSumProblem.constraints[0]}`)
  })

  test('embeds the solution in a fenced code block with the correct language tag', () => {
    expect(readme).toContain('```py')
    expect(readme).toContain(acceptedSubmission.typedCode)
  })

  test('links back to the original LeetCode problem', () => {
    expect(readme).toContain(`[View on LeetCode](${twoSumProblem.url})`)
  })

  test('falls back gracefully when there are no examples or constraints', () => {
    const bareProblem = { ...twoSumProblem, examples: [], constraints: [] }
    const bareReadme = generateReadme(bareProblem, metadata, acceptedSubmission)

    expect(bareReadme).toContain('_No examples provided._')
    expect(bareReadme).toContain('_No constraints provided._')
  })
})
