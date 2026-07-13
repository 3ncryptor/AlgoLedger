import { describe, expect, test, vi } from 'vitest'
import type { GitHubClient, RepositoryFile } from '@algoledger/github'
import { fetchRemoteStats } from '../../src/utils/stats-storage'

function createClientMock(files: Record<string, RepositoryFile | null>): GitHubClient {
  return {
    getFile: vi.fn(async (path: string) => files[path] ?? null),
  } as unknown as GitHubClient
}

describe('fetchRemoteStats', () => {
  test('falls back to empty stats, topic index, and platform index when all files are missing', async () => {
    const client = createClientMock({})

    const result = await fetchRemoteStats(client)

    expect(result.stats.totalSolved).toBe(0)
    expect(result.stats.activityByDate).toEqual({})
    expect(result.topicIndex).toEqual({})
    expect(result.platformIndex).toEqual({})
  })

  test('falls back to empty defaults when a file holds the bootstrap placeholder content', async () => {
    const client = createClientMock({
      '.internal/stats.json': { sha: 'sha-1', content: '{}\n' },
      '.internal/topic-index.json': { sha: 'sha-2', content: '{}\n' },
      '.internal/platform-index.json': { sha: 'sha-3', content: '{}\n' },
    })

    const result = await fetchRemoteStats(client)

    expect(result.stats.totalSolved).toBe(0)
    expect(result.topicIndex).toEqual({})
    expect(result.platformIndex).toEqual({})
  })

  test('falls back to empty defaults when file content is not valid JSON', async () => {
    const client = createClientMock({
      '.internal/stats.json': { sha: 'sha-1', content: 'not json' },
    })

    const result = await fetchRemoteStats(client)

    expect(result.stats).toEqual({
      totalSolved: 0,
      byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
      currentStreak: 0,
      longestStreak: 0,
      lastSolvedDate: null,
      activityByDate: {},
    })
  })

  test('parses real stats, topic index, and platform index content', async () => {
    const stats = {
      totalSolved: 2,
      byDifficulty: { Easy: 2, Medium: 0, Hard: 0 },
      currentStreak: 2,
      longestStreak: 2,
      lastSolvedDate: '2026-07-14',
      activityByDate: { '2026-07-13': 1, '2026-07-14': 1 },
    }
    const topicIndex = { Array: ['leetcode/0001-two-sum'] }
    const platformIndex = { leetcode: ['leetcode/0001-two-sum', 'leetcode/0200-number-of-islands'] }

    const client = createClientMock({
      '.internal/stats.json': { sha: 'sha-1', content: `${JSON.stringify(stats)}\n` },
      '.internal/topic-index.json': { sha: 'sha-2', content: `${JSON.stringify(topicIndex)}\n` },
      '.internal/platform-index.json': {
        sha: 'sha-3',
        content: `${JSON.stringify(platformIndex)}\n`,
      },
    })

    const result = await fetchRemoteStats(client)

    expect(result.stats).toEqual(stats)
    expect(result.topicIndex).toEqual(topicIndex)
    expect(result.platformIndex).toEqual(platformIndex)
  })
})
