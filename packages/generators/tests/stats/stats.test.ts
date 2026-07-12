import { describe, expect, test } from 'vitest'
import { EMPTY_STATS, updateStats } from '../../src/stats/stats'

describe('updateStats', () => {
  test('starts a streak of 1 on the first ever solve', () => {
    const stats = updateStats(EMPTY_STATS, 'Easy', '2026-07-13', true)

    expect(stats.currentStreak).toBe(1)
    expect(stats.longestStreak).toBe(1)
    expect(stats.totalSolved).toBe(1)
    expect(stats.byDifficulty.Easy).toBe(1)
    expect(stats.lastSolvedDate).toBe('2026-07-13')
  })

  test('does not increase the streak for a second solve on the same day', () => {
    const day1 = updateStats(EMPTY_STATS, 'Easy', '2026-07-13', true)
    const day1Again = updateStats(day1, 'Medium', '2026-07-13', true)

    expect(day1Again.currentStreak).toBe(1)
    expect(day1Again.totalSolved).toBe(2)
  })

  test('increments the streak for a solve on the very next day', () => {
    const day1 = updateStats(EMPTY_STATS, 'Easy', '2026-07-13', true)
    const day2 = updateStats(day1, 'Easy', '2026-07-14', true)

    expect(day2.currentStreak).toBe(2)
    expect(day2.longestStreak).toBe(2)
  })

  test('resets the streak to 1 after skipping a day', () => {
    const day1 = updateStats(EMPTY_STATS, 'Easy', '2026-07-13', true)
    const day3 = updateStats(day1, 'Easy', '2026-07-15', true)

    expect(day3.currentStreak).toBe(1)
    expect(day3.longestStreak).toBe(1)
  })

  test('keeps the longest streak even after the current streak resets', () => {
    const day1 = updateStats(EMPTY_STATS, 'Easy', '2026-07-13', true)
    const day2 = updateStats(day1, 'Easy', '2026-07-14', true)
    const day3 = updateStats(day2, 'Easy', '2026-07-15', true)
    const gapDay = updateStats(day3, 'Easy', '2026-07-20', true)

    expect(day3.currentStreak).toBe(3)
    expect(gapDay.currentStreak).toBe(1)
    expect(gapDay.longestStreak).toBe(3)
  })

  test('does not increment totalSolved or byDifficulty when updating an already-solved problem', () => {
    const day1 = updateStats(EMPTY_STATS, 'Easy', '2026-07-13', true)
    const resubmit = updateStats(day1, 'Easy', '2026-07-13', false)

    expect(resubmit.totalSolved).toBe(1)
    expect(resubmit.byDifficulty.Easy).toBe(1)
  })
})
