const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAYS_IN_WINDOW = 7

export interface HeatmapDay {
  date: string
  dayLabel: string
  active: boolean
}

export function getLastSevenDays(
  today: string,
  activityByDate: Record<string, number>,
): HeatmapDay[] {
  const base = new Date(`${today}T00:00:00.000Z`)
  const days: HeatmapDay[] = []

  for (let offset = DAYS_IN_WINDOW - 1; offset >= 0; offset--) {
    const date = new Date(base)
    date.setUTCDate(date.getUTCDate() - offset)
    const dateStr = date.toISOString().slice(0, 10)

    days.push({
      date: dateStr,
      dayLabel: DAY_LABELS[date.getUTCDay()]!,
      active: (activityByDate[dateStr] ?? 0) > 0,
    })
  }

  return days
}
