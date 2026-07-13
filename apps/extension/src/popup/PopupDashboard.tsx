import type { NameIndex } from '@algoledger/generators'
import { Card, CardContent, cn } from '@algoledger/ui'
import { CheckDraw } from '../components/CheckDraw'
import { Reveal } from '../components/Reveal'
import type { ContributionGrid } from '../utils/heatmap'
import { TopicRadarChart } from './TopicRadarChart'

interface RecentSync {
  folderId: string
  title: string
}

interface PopupDashboardProps {
  repoOwner: string
  repoName: string
  branch: string
  totalSolved: number
  byDifficulty: Record<'Easy' | 'Medium' | 'Hard', number>
  currentStreak: number
  longestStreak: number
  recentSyncs: RecentSync[]
  contributionGrid: ContributionGrid
  topicIndex: NameIndex
}

const CARD_SHADOW = 'shadow-[0_1px_3px_rgba(0,0,0,0.4)]'
const HEATMAP_LEVEL_CLASS = [
  'bg-heatmap-0',
  'bg-heatmap-1',
  'bg-heatmap-2',
  'bg-heatmap-3',
  'bg-heatmap-4',
]
const HEATMAP_CELL_SIZE = 18
const DAY_ROW_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx={12} cy={12} r={9} />
      <line x1={12} y1={11} x2={12} y2={16} />
      <circle cx={12} cy={8} r={0.5} fill="currentColor" stroke="none" />
    </svg>
  )
}

function DifficultyTile({
  label,
  value,
  dotClassName,
}: {
  label: string
  value: number
  dotClassName: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-2 py-1.5">
      <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
        <span className={cn('size-1.5 rounded-full', dotClassName)} />
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

function StreakTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-[0.65rem] text-muted-foreground">{label}</span>
    </div>
  )
}

export function PopupDashboard({
  repoOwner,
  repoName,
  branch,
  totalSolved,
  byDifficulty,
  currentStreak,
  longestStreak,
  recentSyncs,
  contributionGrid,
  topicIndex,
}: PopupDashboardProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Reveal delay={0}>
        <Card className={CARD_SHADOW}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold">{totalSolved}</span>
              <span className="text-sm text-muted-foreground">solved</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <DifficultyTile
                label="Easy"
                value={byDifficulty.Easy}
                dotClassName="bg-emerald-400"
              />
              <DifficultyTile
                label="Med."
                value={byDifficulty.Medium}
                dotClassName="bg-amber-400"
              />
              <DifficultyTile label="Hard" value={byDifficulty.Hard} dotClassName="bg-rose-400" />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
              <StreakTile label="Current Streak" value={currentStreak} />
              <StreakTile label="Longest Streak" value={longestStreak} />
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className={CARD_SHADOW}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">
                  <span className="font-semibold">{contributionGrid.totalCount}</span>{' '}
                  <span className="text-muted-foreground">submissions in the past year</span>
                </span>
                <span title="Counts accepted submissions per day" className="text-muted-foreground">
                  <InfoIcon className="size-3.5" />
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground">
                  <span>
                    <span className="font-semibold text-foreground">
                      {contributionGrid.activeDays}
                    </span>{' '}
                    active days
                  </span>
                  <span>
                    <span className="font-semibold text-foreground">{longestStreak}</span> max
                    streak
                  </span>
                </div>
                <button
                  type="button"
                  aria-pressed
                  className="rounded-full bg-foreground px-2.5 py-1 text-[0.65rem] font-medium text-background active:translate-y-px"
                >
                  LeetCode
                </button>
              </div>
            </div>

            <div className="flex gap-1">
              <div className="flex w-6 flex-col gap-1 pt-3">
                {DAY_ROW_LABELS.map((label, index) => (
                  <span
                    key={index}
                    className="flex h-3.5 items-center text-[0.55rem] text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div>
                <div
                  className="relative h-3 text-[0.55rem] text-muted-foreground"
                  style={{ width: contributionGrid.weeks.length * HEATMAP_CELL_SIZE }}
                >
                  {contributionGrid.monthLabels.map(({ weekIndex, label }) => (
                    <span
                      key={weekIndex}
                      className="absolute"
                      style={{ left: weekIndex * HEATMAP_CELL_SIZE }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  {contributionGrid.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day) => (
                        <div
                          key={day.date}
                          title={`${day.date}: ${day.count} solved`}
                          className={cn('size-3.5 rounded', HEATMAP_LEVEL_CLASS[day.level])}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Activity overview</span>
              <TopicRadarChart topicIndex={topicIndex} totalSolved={totalSolved} />
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {recentSyncs.length > 0 && (
        <Reveal delay={0.1}>
          <Card className={CARD_SHADOW}>
            <CardContent className="flex flex-col gap-1">
              <span className="mb-1 text-xs text-muted-foreground">Recent Syncs</span>
              {recentSyncs.map(({ folderId, title }) => (
                <button
                  key={folderId}
                  type="button"
                  onClick={() =>
                    chrome.tabs.create({
                      url: `https://github.com/${repoOwner}/${repoName}/tree/${branch}/${folderId}`,
                    })
                  }
                  className="flex items-center gap-1.5 rounded-md px-1 py-1 text-left text-sm transition-colors hover:bg-muted active:translate-y-px"
                >
                  <CheckDraw className="size-3.5 shrink-0 text-foreground" />
                  <span className="truncate">{title}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      )}
    </div>
  )
}
