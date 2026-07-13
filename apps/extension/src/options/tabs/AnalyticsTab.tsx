import { useEffect, useState } from 'react'
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@algoledger/ui'
import { Reveal } from '../../components/Reveal'
import { getGitHubConfig } from '../../utils/config-storage'
import { createGitHubClientFromConfig } from '../../utils/github-client'
import { fetchRemoteStats, type RemoteStats } from '../../utils/stats-storage'

type LoadState =
  | { status: 'not-configured' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: RemoteStats }

const TOP_TOPICS_LIMIT = 5

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  )
}

export function AnalyticsTab() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const config = await getGitHubConfig()
      if (!config) {
        if (!cancelled) setState({ status: 'not-configured' })
        return
      }

      try {
        const client = createGitHubClientFromConfig(config)
        const data = await fetchRemoteStats(client)
        if (!cancelled) setState({ status: 'ready', data })
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          setState({ status: 'error', message })
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'not-configured') {
    return (
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Connect a GitHub repository in the GitHub tab to see your solving stats here.
            </CardDescription>
          </CardHeader>
        </Card>
      </Reveal>
    )
  }

  if (state.status === 'loading') {
    return (
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Loading your stats…</CardDescription>
          </CardHeader>
        </Card>
      </Reveal>
    )
  }

  if (state.status === 'error') {
    return (
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Could not load stats: {state.message}</CardDescription>
          </CardHeader>
        </Card>
      </Reveal>
    )
  }

  const { stats, topicIndex } = state.data

  if (stats.totalSolved === 0) {
    return (
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              No solves recorded yet. Solve a problem on LeetCode to see your stats here.
            </CardDescription>
          </CardHeader>
        </Card>
      </Reveal>
    )
  }

  const topTopics = Object.entries(topicIndex)
    .map(([topic, entries]) => ({ topic, count: entries.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_TOPICS_LIMIT)

  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Your solving activity across all synced problems.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatTile label="Total Solved" value={stats.totalSolved} />
            <StatTile label="Easy" value={stats.byDifficulty.Easy} />
            <StatTile label="Medium" value={stats.byDifficulty.Medium} />
            <StatTile label="Hard" value={stats.byDifficulty.Hard} />
            <StatTile label="Current Streak" value={stats.currentStreak} />
            <StatTile label="Longest Streak" value={stats.longestStreak} />
          </div>

          {topTopics.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Top Topics</span>
              <div className="flex flex-wrap gap-2">
                {topTopics.map(({ topic, count }) => (
                  <Badge key={topic} variant="secondary">
                    {topic} · {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Reveal>
  )
}
