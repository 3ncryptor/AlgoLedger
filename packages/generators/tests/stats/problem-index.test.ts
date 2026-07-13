import { describe, expect, test } from 'vitest'
import { upsertProblemIndexEntry, type ProblemIndexEntry } from '../../src/stats/problem-index'

const twoSumEntry: ProblemIndexEntry = {
  folderId: 'leetcode/0001-two-sum',
  frontendId: '1',
  title: 'Two Sum',
  slug: 'two-sum',
  difficulty: 'Easy',
  topics: ['Array', 'Hash Table'],
  language: 'python3',
  acceptedAt: '2026-07-13T10:00:00.000Z',
}

describe('upsertProblemIndexEntry', () => {
  test('appends a new entry when the folderId is not already present', () => {
    const result = upsertProblemIndexEntry([], twoSumEntry)

    expect(result).toEqual([twoSumEntry])
  })

  test('replaces the existing entry in place when the folderId already exists', () => {
    const updatedEntry: ProblemIndexEntry = {
      ...twoSumEntry,
      language: 'cpp',
      acceptedAt: '2026-07-14T10:00:00.000Z',
    }

    const result = upsertProblemIndexEntry([twoSumEntry], updatedEntry)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(updatedEntry)
  })

  test('leaves other entries untouched when upserting a different folderId', () => {
    const otherEntry: ProblemIndexEntry = {
      folderId: 'leetcode/0002-add-two-numbers',
      frontendId: '2',
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      difficulty: 'Medium',
      topics: ['Linked List', 'Math'],
      language: 'python3',
      acceptedAt: '2026-07-14T10:00:00.000Z',
    }

    const result = upsertProblemIndexEntry([twoSumEntry], otherEntry)

    expect(result).toEqual([twoSumEntry, otherEntry])
  })
})
