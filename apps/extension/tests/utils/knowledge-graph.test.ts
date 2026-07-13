import { describe, expect, test } from 'vitest'
import { buildTopicBubbles } from '../../src/utils/knowledge-graph'

describe('buildTopicBubbles', () => {
  test('derives a topic and count pair from each index entry', () => {
    const bubbles = buildTopicBubbles({
      Array: ['0001-two-sum', '0015-3sum'],
      'Hash Table': ['0001-two-sum'],
    })

    expect(bubbles).toContainEqual({ topic: 'Array', count: 2 })
    expect(bubbles).toContainEqual({ topic: 'Hash Table', count: 1 })
  })

  test('sorts topics by descending count', () => {
    const bubbles = buildTopicBubbles({
      Greedy: ['0001'],
      Array: ['0001', '0002', '0003'],
      Sorting: ['0001', '0002'],
    })

    expect(bubbles.map((bubble) => bubble.topic)).toEqual(['Array', 'Sorting', 'Greedy'])
  })

  test('returns an empty array for an empty topic index', () => {
    expect(buildTopicBubbles({})).toEqual([])
  })
})
