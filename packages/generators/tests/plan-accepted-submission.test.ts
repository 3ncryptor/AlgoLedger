import { describe, expect, test } from 'vitest'
import { generateMetadata } from '../src/generate-metadata'
import { EMPTY_REPOSITORY_STATE, planAcceptedSubmission } from '../src/plan-accepted-submission'
import { acceptedSubmission, twoSumProblem } from './fixtures'

function jsonFile(files: { path: string; content: string }[], path: string): unknown {
  const file = files.find((candidate) => candidate.path === path)
  if (!file) throw new Error(`Expected commit plan to include ${path}`)
  return JSON.parse(file.content)
}

describe('planAcceptedSubmission', () => {
  test('produces a "solve" commit with README, metadata, solution, and all four stats/index files for a brand new problem', () => {
    const plan = planAcceptedSubmission(
      'leetcode',
      twoSumProblem,
      acceptedSubmission,
      EMPTY_REPOSITORY_STATE,
      '2026-07-13T10:00:00.000Z',
    )

    expect(plan.commitMessage).toBe('feat(leetcode): solve 0001-two-sum')
    expect(plan.deletePaths).toEqual([])

    expect(plan.commitFiles.map((file) => file.path)).toEqual([
      'leetcode/0001-two-sum/README.md',
      'leetcode/0001-two-sum/metadata.json',
      'leetcode/0001-two-sum/solution.py',
      '.internal/stats.json',
      '.internal/topic-index.json',
      '.internal/language-index.json',
      '.internal/platform-index.json',
    ])

    const stats = jsonFile(plan.commitFiles, '.internal/stats.json') as {
      totalSolved: number
      byDifficulty: { Easy: number }
    }
    expect(stats.totalSolved).toBe(1)
    expect(stats.byDifficulty.Easy).toBe(1)

    const topicIndex = jsonFile(plan.commitFiles, '.internal/topic-index.json') as Record<
      string,
      string[]
    >
    expect(topicIndex.Array).toEqual(['leetcode/0001-two-sum'])

    const languageIndex = jsonFile(plan.commitFiles, '.internal/language-index.json') as Record<
      string,
      string[]
    >
    expect(languageIndex.python3).toEqual(['leetcode/0001-two-sum'])
  })

  test('produces an "update" commit and does not double-count stats when the same problem is resubmitted', () => {
    const firstMetadata = generateMetadata(
      'leetcode',
      twoSumProblem,
      acceptedSubmission,
      null,
      '2026-07-13T10:00:00.000Z',
    )
    const stateAfterFirst = {
      existingMetadata: firstMetadata,
      stats: {
        totalSolved: 1,
        byDifficulty: { Easy: 1, Medium: 0, Hard: 0 },
        currentStreak: 1,
        longestStreak: 1,
        lastSolvedDate: '2026-07-13',
        activityByDate: { '2026-07-13': 1 },
      },
      topicIndex: { Array: ['leetcode/0001-two-sum'], 'Hash Table': ['leetcode/0001-two-sum'] },
      languageIndex: { python3: ['leetcode/0001-two-sum'] },
      platformIndex: { leetcode: ['leetcode/0001-two-sum'] },
    }

    const plan = planAcceptedSubmission(
      'leetcode',
      twoSumProblem,
      acceptedSubmission,
      stateAfterFirst,
      '2026-07-14T10:00:00.000Z',
    )

    expect(plan.commitMessage).toBe('feat(leetcode): update 0001-two-sum')
    expect(plan.deletePaths).toEqual([])

    const stats = jsonFile(plan.commitFiles, '.internal/stats.json') as {
      totalSolved: number
      currentStreak: number
    }
    expect(stats.totalSolved).toBe(1)
    expect(stats.currentStreak).toBe(2)

    const metadata = jsonFile(plan.commitFiles, 'leetcode/0001-two-sum/metadata.json') as {
      version: number
    }
    expect(metadata.version).toBe(2)
  })

  test('deletes the old solution file and moves the language index entry when the language changes', () => {
    const firstMetadata = generateMetadata(
      'leetcode',
      twoSumProblem,
      acceptedSubmission,
      null,
      '2026-07-13T10:00:00.000Z',
    )
    const stateAfterFirst = {
      existingMetadata: firstMetadata,
      stats: {
        totalSolved: 1,
        byDifficulty: { Easy: 1, Medium: 0, Hard: 0 },
        currentStreak: 1,
        longestStreak: 1,
        lastSolvedDate: '2026-07-13',
        activityByDate: { '2026-07-13': 1 },
      },
      topicIndex: { Array: ['leetcode/0001-two-sum'], 'Hash Table': ['leetcode/0001-two-sum'] },
      languageIndex: { python3: ['leetcode/0001-two-sum'] },
      platformIndex: { leetcode: ['leetcode/0001-two-sum'] },
    }

    const cppSubmission = {
      ...acceptedSubmission,
      language: 'cpp',
      typedCode: 'class Solution {};',
    }

    const plan = planAcceptedSubmission(
      'leetcode',
      twoSumProblem,
      cppSubmission,
      stateAfterFirst,
      '2026-07-14T10:00:00.000Z',
    )

    expect(plan.deletePaths).toEqual(['leetcode/0001-two-sum/solution.py'])
    expect(plan.commitFiles.map((file) => file.path)).toContain(
      'leetcode/0001-two-sum/solution.cpp',
    )

    const languageIndex = jsonFile(plan.commitFiles, '.internal/language-index.json') as Record<
      string,
      string[] | undefined
    >
    expect(languageIndex.python3).toBeUndefined()
    expect(languageIndex.cpp).toEqual(['leetcode/0001-two-sum'])
  })
})
