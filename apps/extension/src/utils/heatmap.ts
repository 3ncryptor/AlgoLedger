const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAYS_PER_WEEK = 7
// Fixed to fit the popup's 480px width without horizontal scrolling: 416px of CardContent
// inner width, minus a 24px day-label column and a 4px gap, leaves 388px for the grid at an
// 18px cell pitch (14px cell + 4px gap) — 20 weeks (360px) fits with margin to spare.
const DEFAULT_WEEKS = 20

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

export interface HeatmapDay {
  date: string
  dayLabel: string
  count: number
  level: HeatmapLevel
}

export interface MonthLabel {
  weekIndex: number
  label: string
}

export interface ContributionGrid {
  weeks: HeatmapDay[][]
  monthLabels: MonthLabel[]
  totalCount: number
  activeDays: number
}

function getLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getContributionGrid(
  today: string,
  activityByDate: Record<string, number>,
  weeks: number = DEFAULT_WEEKS,
): ContributionGrid {
  const todayDate = new Date(`${today}T00:00:00.000Z`)
  const startOfCurrentWeek = new Date(todayDate)
  startOfCurrentWeek.setUTCDate(startOfCurrentWeek.getUTCDate() - startOfCurrentWeek.getUTCDay())

  const gridStart = new Date(startOfCurrentWeek)
  gridStart.setUTCDate(gridStart.getUTCDate() - (weeks - 1) * DAYS_PER_WEEK)

  const grid: HeatmapDay[][] = []
  const monthLabels: MonthLabel[] = []
  let lastMonth = -1
  let totalCount = 0
  let activeDays = 0

  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const week: HeatmapDay[] = []

    for (let dayOfWeek = 0; dayOfWeek < DAYS_PER_WEEK; dayOfWeek++) {
      const date = new Date(gridStart)
      date.setUTCDate(date.getUTCDate() + weekIndex * DAYS_PER_WEEK + dayOfWeek)
      const dateStr = toDateStr(date)
      const count = activityByDate[dateStr] ?? 0

      week.push({
        date: dateStr,
        dayLabel: DAY_LABELS[dayOfWeek]!,
        count,
        level: getLevel(count),
      })
      totalCount += count
      if (count > 0) activeDays += 1
    }

    const firstDayMonth = new Date(`${week[0]!.date}T00:00:00.000Z`).getUTCMonth()
    if (firstDayMonth !== lastMonth) {
      monthLabels.push({
        weekIndex,
        label: new Date(`${week[0]!.date}T00:00:00.000Z`).toLocaleDateString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        }),
      })
      lastMonth = firstDayMonth
    }

    grid.push(week)
  }

  return { weeks: grid, monthLabels, totalCount, activeDays }
}
