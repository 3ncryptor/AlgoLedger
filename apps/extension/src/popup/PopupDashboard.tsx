import { Check } from 'lucide-react'
import { Button, Card, CardContent } from '@algoledger/ui'
import { CheckDraw } from '../components/CheckDraw'
import { Reveal } from '../components/Reveal'
import type { HeatmapDay } from '../utils/heatmap'

interface PopupDashboardProps {
  repoOwner: string
  repoName: string
  totalSolved: number
  currentStreak: number
  longestStreak: number
  recentSyncTitles: string[]
  heatmapDays: HeatmapDay[]
}

export function PopupDashboard({
  repoOwner,
  repoName,
  totalSolved,
  currentStreak,
  longestStreak,
  recentSyncTitles,
  heatmapDays,
}: PopupDashboardProps) {
  return (
    <Reveal className="flex flex-col gap-3">
      <Card>
        <CardContent className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Repo</span>
          <span className="text-sm font-medium">
            {repoOwner}/{repoName}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-primary">
            <CheckDraw className="size-3.5" />
            Connected
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold">{totalSolved}</span>
            <span className="text-[0.65rem] text-muted-foreground">Total Solved</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold">{currentStreak}🔥</span>
            <span className="text-[0.65rem] text-muted-foreground">Current Streak</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold">{longestStreak}</span>
            <span className="text-[0.65rem] text-muted-foreground">Longest Streak</span>
          </div>
        </CardContent>
      </Card>

      {recentSyncTitles.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Recent Syncs</span>
            {recentSyncTitles.map((title) => (
              <span key={title} className="flex items-center gap-1.5 text-sm">
                <Check className="size-3.5 text-primary" />
                {title}
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-1.5">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {heatmapDays.map((day) => (
              <span key={day.date} className="text-[0.6rem] text-muted-foreground">
                {day.dayLabel}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {heatmapDays.map((day) => (
              <div
                key={day.date}
                className={
                  day.active ? 'size-4 rounded-sm bg-primary' : 'size-4 rounded-sm bg-muted'
                }
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={() => chrome.runtime.openOptionsPage()}>
        Settings
      </Button>
    </Reveal>
  )
}
