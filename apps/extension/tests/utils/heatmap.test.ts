import { describe, expect, test } from 'vitest'
import { getLastSevenDays } from '../../src/utils/heatmap'

describe('getLastSevenDays', () => {
  test('returns exactly 7 days ending on today, in chronological order', () => {
    const days = getLastSevenDays('2026-07-13', {})

    expect(days).toHaveLength(7)
    expect(days[0]!.date).toBe('2026-07-07')
    expect(days[6]!.date).toBe('2026-07-13')
  })

  test('marks a day active when activityByDate has a count greater than zero', () => {
    const days = getLastSevenDays('2026-07-13', { '2026-07-13': 2, '2026-07-11': 1 })

    const today = days.find((day) => day.date === '2026-07-13')
    const dayEleven = days.find((day) => day.date === '2026-07-11')
    const dayTwelve = days.find((day) => day.date === '2026-07-12')

    expect(today?.active).toBe(true)
    expect(dayEleven?.active).toBe(true)
    expect(dayTwelve?.active).toBe(false)
  })

  test('assigns the correct day-of-week label for each date', () => {
    const days = getLastSevenDays('2026-07-13', {})
    const today = days.find((day) => day.date === '2026-07-13')

    expect(today?.dayLabel).toBe('M')
  })
})
