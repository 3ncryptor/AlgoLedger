import { describe, expect, test } from 'vitest'
import { folderIdToTitle } from '../../src/utils/folder-id'

describe('folderIdToTitle', () => {
  test('strips the platform prefix and numeric folder prefix', () => {
    expect(folderIdToTitle('leetcode/0001-two-sum')).toBe('Two Sum')
  })

  test('title-cases every word in the slug', () => {
    expect(folderIdToTitle('leetcode/0200-number-of-islands')).toBe('Number Of Islands')
  })

  test('handles a folder id with no numeric prefix', () => {
    expect(folderIdToTitle('leetcode/lru-cache')).toBe('Lru Cache')
  })
})
