import { describe, expect, test, vi } from 'vitest'
import type { GitHubClient, RepositoryFile } from '@algoledger/github'
import { fetchRepositoryState } from '../../src/utils/repository-state'

function createClientMock(files: Record<string, RepositoryFile | null>): GitHubClient {
  return {
    getFile: vi.fn(async (path: string) => files[path] ?? null),
  } as unknown as GitHubClient
}

describe('fetchRepositoryState', () => {
  test('falls back to empty defaults and null metadata when nothing exists yet', async () => {
    const client = createClientMock({})

    const state = await fetchRepositoryState(client, 'leetcode/0001-two-sum')

    expect(state.existingMetadata).toBeNull()
    expect(state.stats.totalSolved).toBe(0)
    expect(state.topicIndex).toEqual({})
    expect(state.languageIndex).toEqual({})
    expect(state.platformIndex).toEqual({})
    expect(state.problemIndex).toEqual([])
  })

  test('parses existing metadata for the given folder', async () => {
    const metadata = {
      platform: 'leetcode',
      problemId: '1',
      frontendId: '1',
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'Easy',
      topics: ['Array'],
      companyTags: [],
      language: 'python3',
      runtime: '0 ms',
      memory: '18 MB',
      submissionId: '123',
      acceptedAt: '2026-07-13T00:00:00.000Z',
      updatedAt: '2026-07-13T00:00:00.000Z',
      url: 'https://leetcode.com/problems/two-sum/',
      version: 1,
    }

    const client = createClientMock({
      'leetcode/0001-two-sum/metadata.json': {
        sha: 'sha-1',
        content: `${JSON.stringify(metadata)}\n`,
      },
    })

    const state = await fetchRepositoryState(client, 'leetcode/0001-two-sum')

    expect(state.existingMetadata).toEqual(metadata)
  })

  test('treats malformed metadata as absent rather than throwing', async () => {
    const client = createClientMock({
      'leetcode/0001-two-sum/metadata.json': { sha: 'sha-1', content: '{"not":"valid"}\n' },
    })

    const state = await fetchRepositoryState(client, 'leetcode/0001-two-sum')

    expect(state.existingMetadata).toBeNull()
  })

  test('parses stats, topic index, language index, platform index, and problem index together', async () => {
    const stats = {
      totalSolved: 1,
      byDifficulty: { Easy: 1, Medium: 0, Hard: 0 },
      currentStreak: 1,
      longestStreak: 1,
      lastSolvedDate: '2026-07-13',
      activityByDate: { '2026-07-13': 1 },
    }

    const problemIndex = [
      {
        folderId: 'leetcode/0001-two-sum',
        frontendId: '1',
        title: 'Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
        topics: ['Array'],
        language: 'python3',
        acceptedAt: '2026-07-13T00:00:00.000Z',
      },
    ]

    const client = createClientMock({
      '.internal/stats.json': { sha: 's1', content: `${JSON.stringify(stats)}\n` },
      '.internal/topic-index.json': {
        sha: 's2',
        content: `${JSON.stringify({ Array: ['leetcode/0001-two-sum'] })}\n`,
      },
      '.internal/language-index.json': {
        sha: 's3',
        content: `${JSON.stringify({ python3: ['leetcode/0001-two-sum'] })}\n`,
      },
      '.internal/platform-index.json': {
        sha: 's4',
        content: `${JSON.stringify({ leetcode: ['leetcode/0001-two-sum'] })}\n`,
      },
      '.internal/problem-index.json': {
        sha: 's5',
        content: `${JSON.stringify(problemIndex)}\n`,
      },
    })

    const state = await fetchRepositoryState(client, 'leetcode/0001-two-sum')

    expect(state.stats).toEqual(stats)
    expect(state.topicIndex).toEqual({ Array: ['leetcode/0001-two-sum'] })
    expect(state.languageIndex).toEqual({ python3: ['leetcode/0001-two-sum'] })
    expect(state.platformIndex).toEqual({ leetcode: ['leetcode/0001-two-sum'] })
    expect(state.problemIndex).toEqual(problemIndex)
  })
})
