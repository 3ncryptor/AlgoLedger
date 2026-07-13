import type { Difficulty } from '@algoledger/shared'

export interface Stats {
  totalSolved: number
  byDifficulty: Record<Difficulty, number>
  currentStreak: number
  longestStreak: number
  lastSolvedDate: string | null
  activityByDate: Record<string, number>
}

export const EMPTY_STATS: Stats = {
  totalSolved: 0,
  byDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
  currentStreak: 0,
  longestStreak: 0,
  lastSolvedDate: null,
  activityByDate: {},
}

function daysBetween(fromDate: string, toDate: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / msPerDay)
}

export function updateStats(
  stats: Stats,
  difficulty: Difficulty,
  today: string,
  isNewProblem: boolean,
): Stats {
  let currentStreak: number
  if (stats.lastSolvedDate === null) {
    currentStreak = 1
  } else if (stats.lastSolvedDate === today) {
    currentStreak = stats.currentStreak
  } else if (daysBetween(stats.lastSolvedDate, today) === 1) {
    currentStreak = stats.currentStreak + 1
  } else {
    currentStreak = 1
  }

  return {
    totalSolved: stats.totalSolved + (isNewProblem ? 1 : 0),
    byDifficulty: {
      ...stats.byDifficulty,
      [difficulty]: stats.byDifficulty[difficulty] + (isNewProblem ? 1 : 0),
    },
    currentStreak,
    longestStreak: Math.max(stats.longestStreak, currentStreak),
    lastSolvedDate: today,
    activityByDate: {
      ...stats.activityByDate,
      [today]: (stats.activityByDate[today] ?? 0) + 1,
    },
  }
}
