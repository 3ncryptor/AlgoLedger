import { describe, expect, test } from 'vitest'
import { getContributionGrid } from '../../src/utils/heatmap'

describe('getContributionGrid', () => {
  test('returns the requested number of full Sun-Sat week columns, oldest to newest', () => {
    const grid = getContributionGrid('2026-07-13', {}, 3)

    expect(grid.weeks).toHaveLength(3)
    grid.weeks.forEach((week) => expect(week).toHaveLength(7))

    expect(grid.weeks[0]![0]!.date).toBe('2026-06-28')
    expect(grid.weeks[0]![0]!.dayLabel).toBe('S')
    expect(grid.weeks[2]![6]!.date).toBe('2026-07-18')
    expect(grid.weeks[2]![6]!.dayLabel).toBe('S')
  })

  test('places today within the last week column', () => {
    const grid = getContributionGrid('2026-07-13', {}, 3)

    const lastWeek = grid.weeks[2]!
    const today = lastWeek.find((day) => day.date === '2026-07-13')

    expect(today?.dayLabel).toBe('M')
  })

  test('applies GitHub-style level buckets from the day count', () => {
    const grid = getContributionGrid(
      '2026-07-13',
      {
        '2026-07-05': 1,
        '2026-07-06': 2,
        '2026-07-07': 3,
        '2026-07-08': 5,
      },
      3,
    )

    const week1 = grid.weeks[1]!
    expect(week1[0]!.level).toBe(1)
    expect(week1[1]!.level).toBe(2)
    expect(week1[2]!.level).toBe(3)
    expect(week1[3]!.level).toBe(4)
    expect(week1[4]!.level).toBe(0)
  })

  test('emits a month label only on the week a new month begins', () => {
    const grid = getContributionGrid('2026-07-13', {}, 3)

    expect(grid.monthLabels).toEqual([
      { weekIndex: 0, label: 'Jun' },
      { weekIndex: 1, label: 'Jul' },
    ])
  })

  test('sums every cell count into totalCount', () => {
    const grid = getContributionGrid(
      '2026-07-13',
      { '2026-07-05': 1, '2026-07-06': 2, '2026-07-07': 3 },
      3,
    )

    expect(grid.totalCount).toBe(6)
  })

  test('counts the number of days with at least one solve as activeDays', () => {
    const grid = getContributionGrid(
      '2026-07-13',
      { '2026-07-05': 1, '2026-07-06': 2, '2026-07-07': 0 },
      3,
    )

    expect(grid.activeDays).toBe(2)
  })

  test('defaults to a 20-week window that fits the popup without scrolling', () => {
    const grid = getContributionGrid('2026-07-13', {})

    expect(grid.weeks).toHaveLength(20)
  })
})
