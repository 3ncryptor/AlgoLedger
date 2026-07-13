import { describe, expect, test } from 'vitest'
import { buildTopicRadar } from '../../src/utils/topic-radar'

describe('buildTopicRadar', () => {
  test('returns no axes when fewer than 3 topics exist', () => {
    const result = buildTopicRadar({ Array: ['0001'], 'Hash Table': ['0001'] }, 1, 200)

    expect(result.axes).toEqual([])
  })

  test('returns no axes when totalSolved is zero', () => {
    const result = buildTopicRadar({ Array: ['0001'], Greedy: ['0002'], Sorting: ['0003'] }, 0, 200)

    expect(result.axes).toEqual([])
  })

  test('caps the number of axes at 6 and picks the highest-count topics', () => {
    const topicIndex = {
      A: ['1', '2', '3', '4', '5', '6', '7'],
      B: ['1', '2', '3', '4', '5', '6'],
      C: ['1', '2', '3', '4', '5'],
      D: ['1', '2', '3', '4'],
      E: ['1', '2', '3'],
      F: ['1', '2'],
      G: ['1'],
    }
    const result = buildTopicRadar(topicIndex, 10, 200)

    expect(result.axes).toHaveLength(6)
    expect(result.axes.map((axis) => axis.topic)).not.toContain('G')
  })

  test('computes percent from count over totalSolved and places the first axis at the top', () => {
    const result = buildTopicRadar({ Array: ['1', '2'], Greedy: ['1'], Sorting: ['1'] }, 4, 200)

    const arrayAxis = result.axes.find((axis) => axis.topic === 'Array')!
    expect(arrayAxis.percent).toBe(50)
    // First axis points straight up: x === center, y < center.
    expect(Math.round(arrayAxis.axisX)).toBe(result.center)
    expect(arrayAxis.axisY).toBeLessThan(result.center)
  })
})
