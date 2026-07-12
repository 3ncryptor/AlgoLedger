import { describe, expect, test } from 'vitest'
import {
  EMPTY_NAME_INDEX,
  addManyToIndex,
  addToIndex,
  removeFromIndex,
} from '../../src/stats/name-index'

describe('name-index', () => {
  test('addToIndex creates a new entry for a first-seen name', () => {
    const index = addToIndex(EMPTY_NAME_INDEX, 'Array', 'leetcode/0001-two-sum')

    expect(index).toEqual({ Array: ['leetcode/0001-two-sum'] })
  })

  test('addToIndex appends to an existing entry', () => {
    const index = addToIndex(
      { Array: ['leetcode/0001-two-sum'] },
      'Array',
      'leetcode/0015-three-sum',
    )

    expect(index.Array).toEqual(['leetcode/0001-two-sum', 'leetcode/0015-three-sum'])
  })

  test('addToIndex is idempotent for a duplicate entry', () => {
    const once = addToIndex(EMPTY_NAME_INDEX, 'Array', 'leetcode/0001-two-sum')
    const twice = addToIndex(once, 'Array', 'leetcode/0001-two-sum')

    expect(twice.Array).toEqual(['leetcode/0001-two-sum'])
  })

  test('addManyToIndex adds an entry under every provided name', () => {
    const index = addManyToIndex(EMPTY_NAME_INDEX, ['Array', 'Hash Table'], 'leetcode/0001-two-sum')

    expect(index).toEqual({
      Array: ['leetcode/0001-two-sum'],
      'Hash Table': ['leetcode/0001-two-sum'],
    })
  })

  test('removeFromIndex removes the entry and drops the key once empty', () => {
    const index = addToIndex(EMPTY_NAME_INDEX, 'python3', 'leetcode/0001-two-sum')
    const removed = removeFromIndex(index, 'python3', 'leetcode/0001-two-sum')

    expect(removed).toEqual({})
  })

  test('removeFromIndex keeps other entries under the same name', () => {
    const index = addToIndex(
      addToIndex(EMPTY_NAME_INDEX, 'python3', 'leetcode/0001-two-sum'),
      'python3',
      'leetcode/0015-three-sum',
    )
    const removed = removeFromIndex(index, 'python3', 'leetcode/0001-two-sum')

    expect(removed.python3).toEqual(['leetcode/0015-three-sum'])
  })

  test('removeFromIndex is a no-op for a name/entry that is not present', () => {
    const removed = removeFromIndex(EMPTY_NAME_INDEX, 'python3', 'leetcode/0001-two-sum')

    expect(removed).toEqual({})
  })
})
