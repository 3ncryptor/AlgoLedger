import { useEffect, useState } from 'react'
import { Button, Toaster } from '@algoledger/ui'
import { getGitHubConfig } from '../utils/config-storage'
import { createGitHubClientFromConfig } from '../utils/github-client'
import { folderIdToTitle } from '../utils/folder-id'
import { getLastSevenDays } from '../utils/heatmap'
import { fetchRemoteStats } from '../utils/stats-storage'
import {
  SYNC_PROGRESS_STORAGE_KEY,
  getSyncProgress,
  type SyncProgressState,
} from '../utils/sync-progress'
import { PopupDashboard } from './PopupDashboard'
import { SyncScreen } from './SyncScreen'

const RECENT_SYNCS_LIMIT = 3

type PopupState =
  | { status: 'not-configured' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'syncing'; sync: SyncProgressState }
  | {
      status: 'ready'
      repoOwner: string
      repoName: string
      totalSolved: number
      currentStreak: number
      longestStreak: number
      recentSyncTitles: string[]
      heatmapDays: ReturnType<typeof getLastSevenDays>
    }

function capitalize(value: string): string {
  return value.length > 0 ? value[0]!.toUpperCase() + value.slice(1) : value
}

export function Popup() {
  const [state, setState] = useState<PopupState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const syncProgress = await getSyncProgress()
      if (syncProgress) {
        if (!cancelled) setState({ status: 'syncing', sync: syncProgress })
        return
      }

      const config = await getGitHubConfig()
      if (!config) {
        if (!cancelled) setState({ status: 'not-configured' })
        return
      }

      try {
        const client = createGitHubClientFromConfig(config)
        const { stats, platformIndex } = await fetchRemoteStats(client)

        const recentSyncTitles = (platformIndex.leetcode ?? [])
          .slice(-RECENT_SYNCS_LIMIT)
          .reverse()
          .map(folderIdToTitle)

        const today = new Date().toISOString().slice(0, 10)

        if (!cancelled) {
          setState({
            status: 'ready',
            repoOwner: config.repoOwner,
            repoName: config.repoName,
            totalSolved: stats.totalSolved,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            recentSyncTitles,
            heatmapDays: getLastSevenDays(today, stats.activityByDate),
          })
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          setState({ status: 'error', message })
        }
      }
    }

    load()

    function handleStorageChange(changes: Record<string, chrome.storage.StorageChange>) {
      if (!(SYNC_PROGRESS_STORAGE_KEY in changes)) return

      const newValue = changes[SYNC_PROGRESS_STORAGE_KEY]?.newValue as SyncProgressState | undefined

      if (newValue) {
        setState({ status: 'syncing', sync: newValue })
      } else if (!cancelled) {
        // The sync just finished (success or failure) — reload the dashboard.
        load()
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      cancelled = true
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  return (
    <main className="w-80 p-4 font-sans">
      <h1 className="mb-3 text-lg font-semibold">AlgoLedger</h1>

      {state.status === 'not-configured' && (
        <>
          <p className="text-sm text-muted-foreground">Repository not connected yet.</p>
          <Button
            className="mt-4 w-full"
            onClick={() =>
              chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/index.html') })
            }
          >
            Get Started
          </Button>
        </>
      )}

      {state.status === 'loading' && <p className="text-sm text-muted-foreground">Loading…</p>}

      {state.status === 'error' && (
        <p className="text-sm text-destructive">Could not load stats: {state.message}</p>
      )}

      {state.status === 'syncing' && (
        <SyncScreen
          problem={state.sync.problemTitle}
          platform={capitalize(state.sync.platform)}
          language={capitalize(state.sync.language)}
          progress={state.sync.progress}
          statusText={state.sync.stage}
        />
      )}

      {state.status === 'ready' && (
        <PopupDashboard
          repoOwner={state.repoOwner}
          repoName={state.repoName}
          totalSolved={state.totalSolved}
          currentStreak={state.currentStreak}
          longestStreak={state.longestStreak}
          recentSyncTitles={state.recentSyncTitles}
          heatmapDays={state.heatmapDays}
        />
      )}

      <Toaster />
    </main>
  )
}
